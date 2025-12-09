import React from 'react';
import { base44 } from '../services/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { 
  FileText, 
  Download, 
  Users, 
  AlertTriangle, 
  Target, 
  Shield 
} from 'lucide-react';

export default function Reports() {
  const { data: persons = [] } = useQuery({
    queryKey: ['persons'],
    queryFn: () => base44.entities.Person.list(),
  });

  const { data: targets = [] } = useQuery({
    queryKey: ['targets'],
    queryFn: () => base44.entities.Target.list(),
  });

  const generatePDF = (type: 'general' | 'wanted' | 'targets') => {
    let title = '';
    let content = '';

    const currentDate = new Date().toLocaleString('pt-BR');

    if (type === 'general') {
      title = 'Relatório Geral de Efetivo';
      content = persons.map(p => `
        <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
          <div style="font-weight: bold;">${p.full_name}</div>
          <div style="font-size: 12px; color: #666;">
            CAD: ${p.cad || 'N/A'} | Status: ${p.status.toUpperCase()} | Vulgo: ${p.nickname || '-'}
          </div>
        </div>
      `).join('');
    } else if (type === 'wanted') {
      title = 'Relatório de Procurados';
      content = persons
        .filter(p => p.status === 'procurado')
        .map(p => `
          <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <div style="font-weight: bold; color: #dc2626;">${p.full_name}</div>
            <div style="font-size: 12px; color: #666;">
              CAD: ${p.cad || 'N/A'} | Artigos: ${p.criminal_articles || 'N/A'}
            </div>
            ${p.last_known_location ? `<div style="font-size: 12px;">Última localização: ${p.last_known_location}</div>` : ''}
          </div>
        `).join('');
    } else if (type === 'targets') {
      title = 'Relatório de Alvos Prioritários';
      content = targets.map(t => {
        const p = persons.find(person => person.cad === t.person_cad);
        return `
          <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <div style="font-weight: bold;">${p?.full_name || 'Desconhecido'}</div>
            <div style="font-size: 12px; color: #666;">
              Prioridade: <span style="font-weight: bold;">${t.priority.toUpperCase()}</span>
            </div>
            <div style="font-size: 12px;">Motivo: ${t.reason || '-'}</div>
          </div>
        `;
      }).join('');
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - BUD 35</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { color: #1e3a5f; margin: 0; font-size: 24px; }
          .meta { font-size: 12px; color: #666; margin-top: 5px; }
          .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <div class="meta">Gerado em ${currentDate} • Sistema INFOCRIM / BUD 35</div>
        </div>
        ${content || '<p style="text-align: center; color: #666;">Nenhum registro encontrado.</p>'}
        <div class="footer">Documento Confidencial - Uso Restrito</div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Relatórios de Inteligência</h1>
            <p className="text-slate-500">Geração de documentos operacionais</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-600" />
                Relatório Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-6">
                Listagem completa de todos os indivíduos cadastrados no sistema, incluindo status atual e informações básicas.
              </p>
              <Button onClick={() => generatePDF('general')} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Gerar PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-t-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                Procurados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-6">
                Relatório focado em indivíduos com mandado de prisão em aberto ou status de procurado.
              </p>
              <Button 
                onClick={() => generatePDF('wanted')} 
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Gerar PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-t-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <Target className="w-5 h-5" />
                Alvos Prioritários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-6">
                Lista detalhada de alvos marcados como prioritários, incluindo nível de periculosidade e motivos.
              </p>
              <Button 
                onClick={() => generatePDF('targets')} 
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Gerar PDF
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6 flex items-start gap-4">
          <Shield className="w-8 h-8 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Nota de Segurança</h3>
            <p className="text-sm text-blue-700">
              Todos os relatórios gerados contém informações sensíveis e são monitorados pelo sistema de auditoria. 
              O compartilhamento não autorizado destes documentos é passível de sanções administrativas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}