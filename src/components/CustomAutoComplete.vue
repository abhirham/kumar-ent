<template>
    <AutoComplete
        v-model="value"
        :suggestions="suggestions"
        :optionLabel="optionLabel"
        @complete="search"
    />
</template>

<script>
export default {
    props: {
        modelValue: { required: true },
        items: { required: true, type: Array },
        optionLabel: { type: String, default: "" },
        optionValue: { type: String, default: "" },
        returnObject: { type: Boolean, default: false },
    },
    computed: {
        value: {
            get() {
                return this.modelValue;
            },
            set(val) {
                let value = val ?? "";

                if (!this.returnObject && typeof value === "object") {
                    value = this.optionValue
                        ? value[this.optionValue]
                        : this.optionLabel
                        ? value[this.optionLabel]
                        : value;
                }

                this.$emit("update:modelValue", value);
            },
        },
    },
    data() {
        return {
            suggestions: [],
        };
    },

    methods: {
        search(e) {
            this.suggestions = this.items.filter((x) => {
                let val = this.optionLabel ? x[this.optionLabel] : x;

                return e.query
                    ? `${val.toUpperCase()}`.includes(e.query.toUpperCase())
                    : true;
            });
        },
    },
};
</script>
