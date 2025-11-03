// Simple mock service for WhatsApp message templates and sending
// In a real app this would call the backend API that integrates with WhatsApp provider.
export const WhatsAppService = {
  async listTemplates() {
    // mock templates
    return [
      { id: 1, nombre: 'Recordatorio cita', texto: 'Hola {{nombre}}, le recordamos su cita el {{fecha}} a las {{hora}}.' },
      { id: 2, nombre: 'Confirmación resultado', texto: 'Hola {{nombre}}, su examen ya está disponible en el portal. Saludos.' },
      { id: 3, nombre: 'Agenda promoción', texto: 'Hola {{nombre}}, tenemos disponibilidad mañana. ¿Desea agendar?.' },
    ];
  },

  async sendMessage({ clientId, templateId, textOverride }) {
    // simulate network latency
    await new Promise((r) => setTimeout(r, 400));
    // return mock result
    return { success: true, clientId, templateId, text: textOverride || '...' };
  },
};
