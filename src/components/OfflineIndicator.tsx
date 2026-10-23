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
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-amber-500/95 text-slate-950 font-semibold px-4 py-1.5 rounded-full text-xs shadow-xl backdrop-blur-sm border border-amber-300 animate-in fade-in duration-300 select-none whitespace-nowrap"
    >
      <WifiOff className="w-4 h-4 shrink-0 text-slate-950" />
      <span>Mode Offline — Game tetap dapat dimainkan dengan lancar.</span>
    </div>
  );
};
