import { useState } from "react";
import { LeadConfigForm, type LeadConfigData } from "@/components/LeadConfigForm";
import { LeadResults, type Lead } from "@/components/LeadResults";
import { ScheduleGuide } from "@/components/ScheduleGuide";
import { Zap, Target, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();

  const handleFormSubmit = async (data: LeadConfigData) => {
    setIsLoading(true);
    setShowResults(false);
    setLeads([]);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido no servidor' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const resultLeads: Lead[] = await response.json();
      setLeads(resultLeads);
      setShowResults(true);

      if (resultLeads.length === 0) {
        toast({
          title: "Nenhum lead encontrado",
          description: "Tente ajustar seus critérios de busca para melhores resultados.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error("Failed to fetch leads:", error);
      toast({
        title: "Ocorreu um erro!",
        description: error instanceof Error ? error.message : "Não foi possível buscar os leads. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Encontre Clientes com
              <span className="bg-gradient-hero bg-clip-text text-transparent ml-3">
                Inteligência Artificial
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Use o poder da IA para identificar empresas com baixa presença digital 
              e transformá-las em oportunidades de negócio
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full border border-border/40">
              <Target className="w-4 h-4 text-brand-accent" />
              <span className="text-sm font-medium">Busca Inteligente</span>
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full border border-border/40">
              <Users className="w-4 h-4 text-brand-accent" />
              <span className="text-sm font-medium">Leads Qualificados</span>
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full border border-border/40">
              <Zap className="w-4 h-4 text-brand-accent" />
              <span className="text-sm font-medium">Resultados Rápidos</span>
            </div>
          </div>
        </section>

        {/* Configuration Form */}
        <section>
          <LeadConfigForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </section>

        {/* Results */}
        <section>
          <LeadResults leads={leads} isVisible={showResults} />
        </section>

        {/* Schedule Guide */}
        <section>
          <ScheduleGuide />
        </section>
      </main>
    </Layout>
  );
};

export default Index;