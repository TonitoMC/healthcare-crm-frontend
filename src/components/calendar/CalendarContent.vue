<template>
  <div class="flex flex-column flex-1 min-h-0">
    <CalendarMonthView
      v-if="currentView === 'month'"
      :current-date="currentDate"
    />
    <CalendarWeekView
      v-else-if="currentView === 'week'"
      :current-date="currentDate"
    />
  </div>
</template>

<script setup>
import { currentView, currentDate } from "@/composables/useCalendarState";
import CalendarMonthView from "@components/calendar/CalendarMonthView.vue";
import CalendarWeekView from "@components/calendar/CalendarWeekView.vue";
</script>
