<template>
  <Dialog
    v-model:visible="visible"
    modal
    :style="{ width: '50rem', maxWidth: '95vw' }"
    :pt="{
      root: 'border-round-xl overflow-hidden',
      content: 'px-0 py-0',
    }"
  >
    <!-- HEADER -->
    <template #header>
      <div class="flex align-items-center gap-2">
        <i class="pi pi-stethoscope text-xl"></i>
        <h2 class="m-0 text-lg font-semibold">Diagnósticos y Tratamientos</h2>
      </div>
    </template>

    <!-- BODY + FIXED FOOTER WRAPPER -->
    <div class="flex flex-column" style="max-height: 70vh">
      <!-- SCROLLABLE CONTENT -->
      <ScrollPanel class="flex-1 min-h-0 px-4 py-3 overflow-x-hidden">
        <div class="flex flex-column gap-4">
          <!-- DIAGNOSTICS ACCORDION -->
          <Accordion multiple class="w-full">
            <AccordionTab
              v-for="(diag, dIndex) in diagnostics"
              :key="diag.tempId"
              :header="`Diagnóstico ${dIndex + 1}`"
            >
              <!-- Diagnostic header row inside -->
              <div class="flex justify-content-between align-items-center mb-2">
                <span class="font-semibold text-sm text-700">
                  {{ diag.nombre || "Sin nombre" }}
                </span>
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  size="small"
                  @click="removeDiagnostic(diag)"
                />
              </div>

              <!-- Diagnostic fields -->
              <div class="flex flex-column gap-2 mb-3">
                <InputText
                  v-model="diag.nombre"
                  placeholder="Nombre del diagnóstico"
                  class="w-full"
                />

                <InputText
                  v-model="diag.recomendacion"
                  placeholder="Recomendación (opcional)"
                  class="w-full"
                />
              </div>

              <!-- TREATMENTS SECTION -->
              <h4 class="text-sm font-semibold mb-2">Tratamientos</h4>

              <Accordion multiple>
                <AccordionTab
                  v-for="(t, tIndex) in diag.treatments"
                  :key="t.tempId"
                  :header="`Tratamiento ${tIndex + 1}`"
                >
                  <div class="flex flex-column gap-2">
                    <InputText v-model="t.nombre" placeholder="Nombre" />
                    <InputText
                      v-model="t.componente_activo"
                      placeholder="Componente Activo"
                    />
                    <InputText
                      v-model="t.presentacion"
                      placeholder="Presentación"
                    />
                    <InputText
                      v-model="t.dosificacion"
                      placeholder="Dosificación"
                    />
                    <InputText v-model="t.tiempo" placeholder="Tiempo" />
                    <InputText
                      v-model="t.frecuencia"
                      placeholder="Frecuencia"
                    />

                    <div class="flex justify-content-end">
                      <Button
                        icon="pi pi-trash"
                        label="Eliminar"
                        severity="danger"
                        text
                        size="small"
                        @click="removeTreatment(diag, t)"
                      />
                    </div>
                  </div>
                </AccordionTab>
              </Accordion>

              <!-- Add treatment -->
              <Button
                label="Añadir Tratamiento"
                icon="pi pi-plus"
                text
                size="small"
                class="mt-2"
                @click="addTreatment(diag)"
              />
            </AccordionTab>
          </Accordion>

          <!-- Add diagnostic (bottom) -->
          <div class="flex justify-content-center mt-3">
            <Button
              label="Añadir Diagnóstico"
              icon="pi pi-plus"
              size="small"
              @click="addDiagnostic"
            />
          </div>
        </div>
      </ScrollPanel>

      <!-- FIXED FOOTER -->
      <div
        class="flex justify-content-end gap-2 border-top-1 surface-border p-3"
      >
        <Button label="Cerrar" text severity="secondary" @click="close" />
        <Button
          label="Guardar"
          icon="pi pi-check"
          severity="success"
          @click="saveAll"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import ScrollPanel from "primevue/scrollpanel";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import { ConsultationService } from "@/services/consultationService";
import { useToast } from "primevue/usetoast";
import { getErrorMessage } from "@/utils/errorMessages";

const props = defineProps({
  visible: Boolean,
  consultationId: Number,
});

const emit = defineEmits(["update:visible", "saved"]);

const toast = useToast();

const visible = computed({
  get: () => props.visible,
  set: (v) => emit("update:visible", v),
});

const diagnostics = ref([]);

let tempId = 1;
const nextId = () => tempId++;

// Reset state when modal opens
watch(
  () => props.visible,
  (v) => {
    if (v) {
      diagnostics.value = [];
      tempId = 1;
      addDiagnostic(); // start with one diagnostic so it's not empty af
    }
  },
);

// Add diagnostic
function addDiagnostic() {
  diagnostics.value.push({
    tempId: nextId(),
    nombre: "",
    recomendacion: "",
    treatments: [],
  });
}

function removeDiagnostic(diag) {
  diagnostics.value = diagnostics.value.filter((d) => d.tempId !== diag.tempId);
}

function addTreatment(diag) {
  diag.treatments.push({
    tempId: nextId(),
    nombre: "",
    componente_activo: "",
    presentacion: "",
    dosificacion: "",
    tiempo: "",
    frecuencia: "",
  });
}

function removeTreatment(diag, t) {
  diag.treatments = diag.treatments.filter((x) => x.tempId !== t.tempId);
}

async function saveAll() {
  try {
    for (const diag of diagnostics.value) {
      // Skip completely empty diagnostics
      if (!diag.nombre && !diag.recomendacion && diag.treatments.length === 0) {
        continue;
      }

      const { id: diagId } = await ConsultationService.createDiagnostic(
        props.consultationId,
        {
          nombre: diag.nombre,
          recomendacion: diag.recomendacion || null,
        },
      );

      for (const t of diag.treatments) {
        // Skip empty treatments
        if (
          !t.nombre &&
          !t.componente_activo &&
          !t.presentacion &&
          !t.dosificacion &&
          !t.tiempo &&
          !t.frecuencia
        ) {
          continue;
        }

        await ConsultationService.createTreatment(
          props.consultationId,
          diagId,
          {
            nombre: t.nombre,
            componente_activo: t.componente_activo,
            presentacion: t.presentacion,
            dosificacion: t.dosificacion,
            tiempo: t.tiempo,
            frecuencia: t.frecuencia,
          },
        );
      }
    }

    toast.add({
      severity: "success",
      summary: "Guardado",
      detail: "Diagnósticos y tratamientos guardados correctamente.",
      life: 2500,
    });

    emit("saved");
    visible.value = false;
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: getErrorMessage(e),
      life: 4000,
    });
  }
}

function close() {
  visible.value = false;
}
</script>

<style scoped>
:deep(.p-accordion-header-link) {
  border-radius: 0.75rem;
}
</style>
