import { useState } from "react";
import { LeadConfigForm, type LeadConfigData } from "@/components/LeadConfigForm";
import { LeadResults, type Lead } from "@/components/LeadResults";
import { ScheduleGuide } from "@/components/ScheduleGuide";
import { Badge } from "@/components/ui/badge";
import { Zap, Target, Users } from "lucide-react";
import leadHunterIcon from "@/assets/leadhunter-icon.png";

// Mock data for demonstration
const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Solar Tech Brasília",
    instagram: "https://instagram.com/solartech_bsb",
    whatsapp: "(61) 99999-1234",
    contact: "(61) 99999-1234",
    score: 85
  },
  {
    id: "2", 
    name: "Energia Verde DF",
    website: "https://energiaverde.com.br",
    whatsapp: "(61) 98888-5678",
    contact: "(61) 98888-5678",
    score: 78
  },
  {
    id: "3",
    name: "EcoSolar Consultoria",
    instagram: "https://instagram.com/ecosolar_consultoria",
    whatsapp: "(61) 97777-9012",
    contact: "(61) 97777-9012",
    score: 92
  },
  {
    id: "4",
    name: "Sustenta Solar",
    website: "https://sustentasolar.com.br",
    whatsapp: "(61) 96666-3456",
    contact: "(61) 96666-3456",
    score: 73
  }
];

const Index = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleFormSubmit = async (data: LeadConfigData) => {
    setIsLoading(true);
    setShowResults(false);
    
    // Simulate API call to Gemini
    setTimeout(() => {
      // Filter and customize mock data based on the form
      const filteredLeads = mockLeads.map(lead => ({
        ...lead,
        name: lead.name.replace(/Solar|Energia|Eco/, data.niche.split(' ')[0] || 'Solar')
      })).slice(0, Math.min(data.quantity, mockLeads.length));
      
      setLeads(filteredLeads);
      setShowResults(true);
      setIsLoading(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={leadHunterIcon} 
                alt="LeadHunterAI" 
                className="w-10 h-10 rounded-xl shadow-soft"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">LeadHunterAI</h1>
                <p className="text-sm text-muted-foreground">Sua IA caçadora de clientes</p>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:flex items-center gap-2">
              <Zap className="w-3 h-3" />
              Powered by Gemini AI
            </Badge>
          </div>
        </div>
      </header>

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

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img 
                src={leadHunterIcon} 
                alt="LeadHunterAI" 
                className="w-6 h-6 rounded"
              />
              <span className="font-semibold text-foreground">LeadHunterAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Transformando prospecção em ciência com Inteligência Artificial
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
