import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] flex flex-col items-center justify-center p-6 text-center selection:bg-[#1A3629] selection:text-[#FFFDF9]">
      <div className="max-w-md w-full border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[6px_6px_0px_#1A3629] rounded-3xl p-8 flex flex-col items-center gap-6">
        
        {/* 16-Bit Mascot */}
        <div className="w-24 h-24 rounded-2xl border-2 border-[#1A3629] bg-[#F4F0EA] flex items-center justify-center p-3 shadow-inner">
          <Image
            src="/assets/stovesage.png"
            alt="StoveSage Lost"
            width={72}
            height={72}
            className="w-full h-full object-contain [image-rendering:pixelated]"
          />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full border border-[#1A3629] bg-[#FAF6EE] text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629] inline-block mb-3">
            Error 404 · Quest Uncharted
          </span>
          <h1 className="font-fraunces font-black text-3xl sm:text-4xl tracking-tight text-[#1A3629]">
            Lost in the Mists
          </h1>
          <p className="text-xs sm:text-sm font-cabinet font-medium text-[#2C4A3B] mt-2 leading-relaxed">
            The coordinate you requested has vanished or does not exist on the map.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2 border-t-2 border-[#1A3629]/15">
          <Link
            href="/dashboard"
            className="w-full py-3 px-4 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[3px_3px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all block text-center"
          >
            Open Daily Planner →
          </Link>
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-xl border-2 border-[#1A3629] bg-[#FAF6EE] text-[#1A3629] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all block text-center"
          >
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
