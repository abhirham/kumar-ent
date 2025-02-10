<template>
    <Card>
        <template #subtitle>Login to continue</template>
        <template #content>
            <div class="flex flex-col gap-3">
                <FloatLabel variant="in">
                    <InputNumber
                        v-model="value2"
                        inputId="withoutgrouping"
                        :useGrouping="false"
                        fluid
                    />
                    <label for="withoutgrouping">Phone #</label>
                </FloatLabel>
                <FloatLabel variant="in">
                    <Password inputId="password" :feedback="false" fluid />
                    <label for="password">Password</label>
                </FloatLabel>
                <Button fluid label="Continue" />
            </div>
        </template>
    </Card>
</template>

<script>
export default {
    data() {
        return {};
    },
};
</script>
