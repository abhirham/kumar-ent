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
        <div v-else class="container overflow-auto">
            <Button @click="exportCSV">Export CSV</Button>
            <DataTable :value="displayReadings.rows">
                <ColumnGroup type="header">
                    <Row>
                        <Column header="#" :rowspan="2"></Column>
                        <Column header="Location" :rowspan="2"></Column>
                        <Column header="Machine" :rowspan="2"></Column>
                        <Column
                            v-for="col in displayReadings.cols"
                            :colspan="3"
                        >
                            <template #header>
                                <div class="text-center w-full font-semibold">
                                    {{ col.display }}
                                </div>
                            </template>
                        </Column>
                        <Column header="Total Cups" :rowspan="2"></Column>
                    </Row>
                    <Row>
                        <template v-for="col in displayReadings.cols">
                            <Column header="Opening"></Column>
                            <Column header="Closing"></Column>
                            <Column header="Cups"></Column>
                        </template>
                    </Row>
                </ColumnGroup>
                <Column field="#">
                    <template #body="{ index }"> {{ index + 1 }} </template>
                </Column>
                <Column field="location"></Column>
                <Column field="machineId"></Column>
                <template v-for="col in displayReadings.cols">
                    <Column :field="`${col.key}.opening`"></Column>
                    <Column :field="`${col.key}.closing`"></Column>
                    <Column :field="`${col.key}.cups`"></Column>
                </template>

                <Column field="totalCups"></Column>
                <ColumnGroup type="footer">
                    <Row>
                        <Column
                            footer="Totals:"
                            footerStyle="text-align:center"
                            :colspan="3"
                        />
                        <template v-for="col in displayReadings.cols">
                            <Column />
                            <Column />
                            <Column
                                :footer="displayReadings.reportTotals[col.key]"
                            />
                        </template>
                        <Column :footer="displayReadings.reportTotals.total" />
                    </Row>
                </ColumnGroup>
                <template #empty> No machines found. </template>
            </DataTable>
        </div>
    </div>
</template>

<script>
import moment from "moment";

export default {
    data() {
        return {
            accordionValue: 0,
            loading: false,
            readings: null,
            startDate: new Date(),
            endDate: new Date(),
            maxDate: new Date(),
        };
    },
    computed: {
        machines() {
            return this.$store.state.machineModule.machines;
        },
        displayReadings() {
            let rows = {};
            let cols = {};
            let reportTotals = { total: 0 };

            this.readings.forEach((r) => {
                let key = `${r.machineId}-${r.location}`;

                rows[key] = rows[key] ?? {
                    machineId: r.machineId,
                    location: r.location,
                    totalCups: 0,
                };

                Object.values(r.readings).forEach((v) => {
                    let productKey = v.name.replace(/ /g, "_");

                    cols[productKey] = cols[productKey] ?? {
                        display: v.name,
                        key: productKey,
                    };

                    rows[key][productKey] = rows[key][productKey] ?? {
                        opening: v.opening_reading,
                        cups: 0,
                    };

                    rows[key][productKey].closing = v.closing_reading;
                    rows[key][productKey].cups += v.cups;
                    rows[key].totalCups += v.cups;

                    reportTotals.total += v.cups;
                    reportTotals[productKey] =
                        (reportTotals[productKey] ?? 0) + v.cups;
                });

                // rows[r.machineId].totalCoffee = [
                //     "Cappuccino",
                //     "Espresso",
                //     "Cafelatte",
                // ].reduce((acc, x) => {
                //     return acc + rows[r.machineId][x].cups;
                // }, 0);
            });

            return {
                rows: Object.values(rows),
                cols: Object.values(cols),
                reportTotals,
            };
        },
    },
    methods: {
        exportCSV() {
            let cols = [];

            cols.push(["#", "Location", "Machine"]);

            this.displayReadings.cols.map((x) =>
                cols[0].push(x.display, "", "")
            );

            cols[0].push("Total Cups");

            cols.push(["", "", ""]);

            this.displayReadings.cols.map((x) =>
                cols[1].push("Opening", "Closing", "Cups")
            );

            cols = cols
                .map((row) => row.map((x) => x.replace(/\t/g, " ")).join("\t"))
                .join("\n");

            let rows = this.displayReadings.rows.map((row, idx) => {
                let d = [idx + 1, row.location, row.machineId];

                this.displayReadings.cols.map((x) => {
                    d.push(
                        row[x.key].opening,
                        row[x.key].closing,
                        row[x.key].cups
                    );
                });

                d.push(row.totalCups);

                return d;
            });

            let totalsRow = ["", "Totals", ""];

            this.displayReadings.cols.forEach((x) => {
                totalsRow.push(
                    "",
                    "",
                    this.displayReadings.reportTotals[x.key]
                );
            });
            totalsRow.push(this.displayReadings.reportTotals.total);

            rows.push(totalsRow);

            rows = rows
                .map((r) => r.map((x) => `${x}`.replace(/\t/g, " ")).join("\t"))
                .join("\n");

            let arr = cols + "\n" + rows;
            let a = document.createElement("a");
            a.textContent = "download";
            a.download = `Report (${moment(this.startDate).format(
                "YYYY-MM-DD"
            )} to ${moment(this.endDate).format("YYYY-MM-DD")}).tsv`;
            a.href = "data:text/tsv;charset=utf-8," + encodeURIComponent(arr);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },
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
