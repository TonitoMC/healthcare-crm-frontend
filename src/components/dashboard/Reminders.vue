<template>
  <Card
    class="shadow-1 border-round-lg flex flex-column flex-1 overflow-hidden"
    :pt="{
      body: { class: 'flex flex-column flex-1 min-h-0 overflow-hidden p-0' },
      content: { class: 'flex flex-column flex-1 min-h-0 overflow-hidden' },
    }"
  >
    <template #title>
      <div class="flex justify-content-between align-items-center px-3 pt-3">
        <span class="font-semibold">Recordatorios</span>
        <div class="flex gap-1">
          <Button
            icon="pi pi-refresh"
            rounded
            text
            size="small"
            :loading="isRefreshing"
            @click="refreshReminders"
          />
          <Button
            icon="pi pi-plus"
            rounded
            text
            size="small"
            @click="showAdd = true"
          />
        </div>
      </div>
    </template>

    <template #content>
      <div
        class="flex-1 min-h-0 overflow-hidden flex flex-column px-3 pb-3 pt-2"
      >
        <!-- 🔁 Force TabView to rebuild so it always starts on 'Personales' -->
        <TabView
          :key="tabViewKey"
          v-model:activeIndex="activeTab"
          class="reminders-tabview"
        >
          <TabPanel header="Personales">
            <div class="tab-content-wrapper">
              <ReminderList
                :reminders="personalReminders"
                @toggle="toggleCompleted"
                @delete="deleteReminder"
              />
            </div>
          </TabPanel>

          <TabPanel header="Globales">
            <div class="tab-content-wrapper">
              <ReminderList
                :reminders="globalReminders"
                @toggle="toggleCompleted"
                @delete="deleteReminder"
              />
            </div>
          </TabPanel>
        </TabView>
      </div>

      <!-- Add modal -->
      <SmallModal v-model="showAdd" title="Nuevo Recordatorio">
        <div class="flex flex-column gap-3 p-2">
          <label class="text-sm font-medium">Descripción</label>
          <InputText v-model="newText" placeholder="Texto del recordatorio" />

          <label class="text-sm font-medium">Tipo</label>
          <Dropdown
            v-model="newType"
            :options="[
              { label: 'Personal', value: 'personal' },
              { label: 'Global', value: 'global' },
            ]"
            optionLabel="label"
            optionValue="value"
          />

          <div class="flex justify-content-end gap-2 mt-2">
            <Button
              label="Cancelar"
              severity="secondary"
              outlined
              @click="showAdd = false"
            />
            <Button label="Crear" icon="pi pi-check" @click="addReminder" />
          </div>
        </div>
      </SmallModal>
    </template>
  </Card>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import SmallModal from "@components/SmallModal.vue";
import ReminderList from "@components/dashboard/ReminderList.vue";
import { useToast } from "primevue/usetoast";

import { ReminderService } from "@/services/reminderService";

const toast = useToast();

// 🧠 all reminders from backend
const reminders = ref([]); // [{ id, descripcion, global, fecha_creacion, fecha_completado?, usuario_id? }]

const showAdd = ref(false);
const newText = ref("");
const newType = ref("personal");
const activeTab = ref(0);
const tabViewKey = ref(0); // 👈 used to force TabView to reset
const isRefreshing = ref(false);

// ----------------------------------------------------------
// LOAD INITIAL
// ----------------------------------------------------------
onMounted(async () => {
  await loadReminders();
  // ensure TabView is rebuilt so it respects activeTab = 0
  await nextTick();
  tabViewKey.value++;
});

async function loadReminders() {
  try {
    const data = await ReminderService.list();
    // data from service already normalized to have global/completed/etc
    reminders.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error loading reminders", err);
    toast.add({
      severity: "error",
      summary: "Error cargando recordatorios",
      life: 2500,
    });
  }
}

async function refreshReminders() {
  isRefreshing.value = true;
  try {
    await loadReminders();
    toast.add({
      severity: "success",
      summary: "Recordatorios actualizados",
      life: 2000,
    });
  } finally {
    isRefreshing.value = false;
  }
}

const personalReminders = computed(() =>
  reminders.value.filter((r) => !r.global),
);

const globalReminders = computed(() => reminders.value.filter((r) => r.global));

// ----------------------------------------------------------
// CREATE
// ----------------------------------------------------------
async function addReminder() {
  if (!newText.value.trim()) {
    toast.add({
      severity: "warn",
      summary: "Debe ingresar un texto",
      life: 2000,
    });
    return;
  }

  try {
    const created = await ReminderService.create({
      descripcion: newText.value,
      global: newType.value === "global",
    });

    // Push backend-created reminder (service already normalized if you want)
    reminders.value.push(created);

    toast.add({
      severity: "success",
      summary: "Recordatorio agregado",
      life: 2000,
    });

    newText.value = "";
    newType.value = "personal";
    showAdd.value = false;

    // always bounce back to personales
    activeTab.value = 0;
  } catch (err) {
    console.error(err);
    toast.add({
      severity: "error",
      summary: "Error creando recordatorio",
      life: 2500,
    });
  }
}

// ----------------------------------------------------------
// TOGGLE COMPLETED
// ----------------------------------------------------------
async function toggleCompleted(id) {
  const item = reminders.value.find((r) => r.id === id);
  if (!item) return;

  try {
    if (!item.completed) {
      const updated = await ReminderService.markDone(id);
      item.completed = true;
      item.completedAt =
        updated.fecha_completado ?? updated.completedAt ?? null;
    } else {
      await ReminderService.markUndone(id);
      item.completed = false;
      item.completedAt = null;
    }
  } catch (err) {
    console.error(err);
    toast.add({
      severity: "error",
      summary: "Error actualizando recordatorio",
      life: 2500,
    });
  }
}

// ----------------------------------------------------------
// DELETE
// ----------------------------------------------------------
async function deleteReminder(id) {
  try {
    await ReminderService.remove(id);
    reminders.value = reminders.value.filter((r) => r.id !== id);

    toast.add({
      severity: "success",
      summary: "Recordatorio eliminado",
      life: 2000,
    });
  } catch (err) {
    console.error(err);
    toast.add({
      severity: "error",
      summary: "Error eliminando recordatorio",
      life: 2500,
    });
  }
}
</script>

<style scoped>
.reminders-tabview {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.reminders-tabview :deep(.p-tabview-panels) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0.75rem 0 0 0;
}

.reminders-tabview :deep(.p-tabview-panel) {
  height: 100%;
  min-height: 0;
}

.tab-content-wrapper {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>
