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
        <Message
            v-for="error in errors"
            severity="error"
            :key="error"
            icon="pi pi-times-circle"
            class="mb-2"
            >{{ error }}</Message
        >
        <div class="flex flex-col gap-3">
            <FloatLabel variant="in">
                <InputText
                    fluid
                    id="machineid"
                    :useGrouping="false"
                    :disabled="editMode"
                    v-model="machine.id"
                    variant="filled"
                />
                <label for="machineid">Machine #</label>
            </FloatLabel>
            <CustomAutoComplete
                v-for="(_, idx) in machine.products"
                v-model="machine.products[idx]"
                dropdown
                fluid
                variant="filled"
            />
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

function initialValues() {
    return JSON.parse(
        JSON.stringify({
            id: "",
            products: [""],
        })
    );
}

export default {
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
    },
    data() {
        return {
            machine: initialValues(),
            errors: [],
            loading: false,
        };
    },
    methods: {
        validate() {
            let arr = [];
            let { id, products } = this.machine;

            if (id.length === 0) arr.push("Enter a valid machine#.");
            if (products.filter((x) => !!x).length === 0)
                arr.push("Products cannot be empty.");

            this.errors = arr;

            setTimeout(() => {
                this.errors = [];
            }, 4000);

            return this.errors.length === 0;
        },
        addMachine() {
            if (!this.validate()) return;

            this.loading = true;

            this.$store
                .dispatch("machineModule/createMachineToDB", this.machine)
                .then((res) => {
                    this.dialog = false;
                    this.$emit("complete");
                })
                .finally(() => (this.loading = false));
        },
        updateMachine() {
            if (!this.validate()) return;

            this.loading = true;

            this.$store
                .dispatch("machineModule/updateMachineToDB", this.machine)
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
            }

            if (val && this.editMode) {
                let obj = this.machine;

                Object.keys(obj).forEach(
                    (x) => (obj[x] = this.machineToEdit[x])
                );

                this.machine = JSON.parse(JSON.stringify(obj));
            }
        },
    },
};
</script>
