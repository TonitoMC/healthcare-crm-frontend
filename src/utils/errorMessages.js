/**
 * Mapea errores del backend a mensajes amigables para el usuario
 * @param {Error} error - El error capturado
 * @returns {string} Mensaje amigable para mostrar al usuario
 */
export function getErrorMessage(error) {
  const backendError = error.response?.data?.error || "";
  const status = error.response?.status;

  // Errores de conflicto de citas (409 Conflict)
  if (status === 409) {
    return backendError || "Ya existe una cita en ese horario. Recuerda que debe haber 5 minutos entre citas.";
  }

  // Errores de horarios
  if (backendError.includes("El día está cerrado")) {
    return "El consultorio está cerrado en la fecha seleccionada. Por favor, elija otro día.";
  }

  if (
    backendError.includes(
      "El horario solicitado está fuera del rango permitido",
    ) ||
    backendError.includes("time outside working hours") ||
    backendError.includes("fuera del horario laboral")
  ) {
    return "El horario seleccionado está fuera del horario laboral. Horarios disponibles: Lun-Vie 9:00-13:00 y 15:00-18:00, Sáb 9:00-13:00.";
  }

  // Conflictos de citas (legacy - mantener por compatibilidad)
  if (
    backendError.includes("time slot conflict") ||
    backendError.includes("appointments must have 5 minute gap")
  ) {
    return "Ya existe una cita en ese horario. Recuerda que debe haber 5 minutos entre citas.";
  }
  if (backendError.includes("time slot conflict")) {
    return "Ya existe una cita en ese horario. Por favor, seleccione otro horario disponible.";
  }

  // Errores de paciente
  if (backendError.includes("patient not found")) {
    return "El paciente seleccionado no existe. Por favor, actualice la búsqueda.";
  }

  if (backendError.includes("telefono") && backendError.includes("duplicate")) {
    return "Ya existe un paciente registrado con ese número de teléfono.";
  }

  // Errores de validación
  if (backendError.includes("duracion must be")) {
    return "La duración de la cita debe ser entre 15 y 180 minutos.";
  }

  // Errores de conexión
  if (!error.response) {
    return "No se pudo conectar con el servidor. Verifique su conexión a internet.";
  }

  // Permisos
  if (status === 403 || /no autorizado|acceso denegado|forbidden/i.test(backendError)) {
    return "No tiene permisos para realizar esta acción.";
  }

  // Error genérico si no coincide con ningún patrón
  return "No se pudo crear la cita. Por favor, verifique los datos e intente nuevamente.";
}
