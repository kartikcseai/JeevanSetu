-- First drop the policy that depends on the role column
DROP POLICY IF EXISTS "Doctors can view patient profiles" ON public.profiles;

-- Create app_role enum type
CREATE TYPE public.app_role AS ENUM ('patient', 'doctor');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (bypasses RLS, prevents recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies for user_roles table
-- Users can only view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only the system (via triggers) can insert roles - block direct inserts
CREATE POLICY "System can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (false);

-- No one can update roles directly
CREATE POLICY "No direct role updates"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (false);

-- No one can delete roles directly
CREATE POLICY "No direct role deletes"
ON public.user_roles
FOR DELETE
TO authenticated
USING (false);

-- Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::text::app_role FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Now drop the role column from profiles
ALTER TABLE public.profiles DROP COLUMN role;

-- Update handle_new_user function to NEVER trust client role metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile WITHOUT role (role is managed in user_roles table)
  INSERT INTO public.profiles (id, email, full_name, specialty)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    NEW.raw_user_meta_data ->> 'specialty'
  );
  
  -- SECURITY: Always create as patient - never trust client metadata for role
  -- Doctor role must be granted through a separate admin verification process
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'patient');
  
  RETURN NEW;
END;
$$;

-- Recreate the policy using the secure has_role function
CREATE POLICY "Doctors can view patient profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'doctor'::app_role));