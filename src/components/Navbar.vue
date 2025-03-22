<template>
    <nav class="bg-gray-800">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="flex items-center h-16">
                <div class="shrink-0 text-white">Kumar ENT</div>
                <div class="hidden md:flex ml-10 flex-1 space-x-4">
                    <template v-for="nav in navItems" :key="nav.label">
                        <div class="flex-1" v-if="nav.spacer"></div>
                        <a
                            href="#"
                            @click="onNavClick(nav)"
                            :class="[
                                'rounded-md px-3 py-2 text-sm font-medium',
                                {
                                    'bg-gray-900  text-white':
                                        $route.name === nav.to,
                                    'text-gray-300 hover:bg-gray-700 hover:text-white':
                                        $route.name !== nav.to,
                                },
                            ]"
                            aria-current="page"
                            >{{ nav.label }}</a
                        >
                    </template>
                </div>
                <div class="flex-1 md:hidden"></div>
                <div class="md:hidden">
                    <button
                        @click="menuActive = !menuActive"
                        type="button"
                        class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
                    >
                        <i class="pi pi-align-justify"></i>
                    </button>
                </div>
            </div>
        </div>

        <div class="md:hidden" v-show="menuActive">
            <div class="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                <template v-for="nav in navItems">
                    <a
                        v-if="!nav.spacer"
                        :key="nav.label"
                        href="#"
                        @click="
                            onNavClick(nav);
                            menuActive = false;
                        "
                        :class="[
                            'block rounded-md px-3 py-2 text-base font-medium',
                            {
                                'bg-gray-900  text-white':
                                    $route.name === nav.to,
                                'text-gray-300 hover:bg-gray-700 hover:text-white':
                                    $route.name !== nav.to,
                            },
                        ]"
                        aria-current="page"
                        >{{ nav.label }}</a
                    >
                </template>
            </div>
        </div>
    </nav>
</template>

<script>
export default {
    data() {
        return {
            menuActive: false,
        };
    },
    computed: {
        user() {
            return this.$store.state.userModule.user;
        },
        navItems() {
            return [
                {
                    label: "Home",
                    to: "home",
                },
                {
                    label: "Admin",
                    to: "admin",
                    adminOnly: true,
                },
                { spacer: true },
                {
                    label: "Log out",
                    onClick: () => {
                        this.logout();
                    },
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
        onNavClick(nav) {
            nav.to ? this.$router.push({ name: nav.to }) : nav.onClick();
        },
    },
};
</script>
