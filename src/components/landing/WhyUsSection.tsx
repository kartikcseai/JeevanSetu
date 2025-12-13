import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const comparison = {
  traditional: {
    title: "Traditional Healthcare",
    items: [
      { text: "Long wait times for appointments", included: false },
      { text: "Limited to office hours", included: false },
      { text: "Paper prescriptions", included: false },
      { text: "Scattered medical records", included: false },
      { text: "High consultation fees", included: false },
    ],
  },
  jeevansetu: {
    title: "With JeevanSetu",
    items: [
      { text: "Instant AI assessment available 24/7", included: true },
      { text: "Same-day doctor consultations", included: true },
      { text: "Digital prescriptions in seconds", included: true },
      { text: "Unified digital health records", included: true },
      { text: "Affordable & transparent pricing", included: true },
    ],
  },
};

const benefits = [
  "Save up to 70% on healthcare costs",
  "No more waiting rooms or long queues",
  "Access specialists from anywhere",
  "Complete privacy and data security",
];

export function WhyUsSection() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6 text-foreground">
            Healthcare,
            <span className="gradient-text"> Reimagined</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See how JeevanSetu transforms your healthcare experience compared to traditional methods.
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Traditional */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full bg-muted/50 border-muted">
              <CardHeader>
                <CardTitle className="text-xl text-muted-foreground">{comparison.traditional.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {comparison.traditional.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-4 h-4 text-destructive" />
                    </div>
                    <span className="text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* JeevanSetu */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full border-primary/30 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-[hsl(190,74%,45%)] text-primary-foreground text-xs font-semibold px-4 py-1 rounded-bl-lg">
                Recommended
              </div>
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{comparison.jeevansetu.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {comparison.jeevansetu.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Benefits Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="bg-accent rounded-3xl p-8 lg:p-12"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-white">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
