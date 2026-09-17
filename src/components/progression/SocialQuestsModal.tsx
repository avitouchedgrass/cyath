'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';

interface SocialQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SocialQuestsModal({ isOpen, onClose }: SocialQuestsModalProps) {
  const { socialQuests, claimSocialFollow } = useHabitStore();
  const [mounted, setMounted] = useState(false);

  const [linkedinHandle, setLinkedinHandle] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [linkedinOpened, setLinkedinOpened] = useState(false);
  const [instagramOpened, setInstagramOpened] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ platform: string; text: string; error?: boolean } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleOpenPlatform = (platform: 'linkedin' | 'instagram', url: string) => {
    retroAudio.playInspectConfirm();
    if (platform === 'linkedin') setLinkedinOpened(true);
    if (platform === 'instagram') setInstagramOpened(true);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleVerify = (platform: 'linkedin' | 'instagram') => {
    const handle = platform === 'linkedin' ? linkedinHandle : instagramHandle;
    if (!handle.trim()) {
      setStatusMessage({
        platform,
        text: `Please input your ${platform === 'linkedin' ? 'LinkedIn name or URL' : 'Instagram handle'} to verify.`,
        error: true,
      });
      return;
    }

    const res = claimSocialFollow(platform, handle);
    if (res.success) {
      setStatusMessage({
        platform,
        text: res.message,
        error: false,
      });
    } else {
      setStatusMessage({
        platform,
        text: res.message,
        error: true,
      });
    }
  };

  const isLinkedinVerified = socialQuests?.linkedin?.status === 'verified';
  const isInstagramVerified = socialQuests?.instagram?.status === 'verified';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A3629]/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-[#1A3629]/20 bg-[#FFFDF9] shadow-[0_16px_36px_rgba(26,54,41,0.16)] p-6 sm:p-8 flex flex-col gap-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#1A3629]/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629]">
                Sanctuary Community Quests
              </span>
              <span className="font-mono text-[10px] font-bold text-[#1A3629] bg-[#E8F5E9] border border-[#10B981]/30 px-2 py-0.5 rounded-md">
                +15 XP + Vanguard Badge
              </span>
            </div>
            <h2 className="font-cabinet font-extrabold text-xl sm:text-2xl text-[#1A3629] mt-1">
              Connect With Cyath
            </h2>
            <p className="font-sans text-xs text-[#4A5D4E] mt-0.5">
              Follow our official channels for human biology updates. Each verified channel awards +15 XP and unlocks the permanent Vanguard Follower profile badge.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono font-bold w-7 h-7 rounded-full border border-[#1A3629]/20 bg-[#FAF8F5] text-[#1A3629]/70 hover:text-[#1A3629] hover:bg-[#FAF8F5]/80 flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Quests Container */}
        <div className="flex flex-col gap-5">
          {/* 1. LinkedIn Quest */}
          <div className="p-4 rounded-2xl border border-[#1A3629]/12 bg-[#FAF8F5] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs uppercase px-2 py-0.5 rounded bg-[#0A66C2] text-white">
                  LinkedIn
                </span>
                <span className="font-cabinet font-bold text-sm text-[#1A3629]">
                  Follow Cyath on LinkedIn
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#10B981]/30">
                +15 XP &amp; Badge
              </span>
            </div>


            {isLinkedinVerified ? (
              <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#10B981]/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-[#065F46]">
                  <span className="font-bold">✓ Verified</span>
                  <span>({socialQuests.linkedin.handle})</span>
                </div>
                <span className="font-mono text-[10px] text-[#065F46]/80">
                  {socialQuests.linkedin.verificationCode}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <p className="font-sans text-xs text-[#4A5D4E]">
                  1. Visit our official page and click Follow.
                  <br />
                  2. Enter your account name or profile URL below to verify.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenPlatform('linkedin', 'https://www.linkedin.com/company/cyath')}
                    className="px-3.5 py-2 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white font-cabinet font-bold text-xs transition-all cursor-pointer text-center"
                  >
                    Open Cyath LinkedIn
                  </button>

                  <input
                    type="text"
                    placeholder="Your LinkedIn name or URL"
                    value={linkedinHandle}
                    onChange={(e) => setLinkedinHandle(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/15 text-xs font-cabinet text-[#1A3629] placeholder:text-[#1A3629]/40 outline-none focus:border-[#1A3629]/40"
                  />

                  <button
                    type="button"
                    onClick={() => handleVerify('linkedin')}
                    disabled={!linkedinOpened && !linkedinHandle}
                    className="px-3.5 py-2 rounded-xl bg-[#1A3629] hover:bg-[#2C4A3B] disabled:bg-[#1A3629]/30 text-[#FFFDF9] font-cabinet font-bold text-xs transition-all cursor-pointer text-center"
                  >
                    Verify (+50 XP)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Instagram Quest */}
          <div className="p-4 rounded-2xl border border-[#1A3629]/12 bg-[#FAF8F5] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs uppercase px-2 py-0.5 rounded bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white">
                  Instagram
                </span>
                <span className="font-cabinet font-bold text-sm text-[#1A3629]">
                  Follow Cyath on Instagram
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#10B981]/30">
                +15 XP &amp; Badge
              </span>
            </div>


            {isInstagramVerified ? (
              <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#10B981]/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-[#065F46]">
                  <span className="font-bold">✓ Verified</span>
                  <span>(@{socialQuests.instagram.handle})</span>
                </div>
                <span className="font-mono text-[10px] text-[#065F46]/80">
                  {socialQuests.instagram.verificationCode}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <p className="font-sans text-xs text-[#4A5D4E]">
                  1. Visit our official Instagram and follow @cyath.
                  <br />
                  2. Enter your IG handle below to verify.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenPlatform('instagram', 'https://instagram.com/cyath')}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#833AB4] to-[#FD1D1D] text-white font-cabinet font-bold text-xs transition-all cursor-pointer text-center"
                  >
                    Open Cyath Instagram
                  </button>

                  <input
                    type="text"
                    placeholder="Your @handle"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/15 text-xs font-cabinet text-[#1A3629] placeholder:text-[#1A3629]/40 outline-none focus:border-[#1A3629]/40"
                  />

                  <button
                    type="button"
                    onClick={() => handleVerify('instagram')}
                    disabled={!instagramOpened && !instagramHandle}
                    className="px-3.5 py-2 rounded-xl bg-[#1A3629] hover:bg-[#2C4A3B] disabled:bg-[#1A3629]/30 text-[#FFFDF9] font-cabinet font-bold text-xs transition-all cursor-pointer text-center"
                  >
                    Verify (+50 XP)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Feedback Message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl border text-xs font-mono font-bold text-center animate-in fade-in duration-150 ${
              statusMessage.error
                ? 'bg-[#FEF2F2] border-[#EF4444]/30 text-[#B91C1C]'
                : 'bg-[#ECFDF5] border-[#10B981]/30 text-[#065F46]'
            }`}
          >
            {statusMessage.error ? '✕' : '✓'} {statusMessage.text}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
