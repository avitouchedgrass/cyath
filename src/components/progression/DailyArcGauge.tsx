'use client';

import React from 'react';

interface DailyArcGaugeProps {
  completedCount: number;
  totalCount: number;
}

export function DailyArcGauge({ completedCount, totalCount }: DailyArcGaugeProps) {
  const percent = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;
  const [animatedPercent, setAnimatedPercent] = React.useState(0);

  const radius = 64;
  const circumference = Math.PI * radius;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercent(percent);
    }, 50);
    return () => clearTimeout(timer);
  }, [percent]);

  const strokeDashoffset = circumference - (animatedPercent / 100) * circumference;

  return (
    <div className="bg-[#FFFDF9] border-2 border-[#1A3629] rounded-2xl p-5 shadow-[3px_3px_0px_#1A3629] flex flex-col items-center">
      <div className="w-full flex items-center justify-between border-b border-[#1A3629]/15 pb-2 mb-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A3629]/70">
          Daily Momentum
        </span>
        <span className="font-mono text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#10B981]/30 tabular-nums">
          {percent}% Target
        </span>
      </div>

      <div className="relative w-44 h-26 flex flex-col items-center justify-end overflow-hidden mt-1">
        <svg viewBox="0 0 160 90" className="w-full h-full">
          {/* Background Arc Track */}
          <path
            d="M 16 80 A 64 64 0 0 1 144 80"
            fill="none"
            stroke="#EAE3D2"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Active Progress Arc */}
          <path
            d="M 16 80 A 64 64 0 0 1 144 80"
            fill="none"
            stroke="#10B981"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute bottom-1 flex flex-col items-center">
          <span className="font-cabinet text-3xl sm:text-4xl font-black text-[#1A3629] leading-none tabular-nums">
            {completedCount}/{totalCount}
          </span>
          <span className="font-cabinet text-xs font-bold text-[#4A5D4E] mt-1 tracking-tight">
            habits logged today
          </span>
        </div>
      </div>
    </div>
  );
}
