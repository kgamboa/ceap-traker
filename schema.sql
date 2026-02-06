-- SQL para crear la tabla 'items' en PostgreSQL
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  plantel TEXT NOT NULL,
  ciclo_ceap TEXT,
  fase TEXT,
  estatus TEXT,
  observaciones TEXT,
  fecha_estimada DATE,
  fecha_concluido DATE
);
