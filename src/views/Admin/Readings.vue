<template>
    <div>
        <div class="flex gap-5 mb-5">
            <FloatLabel variant="in">
                <DatePicker
                    v-model="startDate"
                    showIcon
                    iconDisplay="input"
                    date-format="dd-M-yy"
                    :max-date="maxDate"
                    @date-select="onStartDateChange"
                />
                <label>Start Date</label>
            </FloatLabel>
            <FloatLabel variant="in">
                <DatePicker
                    v-model="endDate"
                    showIcon
                    iconDisplay="input"
                    date-format="dd-M-yy"
                    :min-date="startDate"
                    :max-date="maxDate"
                />
                <label>End Date</label>
            </FloatLabel>
            <FloatLabel variant="in">
                <CustomAutoComplete
                    v-model="machine"
                    inputId="in_label"
                    dropdown
                    optionLabel="id"
                    returnObject
                    forceSelection
                    :items="machines"
                    fluid
                    variant="filled"
                />
                <label for="in_label">Machine #</label>
            </FloatLabel>
            <Button
                type="button"
                :disabled="!(this.startDate && this.endDate && this.machine)"
                :loading="loading"
                @click="fetchReadings"
                label="Generate"
            ></Button>
        </div>
        <template v-if="readings === null"></template>
        <div v-else-if="readings.length === 0">No readings found.</div>
        <div v-else class="container overflow-auto">
            <DataTable
                :value="readings"
                scrollable
                scrollHeight="70vh"
                stripedRows
            >
                <ColumnGroup type="header">
                    <Row>
                        <Column
                            v-for="col in prependCols"
                            :key="col.label"
                            :header="col.label"
                            :rowspan="2"
                        ></Column>

                        <Column v-for="col in displayCols" :colspan="3">
                            <template #header>
                                <div class="text-center w-full font-semibold">
                                    {{ col }}
                                </div>
                            </template>
                        </Column>
                        <Column
                            v-for="col in appendCols"
                            :key="col.label"
                            :header="col.label"
                            :rowspan="2"
                        ></Column>
                        <Column :rowspan="2" header="Actions"></Column>
                    </Row>
                    <Row>
                        <template v-for="col in displayCols">
                            <Column header="Opening"></Column>
                            <Column header="Closing"></Column>
                            <Column header="Cups"></Column>
                        </template>
                    </Row>
                </ColumnGroup>

                <Column :key="col.label" v-for="col in prependCols">
                    <template #body="attrs">
                        <div class="text-nowrap">
                            {{
                                col.value
                                    ? col.value(attrs)
                                    : attrs.data[col.field]
                            }}
                        </div>
                    </template>
                </Column>
                <template v-for="col in displayCols">
                    <Column :field="`readings.${col}.opening_reading`"></Column>
                    <Column :field="`readings.${col}.closing_reading`"></Column>
                    <Column :field="`readings.${col}.cups`"></Column>
                </template>
                <Column :key="col.label" v-for="col in appendCols">
                    <template #body="attrs">
                        <div class="text-nowrap">
                            {{
                                col.value
                                    ? col.value(attrs)
                                    : attrs.data[col.field]
                            }}
                        </div>
                    </template>
                </Column>
                <Column>
                    <template #body="{ data }">
                        <Button
                            size="small"
                            icon="pi pi-trash"
                            severity="danger"
                            text
                            @click="onDelete(data)"
                        ></Button>
                    </template>
                </Column>
                <template #empty> No machines found. </template>
            </DataTable>
        </div>
    </div>
</template>

<script>
import moment from "moment";
import CustomAutoComplete from "@/components/CustomAutoComplete.vue";

export default {
    components: { CustomAutoComplete },
    data() {
        return {
            loading: false,
            readings: null,
            machine: null,
            startDate: new Date(),
            endDate: new Date(),
            maxDate: new Date(),
            prependCols: [
                { label: "#", value: ({ index }) => index + 1 },
                { label: "Date", field: "createdAt" },
                { label: "Location", field: "location" },
                { label: "Machine", field: "machineId" },
            ],
            appendCols: [],
        };
    },
    computed: {
        machines() {
            return this.$store.state.machineModule.machines;
        },

        displayCols() {
            return this.readings.reduce((acc, x) => {
                Object.keys(x.readings).forEach((d) => {
                    acc[d] = d;
                });

                return acc;
            }, {});
        },
    },
    methods: {
        onDelete(val) {
            this.$store.commit("setFullScreenLoader", true);
            this.$store
                .dispatch("machineModule/deleteReadingById", { id: val.id })
                .then((res) => {
                    this.readings = this.readings.filter(
                        (x) => x.id !== val.id
                    );
                })
                .finally(() =>
                    this.$store.commit("setFullScreenLoader", false)
                );
        },
        onStartDateChange(val) {
            if (val > this.endDate) {
                this.endDate = null;
            }
        },
        fetchReadings() {
            this.readings = null;
            this.loading = true;

            this.$store
                .dispatch("machineModule/fetchReadingsByMachine", {
                    startDate: this.startDate,
                    endDate: this.endDate,
                    machineID: this.machine.id,
                })
                .then((res) => {
                    let arr = [];
                    res.forEach((x) => {
                        x.createdAt = moment(x.createdAt.toDate()).format(
                            "YYYY-MMM-DD"
                        );
                        arr.push(x);
                    });

                    this.readings = arr;
                })
                .finally(() => (this.loading = false));
        },
    },
    mounted() {
        this.$store.dispatch("machineModule/fetchMachinesFromDB");
    },
};
</script>
