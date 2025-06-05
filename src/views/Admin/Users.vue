<template>
    <div class="flex flex-col">
        <Button
            class="self-end mb-5"
            @click="showAddUser = true"
            label="Add User"
        ></Button>
        <DataTable
            scrollable
            scrollHeight="80vh"
            :value="users"
            :loading="loading"
            tableStyle="min-width: 50rem"
        >
            <Column
                v-for="col of columns"
                :key="col.field"
                :field="col.field"
                :header="col.header"
            >
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
            <template #empty> No users found. </template>
        </DataTable>
    </div>
    <AddUser v-model="showAddUser" @complete="getUsers" />
    <AddUser
        v-model="showEditUser"
        :editMode="true"
        :userToEdit="userToEdit"
        @editComplete="onEditComplete"
    />
</template>

<script>
import moment from "moment";
import AddUser from "./AddUser.vue";

export default {
    components: { AddUser },
    data() {
        return {
            showAddUser: false,
            showEditUser: false,
            userToEdit: null,
            users: [],
            columns: [
                { field: "uid", header: "Phone #" },
                { field: "fullName", header: "Name" },
                { field: "createdAt", header: "Created At" },
                { field: "isAdmin", header: "Is Admin?" },
                { field: "actions", header: "" },
            ],
            loading: false,
        };
    },
    mounted() {
        this.getUsers();
    },
    methods: {
        onEdit(val) {
            this.userToEdit = val;
            this.showEditUser = true;
        },
        getUsers() {
            this.loading = true;
            this.$store
                .dispatch("userModule/fetchUsersFromDB")
                .then((res) => {
                    this.users = res.map((x) => ({
                        ...x,
                        createdAt: moment(x.createdAt.toDate()).format(
                            "YYYY-MMM-DD"
                        ),
                        fullName: `${x.firstName} ${x.lastName}`,
                    }));
                })
                .finally(() => (this.loading = false));
        },
        onEditComplete() {
            this.userToEdit = null;
            this.getUsers();
        },
    },
};
</script>
