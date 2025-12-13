import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Video, Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useAppointments } from "@/hooks/useRealtimeData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isTomorrow } from "date-fns";

export function AppointmentsList() {
  const { appointments, loading, refetch } = useAppointments();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [doctors, setDoctors] = useState<{ id: string; full_name: string; specialty: string }[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch doctors when dialog opens
  const handleDialogOpen = async (open: boolean) => {
    setIsDialogOpen(open);
    if (open && doctors.length === 0) {
      // First get all doctor user_ids from user_roles
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "doctor");

      if (roleError || !roleData) return;

      const doctorIds = roleData.map(r => r.user_id);

      if (doctorIds.length === 0) return;

      // Then fetch profiles for those user_ids
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, specialty")
        .in("id", doctorIds);

      if (profilesData) {
        setDoctors(profilesData);
      }
    }
  };

  const formatAppointmentDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d, yyyy");
  };

  const filteredAppointments = appointments.filter((apt) => {
    const doctorName = apt.doctor?.full_name || "";
    const specialty = apt.doctor?.specialty || "";
    const matchesSearch =
      doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || apt.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedDoctor || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}`).toISOString();

      const { error } = await supabase.from("appointments").insert({
        patient_id: profile.id,
        doctor_id: selectedDoctor,
        scheduled_at: scheduledAt,
        symptoms: symptoms || null,
        status: "upcoming",
      });

      if (error) throw error;

      toast({
        title: "Appointment Booked",
        description: "Your appointment has been scheduled successfully.",
      });
      setIsDialogOpen(false);
      setSelectedDoctor("");
      setSelectedDate("");
      setSelectedTime("");
      setSymptoms("");
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to book appointment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[#4CAF50] flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            Appointments
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your consultations and schedule new appointments
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero">
              <Plus className="w-4 h-4" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
              <DialogDescription>
                Schedule a consultation with one of our specialists
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBookAppointment} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Select Doctor</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a specialist" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.full_name} - {doctor.specialty || "General"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preferred Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason for Visit</Label>
                <Textarea
                  placeholder="Briefly describe your symptoms or reason for consultation..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="hero" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Book Appointment"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "upcoming", "completed"] as const).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No appointments found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Book your first appointment to get started"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card variant="interactive">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Doctor Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center text-lg font-semibold text-primary-foreground">
                      {appointment.doctor?.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "DR"}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{appointment.doctor?.full_name || "Doctor"}</h3>
                      <p className="text-sm text-muted-foreground">{appointment.doctor?.specialty || "General"}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatAppointmentDate(appointment.scheduled_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(appointment.scheduled_at), "h:mm a")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Video className="w-4 h-4" />
                          Video Call
                        </span>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          appointment.status === "upcoming"
                            ? "bg-accent text-accent-foreground"
                            : appointment.status === "completed"
                              ? "bg-muted text-muted-foreground"
                              : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                      {appointment.status === "upcoming" && (
                        <Button variant="hero" size="sm">
                          Join Call
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}