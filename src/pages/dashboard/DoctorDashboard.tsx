import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Calendar, FileText, Home, LogOut, Menu, Settings,
  X, Clock, Bell, Users, Plus, Loader2, Search, PlayCircle, CheckCircle
} from "lucide-react";
import { PatientSearch } from "@/components/dashboard/PatientSearch";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useAppointments, usePatients, usePrescriptions } from "@/hooks/useRealtimeData";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isTomorrow } from "date-fns";

const navItems = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "upcoming", label: "Upcoming", icon: Clock },
  { id: "patients", label: "Patients", icon: Search },
  { id: "consultations", label: "Consultations", icon: Users },
  { id: "prescriptions", label: "E-Prescriptions", icon: FileText },
  { id: "schedule", label: "Schedule", icon: Calendar },
];

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "upcoming":
        return <UpcomingAppointments />;
      case "patients":
        return <PatientSearch />;
      case "consultations":
        return <ConsultationsContent />;
      case "prescriptions":
        return <PrescriptionCreator />;
      case "schedule":
        return <ScheduleContent />;
      default:
        return <OverviewContent setActiveTab={setActiveTab} />;
    }
  };

  const initials = profile?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "DR";

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-foreground">
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <img src="/src/assets/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Jeevan<span className="gradient-text">Setu</span>
            </span>
          </Link>
          <button className="p-2 text-foreground relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                  <img src="/src/assets/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-xl font-bold text-foreground">
                  Jeevan<span className="gradient-text">Setu</span>
                </span>
              </Link>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* user profile
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center text-lg font-semibold text-primary-foreground">
                  {initials}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{profile?.full_name || "Doctor"}</div>
                  <div className="text-sm text-muted-foreground">{profile?.specialty || "General Physician"}</div>
                </div>
              </div>
            </div> */}

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-border space-y-1">
              {/* <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200">
                <Settings className="w-5 h-5" />
                Settings
              </button> */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center text-lg font-semibold text-primary-foreground">
                    {initials}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{profile?.full_name || "Doctor"}</div>
                    <div className="text-sm text-muted-foreground">{profile?.specialty || "General Physician"}</div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-h-screen">
          <div className="p-4 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function OverviewContent({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { profile } = useAuth();
  const { appointments, loading } = useAppointments();
  const { prescriptions } = usePrescriptions();

  const todayAppointments = appointments.filter(a => {
    const date = new Date(a.scheduled_at);
    return isToday(date);
  });

  const quickStats = [
    { label: "Today's Patients", value: todayAppointments.length.toString(), icon: Users, color: "from-primary to-[hsl(190,74%,45%)]" },
    { label: "Pending Reviews", value: appointments.filter(a => a.status === "upcoming").length.toString(), icon: FileText, color: "from-[hsl(190,74%,45%)] to-[hsl(200,70%,50%)]" },
    { label: "Prescriptions", value: prescriptions.length.toString(), icon: Calendar, color: "from-[hsl(200,70%,50%)] to-[hsl(220,70%,55%)]" },
  ];

  const firstName = profile?.full_name?.split(" ")[0] || "Doctor";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Good morning, {firstName}! 👋</h1>
        <p className="text-muted-foreground mt-1">Here's your practice overview for today</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickStats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card variant="elevated" className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center", stat.color)}>
                    <stat.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Today's Schedule</CardTitle>
            <CardDescription>Your consultations for today</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActiveTab("consultations")}>View all</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : todayAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No appointments scheduled for today</p>
          ) : (
            todayAppointments.slice(0, 4).map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center text-sm font-semibold text-primary-foreground">
                  {apt.patient?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "PA"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{apt.patient?.full_name || "Patient"}</p>
                  <p className="text-sm text-muted-foreground truncate">{apt.symptoms || "No symptoms listed"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {format(new Date(apt.scheduled_at), "h:mm a")}
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    apt.status === "completed" ? "bg-muted text-muted-foreground" :
                      apt.status === "in-progress" ? "bg-primary text-primary-foreground" :
                        "bg-accent text-accent-foreground"
                  )}>
                    {apt.status === "in-progress" ? "In Progress" : apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ConsultationsContent() {
  const { appointments, loading, refetch } = useAppointments();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const formatAppointmentDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
    if (isTomorrow(date)) return `Tomorrow, ${format(date, "h:mm a")}`;
    return format(date, "MMM d, h:mm a");
  };

  const updateStatus = async (appointmentId: string, newStatus: string) => {
    setUpdatingId(appointmentId);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointmentId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Appointment marked as ${newStatus === "in-progress" ? "in progress" : newStatus}.`,
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center">
            <Users className="w-6 h-6 text-primary-foreground" />
          </div>
          Consultations
        </h1>
        <p className="text-muted-foreground mt-2">Manage your patient consultations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No appointments yet</p>
          ) : (
            appointments.map((apt, index) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center text-lg font-semibold text-primary-foreground shrink-0">
                  {apt.patient?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "PA"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{apt.patient?.full_name || "Patient"}</p>
                  <p className="text-sm text-muted-foreground">{apt.symptoms || "No symptoms listed"}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {formatAppointmentDate(apt.scheduled_at)}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    apt.status === "completed" ? "bg-muted text-muted-foreground" :
                      apt.status === "in-progress" ? "bg-primary text-primary-foreground" :
                        "bg-accent text-accent-foreground"
                  )}>
                    {apt.status === "in-progress" ? "In Progress" : apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </span>

                  {/* Status Update Buttons */}
                  {apt.status === "upcoming" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(apt.id, "in-progress")}
                      disabled={updatingId === apt.id}
                    >
                      {updatingId === apt.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4 mr-1" />
                          Start Session
                        </>
                      )}
                    </Button>
                  )}
                  {apt.status === "in-progress" && (
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => updateStatus(apt.id, "completed")}
                      disabled={updatingId === apt.id}
                    >
                      {updatingId === apt.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PrescriptionCreator() {
  const { profile } = useAuth();
  const { patients, loading: patientsLoading } = usePatients();
  const [selectedPatient, setSelectedPatient] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medications, setMedications] = useState([{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedPatient || !diagnosis) return;

    setIsSubmitting(true);
    try {
      // Create prescription
      const { data: prescription, error: prescriptionError } = await supabase
        .from("prescriptions")
        .insert({
          patient_id: selectedPatient,
          doctor_id: profile.id,
          diagnosis,
          notes: notes || null,
          status: "active",
        })
        .select()
        .single();

      if (prescriptionError) throw prescriptionError;

      // Add medications
      const validMedications = medications.filter(m => m.name && m.dosage && m.frequency && m.duration);
      if (validMedications.length > 0) {
        const { error: medsError } = await supabase
          .from("prescription_medications")
          .insert(
            validMedications.map(med => ({
              prescription_id: prescription.id,
              name: med.name,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
              instructions: med.instructions || null,
            }))
          );

        if (medsError) throw medsError;
      }

      toast({
        title: "Prescription Created",
        description: "The e-prescription has been sent to the patient.",
      });

      // Reset form
      setSelectedPatient("");
      setDiagnosis("");
      setNotes("");
      setMedications([{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create prescription",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-foreground" />
          </div>
          E-Prescription Creator
        </h1>
        <p className="text-muted-foreground mt-2">Create digital prescriptions for your patients</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patient & Diagnosis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Patient</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient} required>
                  <SelectTrigger>
                    <SelectValue placeholder={patientsLoading ? "Loading..." : "Select patient"} />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Diagnosis</Label>
                <Input
                  placeholder="E.g., Upper Respiratory Infection"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Medications</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addMedication}>
              <Plus className="w-4 h-4" /> Add Medication
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {medications.map((med, index) => (
              <div key={index} className="p-4 rounded-xl bg-muted/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Medication {index + 1}</span>
                  {medications.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeMedication(index)} className="text-destructive">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Medication Name</Label>
                    <Input
                      placeholder="E.g., Amoxicillin 500mg"
                      value={med.name}
                      onChange={(e) => updateMedication(index, "name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dosage</Label>
                    <Input
                      placeholder="E.g., 500mg"
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select
                      value={med.frequency}
                      onValueChange={(value) => updateMedication(index, "frequency", value)}
                      required
                    >
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Once daily">Once daily</SelectItem>
                        <SelectItem value="Twice daily">Twice daily</SelectItem>
                        <SelectItem value="Three times daily">Three times daily</SelectItem>
                        <SelectItem value="Four times daily">Four times daily</SelectItem>
                        <SelectItem value="As needed">As needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input
                      placeholder="E.g., 7 days"
                      value={med.duration}
                      onChange={(e) => updateMedication(index, "duration", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Special Instructions (Optional)</Label>
                    <Input
                      placeholder="E.g., Take with food"
                      value={med.instructions}
                      onChange={(e) => updateMedication(index, "instructions", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                placeholder="Any additional instructions or notes for the patient..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" variant="hero" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create & Send Prescription"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ScheduleContent() {
  const { appointments } = useAppointments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary-foreground" />
          </div>
          Schedule
        </h1>
        <p className="text-muted-foreground mt-2">Manage your availability and appointments</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, index) => (
              <div key={day} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">{day}</p>
                  <p className="text-sm text-muted-foreground">Dec {index + 2}, 2024</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{Math.floor(Math.random() * 6) + 4} patients</p>
                  <p className="text-sm text-muted-foreground">9:00 AM - 5:00 PM</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-[hsl(200,70%,50%)]/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">Total Appointments</p>
              <p className="text-4xl font-bold text-foreground mt-2">{appointments.length}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/50 text-center">
                <p className="text-2xl font-bold text-foreground">{appointments.filter(a => a.status === "upcoming").length}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 text-center">
                <p className="text-2xl font-bold text-foreground">{appointments.filter(a => a.status === "completed").length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}