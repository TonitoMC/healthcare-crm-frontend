<template>
  <div class="app-navbar-container">
    <div class="navbar-content">
      <!-- Logo/Brand Section -->
      <div class="navbar-brand">
        <i class="pi pi-heart-fill text-primary text-2xl mr-2"></i>
        <span class="font-bold text-xl hidden md:inline">Healthcare CRM</span>
      </div>

      <!-- Global Search -->
      <div class="search-container">
        <AutoComplete
          v-model="searchQuery"
          :suggestions="searchResults"
          @complete="handleSearch"
          @item-select="onSelectPatient"
          placeholder="Buscar paciente..."
          :minLength="3"
          :delay="300"
          optionLabel="nombre"
          class="w-full"
          :pt="{
            input: { class: 'w-full' },
            panel: { class: 'search-results-panel' }
          }"
        >
          <template #option="{ option }">
            <div class="search-result-item">
              <div class="flex flex-column">
                <span class="font-semibold">{{ option.nombre }}</span>
                <small class="text-color-secondary">
                  {{ option.email || 'Sin email' }} • Tel: {{ option.telefono || '-' }}
                </small>
              </div>
            </div>
          </template>
        </AutoComplete>
      </div>

      <!-- Navigation Tabs -->
      <TabMenu
        :model="menuModel"
        class="flex-1 navbar-tabs"
        activeIndex="0"
      />

      <!-- New Patient Button -->
      <Button
        label="Nuevo Paciente"
        icon="pi pi-user-plus"
        @click="showCreateDialog = true"
        class="new-patient-btn"
        size="small"
      />
    </div>

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
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import TabMenu from "primevue/tabmenu";
import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import PatientQuickForm from "@/components/patient/PatientQuickForm.vue";
import { menuItems } from "@config/menuItems.js";
import { useAuthStore } from "@/stores/auth";
import { PatientService } from "@/services/patientService";

const router = useRouter();
const auth = useAuthStore();

// Search state
const searchQuery = ref('');
const searchResults = ref([]);
const showCreateDialog = ref(false);

// Filter items by user's roles from the auth store
const visibleMenu = computed(() => {
  const userRoles = Array.isArray(auth.roles) ? auth.roles : [];
  return menuItems.filter((item) =>
    Array.isArray(item.roles) ? item.roles.some((r) => userRoles.includes(r)) : true,
  );
});

// Map to TabMenu format
const menuModel = computed(() =>
  visibleMenu.value.map((item) => ({
    label: item.label,
    icon: item.icon,
    command: () => router.push(item.to),
  })),
);

// Search functionality
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
    console.error('Error searching patients:', e);
    searchResults.value = [];
  }
}

function onSelectPatient(event) {
  const patient = event.value;
  if (patient && patient.id) {
    searchQuery.value = '';
    searchResults.value = [];
    router.push(`/app/patients/${patient.id}`);
  }
}

// Create patient functionality
function onPatientCreated(newPatient) {
  showCreateDialog.value = false;
  if (newPatient && newPatient.id) {
    router.push(`/app/patients/${newPatient.id}`);
  }
}
</script>

<style scoped>
.app-navbar-container {
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  padding: 0.5rem 1rem;
}

.navbar-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 1600px;
  margin: 0 auto;
}

.navbar-brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.search-container {
  min-width: 250px;
  max-width: 400px;
  flex-shrink: 0;
}

.navbar-tabs {
  flex: 1;
  min-width: 0;
}

.new-patient-btn {
  flex-shrink: 0;
}

.search-result-item {
  padding: 0.5rem;
  cursor: pointer;
}

.search-result-item:hover {
  background: var(--surface-hover);
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .navbar-content {
    flex-wrap: wrap;
  }
  
  .navbar-brand span {
    display: none;
  }
  
  .search-container {
    order: 3;
    width: 100%;
    max-width: 100%;
    margin-top: 0.5rem;
  }
  
  .navbar-tabs {
    order: 1;
    flex: 1;
  }
  
  .new-patient-btn {
    order: 2;
  }
}

@media (max-width: 576px) {
  .new-patient-btn :deep(.p-button-label) {
    display: none;
  }
}
</style>
