<template>
    <Dialog
        v-model:visible="dialog"
        modal
        header="Add Company"
        :style="{ width: '25rem' }"
    >
        <div class="flex flex-col gap-3 mb-5">
            <WithError v-slot="{ invalid }" :error="v$.company.name">
                <FloatLabel variant="in">
                    <InputText
                        fluid
                        id="companyName"
                        :disabled="editMode"
                        :invalid="invalid"
                        v-model="company.name"
                        variant="filled"
                    />
                    <label for="companyName">Name</label>
                </FloatLabel>
            </WithError>
            <template v-if="editMode">
                <span class="text-surface-500 dark:text-surface-400 block"
                    >Product Pricing</span
                >
                <div
                    class="flex gap-1"
                    v-for="(product, idx) in companyProducts"
                >
                    <div class="flex flex-col gap-1">
                        <FloatLabel class="flex flex-1" variant="in">
                            <CustomAutoComplete
                                v-model="companyProducts[idx]"
                                fluid
                                optionLabel="name"
                                :id="`product${idx}`"
                                variant="filled"
                                :items="productsInDB"
                                return-object
                                :showEmptyMessage="false"
                            />
                            <label :for="`product${idx}`">Product</label>
                        </FloatLabel>
                    </div>
                    <div v-if="product.rates" class="flex flex-col gap-1">
                        <FloatLabel class="flex flex-1" variant="in">
                            <InputNumber
                                v-model="product.rates[companyToEdit.id]"
                                fluid
                                :maxFractionDigits="2"
                                :id="`productRate${idx}`"
                                variant="filled"
                            />
                            <label :for="`productRate${idx}`">Rate</label>
                        </FloatLabel>
                    </div>
                </div>
                <Button
                    type="button"
                    icon="pi pi-plus"
                    severity="primary"
                    @click="companyProducts.push('')"
                ></Button>
            </template>
        </div>

        <div class="flex justify-end gap-2">
            <Button
                type="button"
                label="Cancel"
                severity="secondary"
                @click="dialog = false"
            ></Button>
            <Button
                v-if="editMode"
                type="button"
                label="Update"
                :loading="loading"
                @click="updateProducts"
            ></Button>
            <Button
                v-else
                type="button"
                label="Save"
                :loading="loading"
                @click="addCompany"
            ></Button>
        </div>
    </Dialog>
</template>

<script>
import CustomAutoComplete from "@/components/CustomAutoComplete.vue";
import WithError from "@/components/WithError.vue";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";

function initialValues() {
    return JSON.parse(
        JSON.stringify({
            name: "",
        })
    );
}

export default {
    setup() {
        return { v$: useVuelidate() };
    },
    components: { CustomAutoComplete },
    props: ["modelValue", "editMode", "companyToEdit"],
    computed: {
        dialog: {
            get() {
                return this.modelValue;
            },
            set(val) {
                this.$emit("update:modelValue", val);
            },
        },
        productsInDB() {
            return Object.values(
                JSON.parse(
                    JSON.stringify(this.$store.state.productModule.products)
                )
            );
        },
    },
    data() {
        return {
            company: initialValues(),
            loading: false,
            companyProducts: [],
        };
    },
    validations() {
        return {
            company: {
                name: { required },
            },
        };
    },
    methods: {
        async addCompany() {
            if (!(await this.v$.$validate())) return;

            this.loading = true;

            this.$store
                .dispatch("companyModule/createCompanyToDB", this.company)
                .then((res) => {
                    this.dialog = false;
                    this.$emit("complete");
                })
                .finally(() => (this.loading = false));
        },
        async updateProducts() {
            let filtered = this.companyProducts.filter((p) => {
                return (
                    this.$store.state.productModule.products[p.name].rates[
                        this.companyToEdit.id
                    ] !== p.rates[this.companyToEdit.id]
                );
            });

            if (filtered.length === 0) return;
            this.loading = true;

            let updatedObj = JSON.parse(
                JSON.stringify(this.$store.state.productModule.products)
            );

            filtered.forEach((x) => (updatedObj[x.name] = x));

            return this.$store
                .dispatch("productModule/updateProducts", updatedObj)
                .then((res) => {
                    this.dialog = false;
                    this.$emit("editComplete");
                })
                .finally(() => (this.loading = false));
        },
    },
    watch: {
        dialog(val) {
            if (!val) {
                this.company = initialValues();
                this.v$.$reset();
            }

            if (val && this.editMode) {
                let obj = this.company;

                Object.keys(obj).forEach(
                    (x) => (obj[x] = this.companyToEdit[x])
                );

                this.company = JSON.parse(JSON.stringify(obj));

                this.companyProducts = JSON.parse(
                    JSON.stringify(
                        Object.values(
                            this.$store.state.productModule.products
                        ).filter(
                            (x) => x.rates?.[this.companyToEdit.id] ?? false
                        )
                    )
                );
            }
        },
    },
};
</script>
