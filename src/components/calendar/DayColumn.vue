<template>
  <div
    class="col flex flex-column min-h-0 p-2 surface-card border-round-lg shadow-1 overflow-auto"
  >
    <div
      v-for="(group, gi) in slots"
      :key="'group-' + gi"
      class="flex flex-column mb-2 p-2 border-round-lg transition-all"
      :class="[
        group.type === 'workingRange'
          ? 'surface-50 border-1 border-gray-200'
          : '',
      ]"
    >
      <!-- Label for working block -->
      <div
        v-if="group.type === 'workingRange'"
        class="text-2xs text-color-secondary mb-2 font-semibold opacity-70"
      >
        {{ group.label }}
      </div>

      <div v-for="slot in group.slots" :key="slot.time" class="mb-1">
        <SlotItem :slot="slot" />
      </div>
    </div>
  </div>
</template>

<script setup>
import SlotItem from "@/components/calendar/SlotItem.vue";
defineProps({ slots: Array });
</script>
