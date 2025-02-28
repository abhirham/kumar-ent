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
        <div class="flex flex-col gap-3 mb-5">
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
            <FloatLabel variant="in">
                <InputText
                    fluid
                    id="machineLoc"
                    v-model="machine.location"
                    variant="filled"
                />
                <label for="machineLoc">Location</label>
            </FloatLabel>
            <div
                class="flex gap-3 grow"
                v-for="(p, idx) in machine.products"
                :key="p.key"
            >
                <CustomAutoComplete
                    v-model="machine.products[idx].name"
                    fluid
                    variant="filled"
                    :items="productsInDB"
                />
                <Button
                    type="button"
                    icon="pi pi-trash"
                    severity="danger"
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

function initialValues() {
    return JSON.parse(
        JSON.stringify({
            id: "",
            location: "",
            products: [{ key: Date.now(), name: "" }],
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
        productsToAdd() {
            return this.machine.products.map((x) => x.name);
        },
        productsInDB() {
            return this.$store.state.machineModule.products;
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
        addProduct() {
            this.machine.products = [
                ...this.machine.products,
                { key: Date.now(), name: "" },
            ];
        },
        validate() {
            let arr = [];
            let { id, products, location } = this.machine;

            if (id.length === 0) arr.push("Enter a valid machine#.");
            if (location.length === 0) arr.push("Location cannot be empty.");
            if (products.filter((x) => !!x.name).length === 0)
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

            Promise.all([
                this.$store.dispatch("machineModule/createMachineToDB", {
                    ...this.machine,
                    products: this.productsToAdd,
                }),
                this.$store.dispatch(
                    "machineModule/addProductsToDB",
                    this.productsToAdd
                ),
            ])
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
                .dispatch("machineModule/updateMachineToDB", {
                    ...this.machine,
                    products: this.productsToAdd,
                })
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

                obj.products = obj.products.map((x, idx) => ({
                    key: idx,
                    name: x,
                }));

                this.machine = JSON.parse(JSON.stringify(obj));
            }
        },
    },
};
</script>
