import React from 'react';
import { X, CheckCircle2, Circle, Flame, Award } from 'lucide-react';
import { Mission } from '../game/types';

interface MissionsModalProps {
  missions: Mission[];
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({ missions, onClose }) => {
  const completedCount = missions.filter(m => m.completed).length;

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-40 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-400" />
            <h2 className="font-game text-2xl text-white">MISSIONS & QUESTS</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress summary banner */}
        <div className="my-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-semibold text-slate-300">
              Completed: <strong className="text-white">{completedCount}</strong> / {missions.length}
            </span>
          </div>
          <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500"
              style={{ width: `${(completedCount / missions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Missions list */}
        <div className="overflow-y-auto py-2 space-y-3">
          {missions.map(mission => {
            const percent = Math.min(100, Math.round((mission.current / mission.target) * 100));

            return (
              <div
                key={mission.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  mission.completed
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    {mission.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h3
                        className={`text-sm font-bold ${
                          mission.completed ? 'text-emerald-300 line-through' : 'text-white'
                        }`}
                      >
                        {mission.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{mission.description}</p>
                    </div>
                  </div>

                  {/* Reward Badge */}
                  <div className="shrink-0 pl-2">
                    <span className="font-game text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                      +{mission.reward} ★
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        mission.completed ? 'bg-emerald-400' : 'bg-sky-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums shrink-0">
                    {mission.current}/{mission.target}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
