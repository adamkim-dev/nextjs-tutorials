-- Add payday column (day of month) to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS payday INTEGER CHECK (payday >= 1 AND payday <= 31);

-- Optional: set default NULL meaning not configured yet
ALTER TABLE public.users
ALTER COLUMN payday DROP DEFAULT;