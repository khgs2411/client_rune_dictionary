import {createApp} from "vue";
import "./style.css";
import "./assets/css/common.scss"
import App from "./App.vue"
import router from "./router/router.ts";
import PrimeVue from "primevue/config";
import Aura from '@primevue/themes/aura';
import {Tooltip} from "primevue";

createApp(App).use(router).use(PrimeVue, {
    theme: {
        preset: Aura
    }
}).directive('tooltip', Tooltip).mount("#app");
