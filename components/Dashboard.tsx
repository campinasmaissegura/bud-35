import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '../services/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { 
  Users, 
  UserPlus, 
  Search, 
  AlertTriangle,
  Lock,
  Skull,
  Shield,
  TrendingUp,
  Activity,
  Target
} from 'lucide-react';
import { Skeleton } from "./ui/skeleton";
import { Person, User } from '../types';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: persons = [], isLoading } = useQuery({
    queryKey: ['persons-stats'],
    queryFn: () => base44.entities.Person.list(),
  });

  const stats = {
    total: persons.length,
    procurado: persons.filter(p => p.status === 'procurado').length,
    preso: persons.filter(p => p.status === 'preso').length,
    morto: persons.filter(p => p.status === 'morto').length,
    em_liberdade: persons.filter(p => p.status === 'em_liberdade').length,
  };

  const isAdmin = user?.role === 'admin';

  const statCards = [
    { 
      title: 'Total de Cadastros', 
      value: stats.total, 
      icon: Users, 
      color: 'bg-blue-500',
      textColor: 'text-blue-500'
    },
    { 
      title: 'Procurados', 
      value: stats.procurado, 
      icon: AlertTriangle, 
      color: 'bg-red-500',
      textColor: 'text-red-500'
    },
    { 
      title: 'Presos', 
      value: stats.preso, 
      icon: Lock, 
      color: 'bg-amber-500',
      textColor: 'text-amber-500'
    },
    { 
      title: 'Mortos', 
      value: stats.morto, 
      icon: Skull, 
      color: 'bg-slate-600',
      textColor: 'text-slate-600'
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Shield className="w-6 h-6 text-blue-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Olá, {user?.full_name?.split(' ')[0] || 'Agente'}
          </h1>
        </div>
        <p className="text-slate-500 ml-12">
          Bem-vindo ao sistema BUD 35. Gerencie seus registros de forma segura.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-0 shadow-lg">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${stat.color} opacity-10`} />
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-16" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-500 text-sm font-medium">{stat.title}</span>
                    <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                      <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                    </div>
                  </div>
                  <p className={`text-4xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg mb-8">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-blue-500" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to={createPageUrl('RegisterPerson')}>
              <Button className="w-full h-auto py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                <div className="flex flex-col items-center gap-2">
                  <UserPlus className="w-8 h-8" />
                  <span className="font-semibold">Novo Cadastro</span>
                </div>
              </Button>
            </Link>
            
            <Link to={createPageUrl('Search')}>
              <Button variant="outline" className="w-full h-auto py-6 border-2 hover:bg-slate-50">
                <div className="flex flex-col items-center gap-2 text-slate-700">
                  <Search className="w-8 h-8" />
                  <span className="font-semibold">Pesquisar</span>
                </div>
              </Button>
            </Link>

            <Link to={createPageUrl('Targets')}>
              <Button variant="outline" className="w-full h-auto py-6 border-2 hover:bg-red-50 border-red-100">
                <div className="flex flex-col items-center gap-2 text-red-700">
                  <Target className="w-8 h-8" />
                  <span className="font-semibold">Alvos</span>
                </div>
              </Button>
            </Link>

            {isAdmin && (
              <Link to={createPageUrl('ManageUsers')}>
                <Button variant="outline" className="w-full h-auto py-6 border-2 border-amber-200 hover:bg-amber-50">
                  <div className="flex flex-col items-center gap-2 text-amber-700">
                    <Users className="w-8 h-8" />
                    <span className="font-semibold">Usuários</span>
                  </div>
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Últimos Cadastros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : persons.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Nenhum cadastro encontrado</p>
            </div>
          ) : (
            <div className="divide-y">
              {persons.slice(0, 5).map((person) => (
                <Link 
                  key={person.id} 
                  to={createPageUrl(`ViewPerson?id=${person.id}`)}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                    {person.photos && person.photos[0] ? (
                      <img 
                        src={person.photos[0]} 
                        alt={person.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-300">
                        <Users className="w-6 h-6 text-slate-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{person.full_name}</p>
                    {person.nickname && (
                      <p className="text-sm text-slate-500 truncate">Vulgo: {person.nickname}</p>
                    )}
                  </div>
                  <StatusBadge status={person.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    procurado: { label: 'Procurado', className: 'bg-red-100 text-red-700 border-red-200' },
    preso: { label: 'Preso', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    em_liberdade: { label: 'Em Liberdade', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    morto: { label: 'Morto', className: 'bg-slate-200 text-slate-700 border-slate-300' },
  };

  const config = statusConfig[status] || statusConfig.procurado;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
      {config.label}
    </span>
  );
}