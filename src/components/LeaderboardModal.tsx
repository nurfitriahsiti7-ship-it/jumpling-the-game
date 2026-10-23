import React from 'react';
import { X, Trophy, Medal } from 'lucide-react';
import { HighScoreRecord } from '../game/types';

interface LeaderboardModalProps {
  records: HighScoreRecord[];
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ records, onClose }) => {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-40 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="font-game text-2xl text-white">HALL OF FAME</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Records List */}
        <div className="overflow-y-auto py-3 space-y-2.5">
          {records.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No runs recorded yet. Jump in and make your mark!
            </div>
          ) : (
            records.map((rec, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-2xl border ${
                    isFirst
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                      : isSecond
                      ? 'bg-slate-800/60 border-slate-600'
                      : isThird
                      ? 'bg-amber-900/15 border-amber-800/40'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 flex items-center justify-center font-game text-sm">
                      {isFirst ? (
                        <Medal className="w-5 h-5 text-yellow-400" />
                      ) : isSecond ? (
                        <Medal className="w-5 h-5 text-slate-300" />
                      ) : isThird ? (
                        <Medal className="w-5 h-5 text-amber-600" />
                      ) : (
                        <span className="text-slate-500 font-mono">#{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-game text-lg text-white tabular-nums tracking-wide">
                        {rec.score.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {rec.distance}m · {rec.coins} coins · {rec.date}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
