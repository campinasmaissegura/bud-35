import React, { useState } from 'react';
import { base44 } from '../../services/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  Camera, 
  User, 
  MapPin, 
  FileText, 
  AlertTriangle,
  Upload,
  X,
  Loader2,
  Plus,
  Save,
  Globe
} from 'lucide-react';
import { cn } from "../../utils";
import AssociatesSection from './AssociatesSection';
import { Person } from '../../types';

interface PersonFormProps {
  initialData?: Person;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export default function PersonForm({ initialData, onSubmit, isLoading }: PersonFormProps) {
  const [formData, setFormData] = useState<any>(initialData || {
    full_name: '',
    nickname: '',
    mother_name: '',
    father_name: '',
    birth_date: '',
    sex: '',
    skin_color: '',
    height: '',
    hair: '',
    natural_city: '',
    natural_state: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    rg: '',
    cpf: '',
    registration_number: '',
    criminal_articles: '',
    status: 'procurado',
    danger_level: 'media',
    faccionado: false,
    last_known_location: '',
    observations: '',
    photos: [],
    documents: [],
    associates: [],
  });

  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    
    const remainingSlots = 6 - (formData.photos?.length || 0);
    const filesToUpload = files.slice(0, remainingSlots);
    
    setUploadingPhotos(true);
    
    const newPhotos = [...(formData.photos || [])];
    
    for (const file of filesToUpload) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newPhotos.push(file_url);
    }
    
    setFormData(prev => ({ ...prev, photos: newPhotos }));
    setUploadingPhotos(false);
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    
    setUploadingDocs(true);
    
    const newDocs = [...(formData.documents || [])];
    
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newDocs.push(file_url);
    }
    
    setFormData(prev => ({ ...prev, documents: newDocs }));
    setUploadingDocs(false);
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const statusOptions = [
    { value: 'procurado', label: 'Procurado', color: 'bg-red-500' },
    { value: 'preso', label: 'Preso', color: 'bg-amber-500' },
    { value: 'em_liberdade', label: 'Em Liberdade', color: 'bg-blue-500' },
    { value: 'morto', label: 'Morto', color: 'bg-slate-600' },
  ];

  const dangerOptions = [
    { value: 'baixa', label: 'Baixa' },
    { value: 'media', label: 'Média' },
    { value: 'alta', label: 'Alta' },
  ];

  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 
    'SP', 'SE', 'TO'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Fotos */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700">
          <CardTitle className="flex items-center gap-2 text-white">
            <Camera className="w-5 h-5" />
            Fotos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {(formData.photos || []).map((photo: string, index: number) => (
              <div key={index} className="relative aspect-square group">
                <img 
                  src={photo} 
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {(formData.photos?.length || 0) < 6 && (
              <label className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhotos}
                />
                {uploadingPhotos ? (
                  <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-8 h-8 text-slate-400" />
                    <span className="text-xs text-slate-500 mt-1">Adicionar</span>
                  </>
                )}
              </label>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Máximo de 6 fotos. Formatos aceitos: JPG, PNG.
          </p>
        </CardContent>
      </Card>

      {/* Dados Pessoais */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700">
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="w-5 h-5" />
            Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="full_name" className="text-slate-700">Nome Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Nome completo do indivíduo"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="nickname" className="text-slate-700">Vulgo</Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) => handleChange('nickname', e.target.value)}
                placeholder="Apelido ou vulgo"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="birth_date" className="text-slate-700">Data de Nascimento</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="birth_date"
                  type="text"
                  value={formData.birth_date}
                  onChange={(e) => handleChange('birth_date', e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className="flex-1"
                />
                {formData.birth_date && (
                  <div className="flex items-center px-3 bg-blue-50 rounded-md border border-blue-200">
                    <span className="text-sm font-semibold text-blue-700">
                      {(() => {
                        const parts = formData.birth_date.includes('/') 
                          ? formData.birth_date.split('/') 
                          : formData.birth_date.split('-');
                        let birthDate;
                        if (parts.length === 3) {
                          if (formData.birth_date.includes('/')) {
                            birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                          } else {
                            birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                          }
                          const today = new Date();
                          let age = today.getFullYear() - birthDate.getFullYear();
                          const m = today.getMonth() - birthDate.getMonth();
                          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                          }
                          return age > 0 && age < 150 ? `${age} anos` : '--';
                        }
                        return '--';
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="mother_name" className="text-slate-700">Nome da Mãe</Label>
              <Input
                id="mother_name"
                value={formData.mother_name}
                onChange={(e) => handleChange('mother_name', e.target.value)}
                placeholder="Nome da mãe"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="father_name" className="text-slate-700">Nome do Pai</Label>
              <Input
                id="father_name"
                value={formData.father_name}
                onChange={(e) => handleChange('father_name', e.target.value)}
                placeholder="Nome do pai"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="rg" className="text-slate-700">RG</Label>
              <Input
                id="rg"
                value={formData.rg}
                onChange={(e) => handleChange('rg', e.target.value)}
                placeholder="00.000.000-0"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cpf" className="text-slate-700">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="registration_number" className="text-slate-700">Matrícula (Interno)</Label>
              <Input
                id="registration_number"
                value={formData.registration_number}
                onChange={(e) => handleChange('registration_number', e.target.value)}
                placeholder="Número de matrícula"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-slate-700">Sexo</Label>
              <Select
                value={formData.sex}
                onValueChange={(value: string) => handleChange('sex', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-700">Cor de Pele</Label>
              <Select
                value={formData.skin_color}
                onValueChange={(value: string) => handleChange('skin_color', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="branca">Branca</SelectItem>
                  <SelectItem value="parda">Parda</SelectItem>
                  <SelectItem value="negra">Negra</SelectItem>
                  <SelectItem value="amarela">Amarela</SelectItem>
                  <SelectItem value="indigena">Indígena</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="height" className="text-slate-700">Altura</Label>
              <Input
                id="height"
                value={formData.height}
                onChange={(e) => handleChange('height', e.target.value)}
                placeholder="Ex: 1.75"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-slate-700">Cabelo</Label>
              <Select
                value={formData.hair}
                onValueChange={(value: string) => handleChange('hair', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preto">Preto</SelectItem>
                  <SelectItem value="castanho">Castanho</SelectItem>
                  <SelectItem value="loiro">Loiro</SelectItem>
                  <SelectItem value="ruivo">Ruivo</SelectItem>
                  <SelectItem value="grisalho">Grisalho</SelectItem>
                  <SelectItem value="branco">Branco</SelectItem>
                  <SelectItem value="careca">Careca</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Naturalidade */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700">
          <CardTitle className="flex items-center gap-2 text-white">
            <Globe className="w-5 h-5" />
            Naturalidade
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="natural_city" className="text-slate-700">Cidade</Label>
              <Input
                id="natural_city"
                value={formData.natural_city}
                onChange={(e) => handleChange('natural_city', e.target.value)}
                placeholder="Cidade de nascimento"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="natural_state" className="text-slate-700">UF</Label>
              <Select
                value={formData.natural_state}
                onValueChange={(value: string) => handleChange('natural_state', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {states.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700">
          <CardTitle className="flex items-center gap-2 text-white">
            <MapPin className="w-5 h-5" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <Label htmlFor="street" className="text-slate-700">Rua</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleChange('street', e.target.value)}
                placeholder="Nome da rua"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="number" className="text-slate-700">Número</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => handleChange('number', e.target.value)}
                placeholder="Nº"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="neighborhood" className="text-slate-700">Bairro</Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood}
                onChange={(e) => handleChange('neighborhood', e.target.value)}
                placeholder="Nome do bairro"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="city" className="text-slate-700">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Cidade"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="state" className="text-slate-700">Estado</Label>
              <Select
                value={formData.state}
                onValueChange={(value: string) => handleChange('state', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {states.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="zip_code" className="text-slate-700">CEP</Label>
              <Input
                id="zip_code"
                value={formData.zip_code}
                onChange={(e) => handleChange('zip_code', e.target.value)}
                placeholder="00000-000"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Artigos Criminais */}
      <Card className="border-0 shadow-lg overflow-hidden border-l-4 border-l-red-500">
        <CardHeader className="bg-gradient-to-r from-red-600 to-red-700">
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="w-5 h-5" />
            Artigos Criminais
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Textarea
            value={formData.criminal_articles}
            onChange={(e) => handleChange('criminal_articles', e.target.value)}
            placeholder="Ex: Art. 121 - Homicídio, Art. 157 - Roubo..."
            className="min-h-[120px] border-red-200 focus:border-red-400"
          />
        </CardContent>
      </Card>

      {/* Situação Atual */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700">
          <CardTitle className="text-white">Situação Atual</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statusOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('status', option.value)}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all duration-200 text-center",
                  formData.status === option.value
                    ? `${option.color} text-white border-transparent shadow-lg scale-105`
                    : "bg-white border-slate-200 hover:border-slate-300"
                )}
              >
                <span className="font-semibold">{option.label}</span>
              </button>
            ))}
          </div>

          {/* Faccionado */}
          <div className="mt-6 pt-6 border-t">
            <Label className="text-slate-700 mb-3 block">Faccionado</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleChange('faccionado', true)}
                className={cn(
                  "flex-1 p-4 rounded-lg border-2 transition-all duration-200 text-center",
                  formData.faccionado === true
                    ? "bg-red-500 text-white border-transparent shadow-lg scale-105"
                    : "bg-white border-slate-200 hover:border-slate-300"
                )}
              >
                <span className="font-semibold">SIM</span>
              </button>
              <button
                type="button"
                onClick={() => handleChange('faccionado', false)}
                className={cn(
                  "flex-1 p-4 rounded-lg border-2 transition-all duration-200 text-center",
                  formData.faccionado === false
                    ? "bg-green-500 text-white border-transparent shadow-lg scale-105"
                    : "bg-white border-slate-200 hover:border-slate-300"
                )}
              >
                <span className="font-semibold">NÃO</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Complementares */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700">
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="w-5 h-5" />
            Informações Complementares
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-700">Periculosidade</Label>
              <Select
                value={formData.danger_level}
                onValueChange={(value: string) => handleChange('danger_level', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dangerOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="last_known_location" className="text-slate-700">Última Localização Conhecida</Label>
              <Input
                id="last_known_location"
                value={formData.last_known_location}
                onChange={(e) => handleChange('last_known_location', e.target.value)}
                placeholder="Local onde foi visto pela última vez"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observations" className="text-slate-700">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => handleChange('observations', e.target.value)}
              placeholder="Informações adicionais relevantes..."
              className="mt-1 min-h-[100px]"
            />
          </div>

          {/* Documentos */}
          <div>
            <Label className="text-slate-700">Documentos Anexados</Label>
            <div className="mt-2 space-y-2">
              {(formData.documents || []).map((doc: string, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <a 
                    href={doc} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex-1 truncate"
                  >
                    Documento {index + 1}
                  </a>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <label className="flex items-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleDocUpload}
                  className="hidden"
                  disabled={uploadingDocs}
                />
                {uploadingDocs ? (
                  <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-slate-400" />
                )}
                <span className="text-sm text-slate-600">
                  {uploadingDocs ? 'Enviando...' : 'Anexar documentos (PDF, JPG, PNG)'}
                </span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparsas */}
      <AssociatesSection 
        associates={formData.associates || []} 
        onUpdate={(newAssociates) => handleChange('associates', newAssociates)}
      />

      {/* Submit Button */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-600 to-green-700 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white text-center sm:text-left">
              <p className="font-semibold text-lg">Pronto para salvar?</p>
              <p className="text-green-100 text-sm">Verifique os dados antes de confirmar</p>
            </div>
            <Button
              type="submit"
              disabled={isLoading || uploadingPhotos || uploadingDocs}
              size="lg"
              className="w-full sm:w-auto px-10 py-6 text-lg bg-white text-green-700 hover:bg-green-50 shadow-xl font-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6 mr-2" />
                  SALVAR REGISTRO
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}