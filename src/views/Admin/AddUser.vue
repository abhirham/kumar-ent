<template>
    <Dialog
        v-model:visible="dialog"
        modal
        header="Add User"
        :style="{ width: '25rem' }"
    >
        <span class="text-surface-500 dark:text-surface-400 block mb-4"
            >Enter user information.</span
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
                    id="phone"
                    :useGrouping="false"
                    :disabled="editMode"
                    v-model="user.uid"
                    variant="filled"
                />
                <label for="phone">Phone #</label>
            </FloatLabel>
            <FloatLabel variant="in">
                <InputText
                    fluid
                    id="f_name"
                    v-model="user.firstName"
                    variant="filled"
                />
                <label for="f_name">First Name</label>
            </FloatLabel>
            <FloatLabel variant="in">
                <InputText
                    fluid
                    id="l_name"
                    v-model="user.lastName"
                    variant="filled"
                />
                <label for="l_name">Last Name</label>
            </FloatLabel>
            <div class="flex items-center gap-2">
                <Checkbox inputId="ingredient1" binary v-model="user.isAdmin" />
                <label for="ingredient1"> Is Admin? </label>
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
                @click="updateUser"
            ></Button>
            <Button
                v-else
                type="button"
                label="Save"
                :loading="loading"
                @click="addUser"
            ></Button>
        </div>
    </Dialog>
</template>

<script>
function initialValues() {
    return JSON.parse(
        JSON.stringify({
            uid: "",
            firstName: "",
            lastName: "",
            isAdmin: false,
        })
    );
}

export default {
    props: ["modelValue", "editMode", "userToEdit"],
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
            user: initialValues(),
            errors: [],
            loading: false,
        };
    },
    methods: {
        validate() {
            let arr = [];
            let { uid, firstName, lastName } = this.user;

            if (uid.length !== 10) arr.push("Enter a valid phone#.");
            if (firstName.length === 0) arr.push("First Name cannot be empty.");
            if (lastName.length === 0) arr.push("Last Name cannot be empty.");

            this.errors = arr;

            setTimeout(() => {
                this.errors = [];
            }, 4000);

            return this.errors.length === 0;
        },
        addUser() {
            if (!this.validate()) return;

            this.loading = true;

            this.$store
                .dispatch("userModule/createUserToDB", this.user)
                .then((res) => {
                    this.dialog = false;
                    this.$emit("complete");
                })
                .finally(() => (this.loading = false));
        },
        updateUser() {
            if (!this.validate()) return;

            this.loading = true;

            this.$store
                .dispatch("userModule/updateUserToDB", this.user)
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
                this.user = initialValues();
            }

            if (val && this.editMode) {
                let obj = this.user;

                Object.keys(obj).forEach((x) => (obj[x] = this.userToEdit[x]));

                this.user = JSON.parse(JSON.stringify(obj));
            }
        },
    },
};
</script>
