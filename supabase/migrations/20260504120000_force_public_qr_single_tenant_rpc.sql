-- Force-refresh public QR RPCs for the deployed single-tenant schema.
-- This intentionally drops the old multi-tenant signatures before recreating
-- them so Supabase/PostgREST cannot keep using a body that references
-- restaurant_id or order_items.

BEGIN;

DROP FUNCTION IF EXISTS public.get_public_menu(UUID);
DROP FUNCTION IF EXISTS public.create_public_order(UUID, JSONB, TEXT, TEXT);

CREATE FUNCTION public.get_public_menu(p_table_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
      'active', COALESCE(v_table.active, false)
    ),
    'restaurant', COALESCE((
      SELECT jsonb_build_object(
        'business_name', s.business_name,
        'logo_url', s.logo_url,
        'theme_color', s.theme_color,
        'custom_theme_hex', s.custom_theme_hex
      )
      FROM public.settings s
      WHERE s.id = 'general'
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
        WHERE mi.available = true
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
      WHERE mi.available = true
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
      WHERE o.table_id = p_table_id
        AND o.status IN ('pending', 'preparing', 'ready', 'delivered', 'served', 'cancelled')
    ), '[]'::jsonb)
  );
END;
$$;

CREATE FUNCTION public.create_public_order(
  p_table_id UUID,
  p_items JSONB,
  p_customer_name TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_table public.tables%ROWTYPE;
  v_order public.orders%ROWTYPE;
  v_session_id UUID;
  v_public_items JSONB;
  v_total NUMERIC(10,2);
  v_invalid_count INTEGER;
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
   AND mi.available = true
  WHERE mi.id IS NULL;

  IF v_invalid_count > 0 THEN
    RAISE EXCEPTION 'Um ou mais itens estao indisponiveis.' USING ERRCODE = '22023';
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

  IF v_table.status = 'available'
    OR COALESCE(v_table.active, false) = false
    OR v_table.current_session_id IS NULL THEN
    INSERT INTO public.sessions (table_id, status, opened_at)
    VALUES (p_table_id, 'active', now())
    RETURNING id INTO v_session_id;

    UPDATE public.tables
    SET status = 'occupied',
        active = true,
        opened_at = COALESCE(opened_at, now()),
        current_session_id = v_session_id
    WHERE id = p_table_id;
  END IF;

  INSERT INTO public.orders (
    table_id,
    items,
    status,
    total_amount,
    created_at
  )
  VALUES (
    p_table_id,
    v_public_items,
    'pending',
    v_total,
    now()
  )
  RETURNING * INTO v_order;

  RETURN jsonb_build_object(
    'id', v_order.id,
    'table_id', v_order.table_id,
    'items', v_order.items,
    'status', v_order.status,
    'total_amount', v_order.total_amount,
    'created_at', v_order.created_at
  );
END;
$$;

COMMENT ON FUNCTION public.get_public_menu(UUID)
IS 'Returns the public QR menu payload for the single-tenant schema without exposing sensitive settings.';

COMMENT ON FUNCTION public.create_public_order(UUID, JSONB, TEXT, TEXT)
IS 'Creates a public QR order for the single-tenant schema using validated available menu items.';

REVOKE ALL ON FUNCTION public.get_public_menu(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_menu(UUID) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.create_public_order(UUID, JSONB, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_public_order(UUID, JSONB, TEXT, TEXT) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
