# Plan de Implementación: Verificación de Documentos y Rediseño de Fases

Este plan detalla los pasos necesarios para implementar la validación por documento, el control de avance por porcentajes y el nuevo sistema de comunicación (chat/observaciones) entre Plantel y Admin.

## Consideraciones Generales y Reglas de Negocio
- **Fases Reducidas**: Las fases pasan a ser únicamente 5: *Convocatoria, Asambleas, Notario Público, SAT, Cuenta Bancaria*.
- **Avance Gobal**: Cada fase completa aporta un 20% al total global.
- **Avance por Fase**: El 75% corresponde a los documentos capturados por el plantel, y el 25% a la verificación por los administradores. Se divide equitativamente entre el total de documentos de esa fase.
- **Gestión de Estados en Documentos**:
  - **Plantel**: Solo puede marcar si lo tiene (Capturado). Una vez verificado por Admin, se bloquea (se muestra palomita verde y fecha en texto).
  - **Admin**: Verifica el documento (solo posible si el plantel lo capturó). El checkbox de admin tiene 3 estados: 
    1. Vacío (Sin verificar).
    2. Verificado (Aprobado).
    3. Indeterminado/Intermedio (Con observaciones).
- **Auto-Guardado**: Se elimina el botón "Editar". Toda modificación a los checkboxes o al chat de observaciones se guarda automáticamente (al perder el foco o cambiar el valor).
- **Nuevos Usuarios Admin**: `joaquin/joakin` y `karlo/yair`.
- **Datos Antiguos**: Generar un script para listar las fases eliminadas ("Actas" y "Registro Público") que ya estaban completadas.

## Cambios Propuestos

### Componente: Base de Datos (PostgreSQL)

#### [NUEVO] `server/migrations/..._refactor_fases_and_docs.sql`
- **Script de Migración**:
  - Insertar/Actualizar la tabla `fases` para dejar solo las 5 fases principales.
  - Eliminar boton de "Editar" en toda parte del Frontend.
  - Crear tabla `ceap_fase_documentos` para llevar el control granular:
    ```sql
    CREATE TABLE ceap_fase_documentos (
        id SERIAL PRIMARY KEY,
        ceap_fase_id INTEGER REFERENCES ceap_fases(id) ON DELETE CASCADE,
        documento_clave VARCHAR(100) NOT NULL,
        capturado_plantel BOOLEAN DEFAULT FALSE,
        fecha_captura TIMESTAMP,
        estado_verificacion VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'verificado', 'observado'
        fecha_verificacion TIMESTAMP
    );
    ```
  - Crear tabla `ceap_fase_observaciones` para el chat:
    ```sql
    CREATE TABLE ceap_fase_observaciones (
        id SERIAL PRIMARY KEY,
        ceap_fase_id INTEGER REFERENCES ceap_fases(id) ON DELETE CASCADE,
        usuario_nombre VARCHAR(100) NOT NULL, -- Plantel o Admin
        es_admin BOOLEAN DEFAULT FALSE,
        mensaje TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```
  - Insertar a los usuarios administradores definidos (`joaquin`, `karlo`) en la tabla de usuarios correspondientes (si existe un rol de usuario) o codificar sus credenciales acorde a la implementación actual.

#### [NUEVO] `server/scripts/export_legacy_phases.js` (o SQL)
- Script para generar el listado de los planteles que tenían completadas las fases antiguas "Actas" y "Registro Público", junto a su fecha, para futuras referencias.

---

### Componente: Backend (Node.js/Express)

#### [MODIFICAR] `server/src/models/fasesCatalog.js` (o donde se definan los docs)
- Modificar o crear el catálogo duro de documentos esperados por fase. Ej:
  - Fase 1: *3 Convocatorias*
  - Fase 2: *Acta Padres, Acta Trabajadores, Acta Estudiantes, etc.*

#### [MODIFICAR] [server/src/models/CEaPFaseModel.js](file:///c:/Users/karlo/source/repos/DGETI/PV/ceap-traker/server/src/models/CEaPFaseModel.js)
- Actualizar el query principal para incluir el join con `ceap_fase_documentos` y `ceap_fase_observaciones`.
- Crear un nuevo endpoint/método `updateDocumento` para auto-guardar cada vez que se marque un documento.
  - Lógica: Si Admin cambia estado a 'verificado', setear la `fecha_verificacion` default al timestamp actual.
- Crear endpoints/métodos para el chat `addObservacion` y `getObservaciones`.

#### [MODIFICAR] [server/src/models/CEaPModel.js](file:///c:/Users/karlo/source/repos/DGETI/PV/ceap-traker/server/src/models/CEaPModel.js) (Cálculo de Progreso)
- Refactorizar el cálculo para que reaccione dinámicamente a la tabla `ceap_fase_documentos`:
  - [(DocsCapturados / TotalDocsFase) * 75](file:///c:/Users/karlo/source/repos/DGETI/PV/ceap-traker/server/src/models/CEaPFaseModel.js#60-108) + [(DocsVerificados / TotalDocsFase) * 25](file:///c:/Users/karlo/source/repos/DGETI/PV/ceap-traker/server/src/models/CEaPFaseModel.js#60-108).
  - El avance global suma las 5 fases (cada una da hasta 20 puntos).

---

### Componente: Frontend (React)

#### [MODIFICAR] [client/src/pages/PlanteleDetail.js](file:///c:/Users/karlo/source/repos/DGETI/PV/ceap-traker/client/src/pages/PlanteleDetail.js) e Hijos ([SharedComponents.js](file:///c:/Users/karlo/source/repos/DGETI/PV/ceap-traker/client/src/components/SharedComponents.js))
- **Eliminación Botón Editar**: Quitar renderizado del botón y estados de edición bloqueantes (`editingFaseId`).
- Renderizar un componente dinámico tipo `DocumentChecklist`:
  - En lugar de un solo check de "Evidencias", iterar sobre la lista requerida en la fase activa.
  - Para **Plantel**: Check simple. Validar: `if (verificado === 'verificado')` deshabilitar input, mostrar SVG palomita verde y texto de fechas (finalización/verificación).
  - Para **Admin**: Check de 3 estados (Tri-state checkbox en React definiendo `ref.indeterminate = true`). Solo se activa si el Plantel lo capturó.
    1. Vacío -> estado 'pendiente'
    2. Checked -> estado 'verificado'
    3. Indeterminate -> estado 'observado'
  - Ejecución de `api.updateDocumento` enviando payload al instante (onChange).

#### [NUEVO] `client/src/components/ObservacionesChat.js`
- Reemplazar textarea `observaciones` estático por un panel de chat estilizado.
- Renderizar mensajes en orden cronológico, diferenciando visualmente si es del admin o del plantel.
- Auto-guardado: Cuando se escriba y presione Enter o botón Enviar, hace el push directo a BD.

## Plan de Verificación

### Pruebas Automatizadas / Manuales
- **BD Migración**: Correr la migración y comprobar que la BD tiene tablas `ceap_fase_documentos` sin perder integridad. Comprobar ejecución de `export_legacy_phases`.
- **UI de Componentes (Plantel)**:
  1. Entrar con rol Plantel. Palomear un documento. Refrescar página para verificar el autoguardado.
  2. Escribir comentario en el chat.
- **UI de Componentes (Admin)**:
  1. Entrar como `joaquin`. Listado muestra documento del plantel.
  2. Hacer click en verificación. Comprobar que permite el estado intermedio ("observado").
- **Cálculo de Progreso**:
  1. De 2 docs esperados, checkear 1. El porcentaje global y de fase deben subir según la fórmula de 75/25 y un peso de 20% por fase total.
  2. Comprobar que en el tablero/Dashboard global, las sumas reflejan correctamente este cambio.
