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
            <Button @click="exportCSV" class="mb-5">Export CSV</Button>
            <DataTable
                :value="displayReadings.rows"
                scrollable
                scrollHeight="70vh"
                stripedRows
                showGridlines
            >
                <ColumnGroup type="header">
                    <Row>
                        <Column
                            v-for="col in prependCols"
                            :key="col.label"
                            :header="col.label"
                            :rowspan="2"
                        ></Column>

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
                        <Column
                            v-for="col in appendCols"
                            :key="col.label"
                            :header="col.label"
                            :rowspan="2"
                        ></Column>
                    </Row>
                    <Row>
                        <template v-for="col in displayReadings.cols">
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
                <template v-for="col in displayReadings.cols">
                    <Column :field="`${col.key}.opening`">
                        <template #body="{ data }">
                            {{ data[col.key].opening.toLocaleString("en-IN") }}
                        </template>
                    </Column>
                    <Column :field="`${col.key}.closing`">
                        <template #body="{ data }">
                            {{ data[col.key].closing.toLocaleString("en-IN") }}
                        </template>
                    </Column>
                    <Column :field="`${col.key}.cups`">
                        <template #body="{ data }">
                            {{ data[col.key].cups.toLocaleString("en-IN") }}
                        </template>
                    </Column>
                </template>
                <Column :key="col.label" v-for="col in appendCols">
                    <template #body="attrs">
                        <div class="text-nowrap">
                            {{
                                (col.value
                                    ? col.value(attrs)
                                    : attrs.data[col.field]
                                ).toLocaleString("en-IN")
                            }}
                        </div>
                    </template>
                </Column>
                <ColumnGroup type="footer">
                    <Row>
                        <Column footer="Totals:" />
                        <Column v-for="(col, idx) in prependCols.slice(1)" />
                        <template v-for="col in displayReadings.cols">
                            <Column />
                            <Column />
                            <Column>
                                <template #footer="attrs">
                                    <div class="text-nowrap font-bold">
                                        {{
                                            displayReadings.reportTotals[
                                                col.key
                                            ].toLocaleString("en-IN")
                                        }}
                                    </div>
                                </template>
                            </Column>
                        </template>
                        <Column v-for="col in appendCols">
                            <template #footer="attrs">
                                <div class="text-nowrap font-bold">
                                    {{
                                        col
                                            .footerValue({
                                                data: displayReadings.reportTotals,
                                            })
                                            .toLocaleString("en-IN")
                                    }}
                                </div>
                            </template>
                        </Column>
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
            loading: false,
            readings: null,
            startDate: new Date(),
            endDate: new Date(),
            maxDate: new Date(),
            prependCols: [
                { label: "#", value: ({ index }) => index + 1 },
                { label: "Location", field: "location", footerText: "Totals" },
                { label: "Machine", field: "machineId" },
                { label: "Start Date", field: "startDate" },
                { label: "End Date", field: "endDate" },
            ],
            appendCols: [
                {
                    label: "Total Cups",
                    field: "totalCups",
                    footerValue: ({ data }) => data.total,
                },
            ],
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
            let count = 0;

            this.readings.forEach((r) => {
                let key = `${r.machineId}-${r.location}-${count}`;

                Object.values(r.readings).some((v) => {
                    let productKey = v.name.replace(/ /g, "_");

                    if (rows[key]?.[productKey]?.closing > v.opening_reading) {
                        count++;
                        key = `${r.machineId}-${r.location}-${count}`;
                        return true;
                    }

                    return false;
                });

                rows[key] = rows[key] ?? {
                    machineId: r.machineId,
                    location: r.location,
                    totalCups: 0,
                    startDate: moment(r.createdAt).format("YYYY-MMM-DD"),
                };

                rows[key].endDate = moment(r.createdAt).format("YYYY-MMM-DD");

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
                ...this.prependCols.map((x) => x.label),
                ...columnDefs.flatMap((col) => [col.display, "", ""]), // [Display Name, (empty), (empty)] for each column
                ...this.appendCols.map((x) => x.label),
            ];

            const subHeader = [
                ...this.prependCols.map((x) => ""),
                ...columnDefs.flatMap(() => ["Opening", "Closing", "Cups"]), // [Opening, Closing, Cups] for each column
            ];

            // --- 2. Build Data and Totals Rows ---

            const processedDataRows = dataRows.map((row, index) => [
                ...this.prependCols.map((x) =>
                    x.value ? x.value({ index }) : row[x.field]
                ),

                ...columnDefs.flatMap((col) => [
                    row[col.key]?.opening,
                    row[col.key]?.closing,
                    row[col.key]?.cups,
                ]),
                ...this.appendCols.map((x) =>
                    x.value ? x.value({ index }) : row[x.field]
                ),
            ]);

            const totalsRow = [
                ...this.prependCols.map((x) => x.footerText ?? ""),
                ...columnDefs.flatMap((col) => ["", "", reportTotals[col.key]]),
                ...this.appendCols.map((x) =>
                    x.footerValue
                        ? x.footerValue({ data: reportTotals })
                        : x.footerText ?? ""
                ),
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
