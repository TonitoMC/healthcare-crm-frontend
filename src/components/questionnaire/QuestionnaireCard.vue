<template>
  <Card
    class="questionnaire-card"
    :class="{ 'card-inactive': !questionnaire.activo }"
    :pt="{
      root: { class: 'shadow-2 hover:shadow-4 transition-all transition-duration-300' },
      body: { class: 'p-4' },
      title: { class: 'text-xl font-semibold mb-3' },
      content: { class: 'p-0' },
    }"
  >
    <template #header>
      <div class="flex justify-content-between align-items-center p-3 border-bottom-1 surface-border">
        <div class="flex gap-2">
          <Tag :value="questionnaire.version" severity="info" class="font-semibold" />
          <Tag :value="`ID: ${questionnaire.id}`" severity="secondary" class="text-xs" />
        </div>
        <Tag
          :value="questionnaire.activo ? 'Activo' : 'Inactivo'"
          :severity="questionnaire.activo ? 'success' : 'danger'"
          :icon="questionnaire.activo ? 'pi pi-check-circle' : 'pi pi-times-circle'"
        />
      </div>
    </template>

    <template #content>
      <div class="flex flex-column gap-3">
        <Button
          label="Ver Preguntas"
          icon="pi pi-eye"
          outlined
          severity="secondary"
          class="w-full"
          @click="$emit('view-details')"
        />

        <Button
          label="Editar"
          icon="pi pi-pencil"
          severity="primary"
          class="w-full"
          @click="$emit('edit')"
        />

        <Button
          :label="questionnaire.activo ? 'Desactivar' : 'Activar'"
          :icon="questionnaire.activo ? 'pi pi-ban' : 'pi pi-check'"
          :severity="questionnaire.activo ? 'warning' : 'success'"
          outlined
          class="w-full"
          @click="$emit('toggle-active')"
        />
      </div>
    </template>
  </Card>
</template>

<script setup>
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

defineProps({
  questionnaire: {
    type: Object,
    required: true,
  },
})

defineEmits(['edit', 'toggle-active', 'view-details'])
</script>

<style scoped>
.questionnaire-card {
  height: 100%;
}

.card-inactive {
  opacity: 0.7;
}

.card-inactive :deep(.p-card-body) {
  background: var(--surface-100);
}
</style>
