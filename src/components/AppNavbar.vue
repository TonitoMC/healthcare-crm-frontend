<template>
  <TabMenu
    :model="menuModel"
    class="w-full justify-content-start"
    activeIndex="0"
  />
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import TabMenu from "primevue/tabmenu";
import { menuItems } from "@config/menuItems.js";

const router = useRouter();
const userRole = ref("admin");

// Filter items by role
const visibleMenu = computed(() =>
  menuItems.filter((item) => item.roles.includes(userRole.value)),
);

// Map to TabMenu format
const menuModel = computed(() =>
  visibleMenu.value.map((item) => ({
    label: item.label,
    icon: item.icon,
    command: () => router.push(item.to),
  })),
);
</script>
