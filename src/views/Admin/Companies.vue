<template>
    <div class="flex flex-col">
        <Button
            class="self-end mb-5"
            @click="showAddCompany = true"
            label="Add Company"
        ></Button>
        <DataTable
            scrollable
            scrollHeight="80vh"
            :value="companies"
            :loading="loading"
            tableStyle="min-width: 50rem"
            v-model:filters="filters"
            :globalFilterFields="['name']"
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
            <template #empty> No Companies found. </template>
        </DataTable>
    </div>
    <AddCompany v-model="showAddCompany" @complete="getCompanies" />
    <AddCompany
        v-model="showEditCompany"
        :editMode="true"
        :companyToEdit="companyToEdit"
        @editComplete="onEditComplete"
    />
</template>

<script>
import AddCompany from "./AddCompany.vue";
import { FilterMatchMode } from "@primevue/core/api";

export default {
    components: { AddCompany },
    data() {
        return {
            showAddCompany: false,
            showEditCompany: false,
            companyToEdit: null,
            columns: [{ field: "name", header: "Company" }],
            loading: false,
            filters: {
                global: { value: "", matchMode: FilterMatchMode.CONTAINS },
            },
        };
    },
    computed: {
        companies() {
            return Object.values(this.$store.state.companyModule.companies);
        },
    },
    methods: {
        onEdit(val) {
            this.companyToEdit = val;
            this.showEditCompany = true;
        },
        onEditComplete() {
            this.companyToEdit = null;
            this.getCompanies();
        },
        getCompanies() {
            return this.$store.dispatch("companyModule/fetchCompaniesFromDB");
        },
    },
};
</script>
