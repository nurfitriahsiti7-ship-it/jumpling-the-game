import React from 'react';
import { Play, HelpCircle, Trophy, ShoppingBag, Settings, Volume2, VolumeX, Flame } from 'lucide-react';
import { CharacterSkin, Mission } from '../game/types';

interface MainMenuProps {
  highScore: number;
  totalCoins: number;
  activeSkin: CharacterSkin;
  missions: Mission[];
  isMuted: boolean;
  onPlay: () => void;
  onOpenHowToPlay: () => void;
  onOpenMissions: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  onOpenLeaderboard: () => void;
  onToggleMute: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  highScore,
  totalCoins,
  activeSkin,
  missions,
  isMuted,
  onPlay,
  onOpenHowToPlay,
  onOpenMissions,
  onOpenShop,
  onOpenSettings,
  onOpenLeaderboard,
  onToggleMute,
}) => {
  const completedMissionsCount = missions.filter(m => m.completed).length;

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-4 sm:p-6 overflow-y-auto select-none">
      {/* Top Header Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        {/* Career Coins & High Score pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/50 px-3.5 py-1.5 rounded-xl shadow-lg">
            <div className="w-5 h-5 rounded-full bg-amber-400 border border-amber-600 flex items-center justify-center">
              <span className="text-[10px] text-amber-950 font-black">★</span>
            </div>
            <span className="font-game text-amber-300 text-sm sm:text-base tabular-nums">
              {totalCoins}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3.5 py-1.5 rounded-xl shadow-lg">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-slate-400 font-semibold uppercase">BEST:</span>
            <span className="font-game text-white text-sm sm:text-base tabular-nums">
              {highScore}
            </span>
          </div>
        </div>

        {/* Quick Sound / Settings Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 transition cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-sky-400" />}
          </button>
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 transition cursor-pointer"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Game Showcase & Title */}
      <div className="flex flex-col items-center my-auto py-4 z-10 max-w-xl text-center">
        {/* Poster Artwork Showcase Card */}
        <div className="relative group max-w-md w-full rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-[0_12px_35px_rgba(0,0,0,0.6)] mb-4">
          <img
            src="/assets/jumping_game_art.jpg"
            alt="JUMPING: THE GAME"
            className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <p className="font-game text-xs sm:text-sm text-amber-300 drop-shadow-md">
              "Jump Higher. Run Further. Beat Your Best!"
            </p>
          </div>
        </div>

        {/* Current Active Character Preview indicator */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-lg text-xs text-slate-300 mb-4">
          <span>Active Runner:</span>
          <span className="font-bold text-white">{activeSkin.name}</span>
          <button
            onClick={onOpenShop}
            className="ml-2 text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2 cursor-pointer"
          >
            Change
          </button>
        </div>

        {/* Big PLAY Button */}
        <button
          onClick={onPlay}
          className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 bg-[length:200%_auto] hover:bg-right font-game text-2xl sm:text-3xl text-slate-950 uppercase tracking-wider shadow-[0_0_30px_rgba(244,63,94,0.5)] hover:shadow-[0_0_40px_rgba(245,158,11,0.8)] active:scale-95 transition-all duration-300 cursor-pointer"
        >
          <Play className="w-8 h-8 fill-slate-950 transition-transform group-hover:scale-110" />
          <span>PLAY NOW</span>
        </button>
        <span className="text-slate-400 text-xs mt-2 font-medium">
          Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">SPACE</kbd> or Tap to start
        </span>
      </div>

      {/* Bottom Navigation Grid */}
      <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 z-10 pt-2">
        {/* HOW TO PLAY */}
        <button
          onClick={onOpenHowToPlay}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer shadow-md"
        >
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span>How to Play</span>
        </button>

        {/* MISSIONS */}
        <button
          onClick={onOpenMissions}
          className="relative flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer shadow-md"
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Missions</span>
          <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono">
            {completedMissionsCount}/{missions.length}
          </span>
        </button>

        {/* SKINS / SHOP */}
        <button
          onClick={onOpenShop}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer shadow-md"
        >
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          <span>Runner Shop</span>
        </button>

        {/* LEADERBOARD */}
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer shadow-md"
        >
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span>High Scores</span>
        </button>
      </div>
    </div>
  );
};
