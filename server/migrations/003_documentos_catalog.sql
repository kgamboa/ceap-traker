-- 1. Create Catalog for Documents
CREATE TABLE IF NOT EXISTS ceap_documentos_catalog (
    id SERIAL PRIMARY KEY,
    fase_numero_orden INTEGER NOT NULL, -- Logical link to the phase order
    clave VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    numero_orden_doc INTEGER DEFAULT 0 -- Order within the phase
);

-- 2. Refactor Checklist Table to point to Catalog
-- Clear data first to ensure clean transition
TRUNCATE ceap_fase_documentos CASCADE;

-- Add catalog link and remove redundant columns
ALTER TABLE ceap_fase_documentos ADD COLUMN documento_id INTEGER REFERENCES ceap_documentos_catalog(id);
-- We'll drop old columns after migration

-- 3. Populate Catalog
INSERT INTO ceap_documentos_catalog (fase_numero_orden, clave, nombre, numero_orden_doc) VALUES
-- Fase 1 (1..3)
(1, 'convocatoria_padres', 'Convocatoria Padres de Familia', 1),
(1, 'convocatoria_trabajadores', 'Convocatoria Trabajadores', 2),
(1, 'convocatoria_alumnos', 'Convocatoria Alumnos', 3),
-- Fase 2 (1..9)
(2, 'acta_padres', 'Acta de Asamblea Padres de Familia', 1),
(2, 'lista_padres', 'Lista de Asistencia Padres de Familia', 2),
(2, 'evidencia_padres', 'Evidencia Fotográfica Asamblea Padres de Familia', 3),
(2, 'acta_trabajadores', 'Acta de Asamblea Trabajadores', 4),
(2, 'lista_trabajadores', 'Lista de Asistencia Trabajadores', 5),
(2, 'evidencia_trabajadores', 'Evidencia Fotográfica Asamblea Trabajadores', 6),
(2, 'acta_alumnos', 'Acta de Asamblea Alumnos', 7),
(2, 'lista_alumnos', 'Lista de Asistencia Alumnos', 8),
(2, 'evidencia_alumnos', 'Evidencia Fotográfica Asamblea Alumnos', 9),
-- Fase 3 (1..2)
(3, 'acta_constitutiva', 'Acta Constitutiva Notariada', 1),
(3, 'registro_publico', 'Registro Público', 2),
-- Fase 4 (1..3)
(4, 'acuse_socios', 'Acuse cambio de Socios/Accionistas', 1),
(4, 'e_firma', 'Acuse de Generación de e.firma', 2),
(4, 'opinion_cumplimiento', 'Autorizar Resultado Público de la Opinión de Cumplimiento Fiscal', 3),
-- Fase 5 (1..2)
(5, 'contrato_cuenta', 'Contrato de Apertura de Cuenta', 1),
(5, 'registro_firmas', 'Registro de Firmas Autorizadas', 2);

-- 4. Re-link existing CEAPs to the catalog
-- This will be done via seeder script to populate ceap_fase_documentos correctly.

-- 5. Cleanup redundant columns (Optional, but cleaner)
ALTER TABLE ceap_fase_documentos DROP COLUMN documento_nombre;
ALTER TABLE ceap_fase_documentos DROP COLUMN documento_clave;
ALTER TABLE ceap_fase_documentos ALTER COLUMN documento_id SET NOT NULL;
ALTER TABLE ceap_fase_documentos DROP CONSTRAINT IF EXISTS ceap_fase_documentos_ceap_fase_id_documento_clave_key;
ALTER TABLE ceap_fase_documentos ADD UNIQUE (ceap_fase_id, documento_id);
