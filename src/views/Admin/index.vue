<template>
    <div class="flex wrapper">
        <aside class="w-40 border-r-2 border-gray-700/20">
            <Listbox
                class="navList"
                v-model="active"
                :options="navs"
                optionLabel="label"
                optionValue="label"
                :style="{
                    '--p-listbox-border-color': 'transparent',
                    '--p-listbox-shadow': 'none',
                }"
            >
                <template #option="{ option }">
                    <div class="flex items-center">
                        <i :class="`${option.icon} mr-2`"> </i>
                        <div>{{ option.label }}</div>
                    </div>
                </template>
            </Listbox>
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
