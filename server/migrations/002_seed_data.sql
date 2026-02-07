-- Script para insertar datos de ejemplo para testing

-- Insertar 25 planteles de ejemplo (ciudades principales de Guanajuato)
INSERT INTO planteles (nombre, codigo, estado, municipio, director_email, director_nombre, telefono) VALUES
  ('CECYTEG Acámbaro', 'P001', 'Guanajuato', 'Acámbaro', 'director1@dgeti.gto.edu.mx', 'Lic. Juan García', '4131234567'),
  ('CECYTEG Apaseo el Alto', 'P002', 'Guanajuato', 'Apaseo el Alto', 'director2@dgeti.gto.edu.mx', 'Lic. María López', '4141234567'),
  ('CECYTEG Celaya', 'P003', 'Guanajuato', 'Celaya', 'director3@dgeti.gto.edu.mx', 'Lic. Carlos Rodríguez', '4611234567'),
  ('CECYTEG Cortázar', 'P004', 'Guanajuato', 'Cortázar', 'director4@dgeti.gto.edu.mx', 'Lic. Ana Martínez', '4421234567'),
  ('CECYTEG Dolores Hidalgo', 'P005', 'Guanajuato', 'Dolores Hidalgo', 'director5@dgeti.gto.edu.mx', 'Lic. Pedro González', '4181234567'),
  ('CECYTEG Guanajuato', 'P006', 'Guanajuato', 'Guanajuato', 'director6@dgeti.gto.edu.mx', 'Lic. Laura Sánchez', '4731234567'),
  ('CECYTEG Irapuato', 'P007', 'Guanajuato', 'Irapuato', 'director7@dgeti.gto.edu.mx', 'Lic. Roberto Flores', '4621234567'),
  ('CECYTEG Juventino Rosas', 'P008', 'Guanajuato', 'Juventino Rosas', 'director8@dgeti.gto.edu.mx', 'Lic. Sofía Torres', '4421234568'),
  ('CECYTEG León', 'P009', 'Guanajuato', 'León', 'director9@dgeti.gto.edu.mx', 'Lic. David Ruiz', '4771234567'),
  ('CECYTEG Moroleón', 'P010', 'Guanajuato', 'Moroleón', 'director10@dgeti.gto.edu.mx', 'Lic. Patricia Mendoza', '4441234567'),
  ('CECYTEG Pénjamo', 'P011', 'Guanajuato', 'Pénjamo', 'director11@dgeti.gto.edu.mx', 'Lic. Francisco Vega', '4641234567'),
  ('CECYTEG Querétaro', 'P012', 'Guanajuato', 'San Luis de la Paz', 'director12@dgeti.gto.edu.mx', 'Lic. Gabriela Romero', '4881234567'),
  ('CECYTEG Salamanca', 'P013', 'Guanajuato', 'Salamanca', 'director13@dgeti.gto.edu.mx', 'Lic. Miguel Herrera', '4641234568'),
  ('CECYTEG San Felipe', 'P014', 'Guanajuato', 'San Felipe', 'director14@dgeti.gto.edu.mx', 'Lic. Elena Díaz', '4791234567'),
  ('CECYTEG San Luis de la Paz', 'P015', 'Guanajuato', 'San Luis de la Paz', 'director15@dgeti.gto.edu.mx', 'Lic. Gustavo Herrera', '4881234568'),
  ('CECYTEG Santa Catarina', 'P016', 'Guanajuato', 'Santa Catarina', 'director16@dgeti.gto.edu.mx', 'Lic. Beatriz García', '4651234567'),
  ('CECYTEG Silao', 'P017', 'Guanajuato', 'Silao', 'director17@dgeti.gto.edu.mx', 'Lic. Raúl López', '4721234567'),
  ('CECYTEG Tarimoro', 'P018', 'Guanajuato', 'Tarimoro', 'director18@dgeti.gto.edu.mx', 'Lic. Verónica Sánchez', '4591234567'),
  ('CECYTEG Tejerizo', 'P019', 'Guanajuato', 'Tejerizo', 'director19@dgeti.gto.edu.mx', 'Lic. Andrés Campos', '4651234568'),
  ('CECYTEG Tolimán', 'P020', 'Guanajuato', 'Tolimán', 'director20@dgeti.gto.edu.mx', 'Lic. Irene Núñez', '4181234568'),
  ('CECYTEG Uriangato', 'P021', 'Guanajuato', 'Uriangato', 'director21@dgeti.gto.edu.mx', 'Lic. Javier López', '4451234567'),
  ('CECYTEG Valle de Santiago', 'P022', 'Guanajuato', 'Valle de Santiago', 'director22@dgeti.gto.edu.mx', 'Lic. Claudia Reyes', '4661234567'),
  ('CECYTEG Villagrán', 'P023', 'Guanajuato', 'Villagrán', 'director23@dgeti.gto.edu.mx', 'Lic. Ernesto Díaz', '4611234568'),
  ('CECYTEG Xichú', 'P024', 'Guanajuato', 'Xichú', 'director24@dgeti.gto.edu.mx', 'Lic. Patricia Flores', '4131234568'),
  ('CECYTEG Yuriria', 'P025', 'Guanajuato', 'Yuriria', 'director25@dgeti.gto.edu.mx', 'Lic. Fernando García', '4521234567');

-- Insertar CEaPs para cada plantel (ciclos 2024-2026)
WITH plantel_ids AS (
  SELECT id FROM planteles ORDER BY nombre LIMIT 25
)
INSERT INTO ceaps (plantel_id, ciclo_inicio, ciclo_fin)
SELECT id, 2024, 2026 FROM plantel_ids;

-- Inicializar fases para cada CEaP
WITH ceap_list AS (
  SELECT c.id as ceap_id FROM ceaps c
),
fase_list AS (
  SELECT id FROM fases ORDER BY numero_orden
)
INSERT INTO ceap_fases (ceap_id, fase_id, estado)
SELECT DISTINCT ceap_list.ceap_id, fase_list.id, 'no_iniciado'
FROM ceap_list, fase_list
ON CONFLICT (ceap_id, fase_id) DO NOTHING;

-- Actualizar algunos registros con datos de ejemplo
UPDATE ceap_fases
SET estado = 'completado', 
    completado = true,
    fecha_conclusión = CURRENT_DATE - INTERVAL '30 days'
WHERE fase_id = (SELECT id FROM fases WHERE numero_orden = 1)
LIMIT 10;

UPDATE ceap_fases
SET estado = 'en_progreso', 
    fecha_estimada = CURRENT_DATE + INTERVAL '30 days'
WHERE fase_id = (SELECT id FROM fases WHERE numero_orden = 2)
LIMIT 12;

UPDATE ceap_fases
SET estado = 'completado', 
    completado = true,
    fecha_conclusión = CURRENT_DATE - INTERVAL '10 days'
WHERE fase_id = (SELECT id FROM fases WHERE numero_orden = 3)
LIMIT 8;

-- Actualizar porcentajes de avance
UPDATE ceaps c
SET porcentaje_avance = (
  SELECT ROUND(100.0 * SUM(CASE WHEN completado = true THEN 1 ELSE 0 END) / COUNT(*), 0)
  FROM ceap_fases cf
  WHERE cf.ceap_id = c.id
)
WHERE EXISTS (
  SELECT 1 FROM ceap_fases WHERE ceap_id = c.id
);
