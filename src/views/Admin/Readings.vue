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
            // Destructure for easier access and less repetition.
            const {
                cols: columnDefs,
                rows: dataRows,
                reportTotals,
            } = this.displayReadings;

            // --- 1. Build Header Rows ---

            // Use flatMap to elegantly create the repeating header sections.
            const mainHeader = [
                "#",
                "Location",
                "Machine",
                ...columnDefs.flatMap((col) => [col.display, "", ""]), // [Display Name, (empty), (empty)] for each column
                "Total Cups",
            ];

            const subHeader = [
                "", // Corresponds to #
                "", // Corresponds to Location
                "", // Corresponds to Machine
                ...columnDefs.flatMap(() => ["Opening", "Closing", "Cups"]), // [Opening, Closing, Cups] for each column
            ];

            // --- 2. Build Data and Totals Rows ---

            const processedDataRows = dataRows.map((row, index) => [
                index + 1,
                row.location,
                row.machineId,
                ...columnDefs.flatMap((col) => [
                    row[col.key].opening,
                    row[col.key].closing,
                    row[col.key].cups,
                ]),
                row.totalCups,
            ]);

            const totalsRow = [
                "",
                "Totals",
                "",
                ...columnDefs.flatMap((col) => ["", "", reportTotals[col.key]]),
                reportTotals.total,
            ];

            // --- 3. Combine All Rows and Convert to a TSV String ---

            const allRows = [
                mainHeader,
                subHeader,
                ...processedDataRows,
                totalsRow,
            ];

            // Helper function to safely convert a 2D array to a TSV string.
            const toTsvString = (data) => {
                return data
                    .map((row) =>
                        row
                            .map((cell) => `${cell ?? ""}`.replace(/\t/g, " "))
                            .join("\t")
                    )
                    .join("\n");
            };

            const tsvContent = toTsvString(allRows);

            // --- 4. Create and Trigger Download ---

            // The download logic is already good, just using the cleaner variable.
            const startDate = moment(this.startDate).format("YYYY-MM-DD");
            const endDate = moment(this.endDate).format("YYYY-MM-DD");
            const fileName = `Report (${startDate} to ${endDate}).tsv`;

            const link = document.createElement("a");
            link.href =
                "data:text/tsv;charset=utf-8," + encodeURIComponent(tsvContent);
            link.download = fileName;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
