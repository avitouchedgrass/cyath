'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { Gift, Copy, Check, X } from 'lucide-react';

interface GuildInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuildInviteModal({ isOpen, onClose }: GuildInviteModalProps) {
  const { userProfile, claimReferralCode, currentDate } = useHabitStore();
  const [mounted, setMounted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [referralInput, setReferralInput] = useState('');
  const [isClaimingRef, setIsClaimingRef] = useState(false);
  const [referralMsg, setReferralMsg] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const userReferralCode = userProfile?.referralCode || 'CYATH-PIONEER';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://cyath.vercel.app';
  const inviteUrl = `${origin}/auth?ref=${userReferralCode}`;

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

  const handleClaimReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralInput.trim()) return;

    setIsClaimingRef(true);
    setReferralMsg(null);

    const res = await claimReferralCode(referralInput.trim().toUpperCase());
    setIsClaimingRef(false);

    if (res.success) {
      retroAudio.playTierUpgrade();
      setReferralMsg({ text: res.message, isError: false });
      setReferralInput('');
    } else {
      retroAudio.playBlip();
      setReferralMsg({ text: res.message, isError: true });
    }
  };

  const displayReferredBy = userProfile?.referredBy
    ? (userProfile.referredBy.startsWith('code_') ? userProfile.referredBy.replace('code_', '') : userProfile.referredBy)
    : '';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A3629]/30 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-lg bg-[#FFFDF9] border border-[#1A3629]/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(26,54,41,0.14)] flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1A3629]/8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full border border-[#1A3629]/10 bg-[#FAF8F5] text-[10px] font-mono font-semibold uppercase tracking-wider text-[#4A5D4E] flex items-center gap-1">
                <Gift className="w-3 h-3 text-[#C9A84C]" />
                Friend Referral Program
              </span>
              <span className="px-2.5 py-0.5 rounded-full border border-[#1A3629]/10 bg-[#FAF8F5] text-[10px] font-mono font-semibold text-[#1A3629]">
                +250 XP Dual Reward
              </span>
            </div>
            <h2 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight">
              Invite Friends to Cyath
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-colors flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm font-sans text-[#4A5D4E] leading-relaxed">
          Share your unique invite link. When your friend joins, they receive <strong>+250 Starter XP</strong> and you earn <strong>+250 Bonus XP</strong>!
        </p>

        {/* Your Referral Code Ribbon */}
        <div className="p-4 rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#4A5D4E] block">
              Your Referral Code
            </span>
            <span className="font-mono font-bold text-lg text-[#1A3629] tracking-wider select-all">
              {userReferralCode}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyInviteLink}
            className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Invite Link</span>
              </>
            )}
          </button>
        </div>

        {/* 1-Click Social Share */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#4A5D4E]">
            1-Click Social Share
          </span>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`I'm improving my daily habits on Cyath! Join with my invite code ${userReferralCode} for +250 Starter XP: ${inviteUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => retroAudio.playInspectConfirm()}
              className="py-2.5 px-3 rounded-full border border-[#1A3629]/12 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs text-center shadow-2xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>WhatsApp</span>
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Tracking my daily health habits and building my island on @Cyath. Join with my code ${userReferralCode} to get +250 Starter XP:`)}&url=${encodeURIComponent(inviteUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => retroAudio.playInspectConfirm()}
              className="py-2.5 px-3 rounded-full border border-[#1A3629]/12 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs text-center shadow-2xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>Share on X</span>
            </a>
          </div>
        </div>

        {/* Claim A Friend's Code Section */}
        <div className="p-4 rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] flex flex-col gap-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-cabinet font-bold text-[#1A3629]">
              Have a Friend&apos;s Invite Code?
            </span>
            <span className="text-[11px] font-sans text-[#4A5D4E]">
              Enter their unique code (e.g. ALEX-7K9P).
            </span>
          </div>

          {!userProfile?.claimedReferral ? (
            <form onSubmit={handleClaimReferral} className="flex items-center gap-2">
              <input
                type="text"
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                placeholder="e.g. ALEX-7K9P"
                className="flex-1 px-3.5 py-2 rounded-full border border-[#1A3629]/15 focus:border-[#1A3629]/40 bg-[#FFFDF9] font-mono text-xs text-[#1A3629] outline-none uppercase placeholder:normal-case shadow-2xs"
              />
              <button
                type="submit"
                disabled={isClaimingRef || !referralInput.trim()}
                className="px-4 py-2 rounded-full bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isClaimingRef ? 'Verifying...' : 'Claim +250 XP'}
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#1A3629]">
              <Check className="w-4 h-4 text-[#1A3629]" />
              <span>Referral Bonus Claimed ({displayReferredBy})</span>
            </div>
          )}

          {referralMsg && (
            <div className={`text-[11px] font-mono font-semibold ${referralMsg.isError ? 'text-red-600' : 'text-[#1A3629]'}`}>
              {referralMsg.text}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-full border border-[#1A3629]/15 hover:bg-[#FAF8F5] bg-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs transition-all cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  );
}
