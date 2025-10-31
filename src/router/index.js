import { createRouter, createWebHistory } from "vue-router";
import Login from "@views/Login.vue";
import Dashboard from "@views/Dashboard.vue";
import Calendar from "@views/Calendar.vue";
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
          permissions: ["view-patient-page"],
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
