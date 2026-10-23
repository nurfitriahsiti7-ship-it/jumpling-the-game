import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  score: number;
  distance: number;
  coins: number;
  isMuted: boolean;
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  score,
  distance,
  coins,
  isMuted,
  onResume,
  onRestart,
  onMainMenu,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 z-30 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 shadow-2xl text-center">
        {/* Title */}
        <h2 className="font-game text-3xl text-white tracking-wide arcade-text mb-4">
          GAME PAUSED
        </h2>

        {/* Current Run Metrics */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/70 border border-slate-800 rounded-2xl p-3 mb-6">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Score</div>
            <div className="font-game text-lg text-white tabular-nums">{score}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Distance</div>
            <div className="font-game text-lg text-sky-400 tabular-nums">{distance}m</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Coins</div>
            <div className="font-game text-lg text-amber-400 tabular-nums">{coins}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {/* Resume */}
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 font-game text-lg text-slate-950 uppercase tracking-wider shadow-lg active:scale-95 transition cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>Resume (P)</span>
          </button>

          {/* Restart */}
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-semibold text-slate-200 text-sm active:scale-95 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Restart (R)</span>
          </button>

          {/* Main Menu */}
          <button
            onClick={onMainMenu}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-semibold text-slate-200 text-sm active:scale-95 transition cursor-pointer"
          >
            <Home className="w-4 h-4 text-sky-400" />
            <span>Main Menu</span>
          </button>
        </div>

        {/* Bottom Audio Toggle */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-center">
          <button
            onClick={onToggleMute}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
            <span>{isMuted ? 'Audio Muted' : 'Audio Enabled'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
