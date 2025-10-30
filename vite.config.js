import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";
import vueDevTools from "vite-plugin-vue-devtools";

import { fileURLToPath, URL } from "node:url";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Components({ resolvers: [PrimeVueResolver()] }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@components": fileURLToPath(
        new URL("./src/components", import.meta.url),
      ),
      "@views": fileURLToPath(new URL("./src/views", import.meta.url)),
      "@router": fileURLToPath(new URL("./src/router", import.meta.url)),
      "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
      "@layouts": fileURLToPath(new URL("./src/layouts", import.meta.url)),
      "@config": fileURLToPath(new URL("./src/config", import.meta.url)),
      "@services": fileURLToPath(new URL("./src/services", import.meta.url)),
      "@composables": fileURLToPath(
        new URL("./src/composables", import.meta.url),
      ),
    },
  },
});
