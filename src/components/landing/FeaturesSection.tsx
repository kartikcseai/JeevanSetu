import { motion } from "framer-motion";
import { Brain, Video, FileText, Heart, Clock, Shield, Zap, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI Symptom Triage",
    description: "Our Dr.AI analyzes your symptoms in seconds, providing instant insights and recommended next steps.",
    color: "from-primary to-[#4CAF50]",
  },
  {
    icon: Video,
    title: "Teleconsultation",
    description: "Connect with verified doctors via secure video calls. Get professional advice from the comfort of your home.",
    color: "from-primary to-[#4CAF50]",
  },
  {
    icon: FileText,
    title: "E-Prescriptions",
    description: "Receive digital prescriptions instantly. Share with pharmacies or get medicines delivered to your door.",
    color: "from-primary to-[#4CAF50]",
  },
  {
    icon: Heart,
    title: "Digital Health Records",
    description: "Your complete medical history in one secure place. Access, share, and manage your EHR effortlessly.",
    color: "from-primary to-[#4CAF50]",
  },
];

const stats = [
  { icon: Clock, value: "< 2 min", label: "Average Response", color: "from-[#4CAF50] to-[#4CAF50]" },
  { icon: Users, value: "100K+", label: "Happy Patients", color: "from-[#4CAF50] to-[#4CAF50]" },
  { icon: Shield, value: "100%", label: "Data Security", color: "from-[#4CAF50] to-[#4CAF50]" },
  { icon: Zap, value: "24/7", label: "Availability", color: "from-[#4CAF50] to-[#4CAF50]" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6 text-foreground">
            Everything You Need for
            <span className="gradient-text"> Better Health</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive healthcare tools powered by cutting-edge AI technology,
            designed to make quality healthcare accessible to everyone.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card variant="feature" className="h-full group">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Bar - UPDATED SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="bg-transparent border-2 border-[#2A4B18] rounded-3xl p-8 lg:p-12"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="text-center"
              >
                {/* UPDATED: Using dynamic gradient classes from stat.color */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                {/* Existing code remains the same */}
                <div className="text-3xl lg:text-4xl font-bold text-black mb-1">{stat.value}</div>
                <div className="text-sm text-black/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}