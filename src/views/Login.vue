<template>
    <Card class="w-md mx-auto max-w-full">
        <template #subtitle>Login to continue</template>
        <template #content>
            <div class="flex flex-col gap-3">
                <FloatLabel variant="in">
                    <InputText
                        inputId="withoutgrouping"
                        v-model:modelValue="phone"
                        :useGrouping="false"
                        fluid
                    />
                    <label for="withoutgrouping">Phone #</label>
                </FloatLabel>
                <Button
                    fluid
                    :loading="fetchingUserLoader"
                    label="Continue"
                    v-if="!user"
                    @click="findUserName"
                />
                <template v-else>
                    <FloatLabel variant="in">
                        <Password
                            inputId="password"
                            v-model="password"
                            :feedback="false"
                            fluid
                        />
                        <label for="password">Password</label>
                    </FloatLabel>
                    <Button
                        fluid
                        label="Continue"
                        :loading="logInLoader"
                        @click="login"
                    />
                </template>
            </div>
        </template>
    </Card>
</template>

<script>
export default {
    data() {
        return {
            phone: "",
            password: "",
            user: null,
            fetchingUserLoader: false,
            logInLoader: false,
        };
    },
    methods: {
        findUserName() {
            this.fetchingUserLoader = true;
            this.$store
                .dispatch("userModule/fetchUserById", { uid: this.phone })
                .then((res) => {
                    this.user = res;
                })
                .finally((res) => (this.fetchingUserLoader = false));
        },
        login() {
            if (!this.user.passwordSet) {
                this.singUp();
                return;
            }

            this.logInLoader = true;
            this.$store
                .dispatch("authModule/signInWithEmailAndPassword", {
                    phone: this.phone,
                    password: this.password,
                })
                .finally((res) => (this.logInLoader = false));
        },
        singUp() {
            this.logInLoader = true;
            this.$store
                .dispatch("authModule/signupWithEmailAndPW", {
                    phone: this.phone,
                    password: this.password,
                })
                .finally((res) => (this.logInLoader = false));
        },
    },
};
</script>
