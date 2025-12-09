import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl, cn } from '../utils';
import { base44 } from '../services/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { 
  Search as SearchIcon, 
  Filter, 
  User, 
  X,
  AlertTriangle,
  Lock,
  Skull,
  Shield,
  Eye,
  ChevronDown
} from 'lucide-react';
import { Skeleton } from "./ui/skeleton";
import { Person } from '../types';

export default function Search() {
  const [filters, setFilters] = useState({
    name: '',
    nickname: '',
    address: '',
    city: '',
    status: 'all',
    faccionado: 'all',
  });

  const [showFilters, setShowFilters] = useState(false);

  const { data: persons = [], isLoading } = useQuery({
    queryKey: ['persons'],
    queryFn: () => base44.entities.Person.list(),
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      nickname: '',
      address: '',
      city: '',
      status: 'all',
      faccionado: 'all',
    });
  };

  const filteredPersons = persons.filter(person => {
    const matchName = !filters.name || 
      person.full_name?.toLowerCase().includes(filters.name.toLowerCase());
    const matchNickname = !filters.nickname || 
      person.nickname?.toLowerCase().includes(filters.nickname.toLowerCase());
    const matchAddress = !filters.address || 
      person.street?.toLowerCase().includes(filters.address.toLowerCase()) ||
      person.neighborhood?.toLowerCase().includes(filters.address.toLowerCase());
    const matchCity = !filters.city || 
      person.city?.toLowerCase().includes(filters.city.toLowerCase());
    const matchStatus = !filters.status || filters.status === 'all' || 
      person.status === filters.status;
    const matchFaccionado = filters.faccionado === 'all' || 
      (filters.faccionado === 'sim' && person.faccionado === true) ||
      (filters.faccionado === 'nao' && person.faccionado !== true);

    return matchName && matchNickname && matchAddress && matchCity && matchStatus && matchFaccionado;
  });

  const statusConfig: any = {
    procurado: { label: 'Procurado', className: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
    preso: { label: 'Preso', className: 'bg-amber-100 text-amber-700 border-amber-200', icon: Lock },
    em_liberdade: { label: 'Em Liberdade', className: 'bg-blue-100 text-blue-700 border-blue-200', icon: Shield },
    morto: { label: 'Morto', className: 'bg-slate-200 text-slate-700 border-slate-300', icon: Skull },
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
     if (key === 'status' || key === 'faccionado') return value !== 'all';
     return value !== '';
  }).length;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <SearchIcon className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Pesquisa Avançada</h1>
            <p className="text-slate-500">Encontre registros no sistema BUD 35</p>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Buscar por nome..."
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 px-4 gap-2"
              >
                <Filter className="w-5 h-5" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-slate-600 text-sm">Vulgo</Label>
                    <Input
                      placeholder="Buscar vulgo..."
                      value={filters.nickname}
                      onChange={(e) => handleFilterChange('nickname', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-600 text-sm">Endereço</Label>
                    <Input
                      placeholder="Rua ou bairro"
                      value={filters.address}
                      onChange={(e) => handleFilterChange('address', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-600 text-sm">Cidade</Label>
                    <Input
                      placeholder="Nome da cidade"
                      value={filters.city}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-600 text-sm">Situação</Label>
                    <div className="relative mt-1">
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                      >
                        <option value="all">Todos</option>
                        <option value="procurado">Procurado</option>
                        <option value="preso">Preso</option>
                        <option value="em_liberdade">Em Liberdade</option>
                        <option value="morto">Morto</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-600 text-sm">Faccionado</Label>
                    <div className="relative mt-1">
                      <select
                        value={filters.faccionado}
                        onChange={(e) => handleFilterChange('faccionado', e.target.value)}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                      >
                        <option value="all">Todos</option>
                        <option value="sim">Sim</option>
                        <option value="nao">Não</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
                
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="mt-4 text-slate-500 hover:text-slate-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpar filtros
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-600">
            {isLoading ? 'Carregando...' : `${filteredPersons.length} registro(s) encontrado(s)`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="w-20 h-20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPersons.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Nenhum registro encontrado
              </h3>
              <p className="text-slate-500">
                Tente ajustar os filtros de pesquisa.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPersons.map((person) => {
              const status = statusConfig[person.status] || statusConfig.procurado;
              const StatusIcon = status.icon;
              
              return (
                <Link 
                  key={person.id} 
                  to={createPageUrl(`ViewPerson?id=${person.id}`)}
                >
                  <Card className={cn(
                    "border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden group",
                    person.faccionado && "ring-2 ring-red-500"
                  )}>
                    <div className={cn(
                      "h-1 w-full",
                      person.status === 'procurado' ? 'bg-red-500' :
                      person.status === 'preso' ? 'bg-amber-500' :
                      person.status === 'em_liberdade' ? 'bg-blue-500' :
                      'bg-slate-500'
                    )} />
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
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
                          <h3 className="font-semibold text-slate-800 truncate">
                              {person.full_name}
                            </h3>
                            {person.cad && (
                              <p className="text-xs font-mono text-slate-500">
                                {person.cad}
                              </p>
                            )}
                            {person.nickname && (
                              <p className="text-sm text-slate-500 truncate">
                                Vulgo: "{person.nickname}"
                              </p>
                            )}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border",
                              status.className
                            )}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                            {person.faccionado && (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">
                                FACCIONADO
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="w-5 h-5 text-blue-500" />
                        </div>
                      </div>
                      {person.criminal_articles && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-red-600 truncate">
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            {person.criminal_articles}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}