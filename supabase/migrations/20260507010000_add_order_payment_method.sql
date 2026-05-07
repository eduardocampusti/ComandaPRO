-- Migration: Add payment_method to orders table
-- Created At: 2026-05-07

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pending' 
CHECK (payment_method IN ('pix', 'card', 'cash', 'pending'));

-- Update existing orders to 'pending' if they have NULL (though DEFAULT handles new ones)
UPDATE public.orders SET payment_method = 'pending' WHERE payment_method IS NULL;
