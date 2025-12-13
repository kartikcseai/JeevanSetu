import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  X, Calendar, FileText, Pill, Clock, User, Mail, 
  Activity, Download, ChevronDown, ChevronUp, Stethoscope
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type PatientRecordsProps = {
  patient: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Appointment = {
  id: string;
  scheduled_at: string;
  status: string;
  symptoms: string | null;
  notes: string | null;
  doctor?: { full_name: string; specialty: string | null };
};

type Prescription = {
  id: string;
  diagnosis: string;
  notes: string | null;
  status: string;
  created_at: string;
  doctor?: { full_name: string; specialty: string | null };
  medications: { name: string; dosage: string; frequency: string; duration: string; instructions: string | null }[];
};

export function PatientFullRecords({ patient, open, onOpenChange }: PatientRecordsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPrescription, setExpandedPrescription] = useState<string | null>(null);

  useEffect(() => {
    if (open && patient) {
      fetchRecords();
    }
  }, [open, patient]);

  const fetchRecords = async () => {
    if (!patient) return;
    setLoading(true);

    // Fetch appointments
    const { data: appointmentsData } = await supabase
      .from("appointments")
      .select("id, scheduled_at, status, symptoms, notes, doctor_id")
      .eq("patient_id", patient.id)
      .order("scheduled_at", { ascending: false });

    // Fetch prescriptions
    const { data: prescriptionsData } = await supabase
      .from("prescriptions")
      .select("id, diagnosis, notes, status, created_at, doctor_id")
      .eq("patient_id", patient.id)
      .order("created_at", { ascending: false });

    // Enrich with doctor info and medications
    if (appointmentsData) {
      const enrichedAppointments = await Promise.all(
        appointmentsData.map(async (apt) => {
          const { data: doctor } = await supabase
            .from("profiles")
            .select("full_name, specialty")
            .eq("id", apt.doctor_id)
            .single();
          return { ...apt, doctor };
        })
      );
      setAppointments(enrichedAppointments);
    }

    if (prescriptionsData) {
      const enrichedPrescriptions = await Promise.all(
        prescriptionsData.map(async (pres) => {
          const { data: doctor } = await supabase
            .from("profiles")
            .select("full_name, specialty")
            .eq("id", pres.doctor_id)
            .single();
          const { data: meds } = await supabase
            .from("prescription_medications")
            .select("name, dosage, frequency, duration, instructions")
            .eq("prescription_id", pres.id);
          return { ...pres, doctor, medications: meds || [] };
        })
      );
      setPrescriptions(enrichedPrescriptions);
    }

    setLoading(false);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-muted text-muted-foreground";
      case "active": return "bg-primary/20 text-primary";
      case "upcoming": return "bg-accent text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">Patient Full Records</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-100px)]">
          <div className="p-6 space-y-6">
            {/* Patient Header */}
            <Card className="bg-gradient-to-br from-primary/10 to-[hsl(200,70%,50%)]/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center text-xl font-bold text-primary-foreground">
                    {getInitials(patient.full_name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">{patient.full_name}</h3>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" />
                      {patient.email}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 rounded-xl bg-background/80">
                      <Calendar className="w-5 h-5 mx-auto text-primary mb-1" />
                      <p className="text-xl font-bold text-foreground">{appointments.length}</p>
                      <p className="text-xs text-muted-foreground">Visits</p>
                    </div>
                    <div className="p-3 rounded-xl bg-background/80">
                      <FileText className="w-5 h-5 mx-auto text-primary mb-1" />
                      <p className="text-xl font-bold text-foreground">{prescriptions.length}</p>
                      <p className="text-xs text-muted-foreground">Prescriptions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="flex justify-center py-8">
                <Activity className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Appointments Section */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-primary" />
                    Appointment History ({appointments.length})
                  </h3>
                  {appointments.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                        No appointments found
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((apt, index) => (
                        <motion.div
                          key={apt.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium text-foreground">
                                      {format(new Date(apt.scheduled_at), "MMMM d, yyyy 'at' h:mm a")}
                                    </span>
                                    <Badge className={cn("ml-2", getStatusColor(apt.status || "upcoming"))}>
                                      {apt.status}
                                    </Badge>
                                  </div>
                                  {apt.doctor && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                                      <Stethoscope className="w-3.5 h-3.5" />
                                      Dr. {apt.doctor.full_name} {apt.doctor.specialty && `• ${apt.doctor.specialty}`}
                                    </p>
                                  )}
                                  {apt.symptoms && (
                                    <p className="text-sm mt-2">
                                      <span className="text-muted-foreground">Symptoms: </span>
                                      <span className="text-foreground">{apt.symptoms}</span>
                                    </p>
                                  )}
                                  {apt.notes && (
                                    <p className="text-sm mt-1">
                                      <span className="text-muted-foreground">Notes: </span>
                                      <span className="text-foreground">{apt.notes}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Prescriptions Section */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-primary" />
                    Prescriptions ({prescriptions.length})
                  </h3>
                  {prescriptions.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                        No prescriptions found
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {prescriptions.map((pres, index) => (
                        <motion.div
                          key={pres.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="overflow-hidden">
                            <CardContent className="p-0">
                              <button
                                onClick={() => setExpandedPrescription(
                                  expandedPrescription === pres.id ? null : pres.id
                                )}
                                className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-foreground">{pres.diagnosis}</span>
                                      <Badge className={cn(getStatusColor(pres.status || "active"))}>
                                        {pres.status}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {format(new Date(pres.created_at), "MMMM d, yyyy")}
                                      {pres.doctor && ` • Dr. ${pres.doctor.full_name}`}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      <Pill className="w-3.5 h-3.5 inline mr-1" />
                                      {pres.medications.length} medication{pres.medications.length !== 1 ? "s" : ""}
                                    </p>
                                  </div>
                                  {expandedPrescription === pres.id ? (
                                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </div>
                              </button>
                              
                              {expandedPrescription === pres.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-border"
                                >
                                  <div className="p-4 bg-muted/30 space-y-3">
                                    {pres.notes && (
                                      <p className="text-sm">
                                        <span className="text-muted-foreground">Doctor's Notes: </span>
                                        <span className="text-foreground">{pres.notes}</span>
                                      </p>
                                    )}
                                    <div>
                                      <p className="text-sm font-medium text-foreground mb-2">Medications:</p>
                                      <div className="space-y-2">
                                        {pres.medications.map((med, i) => (
                                          <div key={i} className="p-3 rounded-lg bg-background">
                                            <p className="font-medium text-foreground">{med.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                              {med.dosage} • {med.frequency} • {med.duration}
                                            </p>
                                            {med.instructions && (
                                              <p className="text-sm text-muted-foreground mt-1">
                                                Instructions: {med.instructions}
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
