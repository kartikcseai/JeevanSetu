import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Marketing Manager",
    avatar: "SJ",
    rating: 5,
    text: "JeevanSetu saved me hours of waiting at the clinic. The AI symptom checker was incredibly accurate, and I got a doctor's consultation within 20 minutes. This is the future of healthcare!",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    role: "Family Physician",
    avatar: "MC",
    rating: 5,
    text: "As a doctor, I love how JeevanSetu streamlines the consultation process. The AI triage helps me understand patients' concerns before we even meet, making our sessions more productive.",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Working Mom",
    avatar: "ER",
    rating: 5,
    text: "With three kids, getting to a doctor's office is a nightmare. JeevanSetu lets me consult specialists from home while the kids nap. The e-prescriptions are sent directly to my pharmacy!",
  },
  {
    id: 4,
    name: "James Wilson",
    role: "Software Engineer",
    avatar: "JW",
    rating: 5,
    text: "I was skeptical about AI healthcare at first, but JeevanSetu blew me away. The symptom analysis was spot-on, and having all my health records in one place is incredibly convenient.",
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6 text-foreground">
            Trusted by
            <span className="gradient-text"> Thousands</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our patients and healthcare professionals have to say about their experience.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="max-w-4xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              <Card variant="elevated" className="relative overflow-hidden">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 text-primary/10">
                  <Quote className="w-20 h-20" />
                </div>

                <CardContent className="p-8 lg:p-12">
                  {/* Rating */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-lg lg:text-xl text-foreground leading-relaxed mb-8">
                    "{testimonials[currentIndex].text}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center text-lg font-semibold text-primary-foreground">
                      {testimonials[currentIndex].avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonials[currentIndex].name}</div>
                      <div className="text-sm text-muted-foreground">{testimonials[currentIndex].role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
