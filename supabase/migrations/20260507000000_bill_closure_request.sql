-- ============================================================
-- COMANDA PRO - Solicitação de Fechamento de Conta
-- ============================================================

-- 1. Adicionar colunas na tabela tables se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tables' AND column_name = 'payment_requested') THEN
    ALTER TABLE public.tables ADD COLUMN payment_requested BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tables' AND column_name = 'payment_requested_at') THEN
    ALTER TABLE public.tables ADD COLUMN payment_requested_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tables' AND column_name = 'payment_requested_amount') THEN
    ALTER TABLE public.tables ADD COLUMN payment_requested_amount NUMERIC(10,2);
  END IF;
END $$;

-- 2. RPC para solicitar fechamento de conta
CREATE OR REPLACE FUNCTION public.request_bill_closure(p_table_id UUID, p_total_amount NUMERIC)
RETURNS JSONB AS $$
DECLARE
  v_table public.tables%ROWTYPE;
BEGIN
  -- Buscar mesa e travar para atualização
  SELECT * INTO v_table FROM public.tables WHERE id = p_table_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mesa nao encontrada.' USING ERRCODE = 'P0002';
  END IF;

  -- Atualizar a mesa
  UPDATE public.tables 
  SET payment_requested = true,
      payment_requested_at = now(),
      payment_requested_amount = p_total_amount
  WHERE id = p_table_id;

  -- Registrar log de atividade
  INSERT INTO public.activity_logs (restaurant_id, table_id, event_type, description, metadata)
  VALUES (
    v_table.restaurant_id, 
    p_table_id, 
    'payment_requested', 
    format('Mesa %s solicitou o fechamento da conta (R$ %s)', v_table.number, p_total_amount),
    jsonb_build_object('amount', p_total_amount, 'requested_at', now())
  );

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Permissões
REVOKE ALL ON FUNCTION public.request_bill_closure(UUID, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_bill_closure(UUID, NUMERIC) TO anon, authenticated;
