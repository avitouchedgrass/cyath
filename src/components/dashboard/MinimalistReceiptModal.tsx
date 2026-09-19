'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useHabitStore } from '@/store/useHabitStore';
import { getIslandTier } from '@/lib/progression/config';
import { calculateLevel } from '@/lib/progression/engine';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { X, Copy, Check, Share2 } from 'lucide-react';

interface MinimalistReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateOverride?: string;
}

export function MinimalistReceiptModal({ isOpen, onClose, dateOverride }: MinimalistReceiptModalProps) {
  const {
    currentDate,
    getDailyLog,
    userProfile,
    totalXp,
    streakCount,
    isForgedStreak,
    isLedgerSealedByDate,
  } = useHabitStore();

  const [copied, setCopied] = useState(false);

  const activeDate = dateOverride || currentDate;
  const currentLog = getDailyLog(activeDate);
  const progress = calculateLevel(totalXp);
  const currentIsland = getIslandTier(progress.level);

  const targetProtein = userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140;
  const isSunlightDone = !!currentLog.habitsCompleted?.['sunlight'];
  const proteinLogged = currentLog.totalProteinLogged || 0;
  const hydrationLogged = (currentLog.hydrationLiters || 0).toFixed(1);
  const isSealed = !!isLedgerSealedByDate[activeDate];

  useEffect(() => {
    if (!isOpen) return;
    retroAudio.playPaperRustle();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyReceipt = async () => {
    retroAudio.playInspectConfirm();
    haptics.success();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 880;

    // Thermal Receipt Paper Background
    ctx.fillStyle = '#FBF8F1';
    ctx.fillRect(0, 0, 600, 880);

    // Dark receipt border
    ctx.strokeStyle = '#2B1F17';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, 576, 856);

    ctx.fillStyle = '#2B1F17';
    ctx.textAlign = 'center';

    // Header
    ctx.font = 'bold 26px monospace';
    ctx.fillText('*** CYATH REGISTER ***', 300, 58);
    ctx.font = '14px monospace';
    ctx.fillText('TERMINAL #01 // DESK OPERATOR', 300, 84);
    ctx.fillText(`DATE: ${activeDate}  ·  LEVEL: ${progress.level}`, 300, 106);

    ctx.font = '13px monospace';
    ctx.fillText('================================================', 300, 128);

    // Island Image
    const img = new (window as any).Image();
    img.crossOrigin = 'anonymous';
    img.src = currentIsland.pngImage || currentIsland.image;

    img.onload = () => {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 180, 145, 240, 240);

      ctx.font = 'bold 18px monospace';
      ctx.fillText(currentIsland.name.toUpperCase(), 300, 415);
      ctx.font = '13px monospace';
      ctx.fillText('------------------------------------------------', 300, 435);

      // Line Items
      ctx.textAlign = 'left';
      ctx.font = '15px monospace';
      const items = [
        `01. MORNING SUNLIGHT ....... ${isSunlightDone ? 'DONE (+15M)' : 'PENDING'}`,
        `02. PROTEIN FLOOR .......... ${proteinLogged}g / ${targetProtein}g`,
        `03. HYDRATION LOG .......... ${hydrationLogged} LITERS`,
        `04. DAY STREAK ............. ${streakCount} DAYS ${isForgedStreak ? '(FORGED)' : ''}`,
        `05. GUILD LEDGER ........... ${isSealed ? 'SEALED & VERIFIED' : 'PENDING STAMP'}`,
      ];

      items.forEach((item, idx) => {
        ctx.fillText(item, 50, 480 + idx * 42);
      });

      ctx.textAlign = 'center';
      ctx.font = '13px monospace';
      ctx.fillText('================================================', 300, 700);

      // Barcode simulation
      ctx.fillStyle = '#2B1F17';
      for (let x = 60; x < 540; x += (x % 5 === 0 ? 7 : (x % 3 === 0 ? 4 : 2))) {
        ctx.fillRect(x, 720, (x % 7 === 0 ? 3 : 1), 48);
      }

      ctx.font = '12px monospace';
      ctx.fillText(`AUTH HASH: CYATH-${activeDate.replace(/-/g, '')}-OK`, 300, 790);
      ctx.fillText('THANK YOU FOR YOUR DISCIPLINE', 300, 810);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          if (navigator.clipboard && navigator.clipboard.write) {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cyath-thermal-receipt-${activeDate}.png`;
            a.click();
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          }
        } catch {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cyath-thermal-receipt-${activeDate}.png`;
          a.click();
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }
      });
    };
  };

  // Sawtooth polygon for authentic torn thermal register receipt
  const sawtoothClip =
    'polygon(0% 10px, 2.5% 0px, 5% 10px, 7.5% 0px, 10% 10px, 12.5% 0px, 15% 10px, 17.5% 0px, 20% 10px, 22.5% 0px, 25% 10px, 27.5% 0px, 30% 10px, 32.5% 0px, 35% 10px, 37.5% 0px, 40% 10px, 42.5% 0px, 45% 10px, 47.5% 0px, 50% 10px, 52.5% 0px, 55% 10px, 57.5% 0px, 60% 10px, 62.5% 0px, 65% 10px, 67.5% 0px, 70% 10px, 72.5% 0px, 75% 10px, 77.5% 0px, 80% 10px, 82.5% 0px, 85% 10px, 87.5% 0px, 90% 10px, 92.5% 0px, 95% 10px, 97.5% 0px, 100% 10px, 100% calc(100% - 10px), 97.5% 100%, 95% calc(100% - 10px), 92.5% 100%, 90% calc(100% - 10px), 87.5% 100%, 85% calc(100% - 10px), 82.5% 100%, 80% calc(100% - 10px), 77.5% 100%, 75% calc(100% - 10px), 72.5% 100%, 70% calc(100% - 10px), 67.5% 100%, 65% calc(100% - 10px), 62.5% 100%, 60% calc(100% - 10px), 57.5% 100%, 55% calc(100% - 10px), 52.5% 100%, 50% calc(100% - 10px), 47.5% 100%, 45% calc(100% - 10px), 42.5% 100%, 40% calc(100% - 10px), 37.5% 100%, 35% calc(100% - 10px), 32.5% 100%, 30% calc(100% - 10px), 27.5% 100%, 25% calc(100% - 10px), 22.5% 100%, 20% calc(100% - 10px), 17.5% 100%, 15% calc(100% - 10px), 12.5% 100%, 10% calc(100% - 10px), 7.5% 100%, 5% calc(100% - 10px), 2.5% 100%, 0% calc(100% - 10px))';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="thermal-receipt-title"
      className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 select-none overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* 58mm Physical Thermal Register Slip */}
      <div
        className="w-full max-w-[340px] sm:max-w-[360px] bg-[#FBF8F1] text-[#2B1F17] py-7 px-5 sm:px-6 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(43,31,23,0.15)] flex flex-col items-center relative my-4 transition-transform duration-200"
        style={{ clipPath: sawtoothClip }}
      >
        {/* Close Icon in corner */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-3.5 w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 text-[#2B1F17] flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Close receipt"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Diagonal Stamped Red Ink Mark if Sealed */}
        {isSealed && (
          <div className="absolute top-24 -right-2 transform rotate-12 border-2 border-[#B91C1C] text-[#B91C1C] px-3 py-1 font-mono font-extrabold text-xs tracking-wider opacity-85 pointer-events-none rounded shadow-2xs">
            ★ VERIFIED &amp; SEALED ★
          </div>
        )}

        {/* Register Header */}
        <div className="flex flex-col items-center text-center font-mono w-full">
          <span className="text-xs font-extrabold tracking-wider uppercase text-[#2B1F17]">
            *** CYATH REGISTER ***
          </span>
          <span className="text-[11px] text-[#2B1F17]/75 mt-0.5">
            TERMINAL #01 // DESK OPERATOR
          </span>
          <div className="flex items-center justify-between w-full text-[11px] text-[#2B1F17]/80 mt-2 pt-1 border-t border-[#2B1F17]/25 font-bold">
            <span>{activeDate}</span>
            <span>LVL {progress.level}</span>
          </div>
          <div className="w-full font-mono text-[10px] text-[#2B1F17]/50 tracking-tighter truncate mt-0.5">
            ==============================================
          </div>
        </div>

        {/* Center Island Graphic in Thermal Frame */}
        <div className="w-36 h-36 relative my-3 flex items-center justify-center border border-[#2B1F17]/25 p-1 bg-white/40">
          <Image
            src={currentIsland.pngImage || currentIsland.image}
            alt={currentIsland.name}
            fill
            className="object-contain select-none"
            style={{ imageRendering: 'pixelated' }}
            unoptimized
          />
        </div>

        <span className="font-mono font-extrabold text-xs uppercase tracking-wider text-[#2B1F17]">
          {currentIsland.name}
        </span>

        <div className="w-full font-mono text-[10px] text-[#2B1F17]/50 tracking-tighter truncate my-1">
          ----------------------------------------------
        </div>

        {/* Dot-Matrix Line Items */}
        <div className="w-full flex flex-col gap-1.5 font-mono text-xs text-left my-1">
          <div className="flex items-center justify-between">
            <span className="text-[#2B1F17]/75">01. SUNLIGHT</span>
            <span className="font-bold">{isSunlightDone ? 'DONE (+15m)' : 'PENDING'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#2B1F17]/75">02. PROTEIN</span>
            <span className="font-bold">{proteinLogged}g / {targetProtein}g</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#2B1F17]/75">03. WATER</span>
            <span className="font-bold">{hydrationLogged} L</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#2B1F17]/75">04. STREAK</span>
            <span className="font-bold">{streakCount} DAYS {isForgedStreak ? '(FORGED)' : ''}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#2B1F17]/75">05. LEDGER</span>
            <span className={`font-bold ${isSealed ? 'text-[#065F46]' : 'text-amber-700'}`}>
              {isSealed ? 'SEALED' : 'OPEN'}
            </span>
          </div>
        </div>

        <div className="w-full font-mono text-[10px] text-[#2B1F17]/50 tracking-tighter truncate my-1">
          ==============================================
        </div>

        {/* Thermal Barcode Block */}
        <div className="w-full flex flex-col items-center my-2">
          <div className="w-48 h-10 flex items-center justify-between overflow-hidden opacity-85">
            {Array.from({ length: 42 }).map((_, idx) => (
              <div
                key={idx}
                className="h-full bg-[#2B1F17]"
                style={{
                  width: idx % 6 === 0 ? '4px' : idx % 3 === 0 ? '2px' : '1px',
                  marginRight: idx % 4 === 0 ? '2px' : '1px',
                }}
              />
            ))}
          </div>
          <span className="font-mono text-[9px] text-[#2B1F17]/70 mt-1 tracking-widest">
            AUTH-HASH: CYATH-{activeDate.replace(/-/g, '')}
          </span>
        </div>

        {/* Copy / Save Receipt Button */}
        <button
          type="button"
          onClick={handleCopyReceipt}
          className="mt-3 w-full py-2.5 px-3 rounded-lg bg-[#2B1F17] text-[#FAF8F5] font-mono font-bold text-xs hover:bg-[#433226] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 active:scale-98"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Receipt Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Thermal Receipt</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
