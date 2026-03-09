-- Migration: Add evidence verification and tracking fields to ceap_fases table
-- This migration adds fields for:
-- 1. Evidence verification by admin (evidencias_verificadas)
-- 2. Date when admin verified evidence (fecha_verificacion)
-- 3. Last update timestamp by regular user (ultima_actualizacion_usuario)
-- 4. Last update timestamp by admin (ultima_actualizacion_admin)
-- 5. Last update date for documents (ultima_actualizacion_documento)

-- Add new columns to ceap_fases table
ALTER TABLE ceap_fases
ADD COLUMN IF NOT EXISTS evidencias_verificadas BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fecha_verificacion DATE,
ADD COLUMN IF NOT EXISTS ultima_actualizacion_usuario TIMESTAMP,
ADD COLUMN IF NOT EXISTS ultima_actualizacion_admin TIMESTAMP,
ADD COLUMN IF NOT EXISTS ultima_actualizacion_documento DATE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ceap_fases_evidencias_verificadas ON ceap_fases(evidencias_verificadas);
CREATE INDEX IF NOT EXISTS idx_ceap_fases_ultima_actualizacion_usuario ON ceap_fases(ultima_actualizacion_usuario);
CREATE INDEX IF NOT EXISTS idx_ceap_fases_ultima_actualizacion_admin ON ceap_fases(ultima_actualizacion_admin);
