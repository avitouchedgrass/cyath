'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { Recipe } from '@/lib/recipes';

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Greetings! I am **StoveSage**, your culinary and metabolic wizard. Ask me for recipes, custom exercises, daily habit recommendations, or let me tweak your dashboard directly!",
      actions: [],
    },
  ]);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    'Add a 15-min stretch habit',
    'Suggest a 40g protein meal',
    'Log 2.5L water for today',
  ]);
  const [customKey, setCustomKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  const [isTourActive, setIsTourActive] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWalkthroughStart = () => {
      setIsOpen(false);
      setIsTourActive(true);
    };
    const handleWalkthroughEnd = () => {
      setIsTourActive(false);
    };
    window.addEventListener('stovesage-walkthrough-start', handleWalkthroughStart);
    window.addEventListener('stovesage-walkthrough-end', handleWalkthroughEnd);
    return () => {
      window.removeEventListener('stovesage-walkthrough-start', handleWalkthroughStart);
      window.removeEventListener('stovesage-walkthrough-end', handleWalkthroughEnd);
    };
  }, []);

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
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('cyath_gemini_api_key') || '';
      setCustomKey(savedKey);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
        const newRecipe: Recipe = {
          id: action.payload.id || fallbackId,
          name: action.payload.name || 'Enchanted Chef Creation',
          subtitle: action.payload.subtitle || 'Formulated by StoveSage',
          image: action.payload.image || '/assets/food/grilled-chicken-1.0.png',
          calories: Number(action.payload.calories) || 450,
          protein: Number(action.payload.protein) || 35,
          carbs: Number(action.payload.carbs) || 30,
          fats: Number(action.payload.fats) || 12,
          prepTimeMinutes: Number(action.payload.prepTimeMinutes) || 15,
          category: action.payload.category || 'High Protein',
          dietType: action.payload.dietType || 'omnivore',
          tags: action.payload.tags || ['High Protein', 'StoveSage Spec'],
          focusScore: action.payload.focusScore || '9.5/10',
          description: action.payload.description || 'Nutrient-dense recipe formulated by StoveSage.',
          ingredients: action.payload.ingredients || [{ item: 'Lean Protein Source', amount: '200g' }],
          instructions: action.payload.instructions || ['Prepare ingredients and cook with care.'],
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
        userName: userProfile?.fullName || 'Pilgrim',
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
        throw new Error(data.error || 'Failed to reach StoveSage');
      }

      // Do not automatically execute actions - present them to the user with a choice to Add or Dismiss
      const pendingActions = (data.actions || []).map((action: any) => ({
        ...action,
        status: 'pending' as 'pending' | 'applied' | 'dismissed',
      }));

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "A wave of magic surges! Your request has been forged.",
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
          content: `**Disturbance in the Ether:** ${err.message || 'Something went wrong.'}\n\n*Tip: If you entered a custom key with quota limits, you can clear it in the "API Key" menu to automatically use Cyath's default key.*`,
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

  if (isTourActive) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Expanded Chat Terminal */}
      {isOpen && (
        <div className="relative mb-3 w-[92vw] sm:w-[420px] max-h-[82vh] h-[560px] bg-[#FFFDF9] border-4 border-[#1A3629] rounded-3xl shadow-[8px_8px_0px_#1A3629] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-[#FAF6EE] border-b-2 border-[#1A3629]/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-12 shrink-0">
                <Image
                  src="/assets/stovesage.png"
                  alt="StoveSage"
                  fill
                  className="object-contain [image-rendering:pixelated]"
                />
              </div>
              <div>
                <h3 className="font-fraunces font-bold text-base text-[#1A3629] flex items-center gap-1.5 leading-none">
                  <span>StoveSage</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#1A3629]/20 bg-[#E8DECF]/80 text-[#3A6B52]">
                    AI Wizard
                  </span>
                </h3>
                <span className="text-[11px] font-cabinet font-medium text-[#2C4A3B] mt-0.5 block">
                  Metabolic & Culinary Companion
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-stovesage-walkthrough'));
                  setIsOpen(false);
                }}
                className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg border border-[#1A3629]/30 bg-[#FFFDF9] hover:bg-[#F4EDE0] text-[#1A3629] transition-colors cursor-pointer"
                title="Re-open site walkthrough"
              >
                Guide
              </button>

              <button
                type="button"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg border border-[#1A3629]/30 bg-[#FFFDF9] hover:bg-[#F4EDE0] text-[#1A3629] transition-colors cursor-pointer"
                title="Configure Gemini API Key"
              >
                API Key
              </button>

              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setIsOpen(false);
                }}
                className="w-7 h-7 rounded-full border border-[#1A3629]/30 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629] font-mono text-xs font-bold transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Close StoveSage Chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Optional Gemini API Key Drawer */}
          {showKeyInput && (
            <div className="p-3 bg-[#F4EDE0] border-b-2 border-[#1A3629]/20 text-xs font-cabinet flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1A3629]">Google Gemini API Key (Free)</span>
                <span className="text-[10px] font-mono text-[#3A6B52]">Stored in local browser</span>
              </div>
              <input
                type="password"
                value={customKey}
                onChange={(e) => handleSaveApiKey(e.target.value)}
                placeholder="AIzaSy... (free at aistudio.google.com)"
                className="w-full px-3 py-1.5 rounded-lg border-2 border-[#1A3629] bg-[#FFFDF9] text-xs font-mono text-[#1A3629] focus:outline-none"
              />
            </div>
          )}

          {/* Messages Scroll Area */}
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
                        ? 'bg-[#FAF6EE] border-2 border-[#1A3629]/30 text-[#1A3629] rounded-tl-sm shadow-sm'
                        : 'bg-[#1A3629] text-[#FFFDF9] rounded-tr-sm shadow-md'
                    }`}
                  >
                    {/* Render plain text or simple markdown formatting */}
                    <div className="space-y-1.5 whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    {/* Interactive Action Confirmation Cards */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#1A3629]/15 flex flex-col gap-2">
                        {msg.actions.map((act, i) => (
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
                                  Added
                                </span>
                              )}
                              {act.status === 'dismissed' && (
                                <span className="text-[10px] font-mono font-bold text-[#4A5D4E] bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200 shrink-0">
                                  Skipped
                                </span>
                              )}
                            </div>

                            {act.status === 'pending' && (
                              <div className="flex items-center gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleApplyAction(msg.id, i)}
                                  className="flex-1 py-1 px-2.5 rounded-lg border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] text-xs font-mono font-bold hover:-translate-y-0.5 active:translate-y-0 shadow-[2px_2px_0px_#3A6B52] transition-all cursor-pointer text-center"
                                >
                                  {act.type === 'ADD_HABIT' ? 'Add Habit' : act.type === 'ADD_RECIPE' ? 'Add Recipe' : 'Apply'}
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
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-[#FAF6EE] border-2 border-[#1A3629]/20 rounded-2xl w-fit text-xs font-mono text-[#3A6B52]">
                <span className="animate-spin text-base">✦</span>
                <span>StoveSage is consulting the culinary grimoire...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          {suggestedPrompts.length > 0 && !isLoading && (
            <div className="px-3 py-1.5 bg-[#FAF6EE]/50 border-t border-[#1A3629]/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
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
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask StoveSage to add habits or recipes..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#FAF6EE] text-xs sm:text-sm font-cabinet text-[#1A3629] placeholder-[#1A3629]/50 focus:outline-none focus:bg-[#FFFDF9]"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputQuery.trim()}
              className="px-4 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] disabled:opacity-40 text-[#FFFDF9] font-cabinet font-bold text-xs sm:text-sm shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-y-[2px] transition-all cursor-pointer"
            >
              Send
            </button>
          </div>

        </div>
      )}

      {/* Floating Corner Mascot Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            retroAudio.playBlip();
            setIsOpen(true);
          }}
          className="stovesage-launcher group relative flex items-center justify-center p-2 rounded-2xl border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[5px_5px_0px_#1A3629] hover:shadow-[6px_6px_0px_#1A3629] hover:-translate-y-1 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all cursor-pointer"
          aria-label="Open StoveSage AI Assistant"
        >
          <div className="relative w-12 h-16 sm:w-14 sm:h-18 transition-transform group-hover:scale-105">
            <Image
              src="/assets/stovesage.png"
              alt="StoveSage Floating Mascot"
              fill
              className="object-contain [image-rendering:pixelated] drop-shadow-[2px_2px_0px_rgba(26,54,41,0.2)]"
            />
          </div>

          {/* Dynamic Bubble Pill */}
          <span className="absolute -top-2.5 -left-2 sm:-left-3 font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#E8DECF] text-[#1A3629] px-2 py-0.5 rounded-full border border-[#1A3629] shadow-xs">
            AI Sage
          </span>

          {/* Pulse Indicator */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#10B981] border-2 border-[#FFFDF9] rounded-full animate-pulse" />
        </button>
      )}
    </div>
  );
}
