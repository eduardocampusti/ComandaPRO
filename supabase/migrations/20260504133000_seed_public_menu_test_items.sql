-- Seed minimal public menu items for QR-order visual validation.
-- Idempotent by product name + category because menu_items has no natural
-- unique constraint in the deployed schema.

insert into public.menu_items (name, description, price, category, image_url, available)
select seed.name, seed.description, seed.price, seed.category, seed.image_url, seed.available
from (
  values
    (
      'Brotar Smash Burger',
      'Burger smash com queijo, alface, tomate e molho da casa.',
      29.90::numeric,
      'Burgers',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
      true
    ),
    (
      'Cheddar Bacon Burger',
      'Burger artesanal com cheddar cremoso, bacon crocante e cebola caramelizada.',
      34.90::numeric,
      'Burgers',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
      true
    ),
    (
      'Refrigerante Lata',
      'Lata gelada 350 ml.',
      7.90::numeric,
      'Bebidas',
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=80',
      true
    ),
    (
      'Suco Natural',
      'Suco natural da fruta 400 ml.',
      11.90::numeric,
      'Bebidas',
      'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=900&q=80',
      true
    ),
    (
      'Brownie com Sorvete',
      'Brownie quente com bola de sorvete de creme.',
      18.90::numeric,
      'Sobremesas',
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80',
      true
    )
) as seed(name, description, price, category, image_url, available)
where not exists (
  select 1
  from public.menu_items mi
  where lower(mi.name) = lower(seed.name)
    and mi.category = seed.category
);
