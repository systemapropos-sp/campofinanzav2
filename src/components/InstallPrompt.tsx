/**
 * InstallPrompt.tsx — Banner de instalación PWA
 * Aparece automáticamente la primera vez que se abre la app
 */
import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'cf_install_dismissed';
const INSTALLED_KEY = 'cf_pwa_installed';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Si ya está instalado como PWA (standalone), no mostrar
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check si ya fue instalado antes
    if (localStorage.getItem(INSTALLED_KEY)) return;

    // Check si fue dismissed hace menos de 3 días
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const diff = Date.now() - parseInt(dismissed);
      if (diff < 3 * 24 * 60 * 60 * 1000) return; // 3 días
    }

    // Detectar iOS (Safari no soporta beforeinstallprompt)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    if (ios) {
      // En iOS mostramos instrucciones manuales
      const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
      if (!isInStandaloneMode) {
        setTimeout(() => setShow(true), 2000);
      }
      return;
    }

    // Android/Chrome — escuchar beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Si ya está instalado
    window.addEventListener('appinstalled', () => {
      setShow(false);
      setIsInstalled(true);
      localStorage.setItem(INSTALLED_KEY, '1');
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem(INSTALLED_KEY, '1');
    }
    setDeferredPrompt(null);
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setShow(false);
  };

  if (!show || isInstalled) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-slideUp">
      <div
        className="max-w-sm mx-auto rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0D2818 0%, #1B4332 100%)' }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#C9A84C]/20 flex items-center justify-center flex-shrink-0">
                <img src="/icons/icon-192x192.png" alt="CampoFinanzas" className="w-10 h-10" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">CampoFinanzas</p>
                <p className="text-white/60 text-xs">Sistema de Gestión Financiera</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isIOS ? (
            /* Instrucciones iOS */
            <div className="bg-white/10 rounded-xl p-3 mb-3">
              <p className="text-white text-xs font-medium mb-2 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#C9A84C]" />
                Instalar en iPhone/iPad
              </p>
              <ol className="text-white/70 text-xs space-y-1">
                <li>1. Toca el ícono <span className="text-[#C9A84C] font-medium">Compartir</span> (↑) en Safari</li>
                <li>2. Selecciona <span className="text-[#C9A84C] font-medium">"Agregar a pantalla de inicio"</span></li>
                <li>3. Toca <span className="text-[#C9A84C] font-medium">"Agregar"</span></li>
              </ol>
            </div>
          ) : (
            <p className="text-white/70 text-xs mb-3">
              Instala la app para acceso rápido desde tu pantalla de inicio sin necesidad de abrir el navegador.
            </p>
          )}

          {!isIOS && (
            <button
              onClick={handleInstall}
              className="w-full h-10 bg-[#C9A84C] hover:bg-[#D4B85A] active:bg-[#B89640] text-[#0D2818] rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Instalar App
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
