<template>
    <Menubar>
        <template #start> Kumar ENT </template>

        <template #end>
            <div class="flex items-center gap-2">
                <Button @click="logout" label="Log out"></Button>
            </div>
        </template>
    </Menubar>
</template>

<script>
export default {
    data() {
        return {};
    },
    methods: {
        logout() {
            this.$store.dispatch("authModule/signout");
        },
    },
};
</script>
