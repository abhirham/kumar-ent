<template>
    <Menubar :model="navItems">
        <template #start> Kumar ENT </template>
        <template #end>
            <div class="flex items-center gap-2">
                <Button
                    v-if="user.uid"
                    @click="logout"
                    label="Log out"
                ></Button>
            </div>
        </template>
    </Menubar>
</template>

<script>
export default {
    data() {
        return {};
    },
    computed: {
        user() {
            return this.$store.state.userModule.user;
        },
        navItems() {
            return [
                {
                    label: "Home",
                    command: () => {
                        this.$router.push({ name: "home" });
                    },
                },
                {
                    label: "Admin",
                    command: () => {
                        this.$router.push({ name: "admin" });
                    },
                    adminOnly: true,
                },
            ].filter(
                (x) => this.user.uid && (x.adminOnly ? this.user.isAdmin : true)
            );
        },
    },
    methods: {
        logout() {
            this.$store.dispatch("authModule/signout");
        },
    },
};
</script>
