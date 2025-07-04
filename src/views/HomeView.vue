<template>
    <div class="grid grid-cols-1 gap-5">
        <FloatLabel variant="in">
            <CustomAutoComplete
                v-model="machine"
                inputId="in_label"
                dropdown
                optionLabel="id"
                returnObject
                forceSelection
                :items="machines"
                @item-select="onMachineChange"
                fluid
                variant="filled"
            />
            <label for="in_label">Machine #</label>
        </FloatLabel>
        <div v-if="previousReadingCreatedAt">
            <Tag severity="secondary"
                >Last Reading Submitted at: {{ previousReadingCreatedAt }}</Tag
            >
        </div>
        <FloatLabel v-if="!!machine" variant="in">
            <DatePicker
                v-model="readingDate"
                showIcon
                iconDisplay="input"
                date-format="dd-M-yy"
                :max-date="new Date()"
            />
            <label>Reading Date</label>
        </FloatLabel>
        <template v-for="(p, key, idx) in readings" :key="p.name">
            <Divider v-if="idx > 0" />
            <div class="flex gap-10 items-center flex-wrap">
                <div>
                    {{ p.name }}
                </div>
                <FloatLabel class="flex-1 min-w-25" variant="in">
                    <InputNumber
                        v-model="p.opening_reading"
                        inputId="withoutgrouping"
                        :useGrouping="false"
                        @update:modelValue="updateCups(key)"
                        fluid
                    />
                    <label for="withoutgrouping">Open Reading</label>
                </FloatLabel>

                <FloatLabel class="flex-1 min-w-25" variant="in">
                    <InputNumber
                        :invalid="
                            errorMessages[`${p.name}-closing_reading`] !==
                            undefined
                        "
                        v-model="p.closing_reading"
                        inputId="withoutgrouping"
                        name="closing_reading"
                        :useGrouping="false"
                        @update:modelValue="updateCups(key)"
                        fluid
                    />
                    <Message
                        v-if="errorMessages[`${p.name}-closing_reading`]"
                        severity="error"
                        size="small"
                        variant="simple"
                        >{{
                            errorMessages[`${p.name}-closing_reading`]
                        }}</Message
                    >
                    <label for="withoutgrouping">Closing Reading</label>
                </FloatLabel>
                <FloatLabel class="flex-1 min-w-25" variant="in">
                    <InputNumber
                        :invalid="errorMessages[`${p.name}-cups`] !== undefined"
                        v-model="p.cups"
                        inputId="withoutgrouping"
                        name="cups"
                        :useGrouping="false"
                        fluid
                    />
                    <Message
                        v-if="errorMessages[`${p.name}-cups`]"
                        severity="error"
                        size="small"
                        variant="simple"
                        >{{ errorMessages[`${p.name}-cups`] }}</Message
                    >
                    <label for="withoutgrouping"># of cups</label>
                </FloatLabel>
                <FloatLabel class="flex-1 min-w-25" variant="in">
                    <InputNumber
                        :invalid="errorMessages[`${p.name}-rate`] !== undefined"
                        v-model="p.rate"
                        inputId="withoutgrouping"
                        name="rate"
                        :useGrouping="false"
                        :maxFractionDigits="3"
                        fluid
                    />
                    <Message
                        v-if="errorMessages[`${p.name}-rate`]"
                        severity="error"
                        size="small"
                        variant="simple"
                        >{{ errorMessages[`${p.name}-rate`] }}</Message
                    >
                    <label for="withoutgrouping">Rate</label>
                </FloatLabel>
            </div>
        </template>
        <Button
            label="Save"
            v-if="Object.keys(readings).length > 0"
            :loading="loading"
            @click="save"
        />
    </div>
</template>

<script>
import moment from "moment";
import CustomAutoComplete from "@/components/CustomAutoComplete.vue";

const initialState = () =>
    JSON.parse(
        JSON.stringify({
            machine: null,
            readings: {},
            errorMessages: {},
            readingDate: new Date(),
        })
    );

export default {
    components: { CustomAutoComplete },
    data() {
        return {
            ...initialState(),
            loading: false,
            previousReadingsByMachine: {},
        };
    },
    computed: {
        machines() {
            return this.$store.state.machineModule.machines;
        },
        previousReadingCreatedAt() {
            try {
                return moment(
                    new Date(
                        this.previousReadingsByMachine[this.machine.id]
                            .createdAt.seconds * 1000
                    )
                ).format("D-MMM-YYYY h:m A");
            } catch (e) {
                return false;
            }
        },
    },
    methods: {
        updateCups(key) {
            let obj = this.readings[key];
            obj.cups = (obj.closing_reading || 0) - (obj.opening_reading || 0);
        },
        validate() {
            let obj = {};

            Object.values(this.readings).forEach((x) => {
                ["closing_reading", "rate"].forEach((y) => {
                    if ((x[y] ?? null) === null)
                        obj[x.name + `-${y}`] = "This field is required.";
                });

                if (
                    x.closing_reading < x.opening_reading &&
                    !obj[x.name + `-closing_reading`]
                )
                    obj[x.name + `-closing_reading`] =
                        "Closing Reading must be greater than Opening Reading.";
            });

            this.errorMessages = obj;

            return Object.keys(obj).length === 0;
        },
        previousReadingValue(productName) {
            try {
                return this.previousReadingsByMachine[this.machine.id].readings[
                    productName
                ].closing_reading;
            } catch (e) {
                return 0;
            }
        },
        save() {
            if (!this.validate()) return;

            this.loading = true;

            this.$store
                .dispatch("machineModule/addReadings", {
                    machineId: this.machine.id,
                    readings: this.readings,
                    createdAt: this.readingDate,
                    location: this.machine.location,
                })
                .then((res) => {
                    this.previousReadingsByMachine[res.machineId] = res;

                    let state = initialState();

                    Object.keys(state).forEach((x) => (this[x] = state[x]));

                    this.$store.commit("notificationModule/setAlert", {
                        alertMessage: "Readings have been saved.",
                    });
                })
                .finally(() => (this.loading = false));
        },

        async onMachineChange({ value }) {
            if (!this.previousReadingsByMachine[value.id]) {
                this.$store.commit("setFullScreenLoader", true);
                await this.$store
                    .dispatch("machineModule/fetchLatestReadingsBydMachine", {
                        machineID: value.id,
                    })
                    .then((res) => {
                        if (!res) return;

                        this.previousReadingsByMachine[value.id] = res;
                    })
                    .finally(() =>
                        this.$store.commit("setFullScreenLoader", false)
                    );
            }

            this.readings = value.products.reduce(
                (acc, { name }) => ({
                    ...acc,
                    [name]: {
                        name,
                        opening_reading: this.previousReadingValue(name),
                    },
                }),
                {}
            );
        },
    },
    mounted() {
        this.$store.dispatch("machineModule/fetchMachinesFromDB");
        this.$store.dispatch("companyModule/fetchCompaniesFromDB");
    },
    watch: {
        machine(val) {
            if (!val) {
                this.readings = {};
                return;
            }
        },
    },
};
</script>
