-- Schema de referencia — Agon (PostgreSQL / Neon)
-- Fuente de verdad para tipos y relaciones: lib/db/schema.ts
-- Aplicar cambios reales con: npm run db:push (Drizzle)

-- Enums (nombres generados por Drizzle)
CREATE TYPE nivel AS ENUM (
  'aspirante', 'atleta', 'agonista', 'luchador', 'campeon',
  'heroe', 'semidios', 'olimpico', 'leyenda_del_agon', 'inmortal'
);

CREATE TYPE agora_evento_tipo AS ENUM (
  'prueba_completada', 'dia_perfecto', 'foto_subida', 'nivel_subido',
  'inscripcion_desbloqueada', 'hegemonia_ganada', 'senalamiento',
  'provocacion', 'cronica_semanal', 'semana_sagrada', 'prueba_extraordinaria'
);

CREATE TYPE aclamacion_tipo AS ENUM (
  'fuego', 'sin_piedad', 'agonia', 'digno_del_altis', 'el_agon_te_juzga'
);

-- Participantes (2 usuarios fijos en producción)
CREATE TABLE agonistas (
  id VARCHAR(256) PRIMARY KEY,
  clerk_id VARCHAR(256) NOT NULL UNIQUE,
  nombre VARCHAR(256) NOT NULL,
  nivel nivel DEFAULT 'aspirante' NOT NULL,
  kleos_total INTEGER DEFAULT 0 NOT NULL,
  dias_perfectos INTEGER DEFAULT 0 NOT NULL,
  oraculo_mensaje TEXT,
  oraculo_sellado BOOLEAN DEFAULT FALSE NOT NULL,
  senalamiento_usado BOOLEAN DEFAULT FALSE NOT NULL,
  senalamiento_recibido BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Una fila por día y agonista
CREATE TABLE pruebas_diarias (
  id VARCHAR(256) PRIMARY KEY,
  agonista_id VARCHAR(256) NOT NULL REFERENCES agonistas(id),
  fecha DATE NOT NULL,
  solo_agua BOOLEAN DEFAULT FALSE NOT NULL,
  sin_comida_rapida BOOLEAN DEFAULT FALSE NOT NULL,
  pasos INTEGER DEFAULT 0 NOT NULL,
  horas_sueno INTEGER DEFAULT 0 NOT NULL,
  paginas_leidas INTEGER DEFAULT 0 NOT NULL,
  sesiones_gym INTEGER DEFAULT 0 NOT NULL,
  sesiones_cardio INTEGER DEFAULT 0 NOT NULL,
  foto_gym_url TEXT,
  foto_cardio_url TEXT,
  kleos_ganado INTEGER DEFAULT 0 NOT NULL,
  dia_perfecto BOOLEAN DEFAULT FALSE NOT NULL,
  prueba_extraordinaria_completada BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE kleos_log (
  id VARCHAR(256) PRIMARY KEY,
  agonista_id VARCHAR(256) NOT NULL REFERENCES agonistas(id),
  cantidad INTEGER NOT NULL,
  motivo VARCHAR(256) NOT NULL,
  fecha DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE llamas (
  id VARCHAR(256) PRIMARY KEY,
  agonista_id VARCHAR(256) NOT NULL REFERENCES agonistas(id),
  habito_id VARCHAR(64) NOT NULL,
  racha_actual INTEGER DEFAULT 0 NOT NULL,
  rach_maxima INTEGER DEFAULT 0 NOT NULL,
  ultima_fecha DATE,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE inscripciones (
  id VARCHAR(256) PRIMARY KEY,
  agonista_id VARCHAR(256) NOT NULL REFERENCES agonistas(id),
  inscripcion_id VARCHAR(64) NOT NULL,
  secreto BOOLEAN DEFAULT FALSE NOT NULL,
  desbloqueado_en TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE agora_eventos (
  id VARCHAR(256) PRIMARY KEY,
  agonista_id VARCHAR(256) NOT NULL REFERENCES agonistas(id),
  tipo agora_evento_tipo NOT NULL,
  contenido TEXT NOT NULL,
  metadata JSONB,
  foto_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE aclamaciones (
  id VARCHAR(256) PRIMARY KEY,
  agonista_id VARCHAR(256) NOT NULL REFERENCES agonistas(id),
  evento_id VARCHAR(256) NOT NULL REFERENCES agora_eventos(id),
  tipo aclamacion_tipo NOT NULL,
  fecha DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE correspondencia (
  id VARCHAR(256) PRIMARY KEY,
  remitente_id VARCHAR(256) NOT NULL REFERENCES agonistas(id),
  contenido TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE hegemonias (
  id VARCHAR(256) PRIMARY KEY,
  semana INTEGER NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  ganador_id VARCHAR(256) REFERENCES agonistas(id),
  kleos_ganador INTEGER DEFAULT 0 NOT NULL,
  kleos_rival INTEGER DEFAULT 0 NOT NULL,
  empate BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Señalamiento (una vez por Gran Agon en la lógica de negocio)
CREATE TABLE senalamiento (
  id VARCHAR(256) PRIMARY KEY,
  senalador_id VARCHAR(256) NOT NULL REFERENCES agonistas(id),
  senalado_id VARCHAR(256) NOT NULL REFERENCES agonistas(id),
  fecha_senalamiento TIMESTAMP DEFAULT NOW() NOT NULL,
  prueba_completada BOOLEAN DEFAULT FALSE NOT NULL,
  kleos_restados BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE semana_sagrada (
  id VARCHAR(256) PRIMARY KEY,
  activa BOOLEAN DEFAULT FALSE NOT NULL,
  fecha_inicio DATE,
  fecha_fin DATE,
  activada_en TIMESTAMP
);

CREATE TABLE prueba_extraordinaria (
  id VARCHAR(256) PRIMARY KEY,
  semana INTEGER NOT NULL,
  descripcion TEXT NOT NULL,
  kleos_bonus INTEGER NOT NULL,
  activa BOOLEAN DEFAULT TRUE NOT NULL,
  fecha_expira TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE cronicas (
  id VARCHAR(256) PRIMARY KEY,
  semana INTEGER NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  relato TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE ekecheiria (
  id VARCHAR(256) PRIMARY KEY,
  agonista_id VARCHAR(256) NOT NULL REFERENCES agonistas(id),
  motivo TEXT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  activa BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
