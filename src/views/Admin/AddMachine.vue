<template>
    <Dialog
        v-model:visible="dialog"
        modal
        header="Add Machine"
        :style="{ width: '25rem' }"
    >
        <span class="text-surface-500 dark:text-surface-400 block mb-4"
            >Enter machine information.</span
        >
        <div class="flex flex-col gap-3 mb-5">
            <div class="flex flex-col gap-1">
                <FloatLabel variant="in">
                    <CustomAutoComplete
                        v-model="machine.masterLocationId"
                        inputId="in_label"
                        dropdown
                        optionLabel="name"
                        optionValue="id"
                        forceSelection
                        :items="companies"
                        fluid
                        variant="filled"
                    />
                    <label for="in_label">Company</label>
                </FloatLabel>
                <Message
                    v-if="v$.machine.masterLocationId.$error"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{
                        v$.machine.masterLocationId.$errors[0].$message
                    }}</Message
                >
            </div>
            <div class="flex flex-col gap-1">
                <FloatLabel variant="in">
                    <InputText
                        fluid
                        id="machineid"
                        :useGrouping="false"
                        :disabled="editMode"
                        :invalid="v$.machine.id.$error"
                        v-model="machine.id"
                        variant="filled"
                    />
                    <label for="machineid">Machine #</label>
                </FloatLabel>
                <Message
                    v-if="v$.machine.id.$error"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ v$.machine.id.$errors[0].$message }}</Message
                >
            </div>
            <div class="flex flex-col gap-1">
                <FloatLabel variant="in">
                    <InputText
                        fluid
                        id="machineLoc"
                        :invalid="v$.machine.location.$error"
                        v-model="machine.location"
                        variant="filled"
                    />
                    <label for="machineLoc">Location</label>
                </FloatLabel>
                <Message
                    v-if="v$.machine.location.$error"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ v$.machine.location.$errors[0].$message }}</Message
                >
            </div>
            <div
                class="flex gap-3 grow"
                v-for="(p, idx) in machine.products"
                :key="p.key"
            >
                <div class="flex flex-col gap-1">
                    <FloatLabel class="flex flex-1" variant="in">
                        <CustomAutoComplete
                            v-model="machine.products[idx].name"
                            fluid
                            optionLabel="name"
                            :id="`product${idx}`"
                            variant="filled"
                            :invalid="
                                v$.machine.products.$each.$response.$errors[idx]
                                    .name.length > 0
                            "
                            :items="productsInDB"
                            :showEmptyMessage="false"
                            @item-select="(e) => onProductSelect(e.value, idx)"
                        />
                        <label :for="`product${idx}`">Product Name</label>
                    </FloatLabel>
                    <Message
                        v-for="error in v$.machine.products.$each.$response
                            .$errors[idx].name"
                        severity="error"
                        size="small"
                        variant="simple"
                        >{{ error.$message }}</Message
                    >
                </div>
                <FloatLabel variant="in" v-if="false">
                    <Select
                        v-model="machine.products[idx].type"
                        :options="types"
                        id="productType"
                    />
                    <label for="productType">Product Type</label>
                </FloatLabel>

                <Button
                    type="button"
                    icon="pi pi-trash"
                    severity="danger"
                    v-show="machine.products.length > 1"
                    @click="
                        machine.products = machine.products.filter(
                            (x) => x.key !== p.key
                        )
                    "
                    variant="text"
                />
            </div>
            <Button
                type="button"
                icon="pi pi-plus"
                severity="primary"
                @click="addProduct"
            ></Button>
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
                @click="updateMachine"
            ></Button>
            <Button
                v-else
                type="button"
                label="Save"
                :loading="loading"
                @click="addMachine"
            ></Button>
        </div>
    </Dialog>
</template>

<script>
import CustomAutoComplete from "@/components/CustomAutoComplete.vue";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";

function initialValues() {
    return JSON.parse(
        JSON.stringify({
            id: "",
            location: "",
            masterLocationId: "",
            products: [
                {
                    key: Date.now(),
                    name: "",
                    type: "Readings",
                },
            ],
        })
    );
}

export default {
    setup() {
        return { v$: useVuelidate() };
    },
    components: { CustomAutoComplete },
    props: ["modelValue", "editMode", "machineToEdit"],
    computed: {
        dialog: {
            get() {
                return this.modelValue;
            },
            set(val) {
                this.$emit("update:modelValue", val);
            },
        },
        productsObj() {
            let updatedProducts = JSON.parse(
                JSON.stringify(this.$store.state.productModule.products)
            );
            let productsToAdd = [];

            this.machine.products.forEach(({ name, type }, idx) => {
                name = name.trim().toUpperCase();
                let obj = { name, type };
                updatedProducts[name] = updatedProducts[name] ?? obj;
                productsToAdd.push(obj);
            });

            return { updatedProducts, productsToAdd };
        },
        productsInDB() {
            return Object.values(this.$store.state.productModule.products);
        },
        companies() {
            return Object.values(this.$store.state.companyModule.companies);
        },
    },
    data() {
        return {
            machine: initialValues(),
            errors: [],
            types: ["Stocks", "Readings"],
            loading: false,
        };
    },
    validations() {
        return {
            machine: {
                location: { required },
                masterLocationId: { required },
                id: {
                    required,
                    isUnique: helpers.withMessage(
                        "Machine already exists.",
                        (val) =>
                            this.editMode
                                ? true
                                : !this.$store.state.machineModule.machines.some(
                                      (x) => x.id === val
                                  )
                    ),
                },
                products: {
                    $each: helpers.forEach({
                        name: { required },
                    }),
                },
            },
        };
    },
    methods: {
        onProductSelect(val, idx) {
            this.machine.products[idx].type = val.type;
        },
        addProduct() {
            this.machine.products = [
                ...this.machine.products,
                { key: Date.now(), name: "", type: "Readings" },
            ];
        },
        async addMachine() {
            if (!(await this.v$.$validate())) return;

            this.loading = true;

            Promise.all([
                this.$store.dispatch("machineModule/createMachineToDB", {
                    ...this.machine,
                    products: this.productsObj.productsToAdd,
                }),
                this.$store.dispatch(
                    "productModule/updateProducts",
                    this.productsObj.updatedProducts
                ),
            ])
                .then((res) => {
                    this.dialog = false;
                    this.$emit("complete");
                })
                .finally(() => (this.loading = false));
        },
        async updateMachine() {
            if (!(await this.v$.$validate())) return;

            this.loading = true;
            Promise.all([
                this.$store.dispatch("machineModule/updateMachineToDB", {
                    ...this.machine,
                    products: this.productsObj.productsToAdd,
                }),
                this.$store.dispatch(
                    "productModule/updateProducts",
                    this.productsObj.updatedProducts
                ),
            ])
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
                this.machine = initialValues();
                this.v$.$reset();
            }

            if (val && this.editMode) {
                let obj = this.machine;

                Object.keys(obj).forEach(
                    (x) => (obj[x] = this.machineToEdit[x])
                );

                obj.products = obj.products.map((x, idx) => ({
                    key: idx,
                    ...x,
                }));

                this.machine = JSON.parse(JSON.stringify(obj));
            }
        },
    },
};
</script>
