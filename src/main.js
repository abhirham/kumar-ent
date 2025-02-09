import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Aura from '@primevue/themes/aura';

import PrimeVue from 'primevue/config';

const app = createApp(App)

app.use(PrimeVue, {
    theme: {
        preset: Aura,
    }
});

app.use(router)

app.mount('#app')
