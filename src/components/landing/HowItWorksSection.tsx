import { motion } from "framer-motion";
import { MessageSquare, Users, Link2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Describe Your Symptoms",
    description: "Tell our AI your symptoms for quick understanding.",
    iconBg: "bg-accent",
    iconColor: "text-primary",
    numberColor: "text-primary/30",
  },
  {
    number: "02",
    icon: Users,
    title: "Talk to a Verified Doctor",
    description: "Connect with certified doctors on a secure video call for fast advice.",
    iconBg: "bg-[hsl(210,80%,95%)]",
    iconColor: "text-[hsl(210,70%,50%)]",
    numberColor: "text-[hsl(210,70%,50%)]/30",
  },
  {
    number: "03",
    icon: Link2,
    title: "Get E-Prescription & Medicines",
    description: "Get instant digital prescriptions and doorstep medicine delivery.",
    iconBg: "bg-[hsl(15,80%,95%)]",
    iconColor: "text-[hsl(15,70%,50%)]",
    numberColor: "text-[hsl(15,70%,50%)]/30",
  },
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

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
            Healthcare in Three Simple Steps
          </h2>
          <p className="text-lg text-muted-foreground">
            Experience seamless healthcare from the comfort of your home. Our platform makes it easy to get the care you need.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto"
        >
          {steps.map((step) => (
            <motion.div key={step.number} variants={itemVariants}>
              <Card className="h-full bg-card border-border/50 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8 text-center relative">
                  {/* Step Number - positioned in corner */}
                  <span className={`absolute top-6 right-6 text-5xl font-bold ${step.numberColor}`}>
                    {step.number}
                  </span>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${step.iconBg} flex items-center justify-center mx-auto mb-6`}>
                    <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-4">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-16"
        >
          <a
            href="/auth/register"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-4 transition-all duration-300"
          >
            Start your health journey today
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
