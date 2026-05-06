-- ============================================================
-- Comanda Digital Pro - Supabase schema (secure SaaS base)
-- Phase 0: public QR flow + multi-restaurant isolation
-- Run this SQL in Supabase SQL Editor.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================== TABLES ========================

CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  subscription_status TEXT NOT NULL DEFAULT 'trial'
    CHECK (subscription_status IN ('active', 'inactive', 'trial', 'past_due', 'canceled')),
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  full_name TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'kitchen', 'cashier')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tables (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'occupied', 'reserved')),
  capacity INTEGER NOT NULL DEFAULT 4,
  active BOOLEAN NOT NULL DEFAULT false,
  opened_at TIMESTAMPTZ,
  current_session_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, number)
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'closed')),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL DEFAULT 'Geral',
  image_url TEXT DEFAULT '',
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','preparing','ready','delivered','served','paid','archived','cancelled')),
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  customer_name TEXT,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'qr'
    CHECK (source IN ('qr', 'staff', 'pos', 'api')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migration-safe additions for existing databases.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'qr'
  CHECK (source IN ('qr', 'staff', 'pos', 'api'));

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  guests INTEGER NOT NULL DEFAULT 2,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'seated', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT DEFAULT 'general',
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  theme_color TEXT NOT NULL DEFAULT 'emerald',
  custom_theme_hex TEXT NOT NULL DEFAULT '#10b981',
  logo_url TEXT NOT NULL DEFAULT '',
  business_name TEXT NOT NULL DEFAULT 'Comanda Digital Pro',
  cnpj TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (restaurant_id, id)
);

-- ======================== INDEXES ========================

CREATE INDEX IF NOT EXISTS idx_profiles_restaurant_id ON public.profiles(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant_id ON public.tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_restaurant_id ON public.sessions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_public_menu ON public.menu_items(restaurant_id, available, category, name);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_status ON public.orders(table_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_restaurant_id ON public.order_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_id ON public.reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_settings_restaurant_id ON public.settings(restaurant_id);

-- ======================== TENANT HELPERS ========================

CREATE OR REPLACE FUNCTION public.current_restaurant_id()
RETURNS UUID AS $$
  SELECT restaurant_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.set_restaurant_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.restaurant_id IS NULL THEN
    NEW.restaurant_id := public.current_restaurant_id();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS tr_set_restaurant_id_tables ON public.tables;
DROP TRIGGER IF EXISTS tr_set_restaurant_id_menu ON public.menu_items;
DROP TRIGGER IF EXISTS tr_set_restaurant_id_orders ON public.orders;
DROP TRIGGER IF EXISTS tr_set_restaurant_id_order_items ON public.order_items;
DROP TRIGGER IF EXISTS tr_set_restaurant_id_sessions ON public.sessions;
DROP TRIGGER IF EXISTS tr_set_restaurant_id_reservations ON public.reservations;
DROP TRIGGER IF EXISTS tr_set_restaurant_id_settings ON public.settings;

CREATE TRIGGER tr_set_restaurant_id_tables BEFORE INSERT ON public.tables
  FOR EACH ROW EXECUTE FUNCTION public.set_restaurant_id();
CREATE TRIGGER tr_set_restaurant_id_menu BEFORE INSERT ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.set_restaurant_id();
CREATE TRIGGER tr_set_restaurant_id_orders BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_restaurant_id();
CREATE TRIGGER tr_set_restaurant_id_order_items BEFORE INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.set_restaurant_id();
CREATE TRIGGER tr_set_restaurant_id_sessions BEFORE INSERT ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_restaurant_id();
CREATE TRIGGER tr_set_restaurant_id_reservations BEFORE INSERT ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.set_restaurant_id();
CREATE TRIGGER tr_set_restaurant_id_settings BEFORE INSERT ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.set_restaurant_id();

-- ======================== PUBLIC QR RPCS ========================

CREATE OR REPLACE FUNCTION public.get_public_menu(p_table_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_table public.tables%ROWTYPE;
BEGIN
  SELECT *
  INTO v_table
  FROM public.tables
  WHERE id = p_table_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mesa nao encontrada.' USING ERRCODE = 'P0002';
  END IF;

  IF v_table.status = 'reserved' THEN
    RAISE EXCEPTION 'Mesa reservada no momento.' USING ERRCODE = 'P0001';
  END IF;

  IF v_table.status NOT IN ('available', 'occupied') THEN
    RAISE EXCEPTION 'Mesa indisponivel para pedidos.' USING ERRCODE = 'P0001';
  END IF;

  RETURN jsonb_build_object(
    'table', jsonb_build_object(
      'id', v_table.id,
      'number', v_table.number,
      'status', v_table.status,
      'active', v_table.active
    ),
    'restaurant', COALESCE((
      SELECT jsonb_build_object(
        'business_name', s.business_name,
        'logo_url', s.logo_url,
        'theme_color', s.theme_color,
        'custom_theme_hex', s.custom_theme_hex
      )
      FROM public.settings s
      WHERE s.restaurant_id = v_table.restaurant_id
        AND s.id = 'general'
      LIMIT 1
    ), jsonb_build_object(
      'business_name', 'Comanda Digital Pro',
      'logo_url', '',
      'theme_color', 'emerald',
      'custom_theme_hex', '#10b981'
    )),
    'categories', COALESCE((
      SELECT jsonb_agg(category ORDER BY category)
      FROM (
        SELECT DISTINCT mi.category
        FROM public.menu_items mi
        WHERE mi.restaurant_id = v_table.restaurant_id
          AND mi.available = true
      ) categories
    ), '[]'::jsonb),
    'items', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', mi.id,
          'name', mi.name,
          'description', mi.description,
          'price', mi.price,
          'category', mi.category,
          'image_url', mi.image_url,
          'available', mi.available,
          'created_at', mi.created_at
        )
        ORDER BY mi.category, mi.name
      )
      FROM public.menu_items mi
      WHERE mi.restaurant_id = v_table.restaurant_id
        AND mi.available = true
    ), '[]'::jsonb),
    'orders', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', o.id,
          'table_id', o.table_id,
          'items', o.items,
          'status', o.status,
          'total_amount', o.total_amount,
          'created_at', o.created_at
        )
        ORDER BY o.created_at DESC
      )
      FROM public.orders o
      WHERE o.restaurant_id = v_table.restaurant_id
        AND o.table_id = p_table_id
        AND o.status IN ('pending', 'preparing', 'ready', 'delivered', 'served', 'cancelled')
    ), '[]'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.create_public_order(
  p_table_id UUID,
  p_items JSONB,
  p_customer_name TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_table public.tables%ROWTYPE;
  v_order public.orders%ROWTYPE;
  v_session_id UUID;
  v_public_items JSONB;
  v_total NUMERIC(10,2);
  v_invalid_count INTEGER;
  v_customer_name TEXT;
  v_notes TEXT;
BEGIN
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'Pedido vazio.' USING ERRCODE = '22023';
  END IF;

  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Pedido vazio.' USING ERRCODE = '22023';
  END IF;

  IF jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'Pedido possui itens demais.' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_table
  FROM public.tables
  WHERE id = p_table_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mesa nao encontrada.' USING ERRCODE = 'P0002';
  END IF;

  IF v_table.status = 'reserved' THEN
    RAISE EXCEPTION 'Mesa reservada no momento.' USING ERRCODE = 'P0001';
  END IF;

  IF v_table.status NOT IN ('available', 'occupied') THEN
    RAISE EXCEPTION 'Mesa indisponivel para pedidos.' USING ERRCODE = 'P0001';
  END IF;

  WITH requested AS (
    SELECT
      CASE
        WHEN (raw_item->>'menu_item_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          THEN (raw_item->>'menu_item_id')::uuid
        ELSE NULL
      END AS menu_item_id,
      CASE
        WHEN (raw_item->>'quantity') ~ '^[0-9]+$'
          THEN (raw_item->>'quantity')::integer
        ELSE 0
      END AS quantity
    FROM jsonb_array_elements(p_items) AS item(raw_item)
  )
  SELECT COUNT(*)
  INTO v_invalid_count
  FROM requested
  WHERE menu_item_id IS NULL
    OR quantity <= 0
    OR quantity > 100;

  IF v_invalid_count > 0 THEN
    RAISE EXCEPTION 'Itens invalidos no pedido.' USING ERRCODE = '22023';
  END IF;

  WITH requested AS (
    SELECT
      (raw_item->>'menu_item_id')::uuid AS menu_item_id,
      (raw_item->>'quantity')::integer AS quantity
    FROM jsonb_array_elements(p_items) AS item(raw_item)
  )
  SELECT COUNT(*)
  INTO v_invalid_count
  FROM requested r
  LEFT JOIN public.menu_items mi
    ON mi.id = r.menu_item_id
   AND mi.restaurant_id = v_table.restaurant_id
   AND mi.available = true
  WHERE mi.id IS NULL;

  IF v_invalid_count > 0 THEN
    RAISE EXCEPTION 'Um ou mais itens nao pertencem a este restaurante ou estao indisponiveis.' USING ERRCODE = '22023';
  END IF;

  WITH requested AS (
    SELECT
      (raw_item->>'menu_item_id')::uuid AS menu_item_id,
      (raw_item->>'quantity')::integer AS quantity,
      NULLIF(left(btrim(COALESCE(raw_item->>'notes', '')), 500), '') AS notes
    FROM jsonb_array_elements(p_items) AS item(raw_item)
  ),
  valid_items AS (
    SELECT
      mi.id,
      mi.name,
      mi.price,
      mi.category,
      r.quantity,
      r.notes
    FROM requested r
    JOIN public.menu_items mi
      ON mi.id = r.menu_item_id
     AND mi.restaurant_id = v_table.restaurant_id
     AND mi.available = true
  )
  SELECT
    jsonb_agg(
      jsonb_build_object(
        'menu_item_id', id,
        'name', name,
        'price', price,
        'quantity', quantity,
        'notes', notes
      )
      ORDER BY category, name
    ),
    COALESCE(SUM(price * quantity), 0)
  INTO v_public_items, v_total
  FROM valid_items;

  IF v_public_items IS NULL OR v_total <= 0 THEN
    RAISE EXCEPTION 'Pedido vazio.' USING ERRCODE = '22023';
  END IF;

  v_customer_name := NULLIF(left(btrim(COALESCE(p_customer_name, '')), 120), '');
  v_notes := NULLIF(left(btrim(COALESCE(p_notes, '')), 500), '');

  IF v_table.status = 'available'
    OR v_table.active = false
    OR v_table.current_session_id IS NULL THEN
    INSERT INTO public.sessions (restaurant_id, table_id, status, opened_at)
    VALUES (v_table.restaurant_id, p_table_id, 'active', now())
    RETURNING id INTO v_session_id;

    UPDATE public.tables
    SET status = 'occupied',
        active = true,
        opened_at = COALESCE(opened_at, now()),
        current_session_id = v_session_id
    WHERE id = p_table_id;
  END IF;

  INSERT INTO public.orders (
    restaurant_id,
    table_id,
    items,
    status,
    total_amount,
    customer_name,
    notes,
    source,
    created_at
  )
  VALUES (
    v_table.restaurant_id,
    p_table_id,
    v_public_items,
    'pending',
    v_total,
    v_customer_name,
    v_notes,
    'qr',
    now()
  )
  RETURNING * INTO v_order;

  WITH requested AS (
    SELECT
      (raw_item->>'menu_item_id')::uuid AS menu_item_id,
      (raw_item->>'quantity')::integer AS quantity,
      NULLIF(left(btrim(COALESCE(raw_item->>'notes', '')), 500), '') AS notes
    FROM jsonb_array_elements(p_items) AS item(raw_item)
  )
  INSERT INTO public.order_items (
    restaurant_id,
    order_id,
    table_id,
    menu_item_id,
    name,
    price,
    quantity,
    notes
  )
  SELECT
    v_table.restaurant_id,
    v_order.id,
    p_table_id,
    mi.id,
    mi.name,
    mi.price,
    r.quantity,
    r.notes
  FROM requested r
  JOIN public.menu_items mi
    ON mi.id = r.menu_item_id
   AND mi.restaurant_id = v_table.restaurant_id
   AND mi.available = true;

  RETURN jsonb_build_object(
    'id', v_order.id,
    'table_id', v_order.table_id,
    'items', v_order.items,
    'status', v_order.status,
    'total_amount', v_order.total_amount,
    'created_at', v_order.created_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ======================== RLS ========================

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'restaurants',
        'profiles',
        'tables',
        'sessions',
        'menu_items',
        'orders',
        'order_items',
        'reservations',
        'settings'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  END LOOP;
END $$;

CREATE POLICY restaurants_select_own ON public.restaurants
  FOR SELECT TO authenticated
  USING (id = public.current_restaurant_id());

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY tables_tenant_access ON public.tables
  FOR ALL TO authenticated
  USING (restaurant_id = public.current_restaurant_id())
  WITH CHECK (restaurant_id = public.current_restaurant_id());

CREATE POLICY sessions_tenant_access ON public.sessions
  FOR ALL TO authenticated
  USING (restaurant_id = public.current_restaurant_id())
  WITH CHECK (restaurant_id = public.current_restaurant_id());

CREATE POLICY menu_items_tenant_access ON public.menu_items
  FOR ALL TO authenticated
  USING (restaurant_id = public.current_restaurant_id())
  WITH CHECK (restaurant_id = public.current_restaurant_id());

CREATE POLICY orders_tenant_access ON public.orders
  FOR ALL TO authenticated
  USING (restaurant_id = public.current_restaurant_id())
  WITH CHECK (restaurant_id = public.current_restaurant_id());

CREATE POLICY order_items_tenant_access ON public.order_items
  FOR ALL TO authenticated
  USING (restaurant_id = public.current_restaurant_id())
  WITH CHECK (restaurant_id = public.current_restaurant_id());

CREATE POLICY reservations_tenant_access ON public.reservations
  FOR ALL TO authenticated
  USING (restaurant_id = public.current_restaurant_id())
  WITH CHECK (restaurant_id = public.current_restaurant_id());

CREATE POLICY settings_tenant_access ON public.settings
  FOR ALL TO authenticated
  USING (restaurant_id = public.current_restaurant_id())
  WITH CHECK (restaurant_id = public.current_restaurant_id());

-- Public QR access is intentionally exposed only through RPCs.
REVOKE ALL ON TABLE public.restaurants, public.profiles, public.tables, public.sessions,
  public.menu_items, public.orders, public.order_items, public.reservations, public.settings
  FROM anon;

REVOKE ALL ON FUNCTION public.current_restaurant_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_restaurant_id() TO authenticated;

REVOKE ALL ON FUNCTION public.get_public_menu(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_menu(UUID) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.create_public_order(UUID, JSONB, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_public_order(UUID, JSONB, TEXT, TEXT) TO anon, authenticated;

-- ======================== REALTIME ========================

DO $$
DECLARE
  realtime_table TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    FOREACH realtime_table IN ARRAY ARRAY[
      'tables',
      'orders',
      'order_items',
      'menu_items',
      'sessions',
      'reservations',
      'settings'
    ]
    LOOP
      IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = realtime_table
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', realtime_table);
      END IF;
    END LOOP;
  END IF;
END $$;

-- ============================================================
-- INITIAL DEVELOPMENT SETUP
-- ============================================================
/*
  To enable local panel access:

  1. Create a user in Supabase Auth.
  2. Copy that user's UUID.
  3. Run the SQL below with the copied values:

  INSERT INTO public.restaurants (id, name, subscription_status)
  VALUES (uuid_generate_v4(), 'Meu Restaurante Local', 'active')
  RETURNING id;

  INSERT INTO public.profiles (id, restaurant_id, role)
  VALUES ('USER_ID', 'RESTAURANT_ID', 'admin');

  INSERT INTO public.settings (restaurant_id, business_name)
  VALUES ('RESTAURANT_ID', 'Meu Restaurante Local');
*/
