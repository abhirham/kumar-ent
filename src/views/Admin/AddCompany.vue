<template>
    <Dialog
        v-model:visible="dialog"
        modal
        header="Add Company"
        :style="{ width: '25rem' }"
    >
        <span class="text-surface-500 dark:text-surface-400 block mb-4"
            >Enter Company information.</span
        >
        <div class="flex flex-col gap-3 mb-5">
            <div class="flex flex-col gap-1">
                <FloatLabel variant="in">
                    <InputText
                        fluid
                        id="companyName"
                        :disabled="editMode"
                        :invalid="v$.company.name.$error"
                        v-model="company.name"
                        variant="filled"
                    />
                    <label for="companyName">Name</label>
                </FloatLabel>
                <Message
                    v-if="v$.company.name.$error"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ v$.company.name.$errors[0].$message }}</Message
                >
            </div>
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
                @click="updateCompany"
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
    },
    data() {
        return {
            company: initialValues(),
            loading: false,
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
        async updateCompany() {
            if (!(await this.v$.$validate())) return;

            this.loading = true;
            this.$store
                .dispatch("companyModule/updateCompanyToDB", this.company)
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
            }
        },
    },
};
</script>
