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
    props: ["modelValue", "items", "optionLabel", "optionValue"],
    computed: {
        value: {
            get() {
                return this.modelValue;
            },
            set(val) {
                this.$emit(
                    "update:modelValue",
                    this.optionValue ? val[this.optionValue] : val
                );
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
