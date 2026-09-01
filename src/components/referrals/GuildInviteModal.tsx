'use client';

import React, { useState, useEffect } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { Gift, Copy, Check, X, Share2 } from 'lucide-react';

interface GuildInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuildInviteModal({ isOpen, onClose }: GuildInviteModalProps) {
  const { userProfile, userSession, claimReferralCode } = useHabitStore();
  const [copiedLink, setCopiedLink] = useState(false);
  const [referralInput, setReferralInput] = useState('');
  const [referralMsg, setReferralMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isClaimingRef, setIsClaimingRef] = useState(false);

  const userReferralCode = userProfile?.referralCode || 'CYATH-JOIN';
  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth?ref=${userReferralCode}`
    : `https://cyath.space/auth?ref=${userReferralCode}`;

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
    try {
      const res = await claimReferralCode(referralInput.trim());
      setReferralMsg({ text: res.message, isError: !res.success });
      if (res.success) {
        setReferralInput('');
      }
    } catch (err: any) {
      setReferralMsg({ text: err?.message || 'Failed to claim code', isError: true });
    } finally {
      setIsClaimingRef(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A3629]/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-[#FFFDF9] border-3 border-[#1A3629] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#1A3629] flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b-2 border-[#1A3629]/15">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full border border-[#1A3629] bg-[#FAF6EE] text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629] flex items-center gap-1">
                <Gift className="w-3 h-3 text-[#D97706]" />
                Adventurer&apos;s Guild Pact
              </span>
              <span className="px-2 py-0.5 rounded-md border border-[#10B981] bg-[#ECFDF5] text-[10px] font-mono font-bold text-[#065F46]">
                +250 XP Dual Reward
              </span>
            </div>
            <h2 className="font-fraunces font-black text-2xl text-[#1A3629] tracking-tight">
              Invite Companions to Cyath
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#1A3629] bg-[#FAF6EE] text-[#1A3629] font-mono text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center cursor-pointer shadow-[1px_1px_0px_#1A3629] shrink-0"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <p className="text-xs sm:text-sm font-cabinet font-medium text-[#2C4A3B] leading-relaxed">
          Share your unique invite link. When your friend joins, they receive <strong>+250 Starter XP</strong> (instant Level 2) and you earn <strong>+250 Guild Bonus XP</strong>!
        </p>

        {/* Your Referral Code Ribbon */}
        <div className="p-4 rounded-2xl border-2 border-[#1A3629] bg-[#FAF6EE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[2px_2px_0px_#1A3629]">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#4A5D4E] block">
              Your Referral Code
            </span>
            <span className="font-mono font-black text-lg text-[#1A3629] tracking-wider select-all">
              {userReferralCode}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyInviteLink}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#34D399]" />
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
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1A3629]">
            1-Click Social Share:
          </span>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`I'm leveling up my metabolic health on Cyath! Join my guild with code ${userReferralCode} for +250 Starter XP: ${inviteUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => retroAudio.playInspectConfirm()}
              className="py-2.5 px-3 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] hover:bg-[#FAF6EE] text-[#1A3629] font-cabinet font-bold text-xs text-center shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
            >
              <span>WhatsApp</span>
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Tracking my daily metabolic habits and building my 16-bit sanctuary on @Cyath. Join with my code ${userReferralCode} to get +250 Starter XP:`)}&url=${encodeURIComponent(inviteUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => retroAudio.playInspectConfirm()}
              className="py-2.5 px-3 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] hover:bg-[#FAF6EE] text-[#1A3629] font-cabinet font-bold text-xs text-center shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
            >
              <span>Share on X</span>
            </a>
          </div>
        </div>

        {/* Claim A Friend's Code Section */}
        <div className="p-4 rounded-2xl border-2 border-[#1A3629]/20 bg-[#F4F0EA] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A3629]">
              Have a Friend&apos;s Invite Code?
            </span>
          </div>

          {!userProfile?.claimedReferral ? (
            <form onSubmit={handleClaimReferral} className="flex items-center gap-2">
              <input
                type="text"
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                placeholder="e.g. CYATH-XXXX"
                className="flex-1 px-3 py-2 rounded-xl border-2 border-[#1A3629]/30 focus:border-[#1A3629] bg-[#FFFDF9] font-mono text-xs text-[#1A3629] outline-none uppercase placeholder:normal-case"
              />
              <button
                type="submit"
                disabled={isClaimingRef || !referralInput.trim()}
                className="px-4 py-2 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isClaimingRef ? 'Claiming...' : 'Claim +250 XP'}
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#065F46]">
              <Check className="w-4 h-4 text-[#10B981]" />
              <span>Starter Guild XP Claimed ({userProfile.referredBy || 'GUILD'})</span>
            </div>
          )}

          {referralMsg && (
            <div className={`text-[11px] font-mono font-bold ${referralMsg.isError ? 'text-red-600' : 'text-[#065F46]'}`}>
              {referralMsg.text}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border-2 border-[#1A3629]/30 hover:border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs transition-all cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}
