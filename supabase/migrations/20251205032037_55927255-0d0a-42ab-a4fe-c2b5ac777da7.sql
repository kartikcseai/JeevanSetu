-- Allow doctors to view patient roles (needed for patient search feature)
CREATE POLICY "Doctors can view patient roles"
ON public.user_roles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'doctor'::app_role) 
  AND role = 'patient'
);

-- Allow patients to view doctor roles (needed for booking appointments)
CREATE POLICY "Patients can view doctor roles"
ON public.user_roles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'patient'::app_role) 
  AND role = 'doctor'
);