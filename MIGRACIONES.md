# Sistema de Migraciones Automáticas

## ¿Cómo funciona?

Las migraciones se ejecutan **automáticamente una sola vez** cuando se inicia el servidor:

```
┌─────────────────────────────────────────────┐
│ Server Start (npm start)                    │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ 1. Esperar a PostgreSQL (waitForDatabase)   │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ 2. Ejecutar runMigrations()                 │
│    ├─ Crear tabla schema_migrations         │
│    ├─ Leer archivos *.sql                   │
│    ├─ Verificar si ya se ejecutaron         │
│    ├─ Ejecutar solo nuevas                  │
│    └─ Registrar en schema_migrations        │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ 3. Iniciar servidor (app.listen)            │
└─────────────────────────────────────────────┘
```

## Archivos del Sistema

- **`server/src/config/migrations.js`** - Lógica de migraciones
- **`server/src/server.js`** - Llamada a `runMigrations()` antes de iniciar
- **`server/migrations/`** - Carpeta con archivos `.sql`

## Migraciones Registradas

### 001_add_evidence_fields.sql
Agrega columnas de evidencias y timestamps a `ceap_fases`:
- `evidencias_verificadas` - Checkbox de verificación
- `fecha_verificacion` - Fecha de verificación
- `ultima_actualizacion_usuario` - Timestamp del usuario
- `ultima_actualizacion_admin` - Timestamp del admin  
- `ultima_actualizacion_documento` - Fecha del documento

## Logs durante Startup

```
🔄 Verificando y ejecutando migraciones...
✓ Tabla de migraciones verificada
⏳ Ejecutando migración: 001_add_evidence_fields.sql
✓ Migración completada: 001_add_evidence_fields.sql
✓ Todas las migraciones completadas exitosamente
✓ Conexión a PostgreSQL establecida
Servidor CEAP Tracker ejecutándose en puerto 5000
```

## En Deployments Posteriores

Si ya se ejecutó la migración `001_add_evidence_fields.sql`:

```
🔄 Verificando y ejecutando migraciones...
✓ Tabla de migraciones verificada
⏭️  Migración ya ejecutada: 001_add_evidence_fields.sql
✓ Todas las migraciones completadas exitosamente
```

## Agregar Nuevas Migraciones

1. Crear archivo `.sql` en `server/migrations/`
   - Nombre: `002_descripcion.sql`
   - Usar números secuenciales
   - Usar `IF NOT EXISTS` en ALTER TABLE

2. El servidor detecta automáticamente nuevas migraciones

3. Ejecuta al siguiente reinicio

## Tabla de Control: schema_migrations

```sql
CREATE TABLE schema_migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Para verificar qué migraciones se ejecutaron:
```sql
SELECT * FROM schema_migrations;
```

Resultado esperado:
```
 id |              name              |      executed_at      
────┼────────────────────────────────┼───────────────────────
  1 | 001_add_evidence_fields.sql    | 2026-03-09 10:30:00
```

## En Railway

Railway ejecuta migraciones automáticamente después de cada `git push`:
1. Clona el repositorio
2. Instala dependencias
3. Inicia el servidor
4. Migraciones se ejecutan automáticamente
5. Servidor queda listo para servir solicitudes

**No necesitas configuración adicional** ✨

## Rollback Manual (si falla)

Si necesitas revertir cambios:
```sql
-- Eliminar registro de migración
DELETE FROM schema_migrations WHERE name = '001_add_evidence_fields.sql';

-- Revertir cambios manualmente (si es necesario)
ALTER TABLE ceap_fases DROP COLUMN IF EXISTS evidencias_verificadas;
-- etc...
```

Luego la migración se ejecutará de nuevo al siguiente restart.
