import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import Aura from "@primevue/themes/aura";
import store from "@/store";
import ToastService from "primevue/toastservice";

import PrimeVue from "primevue/config";

const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: ".fake-dark-selector", // trying to also force a non-usage of the dark mode
        },
    },
});

app.use(router);
app.use(store);
app.use(ToastService);

app.mount("#app");
