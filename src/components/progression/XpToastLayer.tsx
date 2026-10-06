'use client';

import React, { useState, useEffect } from 'react';
import { progressionEvents } from '@/lib/progression/events';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { PixelSun, PixelAnchor, PixelLightning, PixelSparkles, PixelX } from '@/components/common/PixelIcons';

interface XpToast {
  id: string;
  amount: number;
  reason: string;
  suite?: 'circadian' | 'iron' | 'focus';
}

const SUITE_BADGES: Record<
  'circadian' | 'iron' | 'focus',
  { label: string; renderIcon: () => React.ReactNode; bg: string; text: string; border: string }
> = {
  circadian: {
    label: 'Circadian',
    renderIcon: () => <PixelSun size={11} color="#B8862D" />,
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    border: 'border-amber-300',
  },
  iron: {
    label: 'Iron Anchor',
    renderIcon: () => <PixelAnchor size={11} color="#C2410C" />,
    bg: 'bg-orange-100',
    text: 'text-orange-900',
    border: 'border-orange-300',
  },
  focus: {
    label: 'Deep Worker',
    renderIcon: () => <PixelLightning size={11} color="#047857" />,
    bg: 'bg-emerald-100',
    text: 'text-emerald-900',
    border: 'border-emerald-300',
  },
};

export function XpToastLayer() {
  const [toasts, setToasts] = useState<XpToast[]>([]);

  useEffect(() => {
    const unsub = progressionEvents.on('xp:gained', (data) => {
      if (data.amount <= 0) return;
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast: XpToast = {
        id,
        amount: data.amount,
        reason: data.reason,
        suite: data.suite,
      };

      retroAudio.playBlip();
      haptics.tap();

      setToasts((prev) => [...prev.slice(-2), newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3400);
    });

    return () => {
      unsub();
    };
  }, []);

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[95] flex flex-col gap-2.5 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const suiteBadge = toast.suite ? SUITE_BADGES[toast.suite] : null;
        return (
          <div
            key={toast.id}
            onClick={() => handleDismiss(toast.id)}
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-[#FFFDF9] border-2 border-[#1A3629] rounded-2xl shadow-[4px_4px_0px_#1A3629] animate-in zoom-in-95 slide-in-from-bottom-2 duration-150 transition-all cursor-pointer group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#1A3629] select-none max-w-sm"
          >
            <div className="flex items-center gap-3">
              {/* Golden Stamp Badge */}
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#D97706] to-[#B8862D] border border-amber-300/40 text-[#FFFDF9] shadow-2xs shrink-0">
                <PixelSparkles size={16} color="#FFFDF9" />
              </div>

              {/* Toast Text Content */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-cabinet font-extrabold text-sm text-[#1A3629] tracking-tight">
                    +{toast.amount} XP
                  </span>
                  {suiteBadge && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${suiteBadge.bg} ${suiteBadge.text} ${suiteBadge.border}`}>
                      {suiteBadge.renderIcon()}
                      <span>{suiteBadge.label}</span>
                    </span>
                  )}
                </div>
                <span className="font-sans text-xs text-[#4A5D4E] line-clamp-1 max-w-[210px] leading-tight font-medium">
                  {toast.reason}
                </span>
              </div>
            </div>

            {/* Micro dismiss indicator on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[#1A3629]/40 hover:text-[#1A3629] p-1">
              <PixelX size={12} color="currentColor" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
