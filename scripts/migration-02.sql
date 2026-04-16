-- AGON — Migración 02: tabla retos + reto_id en tablas globales

-- 1. Enums
CREATE TYPE reto_modo AS ENUM ('solo', 'duelo');
CREATE TYPE reto_estado AS ENUM (
  'configurando',
  'programado',
  'activo',
  'completado'
);

-- 2. Tabla retos
CREATE TABLE retos (
  id                          VARCHAR(256) PRIMARY KEY,
  modo                        reto_modo NOT NULL,
  estado                      reto_estado NOT NULL DEFAULT 'configurando',
  creador_clerk_id            VARCHAR(256) NOT NULL,
  codigo_invitacion           VARCHAR(64) UNIQUE,
  invitado_clerk_id           VARCHAR(256),
  fecha_inicio                DATE,
  fecha_fin                   DATE,
  fecha_confirmada_por_creador BOOLEAN NOT NULL DEFAULT false,
  fecha_confirmada_por_invitado BOOLEAN NOT NULL DEFAULT false,
  created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. agonistas: agregar reto_id y rol
ALTER TABLE agonistas
  ADD COLUMN reto_id VARCHAR(256) REFERENCES retos(id),
  ADD COLUMN rol VARCHAR(16);

-- 4. Tablas globales: agregar reto_id
ALTER TABLE hegemonias
  ADD COLUMN reto_id VARCHAR(256) REFERENCES retos(id);

ALTER TABLE semana_sagrada
  ADD COLUMN reto_id VARCHAR(256) REFERENCES retos(id);

ALTER TABLE prueba_extraordinaria
  ADD COLUMN reto_id VARCHAR(256) REFERENCES retos(id);

ALTER TABLE calendario_agon
  ADD COLUMN reto_id VARCHAR(256) REFERENCES retos(id);

ALTER TABLE cronicas
  ADD COLUMN reto_id VARCHAR(256) REFERENCES retos(id);

ALTER TABLE calendario_crisis
  ADD COLUMN reto_id VARCHAR(256) REFERENCES retos(id);

ALTER TABLE crisis_ciudad
  ADD COLUMN reto_id VARCHAR(256) REFERENCES retos(id);

-- 5. Índices para queries frecuentes
CREATE INDEX idx_agonistas_reto_id ON agonistas(reto_id);
CREATE INDEX idx_hegemonias_reto_id ON hegemonias(reto_id);
CREATE INDEX idx_crisis_ciudad_reto_id ON crisis_ciudad(reto_id);
CREATE INDEX idx_calendario_crisis_reto_id ON calendario_crisis(reto_id);

-- 6. Verificar estructura
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN (
  'retos', 'agonistas', 'hegemonias', 'semana_sagrada',
  'prueba_extraordinaria', 'calendario_agon', 'cronicas',
  'calendario_crisis', 'crisis_ciudad'
)
AND column_name IN ('reto_id', 'modo', 'estado', 'rol')
ORDER BY table_name, column_name;
