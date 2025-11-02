import { ref } from "vue";

// Simple in-memory mock appointments store for the frontend.
// Each appointment: { id, date: 'YYYY-MM-DD', start, end, patient, doctor, status }
const appointments = ref([
  { id: 1, date: "2025-11-02", start: "09:00", end: "09:30", patient: "José Ramírez", doctor: "Dr. González", status: "Pendiente" },
  { id: 2, date: "2025-11-05", start: "10:15", end: "11:00", patient: "María López", doctor: "Dra. Pérez", status: "Completada" },
  { id: 3, date: "2025-11-08", start: "14:00", end: "14:45", patient: "Carlos Díaz", doctor: "Dr. Hernández", status: "En progreso" },
  { id: 4, date: "2025-11-12", start: "15:00", end: "16:00", patient: "Lucía Morales", doctor: "Dr. Sánchez", status: "Pendiente" },
  { id: 5, date: "2025-11-15", start: "11:00", end: "12:00", patient: "Ana García", doctor: "Dra. Martínez", status: "Pendiente" },
]);

let nextId = 100;

export function useAppointments() {
  const listBetween = (fromISO, toISO) => {
    const from = new Date(fromISO);
    const to = new Date(toISO);
    return appointments.value.filter((a) => {
      const d = new Date(a.date + "T00:00:00");
      return d >= from && d <= to;
    });
  };

  const listForDate = (dateISO) => {
    return appointments.value.filter((a) => a.date === dateISO);
  };

  const addAppointment = (appt) => {
    const newAppt = { id: nextId++, ...appt };
    appointments.value.push(newAppt);
    return newAppt;
  };

  return { appointments, listBetween, listForDate, addAppointment };
}
