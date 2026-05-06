-- ============================================================
-- COMANDA PRO - Módulo de Cardápio V2
-- Refinamento da Lógica de Pedidos e Validação de Opcionais
-- ============================================================

-- 1. Atualizar get_public_menu para retornar os novos campos de opcionais
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
      SELECT jsonb_agg(c.name ORDER BY c.sort_order, c.name)
      FROM public.categories c
      WHERE c.restaurant_id = v_table.restaurant_id
        AND c.active = true
    ), '[]'::jsonb),
    'items', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', mi.id,
          'name', mi.name,
          'description', mi.description,
          'price', mi.price,
          'category', COALESCE(c.name, mi.category),
          'image_url', mi.image_url,
          'available', mi.available,
          'created_at', mi.created_at,
          'options', COALESCE((
             SELECT jsonb_agg(
               jsonb_build_object(
                 'id', mio.id,
                 'name', mio.name,
                 'price', mio.price,
                 'type', mio.type,
                 'group_name', mio.group_name,
                 'min_select', mio.min_select,
                 'max_select', mio.max_select,
                 'sort_order', mio.sort_order
               ) ORDER BY mio.sort_order, mio.name
             )
             FROM public.menu_item_options mio
             WHERE mio.menu_item_id = mi.id
               AND mio.active = true
          ), '[]'::jsonb)
        )
        ORDER BY c.sort_order, mi.name
      )
      FROM public.menu_items mi
      LEFT JOIN public.categories c ON c.id = mi.category_id
      WHERE mi.restaurant_id = v_table.restaurant_id
        AND mi.available = true
        AND mi.is_archived = false
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

-- 2. Atualizar create_public_order com validação de limites e snapshot completo
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
  v_total NUMERIC(10,2) := 0;
  v_invalid_count INTEGER;
  v_customer_name TEXT;
  v_notes TEXT;
  v_item RECORD;
  v_opt_group RECORD;
  v_item_total NUMERIC(10,2);
  v_calculated_items JSONB := '[]'::jsonb;
BEGIN
  -- Basic validations
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Pedido vazio.' USING ERRCODE = '22023';
  END IF;

  IF jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'Pedido possui itens demais.' USING ERRCODE = '22023';
  END IF;

  -- Get table and lock
  SELECT * INTO v_table FROM public.tables WHERE id = p_table_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Mesa nao encontrada.' USING ERRCODE = 'P0002'; END IF;
  
  IF v_table.status = 'reserved' THEN RAISE EXCEPTION 'Mesa reservada.' USING ERRCODE = 'P0001'; END IF;
  IF v_table.status NOT IN ('available', 'occupied') THEN RAISE EXCEPTION 'Mesa indisponivel.' USING ERRCODE = 'P0001'; END IF;

  -- Process each item for strict validation and calculation
  FOR v_item IN (
    SELECT 
      (raw->>'menu_item_id')::uuid as menu_item_id,
      (raw->>'quantity')::integer as quantity,
      COALESCE(raw->'options', '[]'::jsonb) as selected_option_ids,
      NULLIF(left(btrim(COALESCE(raw->>'notes', '')), 500), '') as notes
    FROM jsonb_array_elements(p_items) as raw
  ) LOOP
    
    -- 1. Validate Base Item
    DECLARE
      v_menu_item public.menu_items%ROWTYPE;
      v_snapshot_options JSONB := '[]'::jsonb;
      v_selected_count INTEGER;
    BEGIN
      SELECT * INTO v_menu_item 
      FROM public.menu_items 
      WHERE id = v_item.menu_item_id 
        AND restaurant_id = v_table.restaurant_id
        AND available = true 
        AND is_archived = false;
        
      IF NOT FOUND THEN RAISE EXCEPTION 'Item % indisponivel.', v_item.menu_item_id; END IF;
      IF v_item.quantity <= 0 OR v_item.quantity > 100 THEN RAISE EXCEPTION 'Quantidade invalida.'; END IF;

      v_item_total := v_menu_item.price;

      -- 2. Validate and Snapshot Options
      -- Group validation logic
      FOR v_opt_group IN (
        SELECT 
          group_name, 
          min_select, 
          max_select,
          array_agg(id) as group_option_ids
        FROM public.menu_item_options
        WHERE menu_item_id = v_item.menu_item_id
          AND active = true
        GROUP BY group_name, min_select, max_select
      ) LOOP
        -- Count how many from this group were selected
        SELECT count(*) INTO v_selected_count
        FROM jsonb_array_elements_text(v_item.selected_option_ids) as sid
        WHERE sid::uuid = ANY(v_opt_group.group_option_ids);

        -- Check min/max
        IF v_selected_count < v_opt_group.min_select THEN
          RAISE EXCEPTION 'Selecione pelo menos % opcao(oes) em %', v_opt_group.min_select, COALESCE(v_opt_group.group_name, 'o grupo');
        END IF;
        
        IF v_opt_group.max_select IS NOT NULL AND v_selected_count > v_opt_group.max_select THEN
          RAISE EXCEPTION 'Selecione no maximo % opcao(oes) em %', v_opt_group.max_select, COALESCE(v_opt_group.group_name, 'o grupo');
        END IF;
      END LOOP;

      -- 3. Calculate Prices and Build Snapshot
      SELECT 
        jsonb_agg(jsonb_build_object('id', mio.id, 'name', mio.name, 'price', mio.price)),
        COALESCE(SUM(mio.price), 0)
      INTO v_snapshot_options, v_item_total
      FROM public.menu_item_options mio
      WHERE mio.id IN (SELECT (jsonb_array_elements_text(v_item.selected_option_ids))::uuid)
        AND mio.menu_item_id = v_item.menu_item_id
        AND mio.active = true;

      v_item_total := v_menu_item.price + COALESCE(v_item_total, 0);

      -- Add to calculated items list
      v_calculated_items := v_calculated_items || jsonb_build_object(
        'menu_item_id', v_menu_item.id,
        'name', v_menu_item.name,
        'price', v_item_total,
        'quantity', v_item.quantity,
        'notes', v_item.notes,
        'options', COALESCE(v_snapshot_options, '[]'::jsonb)
      );

      v_total := v_total + (v_item_total * v_item.quantity);
    END;
  END LOOP;

  -- Create Order and Items
  v_customer_name := NULLIF(left(btrim(COALESCE(p_customer_name, '')), 120), '');
  v_notes := NULLIF(left(btrim(COALESCE(p_notes, '')), 500), '');

  -- Auto-session logic
  IF v_table.status = 'available' OR v_table.active = false OR v_table.current_session_id IS NULL THEN
    INSERT INTO public.sessions (restaurant_id, table_id, status, opened_at)
    VALUES (v_table.restaurant_id, p_table_id, 'active', now())
    RETURNING id INTO v_session_id;

    UPDATE public.tables SET status = 'occupied', active = true, opened_at = COALESCE(opened_at, now()), current_session_id = v_session_id WHERE id = p_table_id;
  END IF;

  INSERT INTO public.orders (restaurant_id, table_id, items, status, total_amount, customer_name, notes, source, created_at)
  VALUES (v_table.restaurant_id, p_table_id, v_calculated_items, 'pending', v_total, v_customer_name, v_notes, 'qr', now())
  RETURNING * INTO v_order;

  INSERT INTO public.order_items (restaurant_id, order_id, table_id, menu_item_id, name, price, quantity, notes, options)
  SELECT v_table.restaurant_id, v_order.id, p_table_id, (it->>'menu_item_id')::uuid, it->>'name', (it->>'price')::numeric, (it->>'quantity')::integer, it->>'notes', it->'options'
  FROM jsonb_array_elements(v_calculated_items) as it;

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

REVOKE ALL ON FUNCTION public.get_public_menu(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_menu(UUID) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.create_public_order(UUID, JSONB, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_public_order(UUID, JSONB, TEXT, TEXT) TO anon, authenticated;
