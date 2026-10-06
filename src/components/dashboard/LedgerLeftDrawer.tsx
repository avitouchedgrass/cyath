'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { formatLocalDate } from '@/lib/dateUtils';
import { CorkboardBackdropSvg } from '@/components/dashboard/CorkboardBackdropSvg';
import { PixelPushpin } from '@/components/dashboard/PixelPushpin';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { downloadReceiptPng, shareReceiptImage, ReceiptExportData } from '@/lib/exporters/receiptCanvasExport';
import { getIslandTier } from '@/lib/progression/config';
import { calculateLevel } from '@/lib/progression/engine';
import { calculateBiometricXp } from '@/lib/biometricXp';
import { PixelScroll, PixelPin, PixelX, PixelCalendar, PixelDownload, PixelShare, PixelCheck, PixelBolt } from '@/components/common/PixelIcons';

interface LedgerLeftDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSeal: () => void;
}

const SAWTOOTH_CLIP =
  'polygon(0% 0%, 100% 0%, 100% calc(100% - 6px), 95% 100%, 90% calc(100% - 6px), 85% 100%, 80% calc(100% - 6px), 75% 100%, 70% calc(100% - 6px), 65% 100%, 60% calc(100% - 6px), 55% 100%, 50% calc(100% - 6px), 45% 100%, 40% calc(100% - 6px), 35% 100%, 30% calc(100% - 6px), 25% 100%, 20% calc(100% - 6px), 15% 100%, 10% calc(100% - 6px), 5% 100%, 0% calc(100% - 6px))';

export function LedgerLeftDrawer({
  isOpen,
  onClose,
  onOpenSeal,
}: LedgerLeftDrawerProps) {
  const { isLedgerSealedByDate, getDailyLog, userProfile, streakCount, totalXp } = useHabitStore();

  const todayStr = useMemo(() => formatLocalDate(), []);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [copiedShare, setCopiedShare] = useState(false);
  const [exportFormat, setExportFormat] = useState<'card' | 'story'>('card');

  useEffect(() => {
    const handleClose = () => {
      onClose();
    };
    window.addEventListener('cyath-close-drawers', handleClose);
    return () => window.removeEventListener('cyath-close-drawers', handleClose);
  }, [onClose]);

  // Generate rolling 30 days
  const rollingDays = useMemo(() => {
    const list = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatLocalDate(d);
      const isSealed = !!isLedgerSealedByDate[dateStr];
      const log = getDailyLog(dateStr);
      list.push({
        dateStr,
        dayNumber: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        isToday: dateStr === todayStr,
        isSealed,
        isForged: !!log.isForgedReentry,
      });
    }
    return list;
  }, [isLedgerSealedByDate, getDailyLog, todayStr]);

  const selectedLog = getDailyLog(selectedDateStr);
  const isSelectedDateSealed = !!isLedgerSealedByDate[selectedDateStr];

  const handleSelectDay = (dateStr: string) => {
    retroAudio.playPaperRustle();
    haptics.tap();
    setSelectedDateStr(dateStr);
  };

  const progress = calculateLevel(totalXp);
  const currentIsland = getIslandTier(progress.level, userProfile?.selectedIslandSuite || userProfile?.archetype);

  const getArchivalExportData = (): ReceiptExportData => {
    const isSunlightDone = !!selectedLog.habitsCompleted?.['sunlight'];
    const sleepDuration = selectedLog.sleepHours || 8;
    const bDone = (selectedLog.totalProteinLogged || 0) >= 30;
    const lDone = (selectedLog.totalProteinLogged || 0) >= 70;
    const bioXp = calculateBiometricXp({
      sleepDurationHours: sleepDuration,
      sunlightSecured: isSunlightDone,
      breakfastDone: bDone,
      lunchDone: lDone,
      caffeineRespected: true,
      customHabitsCompletedCount: 0,
    });

    return {
      date: selectedDateStr,
      level: progress.level,
      islandName: currentIsland.name,
      islandImageUrl: currentIsland.pngImage || currentIsland.image,
      sleepDuration,
      sunlightDone: isSunlightDone,
      breakfastDone: bDone,
      breakfastFuel: '',
      lunchDone: lDone,
      lunchFuel: '',
      caffeineDone: true,
      caffeineTime: 'Before Cutoff',
      customHabitsCompletedCount: 0,
      sleepXp: bioXp.sleepXp,
      sunlightXp: bioXp.sunlightXp,
      breakfastXp: bioXp.breakfastXp,
      lunchXp: bioXp.lunchXp,
      caffeineXp: bioXp.caffeineXp,
      customHabitsXp: bioXp.customHabitsXp,
      baseSealXp: bioXp.baseSealXp,
      totalXp: bioXp.totalXp,
      format: exportFormat,
      isDownscaled: !!selectedLog.isDownscaled,
    };
  };

  const handleDownloadReceipt = async () => {
    retroAudio.playInspectConfirm();
    haptics.tap();
    useHabitStore.getState().unlockTrophy('thermal_receipt');
    const filename = exportFormat === 'story'
      ? `cyath-story-${selectedDateStr}.png`
      : `cyath-archival-${selectedDateStr}.png`;
    await downloadReceiptPng(getArchivalExportData(), filename, exportFormat);
  };

  const handleShareReceipt = async () => {
    retroAudio.playInspectConfirm();
    haptics.tap();
    useHabitStore.getState().unlockTrophy('thermal_receipt');
    const res = await shareReceiptImage(getArchivalExportData(), exportFormat);
    if (res.method === 'native') return;

    const shareText = `Cyath Daily ${exportFormat === 'story' ? 'Story (9:16)' : 'Summary'} · ${selectedDateStr}\n` +
      `• Sleep: ${selectedLog.sleepHours || 8}h\n` +
      `• Morning Sunlight: ${selectedLog.habitsCompleted?.['sunlight'] ? 'Done' : 'Skipped'}\n` +
      `• Protein: ${selectedLog.totalProteinLogged || 80}g\n` +
      `• Water: ${selectedLog.hydrationLiters || 2.5}L\n` +
      `Saved to Cyath Daily Log.\n` +
      `Track your habits at cyath.space`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {}
  };

  const sealedCount = Object.values(isLedgerSealedByDate).filter(Boolean).length;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 pointer-events-none ${
          isOpen ? 'bg-black/40 backdrop-blur-xs pointer-events-auto' : 'bg-transparent'
        }`}
        onClick={onClose}
      />

      {/* Main Drawer Sliding from LEFT */}
      <aside
        id="tour-ledger-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Daily Log Book"
        className={`fixed top-0 left-0 bottom-0 z-50 w-full sm:max-w-2xl md:max-w-3xl bg-[#2A1E17] border-r-2 border-[#1A120D] shadow-[16px_0_40px_rgba(10,7,5,0.4)] transition-transform duration-300 ease-out flex flex-col justify-between overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Ledger Header */}
        <div className="w-full flex items-center justify-between px-6 py-4 border-b-2 border-[#1A120D] bg-[#3D2E24] text-[#FFFDF9] z-10">
          <div className="flex items-center gap-3">
            <PixelScroll size={16} color="#FFFDF9" />
            <div className="flex flex-col">
              <span className="font-cabinet font-extrabold text-sm tracking-wide uppercase">
                Daily Log Book
              </span>
              <span className="font-mono text-[10px] text-[#C5B5A0]">
                30-Day History · {sealedCount} Days Logged
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-[#E5D7C3] bg-[#2A1E17] px-3 py-1 rounded-full border border-[#523E30]">
              Streak: {streakCount} Days
            </span>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-[#523E30] bg-[#2A1E17] text-[#FFFDF9] hover:bg-[#1A120D] transition-colors cursor-pointer"
              aria-label="Close ledger drawer"
            >
              <PixelX size={14} />
            </button>
          </div>
        </div>

        {/* Content: Corkboard Artboard Canvas */}
        <div className="relative flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-6">
          <CorkboardBackdropSvg />

          {/* Foreground content over corkboard */}
          <div className="relative z-10 flex flex-col gap-6">
            
            {/* 30-Day Pinned Mini-Receipt Grid / Timeline */}
            <div className="bg-[#FFFDF9]/95 border-2 border-[#1A3629] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#1A3629] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-cabinet font-extrabold text-xs uppercase tracking-wider text-[#1A3629] flex items-center gap-1.5">
                  <PixelCalendar size={14} />
                  <span>30-Day History</span>
                </span>
                <span className="font-mono text-[10px] text-[#4A5D4E]">
                  Select a date to view your daily summary
                </span>
              </div>

              {/* 30 Calendar Chips */}
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                {rollingDays.map((d) => (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => handleSelectDay(d.dateStr)}
                    className={`relative p-2 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      selectedDateStr === d.dateStr
                        ? 'border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#2C5E43]'
                        : d.isSealed
                        ? 'border-[#1A3629]/30 bg-[#E8F5E9] text-[#1A3629] hover:bg-[#C8E6C9]'
                        : 'border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629]/60 hover:bg-[#FAF6EE]'
                    }`}
                  >
                    {/* Mini pushpin indicator if sealed */}
                    {d.isSealed && (
                      <span className="absolute -top-1.5 -right-1 drop-shadow-xs">
                        <PixelPin size={10} color="#EF4444" />
                      </span>
                    )}

                    <span className="font-mono text-[9px] uppercase leading-none opacity-80">
                      {d.dayOfWeek}
                    </span>
                    <span className="font-mono text-xs font-bold leading-none">
                      {d.dayNumber}
                    </span>
                    {d.isToday && (
                      <span className="w-1 h-1 rounded-full bg-amber-500 mt-0.5" title="Today" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Pinned Receipt Display Area */}
            <div className="flex justify-center items-center py-2">
              {isSelectedDateSealed ? (
                <>
                  {/* Actual Pinned Receipt */}
                  <div
                    className="w-full max-w-sm bg-[#FFFDF9] border-2 border-[#1A3629] p-6 shadow-[6px_8px_0px_#1A3629] relative animate-in zoom-in-95 duration-200"
                    style={{ clipPath: SAWTOOTH_CLIP }}
                  >
                    {/* Real Brass Pixel Pushpin at top */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2">
                      <PixelPushpin size={32} animate={false} />
                    </div>

                    <div className="flex flex-col gap-3 font-mono text-xs text-[#1A3629] pt-4">
                      <div className="border-b border-dashed border-[#1A3629]/25 pb-2 text-center">
                        <span className="font-bold uppercase tracking-wider text-xs block">
                          Cyath Daily Summary
                        </span>
                        <span className="text-[10px] text-[#4A5D4E]">{selectedDateStr}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[#4A5D4E]">Sleep</span>
                        <span className="font-bold">{selectedLog.sleepHours || 8}h</span>
                      </div>

                      {selectedLog.isDownscaled && (
                        <div className="flex justify-between items-center text-amber-900 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-600/20">
                          <span>Focus Protocol</span>
                          <span className="text-[11px] font-mono flex items-center gap-1 text-amber-950 font-black">
                            <PixelBolt size={11} color="#B45309" />
                            <span>15m Sprint (Recovery)</span>
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-[#4A5D4E]">Morning Sunlight</span>
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          {selectedLog.habitsCompleted?.['sunlight'] && <PixelCheck size={11} color="#047857" />}
                          <span>{selectedLog.habitsCompleted?.['sunlight'] ? 'Done' : 'Skipped'}</span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[#4A5D4E]">Protein Target</span>
                        <span className="font-bold text-emerald-700">
                          {selectedLog.totalProteinLogged || 80}g Logged
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[#4A5D4E]">Water Intake</span>
                        <span className="font-bold">{selectedLog.hydrationLiters || 2.5}L</span>
                      </div>

                      <div className="border-t border-dashed border-[#1A3629]/25 pt-2 flex justify-between font-bold">
                        <span>Status</span>
                        <span className="text-emerald-700 uppercase">Logged &amp; Saved</span>
                      </div>
                    </div>
                  </div>

                  {/* Format Toggle (Card vs 9:16 Story) */}
                  <div className="flex items-center justify-between p-1 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/15 text-xs font-cabinet font-bold w-full max-w-sm mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setExportFormat('card');
                        retroAudio.playBlip();
                        haptics.tap();
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                        exportFormat === 'card'
                          ? 'bg-[#1A3629] text-[#FFFDF9] shadow-xs'
                          : 'text-[#4A5D4E] hover:text-[#1A3629]'
                      }`}
                    >
                      Card (2:3)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setExportFormat('story');
                        retroAudio.playBlip();
                        haptics.tap();
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
                        exportFormat === 'story'
                          ? 'bg-[#1A3629] text-[#FFFDF9] shadow-xs'
                          : 'text-[#4A5D4E] hover:text-[#1A3629]'
                      }`}
                    >
                      <span>Story (9:16)</span>
                      <span className="font-mono text-[9px] px-1 py-0.2 bg-emerald-100 text-emerald-800 rounded">IG/TikTok</span>
                    </button>
                  </div>

                  {/* Share & Download Archival Record Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-sm mt-2">
                    <button
                      type="button"
                      onClick={handleDownloadReceipt}
                      className="w-full sm:w-1/2 py-3 px-3 rounded-2xl border-2 border-[#1A3629] bg-[#FAF8F5] text-[#1A3629] font-cabinet font-extrabold text-xs hover:bg-[#FAF6EE] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#1A3629]"
                    >
                      <PixelDownload size={14} />
                      <span>{exportFormat === 'story' ? 'Download Story' : 'Download PNG'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareReceipt}
                      className="w-full sm:w-1/2 py-3 px-3 rounded-2xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-extrabold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#2C5E43]"
                    >
                      <PixelShare size={14} />
                      <span>{copiedShare ? 'Copied!' : exportFormat === 'story' ? 'Share Story' : 'Share Card'}</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Unsealed Placeholder Note */
                <div
                  className="w-full max-w-sm bg-[#FAF6EE] border-2 border-dashed border-[#1A3629]/30 rounded-2xl p-8 flex flex-col items-center text-center gap-4 text-[#1A3629] shadow-sm"
                >
                  <PixelScroll size={32} color="#1A3629" />
                  <div className="flex flex-col gap-1">
                    <span className="font-cabinet font-extrabold text-base">
                      No Daily Log for {selectedDateStr}
                    </span>
                    <p className="font-sans text-xs text-[#4A5D4E]">
                      {selectedDateStr === todayStr
                        ? 'Today’s summary is ready to be saved. Complete your daily check-in to save it.'
                        : 'No daily log was recorded for this day.'}
                    </p>
                  </div>

                  {selectedDateStr === todayStr && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSeal();
                      }}
                      className="py-3 px-5 rounded-xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#2C5E43]"
                    >
                      <span>Check in Today Now →</span>
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Bottom Drawer Footer */}
        <div className="w-full px-6 py-3 border-t-2 border-[#1A120D] bg-[#3D2E24] text-[#C5B5A0] flex items-center justify-between font-mono text-[11px] z-10">
          <span>Daily History Archive</span>
          <span>Click outside or press ESC to exit</span>
        </div>
      </aside>
    </>
  );
}
