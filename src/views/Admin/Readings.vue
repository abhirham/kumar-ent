<template>
    <DataTable
        :value="readings"
        :loading="loading"
        tableStyle="min-width: 50rem"
    >
        <Column
            v-for="col of columns"
            :key="col.field"
            :field="col.field"
            :header="col.header"
        ></Column>
        <template #empty> No machines found. </template>
    </DataTable>
</template>

<script>
export default {
    data() {
        return {
            loading: false,
            readings: [],
        };
    },
    computed: {
        columns() {
            return [
                { field: "machineId", header: "Machine #" },
                { field: "createdBy", header: "User" },
            ].concat(
                this.$store.state.machineModule.products.map((x) => ({
                    field: x.replace(/ /g, "-"),
                    header: x,
                }))
            );
        },
    },
    mounted() {
        this.loading = true;

        this.$store
            .dispatch("machineModule/fetchReadings")
            .then((res) => {
                this.readings = res.map((x) => {
                    Object.keys(x.readings).forEach((y) => {
                        x[y.replace(/ /g, "-")] = x.readings[y];
                    });

                    return x;
                });
            })
            .finally(() => (this.loading = false));
    },
};
</script>
