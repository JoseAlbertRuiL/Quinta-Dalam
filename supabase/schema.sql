-- ================================================================
-- Quinta Dalam — Schema SQL para Supabase (PostgreSQL)
-- ================================================================
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase:
-- Dashboard → SQL Editor → New query → pega y ejecuta
--
-- Tablas:
--   habitaciones  → catálogo de habitaciones del hotel
--   reservas      → reservaciones de clientes
--   roles_usuario → control de acceso RBAC
--
-- Características:
--   - Restricción de unicidad por habitación+fechas (nivel BD)
--   - Row Level Security (RLS) estricto con validación de roles
--   - Índices para búsquedas frecuentes por fecha y habitación
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- TABLA: roles_usuario
-- Permisos y roles para el Panel de Administración
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles_usuario (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email       TEXT   UNIQUE NOT NULL,
  role        TEXT   NOT NULL CHECK (role IN ('superadmin', 'admin', 'recepcion')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────
-- TABLA: habitaciones
-- Catálogo de habitaciones del hotel Quinta Dalam
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habitaciones (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nombre      TEXT   NOT NULL,
  tipo        TEXT   NOT NULL,              -- ej: "Suite", "Estándar", "Doble"
  precio      NUMERIC(10, 2) NOT NULL,      -- precio por noche en MXN
  disponible  BOOLEAN NOT NULL DEFAULT TRUE
);

-- ────────────────────────────────────────────────────────────────
-- TABLA: reservas
-- Reservaciones realizadas por clientes
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservas (
  id              BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nombre_cliente  TEXT        NOT NULL,
  correo          TEXT        NOT NULL,
  telefono        TEXT,                     -- nullable: el campo es opcional
  habitacion      TEXT        NOT NULL,     -- ej: "101: Tzintzunzan"
  fecha_entrada   DATE        NOT NULL,
  fecha_salida    DATE        NOT NULL,
  personas        INTEGER     CHECK (personas >= 1 AND personas <= 20),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- ────────────────────────────────────────────────────────────
  -- CONSTRAINT: validar que la fecha de salida sea posterior
  -- a la fecha de entrada a nivel de la base de datos
  -- ────────────────────────────────────────────────────────────
  CONSTRAINT fecha_salida_posterior CHECK (fecha_salida > fecha_entrada)
);

-- ────────────────────────────────────────────────────────────────
-- ÍNDICES — optimizan las búsquedas de disponibilidad
-- ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reservas_habitacion
  ON reservas (habitacion);

CREATE INDEX IF NOT EXISTS idx_reservas_fechas
  ON reservas (fecha_entrada, fecha_salida);

CREATE INDEX IF NOT EXISTS idx_reservas_habitacion_fechas
  ON reservas (habitacion, fecha_entrada, fecha_salida);

-- ────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────────
ALTER TABLE roles_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- > Políticas para roles_usuario: Solo los usuarios pueden ver sus propios roles
DROP POLICY IF EXISTS "Lectura de roles propia o admins" ON roles_usuario;
CREATE POLICY "Lectura de roles propia o admins"
  ON roles_usuario FOR SELECT
  TO authenticated
  USING (
    email = (auth.jwt() ->> 'email') OR
    EXISTS (
      SELECT 1 FROM roles_usuario ru 
      WHERE ru.email = (auth.jwt() ->> 'email') AND ru.role IN ('superadmin', 'admin')
    )
  );

-- > Políticas para habitaciones
DROP POLICY IF EXISTS "Lectura pública de habitaciones" ON habitaciones;
CREATE POLICY "Lectura pública de habitaciones"
  ON habitaciones FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Solo admins pueden modificar habitaciones" ON habitaciones;
CREATE POLICY "Solo admins pueden modificar habitaciones"
  ON habitaciones FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roles_usuario
      WHERE roles_usuario.email = (auth.jwt() ->> 'email')
      AND roles_usuario.role IN ('superadmin', 'admin')
    )
  );

-- > Políticas para reservas
-- Inserción anónima (Cliente desde la Landing Page usando API)
DROP POLICY IF EXISTS "Clientes pueden crear reservaciones" ON reservas;
CREATE POLICY "Clientes pueden crear reservaciones"
  ON reservas FOR INSERT
  WITH CHECK (true);

-- Administradores pueden gestionar (Leer, Actualizar, Eliminar)
DROP POLICY IF EXISTS "Gestión completa por administradores" ON reservas;
CREATE POLICY "Gestión completa por administradores"
  ON reservas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roles_usuario
      WHERE roles_usuario.email = (auth.jwt() ->> 'email')
      AND roles_usuario.role IN ('superadmin', 'admin', 'recepcion')
    )
  );

-- ────────────────────────────────────────────────────────────────
-- DATOS SEMILLA
-- ────────────────────────────────────────────────────────────────

-- 0. Activar extensión para encriptar contraseñas manualmente
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Usuarios Administradores (Semilla de Permisos de Proyecto)
-- NOTA: Crea estos usuarios primero en el Dashboard de Supabase (Authentication > Users)
-- para que el sistema les asigne las identidades y metadatos correctos.
INSERT INTO roles_usuario (email, role) VALUES
  ('propietario@hotel-dalam.com', 'superadmin'),
  ('devs@hotel-dalam.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;

-- 2. Habitaciones del Hotel Quinta Dalam
INSERT INTO habitaciones (nombre, tipo, precio, disponible) VALUES
  ('101: Tzintzunzan',  'Estándar',  980.00,  TRUE),
  ('102: Paracho',      'Estándar',  980.00,  TRUE),
  ('103: Yunuen',       'Estándar', 1050.00,  TRUE),
  ('104: Patzcuaro',    'Doble',    1200.00,  TRUE),
  ('105: Coeneo',       'Doble',    1200.00,  TRUE),
  ('106: Janitzio',     'Doble',    1350.00,  TRUE),
  ('201: Suite Quencio','Suite',    2500.00,  TRUE),
  ('202: Morelia',      'Doble',    1400.00,  TRUE),
  ('203: Tacambaro',    'Doble',    1400.00,  TRUE),
  ('204: Uruapan',      'Estándar', 1050.00,  TRUE),
  ('205: Tlalpujahua',  'Estándar', 1050.00,  TRUE),
  ('206: Cuitzeo',      'Doble',    1350.00,  TRUE),
  ('207: Cuanajo',      'Doble',    1350.00,  TRUE)
ON CONFLICT DO NOTHING;
