import React from 'react';
import { X, ArrowUp, ArrowDown, Magnet, Shield, Zap, ChevronsUp, Smartphone, Monitor } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-40 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="font-game text-2xl text-white">HOW TO PLAY</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-5 text-sm">
          {/* Controls Overview */}
          <div>
            <h3 className="text-xs uppercase font-bold text-sky-400 tracking-wider mb-2.5 flex items-center gap-2">
              <Monitor className="w-4 h-4" /> PC & Keyboard Controls
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
                <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono">SPACE</kbd>
                  <span>or</span>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono">▲</kbd>
                </div>
                <p className="text-slate-400">Jump over crates and hazards. Press again in air for <strong className="text-sky-300">Double Jump</strong>!</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
                <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono">▼</kbd>
                  <span>or</span>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono">S</kbd>
                </div>
                <p className="text-slate-400">Slide under low clearance signs. In mid-air, triggers quick ground stomp!</p>
              </div>
            </div>
          </div>

          {/* Touch Controls */}
          <div>
            <h3 className="text-xs uppercase font-bold text-emerald-400 tracking-wider mb-2.5 flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> Mobile & Tablet Controls
            </h3>
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ArrowUp className="w-4 h-4 text-rose-400 shrink-0" />
                <span><strong>Tap or Swipe Up:</strong> Jump into the air. Tap again to Double Jump.</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowDown className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>Swipe Down:</strong> Crouch & slide beneath low obstacles.</span>
              </div>
              <div className="text-[11px] text-slate-400 pl-6">
                On-screen action buttons can also be enabled in Settings for direct thumb taps!
              </div>
            </div>
          </div>

          {/* Obstacles Strategy */}
          <div>
            <h3 className="text-xs uppercase font-bold text-amber-400 tracking-wider mb-2.5">
              Obstacles & Strategy
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
                <span className="font-bold text-amber-300">▼ SLIDE Signs</span>
                <p className="text-slate-400 mt-1">
                  High overhead beams have low clearance. You <strong>MUST SLIDE</strong> to pass under safely!
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
                <span className="font-bold text-blue-300">Subway Trains</span>
                <p className="text-slate-400 mt-1">
                  Subway carriages have solid walkable roofs. Jump on top of them to score high coin trails!
                </p>
              </div>
            </div>
          </div>

          {/* Power-ups Guide */}
          <div>
            <h3 className="text-xs uppercase font-bold text-purple-400 tracking-wider mb-2.5">
              Special Power-Ups
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-start gap-2 bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
                <Magnet className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sky-300">Coin Magnet</strong>
                  <p className="text-[11px] text-slate-400">Pulls all nearby gold coins directly to your runner.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
                <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-cyan-300">Energy Shield</strong>
                  <p className="text-[11px] text-slate-400">Survives 1 fatal obstacle crash with bonus invincibility.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
                <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">2X Multiplier</strong>
                  <p className="text-[11px] text-slate-400">Doubles score progression and gives double value per coin.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
                <ChevronsUp className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-300">Super Sneakers</strong>
                  <p className="text-[11px] text-slate-400">Rocket boosted jumps to leap over double obstacles.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition cursor-pointer"
          >
            Got It, Let's Jump!
          </button>
        </div>
      </div>
    </div>
  );
};
