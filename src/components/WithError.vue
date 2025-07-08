<template>
    <div class="flex flex-col gap-1">
        <slot :invalid="errorToUse.$error"></slot>
        <Message
            v-if="errorToUse.$error"
            severity="error"
            size="small"
            variant="simple"
            >{{ errorToUse.$errors[0].$message }}</Message
        >
    </div>
</template>

<script>
export default {
    props: ["error", "errorArr"],
    computed: {
        errorToUse() {
            return (
                this.error ?? {
                    $error: this.errorArr.length > 0,
                    $errors: this.errorArr,
                }
            );
        },
    },
};
</script>
