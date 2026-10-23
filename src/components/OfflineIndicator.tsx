import React from 'react';
import { WifiOff } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2 bg-amber-500/95 text-slate-950 font-medium px-3.5 py-2 rounded-xl text-xs shadow-lg backdrop-blur-sm border border-amber-300 animate-in fade-in duration-300 select-none"
    >
      <WifiOff className="w-4 h-4 shrink-0 text-slate-950" />
      <span>Mode Offline — Game tetap dapat dimainkan dengan lancar.</span>
    </div>
  );
};
