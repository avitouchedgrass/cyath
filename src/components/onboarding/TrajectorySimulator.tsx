'use client';

import React, { useState } from 'react';
import { TrajectoryPoint } from '@/lib/energyAuditEngine';
import { retroAudio } from '@/lib/retroAudio';

interface TrajectorySimulatorProps {
  points: TrajectoryPoint[];
  hoursLostPerDay: number;
  daysLostPerYear: number;
}

export function TrajectorySimulator({
  points,
  hoursLostPerDay,
  daysLostPerYear,
}: TrajectorySimulatorProps) {
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(1); // Default to Day 7

  // Coordinate mapping for SVG (viewBox 0 0 600 220)
  const width = 600;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const minDay = points[0]?.day || 1;
  const maxDay = points[points.length - 1]?.day || 90;

  const getX = (day: number) => {
    // Logarithmic-like non-linear spacing so Day 1-21 are prominent
    const progress = Math.log(day) / Math.log(maxDay);
    return paddingLeft + progress * chartWidth;
  };

  const getY = (score: number) => {
    // Scale 0 to 100
    const normalized = (score - 30) / (100 - 30);
    return paddingTop + (1 - normalized) * chartHeight;
  };

  // Build SVG path strings
  const baselinePath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.day)} ${getY(p.baseline)}`)
    .join(' ');

  const calibratedPoints = points.map((p) => ({
    x: getX(p.day),
    y: getY(p.calibrated),
  }));

  const calibratedPath = calibratedPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaPath = `
    ${calibratedPath}
    L ${calibratedPoints[calibratedPoints.length - 1].x} ${paddingTop + chartHeight}
    L ${calibratedPoints[0].x} ${paddingTop + chartHeight}
    Z
  `;

  const activeMilestone = points[selectedMilestoneIndex] || points[1];

  return (
    <div className="w-full rounded-2xl border border-[#1A3629]/20 bg-[#FFFDF9] p-4 sm:p-5">
      {/* Header & Clean Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-2 border-b border-[#1A3629]/15">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#1A3629]/60 font-bold block">
            90-DAY PROJECTION
          </span>
          <h3 className="font-fraunces font-bold text-lg text-[#1A3629] mt-0.5">
            Projected Daily Energy
          </h3>
        </div>

        <div className="text-xs font-mono text-[#4A5D4E]">
          Click any milestone to preview
        </div>
      </div>

      {/* SVG Trajectory Visualization */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          role="img"
          aria-label="Trajectory chart comparing unmitigated slump against Cyath protocol recovery"
        >
          <defs>
            <linearGradient id="calibratedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2D5A43" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2D5A43" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[40, 60, 80, 100].map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#1A3629"
                  strokeOpacity="0.08"
                  strokeDasharray="2 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="font-mono text-[9px] fill-[#1A3629]/40 font-bold"
                >
                  {level}%
                </text>
              </g>
            );
          })}

          {/* Calibrated Area Fill */}
          <path d={areaPath} fill="url(#calibratedFill)" />

          {/* Baseline Curve (Dashed rust) */}
          <path
            d={baselinePath}
            fill="none"
            stroke="#991B1B"
            strokeWidth="1.75"
            strokeDasharray="4 4"
            strokeOpacity="0.6"
          />

          {/* Calibrated Curve (Solid deep forest) */}
          <path
            d={calibratedPath}
            fill="none"
            stroke="#1A3629"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Milestone Nodes */}
          {points.map((p, idx) => {
            const isSelected = selectedMilestoneIndex === idx;
            const cx = getX(p.day);
            const cy = getY(p.calibrated);

            return (
              <g
                key={p.day}
                className="cursor-pointer"
                onClick={() => {
                  retroAudio.playBlip();
                  setSelectedMilestoneIndex(idx);
                }}
              >
                {/* Node Ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? '#1A3629' : '#FFFDF9'}
                  stroke={isSelected ? '#C9A84C' : '#1A3629'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="transition-all duration-150"
                />

                {/* X-Axis Day Label */}
                <text
                  x={cx}
                  y={paddingTop + chartHeight + 18}
                  textAnchor="middle"
                  className={`font-mono text-[10px] font-bold ${
                    isSelected ? 'fill-[#1A3629]' : 'fill-[#1A3629]/50'
                  }`}
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Trajectory Legend */}
      <div className="flex items-center justify-between pt-1 pb-2 border-b border-[#1A3629]/10 font-mono text-[11px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[#1A3629] font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1A3629]" />
            <span>With Daily Habits</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#991B1B]">
            <span className="w-2.5 h-0.5 border-t border-dashed border-[#991B1B]" />
            <span>Without Changes</span>
          </div>
        </div>
        <span className="text-[#1A3629]/50 text-[10px] hidden sm:inline">
          Tap nodes to inspect
        </span>
      </div>

      {/* Selected Milestone Detail Card */}
      {activeMilestone && (
        <div className="mt-3 p-3.5 rounded-xl border border-[#1A3629]/15 bg-[#FAF8F5] flex items-start gap-3">
          <div className="px-2 py-0.5 rounded bg-[#1A3629] text-[#FFFDF9] font-mono text-[10px] font-bold tracking-wider shrink-0 mt-0.5">
            {activeMilestone.label?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-cabinet font-bold text-sm text-[#1A3629]">
              {activeMilestone.milestoneTitle}
            </div>
            <p className="font-cabinet text-xs text-[#2C4A3B] mt-0.5 leading-relaxed">
              {activeMilestone.milestoneDesc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
