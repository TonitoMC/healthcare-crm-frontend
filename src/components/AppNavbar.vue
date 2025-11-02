<template>
  <TabMenu
    :model="menuModel"
    class="w-full justify-content-start"
    activeIndex="0"
  />
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import TabMenu from "primevue/tabmenu";
import { menuItems } from "@config/menuItems.js";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();

// Filter items by user's roles from the auth store
const visibleMenu = computed(() => {
  const userRoles = Array.isArray(auth.roles) ? auth.roles : [];
  return menuItems.filter((item) =>
    Array.isArray(item.roles) ? item.roles.some((r) => userRoles.includes(r)) : true,
  );
});

// Map to TabMenu format
const menuModel = computed(() =>
  visibleMenu.value.map((item) => ({
    label: item.label,
    icon: item.icon,
    command: () => router.push(item.to),
  })),
);
</script>
