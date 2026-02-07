-- Tabla de planteles
CREATE TABLE planteles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL UNIQUE,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  estado VARCHAR(100) NOT NULL,
  municipio VARCHAR(100),
  director_email VARCHAR(255),
  director_nombre VARCHAR(255),
  telefono VARCHAR(20),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de CEaP (pueden ser múltiples por plantel si cambian ciclos)
CREATE TABLE ceaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plantel_id UUID NOT NULL REFERENCES planteles(id) ON DELETE CASCADE,
  ciclo_inicio INTEGER NOT NULL,
  ciclo_fin INTEGER NOT NULL,
  estado VARCHAR(50) DEFAULT 'en_proceso',
  porcentaje_avance DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(plantel_id, ciclo_inicio, ciclo_fin)
);

-- Tabla de fases del CEaP
CREATE TABLE fases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  numero_orden INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de avances de fases por CEaP
CREATE TABLE ceap_fases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ceap_id UUID NOT NULL REFERENCES ceaps(id) ON DELETE CASCADE,
  fase_id UUID NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  estado VARCHAR(50) DEFAULT 'no_iniciado',
  fecha_conclusión DATE,
  fecha_estimada DATE,
  observaciones TEXT,
  documentos_adjuntos TEXT[],
  completado BOOLEAN DEFAULT false,
  fecha_completado DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ceap_id, fase_id)
);

-- Índices para optimización
CREATE INDEX idx_ceaps_plantel ON ceaps(plantel_id);
CREATE INDEX idx_ceap_fases_ceap ON ceap_fases(ceap_id);
CREATE INDEX idx_ceap_fases_fase ON ceap_fases(fase_id);

-- Insertar fases predefinidas
INSERT INTO fases (nombre, descripcion, numero_orden) VALUES
  ('Convocatoria', 'Publicación y difusión de la convocatoria para el CEaP', 1),
  ('Asambleas', 'Celebración de asambleas informativas con maestros y personal', 2),
  ('Actas', 'Elaboración y aprobación de actas de las asambleas', 3),
  ('Acta Protocolizada', 'Protocolización del acta ante notario público', 4),
  ('Registro Público', 'Registro de la constitución en el Registro Público de la Propiedad', 5),
  ('SAT', 'Trámites ante SAT (FIEL y cambio de socios)', 6),
  ('Cuenta Bancaria', 'Apertura de cuenta bancaria o cambio de firmas autorizadas', 7);

-- Crear tabla de historial de cambios para auditoría
CREATE TABLE ceap_fases_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ceap_fase_id UUID NOT NULL REFERENCES ceap_fases(id) ON DELETE CASCADE,
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50),
  fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_email VARCHAR(255),
  observaciones TEXT
);

CREATE INDEX idx_historial_ceap_fase ON ceap_fases_historial(ceap_fase_id);
