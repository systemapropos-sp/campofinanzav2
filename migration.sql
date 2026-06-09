-- ═══════════════════════════════════════════════════════════════════
-- CampoFinanzas v2 — Migration SQL
-- EJECUTAR en: Supabase Dashboard → SQL Editor → Pegar y ejecutar
-- ⚠️  Este script RECREA tablas con schema v2 (columnas en inglés)
--     Las tablas cf_businesses y cf_usuarios_negocio se PRESERVAN.
-- ═══════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────
-- 1. HABILITAR extensiones necesarias
-- ──────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────────────
-- 2. BORRAR tablas con schema viejo (columnas en español)
--    Las tablas vacías de inventario, empleados, nóminas y préstamos
-- ──────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS cf_deducciones_prestamo CASCADE;
DROP TABLE IF EXISTS cf_prestamos CASCADE;
DROP TABLE IF EXISTS cf_nominas CASCADE;
DROP TABLE IF EXISTS cf_empleados CASCADE;
DROP TABLE IF EXISTS cf_inventario CASCADE;
DROP TABLE IF EXISTS cf_inversionistas CASCADE;
DROP TABLE IF EXISTS cf_proyecto_inversionistas CASCADE;

-- ──────────────────────────────────────────────────────────────────
-- 3. CREAR tablas con schema v2 (columnas en inglés)
-- ──────────────────────────────────────────────────────────────────

-- Inventario / Almacén
CREATE TABLE IF NOT EXISTS cf_inventario (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id   UUID NOT NULL REFERENCES cf_businesses(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT DEFAULT '',
  sku           TEXT DEFAULT '',
  category      TEXT DEFAULT '',
  price         NUMERIC(12,2) DEFAULT 0,
  quantity      INTEGER DEFAULT 0,
  min_stock     INTEGER DEFAULT 5,
  image_url     TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Empleados / Trabajadores
CREATE TABLE IF NOT EXISTS cf_empleados (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id    UUID NOT NULL REFERENCES cf_businesses(id) ON DELETE CASCADE,
  full_name      TEXT NOT NULL,
  phone          TEXT DEFAULT '',
  daily_rate     NUMERIC(10,2) DEFAULT 0,
  pay_frequency  TEXT DEFAULT 'daily' CHECK (pay_frequency IN ('daily','weekly')),
  is_active      BOOLEAN DEFAULT TRUE,
  avatar_url     TEXT DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Nóminas
CREATE TABLE IF NOT EXISTS cf_nominas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id   UUID NOT NULL REFERENCES cf_businesses(id) ON DELETE CASCADE,
  worker_id     UUID REFERENCES cf_empleados(id) ON DELETE SET NULL,
  worker_name   TEXT DEFAULT '',
  project_id    UUID REFERENCES cf_proyectos(id) ON DELETE SET NULL,
  project_name  TEXT DEFAULT '',
  days_worked   NUMERIC(5,1) DEFAULT 0,
  daily_rate    NUMERIC(10,2) DEFAULT 0,
  total         NUMERIC(12,2) DEFAULT 0,
  week_start    DATE,
  week_end      DATE,
  is_paid       BOOLEAN DEFAULT FALSE,
  paid_date     DATE,
  notes         TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Préstamos
CREATE TABLE IF NOT EXISTS cf_prestamos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id   UUID NOT NULL REFERENCES cf_businesses(id) ON DELETE CASCADE,
  worker_id     UUID REFERENCES cf_empleados(id) ON DELETE SET NULL,
  worker_name   TEXT DEFAULT '',
  amount        NUMERIC(12,2) DEFAULT 0,
  remaining     NUMERIC(12,2) DEFAULT 0,
  status        TEXT DEFAULT 'active' CHECK (status IN ('active','paid')),
  date          DATE DEFAULT CURRENT_DATE,
  notes         TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Deducciones de préstamo
CREATE TABLE IF NOT EXISTS cf_deducciones_prestamo (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id     UUID NOT NULL REFERENCES cf_prestamos(id) ON DELETE CASCADE,
  amount      NUMERIC(12,2) DEFAULT 0,
  date        DATE DEFAULT CURRENT_DATE,
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────────
-- 4. NUEVAS TABLAS: Inversionistas
-- ──────────────────────────────────────────────────────────────────

-- Inversionistas (personas/entidades)
CREATE TABLE IF NOT EXISTS cf_inversionistas (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id    UUID NOT NULL REFERENCES cf_businesses(id) ON DELETE CASCADE,
  nombre         TEXT NOT NULL,
  email          TEXT DEFAULT '',
  telefono       TEXT DEFAULT '',
  empresa        TEXT DEFAULT '',
  capital_total  NUMERIC(14,2) DEFAULT 0,
  notas          TEXT DEFAULT '',
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Asignación de inversionistas a proyectos
CREATE TABLE IF NOT EXISTS cf_proyecto_inversionistas (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id         UUID NOT NULL REFERENCES cf_businesses(id) ON DELETE CASCADE,
  proyecto_id         UUID REFERENCES cf_proyectos(id) ON DELETE SET NULL,
  inversionista_id    UUID REFERENCES cf_inversionistas(id) ON DELETE CASCADE,
  capital_invertido   NUMERIC(14,2) DEFAULT 0,
  porcentaje_ganancia NUMERIC(5,2)  DEFAULT 0,
  ganancia_estimada   NUMERIC(14,2) DEFAULT 0,
  ganancia_real       NUMERIC(14,2) DEFAULT 0,
  status              TEXT DEFAULT 'activo' CHECK (status IN ('activo','pagado','cancelado')),
  fecha_inicio        DATE,
  fecha_pago          DATE,
  notas               TEXT DEFAULT '',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────────────

ALTER TABLE cf_inventario              ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_empleados               ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_nominas                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_prestamos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_deducciones_prestamo    ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_inversionistas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_proyecto_inversionistas ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para service_role (API anon usa service_role key)
CREATE POLICY "allow_all_cf_inventario"              ON cf_inventario              FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_cf_empleados"               ON cf_empleados               FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_cf_nominas"                 ON cf_nominas                 FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_cf_prestamos"               ON cf_prestamos               FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_cf_deducciones"             ON cf_deducciones_prestamo    FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_cf_inversionistas"          ON cf_inversionistas          FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_cf_proyecto_inversionistas" ON cf_proyecto_inversionistas FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ──────────────────────────────────────────────────────────────────
-- 6. DATOS DEMO para empresas existentes
-- ──────────────────────────────────────────────────────────────────

-- Obtener IDs de negocios existentes
DO $$
DECLARE
  demo_bid UUID;
  agro_bid UUID;
  emp1_id  UUID;
  emp2_id  UUID;
  emp3_id  UUID;
  prest1   UUID;
BEGIN
  SELECT id INTO demo_bid FROM cf_businesses WHERE name ILIKE '%demo%' OR name ILIKE '%campo%' ORDER BY created_at LIMIT 1;
  SELECT id INTO agro_bid FROM cf_businesses WHERE name ILIKE '%agro%' ORDER BY created_at LIMIT 1;

  -- ── DEMO business ──
  IF demo_bid IS NOT NULL THEN

    -- Inventario
    INSERT INTO cf_inventario (business_id, name, category, price, quantity, min_stock) VALUES
      (demo_bid, 'Semillas de maíz híbrido', 'Semillas', 850, 200, 50),
      (demo_bid, 'Fertilizante NPK 15-15-15', 'Agroquímicos', 1200, 50, 10),
      (demo_bid, 'Herbicida Roundup', 'Agroquímicos', 2500, 20, 5),
      (demo_bid, 'Manguera de riego 100m', 'Equipos', 3500, 5, 2),
      (demo_bid, 'Bomba de agua 2HP', 'Equipos', 18000, 2, 1);

    -- Empleados
    INSERT INTO cf_empleados (id, business_id, full_name, phone, daily_rate, pay_frequency) VALUES
      (uuid_generate_v4(), demo_bid, 'Pedro Hernández', '809-555-0010', 1200, 'daily'),
      (uuid_generate_v4(), demo_bid, 'Luis Martínez', '809-555-0011', 1200, 'daily'),
      (uuid_generate_v4(), demo_bid, 'Ana López', '809-555-0012', 1400, 'weekly')
    RETURNING id INTO emp1_id;

    -- Nominas (solo si hay empleados)
    FOR emp1_id IN SELECT id FROM cf_empleados WHERE business_id = demo_bid LIMIT 3 LOOP
      INSERT INTO cf_nominas (business_id, worker_id, worker_name, days_worked, daily_rate, total, week_start, week_end, is_paid)
      SELECT demo_bid, emp1_id, full_name, 6, daily_rate, daily_rate * 6,
             (CURRENT_DATE - INTERVAL '7 days')::DATE, CURRENT_DATE::DATE, FALSE
      FROM cf_empleados WHERE id = emp1_id;
    END LOOP;

    -- Préstamos
    SELECT id INTO emp2_id FROM cf_empleados WHERE business_id = demo_bid ORDER BY created_at LIMIT 1;
    IF emp2_id IS NOT NULL THEN
      INSERT INTO cf_prestamos (id, business_id, worker_id, worker_name, amount, remaining, status, date)
      SELECT uuid_generate_v4(), demo_bid, emp2_id, full_name, 8000, 8000, 'active', CURRENT_DATE - 30
      FROM cf_empleados WHERE id = emp2_id
      RETURNING id INTO prest1;
    END IF;

    -- Inversionistas
    INSERT INTO cf_inversionistas (business_id, nombre, email, telefono, empresa, capital_total) VALUES
      (demo_bid, 'Roberto Castillo', 'roberto@inversiones.com', '809-999-0001', 'Inversiones RC SRL', 500000),
      (demo_bid, 'María Fondeur', 'maria@fondeur.com', '829-888-0002', NULL, 300000);

  END IF;

END $$;

-- ══════════════════════════════════════════════════════════════════
-- ✅ Migración completada. Ya puedes iniciar sesión con PIN 1234
-- ══════════════════════════════════════════════════════════════════
