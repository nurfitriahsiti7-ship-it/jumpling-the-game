import React from 'react';
import { X, Download, Smartphone, Sparkles } from 'lucide-react';

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
      aria-label="Install Game App"
      className="fixed z-30 pointer-events-auto transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-5
                 bottom-[max(1rem,env(safe-area-inset-bottom))]
                 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-sm
                 box-border select-none"
    >
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-[0_12px_36px_rgba(0,0,0,0.65)] p-4 text-slate-100">
        {/* Subtle accent top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-sky-400 to-rose-500" />

        {/* Close Button */}
        <button
          onClick={onDismiss}
          aria-label="Tutup ajakan instalasi"
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Row */}
        <div className="flex items-start gap-3 pr-6">
          {/* Game Icon */}
          <div className="relative shrink-0">
            <img
              src="/pwa-192x192.png"
              alt="JUMPING: THE GAME"
              className="w-12 h-12 rounded-xl object-cover border border-amber-500/40 shadow-md"
              onError={(e) => {
                // Fallback to vector icon if image fails
                (e.currentTarget as HTMLImageElement).src = '/icon.svg';
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-sky-500 border border-slate-900 flex items-center justify-center text-white shadow">
              {isIOS ? <Smartphone className="w-2.5 h-2.5" /> : <Download className="w-2.5 h-2.5" />}
            </div>
          </div>

          {/* Texts */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-game text-sm text-white tracking-wide truncate">
                Install Game App
              </h3>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-snug line-clamp-2">
              Install game ini di perangkatmu untuk akses lebih cepat dan pengalaman bermain yang lebih praktis.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-800/90 flex items-center justify-end gap-2">
          {/* Secondary Button */}
          <button
            onClick={onDismiss}
            className="px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition active:scale-95 cursor-pointer"
          >
            Nanti Saja
          </button>

          {/* Primary Install Button */}
          <button
            onClick={onInstall}
            className="flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 font-game text-xs text-slate-950 uppercase tracking-wider shadow-md hover:shadow-lg active:scale-95 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Install Sekarang</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
