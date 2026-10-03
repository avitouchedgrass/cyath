'use client';

import React, { useState } from 'react';
import { DebriefQuestion } from '@/lib/debriefQuestions';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { PixelSpark } from '@/components/common/PixelSpark';
import { PixelX, PixelTrash, PixelPlus, PixelCheck, PixelAlert } from '@/components/common/PixelIcons';

interface CustomQuestionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  questions: DebriefQuestion[];
  onUpdateQuestions: (updated: DebriefQuestion[]) => void;
}

export function CustomQuestionManager({
  isOpen,
  onClose,
  questions,
  onUpdateQuestions,
}: CustomQuestionManagerProps) {
  const [newTitle, setNewTitle] = useState('');
  const [category, setCategory] = useState<DebriefQuestion['category']>('fuel');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    status: 'approved' | 'flagged';
    compliment?: string;
    reason?: string;
    alternativeSuggestion?: string;
    suggestedXp?: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    retroAudio.playBlip();
    haptics.tap();
    const updated = questions.map((q) => (q.id === id ? { ...q, enabled: !q.enabled } : q));
    onUpdateQuestions(updated);
  };

  const handleDelete = (id: string) => {
    retroAudio.playPaperRustle();
    haptics.tap();
    const updated = questions.filter((q) => q.id !== id);
    onUpdateQuestions(updated);
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isValidating) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch('/api/habits/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newTitle.trim(), category }),
      });

      const data = await res.json();
      setValidationResult(data);

      if (data.status === 'approved') {
        retroAudio.playTierUpgrade();
        haptics.heavy();
        const newQ: DebriefQuestion = {
          id: `custom_${Date.now()}`,
          title: newTitle.trim().replace(/^Did you /i, '').replace(/\?$/, ''),
          category,
          prompt: newTitle.trim().endsWith('?') ? newTitle.trim() : `${newTitle.trim()}?`,
          type: 'boolean',
          isDefault: false,
          enabled: true,
          xpReward: data.suggestedXp || 35,
          scientificContext: data.compliment || 'Custom intentional health practice.',
          aiCompliment: data.compliment,
        };

        const updated = [...questions, newQ];
        onUpdateQuestions(updated);
        setNewTitle('');
      } else {
        retroAudio.playBlip();
        haptics.tap();
      }
    } catch {
      // Fallback local approval
      const newQ: DebriefQuestion = {
        id: `custom_${Date.now()}`,
        title: newTitle.trim(),
        category,
        prompt: newTitle.trim().endsWith('?') ? newTitle.trim() : `${newTitle.trim()}?`,
        type: 'boolean',
        isDefault: false,
        enabled: true,
        xpReward: 35,
        scientificContext: 'Custom intentional daily practice.',
      };
      onUpdateQuestions([...questions, newQ]);
      setNewTitle('');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-[#1A3629]/50 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg max-h-[90vh] bg-[#FFFDF9] border-2 border-[#1A3629] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_#1A3629] flex flex-col gap-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A3629]/15 pb-4">
          <div className="flex flex-col">
            <h2 className="font-cabinet font-extrabold text-xl text-[#1A3629] tracking-tight">
              Customize Daily Questions
            </h2>
            <p className="text-xs text-[#4A5D4E] font-sans">
              Toggle default checkpoints or add your own AI-audited habits.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#1A3629]/20 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Close modal"
          >
            <PixelX size={14} />
          </button>
        </div>

        {/* Existing Question Deck */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 max-h-[42vh]">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E]">
            Active Question Deck ({questions.filter((q) => q.enabled).length} Enabled)
          </span>

          {questions.map((q) => (
            <div
              key={q.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                q.enabled
                  ? 'bg-[#FAF8F5] border-[#1A3629]/25 text-[#1A3629]'
                  : 'bg-black/5 border-dashed border-[#1A3629]/15 text-[#1A3629]/40 opacity-70'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggle(q.id)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    q.enabled
                      ? 'bg-[#1A3629] border-[#1A3629] text-[#FFFDF9]'
                      : 'bg-[#FFFDF9] border-[#1A3629]/30'
                  }`}
                  aria-label={q.enabled ? `Disable ${q.title}` : `Enable ${q.title}`}
                >
                  {q.enabled && <PixelCheck size={10} color="#FFFDF9" />}
                </button>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-cabinet font-bold text-xs truncate">
                      {q.title}
                    </span>
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded-xs bg-[#1A3629]/10 text-[#1A3629] shrink-0 font-bold">
                      +{q.xpReward} XP
                    </span>
                  </div>
                  <span className="font-sans text-[11px] text-[#4A5D4E] truncate">
                    {q.prompt}
                  </span>
                </div>
              </div>

              {!q.isDefault && (
                <button
                  type="button"
                  onClick={() => handleDelete(q.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Delete custom question"
                  aria-label={`Delete ${q.title}`}
                >
                  <PixelTrash size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add New Custom Habit Form with AI Validation */}
        <form onSubmit={handleAddCustom} className="border-t border-[#1A3629]/15 pt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-cabinet font-bold text-xs uppercase tracking-wider text-[#1A3629] flex items-center gap-1.5">
              <PixelSpark size={14} />
              <span>Add Custom Habit (AI Audited)</span>
            </span>
            <span className="font-mono text-[10px] text-[#4A5D4E]">
              Anti-XP-farming filter active
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Did you take 5g Creatine?"
              maxLength={60}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#1A3629]/20 bg-[#FAF8F5] text-xs font-cabinet font-bold text-[#1A3629] focus:outline-none focus:border-[#1A3629]"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="px-2.5 py-2.5 rounded-xl border border-[#1A3629]/20 bg-[#FAF8F5] text-xs font-mono font-bold text-[#1A3629] focus:outline-none focus:border-[#1A3629]"
            >
              <option value="fuel">Fuel</option>
              <option value="movement">Movement</option>
              <option value="recovery">Recovery</option>
              <option value="circadian">Circadian</option>
            </select>

            <button
              type="submit"
              disabled={isValidating || !newTitle.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {isValidating ? (
                <span className="animate-spin text-xs">⟳</span>
              ) : (
                <>
                  <PixelPlus size={14} />
                  <span>Audit</span>
                </>
              )}
            </button>
          </div>

          {/* AI Validation Feedback Banner */}
          {validationResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex flex-col gap-1 animate-in fade-in duration-150 ${
                validationResult.status === 'approved'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {validationResult.status === 'approved' ? (
                  <>
                    <PixelCheck size={16} color="#059669" className="shrink-0" />
                    <span>Habit Approved &amp; Added (+{validationResult.suggestedXp} XP)</span>
                  </>
                ) : (
                  <>
                    <PixelAlert size={16} color="#D97706" className="shrink-0" />
                    <span>XP-Farming Filter Flagged</span>
                  </>
                )}
              </div>
              <p className="font-sans text-[11px] leading-relaxed">
                {validationResult.status === 'approved'
                  ? validationResult.compliment
                  : validationResult.reason || validationResult.alternativeSuggestion}
              </p>
            </div>
          )}
        </form>

        {/* Footer Close */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/20 text-[#1A3629] font-cabinet font-bold text-xs hover:bg-[#1A3629]/5 transition-colors cursor-pointer"
        >
          Done &amp; Save Deck
        </button>
      </div>
    </div>
  );
}
