import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Users, Mail, FileText, Calendar, Loader2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePatients, useAppointments, usePrescriptions } from "@/hooks/useRealtimeData";
import { format } from "date-fns";
import { PatientFullRecords } from "./PatientFullRecords";

type PatientWithDetails = {
  id: string;
  full_name: string;
  email: string;
  appointmentCount: number;
  prescriptionCount: number;
  lastVisit: string | null;
  conditions: string[];
};

export function PatientSearch() {
  const { patients, loading: patientsLoading } = usePatients();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { prescriptions, loading: prescriptionsLoading } = usePrescriptions();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "recent" | "active">("all");
  const [selectedPatient, setSelectedPatient] = useState<PatientWithDetails | null>(null);
  const [recordsDialogOpen, setRecordsDialogOpen] = useState(false);

  const loading = patientsLoading || appointmentsLoading || prescriptionsLoading;

  // Enrich patients with appointment and prescription data
  const enrichedPatients = useMemo(() => {
    return patients.map(patient => {
      const patientAppointments = appointments.filter(a => a.patient_id === patient.id);
      const patientPrescriptions = prescriptions.filter(p => p.patient_id === patient.id);
      
      // Extract unique conditions from prescriptions
      const conditions = [...new Set(patientPrescriptions.map(p => p.diagnosis))];
      
      // Get symptoms from appointments as additional conditions
      const symptoms = patientAppointments
        .filter(a => a.symptoms)
        .map(a => a.symptoms as string);
      
      const allConditions = [...new Set([...conditions, ...symptoms])].slice(0, 5);
      
      // Get last visit date
      const sortedAppointments = [...patientAppointments].sort(
        (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
      );
      const lastVisit = sortedAppointments[0]?.scheduled_at || null;

      return {
        ...patient,
        appointmentCount: patientAppointments.length,
        prescriptionCount: patientPrescriptions.length,
        lastVisit,
        conditions: allConditions,
      };
    });
  }, [patients, appointments, prescriptions]);

  // Filter and search patients
  const filteredPatients = useMemo(() => {
    let result = enrichedPatients;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(patient => 
        patient.full_name.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.conditions.some(c => c.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filterBy === "recent") {
      result = result.filter(p => p.lastVisit !== null);
      result.sort((a, b) => {
        if (!a.lastVisit) return 1;
        if (!b.lastVisit) return -1;
        return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
      });
    } else if (filterBy === "active") {
      result = result.filter(p => p.prescriptionCount > 0);
    }

    return result;
  }, [enrichedPatients, searchQuery, filterBy]);

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center">
            <Users className="w-6 h-6 text-primary-foreground" />
          </div>
          Patients
        </h1>
        <p className="text-muted-foreground mt-2">Search and manage your patients</p>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterBy} onValueChange={(v) => setFilterBy(v as typeof filterBy)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  <SelectItem value="recent">Recent Visits</SelectItem>
                  <SelectItem value="active">With Prescriptions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Patient Directory</span>
                <Badge variant="secondary">{filteredPatients.length} patients</Badge>
              </CardTitle>
              <CardDescription>
                {searchQuery ? `Results for "${searchQuery}"` : "All registered patients"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "No patients match your search" : "No patients found"}
                  </p>
                </div>
              ) : (
                filteredPatients.map((patient, index) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedPatient(patient)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all",
                      selectedPatient?.id === patient.id
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center text-sm font-semibold text-primary-foreground">
                      {getInitials(patient.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{patient.full_name}</p>
                      <p className="text-sm text-muted-foreground truncate">{patient.email}</p>
                      {patient.conditions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {patient.conditions.slice(0, 2).map((condition, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {condition.length > 20 ? condition.slice(0, 20) + "..." : condition}
                            </Badge>
                          ))}
                          {patient.conditions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{patient.conditions.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {patient.appointmentCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {patient.prescriptionCount}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Patient Details Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Patient Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPatient ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center text-2xl font-bold text-primary-foreground">
                      {getInitials(selectedPatient.full_name)}
                    </div>
                    <h3 className="font-semibold text-foreground mt-3">{selectedPatient.full_name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                      <Mail className="w-3.5 h-3.5" />
                      {selectedPatient.email}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-muted/50 text-center">
                      <Calendar className="w-5 h-5 mx-auto text-primary mb-1" />
                      <p className="text-2xl font-bold text-foreground">{selectedPatient.appointmentCount}</p>
                      <p className="text-xs text-muted-foreground">Appointments</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50 text-center">
                      <FileText className="w-5 h-5 mx-auto text-primary mb-1" />
                      <p className="text-2xl font-bold text-foreground">{selectedPatient.prescriptionCount}</p>
                      <p className="text-xs text-muted-foreground">Prescriptions</p>
                    </div>
                  </div>

                  {selectedPatient.lastVisit && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Last Visit</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(selectedPatient.lastVisit), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  )}

                  {selectedPatient.conditions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Conditions & Symptoms</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.conditions.map((condition, i) => (
                          <Badge key={i} variant="secondary">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    variant="hero" 
                    className="w-full"
                    onClick={() => setRecordsDialogOpen(true)}
                  >
                    View Full Records
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select a patient to view details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full Records Dialog */}
      <PatientFullRecords
        patient={selectedPatient}
        open={recordsDialogOpen}
        onOpenChange={setRecordsDialogOpen}
      />
    </div>
  );
}
