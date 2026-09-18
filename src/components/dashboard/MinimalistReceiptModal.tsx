'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useHabitStore } from '@/store/useHabitStore';
import { getIslandTier } from '@/lib/progression/config';
import { calculateLevel } from '@/lib/progression/engine';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { X, Copy, Check, Download, ShieldCheck } from 'lucide-react';

interface MinimalistReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MinimalistReceiptModal({ isOpen, onClose }: MinimalistReceiptModalProps) {
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
  const receiptCardRef = useRef<HTMLDivElement>(null);

  const currentLog = getDailyLog(currentDate);
  const progress = calculateLevel(totalXp);
  const currentIsland = getIslandTier(progress.level);

  const targetProtein = userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140;
  const isSunlightDone = !!currentLog.habitsCompleted?.['sunlight'];
  const proteinLogged = currentLog.totalProteinLogged || 0;
  const hydrationLogged = (currentLog.hydrationLiters || 0).toFixed(1);
  const isSealed = !!isLedgerSealedByDate[currentDate];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyImage = async () => {
    retroAudio.playInspectConfirm();
    haptics.success();

    // Render cleanly onto a 2D canvas for crisp export
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 640;
    canvas.height = 920;

    // Background paper
    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(0, 0, 640, 920);

    // Border
    ctx.strokeStyle = '#1A3629';
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, 608, 888);

    // Header
    ctx.fillStyle = '#1A3629';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CYATH · DAILY RECEIPT', 320, 70);

    ctx.font = 'bold 14px monospace';
    ctx.fillText(`DATE: ${currentDate.toUpperCase()} // LEVEL ${progress.level}`, 320, 100);

    // Divider line
    ctx.strokeStyle = '#1A3629';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.setLineDash([6, 4]);
    ctx.moveTo(40, 120);
    ctx.lineTo(600, 120);
    ctx.stroke();
    ctx.setLineDash([]);

    // Island Image render
    const img = new (window as any).Image();
    img.crossOrigin = 'anonymous';
    img.src = currentIsland.image;

    img.onload = () => {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 200, 140, 240, 240);

      // Island Name
      ctx.fillStyle = '#1A3629';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(currentIsland.name.toUpperCase(), 320, 410);

      // Metric lines
      ctx.textAlign = 'left';
      ctx.font = '16px monospace';

      const startY = 460;
      const spacing = 45;

      const lines = [
        `01. MORNING SUNLIGHT ....... ${isSunlightDone ? 'DONE (15 MINS)' : 'PENDING'}`,
        `02. DAILY PROTEIN .......... ${proteinLogged}g / ${targetProtein}g`,
        `03. WATER LOGGED ........... ${hydrationLogged} LITERS`,
        `04. CURRENT STREAK ......... ${streakCount} DAYS ${isForgedStreak ? '(FORGED)' : ''}`,
        `05. DAILY LEDGER ........... ${isSealed ? 'SEALED & VERIFIED' : 'OPEN'}`,
      ];

      lines.forEach((line, index) => {
        ctx.fillText(line, 60, startY + index * spacing);
      });

      // Barcode simulation
      ctx.fillStyle = '#1A3629';
      const barcodeY = 720;
      for (let x = 60; x < 580; x += (x % 7 === 0 ? 8 : (x % 3 === 0 ? 4 : 2))) {
        ctx.fillRect(x, barcodeY, (x % 5 === 0 ? 3 : 1), 60);
      }

      // Footer
      ctx.textAlign = 'center';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('CYATH.SPACE // HABIT SANCTUARY', 320, 820);
      ctx.fillText('VERIFIED OPERATOR RECORD', 320, 845);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          if (navigator.clipboard && navigator.clipboard.write) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          } else {
            // Fallback download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cyath-receipt-${currentDate}.png`;
            a.click();
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          }
        } catch {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cyath-receipt-${currentDate}.png`;
          a.click();
        }
      });
    };
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#1A3629]/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm bg-[#FAF8F5] border-2 border-[#1A3629] rounded-3xl p-6 shadow-[8px_8px_0px_#1A3629] flex flex-col items-center text-center gap-4 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Receipt Header */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#4A5D4E]">
            Daily Telemetry Audit
          </span>
          <h2 id="receipt-modal-title" className="font-cabinet font-extrabold text-xl text-[#1A3629] tracking-tight">
            Cyath Cadence Receipt
          </h2>
          <span className="font-mono text-xs text-[#1A3629]/70 mt-0.5">
            {currentDate} · Level {progress.level}
          </span>
        </div>

        {/* Center Island Render */}
        <div className="w-36 h-36 relative my-1 flex items-center justify-center">
          <Image
            src={currentIsland.image}
            alt={currentIsland.name}
            fill
            className="object-contain select-none drop-shadow-md"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        <span className="font-cabinet font-bold text-xs uppercase tracking-wider text-[#1A3629]">
          {currentIsland.name}
        </span>

        {/* Plain-English Line Items */}
        <div className="w-full border-t border-b border-dashed border-[#1A3629]/30 py-3 flex flex-col gap-2 font-mono text-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[#4A5D4E]">Morning Sunlight:</span>
            <span className="font-bold text-[#1A3629]">
              {isSunlightDone ? 'Done (15m)' : 'Pending'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#4A5D4E]">Daily Protein:</span>
            <span className="font-bold text-[#1A3629]">
              {proteinLogged}g / {targetProtein}g
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#4A5D4E]">Water Logged:</span>
            <span className="font-bold text-[#1A3629]">
              {hydrationLogged} Liters
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#4A5D4E]">Current Streak:</span>
            <span className="font-bold text-[#1A3629]">
              {streakCount} Days {isForgedStreak ? '(Forged)' : ''}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#4A5D4E]">Ledger Status:</span>
            <span className="font-bold text-[#065F46] bg-[#ECFDF5] px-1.5 py-0.5 rounded border border-[#10B981]/30">
              {isSealed ? 'Sealed & Verified' : 'Open'}
            </span>
          </div>
        </div>

        {/* 1-Tap Copy Action Button */}
        <button
          type="button"
          onClick={handleCopyImage}
          className="w-full py-3 px-4 rounded-2xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-all cursor-pointer shadow-[2px_2px_0px_#2C5E43] flex items-center justify-center gap-2 active:scale-98"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#10B981]" />
              <span>Receipt Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Receipt Image to Share</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
