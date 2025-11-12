# Módulo de Formularios (Cuestionarios)

Este módulo permite la gestión completa de cuestionarios de consulta médica.

## Características

### Backend (Go + PostgreSQL)
- ✅ CRUD completo de cuestionarios
- ✅ Versionamiento de cuestionarios
- ✅ Sistema de activación/desactivación
- ✅ Validación de respuestas basada en schema JSON
- ✅ Control de permisos: `ver-cuestionarios` y `manejar-cuestionarios`

### Frontend (Vue 3 + PrimeVue)
- ✅ Vista principal con agrupación por nombre
- ✅ Tarjetas de cuestionario con estado visual
- ✅ Modal de edición/creación de nuevas versiones
- ✅ Modal de visualización de preguntas
- ✅ Filtro activos/todos
- ✅ Auto-incremento de versiones
- ✅ Reordenamiento de preguntas (drag & drop simulado)
- ✅ Validación de formularios

## Estructura de Datos

### Tabla `cuestionarios`
```sql
CREATE TABLE cuestionarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    version VARCHAR NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT FALSE,
    schema JSONB NOT NULL,
    CONSTRAINT unique_nombre_version UNIQUE (nombre, version)
);
```

### Schema JSON
```json
{
  "title": "Evaluación Ocular 2025",
  "questions": [
    {
      "label": "Agudeza Visual sin lentes",
      "type": "bilateral",
      "data_type": "int",
      "order": 1
    }
  ]
}
```

## API Endpoints

### GET `/api/questionnaires`
Obtener todos los cuestionarios (requiere permiso `ver-cuestionarios`)

### GET `/api/questionnaires/:id`
Obtener un cuestionario específico

### GET `/api/questionnaires/active/:name`
Obtener el cuestionario activo de un nombre específico

### POST `/api/questionnaires`
Crear nuevo cuestionario (requiere permiso `manejar-cuestionarios`)

### PUT `/api/questionnaires/:id`
Actualizar cuestionario existente

### PUT `/api/questionnaires/:id/activate`
Activar un cuestionario (desactiva automáticamente otros del mismo nombre)

### PUT `/api/questionnaires/:id/deactivate`
Desactivar un cuestionario

### DELETE `/api/questionnaires/:id`
Eliminar un cuestionario

## Tipos de Pregunta

- **texto** (string): Respuestas de texto libre
- **entero** (int): Números enteros
- **float**: Números decimales
- **booleano** (bool): Sí/No

## Tipos de Lateralidad

- **unilateral**: Pregunta con una sola respuesta
- **bilateral**: Pregunta con respuestas separadas para OD (Ojo Derecho) y OI (Ojo Izquierdo)

## Navegación

**Ruta:** `/app/formularios`

**Permisos requeridos:** 
- Ver: `ver-cuestionarios`
- Editar: `manejar-cuestionarios`

**Roles con acceso:** `admin`, `doctor`

## Componentes

### Vistas
- `Formularios.vue`: Vista principal del módulo

### Componentes
- `QuestionnaireCard.vue`: Tarjeta de cuestionario
- `QuestionnaireEditDialog.vue`: Modal de edición/creación
- `QuestionnaireDetailsDialog.vue`: Modal de visualización

### Servicios
- `questionnaireService.js`: Cliente API para cuestionarios

## Uso

1. Acceder desde el menú lateral "Formularios"
2. Ver cuestionarios agrupados por nombre
3. Filtrar entre activos y todos
4. Editar un cuestionario para crear una nueva versión
5. Activar/desactivar versiones según necesidad
6. Ver detalles de preguntas de cualquier versión
