import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { X, Download, Smartphone, Share } from 'lucide-react';

export default function InstallAppBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed or dismissed
    const dismissed = localStorage.getItem('installBannerDismissed');
    if (dismissed) return;

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    
    if (isStandalone) return;

    // Show banner after a delay
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 3000);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('installBannerDismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 lg:left-auto lg:right-4 lg:w-96 animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-2xl p-4 text-white relative">
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Instale o BUD 35</h3>
            <p className="text-blue-100 text-sm mt-1">
              Acesse rapidamente direto da tela inicial do seu celular
            </p>
            
            {isIOS ? (
              <div className="mt-3 p-3 bg-white/10 rounded-lg text-sm">
                <p className="flex items-center gap-2">
                  <Share className="w-4 h-4" />
                  Toque em <strong>Compartilhar</strong>
                </p>
                <p className="mt-1">
                  Depois selecione <strong>"Adicionar à Tela Inicial"</strong>
                </p>
              </div>
            ) : deferredPrompt ? (
              <Button 
                onClick={handleInstall}
                className="mt-3 bg-white text-blue-600 hover:bg-blue-50 w-full border-0"
              >
                <Download className="w-4 h-4 mr-2" />
                Instalar Agora
              </Button>
            ) : (
              <div className="mt-3 p-3 bg-white/10 rounded-lg text-sm">
                <p className="flex items-center gap-2">
                  <span>⋮</span>
                  Toque no menu do navegador
                </p>
                <p className="mt-1">
                  Selecione <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}