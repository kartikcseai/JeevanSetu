import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[hsl(200,70%,50%)]/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B3DCC3] border border-primary/20 text-sm font-medium text-black mb-8">
            <Sparkles className="w-4 h-4 text-black" />
            Start Your Health Journey Today
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
            Ready to Experience the
            <span className="gradient-text"> Future of Healthcare?</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Join thousands of patients who have transformed their healthcare experience with JeevanSetu.
            Get started for free and take control of your health today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/auth/register">
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/symptom-checker">
                Try Symptom Checker
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • Free consultation included • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
