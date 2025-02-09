<template>
    <div class="grid grid-cols-1 gap-5">
        <FloatLabel variant="in">
            <AutoComplete
                v-model="value2"
                inputId="in_label"
                dropdown
                fluid
                :suggestions="suggestions"
                @complete="search"
                variant="filled"
            />
            <label for="in_label">Machine #</label>
        </FloatLabel>
        <FloatLabel variant="in">
            <InputNumber
                v-model="value2"
                inputId="withoutgrouping"
                :useGrouping="false"
                fluid
            />
            <label for="withoutgrouping">Tea</label>
        </FloatLabel>
        <Button label="Save" />
    </div>
</template>

<script>
export default {
    data() {
        return {
            items: [1234, 1345, 1456, 1567],
            value2: null,
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
