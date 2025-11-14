<template>
  <Card
    class="questionnaire-card border-round-lg"
    :class="{ 'card-inactive': !questionnaire.activo }"
    :pt="{
      root: { class: 'shadow-1 hover:shadow-2 transition-all duration-150' },
      body: { class: 'p-0' },
    }"
  >
    <!-- Header -->
    <template #header>
      <div
        class="flex justify-content-between align-items-center px-3 py-2 border-bottom-1 surface-border bg-surface-50"
      >
        <div class="flex align-items-center gap-2">
          <Tag
            :value="`v${questionnaire.version}`"
            severity="info"
            class="text-xs px-2 py-1"
          />
          <Tag
            :value="`ID ${questionnaire.id}`"
            severity="secondary"
            class="text-xs px-2 py-1"
          />
        </div>

        <Tag
          :value="questionnaire.activo ? 'Activo' : 'Inactivo'"
          :severity="questionnaire.activo ? 'success' : 'danger'"
          :icon="questionnaire.activo ? 'pi pi-check' : 'pi pi-ban'"
          class="text-xs px-2 py-1"
        />
      </div>
    </template>

    <!-- Buttons -->
    <template #content>
      <div class="p-3 flex flex-column gap-2">
        <Button
          label="Ver Preguntas"
          icon="pi pi-eye"
          outlined
          severity="secondary"
          class="w-full text-sm justify-content-start"
          @click="$emit('view-details')"
        />

        <Button
          label="Editar"
          icon="pi pi-pencil"
          severity="primary"
          class="w-full text-sm justify-content-start"
          @click="$emit('edit')"
        />

        <Button
          :label="questionnaire.activo ? 'Desactivar' : 'Activar'"
          :icon="questionnaire.activo ? 'pi pi-ban' : 'pi pi-check'"
          class="w-full text-sm justify-content-start"
          outlined
          :severity="questionnaire.activo ? 'warning' : 'success'"
          @click="$emit('toggle-active')"
        />
      </div>
    </template>
  </Card>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import Tag from "primevue/tag";

defineProps({
  questionnaire: { type: Object, required: true },
});

defineEmits(["edit", "toggle-active", "view-details"]);
</script>

<style scoped>
.questionnaire-card {
  height: 100%;
}

/* subtle inactive look without looking disabled */
.card-inactive {
  opacity: 0.75;
  filter: grayscale(0.15);
}
</style>
