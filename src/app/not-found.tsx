import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/ui/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] flex flex-col justify-between p-6 sm:p-10 font-cabinet selection:bg-[#1A3629] selection:text-[#FFFDF9]">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <Logo />
        <span className="px-3 py-1 rounded-full border-2 border-[#1A3629] bg-[#FEF2F2] text-red-700 font-mono font-bold text-xs">
          404 · NOT FOUND
        </span>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-lg mx-auto my-auto py-8">
        <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[6px_6px_0px_#1A3629] rounded-3xl p-8 sm:p-10 text-center flex flex-col items-center gap-6">
          
          {/* 16-Bit Mascot */}
          <div className="w-24 h-24 rounded-2xl border-3 border-[#1A3629] bg-[#F4F0EA] flex items-center justify-center p-3 shadow-[3px_3px_0px_#1A3629]">
            <Image
              src="/assets/stovesage.png"
              alt="Cyath AI Coach Mascot"
              width={72}
              height={72}
              className="w-full h-full object-contain [image-rendering:pixelated]"
            />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full border-2 border-[#1A3629] bg-[#FAF6EE] text-[11px] font-mono font-bold uppercase tracking-widest text-[#1A3629] inline-block mb-3">
              Error 404
            </span>
            <h1 className="font-fraunces font-black text-3xl sm:text-4xl tracking-tight text-[#1A3629]">
              Page Not Found
            </h1>
            <p className="text-sm font-medium text-[#2C4A3B] mt-2 leading-relaxed max-w-sm">
              The page you are looking for doesn&apos;t exist or may have been moved. Let&apos;s get you back on track.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2 border-t-2 border-[#1A3629]/15">
            <Link
              href="/dashboard"
              className="w-full py-3 px-4 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] hover:bg-[#2C4A3B] font-bold text-xs shadow-[3px_3px_0px_#3A6B52] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all block text-center cursor-pointer"
            >
              Open Daily Planner →
            </Link>
            <Link
              href="/recipes"
              className="w-full py-3 px-4 rounded-xl border-2 border-[#1A3629] bg-[#FAF6EE] text-[#1A3629] hover:bg-[#EFE9DF] font-bold text-xs shadow-[2px_2px_0px_#1A3629] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all block text-center cursor-pointer"
            >
              Browse Recipes
            </Link>
            <Link
              href="/"
              className="w-full py-3 px-4 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] hover:bg-[#F4F0EA] font-bold text-xs shadow-[2px_2px_0px_#1A3629] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all block text-center cursor-pointer"
            >
              Home
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center font-mono text-xs text-[#4A5D4E] pt-4">
        <span>Cyath · Science-Backed Daily Habit &amp; Nutrition Engine</span>
      </footer>
    </div>
  );
}
