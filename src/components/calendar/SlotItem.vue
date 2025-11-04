<template>
  <div
    v-if="slot.type === 'appointment'"
    class="p-2 border-round-md shadow-1 bg-primary-50 flex justify-content-between align-items-center mb-1"
  >
    <span class="font-medium text-xs md:text-sm text-color truncate">
      {{ slot.patient }}
    </span>
    <small class="text-2xs md:text-xs text-color-secondary">
      {{ slot.time }}
    </small>
  </div>

  <div
    v-else
    class="p-2 border-round-md border-1 border-dashed surface-100 border-gray-300 flex justify-content-between align-items-center mb-1"
  >
    <span class="italic text-xs md:text-sm text-color-secondary"> Libre </span>
    <small class="text-2xs md:text-xs text-color-secondary">
      {{ slot.time }}
    </small>
  </div>
</template>

<script setup>
defineProps({
  slot: {
    type: Object,
    required: true,
  },
});
</script>
