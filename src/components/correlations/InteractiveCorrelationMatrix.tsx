'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { retroAudio } from '@/lib/retroAudio';

export interface MatrixDataPoint {
  id: string;
  x: number; // e.g. Protein (g) or Sleep (h)
  y: number; // Focus / Energy (1-10)
  label: string;
}

interface InteractiveCorrelationMatrixProps {
  initialPoints?: MatrixDataPoint[];
  xLabel?: string;
  yLabel?: string;
  xUnit?: string;
  className?: string;
  onForecastChange?: (predictedFocus: number, simulatedX: number) => void;
}

const DEFAULT_POINTS: MatrixDataPoint[] = [
  { id: '1', x: 95, y: 5.4, label: 'Mon' },
  { id: '2', x: 115, y: 6.2, label: 'Tue' },
  { id: '3', x: 135, y: 7.1, label: 'Wed' },
  { id: '4', x: 150, y: 7.8, label: 'Thu' },
  { id: '5', x: 165, y: 8.6, label: 'Fri' },
  { id: '6', x: 180, y: 9.1, label: 'Sat' },
  { id: '7', x: 195, y: 9.5, label: 'Sun' },
];

export function InteractiveCorrelationMatrix({
  initialPoints = DEFAULT_POINTS,
  xLabel = 'Protein Fuel',
  yLabel = 'Focus Score',
  xUnit = 'g',
  className = '',
  onForecastChange,
}: InteractiveCorrelationMatrixProps) {
  const [points, setPoints] = useState<MatrixDataPoint[]>(initialPoints);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [simulatedX, setSimulatedX] = useState<number>(165);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute live statistical regression & correlation coefficient
  const stats = useMemo(() => {
    const n = points.length;
    if (n < 2) {
      return { m: 0.03, b: 2.5, r: 0.85, rSquared: 0.72, minX: 70, maxX: 220, minY: 1, maxY: 10 };
    }

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);

    const minX = Math.min(70, Math.min(...xs) - 10);
    const maxX = Math.max(220, Math.max(...xs) + 15);
    const minY = 1;
    const maxY = 10;

    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let denX = 0;
    let denY = 0;

    for (let i = 0; i < n; i++) {
      const dx = xs[i] - meanX;
      const dy = ys[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }

    const m = denX !== 0 ? num / denX : 0;
    const b = meanY - m * meanX;
    const r = denX > 0 && denY > 0 ? num / Math.sqrt(denX * denY) : 0.8;
    const rSquared = Math.max(0, Math.min(1, r * r));

    return { m, b, r, rSquared, minX, maxX, minY, maxY };
  }, [points]);

  // Live forecast based on simulated slider
  const predictedFocus = useMemo(() => {
    const val = stats.m * simulatedX + stats.b;
    return Math.max(1.0, Math.min(10.0, Number(val.toFixed(1))));
  }, [simulatedX, stats]);

  // Notify parent on change safely
  const onForecastChangeRef = useRef(onForecastChange);
  useEffect(() => {
    onForecastChangeRef.current = onForecastChange;
  }, [onForecastChange]);

  useEffect(() => {
    if (mounted && onForecastChangeRef.current) {
      onForecastChangeRef.current(predictedFocus, simulatedX);
    }
  }, [predictedFocus, simulatedX, mounted]);

  // Normalized percent position utilities (100% deterministic, zero SSR ref access)
  const getPercentCoords = useCallback(
    (xVal: number, yVal: number) => {
      const normX = Math.max(0, Math.min(1, (xVal - stats.minX) / (stats.maxX - stats.minX || 1)));
      const normY = Math.max(0, Math.min(1, (yVal - stats.minY) / (stats.maxY - stats.minY || 1)));

      const leftPct = normX * 80 + 10; // 10% to 90%
      const topPct = 100 - (normY * 74 + 13); // 13% to 87%

      return { leftPct, topPct };
    },
    [stats]
  );

  // Mouse & touch drag handlers
  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    setDraggingId(id);
    isDraggingRef.current = true;
    retroAudio.playBlip();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !draggingId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const padX = rect.width * 0.1;
    const padY = rect.height * 0.13;
    const plotW = rect.width * 0.8;
    const plotH = rect.height * 0.74;

    const clickX = e.clientX - rect.left - padX;
    const clickY = rect.height - (e.clientY - rect.top) - padY;

    const normX = Math.max(0, Math.min(1, clickX / plotW));
    const normY = Math.max(0, Math.min(1, clickY / plotH));

    const newX = Math.round(stats.minX + normX * (stats.maxX - stats.minX));
    const newY = Number((stats.minY + normY * (stats.maxY - stats.minY)).toFixed(1));

    setPoints((prev) =>
      prev.map((pt) => (pt.id === draggingId ? { ...pt, x: newX, y: newY } : pt))
    );

    // Audio pitch feedback
    retroAudio.playPitch(280 + newY * 55, 0.04);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setDraggingId(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSimulatedX(val);
    retroAudio.playPitch(320 + (val / 220) * 450, 0.03);
  };

  const resetPoints = () => {
    setPoints(initialPoints);
    setSimulatedX(165);
    retroAudio.playBlip();
  };

  // Trendline endpoints in SVG percentage coordinates
  const yStartVal = stats.m * stats.minX + stats.b;
  const yEndVal = stats.m * stats.maxX + stats.b;

  const y1Percent = 100 - (Math.max(0, Math.min(1, (yStartVal - stats.minY) / (stats.maxY - stats.minY || 1))) * 74 + 13);
  const y2Percent = 100 - (Math.max(0, Math.min(1, (yEndVal - stats.minY) / (stats.maxY - stats.minY || 1))) * 74 + 13);
  const simulatedLineX = Math.max(10, Math.min(90, ((simulatedX - stats.minX) / (stats.maxX - stats.minX || 1)) * 80 + 10));

  return (
    <div className={`flex flex-col gap-4 w-full select-none ${className}`}>
      
      {/* Live Regression Header Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] shadow-[3px_3px_0px_#1A3629]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1A3629] animate-pulse" />
          <span className="font-mono text-xs font-bold text-[#1A3629] uppercase tracking-wider">
            Live Physics Correlation Engine
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs font-bold">
          <div className="px-2.5 py-1 rounded-md bg-[#F4F0EA] border border-[#1A3629]/20 text-[#1A3629]">
            r = {stats.r >= 0 ? '+' : ''}{stats.r.toFixed(2)} ({Math.round(stats.rSquared * 100)}% Confidence)
          </div>
          <button
            type="button"
            onClick={resetPoints}
            className="text-[11px] underline hover:text-[#3A6B52] cursor-pointer text-[#1A3629]"
          >
            Reset Points
          </button>
        </div>
      </div>

      {/* 2D Interactive Physics Canvas Arena */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full h-64 sm:h-72 rounded-2xl border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[4px_4px_0px_#1A3629] p-4 overflow-hidden touch-none cursor-crosshair"
      >
        {/* SVG Grid Lines & Trendlines (100% Deterministic Percentage Coordinates) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <defs>
            <pattern id="matrix-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(26,54,41,0.06)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#matrix-grid)" />

          {/* Dynamic Linear Regression Trendline */}
          <line
            x1="10%"
            y1={`${y1Percent.toFixed(1)}%`}
            x2="90%"
            y2={`${y2Percent.toFixed(1)}%`}
            stroke="#1A3629"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="transition-all duration-75"
          />

          {/* Live Simulated Tracker Line */}
          <line
            x1={`${simulatedLineX.toFixed(1)}%`}
            y1="8%"
            x2={`${simulatedLineX.toFixed(1)}%`}
            y2="92%"
            stroke="#3A6B52"
            strokeWidth="2"
            strokeDasharray="3 3"
            className="opacity-70"
          />
        </svg>

        {/* Axis Labels */}
        <div className="absolute left-3 top-3 font-mono text-[10px] font-bold text-[#1A3629]/70 uppercase tracking-wider pointer-events-none">
          ↑ {yLabel} (1-10)
        </div>
        <div className="absolute right-3 bottom-2 font-mono text-[10px] font-bold text-[#1A3629]/70 uppercase tracking-wider pointer-events-none">
          {xLabel} ({xUnit}) →
        </div>

        {/* Interactive Draggable Data Point Nodes */}
        {points.map((pt) => {
          const isDragging = draggingId === pt.id;
          const isHovered = hoveredPointId === pt.id;
          const { leftPct, topPct } = getPercentCoords(pt.x, pt.y);

          return (
            <div
              key={pt.id}
              onPointerDown={(e) => handlePointerDown(pt.id, e)}
              onMouseEnter={() => {
                setHoveredPointId(pt.id);
                retroAudio.playBlip();
              }}
              onMouseLeave={() => setHoveredPointId(null)}
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute z-30 cursor-grab active:cursor-grabbing p-1.5 touch-none group transition-transform ${
                isDragging ? 'scale-125 z-40' : 'hover:scale-110'
              }`}
            >
              {/* Node Pill */}
              <div
                className={`w-6 h-6 rounded-full border-2 border-[#1A3629] flex items-center justify-center font-mono font-bold text-[10px] shadow-[2px_2px_0px_#1A3629] transition-colors ${
                  isDragging || isHovered
                    ? 'bg-[#1A3629] text-[#FFFDF9]'
                    : 'bg-[#FFFDF9] text-[#1A3629]'
                }`}
              >
                {pt.y.toFixed(0)}
              </div>

              {/* Floating Tooltip */}
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded-md border border-[#1A3629] bg-[#F4F0EA] text-[#1A3629] font-mono text-[9px] font-bold whitespace-nowrap shadow-[2px_2px_0px_#1A3629] pointer-events-none transition-opacity ${
                  isDragging || isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {pt.label}: {pt.x}{xUnit} · {pt.y}/10
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Predictive Simulation Slider */}
      <div className="p-4 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] shadow-[3px_3px_0px_#1A3629] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-xs font-bold text-[#1A3629] uppercase tracking-wider">
              Simulate Target {xLabel}:
            </span>
            <span className="font-mono text-sm font-black text-[#1A3629] tabular-nums">
              {simulatedX} {xUnit}
            </span>
          </div>
          <input
            type="range"
            min={stats.minX + 5}
            max={stats.maxX - 5}
            step={5}
            value={simulatedX}
            onChange={handleSliderChange}
            className="w-full accent-[#1A3629] cursor-pointer h-2 bg-[#F4F0EA] rounded-lg appearance-none"
          />
        </div>

        {/* Live Forecast Result Pill */}
        <div className="px-4 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#F4F0EA] text-[#1A3629] flex items-center justify-between sm:justify-center gap-3 shrink-0 shadow-[2px_2px_0px_#1A3629]">
          <span className="font-cabinet font-bold text-xs uppercase tracking-wider">
            Predicted {yLabel}:
          </span>
          <span className="font-mono text-base font-black tabular-nums text-[#1A3629]">
            {predictedFocus} / 10
          </span>
        </div>
      </div>

    </div>
  );
}
