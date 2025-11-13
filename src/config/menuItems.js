export const menuItems = [
  {
    label: "Dashboard",
    icon: "pi pi-chart-line",
    to: "/app/dashboard",
    permissions: [], // accessible to all authenticated users
  },
  {
    label: "Calendario",
    icon: "pi pi-calendar",
    to: "/app/calendar",
    permissions: ["ver-citas"],
  },
  {
    label: "Mensajes WhatsApp",
    icon: "pi pi-send",
    to: "/app/whatsapp",
    permissions: ["ver-mensajes"],
  },
  {
    label: "Formularios",
    icon: "pi pi-file-edit",
    to: "/app/formularios",
    permissions: ["ver-cuestionarios"],
  },
  {
    label: "Roles & Permisos",
    icon: "pi pi-shield",
    to: "/app/admin",
    permissions: ["manejar-usuarios"],
  },
  {
    label: "Perfil",
    icon: "pi pi-user",
    to: "/app/perfil",
    permissions: [], // any authenticated user
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
    permissions: ["manejar-usuarios", "ver-formularios"], // adjust as needed
  },
  {
    label: "Perfil",
    icon: "pi pi-user",
    to: "/app/perfil",
    permissions: [],
  },
  {
    label: "Roles & Permisos",
    icon: "pi pi-shield",
    to: "/app/admin",
    permissions: ["manejar-usuarios"],
  },
  {
    label: "Cerrar Sesión",
    icon: "pi pi-sign-out",
    to: "/logout",
    permissions: [],
  },
];
