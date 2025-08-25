import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, MessageCircle, Instagram, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface Lead {
  id: string;
  name: string;
  instagram?: string;
  website?: string;
  whatsapp?: string;
  contact: string;
  score: number;
}

interface LeadResultsProps {
  leads: Lead[];
  isVisible: boolean;
}

export function LeadResults({ leads, isVisible }: LeadResultsProps) {
  const { toast } = useToast();

  const exportToCSV = () => {
    if (leads.length === 0) return;

    const headers = ['Nome da Empresa', 'Instagram/Site', 'WhatsApp'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        lead.name,
        lead.instagram || lead.website || 'N/A',
        lead.whatsapp || lead.contact || 'N/A'
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export realizado!",
      description: `${leads.length} leads exportados para CSV`,
    });
  };

  if (!isVisible || leads.length === 0) return null;

  return (
    <Card className="w-full max-w-6xl mx-auto p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-medium">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">Leads Encontrados</h3>
          <p className="text-muted-foreground">
            {leads.length} empresas identificadas com baixa presença digital
          </p>
        </div>
        <Button
          onClick={exportToCSV}
          variant="brand"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-1 gap-4 sm:hidden">
            {leads.map((lead) => (
              <Card key={lead.id} className="p-4 border border-border/40 bg-background/50">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-foreground">{lead.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      Score: {lead.score}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {(lead.instagram || lead.website) && (
                      <div className="flex items-center gap-2">
                        {lead.instagram ? (
                          <Instagram className="w-4 h-4 text-pink-500" />
                        ) : (
                          <Globe className="w-4 h-4 text-blue-500" />
                        )}
                        <a
                          href={lead.instagram || lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-brand-accent hover:underline flex items-center gap-1"
                        >
                          {lead.instagram ? '@' + lead.instagram.split('/').pop() : 'Website'}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    
                    {(lead.whatsapp || lead.contact) && (
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-green-500" />
                        <a
                          href={`https://wa.me/${(lead.whatsapp || lead.contact).replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-brand-accent hover:underline flex items-center gap-1"
                        >
                          {lead.whatsapp || lead.contact}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Nome da Empresa</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Instagram/Site</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">WhatsApp</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Score</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-border/20 hover:bg-background/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-foreground">{lead.name}</div>
                    </td>
                    <td className="py-4 px-4">
                      {(lead.instagram || lead.website) ? (
                        <a
                          href={lead.instagram || lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-accent hover:underline flex items-center gap-2"
                        >
                          {lead.instagram ? (
                            <>
                              <Instagram className="w-4 h-4 text-pink-500" />
                              @{lead.instagram.split('/').pop()}
                            </>
                          ) : (
                            <>
                              <Globe className="w-4 h-4 text-blue-500" />
                              Website
                            </>
                          )}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {(lead.whatsapp || lead.contact) ? (
                        <a
                          href={`https://wa.me/${(lead.whatsapp || lead.contact).replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-accent hover:underline flex items-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4 text-green-500" />
                          {lead.whatsapp || lead.contact}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="secondary" className="text-xs">
                        {lead.score}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
}