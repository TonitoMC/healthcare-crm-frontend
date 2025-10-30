<template>
  <!-- 🔹 Outer wrapper: fills full space of router-view -->
  <div class="flex flex-column flex-1 h-full min-h-0">
    <!-- 🔹 Main grid area -->
    <div class="flex flex-column flex-1 min-h-0 gap-3 p-4">
      <!-- 📅 Calendar Column (single full card column) -->
      <div class="flex flex-column flex-1 min-h-0 gap-3">
        <!-- Header card -->
        <div
          class="flex flex-column flex-none shadow-1 border-round-lg surface-card"
        >
          <CalendarHeader />
        </div>

        <!-- Content card -->
        <div
          class="flex flex-column flex-1 min-h-0 shadow-1 border-round-lg surface-card overflow-hidden"
        >
          <CalendarContent class="flex-1 min-h-0" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import CalendarHeader from "@components/calendar/CalendarHeader.vue";
import CalendarContent from "@components/calendar/CalendarContent.vue";
</script>
