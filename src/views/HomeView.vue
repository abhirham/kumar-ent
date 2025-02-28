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
                @change="onChange"
                fluid
                variant="filled"
            />
            <label for="in_label">Machine #</label>
        </FloatLabel>
        <template v-if="!!machine">
            <FloatLabel
                variant="in"
                v-for="(p, idx) in machine.products"
                :key="p"
            >
                <InputNumber
                    v-model="readings[idx]"
                    inputId="withoutgrouping"
                    :useGrouping="false"
                    fluid
                />
                <label for="withoutgrouping">{{ p }}</label>
            </FloatLabel>
        </template>
        <Button label="Save" />
    </div>
</template>

<script>
import CustomAutoComplete from "@/components/CustomAutoComplete.vue";
export default {
    components: { CustomAutoComplete },
    data() {
        return {
            machine: null,
            readings: [],
            machines: [],
        };
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
