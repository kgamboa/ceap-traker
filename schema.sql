-- SQL para crear la tabla 'items' en PostgreSQL
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);
