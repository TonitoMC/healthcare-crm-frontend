<template>
  <Menubar
    :model="menuModel"
    class="surface-card border-bottom-1 surface-border"
  >
    <template #start>
      <!-- Brand / Search -->
      <div class="flex align-items-center gap-3">
        <AutoComplete
          v-model="searchQuery"
          :suggestions="searchResults"
          field="nombre"
          placeholder="Buscar paciente..."
          class="w-15rem md:w-20rem"
          @complete="handleSearch"
          @item-select="onSelectPatient"
        />
      </div>
    </template>

    <template #end>
      <Button
        label="Nuevo Paciente"
        icon="pi pi-user-plus"
        size="small"
        class="p-button-sm"
        @click="showCreateDialog = true"
      />
    </template>
  </Menubar>

  <!-- Create Patient Dialog -->
  <Dialog
    v-model:visible="showCreateDialog"
    header="Crear Nuevo Paciente"
    :modal="true"
    :closable="true"
    :draggable="false"
  >
    <PatientQuickForm
      @success="onPatientCreated"
      @cancel="showCreateDialog = false"
    />
  </Dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Menubar from "primevue/menubar";
import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import PatientQuickForm from "@/components/patient/PatientQuickForm.vue";
import { menuItems } from "@config/menuItems.js";
import { useAuthStore } from "@/stores/auth";
import { PatientService } from "@/services/patientService";

const router = useRouter();
const auth = useAuthStore();

const searchQuery = ref("");
const searchResults = ref([]);
const showCreateDialog = ref(false);

// filter by user roles
const visibleMenu = computed(() => {
  const userRoles = Array.isArray(auth.roles) ? auth.roles : [];
  return menuItems.filter((item) =>
    Array.isArray(item.roles)
      ? item.roles.some((r) => userRoles.includes(r))
      : true,
  );
});

// map to PrimeVue Menubar model
const menuModel = computed(() =>
  visibleMenu.value.map((item) => ({
    label: item.label,
    icon: item.icon,
    command: () => router.push(item.to),
  })),
);

// search logic
async function handleSearch(event) {
  const query = event.query?.trim();
  if (!query || query.length < 3) {
    searchResults.value = [];
    return;
  }

  try {
    const results = await PatientService.searchByName(query);
    searchResults.value = Array.isArray(results) ? results : [];
  } catch (e) {
    console.error("Error searching patients:", e);
    searchResults.value = [];
  }
}

function onSelectPatient(event) {
  const patient = event.value;
  if (patient && patient.id) {
    searchQuery.value = "";
    searchResults.value = [];
    router.push(`/app/patients/${patient.id}`);
  }
}

function onPatientCreated(newPatient) {
  showCreateDialog.value = false;
  if (newPatient && newPatient.id) {
    router.push(`/app/patients/${newPatient.id}`);
  }
}
</script>
