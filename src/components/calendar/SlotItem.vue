<template>
  <div
    v-if="slot.type === 'appointment'"
    class="p-2 border-round-md shadow-1 surface-card border-1 border-primary flex justify-content-between align-items-center mb-1 cursor-pointer hover:surface-hover transition-colors transition-duration-150"
    @click="handleClick"
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
    class="p-2 border-round-md border-1 border-dashed surface-100 surface-border flex justify-content-between align-items-center mb-1 cursor-pointer hover:surface-hover transition-colors transition-duration-150"
    @click="handleClick"
  >
    <span class="italic text-xs md:text-sm text-color-secondary"> Libre </span>
    <small class="text-2xs md:text-xs text-color-secondary">
      {{ slot.time }}
    </small>
  </div>
</template>

<script setup>
const props = defineProps({
  slot: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['click']);

function handleClick() {
  console.log('🟢 [SlotItem] Clicked, emitting to parent:', props.slot);
  emit('click');
}
</script>
