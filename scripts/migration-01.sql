-- AGON — Migración 01: eliminar columnas hardcodeadas
-- Ejecutar en Neon después de limpiar los datos

ALTER TABLE prueba_extraordinaria
  DROP COLUMN IF EXISTS completada_por_javier,
  DROP COLUMN IF EXISTS completada_por_matias;

-- Verificar resultado
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'prueba_extraordinaria'
ORDER BY ordinal_position;
