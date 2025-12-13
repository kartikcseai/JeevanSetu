-- Update the handle_new_user function to respect requested_role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requested_role text;
  final_role app_role;
BEGIN
  -- Insert profile WITHOUT role (role is managed in user_roles table)
  INSERT INTO public.profiles (id, email, full_name, specialty)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    NEW.raw_user_meta_data ->> 'specialty'
  );
  
  -- Get requested role from metadata
  requested_role := NEW.raw_user_meta_data ->> 'requested_role';
  
  -- Validate and set role - only allow 'patient' or 'doctor'
  IF requested_role = 'doctor' THEN
    final_role := 'doctor';
  ELSE
    final_role := 'patient';
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, final_role);
  
  RETURN NEW;
END;
$function$;

-- Fix existing users who registered as doctors (have specialty set) but got patient role
UPDATE public.user_roles 
SET role = 'doctor' 
WHERE user_id IN (
  SELECT id FROM public.profiles WHERE specialty IS NOT NULL
) AND role = 'patient';