'use client';

import React, { useState, useEffect } from 'react';
import { progressionEvents } from '@/lib/progression/events';

interface XpToast {
  id: string;
  amount: number;
  reason: string;
}

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
      };

      setToasts((prev) => [...prev.slice(-3), newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2600);
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
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 bg-[#FFFDF9] border-2 border-[#1A3629] rounded-xl shadow-[4px_4px_0px_#1A3629] animate-card-enter transition-all"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#EAE3D2] border border-[#1A3629] font-cabinet text-xs font-black text-[#D97706]">
            XP
          </div>
          <div className="flex flex-col">
            <span className="font-cabinet text-sm font-bold text-[#1A3629]">
              +{toast.amount} XP
            </span>
            <span className="font-sans text-xs text-[#4A5D4E] line-clamp-1 max-w-[200px]">
              {toast.reason}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
