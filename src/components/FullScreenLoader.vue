<template>
    <div
        v-show="$store.state.fullScreenLoader"
        class="absolute bottom-0 left-0 right-0 top-0 flex items-center backdrop-blur-xs z-10"
    >
        <ProgressSpinner
            style="width: 50px; height: 50px"
            strokeWidth="8"
            fill="transparent"
            animationDuration=".5s"
            aria-label="Custom ProgressSpinner"
        />
    </div>
</template>

<script>
export default {};
</script>
