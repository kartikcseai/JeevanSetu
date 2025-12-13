import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, Stethoscope, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const floatingElements = [
  { icon: Brain, x: "10%", y: "20%", delay: 0 },
  { icon: Stethoscope, x: "85%", y: "15%", delay: 0.5 },
  { icon: Shield, x: "5%", y: "70%", delay: 1 },
  { icon: Sparkles, x: "90%", y: "65%", delay: 1.5 },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern" />

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(200,70%,50%)]/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />

      {/* Floating Icons */}
      {floatingElements.map((el, index) => (
        <motion.div
          key={index}
          className="absolute hidden lg:block"
          style={{ left: el.x, top: el.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: el.delay + 0.5, duration: 0.5 }}
        >
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: el.delay }}
            className="w-14 h-14 rounded-2xl bg-card shadow-lg flex items-center justify-center border border-border/50"
          >
            <el.icon className="w-6 h-6 text-primary" />
          </motion.div>
        </motion.div>
      ))}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B3DCC3] border border-primary/20 text-sm font-medium text-black mb-8">
              <Sparkles className="w-4 h-4 text-black" />
              AI-Powered Healthcare Platform
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="text-foreground">JeevanSetu – Smart AI</span>
            <br />
            <span className="gradient-text">Healthcare Assistant</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            From symptoms to solutions — all in one place. Get instant AI-powered health insights,
            connect with verified doctors, and manage your prescriptions seamlessly.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/auth/register">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/symptom-checker">
                Try AI Symptom Checker
              </Link>
            </Button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 pt-12 border-t border-border/50"
          >
            <p className="text-sm text-muted-foreground mb-4">Trusted by healthcare professionals worldwide</p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground/50">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">100K+ Consultations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">500+ Verified Doctors</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">4.9★ Rating</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
