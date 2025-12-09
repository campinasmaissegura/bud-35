import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl, cn } from '../utils';
import { base44 } from '../services/base44Client';
import { 
  Home, 
  UserPlus, 
  Search, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Shield,
  FileText,
  Target
} from 'lucide-react';
import { Button } from "./ui/button";
import InstallAppBanner from './InstallAppBanner';

interface LayoutProps {
  children: React.ReactNode;
  currentPageName: string;
}

export default function Layout({ children, currentPageName }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [location]);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      
      // Check if user is approved (admins are always approved)
      if (userData.role !== 'admin' && !userData.approved) {
        setUser({ ...userData, pending: true });
      } else {
        setUser(userData);
      }
    } catch (error) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Shield className="w-16 h-16 text-blue-500" />
          <span className="text-white text-xl font-bold">BUD 35</span>
        </div>
      </div>
    );
  }

  // Show pending approval screen
  if (user?.pending) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Aguardando Aprovação</h1>
          <p className="text-slate-600 mb-6">
            Sua conta (<strong>{user.email}</strong>) está pendente de aprovação pelo administrador. 
            Você receberá acesso assim que for aprovado.
          </p>
          <div className="p-4 bg-slate-50 rounded-lg mb-6">
            <p className="text-sm text-slate-500">Solicitação enviada em:</p>
            <p className="font-medium text-slate-800">{new Date().toLocaleDateString()}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair e tentar outra conta
          </Button>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { name: 'Início', icon: Home, page: 'Dashboard' },
    { name: 'Cadastrar Pessoa', icon: UserPlus, page: 'RegisterPerson' },
    { name: 'Pesquisar', icon: Search, page: 'Search' },
    { name: 'Alvos', icon: Target, page: 'Targets' },
    { name: 'Relatórios', icon: FileText, page: 'Reports' },
    ...(isAdmin ? [{ name: 'Usuários', icon: Users, page: 'ManageUsers' }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <style>{`
        :root {
          --primary: #1e3a5f;
          --primary-dark: #152a45;
          --accent: #3b82f6;
          --danger: #dc2626;
          --warning: #f59e0b;
          --success: #22c55e;
          --muted: #64748b;
        }
      `}</style>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1e3a5f] z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-400" />
          <span className="text-white font-bold text-xl">BUD 35</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white hover:bg-white/10"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-[#1e3a5f] z-40 transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-white/10">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-blue-400" />
            <span className="text-white font-bold text-2xl tracking-tight">BUD 35</span>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/10">
          <p className="text-white/60 text-xs uppercase tracking-wider">Logado como</p>
          <p className="text-white font-medium truncate" title={user?.email}>
            {user?.display_name || user?.full_name || user?.email?.split('@')[0]}
          </p>
          {user?.cad && (
            <p className="text-white/50 text-xs font-mono">{user.cad}</p>
          )}
          <span className={cn(
            "inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium",
            isAdmin ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300"
          )}>
            {isAdmin ? 'Administrador' : 'Usuário'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        {children}
      </main>

      {/* Install App Banner */}
      <InstallAppBanner />
    </div>
  );
}