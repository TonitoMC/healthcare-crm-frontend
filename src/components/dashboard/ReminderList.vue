<template>
  <div v-if="reminders?.length" class="flex flex-column gap-2">
    <div
      v-for="r in reminders"
      :key="r.id"
      class="flex justify-content-between align-items-center surface-ground p-2 border-round"
    >
      <!-- Left: checkbox + info -->
      <div class="flex align-items-center gap-2">
        <Checkbox
          v-model="r.completed"
          binary
          @change="$emit('toggle', r.id)"
        />
        <div class="flex flex-column">
          <span :class="{ 'line-through text-color-secondary': r.completed }">
            {{ r.text }}
          </span>
          <small class="text-color-secondary">{{ r.date }}</small>
        </div>
      </div>

      <!-- Right: priority + delete -->
      <div class="flex align-items-center gap-2">
        <Tag
          :value="r.priority"
          :severity="priorityColor(r.priority)"
          rounded
          class="text-xs"
        />
        <Button
          icon="pi pi-trash"
          text
          size="small"
          severity="danger"
          @click="$emit('delete', r.id)"
        />
      </div>
    </div>
  </div>

  <div v-else class="text-center text-color-secondary py-3">
    No hay recordatorios.
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import Checkbox from "primevue/checkbox";
import Tag from "primevue/tag";
import Button from "primevue/button";

defineProps({
  reminders: {
    type: Array,
    required: true,
  },
});

const priorityColor = (priority) => {
  switch (priority) {
    case "Alta":
      return "danger";
    case "Media":
      return "warning";
    case "Baja":
      return "info";
    default:
      return "secondary";
  }
};
</script>
