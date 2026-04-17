-- AGON — Migración 03: agregar reto_id a semana_sagrada (si falta)

ALTER TABLE semana_sagrada
  ADD COLUMN IF NOT EXISTS reto_id VARCHAR(256) REFERENCES retos(id);

-- Verificar
SELECT column_name FROM information_schema.columns
WHERE table_name = 'semana_sagrada';

