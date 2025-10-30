import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router/index.js";

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

app.use(router);
app.use(PrimeVue, { theme: { preset: Aura } });
app.use(ToastService);

app.config.devtools = true;
app.mount("#app");
