<template>
  <Menubar class="surface-card border-bottom-1 surface-border">
    <!-- LEFT SIDE: Search + Nuevo -->
    <template #start>
      <div class="flex align-items-center gap-2">
        <!-- SEARCH -->
        <AutoComplete
          v-model="searchQuery"
          :suggestions="searchResults"
          field="nombre"
          placeholder="Buscar paciente..."
          :minLength="2"
          class="w-15rem md:w-20rem"
          @complete="handleSearch"
          @item-select="onSelectPatient"
          :pt="{
            pcInputText: {
              root: 'w-full p-2 border-round-lg text-sm',
            },
          }"
        >
          <template #option="{ option }">
            <div class="flex align-items-center gap-2 p-1 w-full">
              <div
                class="flex align-items-center justify-content-center bg-primary border-circle text-primary-contrast"
                style="width: 1.7rem; height: 1.7rem"
              >
                <i class="pi pi-user text-xs"></i>
              </div>

              <div class="flex flex-column">
                <span class="font-semibold text-sm">{{ option.nombre }}</span>

                <small class="text-color-secondary text-xs">
                  {{ option.telefono || "Sin teléfono" }} •
                  {{ formatDate(option.fecha_nacimiento) }}
                </small>
              </div>
            </div>
          </template>
        </AutoComplete>

        <!-- NUEVO PATIENTE BUTTON -->
        <Button
          label="Nuevo"
          icon="pi pi-user-plus"
          size="small"
          class="p-button-sm"
          @click="showCreateDialog = true"
        />
      </div>
    </template>

    <!-- RIGHT SIDE: Menu items -->

    <template #end>
      <div class="flex align-items-center gap-2">
        <Button
          v-for="item in menuModel"
          :key="item.label"
          text
          severity="secondary"
          class="p-button-text font-semibold flex align-items-center gap-1"
          @click="item.command"
        >
          <i :class="item.icon" class="text-sm relative" style="top: 1px"></i>
          <span class="text-sm">{{ item.label }}</span>
        </Button>
      </div>
    </template>
  </Menubar>

  <!-- CREATE PATIENT DIALOG -->
  <Dialog
    v-model:visible="showCreateDialog"
    header="Crear Nuevo Paciente"
    modal
    closable
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

// PERMISSIONS → FILTER MENU
const visibleMenu = computed(() => {
  const perms = auth.user?.permissions || [];
  return menuItems.filter((item) =>
    item.permissions?.length
      ? item.permissions.some((p) => perms.includes(p))
      : true,
  );
});

// OUR CUSTOM RIGHT-SIDE BUTTONS
const menuModel = computed(() =>
  visibleMenu.value.map((item) => ({
    label: item.label,
    icon: item.icon,
    command: () => router.push(item.to),
  })),
);

async function handleSearch(event) {
  const query = event?.query?.trim() || "";
  if (query.length < 2) {
    searchResults.value = [];
    return;
  }

  try {
    const results = await PatientService.searchByName(query);

    searchResults.value = Array.isArray(results) ? results.slice(0, 5) : [];
  } catch (err) {
    console.error("Error searching patients:", err);
    searchResults.value = [];
  }
}

function onSelectPatient(event) {
  const patient = event?.value;
  if (patient?.id) {
    searchQuery.value = "";
    searchResults.value = [];
    router.push(`/app/patients/${patient.id}`);
  }
}

function onPatientCreated(p) {
  showCreateDialog.value = false;
  if (p?.id) router.push(`/app/patients/${p.id}`);
}

function formatDate(dateStr) {
  if (!dateStr) return "Fecha desconocida";
  try {
    return new Date(dateStr).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
</script>

<style scoped>
.text-xxs {
  font-size: 0.65rem;
}
</style>
