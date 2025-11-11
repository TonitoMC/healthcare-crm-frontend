// Simple time utilities centralized for clinic timezone handling.
// Guatemala currently uses UTC-06 with no DST. We use a fixed offset to build RFC3339.

const CLINIC_TZ_OFFSET = "-06:00"; // can be moved to env if needed

function pad(n) {
  return String(n).padStart(2, "0");
}

/**
 * Devuelve una cadena YYYY-MM-DD correspondiente al día "clínico".
 * Asume que el objeto Date ya representa el día local que la UI quiere mostrar.
 * Si en el futuro la zona del navegador difiere de la clínica y hace falta ajustar,
 * aquí se podría aplicar una conversión explícita.
 */
export function clinicDateString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${year}-${month}-${day}`;
}

export function toClinicRFC3339(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hour = pad(d.getHours());
  const minute = pad(d.getMinutes());
  const second = pad(d.getSeconds());
  return `${year}-${month}-${day}T${hour}:${minute}:${second}${CLINIC_TZ_OFFSET}`;
}

export function buildClinicDateTime(dateOnly, timeHHmm) {
  // dateOnly: 'YYYY-MM-DD', timeHHmm: 'HH:mm'
  const [y, m, d] = dateOnly.split("-").map(Number);
  let h = 0, mm = 0;
  if (timeHHmm) {
    [h, mm] = timeHHmm.split(":").map(Number);
  }
  const local = new Date(y, m - 1, d, h, mm, 0, 0);
  return toClinicRFC3339(local);
}

export function hhmmToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToHHMM(total) {
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

