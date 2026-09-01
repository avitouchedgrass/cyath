'use client';

import React, { useState, useEffect } from 'react';
import { progressionEvents } from '@/lib/progression/events';
import { retroAudio } from '@/lib/retroAudio';
import { useHabitStore } from '@/store/useHabitStore';
import { Gift, Copy, Check, Share2 } from 'lucide-react';

interface LevelUpData {
  oldLevel: number;
  newLevel: number;
  title: string;
  unlockedTitle?: string;
}

export function LevelUpModal() {
  const [data, setData] = useState<LevelUpData | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const { userProfile } = useHabitStore();

  useEffect(() => {
    const unsub = progressionEvents.on('level:up', (eventData) => {
      setData(eventData);
    });

    return () => {
      unsub();
    };
  }, []);

  if (!data) return null;

  const userReferralCode = userProfile?.referralCode || 'CYATH-JOIN';
  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth?ref=${userReferralCode}`
    : `https://cyath.space/auth?ref=${userReferralCode}`;

  const handleClose = () => {
    retroAudio.playInspectConfirm();
    setData(null);
  };

  const handleCopyInviteLink = async () => {
    retroAudio.playInspectConfirm();
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A3629]/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-[#FFFDF9] border-3 border-[#1A3629] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#1A3629] text-center flex flex-col items-center">
        {/* Floating Level Badge */}
        <div className="w-20 h-20 rounded-2xl bg-[#F4EDE0] border-2 border-[#1A3629] shadow-[4px_4px_0px_#1A3629] flex items-center justify-center mb-5 -mt-12 bg-gradient-to-br from-[#F5E6C8] to-[#EBD5B3]">
          <span className="font-cabinet text-2xl font-black text-[#1A3629]">
            Lv.{data.newLevel}
          </span>
        </div>

        <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#D97706] mb-1">
          Milestone Ascended
        </span>

        <h2 className="font-fraunces font-black text-3xl sm:text-4xl text-[#1A3629] mb-2 tracking-tight">
          Level {data.newLevel} Reached!
        </h2>

        <p className="font-sans text-sm text-[#4A5D4E] mb-5 max-w-xs">
          Your sustained consistency has fortified your daily foundation.
        </p>

        {data.unlockedTitle ? (
          <div className="w-full bg-[#FAF6EE] border-2 border-[#D97706] rounded-2xl p-4 mb-4 shadow-[3px_3px_0px_#D97706]">
            <span className="block font-mono text-[11px] font-bold text-[#D97706] uppercase tracking-wider mb-1">
              New Title Unlocked
            </span>
            <span className="font-fraunces font-black text-xl text-[#1A3629]">
              {data.unlockedTitle}
            </span>
          </div>
        ) : (
          <div className="w-full bg-[#FAF6EE] border-2 border-[#1A3629] rounded-2xl p-4 mb-4 shadow-[3px_3px_0px_#1A3629]">
            <span className="block font-mono text-[11px] font-bold text-[#4A5D4E] uppercase tracking-wider mb-0.5">
              Current Rank
            </span>
            <span className="font-fraunces font-bold text-lg text-[#1A3629]">
              {data.title}
            </span>
          </div>
        )}

        {/* Strategic Referral Guild Invite Card on Level-Up */}
        <div className="w-full p-3.5 rounded-2xl border-2 border-[#10B981] bg-[#ECFDF5] mb-5 flex flex-col gap-2.5 shadow-[2px_2px_0px_#10B981]">
          <div className="flex items-center justify-between text-left">
            <div>
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-[#065F46]">
                <Gift className="w-3 h-3 text-[#10B981]" />
                <span>Guild Recruitment Pact</span>
              </div>
              <span className="text-xs font-cabinet font-bold text-[#1A3629] block">
                Share Level {data.newLevel} &amp; Earn +250 XP
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#10B981] text-white text-[10px] font-mono font-bold">
              +250 XP
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="flex-1 py-2 px-3 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] hover:bg-[#FAF6EE] text-[#1A3629] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#1A3629] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Invite Link</span>
                </>
              )}
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(`I just ascended to Level ${data.newLevel} on Cyath! Join my guild with code ${userReferralCode} to claim +250 Starter XP: ${inviteUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => retroAudio.playInspectConfirm()}
              className="p-2 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] hover:bg-[#FAF6EE] text-[#1A3629] shadow-[2px_2px_0px_#1A3629] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="Share to WhatsApp"
            >
              <Share2 className="w-4 h-4 text-[#1A3629]" />
            </a>
          </div>
        </div>

        <button
          onClick={handleClose}
          type="button"
          className="w-full py-3 px-6 bg-[#1A3629] text-[#FFFDF9] font-cabinet text-sm font-bold rounded-xl border-2 border-[#1A3629] shadow-[4px_4px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
        >
          Continue Journey →
        </button>
      </div>
    </div>
  );
}
