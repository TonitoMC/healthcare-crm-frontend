import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router/index.js";
import { createPinia } from "pinia";
import { setupAuthGuard } from "@/plugins/authGuard";

import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import ToastService from "primevue/toastservice";

// 👇 Correct order of CSS imports

import "primeflex/primeflex.css"; // 📐 Layout utilities
import "primeicons/primeicons.css"; // 🔣 Icons
import "@/style.css"; // 🎨 Your overrides
// Your custom styles last
import "@/style.css";

const app = createApp(App);

const pinia = createPinia();

setupAuthGuard(router);
app.use(router);
app.use(pinia);
app.use(PrimeVue, { theme: { preset: Aura } });
app.use(ToastService);

app.config.devtools = true;
app.mount("#app");

import { useAuthStore } from "@/stores/auth";
const auth = useAuthStore();
auth.restoreSession();
