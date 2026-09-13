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
        <span className="px-3 py-1 rounded-full border border-red-200 bg-[#FEF2F2] text-red-700 font-mono font-bold text-xs">
          ERROR 500 · RECOVERY
        </span>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-xl mx-auto my-auto py-8">
        <div className="border border-[#1A3629]/15 bg-[#FFFDF9] shadow-[0_20px_50px_rgba(26,54,41,0.08)] rounded-3xl p-6 sm:p-10 text-center flex flex-col items-center">
          {/* Status Icon */}
          <div className="w-14 h-14 rounded-2xl border border-red-200 bg-[#FEF2F2] text-red-600 flex items-center justify-center mb-6">
            <AlertOctagon className="w-7 h-7 stroke-[2.5]" />
          </div>

          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#4A5D4E] block mb-1">
            System Glitch Intercepted
          </span>
          <h1 className="font-cabinet font-extrabold text-2xl sm:text-3xl tracking-tight text-[#1A3629] mb-3">
            Something unexpected occurred
          </h1>
          <p className="text-sm font-medium text-[#2C4A3B] leading-relaxed max-w-md mb-6">
            Don&apos;t worry—your progress and data are safe. Cyath caught this runtime exception before it could affect your account.
          </p>

          {/* Diagnostic Code Box */}
          {error?.message && (
            <div className="w-full p-3.5 rounded-2xl border border-[#1A3629]/15 bg-[#F4F0EA] font-mono text-xs text-left mb-6 overflow-x-auto text-[#1A3629]">
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
              className="px-6 py-3 rounded-full border border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] hover:bg-[#234535] font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>

            <button
              type="button"
              onClick={handleClearCacheAndReset}
              className="px-5 py-3 rounded-full border border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF6EE] font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear Cache &amp; Reload</span>
            </button>

            <Link
              href="/"
              className="px-5 py-3 rounded-full border border-[#1A3629]/20 bg-[#F4F0EA] text-[#1A3629] hover:bg-[#EAE3D2] font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
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
