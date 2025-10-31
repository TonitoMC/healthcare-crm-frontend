<template>
  <div
    class="flex align-items-center justify-content-center min-h-screen surface-ground px-3"
  >
    <Card
      class="w-full md:w-20rem lg:w-25rem p-4 shadow-3 border-round-lg surface-card"
    >
      <template #title>
        <div class="text-center mb-3">
          <h2 class="m-0 text-2xl md:text-3xl font-semibold">Bienvenido</h2>
          <p class="text-color-secondary m-0 text-sm md:text-base">
            Ingresa tus credenciales para continuar
          </p>
        </div>
      </template>

      <template #content>
        <Form
          v-slot="$form"
          :resolver="resolver"
          :initialValues="initialValues"
          @submit="onFormSubmit"
          mode="submit"
          class="flex flex-column gap-3"
        >
          <!-- Username -->
          <div class="flex flex-column gap-1">
            <InputText
              name="username"
              type="text"
              placeholder="Usuario o Correo Electrónico"
              fluid
            />
            <Message
              v-if="$form.username?.invalid"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.username.error?.message }}
            </Message>
          </div>

          <!-- Password -->
          <div class="flex flex-column gap-1">
            <Password
              name="password"
              placeholder="Contraseña"
              :feedback="false"
              toggleMask
              fluid
            />
            <Message
              v-if="$form.password?.invalid"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.password.error?.message }}
            </Message>
          </div>

          <!-- Submit -->
          <Button
            type="submit"
            label="Ingresar"
            icon="pi pi-sign-in"
            class="w-full"
            :loading="auth.loading"
          />
        </Form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { z } from "zod";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const toast = useToast();
const router = useRouter();
const auth = useAuthStore();

const initialValues = ref({
  username: "",
  password: "",
});

const resolver = ref(
  zodResolver(
    z.object({
      username: z.string().min(1, {
        message: "El nombre de usuario no puede estar vacío.",
      }),
      password: z.string().min(1, {
        message: "La contraseña no puede estar vacía.",
      }),
    }),
  ),
);

// -----------------------------------------------------------------------------
// Submit handler
// -----------------------------------------------------------------------------
const onFormSubmit = async ({ valid, values }) => {
  if (!valid) return;

  try {
    await auth.login(values.username, values.password);

    toast.add({
      severity: "success",
      summary: "Inicio de sesión exitoso",
      detail: `Bienvenido, ${auth.username}`,
      life: 2000,
    });

    router.push("/app/dashboard"); // redirect after login
  } catch (err) {
    console.error("[LoginView] Error:", err);
    toast.add({
      severity: "error",
      summary: "Error de autenticación",
      detail:
        err.response?.data?.error ||
        "Credenciales inválidas o servidor no disponible.",
      life: 3000,
    });
  }
};
</script>
