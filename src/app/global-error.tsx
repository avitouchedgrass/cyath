'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Fatal global layout error:', error);
  }, [error]);

  const handleHardReset = () => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.clear();
        localStorage.removeItem('cyath-habit-store-v2');
      } catch {}
      window.location.href = '/';
    }
  };

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F4F0EA] text-[#1A3629] flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-lg p-8 sm:p-10 rounded-3xl border border-[#1A3629]/15 bg-[#FFFDF9] shadow-[0_20px_50px_rgba(26,54,41,0.08)] text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl border border-red-200 bg-[#FEF2F2] text-red-600 flex items-center justify-center font-mono font-black text-xl mb-4">
            !
          </div>

          <h1 className="text-2xl font-black tracking-tight text-[#1A3629] mb-2">
            System Recovery Mode
          </h1>
          <p className="text-xs text-[#2C4A3B] leading-relaxed mb-6">
            A critical rendering interruption was intercepted by the Cyath global shield.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-full border border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] hover:bg-[#234535] font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={handleHardReset}
              className="px-5 py-2.5 rounded-full border border-[#1A3629]/20 bg-[#F4F0EA] text-[#1A3629] hover:bg-[#EAE3D2] font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              Reset to Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
