<template>
    <AutoComplete v-model="value" :suggestions="suggestions" />
</template>

<script>
export default {
    props: ["modelValue", "items"],
    computed: {
        value: {
            get() {
                return this.modelValue;
            },
            set(val) {
                this.$emit("update:modelValue", val);
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
            this.suggestions = this.items.filter((x) =>
                e.query ? `${x}`.includes(e.query) : true
            );
        },
    },
};
</script>
