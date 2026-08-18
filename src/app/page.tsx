'use client';

import React, { useState } from 'react';
import { HeaderNav } from "@/components/landing/HeaderNav";
import { PixelShowcase } from "@/components/landing/PixelShowcase";
import { TextType } from "@/components/reactbits/TextType";
import { SpecularButton } from "@/components/reactbits/SpecularButton";
import { AuthModal } from "@/components/auth/AuthModal";
import Link from "next/link";
import { Activity, Flame, Sparkles } from "lucide-react";

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const handleOpenAuth = (mode: 'login' | 'signup' = 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#0B0F17] overflow-hidden flex flex-col text-slate-100 selection:bg-white selection:text-black">
      {/* Background Radial Shaders */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(30, 41, 59, 0.35) 0%, transparent 60%),
            radial-gradient(circle at 80% 70%, rgba(15, 23, 42, 0.6) 0%, transparent 70%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.015) 0%, transparent 80%)
          `
        }}
      />

      {/* Dynamic Floating Navbar */}
      <HeaderNav onOpenAuth={handleOpenAuth} />

      {/* Main Hero Container */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 pt-28 sm:pt-36 pb-20">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Column: Frosted Glass Container (6 cols) */}
          <div className="lg:col-span-6 w-full">
            <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-3xl p-7 sm:p-10 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col items-start relative overflow-hidden">
              
              {/* Subtle top inner glow */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

              {/* Version Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md text-xs text-slate-300 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono tracking-tight">Behavioral Momentum Engine</span>
              </div>

              {/* Headline with Typewriter */}
              <div className="font-serif font-medium tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-[3.6rem] leading-[1.1] text-white min-h-[110px] sm:min-h-[135px]">
                <TextType
                  text={[
                    "Pixel-Perfect Health.",
                    "Calibrated for High Performance.",
                    "Behavioral Momentum Engineered."
                  ]}
                  typingSpeed={45}
                  deletingSpeed={25}
                  pauseDuration={2400}
                  startOnVisible={true}
                  cursorClassName="bg-white"
                />
              </div>
              
              {/* Editorial Subtext */}
              <p className="text-slate-400 max-w-lg text-sm sm:text-base mt-4 sm:mt-6 leading-relaxed font-sans">
                A retro-minimalist framework designed to build sustainable momentum. 
                Track physical habits, log macro-balanced recipes, and unlock correlations between your routines and real energy levels.
              </p>

              {/* CTA Button Group */}
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <SpecularButton 
                  size="lg" 
                  radius={20} 
                  intensity={1.3} 
                  blur={16}
                  onClick={() => handleOpenAuth('signup')}
                  className="w-full sm:w-auto text-sm sm:text-base"
                >
                  Get Started
                </SpecularButton>

                <Link 
                  href="/dashboard"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-[20px] backdrop-blur-md bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 text-slate-200 transition-all font-medium text-center inline-flex justify-center items-center text-sm sm:text-base h-[54px] sm:h-[58px]"
                >
                  Launch Guest Demo
                </Link>
              </div>

              {/* Quick Proof Stat Row */}
              <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-4 pt-6 border-t border-white/10 w-full">
                <div>
                  <div className="font-mono text-base sm:text-lg font-bold text-white">100%</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-sans">Monochrome Focus</div>
                </div>
                <div>
                  <div className="font-mono text-base sm:text-lg font-bold text-white">0 Ads</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-sans">Distraction-Free</div>
                </div>
                <div>
                  <div className="font-mono text-base sm:text-lg font-bold text-white">&lt; 30s</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-sans">Daily Check-In</div>
                </div>
              </div>

            </div>
          </div>

          {/* Hero Right Column: Full Span Scanner Pixel Art Arena (6 cols) */}
          <div className="lg:col-span-6 flex items-center justify-center w-full">
            <PixelShowcase />
          </div>

        </div>

        {/* Methodology Feature Section */}
        <section id="methodology" className="w-full max-w-7xl mx-auto mt-28 sm:mt-36 pt-16 border-t border-white/10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-2xl sm:text-4xl font-semibold text-white">
              The Architecture of Momentum
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              Built on behavioral psychology feedback loops: frictionless inputs yield clear correlation insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.04] transition-all">
              <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-serif font-semibold text-white mb-2">Monochrome Streak Heatmaps</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Visualize continuous consistency through white-opacity shades. Zero loud streaks or gamified guilt.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.04] transition-all">
              <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-serif font-semibold text-white mb-2">Subjective Energy Correlation</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Map daily hydration and protein targets against subjective mood and focus ratings on a 1–10 scale.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.04] transition-all">
              <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-serif font-semibold text-white mb-2">Pixel-Calibrated Fuel</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Curated macro-rich recipes represented by sharp 16-bit retro sprites. Clear nutrition without guesswork.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-white">Cyath</span>
            <span>— Pixel-Perfect Health</span>
          </div>
          <div>
            Built with Next.js, Supabase & Tailwind CSS
          </div>
        </div>
      </footer>

      {/* Interactive Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
