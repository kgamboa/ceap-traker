-- Script para insertar datos de ejemplo para testing

-- Insertar 25 planteles con datos reales de DGETI Guanajuato
INSERT INTO planteles (nombre, codigo, estado, municipio, director_email, director_nombre, telefono) VALUES
  ('CETIS No. 21', 'CF021', 'Guanajuato', 'León', 'cetis21.dir@dgeti.sems.gob.mx', 'Lic. Director CETIS 21', ''),
  ('CETIS No. 62', 'CE062', 'Guanajuato', 'Salamanca', 'cetis62.dir@dgeti.sems.gob.mx', 'Lic. Director CETIS 62', ''),
  ('CETIS No. 77', 'CE077', 'Guanajuato', 'León', 'cetis77.dir@dgeti.sems.gob.mx', 'Lic. Director CETIS 77', ''),
  ('CETIS No. 83', 'CE083', 'Guanajuato', 'Guanajuato', 'cetis83.dir@dgeti.sems.gob.mx', 'Lic. Director CETIS 83', ''),
  ('CETIS No. 115', 'CE115', 'Guanajuato', 'Celaya', 'cetis115.dir@dgeti.sems.gob.mx', 'Lic. Director CETIS 115', ''),
  ('CETIS No. 139', 'CE139', 'Guanajuato', 'Silao', 'cetis139.dir@dgeti.sems.gob.mx', 'Lic. Director CETIS 139', ''),
  ('CETIS No. 149', 'CE149', 'Guanajuato', 'Valle de Santiago', 'cetis149.dir@dgeti.sems.gob.mx', 'Lic. Director CETIS 149', ''),
  ('CETIS No. 150', 'CE150', 'Guanajuato', 'Apaseo el Alto', 'cetis150.dir@dgeti.sems.gob.mx', 'Lic. Director CETIS 150', ''),
  ('CETIS No. 160', 'CE160', 'Guanajuato', 'Jaral del Progreso', 'cetis160.dir@dgeti.sems.gob.mx', 'Lic. Director CETIS 160', ''),
  ('CBTIS No. 60', 'CB060', 'Guanajuato', 'San Miguel de Allende', 'cbtis60.dir@dgeti.sems.gob.mx', 'Lic. Director CBTIS 60', ''),
  ('CBTIS No. 65', 'CB065', 'Guanajuato', 'Irapuato', 'cbtis65.dir@dgeti.sems.gob.mx', 'Lic. Director CBTIS 65', ''),
  ('CBTIS No. 75', 'CB075', 'Guanajuato', 'Dolores Hidalgo', 'cbtis75.dir@dgeti.sems.gob.mx', 'Lic. Director CBTIS 75', ''),
  ('CBTIS No. 139', 'CB139', 'Guanajuato', 'San Francisco del Rincón', 'cbtis139.dir@dgeti.sems.gob.mx', 'Lic. Director CBTIS 139', ''),
  ('CBTIS No. 147', 'CB147', 'Guanajuato', 'Acámbaro', 'cbtis147.dir@dgeti.sems.gob.mx', 'Lic. Director CBTIS 147', ''),
  ('CBTIS No. 148', 'CB148', 'Guanajuato', 'San Felipe', 'cbtis148.dir@dgeti.sems.gob.mx', 'Lic. Director CBTIS 148', ''),
  ('CBTIS No. 171', 'CB171', 'Guanajuato', 'Abasolo', 'cbtis171.dir@dgeti.sems.gob.mx', 'Lic. Director CBTIS 171', ''),
  ('CBTIS No. 172', 'CB172', 'Guanajuato', 'Cortázar', 'cbtis172.dir@dgeti.sems.gob.mx', 'Lic. Director CBTIS 172', ''),
  ('CBTIS No. 173', 'CB173', 'Guanajuato', 'Guanajuato', 'cbtis173.dir@dgeti.sems.gob.mx', 'Lic. Director CBTIS 173', ''),
  ('CBTIS No. 174', 'CB174', 'Guanajuato', 'Manuel Doblado', 'cbtis174.dir@dgeti.sems.gob.mx', 'Lic. Director CBTIS 174', ''),
  ('CBTIS No. 198', 'CB198', 'Guanajuato', 'Celaya', 'cbtis198.dir@dgeti.sems.gob.mx', 'Lic. Director CBTIS 198', ''),
  ('CBTIS No. 217', 'CB217', 'Guanajuato', 'Uriangato', 'cbtis217.dir@dgeti.sems.gob.mx', 'Lic. Director CBTIS 217', ''),
  ('CBTIS No. 225', 'CB225', 'Guanajuato', 'León', 'cbtis225.dir@dgeti.sems.gob.mx', 'Lic. Director CBTIS 225', ''),
  ('CBTIS No. 238', 'CB238', 'Guanajuato', 'Juventino Rosas', 'cbtis238.dir@dgeti.sems.gob.mx', 'Lic. Director CBTIS 238', ''),
  ('CBTIS No. 255', 'CB255', 'Guanajuato', 'Tarimoro', 'cbtis255.dir@dgeti.sems.gob.mx', 'Lic. Director CBTIS 255', ''),
  ('CBTIS No. 292', 'CB292', 'Guanajuato', 'San Luis de la Paz', 'cbtis292.dir@dgeti.sems.gob.mx', 'Lic. Director CBTIS 292', '');

-- Insertar CEaPs para cada plantel (ciclos 2024-2026 y 2025-2027)
WITH plantel_ids AS (
  SELECT id FROM planteles ORDER BY nombre LIMIT 25
)
INSERT INTO ceaps (plantel_id, ciclo_inicio, ciclo_fin)
SELECT id, 2024, 2026 FROM plantel_ids
UNION ALL
SELECT id, 2025, 2027 FROM plantel_ids;

-- Inicializar fases para cada CEaP
WITH ceap_list AS (
  SELECT id FROM ceaps
),
fase_list AS (
  SELECT id FROM fases ORDER BY numero_orden
)
INSERT INTO ceap_fases (ceap_id, fase_id, estado)
SELECT DISTINCT ceap_list.id, fase_list.id, 'no_iniciado'
FROM ceap_list, fase_list
ON CONFLICT (ceap_id, fase_id) DO NOTHING;

-- Actualizar algunos registros con datos de ejemplo realistas
UPDATE ceap_fases
SET estado = 'completado', 
    completado = true,
    fecha_conclusión = CURRENT_DATE - INTERVAL '30 days'
WHERE fase_id = (SELECT id FROM fases WHERE numero_orden = 1)
LIMIT 20;

UPDATE ceap_fases
SET estado = 'en_progreso', 
    fecha_estimada = CURRENT_DATE + INTERVAL '30 days'
WHERE fase_id = (SELECT id FROM fases WHERE numero_orden = 2)
LIMIT 25;

UPDATE ceap_fases
SET estado = 'completado', 
    completado = true,
    fecha_conclusión = CURRENT_DATE - INTERVAL '10 days'
WHERE fase_id = (SELECT id FROM fases WHERE numero_orden = 3)
LIMIT 18;

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
