<template>
    <div class="flex gap-5 wrapper">
        <aside class="w-40 border-r-2 border-gray-700/20">
            <Button
                label="Users"
                icon="pi pi-search"
                severity="contrast"
                variant="text"
            />
            <Button label="Machines" severity="secondary" variant="text" />
            <Button label="Products" severity="secondary" variant="text" />
        </aside>
        <h1>Dashboard</h1>
    </div>
</template>

<script>
export default {
    data() {
        return {
            navs: [
                // {label: }
            ],
        };
    },
};
</script>

<style lang="css" scoped>
.wrapper {
    height: calc(100vh - 110px);
}
</style>
