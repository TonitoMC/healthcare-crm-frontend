<template>
  <div class="reminders-container">
    <div v-if="reminders && reminders.length" class="reminders-scroll">
      <div
        v-for="r in reminders"
        :key="r.id"
        class="reminder-item flex justify-content-between align-items-center surface-card p-2 border-round shadow-1 mb-2"
      >
        <!-- Left: checkbox + info -->
        <div class="flex align-items-center gap-2">
          <Checkbox
            :modelValue="!!r.completed || !!r.fecha_completado"
            binary
            @update:modelValue="$emit('toggle', r.id)"
          />
          <div class="flex flex-column gap-1">
            <span
              class="text-sm"
              :class="{
                'line-through text-color-secondary':
                  r.completed || r.fecha_completado,
              }"
            >
              {{ r.descripcion ?? r.text }}
            </span>
            <small class="text-color-secondary text-xs">
              {{ formatDate(r.date || r.fecha_creacion) }}
            </small>
          </div>
        </div>
        <!-- Right: delete -->
        <Button
          icon="pi pi-trash"
          text
          size="small"
          severity="danger"
          @click="$emit('delete', r.id)"
        />
      </div>
    </div>
    <div v-else class="text-center text-color-secondary py-4 text-sm">
      No hay recordatorios.
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import Checkbox from "primevue/checkbox";
import Button from "primevue/button";

defineProps({
  reminders: {
    type: Array,
    required: true,
  },
});

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("es-ES");
}
</script>

<style scoped>
.reminders-container {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.reminders-scroll {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.5rem;
}

.reminder-item:last-child {
  margin-bottom: 0;
}

/* Custom scrollbar styling */
.reminders-scroll::-webkit-scrollbar {
  width: 6px;
}

.reminders-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.reminders-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.reminders-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
