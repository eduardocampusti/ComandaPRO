-- ============================================================
-- COMANDA PRO - Módulo de Cardápio V2
-- Adiciona suporte a Limites de Seleção e Histórico de Opcionais
-- ============================================================

-- 1. Adicionar colunas de agrupamento e limites na tabela menu_item_options
ALTER TABLE public.menu_item_options ADD COLUMN IF NOT EXISTS group_name TEXT;
ALTER TABLE public.menu_item_options ADD COLUMN IF NOT EXISTS min_select INTEGER DEFAULT 0;
ALTER TABLE public.menu_item_options ADD COLUMN IF NOT EXISTS max_select INTEGER DEFAULT NULL;

-- 2. Atualizar limites de dados existentes baseado no tipo
DO $$
BEGIN
    -- Size: deve ter seleção única obrigatória
    UPDATE public.menu_item_options 
    SET min_select = 1, max_select = 1, group_name = 'Tamanho'
    WHERE type = 'size';

    -- Choice: seleção única por padrão (1 a 1)
    UPDATE public.menu_item_options 
    SET min_select = 1, max_select = 1, group_name = 'Escolha'
    WHERE type = 'choice';

    -- Addon: seleção múltipla opcional (0 a N)
    UPDATE public.menu_item_options 
    SET min_select = 0, max_select = NULL, group_name = 'Adicionais'
    WHERE type = 'addon';
END $$;

-- 3. Adicionar coluna options no order_items para guardar o snapshot das opções do pedido
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;

-- 4. Atualizar a RPC create_public_order para recalcular preço no backend de forma atômica
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
   AND mi.is_archived = false
  WHERE mi.id IS NULL;

  IF v_invalid_count > 0 THEN
    RAISE EXCEPTION 'Um ou mais itens nao pertencem a este restaurante ou estao indisponiveis.' USING ERRCODE = '22023';
  END IF;

  WITH requested AS (
    SELECT
      row_number() OVER () AS req_id,
      (raw_item->>'menu_item_id')::uuid AS menu_item_id,
      (raw_item->>'quantity')::integer AS quantity,
      COALESCE(raw_item->'options', '[]'::jsonb) AS options,
      NULLIF(left(btrim(COALESCE(raw_item->>'notes', '')), 500), '') AS notes
    FROM jsonb_array_elements(p_items) AS item(raw_item)
  ),
  requested_options AS (
    SELECT
      r.req_id,
      (opt->>'id')::uuid AS option_id
    FROM requested r, jsonb_array_elements(r.options) AS opt
    WHERE opt->>'id' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  ),
  options_prices AS (
    SELECT
      ro.req_id,
      COALESCE(SUM(mio.price), 0) AS options_total
    FROM requested_options ro
    JOIN requested r ON r.req_id = ro.req_id
    JOIN public.menu_item_options mio 
      ON mio.id = ro.option_id 
     AND mio.menu_item_id = r.menu_item_id 
     AND mio.restaurant_id = v_table.restaurant_id
     AND mio.active = true
    GROUP BY ro.req_id
  ),
  valid_items AS (
    SELECT
      mi.id,
      mi.name,
      (mi.price + COALESCE(op.options_total, 0)) AS price,
      COALESCE(c.name, mi.category) as category,
      r.quantity,
      r.notes,
      r.options
    FROM requested r
    JOIN public.menu_items mi
      ON mi.id = r.menu_item_id
     AND mi.restaurant_id = v_table.restaurant_id
     AND mi.available = true
     AND mi.is_archived = false
    LEFT JOIN options_prices op ON op.req_id = r.req_id
    LEFT JOIN public.categories c ON c.id = mi.category_id
  )
  SELECT
    jsonb_agg(
      jsonb_build_object(
        'menu_item_id', id,
        'name', name,
        'price', price,
        'quantity', quantity,
        'notes', notes,
        'options', options
      )
      ORDER BY category, name
    ),
    COALESCE(SUM(price * quantity), 0)
  INTO v_public_items, v_total
  FROM valid_items;

  IF v_public_items IS NULL OR v_total <= 0 THEN
    RAISE EXCEPTION 'Pedido vazio ou com valor invalido.' USING ERRCODE = '22023';
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

  -- 5. Salva os items individuais com o snapshot das opções para registro seguro
  INSERT INTO public.order_items (
    restaurant_id,
    order_id,
    table_id,
    menu_item_id,
    name,
    price,
    quantity,
    notes,
    options
  )
  SELECT
    v_table.restaurant_id,
    v_order.id,
    p_table_id,
    (item->>'menu_item_id')::uuid,
    item->>'name',
    (item->>'price')::numeric,
    (item->>'quantity')::integer,
    item->>'notes',
    item->'options'
  FROM jsonb_array_elements(v_public_items) AS item;

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
