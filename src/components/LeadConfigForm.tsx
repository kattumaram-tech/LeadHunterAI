import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Search, Target, Filter, Zap, PlusCircle, MinusCircle } from "lucide-react";

export interface LeadConfigData {
  niche: string;
  region: string;
  quantity: number;
  criteria: string;
  include_keywords?: string;
  exclude_keywords?: string;
}

interface LeadConfigFormProps {
  onSubmit: (data: LeadConfigData) => void;
  isLoading?: boolean;
}

export function LeadConfigForm({ onSubmit, isLoading }: LeadConfigFormProps) {
  const [config, setConfig] = useState<LeadConfigData>({
    niche: "",
    region: "",
    quantity: 50,
    criteria: "poucos reels, não anuncia, alcance baixo, poucas curtidas em posts",
    include_keywords: "",
    exclude_keywords: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-8 bg-gradient-card backdrop-blur-sm border-border/50 shadow-medium">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Configurar Busca</h2>
        </div>
        <p className="text-muted-foreground">
          Configure os parâmetros para gerar leads personalizados com IA
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="niche" className="text-sm font-medium flex items-center gap-2">
              <Search className="w-4 h-4 text-brand-accent" />
              Nicho de Mercado
            </Label>
            <Input
              id="niche"
              type="text"
              value={config.niche}
              onChange={(e) => setConfig({ ...config, niche: e.target.value })}
              placeholder="Ex: Energia solar, Consultoria empresarial"
              className="bg-background/80 border-border/60 focus:border-brand-accent transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="region" className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-accent" />
              Região
            </Label>
            <Input
              id="region"
              type="text"
              value={config.region}
              onChange={(e) => setConfig({ ...config, region: e.target.value })}
              placeholder="Ex: Brasília, São Paulo, Rio de Janeiro"
              className="bg-background/80 border-border/60 focus:border-brand-accent transition-colors"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-accent" />
            Quantidade de Leads: {config.quantity}
          </Label>
          <div className="px-4">
            <Slider
              value={[config.quantity]}
              onValueChange={(value) => setConfig({ ...config, quantity: value[0] })}
              min={10}
              max={300}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>10</span>
              <span>150</span>
              <span>300</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="criteria" className="text-sm font-medium flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand-accent" />
            Critérios de Baixa Presença Digital
          </Label>
          <Textarea
            id="criteria"
            value={config.criteria}
            onChange={(e) => setConfig({ ...config, criteria: e.target.value })}
            placeholder="Ex: poucos reels, não anuncia, alcance baixo, poucas curtidas"
            className="bg-background/80 border-border/60 focus:border-brand-accent transition-colors min-h-[100px] resize-none"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="include_keywords" className="text-sm font-medium flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-green-500" />
                    Palavras-chave para Incluir
                </Label>
                <Input
                    id="include_keywords"
                    type="text"
                    value={config.include_keywords}
                    onChange={(e) => setConfig({ ...config, include_keywords: e.target.value })}
                    placeholder="Ex: B2B, software, artesanal"
                    className="bg-background/80 border-border/60 focus:border-brand-accent transition-colors"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="exclude_keywords" className="text-sm font-medium flex items-center gap-2">
                    <MinusCircle className="w-4 h-4 text-red-500" />
                    Palavras-chave para Excluir
                </Label>
                <Input
                    id="exclude_keywords"
                    type="text"
                    value={config.exclude_keywords}
                    onChange={(e) => setConfig({ ...config, exclude_keywords: e.target.value })}
                    placeholder="Ex: B2C, governo, grande porte"
                    className="bg-background/80 border-border/60 focus:border-brand-accent transition-colors"
                />
            </div>
        </div>

        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="w-full h-12 text-base font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Gerando lista com Gemini...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Gerar lista com Gemini
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
