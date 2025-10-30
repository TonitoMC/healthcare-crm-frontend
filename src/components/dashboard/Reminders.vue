<template>
  <Card
    class="shadow-1 border-round-lg flex flex-column flex-1 overflow-hidden"
    :pt="{
      body: { class: 'flex flex-column flex-1 min-h-0 overflow-hidden' },
      content: { class: 'flex flex-column flex-1 min-h-0 overflow-hidden' },
    }"
  >
    <template #title>
      <div class="flex justify-content-between align-items-center">
        <span class="font-semibold">Recordatorios</span>
        <Button
          icon="pi pi-plus"
          rounded
          text
          size="small"
          @click="showAdd = true"
        />
      </div>
    </template>

    <template #content>
      <div class="flex-1 min-h-0 overflow-y-auto p-3">
        <!-- ✅ Force re-render via :key -->
        <TabView :key="tabViewKey" v-model:activeIndex="activeTab">
          <TabPanel header="Personales">
            <ReminderList
              :reminders="personalReminders"
              @toggle="toggleCompleted"
              @delete="deleteReminder"
            />
          </TabPanel>

          <TabPanel header="Globales">
            <ReminderList
              :reminders="globalReminders"
              @toggle="toggleCompleted"
              @delete="deleteReminder"
            />
          </TabPanel>
        </TabView>
      </div>

      <!-- ➕ Add modal -->
      <SmallModal v-model="showAdd" title="Nuevo Recordatorio">
        <!-- form unchanged -->
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
import {
  getGlobalReminders,
  saveGlobalReminder,
} from "@services/reminderService.js";

const toast = useToast();
const reminders = ref([]);
const globalReminders = ref([]);
const showAdd = ref(false);
const newText = ref("");
const newPriority = ref(null);
const newType = ref("personal");
const activeTab = ref(0);
const tabViewKey = ref(0); // ✅ used to force re-render

onMounted(async () => {
  const saved = localStorage.getItem("personalReminders");
  if (saved) reminders.value = JSON.parse(saved);
  globalReminders.value = await getGlobalReminders();

  // ✅ force TabView to rebuild after DOM is stable
  await nextTick();
  tabViewKey.value++;
});

const personalReminders = computed(() =>
  reminders.value.filter((r) => !r.completed),
);
const globalList = computed(() =>
  globalReminders.value.filter((r) => !r.completed),
);

const addReminder = async () => {
  const reminder = {
    id: Date.now(),
    text: newText.value,
    priority: newPriority.value,
    type: newType.value,
    completed: false,
    date: new Date().toLocaleDateString("es-ES"),
  };

  if (newType.value === "personal") {
    reminders.value.push(reminder);
  } else {
    globalReminders.value = await saveGlobalReminder(reminder);
  }

  toast.add({
    severity: "success",
    summary: "Recordatorio agregado",
    life: 2500,
  });
  newText.value = "";
  newPriority.value = null;
  newType.value = "personal";
  showAdd.value = false;

  // Always go back to the first tab
  activeTab.value = 0;
};
</script>
