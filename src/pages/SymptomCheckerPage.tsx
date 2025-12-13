import { Footer } from "@/components/layout/Footer";
import { SymptomChecker } from "@/components/dashboard/SymptomChecker";

export default function SymptomCheckerPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <SymptomChecker />
        </div>
      </div>
      <Footer />
    </main>
  );
}
