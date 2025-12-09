import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl, cn } from '../utils';
import { base44 } from '../services/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { 
  Target, 
  Plus, 
  Search, 
  Loader2, 
  AlertCircle,
  User,
  FileDown,
  Trash2,
  Eye,
  AlertTriangle,
  Filter,
  X,
  Clock,
  TrendingUp,
  Shield,
  MapPin,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export default function Targets() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [error, setError] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [newTarget, setNewTarget] = useState({
    priority: 'media',
    reason: '',
    observations: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: targets = [], isLoading: loadingTargets } = useQuery({
    queryKey: ['targets'],
    queryFn: () => base44.entities.Target.list(),
  });

  const { data: persons = [] } = useQuery({
    queryKey: ['persons-for-targets'],
    queryFn: () => base44.entities.Person.list(),
  });

  const getPersonByCad = (cad: string) => persons.find(p => p.cad === cad);

  const createTargetMutation = useMutation({
    mutationFn: (data: any) => base44.entities.Target.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
  });

  const deleteTargetMutation = useMutation({
    mutationFn: (id: string) => base44.entities.Target.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      setDeleteConfirm(null);
    },
  });

  const resetForm = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedPerson(null);
    setError('');
    setNewTarget({ priority: 'media', reason: '', observations: '' });
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearching(true);
    setError('');
    setSearchResults([]);
    setSelectedPerson(null);
    
    const allPersons = await base44.entities.Person.list();
    const term = searchTerm.trim().toLowerCase();
    
    const filtered = allPersons.filter(person => {
      const matchCad = person.cad?.toLowerCase().includes(term);
      const matchName = person.full_name?.toLowerCase().includes(term);
      const matchNickname = person.nickname?.toLowerCase().includes(term);
      return matchCad || matchName || matchNickname;
    });
    
    const notTargeted = filtered.filter(p => !targets.find(t => t.person_cad === p.cad));
    
    if (notTargeted.length === 0) {
      setError('Nenhuma pessoa encontrada ou todas já são alvos');
    } else {
      setSearchResults(notTargeted.slice(0, 5));
    }
    
    setSearching(false);
  };

  const handleSelectPerson = (person: any) => {
    setSelectedPerson(person);
    setSearchResults([]);
  };

  const handleAddTarget = () => {
    if (!selectedPerson) return;
    
    createTargetMutation.mutate({
      person_cad: selectedPerson.cad,
      priority: newTarget.priority,
      reason: newTarget.reason,
      observations: newTarget.observations,
      added_by: user?.email,
      added_by_name: user?.full_name || user?.display_name,
    });
  };

  const priorityConfig: any = {
    baixa: { label: 'Baixa', className: 'bg-green-100 text-green-700 border-green-200', bgClass: 'bg-green-500', icon: '🟢' },
    media: { label: 'Média', className: 'bg-amber-100 text-amber-700 border-amber-200', bgClass: 'bg-amber-500', icon: '🟡' },
    alta: { label: 'Alta', className: 'bg-orange-100 text-orange-700 border-orange-200', bgClass: 'bg-orange-500', icon: '🟠' },
    critica: { label: 'Crítica', className: 'bg-red-100 text-red-700 border-red-200', bgClass: 'bg-red-600', icon: '🔴' },
  };

  // Calculate stats
  const stats = {
    total: targets.length,
    critica: targets.filter(t => t.priority === 'critica').length,
    alta: targets.filter(t => t.priority === 'alta').length,
    media: targets.filter(t => t.priority === 'media').length,
    baixa: targets.filter(t => t.priority === 'baixa').length,
  };

  // Filter targets
  const filteredTargets = targets.filter(target => {
    const person = getPersonByCad(target.person_cad);
    if (!person) return false;
    
    const matchPriority = filterPriority === 'all' || target.priority === filterPriority;
    const matchSearch = !searchFilter || 
      person.full_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      person.nickname?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      person.cad?.toLowerCase().includes(searchFilter.toLowerCase());
    
    return matchPriority && matchSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Alvos - INFOCRIM/BUD 35</title>
        <style>
          @media print { body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
          @page { margin: 15mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; position: relative; background: white; }
          .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; color: rgba(30, 58, 95, 0.06); font-weight: bold; white-space: nowrap; z-index: 0; pointer-events: none; }
          .content { position: relative; z-index: 1; }
          .header { text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 3px solid #1e3a5f; }
          .header h1 { color: #1e3a5f; font-size: 26px; margin-bottom: 5px; }
          .header p { color: #666; font-size: 12px; }
          .stats { display: flex; justify-content: center; gap: 20px; margin-bottom: 25px; }
          .stat { text-align: center; padding: 10px 20px; background: #f8fafc; border-radius: 8px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #1e3a5f; }
          .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; }
          .target-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 12px; page-break-inside: avoid; background: white; }
          .target-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
          .target-name { font-size: 16px; font-weight: bold; color: #1e293b; }
          .target-cad { font-family: monospace; color: #64748b; font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
          .target-nickname { color: #64748b; font-size: 13px; }
          .priority { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; display: inline-block; }
          .priority-baixa { background: #dcfce7; color: #166534; }
          .priority-media { background: #fef3c7; color: #92400e; }
          .priority-alta { background: #fed7aa; color: #c2410c; }
          .priority-critica { background: #fee2e2; color: #dc2626; }
          .info-section { margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0; }
          .info-row { margin: 6px 0; font-size: 13px; color: #475569; }
          .info-label { font-weight: 600; color: #1e293b; }
          .meta { font-size: 11px; color: #94a3b8; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #e2e8f0; }
          .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #64748b; padding-top: 15px; border-top: 2px solid #1e3a5f; }
          .footer strong { color: #dc2626; }
        </style>
      </head>
      <body>
        <div class="watermark">INFOCRIM / BUD 35</div>
        <div class="content">
          <div class="header">
            <h1>🎯 LISTA DE ALVOS PRIORITÁRIOS</h1>
            <p>Sistema BUD 35 - INFOCRIM | Gerado em ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          <div class="stats">
            <div class="stat"><div class="stat-value">${stats.total}</div><div class="stat-label">Total</div></div>
            <div class="stat"><div class="stat-value" style="color:#dc2626">${stats.critica}</div><div class="stat-label">Críticos</div></div>
            <div class="stat"><div class="stat-value" style="color:#ea580c">${stats.alta}</div><div class="stat-label">Alta</div></div>
            <div class="stat"><div class="stat-value" style="color:#d97706">${stats.media}</div><div class="stat-label">Média</div></div>
          </div>
          ${targets.map(target => {
            const person = getPersonByCad(target.person_cad);
            if (!person) return '';
            return `
              <div class="target-card" style="border-left: 4px solid ${target.priority === 'critica' ? '#dc2626' : target.priority === 'alta' ? '#ea580c' : target.priority === 'media' ? '#d97706' : '#22c55e'}">
                <div class="target-header">
                  <div>
                    <div class="target-name">${person.full_name}</div>
                    <span class="target-cad">${person.cad}</span>
                    ${person.nickname ? `<div class="target-nickname">Vulgo: "${person.nickname}"</div>` : ''}
                  </div>
                  <span class="priority priority-${target.priority}">${priorityConfig[target.priority]?.icon} ${priorityConfig[target.priority]?.label || target.priority}</span>
                </div>
                <div class="info-section">
                  ${target.reason ? `<div class="info-row"><span class="info-label">Motivo:</span> ${target.reason}</div>` : ''}
                  ${target.observations ? `<div class="info-row"><span class="info-label">Observações:</span> ${target.observations}</div>` : ''}
                  ${person.criminal_articles ? `<div class="info-row"><span class="info-label">Artigos:</span> ${person.criminal_articles}</div>` : ''}
                  ${person.last_known_location ? `<div class="info-row"><span class="info-label">Última Localização:</span> ${person.last_known_location}</div>` : ''}
                </div>
                <div class="meta">Adicionado por ${target.added_by_name || target.added_by} em ${new Date(target.created_date).toLocaleString('pt-BR')}</div>
              </div>
            `;
          }).join('')}
          <div class="footer">
            <p><strong>⚠️ DOCUMENTO CONFIDENCIAL - USO RESTRITO</strong></p>
            <p>INFOCRIM / BUD 35 - Sistema de Inteligência Policial</p>
          </div>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/30">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Alvos Prioritários</h1>
              <p className="text-slate-500">Gerenciamento e monitoramento de alvos</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={targets.length === 0}
              className="gap-2 border-slate-300"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 gap-2 shadow-lg shadow-red-500/30"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar Alvo</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Total</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                </div>
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Target className="w-5 h-5 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-white border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600 uppercase tracking-wide font-medium">Críticos</p>
                  <p className="text-2xl font-bold text-red-600">{stats.critica}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-white border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600 uppercase tracking-wide font-medium">Alta</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.alta}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-white border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-600 uppercase tracking-wide font-medium">Média</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.media}</p>
                </div>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-white border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 uppercase tracking-wide font-medium">Baixa</p>
                  <p className="text-2xl font-bold text-green-600">{stats.baixa}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar alvo por nome, vulgo ou CAD..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="flex h-10 w-full sm:w-44 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                >
                  <option value="all">Todas</option>
                  <option value="critica">🔴 Crítica</option>
                  <option value="alta">🟠 Alta</option>
                  <option value="media">🟡 Média</option>
                  <option value="baixa">🟢 Baixa</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>

              {(searchFilter || filterPriority !== 'all') && (
                <Button 
                  variant="ghost" 
                  onClick={() => { setSearchFilter(''); setFilterPriority('all'); }}
                  className="text-slate-500"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Targets List */}
        {loadingTargets ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-red-500" />
          </div>
        ) : targets.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Nenhum alvo cadastrado
              </h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Adicione alvos prioritários para monitoramento. Busque pessoas já cadastradas no sistema.
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                size="lg"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Primeiro Alvo
              </Button>
            </CardContent>
          </Card>
        ) : filteredTargets.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-slate-500">
                Tente ajustar os filtros de busca.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Critical Targets Section */}
            {filteredTargets.some(t => t.priority === 'critica') && (
              <div>
                <h2 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Prioridade Crítica
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredTargets.filter(t => t.priority === 'critica').map((target) => (
                    <TargetCard 
                      key={target.id} 
                      target={target} 
                      person={getPersonByCad(target.person_cad)}
                      priorityConfig={priorityConfig}
                      onDelete={() => setDeleteConfirm(target)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Targets */}
            {filteredTargets.some(t => t.priority !== 'critica') && (
              <div>
                {filteredTargets.some(t => t.priority === 'critica') && (
                  <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3 mt-6">
                    Outros Alvos
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTargets.filter(t => t.priority !== 'critica').map((target) => (
                    <TargetCard 
                      key={target.id} 
                      target={target} 
                      person={getPersonByCad(target.person_cad)}
                      priorityConfig={priorityConfig}
                      onDelete={() => setDeleteConfirm(target)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Target Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Target className="w-5 h-5 text-red-600" />
                </div>
                Adicionar Novo Alvo
              </DialogTitle>
              <DialogDescription>
                Busque uma pessoa cadastrada para adicionar como alvo prioritário.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Search */}
              <div>
                <Label className="text-slate-700">Buscar pessoa</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Nome, vulgo ou CAD..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={searching} className="px-4">
                    {searching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="border border-blue-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    {searchResults.length} resultado(s) encontrado(s)
                  </div>
                  <div className="divide-y max-h-48 overflow-y-auto">
                    {searchResults.map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => handleSelectPerson(person)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 text-left transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                          {person.photos?.[0] ? (
                            <img src={person.photos[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-300">
                              <User className="w-5 h-5 text-slate-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">{person.full_name}</p>
                          <p className="text-xs text-slate-500">
                            <span className="font-mono bg-slate-100 px-1 rounded">{person.cad}</span>
                            {person.nickname && <span className="ml-2">"{person.nickname}"</span>}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedPerson && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-slate-200 overflow-hidden ring-2 ring-green-400 ring-offset-2">
                      {selectedPerson.photos?.[0] ? (
                        <img src={selectedPerson.photos[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-300">
                          <User className="w-7 h-7 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">{selectedPerson.full_name}</p>
                      <p className="text-sm text-slate-500 font-mono">{selectedPerson.cad}</p>
                      {selectedPerson.nickname && (
                        <p className="text-sm text-slate-500">Vulgo: "{selectedPerson.nickname}"</p>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedPerson(null)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {selectedPerson && (
                <>
                  <div>
                    <Label className="text-slate-700">Prioridade</Label>
                    <div className="relative mt-1">
                      <select
                        value={newTarget.priority}
                        onChange={(e) => setNewTarget(prev => ({ ...prev, priority: e.target.value }))}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                      >
                        <option value="baixa">🟢 Baixa</option>
                        <option value="media">🟡 Média</option>
                        <option value="alta">🟠 Alta</option>
                        <option value="critica">🔴 Crítica</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-700">Motivo da inclusão</Label>
                    <Textarea
                      placeholder="Descreva o motivo da inclusão como alvo..."
                      value={newTarget.reason}
                      onChange={(e) => setNewTarget(prev => ({ ...prev, reason: e.target.value }))}
                      className="mt-1 min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-700">Observações adicionais</Label>
                    <Textarea
                      placeholder="Informações complementares..."
                      value={newTarget.observations}
                      onChange={(e) => setNewTarget(prev => ({ ...prev, observations: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAddTarget}
                disabled={!selectedPerson || createTargetMutation.isPending}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                {createTargetMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Target className="w-4 h-4 mr-2" />
                )}
                Adicionar Alvo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => { if(!open) setDeleteConfirm(null) }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Remover Alvo
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover <strong>{getPersonByCad(deleteConfirm?.person_cad)?.full_name}</strong> da lista de alvos? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteTargetMutation.mutate(deleteConfirm?.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteTargetMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

const TargetCard: React.FC<{ target: any, person: any, priorityConfig: any, onDelete: () => void }> = ({ target, person, priorityConfig, onDelete }) => {
  if (!person) return null;
  
  const priority = priorityConfig[target.priority] || priorityConfig.media;
  const isCritical = target.priority === 'critica';
  
  return (
    <Card className={cn(
      "border-0 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
      isCritical && "ring-2 ring-red-500 bg-gradient-to-br from-red-50 to-white"
    )}>
      <div className={cn("h-1.5 w-full", priority.bgClass)} />
      <CardContent className="p-5">
        <div className="flex gap-4">
          <div className={cn(
            "w-16 h-16 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0 ring-2 ring-offset-2",
            isCritical ? "ring-red-400" : "ring-slate-200"
          )}>
            {person.photos?.[0] ? (
              <img 
                src={person.photos[0]} 
                alt={person.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-300">
                <User className="w-8 h-8 text-slate-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 truncate text-lg">
              {person.full_name}
            </h3>
            <p className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded inline-block">{person.cad}</p>
            {person.nickname && (
              <p className="text-sm text-slate-500 truncate mt-1">
                Vulgo: "{person.nickname}"
              </p>
            )}
            <Badge className={cn("mt-2 border", priority.className)}>
              {priority.icon} {priority.label}
            </Badge>
          </div>
        </div>
        
        {(target.reason || person.criminal_articles) && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            {target.reason && (
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-700">Motivo:</span> {target.reason}
              </p>
            )}
            {person.criminal_articles && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                {person.criminal_articles}
              </p>
            )}
          </div>
        )}

        {person.last_known_location && (
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{person.last_known_location}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-400">
            <Clock className="w-3 h-3 inline mr-1" />
            {new Date(target.created_date).toLocaleDateString('pt-BR')}
          </div>
          <div className="flex gap-1">
            <Link to={createPageUrl(`ViewPerson?id=${person.id}`)}>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:bg-red-50"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}