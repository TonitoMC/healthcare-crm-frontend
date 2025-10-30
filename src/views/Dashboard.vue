<template>
  <!-- 🔹 Outer wrapper: fills full space of router-view -->
  <div class="flex flex-column flex-1 h-full min-h-0">
    <!-- 🔹 Main grid area -->
    <div class="flex flex-column md:flex-row flex-1 min-h-0 gap-3 p-4">
      <!-- 🕒 Left Column -->
      <div class="w-full md:w-4 lg:w-4 flex flex-column min-h-0">
        <div
          class="flex flex-column flex-1 min-h-0 shadow-1 border-round-lg surface-card overflow-y-auto"
        >
          <SingleDayAppointments class="flex-1 min-h-0" />
        </div>
      </div>

      <div class="flex flex-column flex-1 min-h-0 gap-3">
        <!-- Exams -->
        <PendingExams class="flex-1 min-h-0 overflow-hidden" />

        <!-- Reminders (Card lives inside component) -->
        <Reminders class="flex-1 min-h-0 overflow-hidden" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import SingleDayAppointments from "@components/dashboard/SingleDayAppointments.vue";
import PendingExams from "@components/dashboard/PendingExams.vue";
import Reminders from "@components/dashboard/Reminders.vue";
</script>
