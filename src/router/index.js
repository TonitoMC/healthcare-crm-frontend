import { createRouter, createWebHistory } from "vue-router";
import Login from "@views/Login.vue";
import Dashboard from "@views/Dashboard.vue";
import Calendar from "@views/Calendar.vue";
import AdminRoles from "@views/AdminRoles.vue";
import WhatsAppMessages from "@views/WhatsAppMessages.vue";
const Profile = () => import("@/views/Profile.vue");
import DefaultLayout from "@layouts/DefaultLayout.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/app",
    component: DefaultLayout,
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: Dashboard,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "calendar",
        name: "Calendar",
        component: Calendar,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "whatsapp",
        name: "WhatsAppMessages",
        component: WhatsAppMessages,
        meta: {
          requiresAuth: true,
          roles: ["admin", "doctor", "assistant"],
        },
      },
      {
        path: "perfil",
        name: "Profile",
        component: Profile,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "admin",
        name: "AdminRoles",
        component: AdminRoles,
        meta: {
          requiresAuth: true,
          roles: ["admin"],
        },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: {
      template:
        '<div class="text-center p-6 text-xl text-color-secondary">Página no encontrada</div>',
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
