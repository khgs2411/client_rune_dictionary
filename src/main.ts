import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router/router';
import './style.css';
// @version: 0.6.12 - This comment is auto-updated by deploy script

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

createApp(App).use(router).use(pinia).mount('#app');
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('message channel closed')) {
    event.preventDefault(); // Silence it
    console.warn('Ignored extension error:', event.reason);
  }
});
