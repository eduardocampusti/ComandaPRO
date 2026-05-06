-- ============================================================
-- COMANDA PRO - Módulo de Cardápio V2
-- Adiciona suporte a Categorias Editáveis e Opcionais
-- ============================================================

-- 0. Funções Auxiliares de Multi-Tenancy (Garantir existência)
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


-- 1. Tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Opções/Adicionais/Variações
CREATE TABLE IF NOT EXISTS public.menu_item_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    type TEXT NOT NULL DEFAULT 'addon' CHECK (type IN ('addon', 'size', 'choice')),
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Ajustes na tabela menu_items
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- 4. Ativar Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_options ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Segurança (Tenancy Isolation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'categories_tenant_access') THEN
        CREATE POLICY categories_tenant_access ON public.categories
          FOR ALL TO authenticated
          USING (restaurant_id = public.current_restaurant_id())
          WITH CHECK (restaurant_id = public.current_restaurant_id());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'menu_item_options_tenant_access') THEN
        CREATE POLICY menu_item_options_tenant_access ON public.menu_item_options
          FOR ALL TO authenticated
          USING (restaurant_id = public.current_restaurant_id())
          WITH CHECK (restaurant_id = public.current_restaurant_id());
    END IF;
END $$;

-- 6. Triggers para preenchimento automático de restaurant_id
DROP TRIGGER IF EXISTS tr_set_restaurant_id_categories ON public.categories;
CREATE TRIGGER tr_set_restaurant_id_categories BEFORE INSERT ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_restaurant_id();

DROP TRIGGER IF EXISTS tr_set_restaurant_id_menu_options ON public.menu_item_options;
CREATE TRIGGER tr_set_restaurant_id_menu_options BEFORE INSERT ON public.menu_item_options
  FOR EACH ROW EXECUTE FUNCTION public.set_restaurant_id();

-- 7. Índices para performance
CREATE INDEX IF NOT EXISTS idx_categories_restaurant_id ON public.categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_options_menu_item_id ON public.menu_item_options(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_archived ON public.menu_items(is_archived);

-- 8. Migração de dados legados (Categoria de texto -> Tabela Categorias)
DO $$
BEGIN
    -- Criar categorias baseadas nos textos existentes
    INSERT INTO public.categories (restaurant_id, name)
    SELECT DISTINCT restaurant_id, category
    FROM public.menu_items
    ON CONFLICT DO NOTHING;

    -- Vincular itens do cardápio às novas categorias
    UPDATE public.menu_items mi
    SET category_id = c.id
    FROM public.categories c
    WHERE mi.restaurant_id = c.restaurant_id AND mi.category = c.name
    AND mi.category_id IS NULL;
END $$;
