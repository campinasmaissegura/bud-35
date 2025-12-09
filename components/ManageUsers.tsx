import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl, cn } from '../utils';
import { base44 } from '../services/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { 
  Users, 
  Mail,
  Clock,
  MoreVertical,
  Loader2,
  CheckCircle,
  XCircle,
  UserCheck,
  Link2,
  Check,
  Smartphone,
  User as UserIcon,
  Shield
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";
import { User, AuditLog } from '../types';

// Native date formatter
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

export default function ManageUsers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
    if (user.role !== 'admin') {
      navigate(createPageUrl('Dashboard'));
    }
  };

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    enabled: currentUser?.role === 'admin',
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 20),
    enabled: currentUser?.role === 'admin',
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string, data: Partial<User> }) => base44.entities.User.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'officer' | 'user') => {
    await updateUserMutation.mutateAsync({ userId, data: { role: newRole } });
    
    await base44.entities.AuditLog.create({
      action: 'user_update',
      entity_type: 'User',
      entity_id: userId,
      user_email: currentUser?.email,
      user_name: currentUser?.full_name,
      details: `Papel alterado para: ${newRole}`
    });
  };

  const handleEditDisplayName = (user: User) => {
    setEditingUser(user);
    setEditDisplayName(user.display_name || '');
    setIsDialogOpen(true);
  };

  const handleSaveDisplayName = async () => {
    if (!editingUser) return;
    
    await updateUserMutation.mutateAsync({ 
      userId: editingUser.id, 
      data: { display_name: editDisplayName } 
    });
    
    await base44.entities.AuditLog.create({
      action: 'user_update',
      entity_type: 'User',
      entity_id: editingUser.id,
      user_email: currentUser?.email,
      user_name: currentUser?.full_name,
      details: `Nome de exibição alterado para: ${editDisplayName}`
    });
    
    setIsDialogOpen(false);
    setEditingUser(null);
    setEditDisplayName('');
  };

  const handleCopyLink = () => {
    const link = window.location.origin;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateUserCAD = async () => {
    const allUsers = await base44.entities.User.list();
    let maxNumber = 0;
    
    allUsers.forEach(u => {
      if (u.cad) {
        const num = parseInt(u.cad.replace('USR-', ''), 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    return `USR-${String(nextNumber).padStart(5, '0')}`;
  };

  const handleApproveUser = async (userId: string, userName: string) => {
    const cad = await generateUserCAD();
    
    await updateUserMutation.mutateAsync({ 
      userId, 
      data: { 
        approved: true,
        approved_by: currentUser?.email,
        approved_date: new Date().toISOString(),
        cad
      } 
    });
    
    await base44.entities.AuditLog.create({
      action: 'user_update',
      entity_type: 'User',
      entity_id: userId,
      user_email: currentUser?.email,
      user_name: currentUser?.full_name,
      details: `Usuário aprovado: ${userName} - ${cad}`
    });
  };

  const handleRejectUser = async (userId: string, userName: string) => {
      await base44.entities.User.delete(userId);
      queryClient.invalidateQueries({ queryKey: ['users'] });

      await base44.entities.AuditLog.create({
        action: 'user_delete',
        entity_type: 'User',
        entity_id: userId,
        user_email: currentUser?.email,
        user_name: currentUser?.full_name,
        details: `Usuário rejeitado: ${userName}`
      });
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
      if (!window.confirm(`Tem certeza que deseja excluir o usuário ${userName}?`)) return;

      await base44.entities.User.delete(userId);
      queryClient.invalidateQueries({ queryKey: ['users'] });

      await base44.entities.AuditLog.create({
        action: 'user_delete',
        entity_type: 'User',
        entity_id: userId,
        user_email: currentUser?.email,
        user_name: currentUser?.full_name,
        details: `Usuário excluído: ${userName}`
      });
    };

  const isMaster = currentUser?.is_master === true;

  const pendingUsers = users.filter(u => !u.approved && u.role !== 'admin');
  const approvedUsers = users.filter(u => u.approved || u.role === 'admin');

  const actionLabels: Record<string, string> = {
    create: 'Criou cadastro',
    update: 'Atualizou cadastro',
    view: 'Visualizou cadastro',
    delete: 'Excluiu cadastro',
    login: 'Login realizado',
    user_create: 'Criou usuário',
    user_update: 'Atualizou usuário',
    user_delete: 'Excluiu usuário',
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Users className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Gerenciar Usuários</h1>
              <p className="text-slate-500">Administração do sistema BUD 35</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  Copiado!
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Compartilhar Link</span>
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                const link = window.location.origin;
                const text = `📱 Instale o BUD 35 no seu celular:\n\n1. Abra o link: ${link}\n2. No navegador, toque nos 3 pontos (⋮) ou no ícone de compartilhar\n3. Selecione "Adicionar à tela inicial" ou "Instalar app"\n4. Pronto! O app ficará na sua tela inicial`;
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              variant="outline"
              className="gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Instalar no Mobile</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {pendingUsers.length > 0 && (
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-lg border-l-4 border-l-amber-500">
                <CardHeader className="border-b bg-amber-50">
                  <CardTitle className="flex items-center gap-2 text-amber-700">
                    <UserCheck className="w-5 h-5" />
                    Aguardando Aprovação ({pendingUsers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="p-4 flex items-center gap-4 bg-amber-50/50">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                          {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">
                            {user.full_name || 'Sem nome'}
                          </p>
                          <p className="text-sm text-slate-500 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveUser(user.id, user.full_name || user.email)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectUser(user.id, user.full_name || user.email)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-600" />
                  Usuários Aprovados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : approvedUsers.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Nenhum usuário cadastrado</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {approvedUsers.map((user) => (
                      <div key={user.id} className="p-4 flex items-center gap-4 hover:bg-slate-50">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                          {(user.display_name || user.full_name)?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">
                            {user.display_name || user.full_name || 'Sem nome'}
                          </p>
                          {user.cad && (
                            <p className="text-xs font-mono text-slate-500 mb-1">
                              {user.cad}
                            </p>
                          )}
                          <p className="text-sm text-slate-500 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-semibold",
                              user.is_master 
                                ? "bg-purple-100 text-purple-700" 
                                : user.role === 'admin' 
                                ? "bg-amber-100 text-amber-700" 
                                : "bg-blue-100 text-blue-700"
                            )}>
                              {user.is_master ? 'Master' : user.role === 'admin' ? 'Admin' : 'Usuário'}
                            </span>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditDisplayName(user)}
                                >
                                  <UserIcon className="w-4 h-4 mr-2" />
                                  Editar Nome
                                </DropdownMenuItem>
                                {user.id !== currentUser.id && !user.is_master && (
                                  <DropdownMenuItem
                                    onClick={() => handleRoleChange(
                                      user.id, 
                                      user.role === 'admin' ? 'user' : 'admin'
                                    )}
                                  >
                                    <Shield className="w-4 h-4 mr-2" />
                                    {user.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                                  </DropdownMenuItem>
                                )}
                                {user.id !== currentUser.id && !user.is_master && isMaster && (
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteUser(user.id, user.display_name || user.full_name || user.email)}
                                    className="text-red-600"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Excluir Usuário
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-slate-600" />
                  Registro de Atividades
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {auditLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Sem atividades recentes</p>
                  </div>
                ) : (
                  <div className="divide-y max-h-[500px] overflow-y-auto">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                            log.action === 'create' ? 'bg-green-500' :
                            log.action === 'update' ? 'bg-amber-500' :
                            log.action === 'delete' ? 'bg-red-500' :
                            'bg-blue-500'
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-700">
                              <span className="font-medium">{log.user_name || log.user_email}</span>
                              {' '}
                              <span className="text-slate-500">{actionLabels[log.action] || log.action}</span>
                            </p>
                            {log.entity_name && (
                              <p className="text-slate-500 truncate">{log.entity_name}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                              {formatDate(log.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Nome do Usuário</DialogTitle>
              <DialogDescription>
                Defina um nome de exibição para o usuário {editingUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="displayName">Nome de Exibição</Label>
              <Input
                id="displayName"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                placeholder="Digite o nome do usuário"
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveDisplayName}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}