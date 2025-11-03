<template>
  <div class="p-3 flex flex-column gap-4 h-full overflow-auto">
    <div class="flex align-items-center justify-content-between">
      <div class="text-2xl font-semibold">Mensajes WhatsApp</div>
      <div class="text-color-secondary">Enviar mensajes desde plantillas</div>
    </div>

    <div class="flex-1 min-h-0 flex flex-column md:flex-row gap-3">
      <div class="w-full md:w-6 flex flex-column gap-3">
        <Card>
          <template #title>
            <div class="flex align-items-center justify-content-between">
              <span class="font-medium">Clientes</span>
              <InputText v-model="filter" placeholder="Buscar cliente..." class="w-12rem" />
            </div>
          </template>
          <template #content>
            <DataTable :value="filteredClients" selectionMode="single" :selection="selectedClient" @selection-change="e => selectedClient = e.value" dataKey="id" responsiveLayout="scroll">
              <Column field="username" header="Usuario" />
              <Column field="phone" header="Teléfono" />
              <Column field="email" header="Email" />
            </DataTable>
          </template>
        </Card>
      </div>

      <div class="w-full md:w-6 flex flex-column gap-3">
        <Card>
          <template #title>
            <div class="flex align-items-center justify-content-between">
              <span class="font-medium">Plantillas</span>
            </div>
          </template>
          <template #content>
            <DataTable :value="templates" dataKey="id" selectionMode="single" :selection="selectedTemplate" @selection-change="e => selectedTemplate = e.value" responsiveLayout="scroll">
              <Column field="nombre" header="Nombre" />
              <Column header="Previsualización">
                <template #body="{ data }">
                  <div class="text-sm text-color-secondary">{{ data.texto }}</div>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>

        <Card>
          <template #title>
            <div class="font-medium">Enviar mensaje</div>
          </template>
          <template #content>
            <div class="flex flex-column gap-3">
              <div class="text-sm text-color-secondary">Cliente seleccionado: <span class="font-medium">{{ selectedClient?.username || '—' }}</span></div>
              <div class="text-sm text-color-secondary">Plantilla: <span class="font-medium">{{ selectedTemplate?.nombre || '—' }}</span></div>

              <label class="text-sm">Texto (puedes editar antes de enviar)</label>
              <textarea v-model="messageText" rows="4" class="p-inputtextarea p-inputtext w-full" />

              <div class="flex justify-content-end gap-2">
                <Button label="Enviar" icon="pi pi-send" :disabled="!canSend" @click="confirmSend" />
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <SmallModal v-model:modelValue="confirmVisible" title="Confirmar envío" width="28rem">
      <div class="flex flex-column gap-3">
        <div>Enviar mensaje a <span class="font-medium">{{ selectedClient?.username }}</span>?</div>
        <div class="text-sm text-color-secondary">{{ messageText }}</div>
        <div class="flex justify-content-end gap-2">
          <Button label="Cancelar" severity="secondary" outlined @click="confirmVisible = false" />
          <Button label="Enviar" icon="pi pi-check" @click="send" />
        </div>
      </div>
    </SmallModal>

    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import SmallModal from '@/components/SmallModal.vue';

import { UserService } from '@/services/userService';
import { WhatsAppService } from '@/services/whatsappService';

const toast = useToast();

const clients = ref([]);
const templates = ref([]);

const selectedClient = ref(null);
const selectedTemplate = ref(null);
const filter = ref('');
const messageText = ref('');
const confirmVisible = ref(false);

const canSend = computed(() => !!selectedClient.value && !!selectedTemplate.value && messageText.value.trim().length > 0);

const filteredClients = computed(() => {
  const q = filter.value.trim().toLowerCase();
  if (!q) return clients.value;
  return clients.value.filter(c => (c.username || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').includes(q));
});

onMounted(async () => {
  // load clients and templates
  try {
    clients.value = await UserService.listUsers();
  } catch (e) {
    clients.value = [];
  }
  templates.value = await WhatsAppService.listTemplates();
});

// keep messageText in sync when template or client changes
watch([selectedTemplate, selectedClient], () => {
  if (selectedTemplate.value) {
    // naive replacement for placeholders
    const name = selectedClient.value?.username || '{{nombre}}';
    messageText.value = selectedTemplate.value.texto.replace('{{nombre}}', name).replace('{{fecha}}', 'DD/MM').replace('{{hora}}', 'HH:MM');
  } else {
    messageText.value = '';
  }
});

function confirmSend() {
  confirmVisible.value = true;
}

async function send() {
  confirmVisible.value = false;
  try {
    const res = await WhatsAppService.sendMessage({ clientId: selectedClient.value.id, templateId: selectedTemplate.value.id, textOverride: messageText.value });
    if (res.success) {
      toast.add({ severity: 'success', summary: 'Mensaje enviado', life: 2000 });
    } else {
      toast.add({ severity: 'error', summary: 'Error enviando', life: 2500 });
    }
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error enviando', life: 2500 });
  }
}
</script>

<style scoped>
.w-12rem { width: 12rem; }
.p-3 { padding: 0.75rem; }
</style>
