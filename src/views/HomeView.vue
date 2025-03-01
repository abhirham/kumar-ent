<template>
    <div class="grid grid-cols-1 gap-5">
        <FloatLabel variant="in">
            <CustomAutoComplete
                v-model="machine"
                inputId="in_label"
                dropdown
                optionLabel="id"
                forceSelection
                :items="machines"
                @item-select="onChange"
                fluid
                variant="filled"
            />
            <label for="in_label">Machine #</label>
        </FloatLabel>
        <template v-if="!!machine">
            <FloatLabel variant="in" v-for="p in machine.products" :key="p">
                <InputNumber
                    v-model="readings[p]"
                    inputId="withoutgrouping"
                    :useGrouping="false"
                    fluid
                />
                <label for="withoutgrouping">{{ p }}</label>
            </FloatLabel>
        </template>
        <Button label="Save" :loading="loading" @click="save" />
    </div>
</template>

<script>
import CustomAutoComplete from "@/components/CustomAutoComplete.vue";

const initialState = () =>
    JSON.parse(JSON.stringify({ machine: null, readings: {} }));

export default {
    components: { CustomAutoComplete },
    data() {
        return {
            ...initialState(),
            machines: [],
            loading: false,
        };
    },
    methods: {
        save() {
            if (Object.keys(this.readings).length === 0) return;

            this.loading = true;

            this.$store
                .dispatch("machineModule/addReadings", {
                    machineId: this.machine.id,
                    readings: this.readings,
                })
                .then((res) => {
                    let state = initialState();

                    Object.keys(state).forEach((x) => (this[x] = state[x]));

                    this.$store.commit("notificationModule/setAlert", {
                        alertMessage: "Readings have been saved.",
                    });
                })
                .finally(() => (this.loading = false));
        },

        onChange() {
            this.readings = initialState().readings;
        },
    },
    mounted() {
        this.$store
            .dispatch("machineModule/fetchMachinesFromDB")
            .then((res) => {
                this.machines = res;
            });
    },
    watch: {
        machine(val) {
            if (val === null) this.readings = [];
        },
    },
};
</script>
