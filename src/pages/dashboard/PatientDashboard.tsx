import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Brain, Calendar, FileText, Heart,
  Home, LogOut, Menu, Settings, User, X,
  Clock, ChevronRight, Bell, Loader2, Beaker
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SymptomChecker } from "@/components/dashboard/SymptomChecker";
import { AppointmentsList } from "@/components/dashboard/AppointmentsList";
import { PrescriptionsList } from "@/components/dashboard/PrescriptionsList";
import { HealthRecords } from "@/components/dashboard/HealthRecords";
import { BookTest } from "@/components/dashboard/BookTest";
import { useAuth } from "@/contexts/AuthContext";
import { useAppointments, usePrescriptions } from "@/hooks/useRealtimeData";
import { format, isToday, isTomorrow } from "date-fns";
import { CartProvider } from "@/contexts/CartContext";

const navItems = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "symptoms", label: "AI Symptom Check", icon: Brain },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "prescriptions", label: "Prescriptions", icon: FileText },
  { id: "records", label: "Health Records", icon: Heart },
  { id: "tests", label: "Book Medical Test", icon: Beaker },
];

const quickActions = [
  { label: "Start Symptom Check", icon: Brain, action: "symptoms", description: "Get instant AI analysis" },
  { label: "Book Consultation", icon: Calendar, action: "appointments", description: "Schedule a doctor visit" },
  { label: "Book Lab Test", icon: Beaker, action: "tests", description: "Schedule a medical test" },
  { label: "View Records", icon: FileText, action: "records", description: "Access your health history" },
];

export default function PatientDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && navItems.find(i => i.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const updateTab = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "symptoms":
        return <SymptomChecker />;
      case "appointments":
        return <AppointmentsList />;
      case "prescriptions":
        return <PrescriptionsList />;
      case "records":
        return <HealthRecords />;
      case "tests":
        return <BookTest />;
      default:
        return <OverviewContent setActiveTab={updateTab} />;
    }
  };

  const initials = profile?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "PA";

  return (
    <CartProvider>
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
          {/* Sidebar Overlay (Mobile) */}
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
              {/* Sidebar Header */}
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

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      updateTab(item.id);
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

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-border space-y-1">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center text-lg font-semibold text-primary-foreground">
                      {initials}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{profile?.full_name || "Patient"}</div>
                      <div className="text-sm text-muted-foreground">Patient</div>
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

          {/* Main Content */}
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
    </CartProvider>
  );
}

function OverviewContent({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { profile } = useAuth();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { prescriptions, loading: prescriptionsLoading } = usePrescriptions();

  const upcomingAppointments = appointments.filter(a => a.status === "upcoming").slice(0, 2);
  const activePrescriptions = prescriptions.filter(p => p.status === "active").slice(0, 3);

  const quickStats = [
    { label: "Upcoming Appointments", value: upcomingAppointments.length.toString(), icon: Calendar, color: "from-primary to-[#4CAF50]" },
    { label: "Active Prescriptions", value: activePrescriptions.length.toString(), icon: FileText, color: "from-primary to-[#4CAF50]" },
    { label: "Health Score", value: "85%", icon: Heart, color: "from-primary to-[#4CAF50]" },
  ];

  const formatAppointmentDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
    if (isTomorrow(date)) return `Tomorrow, ${format(date, "h:mm a")}`;
    return format(date, "MMM d, h:mm a");
  };

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your health dashboard
        </p>
      </div>

      {/* Quick Stats - UPDATED to grid-cols-1 md:grid-cols-3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="h-full"
          >
            <Card variant="elevated" className="overflow-hidden h-full flex flex-col justify-center">
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

      {/* Quick Actions - UPDATED to grid-cols-1 md:grid-cols-2 xl:grid-cols-4 */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="h-full"
            >
              <Card
                variant="interactive"
                className="group h-full flex flex-col cursor-pointer"
                onClick={() => setActiveTab(action.action)}
              >
                <CardContent className="p-6 flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                    <action.icon className="w-6 h-6 text-white group-hover:text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{action.label}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{action.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity & Upcoming */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between shrink-0">
            <div>
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled consultations</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab("appointments")}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {appointmentsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments</p>
            ) : (
              upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center text-sm font-semibold text-primary-foreground shrink-0">
                    {apt.doctor?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "DR"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{apt.doctor?.full_name || "Doctor"}</p>
                    <p className="text-sm text-muted-foreground">{apt.doctor?.specialty || "General"}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                    <Clock className="w-4 h-4" />
                    {formatAppointmentDate(apt.scheduled_at)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Prescriptions */}
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between shrink-0">
            <div>
              <CardTitle className="text-lg">Active Prescriptions</CardTitle>
              <CardDescription>Your current medications</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab("prescriptions")}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {prescriptionsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : activePrescriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No active prescriptions</p>
            ) : (
              activePrescriptions.map((rx) => (
                <div key={rx.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{rx.diagnosis}</p>
                    <p className="text-sm text-muted-foreground">
                      {rx.medications?.length || 0} medication{(rx.medications?.length || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground shrink-0">
                    Active
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}