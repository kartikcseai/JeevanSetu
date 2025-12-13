import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, ChevronDown, ChevronUp, Download, Calendar, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usePrescriptions } from "@/hooks/useRealtimeData";
import { format } from "date-fns";

export function PrescriptionsList() {
  const { prescriptions, loading } = usePrescriptions();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const activePrescriptions = prescriptions.filter((p) => p.status === "active");
  const completedPrescriptions = prescriptions.filter((p) => p.status === "completed");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[#4CAF50] flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-foreground" />
          </div>
          Prescriptions
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage your medication prescriptions
        </p>
      </div>

      {prescriptions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No prescriptions yet</h3>
            <p className="text-muted-foreground">
              Your prescriptions from doctors will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Prescriptions */}
          {activePrescriptions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Active Prescriptions ({activePrescriptions.length})
              </h2>
              <div className="space-y-4">
                {activePrescriptions.map((prescription, index) => (
                  <PrescriptionCard
                    key={prescription.id}
                    prescription={prescription}
                    index={index}
                    isExpanded={expandedId === prescription.id}
                    onToggle={() => toggleExpand(prescription.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Prescriptions */}
          {completedPrescriptions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                Past Prescriptions ({completedPrescriptions.length})
              </h2>
              <div className="space-y-4">
                {completedPrescriptions.map((prescription, index) => (
                  <PrescriptionCard
                    key={prescription.id}
                    prescription={prescription}
                    index={index + activePrescriptions.length}
                    isExpanded={expandedId === prescription.id}
                    onToggle={() => toggleExpand(prescription.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PrescriptionCard({
  prescription,
  index,
  isExpanded,
  onToggle,
}: {
  prescription: any;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const isActive = prescription.status === "active";
  const doctorName = prescription.doctor?.full_name || "Unknown Doctor";
  const formattedDate = format(new Date(prescription.created_at), "MMM d, yyyy");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        variant={isActive ? "elevated" : "default"}
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded && "ring-2 ring-primary/20"
        )}
      >
        {/* Header */}
        <button
          onClick={onToggle}
          className="w-full p-6 flex items-center gap-4 text-left hover:bg-muted/50 transition-colors"
        >
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              isActive
                ? "bg-gradient-to-br from-[#4CAF50] to-[#4CAF50]"
                : "bg-muted"
            )}
          >
            <FileText
              className={cn(
                "w-6 h-6",
                isActive ? "text-primary-foreground" : "text-muted-foreground"
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{prescription.diagnosis}</h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {doctorName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {prescription.medications?.length || 0} medication{(prescription.medications?.length || 0) !== 1 ? "s" : ""}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0 pb-6 px-6">
              <div className="border-t border-border pt-6 space-y-4">
                <h4 className="font-semibold text-foreground">Medications</h4>
                {prescription.medications && prescription.medications.length > 0 ? (
                  <div className="space-y-3">
                    {prescription.medications.map((med: any, medIndex: number) => (
                      <div
                        key={med.id || medIndex}
                        className="p-4 rounded-xl bg-muted/50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-foreground">{med.name}</h5>
                          <span className="text-sm text-muted-foreground">{med.duration}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Dosage:</span>{" "}
                            <span className="text-foreground">{med.dosage}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Frequency:</span>{" "}
                            <span className="text-foreground">{med.frequency}</span>
                          </div>
                        </div>
                        {med.instructions && (
                          <p className="text-sm text-primary">📝 {med.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No medications listed</p>
                )}

                {prescription.notes && (
                  <div className="p-4 rounded-xl bg-muted/30 border border-border">
                    <p className="text-sm text-muted-foreground">
                      <strong>Notes:</strong> {prescription.notes}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4 w-[80%] mx-auto">
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                  {isActive && (
                    <Button variant="hero-outline" className="flex-1">
                      Order Medicines
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}