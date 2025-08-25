import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, Phone, Mail } from "lucide-react";

const scheduleItems = [
  {
    day: "Segunda-feira",
    activity: "Organização e Follow-up",
    description: "Revisar leads da semana anterior e organizar pipeline",
    icon: CheckCircle,
    color: "bg-blue-500",
    time: "9h - 11h"
  },
  {
    day: "Terça-feira",
    activity: "Prospecção Intensiva",
    description: "Geração de novos leads e primeiro contato",
    icon: Phone,
    color: "bg-brand-accent",
    time: "9h - 12h"
  },
  {
    day: "Quarta-feira",
    activity: "Prospecção Intensiva",
    description: "Continuação da geração e qualificação de leads",
    icon: Phone,
    color: "bg-brand-accent",
    time: "9h - 12h"
  },
  {
    day: "Quinta-feira",
    activity: "Prospecção Intensiva",
    description: "Finalização da prospecção semanal",
    icon: Phone,
    color: "bg-brand-accent",
    time: "9h - 12h"
  },
  {
    day: "Sexta-feira",
    activity: "Prospecção e Follow-up",
    description: "Últimos contatos e acompanhamento de respostas",
    icon: Mail,
    color: "bg-purple-500",
    time: "9h - 12h"
  }
];

export function ScheduleGuide() {
  return (
    <Card className="w-full max-w-4xl mx-auto p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-medium">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Cronograma Sugerido</h3>
        </div>
        <p className="text-muted-foreground">
          Organize sua semana para maximizar resultados na prospecção
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scheduleItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} className="p-4 border border-border/40 bg-background/30 hover:bg-background/50 transition-all duration-300 hover:shadow-soft">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-medium">
                    {item.day}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">{item.activity}</h4>
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-background/40 rounded-lg border border-border/30">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-brand-warning/20 rounded-lg flex items-center justify-center mt-0.5">
            <Clock className="w-4 h-4 text-brand-warning" />
          </div>
          <div>
            <h4 className="font-medium text-sm text-foreground mb-1">Dica de Produtividade</h4>
            <p className="text-xs text-muted-foreground">
              <strong>Tarde (14h - 17h):</strong> Reserve para checar respostas, agendar reuniões e qualificar leads interessados. 
              Este horário é ideal para atividades de follow-up e nutrição de relacionamentos.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}