<template>
    <div class="flex gap-5 wrapper">
        <aside class="w-40 border-r-2 border-gray-700/20">
            <Button
                v-for="nav in navs"
                :key="nav.label"
                :label="nav.label"
                :icon="`pi ${nav.icon}`"
                :severity="nav.label === active ? 'contrast' : 'secondary'"
                @click="active = nav.label"
                variant="text"
                class="justify-start"
                :size="nav.label === active ? 'normal' : 'small'"
                fluid
            />
        </aside>
        <Users v-if="active === 'Users'" />
        <Machines v-if="active === 'Machines'" />
        <Readings v-if="active === 'Readings'" />
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
                    icon: "pi-users",
                },
                {
                    label: "Machines",
                    icon: "pi-shop",
                },
                {
                    label: "Readings",
                    icon: "pi-warehouse",
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
