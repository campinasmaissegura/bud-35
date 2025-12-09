import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '../services/base44Client';
import { Shield, Loader2, Mail } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      // Simulate Google Login Flow
      await base44.auth.loginGoogle(email);
      navigate('/');
    } catch (err) {
      setError('Erro ao realizar login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-0 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            BUD 35
          </CardTitle>
          <p className="text-slate-500">Sistema Integrado de Inteligência</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Acesse com seu e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
              <p className="text-xs text-slate-400">
                Utilize sua conta Google para acessar o sistema.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                'Entrar no Sistema'
              )}
            </Button>

            <div className="mt-6 text-center text-xs text-slate-400">
              <p>Campinas Mais Segura © 2024</p>
              <p>Acesso restrito a pessoal autorizado.</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}