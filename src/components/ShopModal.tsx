import React from 'react';
import { X, Check, Lock, Sparkles } from 'lucide-react';
import { CharacterSkin } from '../game/types';

interface ShopModalProps {
  skins: CharacterSkin[];
  activeSkin: CharacterSkin;
  totalCoins: number;
  onSelectSkin: (skinId: string) => void;
  onUnlockSkin: (skinId: string) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  skins,
  activeSkin,
  totalCoins,
  onSelectSkin,
  onUnlockSkin,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-40 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <h2 className="font-game text-2xl text-white">RUNNER WARDROBE</h2>
            {/* Coins Balance */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-amber-500/50 px-2.5 py-1 rounded-xl">
              <span className="text-[10px] text-amber-400 font-bold">★</span>
              <span className="font-game text-xs text-amber-300 tabular-nums">{totalCoins}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Skins Grid */}
        <div className="overflow-y-auto py-4 space-y-3">
          {skins.map(skin => {
            const isEquipped = skin.id === activeSkin.id;
            const canAfford = totalCoins >= skin.price;

            return (
              <div
                key={skin.id}
                className={`relative flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  isEquipped
                    ? 'bg-sky-950/40 border-sky-400 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Skin Color Palette Swatch Avatar */}
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-xl border-2 border-slate-700 flex flex-col overflow-hidden shadow-inner shrink-0"
                    style={{ backgroundColor: skin.colors.cap }}
                  >
                    {/* Upper cap / shirt */}
                    <div className="h-1/2 w-full flex">
                      <div className="w-1/2 h-full" style={{ backgroundColor: skin.colors.cap }} />
                      <div className="w-1/2 h-full" style={{ backgroundColor: skin.colors.capFront }} />
                    </div>
                    {/* Lower hoodie / pants */}
                    <div className="h-1/2 w-full flex">
                      <div className="w-1/2 h-full" style={{ backgroundColor: skin.colors.hoodie }} />
                      <div className="w-1/2 h-full" style={{ backgroundColor: skin.colors.pants }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{skin.name}</h3>
                      {skin.colors.glow && (
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{skin.description}</p>
                  </div>
                </div>

                {/* Equip / Unlock Button */}
                <div className="shrink-0 pl-3">
                  {isEquipped ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 border border-sky-400/50 text-sky-300 text-xs font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>EQUIPPED</span>
                    </div>
                  ) : skin.unlocked ? (
                    <button
                      onClick={() => onSelectSkin(skin.id)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-xs active:scale-95 transition cursor-pointer"
                    >
                      EQUIP
                    </button>
                  ) : (
                    <button
                      onClick={() => onUnlockSkin(skin.id)}
                      disabled={!canAfford}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-game text-xs transition cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95 shadow-md'
                          : 'bg-slate-800/80 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{skin.price} COINS</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Collect coins in runs to unlock new styles and colorways!
          </p>
        </div>
      </div>
    </div>
  );
};
