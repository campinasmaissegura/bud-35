import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl, cn } from '../utils';
import { base44 } from '../services/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Users as UsersIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { 
  ArrowLeft, 
  Edit, 
  FileDown, 
  User, 
  MapPin, 
  AlertTriangle,
  FileText,
  Calendar,
  Shield,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Skeleton } from "./ui/skeleton";

// Replaces moment.js
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrentDateTime = () => {
    return new Date().toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

export default function ViewPerson() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const personId = searchParams.get('id');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
    
    // Log view action
    if (personId) {
      logView(userData);
    }
  };

  const logView = async (userData: any) => {
    await base44.entities.AuditLog.create({
      action: 'view',
      entity_type: 'Person',
      entity_id: personId!,
      user_email: userData?.email,
      user_name: userData?.full_name,
      details: `Visualizou perfil ${personId}`
    });
  };

  const { data: person, isLoading } = useQuery({
    queryKey: ['person', personId],
    queryFn: () => base44.entities.Person.filter({ id: personId! }),
    select: (data) => data[0],
    enabled: !!personId,
  });

  const statusConfig = {
    procurado: { label: 'PROCURADO', className: 'bg-red-500 text-white', borderClass: 'border-red-500' },
    preso: { label: 'PRESO', className: 'bg-amber-500 text-white', borderClass: 'border-amber-500' },
    em_liberdade: { label: 'EM LIBERDADE', className: 'bg-blue-500 text-white', borderClass: 'border-blue-500' },
    morto: { label: 'MORTO', className: 'bg-slate-600 text-white', borderClass: 'border-slate-600' },
  };

  const dangerConfig = {
    baixa: { label: 'Baixa', className: 'bg-green-100 text-green-700' },
    media: { label: 'Média', className: 'bg-amber-100 text-amber-700' },
    alta: { label: 'Alta', className: 'bg-red-100 text-red-700' },
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Registro não encontrado</h2>
          <p className="text-slate-500 mb-6">O registro solicitado não existe ou foi removido.</p>
          <Button onClick={() => navigate(createPageUrl('Dashboard'))}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  const status = statusConfig[person.status] || statusConfig.procurado;
  const danger = person.danger_level ? (dangerConfig[person.danger_level] || dangerConfig.media) : dangerConfig.media;
  const photos = person.photos || [];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleExportPDF = () => {
    const statusColors: any = {
      procurado: '#ef4444',
      preso: '#f59e0b',
      em_liberdade: '#3b82f6',
      morto: '#475569'
    };

    const dangerLabels: any = {
      baixa: 'Baixa',
      media: 'Média',
      alta: 'Alta'
    };

    const formatBirthDate = (birthDate: string) => {
      if (!birthDate) return '-';
      const parts = birthDate.includes('/') ? birthDate.split('/') : birthDate.split('-');
      if (parts.length === 3) {
        let date;
        let formatted;
        if (birthDate.includes('/')) {
          // DD/MM/YYYY
          date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          formatted = birthDate;
        } else {
          // YYYY-MM-DD
          date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
        return age > 0 && age < 150 ? `${formatted} (${age} anos)` : formatted;
      }
      return birthDate;
    };

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ficha - ${person.full_name}</title>
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; background: white; padding: 20px; position: relative; }
          .watermark {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px; font-weight: bold; color: rgba(30, 58, 95, 0.08);
            white-space: nowrap; z-index: 0; pointer-events: none;
          }
          .content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 3px solid #1e3a5f; }
          .header h1 { color: #1e3a5f; font-size: 24px; margin-bottom: 5px; }
          .header p { color: #64748b; font-size: 12px; }
          .status-banner { 
            text-align: center; padding: 15px; margin-bottom: 20px; border-radius: 8px;
            color: white; font-size: 24px; font-weight: bold; letter-spacing: 2px;
            background-color: ${statusColors[person.status] || statusColors.procurado};
          }
          .main-grid { display: flex; gap: 20px; margin-bottom: 20px; }
          .photo-section { width: 200px; flex-shrink: 0; }
          .photo-section img { width: 100%; border-radius: 8px; border: 2px solid #e2e8f0; }
          .photo-placeholder { width: 100%; aspect-ratio: 1; background: #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
          .info-section { flex: 1; }
          .person-name { font-size: 22px; font-weight: bold; color: #1e293b; margin-bottom: 5px; }
          .person-cad { font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #64748b; display: inline-block; margin-bottom: 8px; }
          .person-nickname { color: #64748b; margin-bottom: 10px; }
          .badges { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
          .badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; }
          .badge-danger-baixa { background: #dcfce7; color: #166534; }
          .badge-danger-media { background: #fef3c7; color: #92400e; }
          .badge-danger-alta { background: #fee2e2; color: #991b1b; }
          .badge-faccionado { background: #dc2626; color: white; }
          .section { background: #f8fafc; border-radius: 8px; padding: 15px; margin-bottom: 15px; border: 1px solid #e2e8f0; }
          .section-title { font-size: 14px; font-weight: bold; color: #1e3a5f; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
          .section-criminal { background: #fef2f2; border-color: #fecaca; }
          .section-criminal .section-title { color: #dc2626; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .info-item label { font-size: 10px; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px; }
          .info-item span { font-size: 13px; color: #1e293b; font-weight: 500; }
          .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="watermark">INFOCRIM / BUD 35</div>
        <div class="content">
          <div class="header">
            <h1>🛡️ BUD 35 - FICHA CADASTRAL</h1>
            <p>Documento gerado em ${formatCurrentDateTime()}</p>
          </div>

          <div class="status-banner">${status.label}</div>

          <div class="main-grid">
            <div class="photo-section">
              ${photos[0] ? `<img src="${photos[0]}" alt="Foto" />` : '<div class="photo-placeholder">Sem foto</div>'}
            </div>
            <div class="info-section">
              ${person.cad ? `<span class="person-cad">${person.cad}</span>` : ''}
              <div class="person-name">${person.full_name}</div>
              ${person.nickname ? `<div class="person-nickname">Vulgo: "${person.nickname}"</div>` : ''}
              <div class="badges">
                <span class="badge badge-danger-${person.danger_level || 'media'}">Periculosidade: ${dangerLabels[person.danger_level || 'media']}</span>
                ${person.faccionado ? '<span class="badge badge-faccionado">FACCIONADO</span>' : ''}
              </div>
            </div>
          </div>

          ${person.criminal_articles ? `
            <div class="section section-criminal">
              <div class="section-title">⚠️ ARTIGOS CRIMINAIS</div>
              <p style="color: #991b1b; font-weight: 500;">${person.criminal_articles}</p>
            </div>
          ` : ''}

          <div class="section">
            <div class="section-title">👤 DADOS PESSOAIS</div>
            <div class="info-grid">
              ${person.mother_name ? `<div class="info-item"><label>Nome da Mãe</label><span>${person.mother_name}</span></div>` : ''}
              ${person.father_name ? `<div class="info-item"><label>Nome do Pai</label><span>${person.father_name}</span></div>` : ''}
              ${person.birth_date ? `<div class="info-item"><label>Data de Nascimento</label><span>${formatBirthDate(person.birth_date)}</span></div>` : ''}
              ${person.sex ? `<div class="info-item"><label>Sexo</label><span>${person.sex === 'masculino' ? 'Masculino' : 'Feminino'}</span></div>` : ''}
              ${person.skin_color ? `<div class="info-item"><label>Cor de Pele</label><span>${person.skin_color.charAt(0).toUpperCase() + person.skin_color.slice(1)}</span></div>` : ''}
              ${person.height ? `<div class="info-item"><label>Altura</label><span>${person.height} m</span></div>` : ''}
              ${person.hair ? `<div class="info-item"><label>Cabelo</label><span>${person.hair.charAt(0).toUpperCase() + person.hair.slice(1)}</span></div>` : ''}
              ${person.rg ? `<div class="info-item"><label>RG</label><span>${person.rg}</span></div>` : ''}
              ${person.cpf ? `<div class="info-item"><label>CPF</label><span>${person.cpf}</span></div>` : ''}
              ${person.registration_number ? `<div class="info-item"><label>Matrícula</label><span>${person.registration_number}</span></div>` : ''}
              ${person.natural_city || person.natural_state ? `<div class="info-item"><label>Naturalidade</label><span>${person.natural_city || ''}${person.natural_city && person.natural_state ? ' - ' : ''}${person.natural_state || ''}</span></div>` : ''}
            </div>
          </div>

          ${person.street || person.city || person.state ? `
            <div class="section">
              <div class="section-title">📍 ENDEREÇO</div>
              <p style="color: #1e293b;">
                ${[
                  person.street && `${person.street}${person.number ? `, ${person.number}` : ''}`,
                  person.neighborhood,
                  person.city && person.state ? `${person.city} - ${person.state}` : (person.city || person.state),
                  person.zip_code && `CEP: ${person.zip_code}`
                ].filter(Boolean).join(', ')}
              </p>
            </div>
          ` : ''}

          ${person.last_known_location || person.observations ? `
            <div class="section">
              <div class="section-title">📋 INFORMAÇÕES COMPLEMENTARES</div>
              ${person.last_known_location ? `<p style="margin-bottom: 10px;"><strong>Última Localização:</strong> ${person.last_known_location}</p>` : ''}
              ${person.observations ? `<p><strong>Observações:</strong> ${person.observations}</p>` : ''}
            </div>
          ` : ''}

          <div class="footer">
            <p>Documento gerado pelo sistema BUD 35 - INFOCRIM</p>
            <p>Criado em: ${formatDate(person.createdAt)}${person.updatedAt ? ` • Atualizado em: ${formatDate(person.updatedAt)}` : ''}</p>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">Ficha Completa</h1>
                <p className="text-slate-500 text-sm">BUD 35</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link to={createPageUrl(`EditPerson?id=${person.id}`)}>
              <Button variant="outline" className="gap-2">
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleExportPDF}
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar PDF</span>
            </Button>
          </div>
        </div>

        {/* Status Banner */}
        <div className={cn(
          "p-4 rounded-xl mb-6 flex items-center justify-center",
          status.className
        )}>
          <span className="text-2xl md:text-3xl font-black tracking-wider">
            {status.label}
          </span>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Photos */}
          <Card className={cn("border-0 shadow-lg overflow-hidden md:col-span-1", status.borderClass, "border-t-4")}>
            <CardContent className="p-4">
              {photos.length > 0 ? (
                <div className="relative">
                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-200">
                    <img 
                      src={photos[currentPhotoIndex]} 
                      alt={person.full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={prevPhoto}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextPhoto}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="flex justify-center gap-1 mt-3">
                        {photos.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPhotoIndex(index)}
                            className={cn(
                              "w-2 h-2 rounded-full transition-colors",
                              index === currentPhotoIndex ? "bg-blue-500" : "bg-slate-300"
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="aspect-square rounded-lg bg-slate-200 flex items-center justify-center">
                  <User className="w-16 h-16 text-slate-400" />
                </div>
              )}

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="grid grid-cols-6 gap-2 mt-3">
                  {photos.map((photo: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={cn(
                        "aspect-square rounded overflow-hidden border-2",
                        index === currentPhotoIndex ? "border-blue-500" : "border-transparent"
                      )}
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Name and Nickname */}
            <Card className={cn(
              "border-0 shadow-lg",
              person.faccionado && "ring-2 ring-red-500 bg-red-50"
            )}>
              <CardContent className="p-6">
                {person.cad && (
                  <p className="text-sm font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded inline-block mb-2">
                    {person.cad}
                  </p>
                )}
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">
                  {person.full_name}
                </h2>
                {person.nickname && (
                  <p className="text-lg text-slate-500">
                    Vulgo: <span className="font-semibold text-slate-700">"{person.nickname}"</span>
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className={cn("px-3 py-1 rounded-full text-sm font-semibold", danger.className)}>
                    Periculosidade: {danger.label}
                  </span>
                  {person.faccionado && (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-600 text-white">
                      FACCIONADO
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Criminal Articles */}
            {person.criminal_articles && (
              <Card className="border-0 shadow-lg border-l-4 border-l-red-500 bg-red-50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    Artigos Criminais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-800 font-medium whitespace-pre-wrap">
                    {person.criminal_articles}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Personal Data */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2 text-slate-700">
                  <User className="w-5 h-5" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem label="Nome da Mãe" value={person.mother_name} />
                  <InfoItem label="Nome do Pai" value={person.father_name} />
                  <InfoItem 
                    label="Data de Nascimento" 
                    value={person.birth_date ? (() => {
                      const parts = person.birth_date.includes('/') 
                        ? person.birth_date.split('/') 
                        : person.birth_date.split('-');
                      let birthDate;
                      let formattedDate;
                      if (parts.length === 3) {
                        if (person.birth_date.includes('/')) {
                          birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                          formattedDate = person.birth_date;
                        } else {
                          birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                          formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
                        }
                        const today = new Date();
                        let age = today.getFullYear() - birthDate.getFullYear();
                        const m = today.getMonth() - birthDate.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                          age--;
                        }
                        return age > 0 && age < 150 ? `${formattedDate} (${age} anos)` : formattedDate;
                      }
                      return person.birth_date;
                    })() : null} 
                  />
                  <InfoItem label="Sexo" value={person.sex === 'masculino' ? 'Masculino' : person.sex === 'feminino' ? 'Feminino' : null} />
                  <InfoItem label="Cor de Pele" value={
                    person.skin_color === 'branca' ? 'Branca' :
                    person.skin_color === 'parda' ? 'Parda' :
                    person.skin_color === 'negra' ? 'Negra' :
                    person.skin_color === 'amarela' ? 'Amarela' :
                    person.skin_color === 'indigena' ? 'Indígena' : null
                  } />
                  <InfoItem label="Altura" value={person.height ? `${person.height} m` : null} />
                  <InfoItem label="Cabelo" value={
                    person.hair === 'preto' ? 'Preto' :
                    person.hair === 'castanho' ? 'Castanho' :
                    person.hair === 'loiro' ? 'Loiro' :
                    person.hair === 'ruivo' ? 'Ruivo' :
                    person.hair === 'grisalho' ? 'Grisalho' :
                    person.hair === 'branco' ? 'Branco' :
                    person.hair === 'careca' ? 'Careca' : null
                  } />
                  <InfoItem label="RG" value={person.rg} />
                  <InfoItem label="CPF" value={person.cpf} />
                  <InfoItem label="Matrícula" value={person.registration_number} />
                  <InfoItem 
                    label="Naturalidade" 
                    value={person.natural_city || person.natural_state ? 
                      `${person.natural_city || ''}${person.natural_city && person.natural_state ? ' - ' : ''}${person.natural_state || ''}` 
                      : null
                    } 
                  />
                  </div>
                  </CardContent>
                  </Card>

            {/* Address */}
            {(person.street || person.city || person.state) && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b bg-slate-50">
                  <CardTitle className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-5 h-5" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-700">
                    {[
                      person.street && `${person.street}${person.number ? `, ${person.number}` : ''}`,
                      person.neighborhood,
                      person.city && person.state ? `${person.city} - ${person.state}` : (person.city || person.state),
                      person.zip_code && `CEP: ${person.zip_code}`
                    ].filter(Boolean).join(', ')}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2 text-slate-700">
                  <FileText className="w-5 h-5" />
                  Informações Complementares
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {person.last_known_location && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Última Localização Conhecida</p>
                    <p className="text-slate-700">{person.last_known_location}</p>
                  </div>
                )}
                {person.observations && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Observações</p>
                    <p className="text-slate-700 whitespace-pre-wrap">{person.observations}</p>
                  </div>
                )}

                {/* Documents */}
                {person.documents && person.documents.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Documentos Anexados</p>
                    <div className="space-y-2">
                      {person.documents.map((doc: string, index: number) => (
                        <a
                          key={index}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-blue-600 hover:underline flex-1">
                            Documento {index + 1}
                          </span>
                          <ExternalLink className="w-4 h-4 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comparsas */}
        {person.associates && person.associates.length > 0 && (
          <AssociatesDisplay associates={person.associates} />
        )}

        {/* Footer */}
        <div className="mt-8 p-4 bg-slate-100 rounded-lg text-sm text-slate-500 text-center">
          <p>
            <Calendar className="w-4 h-4 inline mr-1" />
            Criado em: {formatDate(person.createdAt)}
            {person.updatedAt && (
              <> • Atualizado em: {formatDate(person.updatedAt)}</>
            )}
          </p>
          {person.last_edited_by_cad && (
            <p className="mt-1">
              Última edição: <span className="font-medium font-mono">{person.last_edited_by_cad}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string, value: any }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-medium text-slate-700">{value}</p>
    </div>
  );
}

function AssociatesDisplay({ associates }: { associates: string[] }) {
  const [associateDetails, setAssociateDetails] = React.useState<any[]>([]);

  React.useEffect(() => {
    loadAssociates();
  }, [associates]);

  const loadAssociates = async () => {
    const details = [];
    for (const cad of associates) {
      const persons = await base44.entities.Person.filter({ cad });
      if (persons.length > 0) {
        details.push(persons[0]);
      }
    }
    setAssociateDetails(details);
  };

  if (associateDetails.length === 0) return null;

  return (
    <Card className="border-0 shadow-lg mt-6">
      <CardHeader className="border-b bg-purple-50">
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <UsersIcon className="w-5 h-5" />
          Comparsas Vinculados ({associateDetails.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {associateDetails.map((person) => (
            <Link
              key={person.id}
              to={createPageUrl(`ViewPerson?id=${person.id}`)}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                {person.photos?.[0] ? (
                  <img src={person.photos[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-300">
                    <User className="w-6 h-6 text-slate-500" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">{person.full_name}</p>
                <p className="text-xs text-slate-500 font-mono">{person.cad}</p>
                {person.nickname && (
                  <p className="text-xs text-slate-500 truncate">Vulgo: "{person.nickname}"</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}