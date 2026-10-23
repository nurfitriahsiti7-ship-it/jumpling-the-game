import React from 'react';
import { Pause, Zap, Shield, Magnet, ChevronsUp, ArrowUp, ArrowDown } from 'lucide-react';
import { PowerUpActive } from '../game/types';

interface GameHUDProps {
  score: number;
  distance: number;
  coins: number;
  multiplier: number;
  activePowerUps: PowerUpActive[];
  onPause: () => void;
  onJump: () => void;
  onSlide: () => void;
  showTouchControls: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  distance,
  coins,
  multiplier,
  activePowerUps,
  onPause,
  onJump,
  onSlide,
  showTouchControls,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none z-10">
      {/* Top HUD Cluster */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Distance & Coins */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Distance Meter */}
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-sm border border-slate-700/80 px-3.5 py-1.5 rounded-xl shadow-lg">
            <span className="text-sky-400 font-bold text-xs uppercase tracking-wider">RUN</span>
            <span className="font-game text-lg sm:text-xl text-white tracking-wide tabular-nums">
              {distance}
            </span>
            <span className="text-slate-400 text-xs font-semibold">m</span>
          </div>

          {/* Coins Counter */}
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-sm border border-amber-500/40 px-3.5 py-1.5 rounded-xl shadow-lg">
            {/* Gold Star Coin Icon */}
            <div className="w-5 h-5 rounded-full bg-amber-400 border border-amber-600 flex items-center justify-center shadow-sm animate-pulse">
              <span className="text-[10px] text-amber-900 font-black">★</span>
            </div>
            <span className="font-game text-lg sm:text-xl text-amber-300 tracking-wide tabular-nums">
              {coins}
            </span>
          </div>
        </div>

        {/* Center: Big Current Score & 2X Multiplier */}
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-1.5">
            <span className="font-game text-3xl sm:text-4xl text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] arcade-text tabular-nums">
              {score}
            </span>
            {multiplier > 1 && (
              <span className="bg-amber-500 text-slate-950 font-game text-xs sm:text-sm px-2 py-0.5 rounded-lg shadow-md animate-bounce">
                2X
              </span>
            )}
          </div>

          {/* Active Power-up Progress Chips */}
          {activePowerUps.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              {activePowerUps.map(pup => {
                const percent = Math.max(0, Math.min(100, (pup.duration / pup.maxDuration) * 100));
                return (
                  <div
                    key={pup.type}
                    className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700 px-2 py-1 rounded-lg text-xs"
                  >
                    {pup.type === 'MAGNET' && <Magnet className="w-3.5 h-3.5 text-sky-400" />}
                    {pup.type === 'SHIELD' && <Shield className="w-3.5 h-3.5 text-cyan-400" />}
                    {pup.type === 'MULTIPLIER' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                    {pup.type === 'SUPER_JUMP' && <ChevronsUp className="w-3.5 h-3.5 text-rose-400" />}
                    {/* Tiny progress bar */}
                    <div className="w-10 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-400 transition-all duration-100"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Pause Button */}
        <div className="pointer-events-auto">
          <button
            onClick={onPause}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-lg active:scale-95 transition cursor-pointer"
            title="Pause Game (P / Esc)"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Touch Controls for Mobile/Tablet */}
      {showTouchControls && (
        <div className="flex items-end justify-between w-full pointer-events-auto pb-2">
          {/* Slide / Crouch Button (Left) */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onSlide(); }}
            onMouseDown={(e) => { e.preventDefault(); onSlide(); }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/85 active:bg-amber-600 border-2 border-amber-300 text-slate-950 flex flex-col items-center justify-center shadow-xl active:scale-90 transition-transform cursor-pointer"
          >
            <ArrowDown className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
            <span className="font-game text-[10px] sm:text-xs tracking-wider">SLIDE</span>
          </button>

          {/* Jump Button (Right) */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onJump(); }}
            onMouseDown={(e) => { e.preventDefault(); onJump(); }}
            className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-rose-500/90 active:bg-rose-600 border-2 border-rose-300 text-white flex flex-col items-center justify-center shadow-2xl active:scale-90 transition-transform cursor-pointer"
          >
            <ArrowUp className="w-8 h-8 sm:w-9 sm:h-9 stroke-[3]" />
            <span className="font-game text-[10px] sm:text-xs tracking-wider">JUMP</span>
          </button>
        </div>
      )}
    </div>
  );
};
