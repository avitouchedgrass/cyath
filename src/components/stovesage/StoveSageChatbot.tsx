'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { Recipe, findClosestRecipe } from '@/lib/recipes';
import { generateRetroFramedBadge } from '@/lib/imageStylizer';
import { Sparkles, X, RotateCcw, KeyRound, ArrowRight, Check, Send, Bot } from 'lucide-react';

interface ChatAction {
  type: 'ADD_HABIT' | 'ADD_RECIPE' | 'SET_METRIC' | 'LOG_RECIPE';
  summary: string;
  payload: any;
  status: 'pending' | 'applied' | 'dismissed';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: ChatAction[];
}

export function StoveSageChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [customKey, setCustomKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [isTourActive, setIsTourActive] = useState(false);

  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi! I am **Cyath AI Coach**, your meal and daily habit assistant.\n\nAsk me for high-protein recipe ideas, workout suggestions, or to update your daily planner directly.",
      actions: [],
    },
  ]);

  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    'Suggest a 45g protein dinner',
    'Add a 15-min morning stretch habit',
    'Log 2.5L water for today',
  ]);

  const {
    habits,
    userProfile,
    currentDate,
    getDailyLog,
    addCustomHabit,
    addCustomRecipe,
    setHydration,
    setSleep,
    setEnergy,
    setMood,
    setProtein,
    logRecipeToDay,
    activeProtocolIds,
    totalXp,
    streakCount,
  } = useHabitStore();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('cyath_gemini_api_key') || '';
      setCustomKey(savedKey);
    }
  }, []);

  // Global event listeners for opening coach & keyboard shortcuts (⌘J / Ctrl+J, ESC)
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
      retroAudio.playBlip();
    };

    const handleWalkthroughStart = () => {
      setIsOpen(false);
      setIsTourActive(true);
    };

    const handleWalkthroughEnd = () => {
      setIsTourActive(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with Cmd+J or Ctrl+J
      if ((e.metaKey || e.ctrlKey) && (e.key === 'j' || e.key === 'J')) {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) retroAudio.playBlip();
          return !prev;
        });
      }
      // Close on ESC
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('open-ai-coach', handleOpenEvent);
    window.addEventListener('stovesage-walkthrough-start', handleWalkthroughStart);
    window.addEventListener('stovesage-walkthrough-end', handleWalkthroughEnd);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-ai-coach', handleOpenEvent);
      window.removeEventListener('stovesage-walkthrough-start', handleWalkthroughStart);
      window.removeEventListener('stovesage-walkthrough-end', handleWalkthroughEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isLoading]);

  const executeAction = (action: {
    type: 'ADD_HABIT' | 'ADD_RECIPE' | 'SET_METRIC' | 'LOG_RECIPE';
    summary: string;
    payload: any;
  }) => {
    try {
      if (action.type === 'ADD_HABIT') {
        const title = action.payload.title || 'New Custom Habit';
        const category = action.payload.category || 'custom';
        addCustomHabit(title, category);
        retroAudio.playInspectConfirm();
      } else if (action.type === 'ADD_RECIPE') {
        const fallbackId = `ai-recipe-${Date.now()}`;
        const match = findClosestRecipe(action.payload);
        const spriteUrl = action.payload.sprite || match.spriteUrl;
        const framedImage = action.payload.image || spriteUrl;

        const newRecipe: Recipe = {
          id: action.payload.id || fallbackId,
          name: action.payload.name || 'Custom Chef Creation',
          subtitle: action.payload.subtitle || 'Formulated by Cyath AI',
          image: framedImage,
          calories: Number(action.payload.calories) || match.recipe.calories || 450,
          protein: Number(action.payload.protein) || match.recipe.protein || 35,
          carbs: Number(action.payload.carbs) || match.recipe.carbs || 30,
          fats: Number(action.payload.fats) || match.recipe.fats || 12,
          prepTimeMinutes: Number(action.payload.prepTimeMinutes) || 15,
          category: action.payload.category || match.recipe.category || 'High Protein',
          dietType: action.payload.dietType || match.recipe.dietType || 'omnivore',
          tags: action.payload.tags || ['High Protein', 'AI Spec'],
          focusScore: action.payload.focusScore || '9.5/10',
          description:
            action.payload.description ||
            `Nutrient-dense custom recipe formulated by Cyath AI Coach, calibrated to ${match.recipe.name}.`,
          ingredients:
            action.payload.ingredients && action.payload.ingredients.length > 0
              ? action.payload.ingredients
              : match.recipe.ingredients,
          instructions:
            action.payload.instructions && action.payload.instructions.length > 0
              ? action.payload.instructions
              : match.recipe.instructions,
          isCustom: true,
        };
        addCustomRecipe(newRecipe);
        retroAudio.playInspectConfirm();
      } else if (action.type === 'SET_METRIC') {
        const metric = action.payload.metric;
        const val = Number(action.payload.value);
        if (metric === 'hydration') setHydration(val);
        else if (metric === 'sleep') setSleep(val);
        else if (metric === 'energy') setEnergy(val);
        else if (metric === 'mood') setMood(val);
        else if (metric === 'protein') setProtein(val);
        retroAudio.playBlip();
      } else if (action.type === 'LOG_RECIPE') {
        logRecipeToDay(
          action.payload.recipeId,
          Number(action.payload.protein) || 30,
          Number(action.payload.calories) || 400
        );
        retroAudio.playInspectConfirm();
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleApplyAction = (messageId: string, actionIndex: number) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId || !msg.actions) return msg;
        const targetAction = msg.actions[actionIndex];
        if (!targetAction || targetAction.status !== 'pending') return msg;

        const success = executeAction(targetAction);
        const updatedActions = [...msg.actions];
        updatedActions[actionIndex] = {
          ...targetAction,
          status: success ? 'applied' : 'dismissed',
        };

        return { ...msg, actions: updatedActions };
      })
    );
  };

  const handleDismissAction = (messageId: string, actionIndex: number) => {
    retroAudio.playBlip();
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId || !msg.actions) return msg;
        const targetAction = msg.actions[actionIndex];
        if (!targetAction || targetAction.status !== 'pending') return msg;

        const updatedActions = [...msg.actions];
        updatedActions[actionIndex] = {
          ...targetAction,
          status: 'dismissed',
        };

        return { ...msg, actions: updatedActions };
      })
    );
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    retroAudio.playBlip();
    setInputQuery('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const todayLog = getDailyLog(currentDate);
      const habitsSummary = habits
        .map((h) => `${h.title} (${todayLog.habitsCompleted[h.id] ? 'Done' : 'Pending'})`)
        .join(', ');

      const userContext = {
        userName: userProfile?.fullName || 'Friend',
        primaryGoal: userProfile?.primaryGoal || 'Daily Well-Being',
        todayProteinLogged: todayLog.totalProteinLogged || 0,
        dailyProteinTarget: userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140,
        habitsSummary,
        activeProtocols: activeProtocolIds,
        totalXp,
        streakCount,
      };

      const res = await fetch('/api/ai/stovesage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          userContext,
          apiKey: customKey || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresKey) {
          setShowKeyInput(true);
        }
        throw new Error(data.error || 'Failed to reach AI Coach');
      }

      const pendingActions = await Promise.all(
        (data.actions || []).map(async (action: any) => {
          if (action.type === 'ADD_RECIPE' && action.payload) {
            const match = findClosestRecipe(action.payload);
            const spriteUrl = action.payload.sprite || match.spriteUrl;
            let framed = action.payload.image;
            if (!framed || framed.startsWith('/assets/')) {
              try {
                framed = await generateRetroFramedBadge(spriteUrl, 'CYATH · AI RECIPE');
              } catch {
                framed = spriteUrl;
              }
            }
            return {
              ...action,
              payload: {
                ...action.payload,
                sprite: spriteUrl,
                image: framed,
                closestRecipeName: action.payload.closestRecipeName || match.recipe.name,
              },
              status: 'pending' as 'pending' | 'applied' | 'dismissed',
            };
          }
          return {
            ...action,
            status: 'pending' as 'pending' | 'applied' | 'dismissed',
          };
        })
      );

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Your request has been processed.',
        actions: pendingActions,
      };

      setMessages((prev) => [...prev, botMessage]);
      if (data.suggestedPrompts && Array.isArray(data.suggestedPrompts)) {
        setSuggestedPrompts(data.suggestedPrompts);
      }
      retroAudio.playInspectConfirm();
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content: `**Notice:** ${err.message || 'Unable to connect to AI Coach.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = (keyVal: string) => {
    setCustomKey(keyVal);
    if (typeof window !== 'undefined') {
      if (keyVal.trim()) {
        localStorage.setItem('cyath_gemini_api_key', keyVal.trim());
      } else {
        localStorage.removeItem('cyath_gemini_api_key');
      }
    }
  };

  const resetChat = () => {
    retroAudio.playBlip();
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "Chat reset. How can I help with your meals, workouts, or daily habits today?",
        actions: [],
      },
    ]);
  };

  if (!mounted || isTourActive) return null;
  if (
    pathname === '/auth' ||
    pathname === '/login' ||
    pathname === '/onboarding' ||
    pathname.startsWith('/auth/')
  ) {
    return null;
  }

  const todayLog = getDailyLog(currentDate);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-auto select-none">
      
      {/* Expanded Professional Coach Modal / Drawer */}
      {isOpen && (
        <div className="relative mb-3 w-[92vw] sm:w-[440px] max-h-[82vh] h-[580px] bg-[#FFFDF9] border-3 border-[#1A3629] rounded-3xl shadow-[6px_6px_0px_#1A3629] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-[#FAF6EE] border-b-2 border-[#1A3629]/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#1A3629] text-[#FFFDF9] flex items-center justify-center font-bold text-sm shadow-[2px_2px_0px_#3A6B52] shrink-0">
                ✦
              </div>
              <div>
                <h3 className="font-cabinet font-bold text-sm text-[#1A3629] flex items-center gap-2 leading-none">
                  <span>Cyath AI Coach</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#1A3629]/20 bg-[#FAF6EE] text-[#1A3629]">
                    Online
                  </span>
                </h3>
                <span className="text-[11px] font-cabinet font-medium text-[#4A5D4E] mt-0.5 block">
                  Meals &amp; Habit Assistant
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={resetChat}
                className="w-7 h-7 rounded-lg border border-[#1A3629]/20 bg-[#FFFDF9] hover:bg-[#F4EDE0] text-[#1A3629] transition-colors flex items-center justify-center cursor-pointer"
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className={`w-7 h-7 rounded-lg border border-[#1A3629]/20 transition-colors flex items-center justify-center cursor-pointer ${
                  showKeyInput ? 'bg-[#1A3629] text-[#FFFDF9]' : 'bg-[#FFFDF9] hover:bg-[#F4EDE0] text-[#1A3629]'
                }`}
                title="Configure custom API key (optional)"
                aria-label="API Key settings"
              >
                <KeyRound className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setIsOpen(false);
                }}
                className="w-7 h-7 rounded-full border border-[#1A3629]/30 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629] font-mono text-xs font-bold transition-colors flex items-center justify-center cursor-pointer ml-1"
                aria-label="Close AI Coach"
              >
                ✕
              </button>
            </div>
          </div>

          {/* User Telemetry Context Ribbon */}
          <div className="px-4 py-1.5 bg-[#FAF6EE]/80 border-b border-[#1A3629]/10 flex items-center justify-between text-[10px] font-mono text-[#4A5D4E]">
            <span>Goal: {userProfile?.primaryGoal || 'Focus'}</span>
            <span>Protein: {todayLog.totalProteinLogged || 0}g Logged</span>
          </div>

          {/* Optional Custom API Key Drawer */}
          {showKeyInput && (
            <div className="p-3.5 bg-[#FAF6EE] border-b-2 border-[#1A3629]/20 text-xs font-cabinet flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1A3629]">Custom Gemini API Key (Optional)</span>
                <span className="text-[10px] font-mono text-[#4A5D4E]">Overrides system key</span>
              </div>
              <input
                type="password"
                value={customKey}
                onChange={(e) => handleSaveApiKey(e.target.value)}
                placeholder="Leave blank to use Cyath's default key"
                className="w-full px-3 py-1.5 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] text-xs font-mono text-[#1A3629] focus:outline-none"
              />
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin">
            {messages.map((msg) => {
              const isBot = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm font-cabinet leading-relaxed ${
                      isBot
                        ? 'bg-[#FAF6EE] border-2 border-[#1A3629]/25 text-[#1A3629] rounded-tl-xs shadow-xs'
                        : 'bg-[#1A3629] text-[#FFFDF9] rounded-tr-xs shadow-md'
                    }`}
                  >
                    <div className="space-y-1.5 whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    {/* Interactive Action Confirmation Cards */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#1A3629]/15 flex flex-col gap-2.5">
                        {msg.actions.map((act, i) => {
                          if (act.type === 'ADD_RECIPE' && act.payload) {
                            return (
                              <div
                                key={i}
                                className="flex flex-col gap-2.5 p-3 rounded-2xl border-2 border-[#1A3629] bg-[#FAF6EE] shadow-[3px_3px_0px_#1A3629]"
                              >
                                <div className="flex items-start gap-3">
                                  {/* Retro Card Format Sprite Enclosure (AI Scanner format) */}
                                  <div className="relative w-24 h-24 shrink-0 rounded-2xl border-2 border-[#1A3629] overflow-hidden bg-[#FFFDF9] shadow-[2px_2px_0px_#1A3629] flex flex-col items-center justify-between p-1.5">
                                    <div className="w-full flex-1 flex items-center justify-center bg-[#FAF6EE]/80 rounded-xl overflow-hidden relative">
                                      <img
                                        src={act.payload.sprite || act.payload.image || '/assets/food/grain-bowl-1.0.png'}
                                        alt={act.payload.name || 'AI Recipe'}
                                        className="w-full h-full object-contain [image-rendering:pixelated]"
                                      />
                                      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(26,54,41,0.06)_1px,transparent_1px)] bg-[size:100%_4px]" />
                                    </div>
                                    <div className="w-full flex items-center justify-between px-1 pt-1 border-t border-[#1A3629]/15 text-[8px] font-mono font-bold text-[#1A3629]">
                                      <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] border border-[#1A3629]" />
                                        <span>AI SPEC</span>
                                      </span>
                                      <span className="tracking-widest opacity-60">||||</span>
                                    </div>
                                  </div>

                                  {/* Recipe Manifest Info */}
                                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#10B981] text-[#FFFDF9] border border-[#1A3629]">
                                        AI Custom
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#FFFDF9] border border-[#1A3629] text-[#1A3629]">
                                        {act.payload.category || 'High Protein'}
                                      </span>
                                    </div>
                                    <h4 className="font-cabinet font-bold text-xs sm:text-sm text-[#1A3629] leading-tight truncate">
                                      {act.payload.name || 'Custom Plate'}
                                    </h4>
                                    <p className="text-[11px] font-cabinet font-medium text-[#4A5D4E] line-clamp-1">
                                      {act.payload.subtitle || 'Formulated by Cyath AI Coach'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono font-bold text-[#1A3629]">
                                      <span className="bg-[#FFFDF9] px-1.5 py-0.5 rounded border border-[#1A3629]/20">
                                        {act.payload.protein || 35}g Protein
                                      </span>
                                      <span className="text-[#4A5D4E]">
                                        {act.payload.calories || 450} kcal
                                      </span>
                                    </div>
                                    {act.payload.closestRecipeName && (
                                      <span className="text-[9px] font-mono text-[#3A6B52] mt-0.5 truncate">
                                        Matched: {act.payload.closestRecipeName}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {act.status === 'pending' && (
                                  <div className="flex items-center gap-2 pt-1 border-t border-[#1A3629]/15">
                                    <button
                                      type="button"
                                      onClick={() => handleApplyAction(msg.id, i)}
                                      className="flex-1 py-1.5 px-3 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] text-xs font-mono font-bold hover:-translate-y-0.5 active:translate-y-0 shadow-[2px_2px_0px_#3A6B52] transition-all cursor-pointer text-center"
                                    >
                                      + Add to My Recipes
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDismissAction(msg.id, i)}
                                      className="py-1.5 px-3 rounded-xl border border-[#1A3629]/30 hover:bg-[#FFFDF9] text-[#1A3629] text-xs font-mono font-bold transition-colors cursor-pointer"
                                    >
                                      Dismiss
                                    </button>
                                  </div>
                                )}
                                {act.status === 'applied' && (
                                  <div className="pt-1 border-t border-[#1A3629]/15 flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-md border border-[#10B981]/30">
                                      ✓ Added to My Recipes
                                    </span>
                                    <span className="text-[10px] font-mono text-[#4A5D4E]">
                                      Saved in Recipes Catalog
                                    </span>
                                  </div>
                                )}
                                {act.status === 'dismissed' && (
                                  <div className="pt-1 border-t border-[#1A3629]/15">
                                    <span className="text-[10px] font-mono font-bold text-[#4A5D4E] bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                                      Dismissed
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          }

                          return (
                            <div
                              key={i}
                              className="flex flex-col gap-2 p-2.5 rounded-xl border border-[#1A3629]/20 bg-[#FFFDF9] shadow-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-cabinet font-bold text-[#1A3629] leading-snug">
                                  {act.summary || `Proposed ${act.type}`}
                                </span>
                                {act.status === 'applied' && (
                                  <span className="text-[10px] font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-md border border-[#10B981]/30 shrink-0">
                                    ✓ Added
                                  </span>
                                )}
                                {act.status === 'dismissed' && (
                                  <span className="text-[10px] font-mono font-bold text-[#4A5D4E] bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200 shrink-0">
                                    Dismissed
                                  </span>
                                )}
                              </div>

                              {act.status === 'pending' && (
                                <div className="flex items-center gap-1.5 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleApplyAction(msg.id, i)}
                                    className="flex-1 py-1 px-3 rounded-lg border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] text-xs font-mono font-bold hover:-translate-y-0.5 active:translate-y-0 shadow-[2px_2px_0px_#3A6B52] transition-all cursor-pointer text-center"
                                  >
                                    {act.type === 'ADD_HABIT' ? '+ Add to Habits' : act.type === 'LOG_RECIPE' ? '✓ Quick Log' : 'Apply'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDismissAction(msg.id, i)}
                                    className="py-1 px-2.5 rounded-lg border border-[#1A3629]/30 hover:bg-[#FAF6EE] text-[#1A3629] text-xs font-mono font-bold transition-colors cursor-pointer"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-[#FAF6EE] border-2 border-[#1A3629]/20 rounded-2xl w-fit text-xs font-mono text-[#3A6B52]">
                <span className="animate-spin text-sm">✦</span>
                <span>Formulating personalized recommendation...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          {suggestedPrompts.length > 0 && !isLoading && (
            <div className="px-3 py-2 bg-[#FAF6EE]/60 border-t border-[#1A3629]/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="shrink-0 px-2.5 py-1 rounded-full border border-[#1A3629]/30 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629] text-[11px] font-cabinet font-bold transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-[#FFFDF9] border-t-2 border-[#1A3629]/15 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask for meals, habit ideas, or metric logging..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#FAF6EE] text-xs sm:text-sm font-cabinet text-[#1A3629] placeholder-[#1A3629]/50 focus:outline-none focus:bg-[#FFFDF9]"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputQuery.trim()}
              className="px-4 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] disabled:opacity-40 text-[#FFFDF9] font-cabinet font-bold text-xs sm:text-sm shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-y-[2px] transition-all cursor-pointer flex items-center gap-1"
              aria-label="Send message"
            >
              <span>Send</span>
              <Send className="w-3 h-3" />
            </button>
          </div>

        </div>
      )}

      {/* Sleek, Professional Floating Action Trigger Pill (Negative Style: Forest Green with White Text) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            retroAudio.playBlip();
            setIsOpen(true);
          }}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-[3px_3px_0px_#3A6B52] hover:shadow-[4px_4px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all cursor-pointer group select-none"
          aria-label="Open Cyath AI Coach (Cmd+J)"
          title="Open Cyath AI Coach (⌘J / Ctrl+J)"
        >
          <span className="font-cabinet font-bold text-xs text-[#FFFDF9]">✦ AI Coach</span>
          <span className="hidden sm:inline-block font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#2C4A3B] border border-[#FFFDF9]/20 text-[#A7F3D0]">
            ⌘J
          </span>
        </button>
      )}
    </div>
  );
}
