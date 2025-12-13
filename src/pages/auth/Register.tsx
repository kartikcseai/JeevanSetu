import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Mail, Lock, Eye, EyeOff, ArrowRight,
  User, Stethoscope, Check, ChevronDown, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { registerSchema } from "@/lib/validations/auth";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";

type UserRole = "patient" | "doctor";

// 1. Define the list of available specialties
const SPECIALTIES_LIST = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Pediatrician",
  "Psychiatrist",
  "Orthopedic Surgeon",
  "Gynecologist",
  "Dentist",
  "ENT Specialist",
  "Oncologist",
  "Endocrinologist",
];

export default function Register() {
  const navigate = useNavigate();
  const { signUp, user, profile, loading } = useAuth();
  const [role, setRole] = useState<UserRole>("patient");

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 2. State for Multi-select
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [isSpecialtyOpen, setIsSpecialtyOpen] = useState(false);
  const specialtyDropdownRef = useRef<HTMLDivElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; specialty?: string }>({});

  useEffect(() => {
    if (!loading && user && profile) {
      const dashboard = profile.role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient";
      navigate(dashboard, { replace: true });
    }
  }, [user, profile, loading, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (specialtyDropdownRef.current && !specialtyDropdownRef.current.contains(event.target as Node)) {
        setIsSpecialtyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev => {
      const isSelected = prev.includes(specialty);
      if (isSelected) {
        return prev.filter(s => s !== specialty);
      } else {
        return [...prev, specialty];
      }
    });
  };

  const removeSpecialty = (e: React.MouseEvent, specialty: string) => {
    e.stopPropagation(); // Prevent dropdown from toggling
    setSelectedSpecialties(prev => prev.filter(s => s !== specialty));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Convert array to string for validation/backend
    const specialtyString = selectedSpecialties.join(", ");

    const result = registerSchema.safeParse({
      name,
      email,
      password,
      specialty: role === "doctor" ? specialtyString : undefined
    });

    if (!result.success) {
      const fieldErrors: { name?: string; email?: string; password?: string; specialty?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (field === "name") fieldErrors.name = err.message;
        if (field === "email") fieldErrors.email = err.message;
        if (field === "password") fieldErrors.password = err.message;
        if (field === "specialty") fieldErrors.specialty = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (role === "doctor" && selectedSpecialties.length === 0) {
      setErrors({ specialty: "Please select at least one specialty" });
      return;
    }

    setIsLoading(true);

    // Pass the comma-separated string to the backend
    const { error } = await signUp(email, password, name, role, specialtyString);

    if (error) {
      let message = error.message;
      if (error.message.includes("already registered")) {
        message = "An account with this email already exists. Please sign in instead.";
      }
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Account created!",
        description: "Welcome to JeevanSetu. Let's get started!",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-[#348460] to-[#348460] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse-slow" />
        <AnimatedBackground />

        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <img src="/src/assets/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-2xl font-bold">JeevanSetu</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Join JeevanSetu Today</h1>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              Create your account to access AI-powered healthcare, connect with
              specialists, and take control of your health journey.
            </p>
          </motion.div>

          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-sm font-medium">1</span>
              </div>
              <span className="text-primary-foreground/90">Create your free account</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-sm font-medium">2</span>
              </div>
              <span className="text-primary-foreground/90">Complete your health profile</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-sm font-medium">3</span>
              </div>
              <span className="text-primary-foreground/90">Start your health journey</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[hsl(150,70%,50%)] flex items-center justify-center">
              <img src="/src/assets/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="text-xl font-bold text-foreground">JeevanSetu</span>
          </Link>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <CardDescription>Join thousands of users on JeevanSetu</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setRole("patient")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                    role === "patient"
                      ? "border-primary bg-accent"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <User className={cn("w-6 h-6", role === "patient" ? "text-black" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-medium", role === "patient" ? "text-black" : "text-muted-foreground")}>
                    I'm a Patient
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("doctor")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                    role === "doctor"
                      ? "border-primary bg-accent"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Stethoscope className={cn("w-6 h-6", role === "doctor" ? "text-black" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-medium", role === "doctor" ? "text-black" : "text-muted-foreground")}>
                    I'm a Doctor
                  </span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder={role === "doctor" ? "Dr. John Smith" : "John Smith"}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
                      required
                    />
                  </div>
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                {/* --- CUSTOM MULTI-SELECT DROPDOWN FOR SPECIALTY --- */}
                {role === "doctor" && (
                  <div className="space-y-2 relative" ref={specialtyDropdownRef}>
                    <Label htmlFor="specialty">Specialty</Label>
                    <div
                      className={cn(
                        "relative min-h-[40px] border rounded-md flex items-center flex-wrap gap-2 py-2 pl-10 pr-3 cursor-pointer transition-colors",
                        errors.specialty ? "border-destructive" : "border-input hover:border-primary",
                        isSpecialtyOpen ? "ring-2 ring-ring ring-offset-2" : ""
                      )}
                      onClick={() => setIsSpecialtyOpen(!isSpecialtyOpen)}
                    >
                      <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

                      {/* Placeholder if empty */}
                      {selectedSpecialties.length === 0 && (
                        <span className="text-muted-foreground text-sm">Select specialties...</span>
                      )}

                      {/* Selected Items (Pills) */}
                      {selectedSpecialties.map((spec) => (
                        <span
                          key={spec}
                          className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium z-10"
                        >
                          {spec}
                          <div
                            role="button"
                            onClick={(e) => removeSpecialty(e, spec)}
                            className="hover:bg-primary/20 rounded-full p-0.5 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </div>
                        </span>
                      ))}

                      {/* Chevron Arrow */}
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                    </div>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isSpecialtyOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover text-popover-foreground border rounded-md shadow-lg max-h-60 overflow-y-auto"
                        >
                          {SPECIALTIES_LIST.map((spec) => {
                            const isSelected = selectedSpecialties.includes(spec);
                            return (
                              <div
                                key={spec}
                                onClick={() => toggleSpecialty(spec)}
                                className={cn(
                                  "flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
                                  isSelected && "bg-accent/50"
                                )}
                              >
                                <div className={cn(
                                  "w-4 h-4 border rounded flex items-center justify-center",
                                  isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                                )}>
                                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                                </div>
                                {spec}
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {errors.specialty && <p className="text-sm text-destructive">{errors.specialty}</p>}
                  </div>
                )}
                {/* -------------------------------------------------- */}

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                        required
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2 flex-1">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  Must be 8+ characters with uppercase, lowercase, and number
                </p>

                {/* <div className="text-xs text-muted-foreground">
                  By creating an account, you agree to our{" "}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                </div> */}

                <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/auth/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}