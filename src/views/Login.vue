<template>
  <div
    class="flex align-items-center justify-content-center min-h-screen surface-ground px-3"
  >
    <Card class="w-full max-w-25rem p-4 shadow-3 border-round-lg surface-card">
      <template #title>
        <div class="text-center mb-3">
          <h2 class="m-0">Bienvenido</h2>
          <p class="text-color-secondary m-0 text-base">
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

          <Button
            type="submit"
            label="Ingresar"
            icon="pi pi-sign-in"
            class="w-full"
          />
        </Form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { useToast } from "primevue/usetoast";
import { z } from "zod";

const toast = useToast();

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
      password: z
        .string()
        .min(1, { message: "La contraseña no puede estar vacía." }),
    }),
  ),
);

const onFormSubmit = ({ valid }) => {
  if (valid) {
    toast.add({
      severity: "success",
      summary: "Login Exitoso",
      life: 2000,
    });
  }
};
</script>
