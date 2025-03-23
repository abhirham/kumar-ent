<template>
    <div>
        <div class="flex gap-5 mb-5">
            <FloatLabel variant="in">
                <DatePicker
                    v-model="readingDate"
                    showIcon
                    iconDisplay="input"
                    date-format="dd-M-yy"
                    :max-date="maxDate"
                />
                <label>Report Date</label>
            </FloatLabel>
            <FloatLabel variant="in">
                <CustomAutoComplete
                    v-model="machineID"
                    inputId="in_label"
                    dropdown
                    optionLabel="id"
                    forceSelection
                    :items="machines"
                />
                <label for="in_label">Machine #</label>
            </FloatLabel>
            <Button
                type="button"
                :disabled="machineID.length === 0"
                :loading="loading"
                @click="fetchReadings"
                label="Generate"
            ></Button>
        </div>
        <template v-if="readings === null"></template>
        <div v-else-if="readings.length === 0">No readings found.</div>
        <Accordion v-else v-model:value="accordionValue">
            <AccordionPanel v-for="(reading, idx) in readings" :value="idx">
                <AccordionHeader>
                    <div class="flex gap-10">
                        {{ dateFormat(reading.createdAt) }}
                        <Tag severity="Info" :value="reading.createdBy"></Tag>
                    </div>
                </AccordionHeader>
                <AccordionContent>
                    <DataTable
                        :value="Object.values(reading.readings)"
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
                </AccordionContent>
            </AccordionPanel>
        </Accordion>
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
            readingDate: new Date(),
            maxDate: new Date(),
            machineID: "",
            columns: [
                { header: "Product", field: "name" },
                { header: "OP RDG", field: "opening_reading" },
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
    },
    methods: {
        dateFormat(date) {
            return moment(date).format("h:mm a");
        },
        fetchReadings() {
            this.readings = null;
            this.loading = true;

            this.$store
                .dispatch("machineModule/fetchReadings", {
                    date: this.readingDate,
                    machineId: this.machineID,
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
