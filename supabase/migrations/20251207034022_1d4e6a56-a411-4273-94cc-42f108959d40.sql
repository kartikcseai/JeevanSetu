-- Allow patients to view doctor profiles for booking appointments
CREATE POLICY "Patients can view doctor profiles" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'patient'::app_role) AND 
  has_role(id, 'doctor'::app_role)
);