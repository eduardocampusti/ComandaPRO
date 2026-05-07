-- Migration: Cashier Audit Logs and Indexing
-- Created At: 2026-05-07

-- 1. Renomear colunas para manter consistência com o código (database.ts)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'event_type') THEN
    ALTER TABLE public.activity_logs RENAME COLUMN event_type TO action;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'metadata') THEN
    ALTER TABLE public.activity_logs RENAME COLUMN metadata TO details;
  END IF;
END $$;

-- 2. Adicionar user_id se ainda não existir
ALTER TABLE public.activity_logs 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Trigger para preenchimento automático do restaurant_id nos logs
DROP TRIGGER IF EXISTS tr_set_restaurant_id_activity_logs ON public.activity_logs;
CREATE TRIGGER tr_set_restaurant_id_activity_logs 
BEFORE INSERT ON public.activity_logs
FOR EACH ROW EXECUTE FUNCTION public.set_restaurant_id();

-- 4. Índice para acelerar os relatórios financeiros por método de pagamento
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders(payment_method);
