import React from 'react';
import { RotateCcw, Home, Trophy, Award, Sparkles } from 'lucide-react';
import { Mission } from '../game/types';

interface GameOverModalProps {
  score: number;
  distance: number;
  coins: number;
  highScore: number;
  isNewRecord: boolean;
  completedMission: Mission | null;
  rewardEarned: number;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  distance,
  coins,
  highScore,
  isNewRecord,
  completedMission,
  rewardEarned,
  onPlayAgain,
  onMainMenu,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-30 select-none animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-center relative overflow-hidden">
        {/* Top Glow Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />

        {/* Title / Record Alert */}
        {isNewRecord ? (
          <div className="mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-game text-xs tracking-wider mb-2 animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>NEW PERSONAL BEST!</span>
            </div>
            <h2 className="font-game text-4xl text-amber-300 arcade-glow-gold">
              RECORD BREAKER!
            </h2>
          </div>
        ) : (
          <h2 className="font-game text-3xl sm:text-4xl text-white arcade-text mb-4">
            GAME OVER
          </h2>
        )}

        {/* Score Readout Display */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-4">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
            FINAL SCORE
          </div>
          <div className="font-game text-4xl sm:text-5xl text-white arcade-glow-gold tracking-tight tabular-nums">
            {score}
          </div>
          <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>High Score:</span>
            <span className="font-bold text-slate-200 tabular-nums">{highScore}</span>
          </div>
        </div>

        {/* Stats breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[11px] text-slate-400 font-medium">Distance Traveled</span>
            <span className="font-game text-xl text-sky-400 mt-0.5 tabular-nums">
              {distance} m
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[11px] text-slate-400 font-medium">Coins Collected</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-4 h-4 rounded-full bg-amber-400 border border-amber-600 flex items-center justify-center">
                <span className="text-[8px] text-amber-950 font-black">★</span>
              </div>
              <span className="font-game text-xl text-amber-300 tabular-nums">
                +{coins}
              </span>
            </div>
          </div>
        </div>

        {/* Mission Accomplished Banner if any */}
        {completedMission && (
          <div className="bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/50 rounded-xl p-3 mb-5 flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  MISSION ACCOMPLISHED!
                </div>
                <div className="text-xs font-semibold text-white">
                  {completedMission.title}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-game text-amber-400">+{rewardEarned} coins</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 bg-[length:200%_auto] hover:bg-right font-game text-xl text-slate-950 uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>PLAY AGAIN (SPACE)</span>
          </button>

          <button
            onClick={onMainMenu}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-semibold text-slate-200 text-sm active:scale-95 transition cursor-pointer"
          >
            <Home className="w-4 h-4 text-sky-400" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
