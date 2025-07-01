<template>
    <div class="flex flex-col">
        <Button
            class="self-end mb-5"
            @click="showAddMachine = true"
            label="Add Machine"
        ></Button>
        <DataTable
            scrollable
            scrollHeight="80vh"
            :value="machines"
            :loading="loading"
            tableStyle="min-width: 50rem"
            v-model:filters="filters"
            :globalFilterFields="['id', 'location']"
        >
            <template #header>
                <div class="flex justify-end">
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText
                            v-model="filters.global.value"
                            placeholder="Search"
                        />
                        <InputIcon
                            class="cursor-pointer"
                            v-if="filters.global.value.length > 0"
                            @click="() => (filters.global.value = '')"
                        >
                            <i class="pi pi-times" />
                        </InputIcon>
                    </IconField>
                </div>
            </template>
            <Column
                v-for="col of columns"
                :key="col.field"
                :field="col.field"
                :header="col.header"
            >
                <template v-if="col.field === 'products'" #body="{ data }">
                    <span>{{
                        data.products.map((x) => x.name).join(", ")
                    }}</span>
                </template>
                <template v-if="col.field === 'actions'" #body="{ data }">
                    <Button
                        icon="pi pi-user-edit"
                        variant="text"
                        rounded
                        @click="onEdit(data)"
                        aria-label="Filter"
                    />
                </template>
            </Column>
            <template #empty> No machines found. </template>
        </DataTable>
    </div>
    <AddMachine v-model="showAddMachine" @complete="getMachines" />
    <AddMachine
        v-model="showEditMachine"
        :editMode="true"
        :machineToEdit="machineToEdit"
        @editComplete="onEditComplete"
    />
</template>

<script>
import AddMachine from "./AddMachine.vue";
import { FilterMatchMode } from "@primevue/core/api";

export default {
    components: { AddMachine },
    data() {
        return {
            showAddMachine: false,
            showEditMachine: false,
            machineToEdit: null,
            columns: [
                { field: "id", header: "Machine #" },
                { field: "location", header: "Location" },
                { field: "products", header: "Products" },
                { field: "actions", header: "" },
            ],
            loading: false,
            filters: {
                global: { value: "", matchMode: FilterMatchMode.CONTAINS },
            },
        };
    },
    computed: {
        machines() {
            return this.$store.state.machineModule.machines;
        },
    },
    methods: {
        onEdit(val) {
            this.machineToEdit = val;
            this.showEditMachine = true;
        },
        onEditComplete() {
            this.machineToEdit = null;
            this.getMachines();
        },
        getMachines() {
            return this.$store.dispatch("machineModule/fetchMachinesFromDB");
        },
    },
};
</script>
