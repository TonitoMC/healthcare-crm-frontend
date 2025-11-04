<template>
  <div class="p-3 flex flex-column gap-4 h-full overflow-auto">
    <div class="profile-container">
      <Card>
        <template #title>Perfil de usuario</template>
        <template #content>
          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="flex flex-column gap-3">
                <div class="flex flex-column gap-1">
                  <span class="text-sm text-color-secondary">Usuario</span>
                  <InputText :value="auth.username" disabled />
                </div>
                <div class="flex flex-column gap-1">
                  <span class="text-sm text-color-secondary">Roles</span>
                  <div class="flex gap-2 flex-wrap">
                    <Tag v-for="r in auth.roles" :key="r" :value="r" />
                  </div>
                </div>
                <div class="flex flex-column gap-1">
                  <span class="text-sm text-color-secondary">Permisos</span>
                  <div class="flex gap-2 flex-wrap">
                    <Tag
                      v-for="p in auth.permissions"
                      :key="p"
                      :value="p"
                      severity="secondary"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 md:col-6">
              <div class="flex flex-column gap-3">
                <div class="text-lg font-medium">Seguridad</div>
                <div class="flex align-items-end gap-2">
                  <Password
                    v-model="passwords.current"
                    toggleMask
                    :feedback="false"
                    placeholder="Contraseña actual"
                    class="w-full"
                  />
                </div>
                <div class="flex align-items-end gap-2">
                  <Password
                    v-model="passwords.new1"
                    toggleMask
                    :feedback="false"
                    placeholder="Nueva contraseña"
                    class="w-full"
                  />
                </div>
                <div class="flex align-items-end gap-2">
                  <Password
                    v-model="passwords.new2"
                    toggleMask
                    :feedback="false"
                    placeholder="Confirmar nueva contraseña"
                    class="w-full"
                  />
                </div>
                <div class="flex justify-content-end gap-2">
                  <Button
                    label="Actualizar"
                    icon="pi pi-save"
                    @click="updatePassword"
                  />
                </div>
              </div>
            </div>
          </div>
          <Divider />
          <div class="flex justify-content-between">
            <div class="text-color-secondary">
              Sesión iniciada como
              <span class="font-medium">{{ auth.username }}</span>
            </div>
            <Button
              label="Cerrar sesión"
              icon="pi pi-sign-out"
              severity="secondary"
              outlined
              @click="logout"
            />
          </div>
        </template>
      </Card>
    </div>
    <Toast />
  </div>
</template>

<script setup>
import { reactive } from "vue";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import Tag from "primevue/tag";
import Divider from "primevue/divider";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();
const toast = useToast();

const passwords = reactive({ current: "", new1: "", new2: "" });

function logout() {
  // ✅ show toast BEFORE clearing user
  toast.add({
    severity: "info",
    summary: "Cierre de sesión",
    detail: `Hasta luego, ${auth.username}! 👋`,
    life: 2500,
  });

  auth.logout();
  router.push("/login");
}

function updatePassword() {
  if (!passwords.new1 || passwords.new1 !== passwords.new2) {
    toast.add({
      severity: "warn",
      summary: "Las contraseñas no coinciden",
      life: 2500,
    });
    return;
  }
  // Placeholder: aquí llamaríamos a un UserService.updatePassword
  toast.add({
    severity: "success",
    summary: "Contraseña actualizada",
    life: 2000,
  });
  passwords.current = passwords.new1 = passwords.new2 = "";
}
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}
</style>
