ALTER TABLE public.brand_sessions ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
