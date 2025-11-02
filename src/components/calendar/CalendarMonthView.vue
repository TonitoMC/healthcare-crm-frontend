<template>
  <div class="flex flex-column flex-1 min-h-0 p-3">
    <!-- Weekday labels -->
    <div class="month-weekdays">
      <div v-for="day in daysOfWeek" :key="day" class="weekday text-color-secondary">{{ day }}</div>
    </div>

    <!-- Dynamic month grid (7 columns) -->
    <div class="month-grid">
      <div
        v-for="cell in monthCells"
        :key="cell.iso"
        class="month-cell"
        :class="{ 'is-today': isToday(cell.date), 'is-out': !cell.isCurrentMonth }"
        @click="openDay(cell)"
      >
        <div class="cell-header">
          <span class="day">{{ cell.day }}</span>
          <Tag v-if="cell.count > 0" :value="String(cell.count)" severity="success" rounded />
        </div>

        <div class="cell-body">
          <div v-for="(a, idx) in cell.sampleAppointments" :key="idx" class="appt truncate">
            <i class="pi pi-clock mr-1 text-xs"></i>{{ a.start }} · {{ a.patient }}
          </div>
        </div>
      </div>
    </div>

    <CalendarDayDialog />
  </div>
</template>

<script setup>
import { computed } from "vue";
import CalendarDayDialog from "@/components/calendar/CalendarDayDialog.vue";
import { currentDate, selectedDate, dayDialogVisible } from "@/composables/useCalendarState";
import { useAppointments } from "@/composables/useAppointments";
import Tag from "primevue/tag";

const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const { listForDate, listBetween } = useAppointments();

function startOfGrid(date) {
  const d = new Date(date instanceof Date ? date : new Date(date));
  d.setDate(1);
  // move to Monday-based start
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isToday(date) {
  const d = new Date(date);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

const monthCells = computed(() => {
  const base = currentDate.value instanceof Date ? new Date(currentDate.value) : new Date(currentDate.value);
  const start = startOfGrid(base);
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const appts = listForDate(iso);
    cells.push({
      date: d,
      iso,
      day: d.getDate(),
      isCurrentMonth: d.getMonth() === base.getMonth(),
      count: appts.length,
      sampleAppointments: appts.slice(0, 2),
    });
  }
  return cells;
});

function openDay(cell) {
  selectedDate.value = cell.iso;
  dayDialogVisible.value = true;
}
</script>

<style scoped>
/* Weekday header: 7 columns */
.month-weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.25rem;
  padding: 0 0.25rem 0.5rem 0.25rem;
}
.weekday {
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Month grid: 7 equal columns */
.month-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  border-top: 1px solid var(--surface-border);
  border-left: 1px solid var(--surface-border);
}

.month-cell {
  border-right: 1px solid var(--surface-border);
  border-bottom: 1px solid var(--surface-border);
  padding: 0.5rem;
  min-height: 6.5rem;
  cursor: pointer;
  background: var(--surface-card);
  position: relative;
}
.month-cell:hover {
  background: var(--surface-100);
}
.month-cell.is-out {
  background: var(--surface-50);
}
.month-cell.is-today::after {
  content: "";
  position: absolute;
  inset: 4px;
  border: 2px solid var(--primary-color, var(--primary-500, #3B82F6));
  border-radius: 8px;
  pointer-events: none;
  /* Slight glow for dark mode to increase contrast */
  box-shadow: 0 0 0 1px rgba(0,0,0,0.1), 0 0 8px rgba(59,130,246,0.25);
}
.month-cell.is-today {
  /* subtle surface lift so it pops on dark and light */
  background: var(--surface-100);
}

.cell-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.cell-header .day {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  font-weight: 600;
}
.month-cell.is-today .cell-header .day {
  color: var(--primary-color, var(--primary-500, #3B82F6));
}

.cell-body {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.appt {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
}

@media (min-width: 768px) {
  .month-cell { min-height: 7.5rem; }
}
@media (min-width: 1200px) {
  .month-cell { min-height: 9rem; }
}
</style>
