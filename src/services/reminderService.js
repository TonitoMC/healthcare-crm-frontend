// src/modules/dashboard/services/reminderService.js

let globalReminders = [
  {
    id: 1001,
    text: "Verificar informes de laboratorio.",
    priority: "Media",
    type: "global",
    completed: false,
    date: "27/10/2025",
  },
  {
    id: 1002,
    text: "Revisar stock de lentes intraoculares.",
    priority: "Alta",
    type: "global",
    completed: false,
    date: "27/10/2025",
  },
];

// Simulate async server calls
export async function getGlobalReminders() {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...globalReminders]), 200);
  });
}

export async function saveGlobalReminder(reminder) {
  return new Promise((resolve) => {
    globalReminders.push(reminder);
    setTimeout(() => resolve([...globalReminders]), 200);
  });
}
