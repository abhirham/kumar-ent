<template>
    <Toast @life-end="showAlert = false" />
</template>

<script>
import { mapState } from "vuex";
import { useToast } from "primevue/usetoast";

export default {
    computed: {
        ...mapState("notificationModule", ["alertMessage", "error"]),
        showAlert: {
            get() {
                return this.alertMessage.length > 0;
            },
            set() {
                this.$store.commit("notificationModule/setAlert", {
                    alertMessage: "",
                });
            },
        },
    },
    data() {
        return {
            toast: null,
        };
    },
    mounted() {
        this.toast = useToast();
    },
    watch: {
        showAlert(val) {
            if (val) {
                this.toast.add({
                    severity: this.error ? "error" : "success",
                    summary: this.error ? "Error" : "Success",
                    detail: this.alertMessage,
                    life: 3000,
                });
            }
        },
    },
};
</script>
