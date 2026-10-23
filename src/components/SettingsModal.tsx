import React from 'react';
import { X, Volume2, VolumeX, Music, Smartphone, Download, CheckCircle2 } from 'lucide-react';
import { GameSettings } from '../game/types';

interface SettingsModalProps {
  settings: GameSettings;
  isInstalled?: boolean;
  onOpenInstall?: () => void;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isInstalled = false,
  onOpenInstall,
  onUpdateSettings,
  onClose,
}) => {
  const handleChange = (partial: Partial<GameSettings>) => {
    onUpdateSettings({ ...settings, ...partial });
  };

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-40 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="font-game text-2xl text-white">SETTINGS</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-6">
          {/* Mute All Toggle */}
          <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
            <div className="flex items-center gap-3">
              {settings.soundMuted ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-sky-400" />
              )}
              <div>
                <div className="font-semibold text-sm text-white">Mute All Sounds</div>
                <div className="text-xs text-slate-400">Silence game music and sound effects</div>
              </div>
            </div>
            <button
              onClick={() => handleChange({ soundMuted: !settings.soundMuted })}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                settings.soundMuted ? 'bg-rose-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.soundMuted ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Music Volume Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-2 text-slate-300">
                <Music className="w-4 h-4 text-purple-400" /> Music Volume
              </span>
              <span className="text-slate-400 tabular-nums">
                {Math.round(settings.musicVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              disabled={settings.soundMuted}
              onChange={(e) => handleChange({ musicVolume: parseFloat(e.target.value) })}
              className="w-full accent-purple-500 bg-slate-800 rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* SFX Volume Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-2 text-slate-300">
                <Volume2 className="w-4 h-4 text-sky-400" /> Sound Effects (SFX)
              </span>
              <span className="text-slate-400 tabular-nums">
                {Math.round(settings.sfxVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              disabled={settings.soundMuted}
              onChange={(e) => handleChange({ sfxVolume: parseFloat(e.target.value) })}
              className="w-full accent-sky-500 bg-slate-800 rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* Touch Controls Preference */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Smartphone className="w-4 h-4 text-emerald-400" /> Touch Controls (Mobile)
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['both', 'buttons', 'gestures'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => handleChange({ touchControls: mode })}
                  className={`py-2 px-3 rounded-xl border text-center font-medium capitalize cursor-pointer transition ${
                    settings.touchControls === mode
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* PWA App Installation Section */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
              <div>
                <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Aplikasi Game (PWA)</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {isInstalled
                    ? 'Aplikasi terinstal & siap dimainkan secara native'
                    : 'Pasang ke layar utama untuk akses instan & layar penuh'}
                </div>
              </div>

              {isInstalled ? (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Terpasang</span>
                </div>
              ) : onOpenInstall ? (
                <button
                  onClick={onOpenInstall}
                  className="px-3.5 py-2 min-h-[44px] rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:brightness-110 font-game text-xs text-slate-950 uppercase tracking-wider shadow-md active:scale-95 transition cursor-pointer"
                >
                  Install
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
