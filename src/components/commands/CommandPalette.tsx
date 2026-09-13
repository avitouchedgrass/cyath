'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { parseQuickLog, ParsedCommand } from '@/lib/quickLogParser';
import { MorningBootModal } from '@/components/dashboard/MorningBootModal';
import { EveningWrapModal } from '@/components/dashboard/EveningWrapModal';

interface CommandActionItem {
  id: string;
  category: 'RITUAL' | 'HABIT' | 'METRIC' | 'NAVIGATION' | 'AI';
  categoryLabel: string;
  glyph: string;
  title: string;
  description: string;
  badge: string;
  action: () => void | Promise<void>;
}

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const [isMorningOpen, setIsMorningOpen] = useState(false);
  const [isEveningOpen, setIsEveningOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    habits,
    currentDate,
    getDailyLog,
    toggleHabit,
    setProtein,
    setHydration,
    setSleep,
    setEnergy,
    setMood,
    acceptDailyProtocol,
    dailyProtocolsAcceptedByDate,
    logRecipeToDay,
    addCustomHabit,
  } = useHabitStore();

  const currentLog = getDailyLog(currentDate);
  const protocolAccepted = !!dailyProtocolsAcceptedByDate[currentDate];

  // Open & Close Event Listeners (Cmd+K / Ctrl+K, ESC, custom event)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) {
            retroAudio.playBlip();
            setQuery('');
            setSelectedIndex(0);
            setFeedbackMessage(null);
          }
          return !prev;
        });
      }

      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
      setQuery('');
      setSelectedIndex(0);
      setFeedbackMessage(null);
      retroAudio.playBlip();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, [isOpen]);

  // Autofocus when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Live Shorthand Token Parser (<1ms)
  const liveParsedCommand: ParsedCommand | null = useMemo(() => {
    if (!query.trim()) return null;
    return parseQuickLog(query, habits);
  }, [query, habits]);

  // All Curated Actions with Categories & Glyphs
  const defaultActions: CommandActionItem[] = useMemo(() => {
    const items: CommandActionItem[] = [];

    // 1. Desk Rituals & Protocols
    items.push({
      id: 'ritual-boot',
      category: 'RITUAL',
      categoryLabel: 'DESK RITUALS',
      glyph: '◈',
      title: 'Run Morning Boot Ritual',
      description: 'Align sleep, morning daylight, and target focus blocks',
      badge: 'RITUAL',
      action: () => {
        setIsOpen(false);
        setIsMorningOpen(true);
      },
    });

    items.push({
      id: 'ritual-wrap',
      category: 'RITUAL',
      categoryLabel: 'DESK RITUALS',
      glyph: '◈',
      title: 'Run Evening Desk Wrap',
      description: 'Review caffeine cutoff, whole food ratio, and seal daybook',
      badge: 'RITUAL',
      action: () => {
        setIsOpen(false);
        setIsEveningOpen(true);
      },
    });

    if (!protocolAccepted) {
      items.push({
        id: 'ritual-protocol',
        category: 'RITUAL',
        categoryLabel: 'DESK RITUALS',
        glyph: '◈',
        title: "Accept Today's Protocol Directive",
        description: 'Lock in today\'s evidence-based circadian challenge (+50 XP)',
        badge: '+50 XP',
        action: () => {
          acceptDailyProtocol(currentDate);
          retroAudio.playInspectConfirm();
          xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 8);
          setFeedbackMessage('Directive accepted and locked.');
          setTimeout(() => setIsOpen(false), 700);
        },
      });
    }

    // 2. Today's Incomplete Habits
    habits.forEach((h) => {
      const isDone = !!currentLog.habitsCompleted[h.id];
      if (!isDone) {
        items.push({
          id: `habit-${h.id}`,
          category: 'HABIT',
          categoryLabel: "TODAY'S CHECKLIST",
          glyph: '○',
          title: `Check off: ${h.title}`,
          description: `Mark complete for today's consistency streak`,
          badge: 'HABIT',
          action: () => {
            toggleHabit(h.id, currentDate);
            retroAudio.playInspectConfirm();
            xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 6);
            setFeedbackMessage(`Logged: ${h.title}`);
            setTimeout(() => setIsOpen(false), 700);
          },
        });
      }
    });

    // 3. Fast Metric Logging
    items.push({
      id: 'metric-pro-25',
      category: 'METRIC',
      categoryLabel: 'RAPID TELEMETRY',
      glyph: '+',
      title: 'Quick Add +25g Protein',
      description: `Current total: ${currentLog.totalProteinLogged}g -> ${currentLog.totalProteinLogged + 25}g`,
      badge: '+25G PRO',
      action: () => {
        setProtein(currentLog.totalProteinLogged + 25, currentDate);
        retroAudio.playInspectConfirm();
        xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 6);
        setFeedbackMessage('Added +25g protein.');
        setTimeout(() => setIsOpen(false), 700);
      },
    });

    items.push({
      id: 'metric-water-0.5',
      category: 'METRIC',
      categoryLabel: 'RAPID TELEMETRY',
      glyph: '+',
      title: 'Quick Add +0.5L Water',
      description: `Current total: ${currentLog.hydrationLiters}L -> ${(currentLog.hydrationLiters + 0.5).toFixed(1)}L`,
      badge: '+0.5L WATER',
      action: () => {
        setHydration(Number((currentLog.hydrationLiters + 0.5).toFixed(1)), currentDate);
        retroAudio.playInspectConfirm();
        xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 6);
        setFeedbackMessage('Added +0.5L hydration.');
        setTimeout(() => setIsOpen(false), 700);
      },
    });

    items.push({
      id: 'metric-sleep-8',
      category: 'METRIC',
      categoryLabel: 'RAPID TELEMETRY',
      glyph: '◷',
      title: 'Record 8.0h Sleep Duration',
      description: 'Set previous night recovery duration',
      badge: '8.0H SLEEP',
      action: () => {
        setSleep(8.0, currentDate);
        retroAudio.playInspectConfirm();
        xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 6);
        setFeedbackMessage('Logged 8.0h sleep duration.');
        setTimeout(() => setIsOpen(false), 700);
      },
    });

    items.push({
      id: 'metric-energy-8',
      category: 'METRIC',
      categoryLabel: 'RAPID TELEMETRY',
      glyph: '▲',
      title: 'Rate Daily Energy: Level 8 / 10',
      description: 'Record high vigor and steady alertness',
      badge: '8/10 VIGOR',
      action: () => {
        setEnergy(8, currentDate);
        retroAudio.playInspectConfirm();
        xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 6);
        setFeedbackMessage('Energy level recorded as 8/10.');
        setTimeout(() => setIsOpen(false), 700);
      },
    });

    // 4. Navigation
    items.push({
      id: 'nav-dashboard',
      category: 'NAVIGATION',
      categoryLabel: 'WORKSPACE NAVIGATION',
      glyph: '↗',
      title: 'Go to Dashboard Cockpit',
      description: 'Daily directives, telemetry dock, and habit checklist',
      badge: 'GOTO',
      action: () => {
        setIsOpen(false);
        router.push('/dashboard');
      },
    });

    items.push({
      id: 'nav-recipes',
      category: 'NAVIGATION',
      categoryLabel: 'WORKSPACE NAVIGATION',
      glyph: '↗',
      title: 'Browse Whole-Food Recipes',
      description: 'Explore high-protein catalog and portion scales',
      badge: 'GOTO',
      action: () => {
        setIsOpen(false);
        router.push('/recipes');
      },
    });

    items.push({
      id: 'nav-sanctuary',
      category: 'NAVIGATION',
      categoryLabel: 'WORKSPACE NAVIGATION',
      glyph: '↗',
      title: 'Open Daily Island Cockpit',
      description: 'Inspect full-screen floating ecosystem, habits, and circadian rhythm',
      badge: 'GOTO',
      action: () => {
        setIsOpen(false);
        router.push('/dashboard?tab=today');
      },
    });

    items.push({
      id: 'nav-protocols',
      category: 'NAVIGATION',
      categoryLabel: 'WORKSPACE NAVIGATION',
      glyph: '↗',
      title: 'View Circadian Protocols Matrix',
      description: 'Explore research-backed peer-reviewed protocols',
      badge: 'GOTO',
      action: () => {
        setIsOpen(false);
        router.push('/protocols');
      },
    });

    items.push({
      id: 'nav-correlations',
      category: 'NAVIGATION',
      categoryLabel: 'WORKSPACE NAVIGATION',
      glyph: '↗',
      title: 'Pattern Correlation Engine',
      description: 'Multi-variable lifestyle and energy curves',
      badge: 'GOTO',
      action: () => {
        setIsOpen(false);
        router.push('/correlations');
      },
    });

    items.push({
      id: 'nav-coach',
      category: 'NAVIGATION',
      categoryLabel: 'WORKSPACE NAVIGATION',
      glyph: '✦',
      title: 'Consult StoveSage AI Coach',
      description: 'Ask meal ideas or habit recommendations',
      badge: 'COACH',
      action: () => {
        setIsOpen(false);
        window.dispatchEvent(new CustomEvent('open-ai-coach'));
      },
    });

    items.push({
      id: 'action-walkthrough',
      category: 'NAVIGATION',
      categoryLabel: 'WORKSPACE NAVIGATION',
      glyph: '✦',
      title: 'Launch Interactive Pioneer Walkthrough',
      description: 'Step-by-step spotlight tour across cockpit, habits, fuel telemetry & AI coach',
      badge: 'TOUR',
      action: () => {
        setIsOpen(false);
        window.dispatchEvent(new CustomEvent('open-cyath-walkthrough'));
      },
    });

    return items;
  }, [
    habits,
    currentDate,
    currentLog,
    protocolAccepted,
    router,
    toggleHabit,
    setProtein,
    setHydration,
    setSleep,
    setEnergy,
    acceptDailyProtocol,
  ]);

  // Filter actions based on query
  const filteredActions: CommandActionItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return defaultActions;
    return defaultActions.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q)
    );
  }, [query, defaultActions]);

  // Group actions by category for rendering
  const groupedActions = useMemo(() => {
    const groups: { label: string; items: CommandActionItem[] }[] = [];
    filteredActions.forEach((item) => {
      let group = groups.find((g) => g.label === item.categoryLabel);
      if (!group) {
        group = { label: item.categoryLabel, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    });
    return groups;
  }, [filteredActions]);

  // Execute a parsed command
  const executeParsedCommand = async (cmd: ParsedCommand) => {
    switch (cmd.type) {
      case 'LOG_PROTEIN': {
        const amount = cmd.payload.amount;
        const newTotal = cmd.payload.isRelative
          ? currentLog.totalProteinLogged + amount
          : amount;
        setProtein(newTotal, currentDate);
        retroAudio.playInspectConfirm();
        xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 8);
        setFeedbackMessage(`Logged protein: ${newTotal}g (+${amount}g)`);
        setTimeout(() => setIsOpen(false), 700);
        break;
      }
      case 'LOG_HYDRATION': {
        const liters = cmd.payload.liters;
        const newTotal = cmd.payload.isRelative
          ? Number((currentLog.hydrationLiters + liters).toFixed(2))
          : liters;
        setHydration(newTotal, currentDate);
        retroAudio.playInspectConfirm();
        xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 8);
        setFeedbackMessage(`Logged hydration: ${newTotal}L (+${liters}L)`);
        setTimeout(() => setIsOpen(false), 700);
        break;
      }
      case 'LOG_SLEEP': {
        setSleep(cmd.payload.hours, currentDate);
        retroAudio.playInspectConfirm();
        xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 8);
        setFeedbackMessage(`Recorded sleep: ${cmd.payload.hours}h`);
        setTimeout(() => setIsOpen(false), 700);
        break;
      }
      case 'LOG_ENERGY': {
        setEnergy(cmd.payload.level, currentDate);
        retroAudio.playInspectConfirm();
        xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 8);
        setFeedbackMessage(`Energy level: ${cmd.payload.level}/10`);
        setTimeout(() => setIsOpen(false), 700);
        break;
      }
      case 'LOG_MOOD': {
        setMood(cmd.payload.score, currentDate);
        retroAudio.playInspectConfirm();
        xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 8);
        setFeedbackMessage(`Mindset score: ${cmd.payload.score}/10`);
        setTimeout(() => setIsOpen(false), 700);
        break;
      }
      case 'TOGGLE_HABIT': {
        toggleHabit(cmd.payload.habitId, currentDate);
        retroAudio.playInspectConfirm();
        xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 8);
        setFeedbackMessage(`Toggled habit`);
        setTimeout(() => setIsOpen(false), 700);
        break;
      }
      case 'TRIGGER_RITUAL': {
        setIsOpen(false);
        if (cmd.payload.ritual === 'morning-boot') setIsMorningOpen(true);
        if (cmd.payload.ritual === 'evening-wrap') setIsEveningOpen(true);
        break;
      }
      case 'ACCEPT_PROTOCOL': {
        acceptDailyProtocol(currentDate);
        retroAudio.playInspectConfirm();
        xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 8);
        setFeedbackMessage('Daily protocol directive locked in.');
        setTimeout(() => setIsOpen(false), 700);
        break;
      }
      case 'NAVIGATE': {
        setIsOpen(false);
        router.push(cmd.payload.path);
        break;
      }
      case 'TRIGGER_COACH': {
        setIsOpen(false);
        window.dispatchEvent(new CustomEvent('open-ai-coach'));
        break;
      }
      case 'AI_NATURAL_LANGUAGE': {
        await executeAiNaturalLanguage(cmd.payload.text);
        break;
      }
    }
  };

  // AI Natural Language Fallback
  const executeAiNaturalLanguage = async (text: string) => {
    setIsAiLoading(true);
    setFeedbackMessage('Consulting StoveSage natural language parser...');
    try {
      const response = await fetch('/api/ai/stovesage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Parse this food log or habit update and return matching structured dashboard actions: "${text}"`,
            },
          ],
          userContext: {
            todayProteinLogged: currentLog.totalProteinLogged,
            habitsSummary: habits.map((h) => h.title).join(', '),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('AI parser service unavailable');
      }

      const data = await response.json();
      if (data.actions && data.actions.length > 0) {
        let appliedCount = 0;
        for (const act of data.actions) {
          if (act.type === 'SET_METRIC') {
            const { metric, value } = act.payload;
            if (metric === 'protein') setProtein(value, currentDate);
            if (metric === 'hydration') setHydration(value, currentDate);
            if (metric === 'sleep') setSleep(value, currentDate);
            if (metric === 'energy') setEnergy(value, currentDate);
            if (metric === 'mood') setMood(value, currentDate);
            appliedCount++;
          } else if (act.type === 'LOG_RECIPE') {
            logRecipeToDay(act.payload.recipeId, act.payload.protein, act.payload.calories, currentDate);
            appliedCount++;
          } else if (act.type === 'ADD_HABIT') {
            addCustomHabit(act.payload.title, act.payload.category || 'custom');
            appliedCount++;
          }
        }

        retroAudio.playInspectConfirm();
        xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 12);
        setFeedbackMessage(`Logged ${appliedCount} action(s) via StoveSage Intelligence`);
        setTimeout(() => setIsOpen(false), 900);
      } else {
        setFeedbackMessage(data.reply ? `Advice: ${data.reply.slice(0, 70)}...` : 'Log processed.');
        setTimeout(() => setIsOpen(false), 1500);
      }
    } catch {
      setFeedbackMessage('Unable to parse with AI. Try direct syntax like "+30g pro".');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Keyboard navigation within palette
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      retroAudio.playBlip();
      setSelectedIndex((prev) => {
        const max = liveParsedCommand && liveParsedCommand.type !== 'AI_NATURAL_LANGUAGE'
          ? 0
          : filteredActions.length - 1;
        return prev >= max ? 0 : prev + 1;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      retroAudio.playBlip();
      setSelectedIndex((prev) => {
        const max = liveParsedCommand && liveParsedCommand.type !== 'AI_NATURAL_LANGUAGE'
          ? 0
          : filteredActions.length - 1;
        return prev <= 0 ? max : prev - 1;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (liveParsedCommand && liveParsedCommand.type !== 'AI_NATURAL_LANGUAGE') {
        executeParsedCommand(liveParsedCommand);
      } else if (liveParsedCommand && liveParsedCommand.type === 'AI_NATURAL_LANGUAGE') {
        executeParsedCommand(liveParsedCommand);
      } else if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].action();
      }
    }
  };

  if (!isOpen) {
    return (
      <>
        <MorningBootModal
          isOpen={isMorningOpen}
          onClose={() => setIsMorningOpen(false)}
        />
        <EveningWrapModal
          isOpen={isEveningOpen}
          onClose={() => setIsEveningOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] bg-[#1A3629]/35 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 md:pt-28 px-4 sm:px-6 transition-all animate-in fade-in duration-150"
        onClick={() => setIsOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Universal Command Palette"
      >
        <div
          className="w-full max-w-[640px] bg-[#FFFDF9] border border-[#1A3629]/15 shadow-[0_25px_60px_rgba(26,54,41,0.18)] rounded-3xl overflow-hidden flex flex-col max-h-[82vh] transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Search Bar */}
          <div className="px-5 py-4 bg-[#FAF8F5] border-b border-[#1A3629]/10 flex items-center gap-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-[#1A3629] text-[#FFFDF9] rounded-lg font-mono text-[11px] font-bold shadow-2xs shrink-0 select-none">
              <span>⌘</span>
              <span>K</span>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
                setFeedbackMessage(null);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Search or quick log (+30g pro, 2l water, sleep 8h)..."
              className="flex-1 bg-transparent text-[#1A3629] font-cabinet font-semibold text-base sm:text-lg placeholder:text-[#1A3629]/40 outline-none"
              disabled={isAiLoading}
            />

            <div className="flex items-center gap-2 shrink-0">
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-[#F4F0EA] border border-[#1A3629]/15 text-[10px] font-mono font-bold text-[#1A3629]/70 select-none">
                ESC
              </kbd>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full border border-[#1A3629]/15 flex items-center justify-center text-xs font-mono font-bold hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-colors"
                aria-label="Close Command Palette"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Feedback or Loading Notice */}
          {(feedbackMessage || isAiLoading) && (
            <div className="px-5 py-2.5 bg-[#FAF6EE] border-b border-[#1A3629]/10 flex items-center justify-between text-xs font-mono text-[#1A3629]">
              <span className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#1A3629] animate-pulse" />
                {feedbackMessage || 'Consulting StoveSage AI intelligence...'}
              </span>
              {isAiLoading && <span className="opacity-60 uppercase tracking-widest text-[10px]">PARSING</span>}
            </div>
          )}

          {/* Hero Live Parsed Card (Appears when Shorthand Token is Detected) */}
          {liveParsedCommand && (
            <div className="p-3.5 bg-[#FAF8F5] border-b border-[#1A3629]/10">
              <div
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedIndex === 0
                    ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-xs'
                    : 'bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF6EE] border-[#1A3629]/15 shadow-2xs'
                }`}
                onClick={() => executeParsedCommand(liveParsedCommand)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full font-bold ${
                      selectedIndex === 0
                        ? 'bg-[#FFFDF9]/15 text-[#FFFDF9] border border-[#FFFDF9]/30'
                        : 'bg-[#1A3629]/10 text-[#1A3629] border border-[#1A3629]/15'
                    }`}
                  >
                    {liveParsedCommand.badge}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold opacity-85">
                    <kbd className={`px-1.5 py-0.5 rounded text-[10px] ${
                      selectedIndex === 0 ? 'bg-[#FFFDF9]/20 text-[#FFFDF9]' : 'bg-[#1A3629] text-[#FFFDF9]'
                    }`}>
                      ↵
                    </kbd>
                    <span>COMMIT</span>
                  </div>
                </div>
                <div className="font-cabinet text-lg sm:text-xl font-bold">
                  {liveParsedCommand.title}
                </div>
                <div className="text-xs opacity-75 mt-0.5">
                  {liveParsedCommand.description}
                </div>
              </div>
            </div>
          )}

          {/* Categorized Scrollable Actions List */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-3 space-y-4 [scrollbar-width:thin] [scrollbar-color:#1A3629_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#1A3629]/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#1A3629]/40"
          >
            {filteredActions.length === 0 && !liveParsedCommand ? (
              <div className="py-12 px-4 text-center">
                <div className="font-mono text-xs uppercase tracking-widest text-[#1A3629]/50 mb-1">
                  NO EXACT MATCH
                </div>
                <p className="font-cabinet text-sm text-[#1A3629]/70">
                  Type a natural language log (e.g. &ldquo;ate 3 eggs and toast&rdquo;) to parse with StoveSage.
                </p>
              </div>
            ) : (
              groupedActions.map((group) => (
                <div key={group.label} className="space-y-1">
                  {/* Category Section Header */}
                  <div className="px-2 pt-1 pb-1 flex items-center gap-2 font-mono text-[10px] tracking-widest text-[#1A3629]/50 uppercase font-bold select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1A3629]/30" />
                    <span>{group.label}</span>
                  </div>

                  {/* Category Items */}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const itemGlobalIndex = filteredActions.findIndex((a) => a.id === item.id);
                      const isSelected =
                        !liveParsedCommand || liveParsedCommand.type === 'AI_NATURAL_LANGUAGE'
                          ? selectedIndex === itemGlobalIndex
                          : false;

                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
                            isSelected
                              ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-xs'
                              : 'bg-transparent border-transparent hover:bg-[#FAF8F5] text-[#1A3629]'
                          }`}
                          onClick={() => item.action()}
                          onMouseEnter={() => setSelectedIndex(itemGlobalIndex)}
                        >
                          {/* Left: Minimal Glyph Keycap & Title/Desc */}
                          <div className="flex items-center gap-3 min-w-0 pr-3">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-[#FFFDF9]/15 text-[#FFFDF9] border border-[#FFFDF9]/30'
                                  : 'bg-[#F4F0EA] text-[#1A3629] border border-[#1A3629]/15'
                              }`}
                            >
                              {item.glyph}
                            </div>
                            <div className="min-w-0">
                              <div className="font-cabinet font-bold text-sm truncate">
                                {item.title}
                              </div>
                              <div
                                className={`text-xs truncate ${
                                  isSelected ? 'text-[#FFFDF9]/75' : 'text-[#1A3629]/60'
                                }`}
                              >
                                {item.description}
                              </div>
                            </div>
                          </div>

                          {/* Right: Badge & Enter Glyph */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`font-mono text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full font-bold border transition-colors ${
                                isSelected
                                  ? 'border-[#FFFDF9]/30 bg-[#FFFDF9]/15 text-[#FFFDF9]'
                                  : 'border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629]/70'
                              }`}
                            >
                              {item.badge}
                            </span>
                            {isSelected && (
                              <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-[#FFFDF9]/20 text-[10px] font-mono font-bold text-[#FFFDF9]">
                                ↵
                              </kbd>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Refined Footer */}
          <div className="px-5 py-3 bg-[#FAF8F5] border-t border-[#1A3629]/10 flex items-center justify-between font-mono text-[11px] text-[#1A3629]/70 rounded-b-3xl select-none">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-[#F4F0EA] border border-[#1A3629]/15 text-[10px] font-bold text-[#1A3629]">
                  ↑↓
                </kbd>
                <span className="hidden sm:inline">Navigate</span>
              </span>
              <span className="text-[#1A3629]/30">·</span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-[#F4F0EA] border border-[#1A3629]/15 text-[10px] font-bold text-[#1A3629]">
                  ↵
                </kbd>
                <span className="hidden sm:inline">Select</span>
              </span>
              <span className="text-[#1A3629]/30">·</span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-[#F4F0EA] border border-[#1A3629]/15 text-[10px] font-bold text-[#1A3629]">
                  ESC
                </kbd>
                <span className="hidden sm:inline">Dismiss</span>
              </span>
            </div>
            <div className="font-bold tracking-wider text-[10px] text-[#1A3629]/50 uppercase hidden sm:block">
              CYATH POWER WORKSTATION
            </div>
          </div>
        </div>
      </div>

      <MorningBootModal
        isOpen={isMorningOpen}
        onClose={() => setIsMorningOpen(false)}
      />
      <EveningWrapModal
        isOpen={isEveningOpen}
        onClose={() => setIsEveningOpen(false)}
      />
    </>
  );
}
