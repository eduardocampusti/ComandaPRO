-- ============================================================
-- COMANDA PRO - Limpeza de Mesas Estagnadas
-- ============================================================

-- Função para limpar mesas ocupadas sem pedidos ativos há mais de 3 minutos
-- Uma mesa é considerada estagnada se:
-- 1. Status = 'occupied'
-- 2. Não possui pedidos ativos (pending, preparing, ready, delivered, served)
-- 3. O 'opened_at' (atualizado no scan do QR) foi há mais de 3 minutos
CREATE OR REPLACE FUNCTION public.cleanup_stale_tables()
RETURNS JSONB AS $$
DECLARE
  v_count INTEGER := 0;
  v_restaurant_id UUID;
BEGIN
  -- Obter o ID do restaurante atual para garantir segurança no multi-tenant
  v_restaurant_id := public.current_restaurant_id();
  
  -- Identificar e atualizar mesas estagnadas
  WITH tables_to_free AS (
    SELECT t.id, t.number
    FROM public.tables t
    LEFT JOIN public.orders o ON o.table_id = t.id AND o.status IN ('pending', 'preparing', 'ready', 'delivered', 'served')
    WHERE t.status = 'occupied'
      AND t.opened_at < (now() - interval '3 minutes')
      AND t.restaurant_id = v_restaurant_id
    GROUP BY t.id, t.number
    HAVING count(o.id) = 0
  )
  UPDATE public.tables
  SET status = 'available',
      active = false,
      opened_at = NULL,
      current_session_id = NULL
  WHERE id IN (SELECT id FROM tables_to_free)
    AND restaurant_id = v_restaurant_id;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Registrar log se houver mesas limpas
  IF v_count > 0 THEN
    INSERT INTO public.activity_logs (restaurant_id, event_type, description, metadata)
    VALUES (
      v_restaurant_id,
      'stale_tables_cleanup',
      format('%s mesa(s) inativa(s) foram liberadas automaticamente pelo sistema.', v_count),
      jsonb_build_object('tables_count', v_count, 'timestamp', now())
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true, 
    'cleaned_count', v_count,
    'message', format('%s mesa(s) limpa(s).', v_count)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Permissões
REVOKE ALL ON FUNCTION public.cleanup_stale_tables() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_stale_tables() TO authenticated;

-- Comentário para documentação
COMMENT ON FUNCTION public.cleanup_stale_tables() IS 'Libera mesas ocupadas sem pedidos ativos e sem atividade de QR Code por mais de 3 minutos.';
