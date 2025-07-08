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
        <div class="flex flex-col gap-3">
            <WithError v-slot="{ invalid }" :error="v$.user.uid">
                <FloatLabel variant="in">
                    <InputText
                        fluid
                        id="phone"
                        maxlength="10"
                        :invalid="invalid"
                        :useGrouping="false"
                        :disabled="editMode"
                        v-model="user.uid"
                        variant="filled"
                    />
                    <label for="phone">Phone #</label>
                </FloatLabel>
            </WithError>
            <WithError v-slot="{ invalid }" :error="v$.user.firstName">
                <FloatLabel variant="in">
                    <InputText
                        fluid
                        id="f_name"
                        :invalid="invalid"
                        v-model="user.firstName"
                        variant="filled"
                    />
                    <label for="f_name">First Name</label>
                </FloatLabel>
            </WithError>
            <WithError v-slot="{ invalid }" :error="v$.user.lastName">
                <FloatLabel variant="in">
                    <InputText
                        fluid
                        id="l_name"
                        :invalid="invalid"
                        v-model="user.lastName"
                        variant="filled"
                    />
                    <label for="l_name">Last Name</label>
                </FloatLabel>
            </WithError>
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
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import WithError from "@/components/WithError.vue";

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
    setup() {
        return { v$: useVuelidate() };
    },
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
    validations() {
        return {
            user: {
                uid: {
                    phone: helpers.withMessage(
                        "Invalid phone#",
                        (val) => val.length === 10
                    ),
                },
                firstName: { required },
                lastName: { required },
            },
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
        async addUser() {
            if (!(await this.v$.$validate())) return;

            this.loading = true;

            this.$store
                .dispatch("userModule/createUserToDB", this.user)
                .then((res) => {
                    this.dialog = false;
                    this.$emit("complete");
                })
                .finally(() => (this.loading = false));
        },
        async updateUser() {
            if (!(await this.v$.$validate())) return;

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
                this.v$.$reset();
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
