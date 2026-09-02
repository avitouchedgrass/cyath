'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { RefreshCw, RotateCcw, Home, AlertOctagon } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app route error:', error);
  }, [error]);

  const handleClearCacheAndReset = () => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.clear();
        // Clear non-critical store cache if corrupted
        const keysToRemove = Object.keys(localStorage).filter((k) =>
          k.startsWith('cyath_user_progression_') || k === 'cyath-habit-store-v2'
        );
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {}
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] flex flex-col justify-between p-6 sm:p-10 font-cabinet">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <Logo />
        <span className="px-3 py-1 rounded-full border-2 border-[#1A3629] bg-[#FEF2F2] text-red-700 font-mono font-bold text-xs">
          ERROR 500 · RECOVERY
        </span>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-xl mx-auto my-auto py-8">
        <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[6px_6px_0px_#1A3629] rounded-3xl p-6 sm:p-10 text-center flex flex-col items-center">
          {/* 16-Bit Icon */}
          <div className="w-16 h-16 rounded-2xl border-3 border-[#1A3629] bg-[#FEF2F2] text-red-600 flex items-center justify-center shadow-[3px_3px_0px_#1A3629] mb-6">
            <AlertOctagon className="w-8 h-8 stroke-[2.5]" />
          </div>

          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#4A5D4E] block mb-1">
            System Glitch Intercepted
          </span>
          <h1 className="font-fraunces font-black text-2xl sm:text-3xl tracking-tight text-[#1A3629] mb-3">
            Something unexpected occurred
          </h1>
          <p className="text-sm font-medium text-[#2C4A3B] leading-relaxed max-w-md mb-6">
            Don&apos;t worry—your progress and data are safe. Cyath caught this runtime exception before it could affect your account.
          </p>

          {/* Diagnostic Code Box */}
          {error?.message && (
            <div className="w-full p-3.5 rounded-xl border-2 border-[#1A3629]/20 bg-[#F4F0EA] font-mono text-xs text-left mb-6 overflow-x-auto text-[#1A3629]">
              <span className="block font-bold text-[10px] text-[#4A5D4E] uppercase mb-1">Diagnostic Log:</span>
              <code className="text-[11px] leading-snug break-all">{error.message}</code>
              {error.digest && (
                <span className="block text-[10px] text-[#4A5D4E] mt-1">Digest: {error.digest}</span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="px-6 py-3 rounded-xl border-3 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] hover:bg-[#2C4A3B] font-bold text-xs shadow-[3px_3px_0px_#3A6B52] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>

            <button
              type="button"
              onClick={handleClearCacheAndReset}
              className="px-5 py-3 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] hover:bg-[#F4F0EA] font-bold text-xs shadow-[2px_2px_0px_#1A3629] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear Cache &amp; Reload</span>
            </button>

            <Link
              href="/"
              className="px-5 py-3 rounded-xl border-2 border-[#1A3629] bg-[#F4F0EA] text-[#1A3629] hover:bg-[#EFE9DF] font-bold text-xs shadow-[2px_2px_0px_#1A3629] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center font-mono text-xs text-[#4A5D4E] pt-4">
        <span>Cyath Anti-Crash Shield · Resilient Health Architecture</span>
      </footer>
    </div>
  );
}
