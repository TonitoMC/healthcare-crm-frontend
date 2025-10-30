export const menuItems = [
  {
    label: "Dashboard",
    icon: "pi pi-chart-line",
    to: "/app/dashboard",
    roles: ["admin", "doctor"],
  },
  {
    label: "Calendario",
    icon: "pi pi-calendar",
    to: "/app/calendar",
    roles: ["admin", "doctor", "assistant"],
  },
  {
    label: "Formularios",
    icon: "pi pi-file-edit",
    to: "/app/formularios",
    roles: ["admin", "doctor"],
  },
  {
    label: "Perfil",
    icon: "pi pi-user",
    to: "/app/perfil",
    roles: ["admin", "doctor", "assistant"],
    style: {
      borderRadius: "2rem",
      background: "var(--surface-100)",
      padding: "0.4rem 1rem",
    },
  },
];

export const configMenuItems = [
  {
    label: "Configuración",
    icon: "pi pi-cog",
    to: "/app/settings",
    roles: ["admin", "doctor"],
  },
  {
    label: "Perfil",
    icon: "pi pi-user",
    to: "/app/perfil",
    roles: ["admin", "doctor", "assistant"],
  },
  {
    label: "Panel Admin",
    icon: "pi pi-shield",
    to: "/app/admin",
    roles: ["admin"],
  },
  {
    label: "Cerrar Sesión",
    icon: "pi pi-sign-out",
    to: "/logout",
    roles: ["admin", "doctor", "assistant"],
  },
];
