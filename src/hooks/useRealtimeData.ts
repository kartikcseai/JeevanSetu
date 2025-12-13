import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  symptoms: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  patient?: { full_name: string; email: string };
  doctor?: { full_name: string; specialty: string };
};

export type Prescription = {
  id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis: string;
  status: string;
  notes: string | null;
  created_at: string;
  medications?: PrescriptionMedication[];
  doctor?: { full_name: string; specialty: string };
};

export type PrescriptionMedication = {
  id: string;
  prescription_id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
};

export function useAppointments() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    if (!profile) return;
    
    const query = profile.role === "doctor"
      ? supabase.from("appointments").select("*, patient:profiles!appointments_patient_id_fkey(full_name, email)").eq("doctor_id", profile.id)
      : supabase.from("appointments").select("*, doctor:profiles!appointments_doctor_id_fkey(full_name, specialty)").eq("patient_id", profile.id);
    
    const { data, error } = await query.order("scheduled_at", { ascending: true });
    
    if (!error && data) {
      setAppointments(data as Appointment[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();

    // Set up realtime subscription
    const channel = supabase
      .channel("appointments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
        },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  return { appointments, loading, refetch: fetchAppointments };
}

export function usePrescriptions() {
  const { profile } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async () => {
    if (!profile) return;
    
    const query = profile.role === "doctor"
      ? supabase.from("prescriptions").select("*, medications:prescription_medications(*)").eq("doctor_id", profile.id)
      : supabase.from("prescriptions").select("*, doctor:profiles!prescriptions_doctor_id_fkey(full_name, specialty), medications:prescription_medications(*)").eq("patient_id", profile.id);
    
    const { data, error } = await query.order("created_at", { ascending: false });
    
    if (!error && data) {
      setPrescriptions(data as Prescription[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrescriptions();

    // Set up realtime subscription
    const channel = supabase
      .channel("prescriptions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "prescriptions",
        },
        () => {
          fetchPrescriptions();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "prescription_medications",
        },
        () => {
          fetchPrescriptions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  return { prescriptions, loading, refetch: fetchPrescriptions };
}

export function usePatients() {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!profile || profile.role !== "doctor") return;
      
      // First get all patient user_ids from user_roles
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "patient");
      
      if (roleError || !roleData) {
        setLoading(false);
        return;
      }

      const patientIds = roleData.map(r => r.user_id);
      
      if (patientIds.length === 0) {
        setPatients([]);
        setLoading(false);
        return;
      }

      // Then fetch profiles for those user_ids
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", patientIds);
      
      if (!profilesError && profilesData) {
        setPatients(profilesData);
      }
      setLoading(false);
    };

    fetchPatients();
  }, [profile]);

  return { patients, loading };
}

export function useDoctors() {
  const { profile } = useAuth();
  const [doctors, setDoctors] = useState<{ id: string; full_name: string; email: string; specialty: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!profile || profile.role !== "patient") return;
      
      // First get all doctor user_ids from user_roles
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "doctor");
      
      if (roleError || !roleData) {
        setLoading(false);
        return;
      }

      const doctorIds = roleData.map(r => r.user_id);
      
      if (doctorIds.length === 0) {
        setDoctors([]);
        setLoading(false);
        return;
      }

      // Then fetch profiles for those user_ids
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, specialty")
        .in("id", doctorIds);
      
      if (!profilesError && profilesData) {
        setDoctors(profilesData);
      }
      setLoading(false);
    };

    fetchDoctors();
  }, [profile]);

  return { doctors, loading };
}
