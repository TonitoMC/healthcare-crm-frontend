<template>
  <div
    v-if="slot.type === 'appointment'"
    class="p-2 border-round-md shadow-1 surface-card border-1 border-green-200 flex justify-content-between align-items-start gap-2 mb-1 cursor-pointer hover:bg-green-50 transition-colors transition-duration-150"
    @click="handleClick"
  >
    <span
      class="font-medium text-xs text-color line-height-3 flex-1 text-overflow-ellipsis overflow-hidden white-space-nowrap"
    >
      {{ slot.patient }}
    </span>
    <small
      class="text-2xs text-color-secondary white-space-nowrap flex-shrink-0"
    >
      {{ slot.time }}
    </small>
  </div>
  <div
    v-else-if="slot.type === 'dayOff'"
    class="p-2 border-round-md surface-100 flex justify-content-center align-items-center mb-1"
  >
    <span class="italic text-xs text-color-secondary text-center">
      {{ slot.time }}
    </span>
  </div>
  <div
    v-else
    class="p-2 border-round-md border-1 border-dashed surface-100 surface-border flex justify-content-between align-items-start gap-2 mb-1 cursor-pointer hover:surface-200 transition-colors transition-duration-150"
    @click="handleClick"
  >
    <span class="italic text-xs text-color-secondary line-height-3 flex-1">
      Libre
    </span>
    <small
      class="text-2xs text-color-secondary white-space-nowrap flex-shrink-0"
    >
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

const emit = defineEmits(["click"]);

function handleClick() {
  console.log("🟢 [SlotItem] Clicked, emitting to parent:", props.slot);
  emit("click");
}
</script>
