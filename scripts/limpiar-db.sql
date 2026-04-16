-- AGON — Script de limpieza total de datos
-- Ejecutar en Neon antes de la migración multi-instancia
-- ADVERTENCIA: elimina TODOS los datos existentes

TRUNCATE TABLE
  mentor_conversaciones,
  comentarios_agora,
  likes_agora,
  aclamaciones,
  agora_eventos,
  posts_dioses,
  notificaciones,
  facciones_afinidad,
  disputas_campeon,
  inscripciones,
  llamas,
  kleos_log,
  pruebas_diarias,
  prueba_extraordinaria,
  semana_sagrada,
  calendario_agon,
  hegemonias,
  cronicas,
  ekecheiria,
  senalamiento,
  correspondencia,
  consulta_mediodia,
  calendario_crisis,
  crisis_ciudad,
  pacto_inicial,
  agonistas
CASCADE;

-- Verificar que todas las tablas quedaron vacías
SELECT
  relname AS tabla,
  n_live_tup AS filas
FROM pg_stat_user_tables
ORDER BY relname;
