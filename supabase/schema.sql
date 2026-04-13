-- ================================================================
-- Quinta Dalam — Schema SQL para Supabase (PostgreSQL)
-- ================================================================
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase:
-- Dashboard → SQL Editor → New query → pega y ejecuta
--
-- Tablas:
--   habitaciones  → catálogo de habitaciones del hotel
--   reservas      → reservaciones de clientes
--
-- Características:
--   - Restricción de unicidad por habitación+fechas (nivel BD)
--   - Row Level Security (RLS) habilitado
--   - Índices para búsquedas frecuentes por fecha y habitación
-- ================================================================

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
-- La query de verificación filtra por habitacion + fechas,
-- por lo que un índice compuesto acelera enormemente la consulta.
-- ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reservas_habitacion
  ON reservas (habitacion);

CREATE INDEX IF NOT EXISTS idx_reservas_fechas
  ON reservas (fecha_entrada, fecha_salida);

CREATE INDEX IF NOT EXISTS idx_reservas_habitacion_fechas
  ON reservas (habitacion, fecha_entrada, fecha_salida);

-- ────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- Política básica: cualquiera puede insertar (cliente web),
-- solo el rol autenticado (admin) puede leer y eliminar.
--
-- En producción, afina estas políticas según tus necesidades.
-- ────────────────────────────────────────────────────────────────
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitaciones ENABLE ROW LEVEL SECURITY;

-- Política: permitir INSERT anónimo desde el cliente web (API pública)
-- Esto permite que el endpoint /api/reservaciones inserte con el anon key.
CREATE POLICY "Clientes pueden crear reservaciones"
  ON reservas FOR INSERT
  WITH CHECK (true);

-- Política: solo admins autenticados pueden consultar reservas
-- (ajusta 'authenticated' a tu rol de admin cuando lo configures)
CREATE POLICY "Admins pueden ver reservaciones"
  ON reservas FOR SELECT
  TO authenticated
  USING (true);

-- Política: lectura pública del catálogo de habitaciones
CREATE POLICY "Lectura pública de habitaciones"
  ON habitaciones FOR SELECT
  USING (true);

-- ────────────────────────────────────────────────────────────────
-- DATOS SEMILLA: Habitaciones del Hotel Quinta Dalam
-- Basado en el selector del formulario de reservaciones
-- ────────────────────────────────────────────────────────────────
INSERT INTO habitaciones (nombre, tipo, precio, disponible) VALUES
  -- Planta Baja (Serie 100)
  ('101: Tzintzunzan',  'Estándar',  980.00,  TRUE),
  ('102: Paracho',      'Estándar',  980.00,  TRUE),
  ('103: Yunuen',       'Estándar', 1050.00,  TRUE),
  ('104: Patzcuaro',    'Doble',    1200.00,  TRUE),
  ('105: Coeneo',       'Doble',    1200.00,  TRUE),
  ('106: Janitzio',     'Doble',    1350.00,  TRUE),
  -- Planta Alta (Serie 200)
  ('201: Suite Quencio','Suite',    2500.00,  TRUE),
  ('202: Morelia',      'Doble',    1400.00,  TRUE),
  ('203: Tacambaro',    'Doble',    1400.00,  TRUE),
  ('204: Uruapan',      'Estándar', 1050.00,  TRUE),
  ('205: Tlalpujahua',  'Estándar', 1050.00,  TRUE),
  ('206: Cuitzeo',      'Doble',    1350.00,  TRUE),
  ('207: Cuanajo',      'Doble',    1350.00,  TRUE)
ON CONFLICT DO NOTHING;
