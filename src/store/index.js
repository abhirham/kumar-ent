import { createStore } from "vuex";
import notificationModule from "./notificationModule";
import userModule from "./userModule";
import authModule from "./authModule";
import machineModule from "./machineModule";
import companyModule from "./companyModule";
import productModule from "./productModule";

// Create a new store instance.
const store = createStore({
    modules: {
        notificationModule,
        userModule,
        authModule,
        machineModule,
        companyModule,
        productModule,
    },
    state: {
        fullScreenLoader: true,
    },
    mutations: {
        setFullScreenLoader(state, payload) {
            state.fullScreenLoader = payload;
        },
    },
});

store.subscribeAction({
    error: (action, __, e) => {
        if (action.payload?.handleError === false) return;
        console.log("came here", e);

        store.commit("notificationModule/setAlert", {
            alertMessage: e.message,
            error: true,
        });
    },
});

export default store;
