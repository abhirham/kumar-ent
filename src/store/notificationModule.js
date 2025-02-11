export default {
    name: 'notificationModule',
    namespaced: true,
    state() {
        return {
            alertMessage: '',
            error: false,
        };
    },
    mutations: {
        setAlert(state, { alertMessage, error = false }) {
            state.alertMessage = alertMessage;
            state.error = error;
        },
    },
    getters: {},
    actions: {},
};
