import { api } from './api'

export const QuestionnaireService = {
  /**
   * Obtener todos los cuestionarios
   */
  async getAll() {
    const response = await api.get('/questionnaires')
    return response.data
  },

  /**
   * Obtener solo cuestionarios activos
   */
  async getActive() {
    const questionnaires = await this.getAll()
    return questionnaires.filter((q) => q.activo)
  },

  /**
   * Obtener un cuestionario por ID con sus preguntas parseadas
   */
  async getByID(id) {
    const response = await api.get(`/questionnaires/${id}`)
    const questionnaire = response.data

    // Parsear el schema JSON
    if (questionnaire.schema) {
      try {
        const schema =
          typeof questionnaire.schema === 'string'
            ? JSON.parse(questionnaire.schema)
            : questionnaire.schema

        // Extraer las preguntas del schema
        questionnaire.questions = schema.questions || []
        questionnaire.title = schema.title || questionnaire.nombre
      } catch (err) {
        console.error('Error parsing questionnaire schema:', err)
        questionnaire.questions = []
      }
    }

    return questionnaire
  },

  /**
   * Obtener nombres únicos de cuestionarios
   */
  async getNames() {
    const response = await api.get('/questionnaires/names')
    return response.data
  },

  /**
   * Obtener el cuestionario activo por nombre
   */
  async getActiveByName(name) {
    const response = await api.get(`/questionnaires/active/${name}`)
    return response.data
  },

  /**
   * Crear un nuevo cuestionario
   */
  async create(data) {
    // Construir el schema JSON
    const schema = {
      title: data.title || data.nombre,
      questions: data.questions.map((q) => ({
        label: q.name,
        type: q.bilateral ? 'bilateral' : 'unilateral',
        data_type: this.mapQuestionType(q.type),
        order: q.order,
      })),
    }

    const payload = {
      nombre: data.nombre,
      version: data.version,
      activo: data.activo || false,
      schema: schema,
    }

    const response = await api.post('/questionnaires', payload)
    return response.data
  },

  /**
   * Actualizar un cuestionario existente (crear nueva versión)
   */
  async update(id, data) {
    // Construir el schema JSON
    const schema = {
      title: data.title || data.nombre,
      questions: data.questions.map((q) => ({
        label: q.name,
        type: q.bilateral ? 'bilateral' : 'unilateral',
        data_type: this.mapQuestionType(q.type),
        order: q.order,
      })),
    }

    const payload = {
      nombre: data.nombre,
      version: data.version,
      activo: data.activo !== undefined ? data.activo : false,
      schema: schema,
    }

    const response = await api.put(`/questionnaires/${id}`, payload)
    return response.data
  },

  /**
   * Eliminar un cuestionario
   */
  async delete(id) {
    const response = await api.delete(`/questionnaires/${id}`)
    return response.data
  },

  /**
   * Activar un cuestionario
   */
  async setActive(id) {
    const response = await api.put(`/questionnaires/${id}/activate`)
    return response.data
  },

  /**
   * Desactivar un cuestionario
   */
  async setInactive(id) {
    const response = await api.put(`/questionnaires/${id}/deactivate`)
    return response.data
  },

  /**
   * Cambiar estado activo/inactivo
   */
  async toggleActive(id, currentState) {
    if (currentState) {
      return this.setInactive(id)
    } else {
      return this.setActive(id)
    }
  },

  /**
   * Mapear tipos de pregunta del frontend al backend
   */
  mapQuestionType(type) {
    const typeMap = {
      texto: 'string',
      entero: 'int',
      float: 'float',
      booleano: 'bool',
    }
    return typeMap[type] || 'string'
  },

  /**
   * Mapear tipos de pregunta del backend al frontend
   */
  reverseMapQuestionType(dataType) {
    const typeMap = {
      string: 'texto',
      int: 'entero',
      float: 'float',
      bool: 'booleano',
    }
    return typeMap[dataType] || 'texto'
  },
}
