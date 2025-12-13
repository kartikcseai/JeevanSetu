import { useState, useRef, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, AlertCircle, CheckCircle, Clock, Loader2, X, FileUp, MessageSquare, User, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { analyzeSymptoms, analyzeMedicalReport, chatWithGemini, type AnalysisResult, type ChatMessage } from "@/lib/gemini";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const commonSymptoms = [
  "Headache",
  "Fever",
  "Cough",
  "Fatigue",
  "Nausea",
  "Chest Pain",
  "Shortness of Breath",
  "Dizziness",
];

export function SymptomChecker() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("symptoms");

  // Symptom Checker State
  const [symptoms, setSymptoms] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Report Analyzer State
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportPreview, setReportPreview] = useState<string | null>(null);
  const [isAnalyzingReport, setIsAnalyzingReport] = useState(false);
  const [reportResult, setReportResult] = useState<AnalysisResult | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Symptom Functions
  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAnalyzeSymptoms = async () => {
    const allSymptoms = [...selectedSymptoms, symptoms].filter(Boolean).join(", ");
    if (!allSymptoms) {
      toast.error("Please select or describe your symptoms");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const data = await analyzeSymptoms(symptoms, selectedSymptoms);
      setResult(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze symptoms");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetChecker = () => {
    setSymptoms("");
    setSelectedSymptoms([]);
    setResult(null);
  };

  // Report Functions
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReportFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeReport = async () => {
    if (!reportFile || !reportPreview) {
      toast.error("Please upload a report first");
      return;
    }

    setIsAnalyzingReport(true);
    setReportResult(null);
    setChatHistory([]); // Reset chat on new analysis

    try {
      // Extract base64 (remove data:image/png;base64, prefix)
      const base64Data = reportPreview.split(",")[1];
      const mimeType = reportFile.type;

      const data = await analyzeMedicalReport({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
      setReportResult(data);
      // Add initial system message to chat history based on result
      setChatHistory([
        { role: "model", content: `I've analyzed your report. The findings suggest: ${data.recommendation}. You can ask me follow-up questions.` }
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze report");
    } finally {
      setIsAnalyzingReport(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { role: "user", content: chatInput };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatting(true);

    try {
      // Context from report result
      const context = reportResult ? JSON.stringify(reportResult) : "";
      const reply = await chatWithGemini(chatHistory, userMsg.content, context);

      setChatHistory((prev) => [...prev, { role: "model", content: reply }]);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsChatting(false);
    }
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          color: "bg-destructive",
          icon: AlertCircle,
          label: "Urgent Attention Recommended",
          textColor: "text-destructive",
        };
      case "medium":
        return {
          color: "bg-amber-500",
          icon: Clock,
          label: "Medical Consultation Advised",
          textColor: "text-amber-600",
        };
      default:
        return {
          color: "bg-primary",
          icon: CheckCircle,
          label: "Self-Care May Be Sufficient",
          textColor: "text-primary",
        };
    }
  };

  // Helper component for Result Card to reuse logic
  const ResultView = ({ data, onReset, isReport = false }: { data: AnalysisResult, onReset?: () => void, isReport?: boolean }) => {
    const severityConfig = getSeverityConfig(data.severity);
    const Icon = severityConfig.icon;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <Card variant="elevated" className="overflow-hidden">
          <div className={cn("px-6 py-4", severityConfig.color)}>
            <div className="flex items-center gap-3 text-primary-foreground">
              <Icon className="w-6 h-6" />
              <div>
                <p className="font-semibold">{severityConfig.label}</p>
                <p className="text-sm opacity-90">Based on {isReport ? "report" : "symptom"} analysis</p>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Potential Findings/Conditions</h3>
              <div className="flex flex-wrap gap-2">
                {data.conditions.map((condition, index) => (
                  <span key={index} className="px-3 py-1 rounded-full bg-muted text-sm font-medium text-foreground">
                    {condition}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Recommendation</h3>
              <p className="text-muted-foreground">{data.recommendation}</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3">Recommended Next Steps</h3>
              <ul className="space-y-2">
                {data.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-accent-foreground">{index + 1}</span>
                    </div>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
              <Button variant="hero" className="flex-1" onClick={() => navigate("/dashboard/patient?tab=appointments")}>
                Book Consultation ({data.suggestedSpecialty})
              </Button>
              {isReport && (
                <Button variant="secondary" className="flex-1" onClick={() => navigate("/dashboard/patient?tab=tests")}>
                  Book Related Test
                </Button>
              )}
              {onReset && (
                <Button variant="outline" onClick={onReset} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Start New Check
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[#4CAF50] flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          AI Health Assistant
        </h1>
        <p className="text-muted-foreground mt-2">
          Check symptoms or analyze medical reports with AI
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 md:mx-auto md:w-[50%]">
          <TabsTrigger value="symptoms">Symptom Checker</TabsTrigger>
          <TabsTrigger value="reports">Report Analyzer</TabsTrigger>
        </TabsList>

        <TabsContent value="symptoms" className="space-y-6">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* 🌟 MODIFIED FOR SIDE-BY-SIDE LAYOUT 🌟 */}
                <div className="flex flex-col lg:flex-row gap-6">

                  {/* Common Symptoms Card */}
                  <Card className="lg:flex-1">
                    <CardHeader>
                      <CardTitle className="text-lg">Common Symptoms</CardTitle>
                      <CardDescription>Select any symptoms you're experiencing</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {commonSymptoms.map((symptom) => (
                          <button
                            key={symptom}
                            onClick={() => toggleSymptom(symptom)}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                              selectedSymptoms.includes(symptom)
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                          >
                            {symptom}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Describe Your Symptoms Card */}
                  <Card className="lg:flex-1">
                    <CardHeader>
                      <CardTitle className="text-lg">Describe Your Symptoms</CardTitle>
                      <CardDescription>Provide details about how you're feeling</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="E.g., I've been experiencing a persistent headache..."
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        rows={5}
                        className="resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {selectedSymptoms.length > 0 && <span>Selected: {selectedSymptoms.join(", ")}</span>}
                        </p>
                        <Button
                          variant="hero"
                          onClick={handleAnalyzeSymptoms}
                          disabled={isAnalyzing || (!symptoms && selectedSymptoms.length === 0)}
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              Analyze Symptoms
                              <Send className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div> {/* END of new container */}
              </motion.div>
            ) : (
              <ResultView data={result} onReset={resetChecker} />
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Medical Report</CardTitle>
              <CardDescription>Upload a clear image or PDF of your medical test report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!reportResult ? (
                <>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 text-center hover:bg-muted/50 transition-colors relative">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileUp className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Click or drag file to upload</p>
                        <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, PDF</p>
                      </div>
                    </div>
                  </div>

                  {reportPreview && (
                    <div className="relative rounded-lg overflow-hidden border border-border">
                      {reportFile?.type.startsWith('image/') ? (
                        <img src={reportPreview} alt="Report Preview" className="max-h-64 mx-auto object-contain" />
                      ) : (
                        <div className="flex items-center gap-4 p-4 bg-muted">
                          <FileText className="w-8 h-8 text-primary" />
                          <p className="font-medium">{reportFile?.name}</p>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-background/80 hover:bg-destructive hover:text-destructive-foreground backdrop-blur-sm"
                        onClick={() => {
                          setReportFile(null);
                          setReportPreview(null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleAnalyzeReport}
                    disabled={!reportFile || isAnalyzingReport}
                  >
                    {isAnalyzingReport ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Analyzing Report...
                      </>
                    ) : (
                      <>
                        Analyze Report
                        <Brain className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="space-y-6">
                  <ResultView data={reportResult} isReport />

                  {/* Chat Interface */}
                  <div className="border border-border rounded-xl overflow-hidden bg-background">
                    <div className="p-4 bg-muted border-b border-border flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Follow-up Questions</h3>
                    </div>
                    <div className="h-[300px] flex flex-col">
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                          {chatHistory.map((msg, i) => (
                            <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4 text-primary" />}
                              </div>
                              <div className={cn("rounded-lg p-3 text-sm max-w-[80%]", msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                {msg.content}
                              </div>
                            </div>
                          ))}
                          {isChatting && (
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                              </div>
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>
                      <div className="p-4 border-t border-border flex gap-2">
                        <Input
                          placeholder="Ask a question about this report..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          disabled={isChatting}
                        />
                        <Button size="icon" onClick={handleSendMessage} disabled={!chatInput.trim() || isChatting}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={() => {
                    setReportResult(null);
                    setReportFile(null);
                    setReportPreview(null);
                    setChatHistory([]);
                  }}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Another Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <div className="p-4 rounded-xl bg-accent/50 border border-primary/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Disclaimer:</strong> This AI assistant is for informational purposes only. Analysis may be inaccurate. Always consult a qualified healthcare provider for diagnosis and treatment.
        </p>
      </div>
    </div>
  );
}