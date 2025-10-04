-- Create admins table with secure password storage
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can view admin records
CREATE POLICY "Admins can view their own record"
  ON public.admins
  FOR SELECT
  USING (auth.uid() = id);

-- Only authenticated admins can update their own record
CREATE POLICY "Admins can update their own record"
  ON public.admins
  FOR UPDATE
  USING (auth.uid() = id);

-- Create trigger for updated_at
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin account (password: SecureAdmin2024!)
-- Password hash generated with bcrypt, rounds=10
INSERT INTO public.admins (username, password_hash, name)
VALUES (
  'master_admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Master Administrator'
);

-- Create index for faster username lookups
CREATE INDEX idx_admins_username ON public.admins(username);