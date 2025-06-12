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

            <Button
                type="button"
                :disabled="!(this.startDate && this.endDate)"
                :loading="loading"
                @click="fetchReadings"
                label="Generate"
            ></Button>
        </div>
        <template v-if="readings === null"></template>
        <div v-else-if="readings.length === 0">No readings found.</div>

        <DataTable
            v-else
            :value="displayReadings"
            tableStyle="min-width: 50rem"
        >
            <ColumnGroup type="header">
                <Row>
                    <Column header="#" :rowspan="2"></Column>
                    <Column header="Location" :rowspan="2"></Column>
                    <Column header="Machine #" :rowspan="2"></Column>
                    <Column
                        header="ESPRESSO"
                        headerStyle="text-align:right"
                        :colspan="3"
                    ></Column>
                    <Column
                        header="CUPPUCINE"
                        bodyStyle="text-align:right"
                        :colspan="3"
                    ></Column>
                    <Column
                        header="CAFELATTE"
                        headerStyle="text-align:right"
                        :colspan="3"
                    ></Column>
                    <Column header="Total Coffee" :rowspan="2"></Column>
                    <Column
                        header="MILK"
                        headerStyle="text-align:right"
                        :colspan="3"
                    ></Column>
                    <Column header="Total Cups" :rowspan="2"></Column>
                </Row>
                <Row>
                    <Column header="Opening"></Column>
                    <Column header="Closing"></Column>
                    <Column header="# cups"></Column>
                    <Column header="Opening"></Column>
                    <Column header="Closing"></Column>
                    <Column header="# cups"></Column>
                    <Column header="Opening"></Column>
                    <Column header="Closing"></Column>
                    <Column header="# cups"></Column>
                    <Column header="Opening"></Column>
                    <Column header="Closing"></Column>
                    <Column header="# cups"></Column>
                </Row>
            </ColumnGroup>
            <Column field="#">
                <template #body="{ index }"> {{ index + 1 }} </template>
            </Column>
            <Column></Column>
            <Column field="machineId"></Column>
            <Column field="Espresso.opening"></Column>
            <Column field="Espresso.closing"></Column>
            <Column field="Espresso.cups"></Column>
            <Column field="Cafelatte.opening"></Column>
            <Column field="Cafelatte.closing"></Column>
            <Column field="Cafelatte.cups"></Column>
            <Column field="Cafelatte.opening"></Column>
            <Column field="Cafelatte.closing"></Column>
            <Column field="Cafelatte.cups"></Column>
            <Column field="totalCoffee"></Column>
            <Column>
                <template #body="{ data }">
                    {{ data["Tea Milk"].opening }}
                </template>
            </Column>
            <Column>
                <template #body="{ data }">
                    {{ data["Tea Milk"].closing }}
                </template>
            </Column>
            <Column>
                <template #body="{ data }">
                    {{ data["Tea Milk"].cups }}
                </template>
            </Column>
            <Column field="totalCups"></Column>
            <template #empty> No machines found. </template>
        </DataTable>
    </div>
</template>

<script>
import moment from "moment";
import { db, serverTimestamp, arrayUnion, Timestamp } from "@/libs/firebase";

export default {
    data() {
        return {
            accordionValue: 0,
            loading: false,
            readings: null,
            startDate: new Date(),
            endDate: new Date(),
            maxDate: new Date(),
            columns: [
                { header: "Location", field: "name" },
                { header: "Machine #", field: "opening_reading" },
                { header: "Cl RDG", field: "closing_reading" },
                { header: "# Cups", field: "cups" },
                { header: "Rate", field: "rate" },
            ],
        };
    },
    computed: {
        machines() {
            return this.$store.state.machineModule.machines;
        },
        displayReadings() {
            let obj = {};

            this.readings.forEach((r) => {
                obj[r.machineId] = obj[r.machineId] ?? {
                    machineId: r.machineId,
                };

                Object.values(r.readings).forEach((v) => {
                    obj[r.machineId][v.name] = obj[r.machineId][v.name] ?? {
                        opening: v.opening_reading,
                        cups: 0,
                    };

                    obj[r.machineId][v.name].closing = v.closing_reading;
                    obj[r.machineId][v.name].cups += v.cups;
                });

                obj[r.machineId].totalCoffee = [
                    "Cappuccino",
                    "Espresso",
                    "Cafelatte",
                ].reduce((acc, x) => {
                    return acc + obj[r.machineId][x].cups;
                }, 0);

                obj[r.machineId].totalCups =
                    obj[r.machineId].totalCoffee +
                    obj[r.machineId]["Tea Milk"].cups;
            });

            return Object.values(obj);
        },
    },
    methods: {
        onStartDateChange(val) {
            if (val > this.endDate) {
                this.endDate = null;
            }
        },
        dateFormat(date) {
            return moment(date).format("h:mm a");
        },
        fetchReadings() {
            this.readings = null;
            this.loading = true;

            this.$store
                .dispatch("machineModule/fetchReadings", {
                    startDate: this.startDate,
                    endDate: this.endDate,
                })
                .then((res) => {
                    let arr = [];
                    res.forEach((x) => {
                        x.createdAt = x.createdAt.toDate();
                        arr.push(x);
                    });

                    this.readings = arr;
                })
                .finally(() => (this.loading = false));
        },
    },
};
</script>
