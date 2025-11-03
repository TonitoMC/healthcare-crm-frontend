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

/* make weekday header visually separated */
.month-weekdays {
  background: transparent;
}
.month-weekdays .weekday {
  padding: 0.5rem 0.25rem;
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border, rgba(0,0,0,0.08));
}

/* Month grid: 7 equal columns */
.month-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  border-top: 1px solid var(--surface-border);
  border-left: 1px solid var(--surface-border);
  /* Let rows grow if their content needs more space; prevents clipping of last week cells */
  grid-auto-rows: minmax(6.5rem, auto);
}

.month-cell {
  border-right: 1px solid var(--surface-border, rgba(0,0,0,0.08));
  border-bottom: 1px solid var(--surface-border, rgba(0,0,0,0.08));
  padding: 0.5rem;
  /* remove fixed min-height here — grid-auto-rows controls row height and allows growth */
  min-height: 0;
  cursor: pointer;
  background: var(--surface-card);
  position: relative;
  display: flex;
  flex-direction: column;
}
.month-cell .cell-header,
.month-cell .cell-body {
  /* ensure borders appear distinct by keeping backgrounds transparent inside cells */
  background: transparent;
}

/* Draw thin separators using inset shadows as a fallback for some themes */
.month-grid {
  box-shadow: inset 0 -1px 0 var(--surface-border, rgba(0,0,0,0.06));
}

/* Dark mode: increase border contrast so separators remain visible */
@media (prefers-color-scheme: dark) {
  .month-weekdays .weekday {
    background: rgba(255,255,255,0.02);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .month-cell {
    border-right: 1px solid rgba(255,255,255,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.01);
  }

  .month-grid {
    box-shadow: inset 0 -1px 0 rgba(255,255,255,0.03);
  }

  .month-cell.is-today::after {
    box-shadow: 0 0 0 1px rgba(0,0,0,0.25), 0 0 14px rgba(59,130,246,0.32);
  }
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
  /* allow body to grow and push row height if needed */
  flex: 1 1 auto;
  overflow: hidden;
}
.appt {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

@media (min-width: 768px) {
  .month-grid {
    grid-auto-rows: minmax(7.5rem, auto);
  }
}
@media (min-width: 1200px) {
  .month-grid {
    grid-auto-rows: minmax(9rem, auto);
  }
}
</style>
