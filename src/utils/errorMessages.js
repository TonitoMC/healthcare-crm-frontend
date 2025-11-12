/**
 * Devuelve el mensaje de error directo del backend si existe.
 * Capitaliza la primera letra si no está capitalizada.
 * @param {Error} error
 * @returns {string}
 */
export function getErrorMessage(error) {
  // si no hay respuesta HTTP (error de red u otra cosa)
  if (!error?.response) {
    return "No se pudo conectar con el servidor. Verifique su conexión a internet.";
  }

  // intenta extraer mensaje del backend
  const backendMessage =
    error.response.data?.error ||
    error.response.data?.message ||
    error.message ||
    "Error desconocido.";

  // capitalizar primera letra si no lo está
  return backendMessage.charAt(0).toUpperCase() + backendMessage.slice(1);
}
