import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Lead } from '@/components/LeadResults';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

export const HistoryPage = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/history', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao carregar histórico.');
        }

        const data: Lead[] = await response.json();
        setLeads(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar histórico de leads.';
        toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchHistory();
    }
  }, [token, toast]);

  const exportToCsv = () => {
    if (leads.length === 0) {
      toast({ title: 'Nenhum lead para exportar', description: 'Gere alguns leads primeiro.' });
      return;
    }
    const csv = Papa.unparse(leads);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'leads_historico.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Sucesso', description: 'Leads exportados para CSV!' });
  };

  const exportToPdf = () => {
    if (leads.length === 0) {
      toast({ title: 'Nenhum lead para exportar', description: 'Gere alguns leads primeiro.' });
      return;
    }

    const doc = new jsPDF();
    (doc as any).autoTable({
      head: [['ID', 'Nome', 'Instagram', 'Website', 'WhatsApp', 'Contato', 'Score']],
      body: leads.map(lead => [
        lead.id.substring(0, 8) + '...',
        lead.name,
        lead.instagram || '-',
        lead.website || '-',
        lead.whatsapp || '-',
        lead.contact,
        lead.score
      ]),
      startY: 20,
      headStyles: { fillColor: [22, 163, 74] }, // Tailwind green-600
      styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 40 }, 5: { cellWidth: 40 } },
    });
    doc.save('leads_historico.pdf');
    toast({ title: 'Sucesso', description: 'Leads exportados para PDF!' });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Histórico de Leads</h1>
        <Card className="w-full mx-auto">
          <CardHeader>
            <CardTitle>Leads Gerados Anteriormente</CardTitle>
            <CardDescription>Consulte e exporte seu histórico de leads.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end gap-2 mb-4">
              <Button onClick={exportToCsv} disabled={leads.length === 0}>
                <Download className="w-4 h-4 mr-2" /> Exportar CSV
              </Button>
              <Button onClick={exportToPdf} disabled={leads.length === 0}>
                <FileText className="w-4 h-4 mr-2" /> Exportar PDF
              </Button>
            </div>
            {isLoading ? (
              <p>Carregando histórico...</p>
            ) : leads.length === 0 ? (
              <p>Nenhum lead encontrado no seu histórico. Comece a gerar leads na página de Busca!</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Instagram</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>WhatsApp</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.id.substring(0, 8)}...</TableCell>
                        <TableCell>{lead.name}</TableCell>
                        <TableCell>{lead.instagram || '-'}</TableCell>
                        <TableCell>{lead.website || '-'}</TableCell>
                        <TableCell>{lead.whatsapp || '-'}</TableCell>
                        <TableCell>{lead.contact}</TableCell>
                        <TableCell>{lead.score}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};