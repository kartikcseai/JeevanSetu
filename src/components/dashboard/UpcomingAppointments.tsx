import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, CheckCircle, PlayCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppointments } from "@/hooks/useRealtimeData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, isToday, isTomorrow } from "date-fns";

export function UpcomingAppointments() {
  const { appointments, loading, refetch } = useAppointments();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filter to today's and tomorrow's appointments only
  const upcomingAppointments = appointments.filter(apt => {
    const date = new Date(apt.scheduled_at);
    return (isToday(date) || isTomorrow(date)) && apt.status !== "completed";
  }).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const todayCount = upcomingAppointments.filter(apt => isToday(new Date(apt.scheduled_at))).length;
  const tomorrowCount = upcomingAppointments.filter(apt => isTomorrow(new Date(apt.scheduled_at))).length;

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

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "h:mm a");
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[#4CAF50] flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary-foreground" />
          </div>
          Upcoming Appointments
        </h1>
        <p className="text-muted-foreground mt-2">Your appointments for today and tomorrow</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card variant="elevated">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{todayCount}</p>
            <p className="text-sm text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{tomorrowCount}</p>
            <p className="text-sm text-muted-foreground">Tomorrow</p>
          </CardContent>
        </Card>
        <Card variant="elevated" className="col-span-2 sm:col-span-1">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{upcomingAppointments.length}</p>
            <p className="text-sm text-muted-foreground">Total Upcoming</p>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scheduled Consultations</CardTitle>
          <CardDescription>Quick actions for your upcoming patients</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No upcoming appointments for today or tomorrow</p>
            </div>
          ) : (
            upcomingAppointments.map((apt, index) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                {/* Patient Avatar */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center text-lg font-semibold text-primary-foreground shrink-0">
                  {apt.patient?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "PA"}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground truncate">{apt.patient?.full_name || "Patient"}</p>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium shrink-0",
                      isToday(new Date(apt.scheduled_at))
                        ? "bg-primary/10 text-primary"
                        : "bg-accent text-accent-foreground"
                    )}>
                      {getDateLabel(apt.scheduled_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{apt.symptoms || "No symptoms listed"}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {formatTime(apt.scheduled_at)}
                  </div>
                </div>

                {/* Status Badge */}
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium shrink-0",
                  apt.status === "in-progress"
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground"
                )}>
                  {apt.status === "in-progress" ? "In Progress" : "Upcoming"}
                </span>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 shrink-0">
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
                          Start
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
