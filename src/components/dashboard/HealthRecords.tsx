import { motion } from "framer-motion";
import { Heart, FileText, Stethoscope, Download, Calendar, TrendingUp } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type HealthEvent = {
  id: string;
  type: "consultation" | "prescription" | "test" | "vaccination";
  title: string;
  description: string;
  date: string;
  doctor?: string;
  status: "completed" | "pending";
};

const healthEvents: HealthEvent[] = [
  {
    id: "1",
    type: "consultation",
    title: "General Checkup",
    description: "Routine health examination with Dr. Sarah Johnson",
    date: "Dec 1, 2024",
    doctor: "Dr. Sarah Johnson",
    status: "completed",
  },
  {
    id: "2",
    type: "prescription",
    title: "Prescription Issued",
    description: "Antibiotics prescribed for upper respiratory infection",
    date: "Dec 1, 2024",
    doctor: "Dr. Sarah Johnson",
    status: "completed",
  },
  {
    id: "3",
    type: "test",
    title: "Blood Test Results",
    description: "Complete Blood Count (CBC) - All values within normal range",
    date: "Nov 25, 2024",
    status: "completed",
  },
  {
    id: "4",
    type: "consultation",
    title: "Cardiology Follow-up",
    description: "Heart health checkup with Dr. Michael Chen",
    date: "Nov 20, 2024",
    doctor: "Dr. Michael Chen",
    status: "completed",
  },
  {
    id: "5",
    type: "vaccination",
    title: "Flu Vaccination",
    description: "Annual influenza vaccination administered",
    date: "Nov 15, 2024",
    status: "completed",
  },
  {
    id: "6",
    type: "test",
    title: "Cholesterol Panel",
    description: "Lipid profile test - Scheduled",
    date: "Dec 15, 2024",
    status: "pending",
  },
];

const healthMetrics = [
  { label: "Blood Pressure", value: "120/80", unit: "mmHg", status: "normal", trend: "stable" },
  { label: "Heart Rate", value: "72", unit: "bpm", status: "normal", trend: "stable" },
  { label: "BMI", value: "23.5", unit: "kg/m²", status: "normal", trend: "down" },
  { label: "Blood Sugar", value: "95", unit: "mg/dL", status: "normal", trend: "stable" },
];

const getEventIcon = (type: string) => {
  switch (type) {
    case "consultation":
      return Stethoscope;
    case "prescription":
      return FileText;
    case "test":
      return TrendingUp;
    case "vaccination":
      return Heart;
    default:
      return FileText;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case "consultation":
      return "from-primary to-[hsl(190,74%,45%)]";
    case "prescription":
      return "from-[hsl(190,74%,45%)] to-[hsl(200,70%,50%)]";
    case "test":
      return "from-[hsl(200,70%,50%)] to-[hsl(220,70%,55%)]";
    case "vaccination":
      return "from-[hsl(150,60%,45%)] to-[hsl(170,60%,50%)]";
    default:
      return "from-muted to-muted";
  }
};

export function HealthRecords() {
  const [_, setSearchParams] = useSearchParams();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            Health Records
          </h1>
          <p className="text-muted-foreground mt-2">
            Your complete medical history and health metrics
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4" />
          Export Records
        </Button>
      </div>

      {/* Health Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      metric.status === "normal"
                        ? "bg-accent text-accent-foreground"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {metric.status}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">{metric.value}</span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <TrendingUp
                    className={cn(
                      "w-3 h-3",
                      metric.trend === "up" && "text-destructive rotate-0",
                      metric.trend === "down" && "text-primary rotate-180",
                      metric.trend === "stable" && "text-muted-foreground rotate-90"
                    )}
                  />
                  {metric.trend === "stable" ? "Stable" : metric.trend === "up" ? "Increasing" : "Decreasing"}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Health Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Health Timeline</CardTitle>
          <CardDescription>Your medical history and upcoming events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            {/* Timeline Events */}
            <div className="space-y-6">
              {healthEvents.map((event, index) => {
                const Icon = getEventIcon(event.type);
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex gap-4"
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center relative z-10",
                        event.status === "pending"
                          ? "bg-muted border-2 border-dashed border-border"
                          : getEventColor(event.type)
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          event.status === "pending"
                            ? "text-muted-foreground"
                            : "text-primary-foreground"
                        )}
                      />
                    </div>

                    {/* Content */}
                    <div
                      className={cn(
                        "flex-1 p-4 rounded-xl",
                        event.status === "pending"
                          ? "bg-muted/50 border-2 border-dashed border-border"
                          : "bg-muted/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-foreground">{event.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          {event.doctor && (
                            <p className="text-sm text-primary mt-2">👨‍⚕️ {event.doctor}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {event.date}
                          </span>
                          {event.status === "pending" && (
                            <span className="px-2 py-1 rounded-full bg-accent text-xs font-medium text-accent-foreground">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Summary Card */}
      <Card className="bg-gradient-to-br from-primary/5 via-[hsl(190,74%,45%)]/5 to-[hsl(200,70%,50%)]/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center">
              <Heart className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-bold text-foreground">Your Health Score: 85/100</h3>
              <p className="text-muted-foreground mt-1">
                Great job! Your health metrics are looking good. Keep up with regular checkups and a healthy lifestyle.
              </p>
            </div>
            <Button variant="hero" onClick={() => setSearchParams({ tab: "tests" })}>
              Schedule Checkup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
