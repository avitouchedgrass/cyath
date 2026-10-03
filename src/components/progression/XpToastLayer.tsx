'use client';

import React, { useState, useEffect } from 'react';
import { progressionEvents } from '@/lib/progression/events';
import { PixelSun, PixelAnchor, PixelLightning } from '@/components/common/PixelIcons';

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
    renderIcon: () => <PixelSun size={11} color="#D97706" />,
    bg: 'bg-amber-500/10',
    text: 'text-amber-800',
    border: 'border-amber-500/20',
  },
  iron: {
    label: 'Iron Anchor',
    renderIcon: () => <PixelAnchor size={11} color="#EA580C" />,
    bg: 'bg-orange-500/10',
    text: 'text-orange-800',
    border: 'border-orange-500/20',
  },
  focus: {
    label: 'Deep Worker',
    renderIcon: () => <PixelLightning size={11} color="#059669" />,
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-800',
    border: 'border-emerald-500/20',
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

      setToasts((prev) => [...prev.slice(-3), newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3200);
    });

    return () => {
      unsub();
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const suiteBadge = toast.suite ? SUITE_BADGES[toast.suite] : null;
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 bg-[#FFFDF9] border border-[#1A3629]/15 rounded-2xl shadow-[0_10px_25px_rgba(26,54,41,0.12)] animate-in slide-in-from-bottom-2 duration-150 transition-all"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#EAE3D2]/70 border border-[#1A3629]/10 font-cabinet text-xs font-black text-[#D97706]">
              XP
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="font-cabinet text-sm font-bold text-[#1A3629]">
                  +{toast.amount} XP
                </span>
                {suiteBadge && (
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${suiteBadge.bg} ${suiteBadge.text} ${suiteBadge.border}`}>
                    {suiteBadge.renderIcon()}
                    <span>{suiteBadge.label}</span>
                  </span>
                )}
              </div>
              <span className="font-sans text-xs text-[#4A5D4E] line-clamp-1 max-w-[220px]">
                {toast.reason}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
