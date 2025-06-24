<template>
    <div class="flex wrapper">
        <aside class="w-40 border-r-2 border-gray-700/20">
            <ul class="p-listbox-list">
                <li
                    @click="active = option.label"
                    v-for="option in navs"
                    :class="[
                        'px-5 py-2 cursor-pointer hover:bg-blue-100 rounded-sm mb-1',
                        {
                            'bg-blue-950 hover:bg-blue-950 text-white':
                                option.label === active,
                        },
                    ]"
                >
                    <div class="flex items-center">
                        <i :class="`${option.icon} mr-2`"> </i>
                        <div>{{ option.label }}</div>
                    </div>
                </li>
            </ul>
        </aside>
        <div class="max-w-full px-5">
            <Users v-if="active === 'Users'" />
            <Machines v-if="active === 'Machines'" />
            <Readings v-if="active === 'Readings'" />
        </div>
    </div>
</template>

<script>
import Users from "@/views/Admin/Users.vue";
import Machines from "./Machines.vue";
import Readings from "./Readings.vue";

export default {
    components: { Users, Machines, Readings },
    data() {
        return {
            active: "Users",
            navs: [
                {
                    label: "Users",
                    icon: "pi pi-users",
                },
                {
                    label: "Machines",
                    icon: "pi pi-shop",
                },
                {
                    label: "Readings",
                    icon: "pi pi-warehouse",
                },
            ],
        };
    },
    methods: {
        handleChange(event) {
            if (event.value == null) {
                return;
            }

            this.active = event.value;
        },
    },
    mounted() {
        this.$store.dispatch("machineModule/fetchProducts");
    },
};
</script>

<style lang="css" scoped>
.wrapper {
    height: calc(100vh - 110px);
}
</style>
