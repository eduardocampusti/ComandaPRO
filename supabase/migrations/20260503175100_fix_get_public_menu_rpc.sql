-- Fix public QR menu RPC expected by src/lib/database.ts:getPublicMenu(tableId).
-- Exposes only the minimal public menu payload for a table UUID.

BEGIN;

CREATE OR REPLACE FUNCTION public.get_public_menu(p_table_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_table_id UUID;
  v_restaurant_id UUID;
  v_table_number INTEGER;
  v_table_status TEXT;
  v_table_active BOOLEAN;
BEGIN
  SELECT
    t.id,
    t.restaurant_id,
    t.number,
    t.status,
    t.active
  INTO
    v_table_id,
    v_restaurant_id,
    v_table_number,
    v_table_status,
    v_table_active
  FROM public.tables t
  WHERE t.id = p_table_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mesa nao encontrada.' USING ERRCODE = 'P0002';
  END IF;

  IF v_table_status = 'reserved' THEN
    RAISE EXCEPTION 'Mesa reservada no momento.' USING ERRCODE = 'P0001';
  END IF;

  IF v_table_status NOT IN ('available', 'occupied') THEN
    RAISE EXCEPTION 'Mesa indisponivel para pedidos.' USING ERRCODE = 'P0001';
  END IF;

  RETURN jsonb_build_object(
    'table', jsonb_build_object(
      'id', v_table_id,
      'number', v_table_number,
      'status', v_table_status,
      'active', COALESCE(v_table_active, false)
    ),
    'restaurant', COALESCE((
      SELECT jsonb_build_object(
        'business_name', s.business_name,
        'logo_url', s.logo_url,
        'theme_color', s.theme_color,
        'custom_theme_hex', s.custom_theme_hex
      )
      FROM public.settings s
      WHERE s.restaurant_id = v_restaurant_id
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
        WHERE mi.restaurant_id = v_restaurant_id
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
      WHERE mi.restaurant_id = v_restaurant_id
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
      WHERE o.restaurant_id = v_restaurant_id
        AND o.table_id = v_table_id
        AND o.status IN ('pending', 'preparing', 'ready', 'delivered', 'served', 'cancelled')
    ), '[]'::jsonb)
  );
END;
$$;

COMMENT ON FUNCTION public.get_public_menu(UUID)
IS 'Returns the public QR menu payload for one table without exposing tenant-sensitive data.';

REVOKE ALL ON FUNCTION public.get_public_menu(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_menu(UUID) TO anon, authenticated;

-- Force PostgREST/Supabase API to refresh the RPC schema cache after applying.
NOTIFY pgrst, 'reload schema';

COMMIT;
