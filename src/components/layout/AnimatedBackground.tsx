import { motion } from "framer-motion";
import { Brain, Stethoscope, Shield, Sparkles, Thermometer, Microscope, Pill } from "lucide-react";

const floatingElements = [
    { icon: Brain, label: "AI Analysis", x: "85%", y: "10%", delay: 0 },
    { icon: Stethoscope, label: "Expert Consults", x: "85%", y: "25%", delay: 0.5 },
    { icon: Shield, label: "Secure Data", x: "85%", y: "40%", delay: 1 },
    { icon: Microscope, label: "Lab Diagnostics", x: "85%", y: "55%", delay: 1.5 },
    { icon: Thermometer, label: "Health Monitoring", x: "85%", y: "70%", delay: 2 },
    { icon: Pill, label: "Medicine Tracking", x: "85%", y: "85%", delay: 2.5 },
];

export function AnimatedBackground() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
                        className="relative"
                    >
                        {/* --- PERMANENT LABEL (Speech Bubble) --- */}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-5 px-4 py-2 
                                        bg-white text-green-800 text-sm font-bold rounded-xl shadow-sm 
                                        whitespace-nowrap z-10">
                            {el.label}

                            {/* The Triangle Arrow */}
                            <div className="absolute top-1/2 -right-1.5 -mt-1.5 w-3 h-3 bg-white rotate-45"></div>
                        </div>
                        {/* --------------------------------------- */}

                        {/* The Icon Box */}
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                            <el.icon className="w-6 h-6 text-green-700" />
                        </div>
                    </motion.div>
                </motion.div>
            ))}
        </div>
    );
}