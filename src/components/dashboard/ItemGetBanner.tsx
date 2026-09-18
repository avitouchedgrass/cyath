'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { X, Trophy } from 'lucide-react';

interface ItemGetBannerProps {
  onOpenVault: (trophyId?: string) => void;
}

export function ItemGetBanner({ onOpenVault }: ItemGetBannerProps) {
  const { pendingTrophyUnlock, dismissPendingTrophy } = useHabitStore();

  useEffect(() => {
    if (pendingTrophyUnlock) {
      retroAudio.playTierUpgrade();
      haptics.heavy();
      const timer = setTimeout(() => {
        dismissPendingTrophy();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [pendingTrophyUnlock, dismissPendingTrophy]);

  if (!pendingTrophyUnlock) return null;

  const handleInspect = () => {
    const id = pendingTrophyUnlock.id;
    dismissPendingTrophy();
    onOpenVault(id);
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="w-full bg-[#FFFDF9] border-2 border-[#1A3629] rounded-2xl p-4 shadow-[6px_6px_0px_#1A3629] flex items-center gap-4">
        <div className="w-14 h-14 relative shrink-0 bg-[#FAF8F5] rounded-xl border border-[#1A3629]/20 p-1 flex items-center justify-center">
          <Image
            src={pendingTrophyUnlock.spriteUrl}
            alt={pendingTrophyUnlock.title}
            width={48}
            height={48}
            className="object-contain select-none"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#D97706]" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#D97706]">
              {pendingTrophyUnlock.isShame ? 'Trophy of Shame Unlocked' : 'New Specimen Acquired'}
            </span>
          </div>
          <h4 className="font-cabinet font-extrabold text-sm text-[#1A3629] truncate">
            {pendingTrophyUnlock.title}
          </h4>
          <p className="font-sans text-[11px] text-[#4A5D4E] line-clamp-1">
            {pendingTrophyUnlock.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleInspect}
            className="px-3 py-1.5 rounded-xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer shadow-2xs"
          >
            Inspect
          </button>
          <button
            type="button"
            onClick={dismissPendingTrophy}
            className="w-7 h-7 rounded-lg text-[#1A3629]/60 hover:text-[#1A3629] hover:bg-[#1A3629]/8 flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
