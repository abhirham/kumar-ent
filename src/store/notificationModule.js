export default {
    name: "notificationModule",
    namespaced: true,
    state() {
        return {
            alertMessage: "",
            error: false,
        };
    },
    mutations: {
        setAlert(state, { alertMessage, error = false }) {
            console.log({ alertMessage });
            state.alertMessage = alertMessage;
            state.error = error;
        },
    },
    getters: {},
    actions: {},
};
