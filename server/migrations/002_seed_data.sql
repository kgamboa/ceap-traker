-- Script para insertar datos de ejemplo para testing

-- Limpiar datos existentes
DELETE FROM ceap_fases;
DELETE FROM ceaps;
DELETE FROM fases;
DELETE FROM planteles;

-- Insertar fases estándar de implementación
INSERT INTO fases (nombre, numero_orden, descripcion) VALUES
  ('Convocatoria', 1, 'Publicación y difusión de la convocatoria para participación de planteles en CEaP'),
  ('Selección de Planteles', 2, 'Revisión y selección de planteles participantes en el programa'),
  ('Diagnóstico Institucional', 3, 'Evaluación de la situación actual del plantel e identificación de necesidades'),
  ('Diseño de Modelo CEaP', 4, 'Diseño del modelo de Centro de Enseñanza y Aprendizaje Práctico'),
  ('Capacitación Inicial', 5, 'Capacitación de directivos y personal docente en metodología CEaP'),
  ('Adquisición de Equipamiento', 6, 'Compra e instalación de equipamiento necesario'),
  ('Implementación de Procesos', 7, 'Implementación de procesos y protocolos del CEaP'),
  ('Seguimiento y Evaluación', 8, 'Monitoreo de avances y evaluación de resultados');

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
