-- AGON — Migración 02b: renombrar campos rival → agonista en pacto_inicial

ALTER TABLE pacto_inicial
  RENAME COLUMN rival_fortalezas TO tus_fortalezas;

ALTER TABLE pacto_inicial
  RENAME COLUMN rival_debilidad TO tu_debilidad;

-- Verificar
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'pacto_inicial'
ORDER BY ordinal_position;
