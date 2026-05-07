-- ============================================================
-- COMANDA PRO - Ocupação Automática e Auditoria
-- ============================================================

-- 1. Tabela de Logs de Atividade
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Habilitar RLS nos logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'activity_logs_tenant_access') THEN
    CREATE POLICY activity_logs_tenant_access ON public.activity_logs
      FOR ALL TO authenticated
      USING (restaurant_id = public.current_restaurant_id())
      WITH CHECK (restaurant_id = public.current_restaurant_id());
  END IF;
END $$;

-- 3. Função para ocupar mesa automaticamente via QR Code
CREATE OR REPLACE FUNCTION public.occupy_public_table(p_table_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_table public.tables%ROWTYPE;
  v_session_id UUID;
BEGIN
  -- Buscar mesa e travar para atualização
  SELECT * INTO v_table FROM public.tables WHERE id = p_table_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mesa nao encontrada.' USING ERRCODE = 'P0002';
  END IF;

  -- Se a mesa estiver livre ou reservada, ocupar
  IF v_table.status IN ('available', 'reserved') THEN
    -- Criar sessão se não houver uma ativa
    IF v_table.current_session_id IS NULL OR v_table.active = false THEN
      INSERT INTO public.sessions (restaurant_id, table_id, status, opened_at)
      VALUES (v_table.restaurant_id, p_table_id, 'active', now())
      RETURNING id INTO v_session_id;

      UPDATE public.tables 
      SET status = 'occupied', 
          active = true, 
          opened_at = now(), 
          current_session_id = v_session_id 
      WHERE id = p_table_id;

      -- Registrar log
      INSERT INTO public.activity_logs (restaurant_id, table_id, event_type, description, metadata)
      VALUES (
        v_table.restaurant_id, 
        p_table_id, 
        'table_occupied_qr', 
        format('Mesa %s ocupada via QR Code', v_table.number),
        jsonb_build_object('previous_status', v_table.status, 'session_id', v_session_id)
      );
    ELSE
      v_session_id := v_table.current_session_id;
    END IF;
    
    RETURN jsonb_build_object('success', true, 'status', 'occupied', 'session_id', v_session_id);
  END IF;

  -- Se já estiver ocupada, apenas retornar sucesso (idempotência)
  IF v_table.status = 'occupied' THEN
    RETURN jsonb_build_object('success', true, 'status', 'occupied', 'session_id', v_table.current_session_id);
  END IF;

  RETURN jsonb_build_object('success', false, 'status', v_table.status, 'message', 'Mesa indisponivel');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 4. Função para atualizar status da mesa com validação (para o painel administrativo)
CREATE OR REPLACE FUNCTION public.update_table_status_safe(p_table_id UUID, p_new_status TEXT)
RETURNS JSONB AS $$
DECLARE
  v_table public.tables%ROWTYPE;
  v_current_restaurant_id UUID;
BEGIN
  -- Segurança: obter restaurant_id do usuário autenticado
  v_current_restaurant_id := public.current_restaurant_id();
  
  SELECT * INTO v_table FROM public.tables WHERE id = p_table_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Mesa nao encontrada.' USING ERRCODE = 'P0002'; END IF;

  -- Garantir que a mesa pertence ao restaurante do usuário
  IF v_table.restaurant_id <> v_current_restaurant_id THEN
    RAISE EXCEPTION 'Acesso negado.' USING ERRCODE = '42501';
  END IF;

  -- Validação: Se estiver tentando ocupar, deve vir de disponível ou reservada
  IF p_new_status = 'occupied' AND v_table.status NOT IN ('available', 'reserved') THEN
    RAISE EXCEPTION 'Transicao invalida: mesa % ja esta %', v_table.number, v_table.status;
  END IF;

  -- Atualizar status
  UPDATE public.tables SET status = p_new_status WHERE id = p_table_id;

  -- Registrar log
  INSERT INTO public.activity_logs (restaurant_id, table_id, event_type, description, metadata)
  VALUES (
    v_table.restaurant_id, 
    p_table_id, 
    'table_status_change', 
    format('Status da mesa %s alterado de %s para %s', v_table.number, v_table.status, p_new_status),
    jsonb_build_object('old_status', v_table.status, 'new_status', p_new_status)
  );

  RETURN jsonb_build_object('success', true, 'new_status', p_new_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Permissões
REVOKE ALL ON FUNCTION public.occupy_public_table(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.occupy_public_table(UUID) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.update_table_status_safe(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_table_status_safe(UUID, TEXT) TO authenticated;

-- Adicionar activity_logs ao realtime
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'activity_logs'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
    END IF;
  END IF;
END $$;
