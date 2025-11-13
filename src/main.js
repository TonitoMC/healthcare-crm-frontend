import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router/index.js";
import { createPinia } from "pinia";
import { setupAuthGuard } from "@/plugins/authGuard";
import { es } from "primelocale/js/es.js"; // ✅ Correct path for your version
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

app.use(pinia);

// Restore or establish session before setting up router guards
import { useAuthStore } from "@/stores/auth";
const auth = useAuthStore();
auth.restoreSession();

setupAuthGuard(router);
app.use(router);
app.use(PrimeVue, { theme: { preset: Aura }, locale: es });
app.use(ToastService);

app.config.devtools = true;
app.mount("#app");
