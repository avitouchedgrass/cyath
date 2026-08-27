'use client';

import React from 'react';
import { useHabitStore } from '@/store/useHabitStore';

export function HabitCalendarMini() {
  const { logsByDate, currentDate } = useHabitStore();

  const now = new Date(currentDate || new Date());
  const year = now.getFullYear();
  const month = now.getMonth();

  const monthName = now.toLocaleString('default', { month: 'short' });

  // First day of month (0 = Sunday, 1 = Monday)
  const firstDay = new Date(year, month, 1);
  const startingDay = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < startingDay; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  return (
    <div className="bg-[#FFFDF9] border-2 border-[#1A3629] rounded-2xl p-5 shadow-[3px_3px_0px_#1A3629] flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-[#1A3629]/15 pb-2">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A3629]/70 block">
            Calendar Heatmap
          </span>
          <h3 className="font-fraunces font-bold text-base text-[#1A3629] leading-tight">
            Habit Activity
          </h3>
        </div>
        <span className="font-mono text-xs text-[#1A3629] font-bold bg-[#FAF6EE] px-2 py-0.5 rounded-md border border-[#1A3629]/20">
          {monthName} {year}
        </span>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-[#1A3629]/60 font-bold pb-1">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysArray.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-7 w-full" />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const log = logsByDate[dateStr];
          const completedCount = log?.habitsCompleted
            ? Object.values(log.habitsCompleted).filter(Boolean).length
            : 0;

          const isToday = day === now.getDate();
          const hasActivity = completedCount > 0;

          return (
            <div
              key={dateStr}
              className={`h-7 w-full rounded-lg flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all ${
                hasActivity
                  ? completedCount >= 3
                    ? 'bg-[#1A3629] text-[#FFFDF9] shadow-[1px_1px_0px_#1A3629]'
                    : 'bg-[#A7F3D0] text-[#065F46] border border-[#1A3629]/30'
                  : isToday
                  ? 'border-2 border-[#1A3629] bg-[#ECFDF5] text-[#1A3629]'
                  : 'text-[#1A3629]/50 hover:bg-[#FAF6EE]'
              }`}
              title={`${dateStr}: ${completedCount} habits completed`}
            >
              <span>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
