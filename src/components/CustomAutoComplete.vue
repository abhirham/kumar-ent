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
        optionLabel: { type: String, default: null },
        optionValue: { type: String, default: null },
        returnObject: { type: Boolean, default: false },
    },
    emits: ["update:modelValue"],
    computed: {
        value: {
            get() {
                let key = this.optionValue ?? this.optionLabel;
                let val = this.returnObject
                    ? this.modelValue?.[key]
                    : this.modelValue;

                if (key) {
                    return this.items.find((x) => x[key] === val);
                }

                return this.modelValue;
            },
            set(val) {
                let value = val ?? "";
                let key = this.optionValue ?? this.optionLabel;

                if (!this.returnObject && typeof value === "object" && key) {
                    value = value[key];
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
