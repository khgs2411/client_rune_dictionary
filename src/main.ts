import { createApp } from "vue";
import "./style.css";
import "./assets/css/style.scss";
import 'primeicons/primeicons.css'
import App from "./App.vue";
import router from "./router/router.ts";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import { Tooltip } from "primevue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import Ripple from "primevue/ripple";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)

createApp(App)
    .use(router)
    .use(pinia)
    .use(PrimeVue, {
        ripple: true,
        theme: {
            preset: Aura,
            options: {
                prefix: 'p',
                darkModeSelector: '.dark'

            }
        },
    })
    .directive("tooltip", Tooltip)
    .directive('ripple', Ripple)
    .mount("#app");
