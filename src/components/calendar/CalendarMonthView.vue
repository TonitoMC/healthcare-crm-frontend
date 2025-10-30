<template>
  <div class="flex flex-column flex-1 min-h-0 p-3">
    <!-- 🔹 Month Header Row (Weekday labels) -->
    <div
      class="grid text-center text-xs sm:text-sm md:text-base border-bottom-1 surface-border pb-2 mb-3"
    >
      <div
        v-for="day in daysOfWeek"
        :key="day"
        class="col font-medium text-color-secondary"
      >
        {{ day }}
      </div>
    </div>

    <!-- 🔹 Month Grid (Placeholder content) -->
    <div class="grid grid-nogutter flex-1">
      <div
        v-for="n in 42"
        :key="n"
        class="col-12 sm:col-4 md:col-2 border-1 surface-border h-6rem flex align-items-start justify-content-start p-2"
      >
        <span class="text-sm font-medium text-color-secondary">
          {{ n }}
        </span>
      </div>
    </div>

    <!-- Placeholder text below grid -->
    <div class="text-center text-color-secondary mt-3">
      <small>Vista de mes – próximamente contenido dinámico</small>
    </div>
  </div>
</template>

<script setup>
const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
</script>

<style scoped>
.h-6rem {
  height: 6rem;
}
</style>
