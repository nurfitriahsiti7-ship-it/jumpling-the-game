import React from 'react';
import { X, Download, Smartphone, Sparkles, Zap, Maximize, Wifi } from 'lucide-react';

interface PWAInstallWidgetProps {
  onInstall: () => void;
  onDismiss: () => void;
  isIOS: boolean;
}

export const PWAInstallWidget: React.FC<PWAInstallWidgetProps> = ({
  onInstall,
  onDismiss,
  isIOS,
}) => {
  return (
    <aside
      aria-label="Promosi Instalasi Aplikasi Game PWA"
      className="fixed z-30 pointer-events-auto transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-6
                 bottom-[max(0.75rem,env(safe-area-inset-bottom))]
                 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md
                 box-border select-none"
    >
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/90 shadow-[0_16px_40px_rgba(0,0,0,0.7)] p-4 sm:p-5 text-slate-100">
        {/* Subtle accent top border with animated shimmer */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-500 to-sky-400" />

        {/* Close Button (X) */}
        <button
          onClick={onDismiss}
          aria-label="Tutup ajakan instalasi"
          className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Row: Game Icon & Title */}
        <div className="flex items-start gap-3.5 pr-8">
          {/* Game Icon */}
          <div className="relative shrink-0">
            <img
              src="/pwa-192x192.png"
              alt="JUMPING: THE GAME"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400/60 shadow-lg"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/icon.svg';
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-sky-500 border-2 border-slate-900 flex items-center justify-center text-white shadow">
              {isIOS ? <Smartphone className="w-3 h-3" /> : <Download className="w-3 h-3" />}
            </div>
          </div>

          {/* Title & Tagline */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                Aplikasi Resmi
              </span>
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            </div>
            <h3 className="font-game text-base sm:text-lg text-white tracking-wide truncate mt-0.5">
              JUMPING: THE GAME
            </h3>
            <p className="text-[11px] text-slate-400">
              Jump Higher. Run Further. Beat Your Best!
            </p>
          </div>
        </div>

        {/* Promotional Description */}
        <p className="text-xs text-slate-200 mt-2.5 leading-relaxed">
          Pasang game ini di perangkatmu untuk akses lebih cepat, pengalaman bermain yang praktis, dan tampilan seperti aplikasi.
        </p>

        {/* Feature Highlights / Conversion Boosters */}
        <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-300">
          <div className="flex items-center gap-1 bg-slate-950/50 rounded-lg p-1.5">
            <Zap className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">Akses Cepat</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950/50 rounded-lg p-1.5">
            <Maximize className="w-3 h-3 text-sky-400 shrink-0" />
            <span className="truncate">Layar Penuh</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950/50 rounded-lg p-1.5">
            <Wifi className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">Mode Offline</span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2.5">
          {/* Secondary Button: NANTI SAJA */}
          <button
            onClick={onDismiss}
            className="flex-1 py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition active:scale-95 cursor-pointer text-center"
          >
            NANTI SAJA
          </button>

          {/* Primary Button: INSTALL GAME SEKARANG */}
          <button
            onClick={onInstall}
            className="group relative flex-2 flex items-center justify-center gap-2 py-2.5 px-4 min-h-[44px] rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 bg-[length:200%_auto] hover:bg-right font-game text-xs sm:text-sm text-slate-950 uppercase tracking-wider shadow-[0_4px_16px_rgba(244,63,94,0.4)] hover:shadow-[0_6px_22px_rgba(245,158,11,0.6)] active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5] transition-transform group-hover:scale-110" />
            <span>INSTALL GAME SEKARANG</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export const PWAInstallPrompt = PWAInstallWidget;

