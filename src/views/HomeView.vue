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
                <WithError
                    v-slot="{ invalid }"
                    :error="v$.readings[key].opening_reading"
                >
                    <FloatLabel class="flex-1 min-w-25" variant="in">
                        <InputNumber
                            :invalid="invalid"
                            v-model="p.opening_reading"
                            inputId="withoutgrouping"
                            :useGrouping="false"
                            @update:modelValue="updateCups(key)"
                            fluid
                        />
                        <label for="withoutgrouping">Open Reading</label>
                    </FloatLabel>
                </WithError>
                <WithError
                    v-slot="{ invalid }"
                    :error="v$.readings[key].closing_reading"
                >
                    <FloatLabel class="flex-1 min-w-25" variant="in">
                        <InputNumber
                            :invalid="invalid"
                            v-model="p.closing_reading"
                            inputId="withoutgrouping"
                            name="closing_reading"
                            :useGrouping="false"
                            @update:modelValue="updateCups(key)"
                            fluid
                        />
                        <label for="withoutgrouping">Closing Reading</label>
                    </FloatLabel>
                </WithError>
                <WithError v-slot="{ invalid }" :error="v$.readings[key].cups">
                    <FloatLabel class="flex-1 min-w-25" variant="in">
                        <InputNumber
                            :invalid="invalid"
                            v-model="p.cups"
                            inputId="withoutgrouping"
                            name="cups"
                            :useGrouping="false"
                            fluid
                        />
                        <label for="withoutgrouping"># of cups</label>
                    </FloatLabel>
                </WithError>
                <WithError v-slot="{ invalid }" :error="v$.readings[key].rate">
                    <FloatLabel class="flex-1 min-w-25" variant="in">
                        <InputNumber
                            :invalid="invalid"
                            v-model="p.rate"
                            inputId="withoutgrouping"
                            name="rate"
                            :useGrouping="false"
                            :maxFractionDigits="3"
                            fluid
                        />
                    </FloatLabel>
                </WithError>
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
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, minValue } from "@vuelidate/validators";
import WithError from "@/components/WithError.vue";

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
    setup() {
        return { v$: useVuelidate() };
    },
    components: { CustomAutoComplete },
    data() {
        return {
            ...initialState(),
            loading: false,
            previousReadingsByMachine: {},
        };
    },
    validations() {
        return this.validationRules;
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
        productsInDB() {
            return this.$store.state.productModule.products;
        },
        validationRules() {
            return {
                readings: {
                    ...Object.keys(this.readings).reduce(
                        (acc, x) => ({
                            ...acc,
                            [x]: {
                                opening_reading: {
                                    required,
                                    minValue: minValue(0),
                                },
                                closing_reading: {
                                    required,
                                    minValue: helpers.withMessage(
                                        "Must be greater than Opening Reading.",
                                        minValue(
                                            this.readings[x].opening_reading
                                        )
                                    ),
                                },
                                rate: { required },
                                cups: { required, minValue: minValue(0) },
                            },
                        }),
                        {}
                    ),
                },
            };
        },
    },
    methods: {
        updateCups(key) {
            let obj = this.readings[key];
            obj.cups = (obj.closing_reading || 0) - (obj.opening_reading || 0);
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
        async save() {
            if (!(await this.v$.$validate())) return;

            this.loading = true;

            this.$store
                .dispatch("machineModule/addReadings", {
                    machineId: this.machine.id,
                    readings: this.readings,
                    createdAt: this.readingDate,
                    location: this.machine.location,
                    masterLocationId: this.machine.masterLocationId,
                })
                .then((res) => {
                    let updatedProducts = this.productsInDB;

                    Object.values(this.readings).forEach((x) => {
                        updatedProducts[x.name].rates =
                            updatedProducts[x.name].rates ?? {};

                        updatedProducts[x.name].rates[
                            this.machine.masterLocationId
                        ] =
                            updatedProducts[x.name].rates[
                                this.machine.masterLocationId
                            ] ?? x.rate;
                    });

                    this.$store.dispatch(
                        "productModule/updateProducts",
                        updatedProducts
                    );

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
            this.v$.$reset();
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
                        rate: this.productsInDB[name].rates?.[
                            value.masterLocationId
                        ],
                    },
                }),
                {}
            );
        },
    },
    mounted() {
        this.$store.dispatch("machineModule/fetchMachinesFromDB");
        this.$store.dispatch("companyModule/fetchCompaniesFromDB");
        this.$store.dispatch("productModule/fetchProducts");
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
