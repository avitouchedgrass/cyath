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
        <div className="w-full max-w-lg p-8 rounded-3xl border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[6px_6px_0px_#1A3629] text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl border-3 border-[#1A3629] bg-[#FEF2F2] text-red-600 flex items-center justify-center font-mono font-black text-xl mb-4 shadow-[2px_2px_0px_#1A3629]">
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
              className="px-5 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-bold text-xs shadow-[2px_2px_0px_#3A6B52] cursor-pointer"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={handleHardReset}
              className="px-5 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#F4F0EA] text-[#1A3629] font-bold text-xs shadow-[2px_2px_0px_#1A3629] cursor-pointer"
            >
              Reset to Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
