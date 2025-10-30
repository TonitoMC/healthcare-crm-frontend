export const getTodayAppointments = () => {
  const today = new Date().toISOString().split("T")[0];
  return Promise.resolve([
    {
      id: 1,
      patient: "María Pérez",
      doctor: "Dr. López",
      time: "09:00 - 09:30",
      status: "Completada",
    },
    {
      id: 2,
      patient: "Juan García",
      doctor: "Dr. Hernández",
      time: "10:00 - 10:30",
      status: "Pendiente",
    },
    {
      id: 3,
      patient: "Luis Martínez",
      doctor: "Dr. López",
      time: "11:15 - 11:45",
      status: "En progreso",
    },
  ]);
};
