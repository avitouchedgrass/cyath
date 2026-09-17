export type CircadianPhaseId =
  | 'photonic_reset'
  | 'peak_clarity'
  | 'postprandial_dip'
  | 'secondary_focus'
  | 'cortisol_winddown'
  | 'melatonin_gate';

export interface CircadianPhaseInfo {
  id: CircadianPhaseId;
  name: string;
  badgeLabel: string;
  timeRange: string;
  alertnessPercent: number;
  description: string;
  hourlyDirective: string;
  counterMeasure?: string;
  statusColor: 'emerald' | 'amber' | 'slate';
}

export interface CircadianCurvePoint {
  hourOfDay: number;
  timeLabel: string;
  alertnessScore: number;
  phaseId: CircadianPhaseId;
}

export interface CircadianMilestones {
  wakeTimeStr: string;
  bedtimeTargetStr: string;
  lightExposureWindow: { start: string; end: string; startMinutes: number; endMinutes: number };
  adenosineCaffeineBuffer: { end: string; endMinutes: number };
  caffeineHardCutoff: { cutoff: string; cutoffMinutes: number };
  digitalSunsetWindow: { start: string; startMinutes: number };
  solarNoonOffsetApprox: string;
  msUntilCaffeineCutoff: number;
  msUntilDigitalSunset: number;
  isCaffeinePermissible: boolean;
  isPastCaffeineCutoff: boolean;
  isLightWindowActive: boolean;
  isDigitalSunsetActive: boolean;
  dockPhase: 'morning' | 'midday' | 'evening';
}

export interface CircadianStatus {
  currentHour: number;
  currentMinute: number;
  wakeHour: number;
  wakeMinute: number;
  hoursSinceWake: number;
  currentPhase: CircadianPhaseInfo;
  alertnessScore: number;
  curvePoints: CircadianCurvePoint[];
  currentProgressFraction: number;
  milestones: CircadianMilestones;
}

const PHASES: Record<CircadianPhaseId, Omit<CircadianPhaseInfo, 'timeRange'>> = {
  photonic_reset: {
    id: 'photonic_reset',
    name: 'Photonic Reset & Cortisol Awakening',
    badgeLabel: 'PHOTONIC RESET',
    alertnessPercent: 65,
    description: 'Central clock resetting via natural lux. Adenosine baseline clearing.',
    hourlyDirective: 'Get 15m outdoor sunlight and hydrate. Delay caffeine to prevent the afternoon rebound.',
    counterMeasure: '15m sunlight + 500ml water',
    statusColor: 'amber',
  },
  peak_clarity: {
    id: 'peak_clarity',
    name: 'Peak Cognitive Clarity Window',
    badgeLabel: 'PEAK CLARITY',
    alertnessPercent: 95,
    description: 'Maximal prefrontal cortex activation and optimal reaction speed.',
    hourlyDirective: 'Prime biological window for high-leverage analytical work and deep focus.',
    counterMeasure: 'Eliminate interruptions; single-task deep work',
    statusColor: 'emerald',
  },
  postprandial_dip: {
    id: 'postprandial_dip',
    name: 'Adenosine & Postprandial Dip Window',
    badgeLabel: 'DIP WINDOW',
    alertnessPercent: 48,
    description: 'Natural circadian core body temperature dip compounded by digestive load.',
    hourlyDirective: 'Biological energy trough. Counter with 500ml water, light walking, or 35g protein anchor.',
    counterMeasure: '5m brisk walk + cold water; avoid heavy carbs',
    statusColor: 'amber',
  },
  secondary_focus: {
    id: 'secondary_focus',
    name: 'Secondary Focus & Executive Stride',
    badgeLabel: 'SECONDARY FOCUS',
    alertnessPercent: 78,
    description: 'Post-slump metabolic stabilization and secondary dopamine resurgence.',
    hourlyDirective: 'Steady execution block. Respect the caffeine cutoff to protect tonight\'s deep sleep.',
    counterMeasure: 'Zero caffeine; herbal tea or sparkling water',
    statusColor: 'emerald',
  },
  cortisol_winddown: {
    id: 'cortisol_winddown',
    name: 'Cortisol Wind-Down & Desk Shutdown',
    badgeLabel: 'WIND-DOWN',
    alertnessPercent: 52,
    description: 'Adrenal output tapering. Transitioning from task focus to autonomic recovery.',
    hourlyDirective: 'Complete evening wrap, seal work items, and dim overhead artificial lights.',
    counterMeasure: 'Digital sunset; filter screens or switch to reading',
    statusColor: 'slate',
  },
  melatonin_gate: {
    id: 'melatonin_gate',
    name: 'Melatonin Gate & Sleep Consolidation',
    badgeLabel: 'MELATONIN GATE',
    alertnessPercent: 25,
    description: 'Pineal melatonin release active. Glymphatic system preparing for metabolic waste reset.',
    hourlyDirective: 'Keep bedroom cool and dark. High-quality slow-wave delta sleep restores tomorrow\'s stamina.',
    counterMeasure: 'Screen-free dark environment; cool room temp',
    statusColor: 'slate',
  },
};

export function parseTimeToMinutes(timeStr?: string, defaultHour = 7, defaultMinute = 0): { hour: number; minute: number; totalMinutes: number } {
  if (!timeStr) {
    return { hour: defaultHour, minute: defaultMinute, totalMinutes: defaultHour * 60 + defaultMinute };
  }
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(h) && !isNaN(m) && h >= 0 && h < 24 && m >= 0 && m < 60) {
      return { hour: h, minute: m, totalMinutes: h * 60 + m };
    }
  }
  return { hour: defaultHour, minute: defaultMinute, totalMinutes: defaultHour * 60 + defaultMinute };
}

export function formatMinutesToClock(totalMinutes: number): string {
  const normalized = ((Math.floor(totalMinutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${h12}:${mStr} ${suffix}`;
}

export function formatCountdownMs(msRemaining: number): string {
  if (msRemaining <= 0) return '00:00:00';
  const totalSeconds = Math.floor(msRemaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hStr = hours < 10 ? `0${hours}` : `${hours}`;
  const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const sStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${hStr}:${mStr}:${sStr}`;
}

export function calculateCircadianStatus(options?: {
  now?: Date;
  wakeTimeStr?: string; // e.g. "07:00"
  bedtimeTargetStr?: string; // e.g. "22:30"
}): CircadianStatus {
  const now = options?.now || new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSeconds = now.getSeconds();
  const currentMinutesFromMidnight = currentHour * 60 + currentMinute + currentSeconds / 60;

  const { hour: wakeHour, minute: wakeMinute, totalMinutes: wakeMinutesFromMidnight } = parseTimeToMinutes(
    options?.wakeTimeStr,
    7,
    0
  );

  const { totalMinutes: bedtimeMinutesFromMidnight } = parseTimeToMinutes(
    options?.bedtimeTargetStr,
    22,
    30
  );

  // Dynamic Milestones:
  // 1. light_exposure_window: [wake_time, wake_time + 60m]
  const lightStartMinutes = wakeMinutesFromMidnight;
  const lightEndMinutes = wakeMinutesFromMidnight + 60;

  // 2. adenosine_caffeine_buffer: wake_time + 90m (first permissible intake)
  const caffeineBufferEndMinutes = wakeMinutesFromMidnight + 90;

  // 3. caffeine_hard_cutoff: wake_time + 9.5h (570 minutes)
  const caffeineHardCutoffMinutes = wakeMinutesFromMidnight + 9.5 * 60;

  // 4. digital_sunset_window: bedtime_target - 120m (fallback to wake + 14.5h)
  let digitalSunsetMinutes = bedtimeMinutesFromMidnight - 120;
  if (digitalSunsetMinutes < wakeMinutesFromMidnight) {
    digitalSunsetMinutes = wakeMinutesFromMidnight + 14.5 * 60;
  }

  // Calculate hours since wake (with 24h wrap protection)
  let diffMinutes = currentMinutesFromMidnight - wakeMinutesFromMidnight;
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60;
  }
  const hoursSinceWake = Number((diffMinutes / 60).toFixed(2));

  // Determine current active dock phase dynamically from offsets:
  // Morning Boot: 0 to 2h (during cortisol awakening & caffeine buffer)
  // Midday Sprint: 2h up to caffeine cutoff (+9.5h)
  // Desk Wrap / Evening: beyond caffeine cutoff (+9.5h) until next morning wake
  let dockPhase: 'morning' | 'midday' | 'evening';
  if (hoursSinceWake < 2.0) {
    dockPhase = 'morning';
  } else if (hoursSinceWake < 9.5) {
    dockPhase = 'midday';
  } else {
    dockPhase = 'evening';
  }

  // Calculate ms remaining to Caffeine Hard Cutoff & Digital Sunset
  let minutesUntilCutoff = caffeineHardCutoffMinutes - currentMinutesFromMidnight;
  if (minutesUntilCutoff < 0 && hoursSinceWake >= 9.5) {
    minutesUntilCutoff = 0;
  } else if (minutesUntilCutoff < 0) {
    minutesUntilCutoff += 1440;
  }
  const msUntilCaffeineCutoff = Math.max(0, Math.floor(minutesUntilCutoff * 60 * 1000));

  let minutesUntilSunset = digitalSunsetMinutes - currentMinutesFromMidnight;
  if (minutesUntilSunset < 0 && hoursSinceWake >= (digitalSunsetMinutes - wakeMinutesFromMidnight) / 60) {
    minutesUntilSunset = 0;
  } else if (minutesUntilSunset < 0) {
    minutesUntilSunset += 1440;
  }
  const msUntilDigitalSunset = Math.max(0, Math.floor(minutesUntilSunset * 60 * 1000));

  const isLightWindowActive = hoursSinceWake >= 0 && hoursSinceWake <= 1.0;
  const isCaffeinePermissible = hoursSinceWake >= 1.5 && hoursSinceWake < 9.5;
  const isPastCaffeineCutoff = hoursSinceWake >= 9.5;
  const isDigitalSunsetActive = hoursSinceWake >= ((digitalSunsetMinutes - wakeMinutesFromMidnight) / 60);

  // Approximate Solar Noon: ~5 hours post average sunrise/wake
  const approxSolarNoonMinutes = wakeMinutesFromMidnight + 5 * 60;

  const milestones: CircadianMilestones = {
    wakeTimeStr: formatMinutesToClock(wakeMinutesFromMidnight),
    bedtimeTargetStr: formatMinutesToClock(bedtimeMinutesFromMidnight),
    lightExposureWindow: {
      start: formatMinutesToClock(lightStartMinutes),
      end: formatMinutesToClock(lightEndMinutes),
      startMinutes: lightStartMinutes,
      endMinutes: lightEndMinutes,
    },
    adenosineCaffeineBuffer: {
      end: formatMinutesToClock(caffeineBufferEndMinutes),
      endMinutes: caffeineBufferEndMinutes,
    },
    caffeineHardCutoff: {
      cutoff: formatMinutesToClock(caffeineHardCutoffMinutes),
      cutoffMinutes: caffeineHardCutoffMinutes,
    },
    digitalSunsetWindow: {
      start: formatMinutesToClock(digitalSunsetMinutes),
      startMinutes: digitalSunsetMinutes,
    },
    solarNoonOffsetApprox: formatMinutesToClock(approxSolarNoonMinutes),
    msUntilCaffeineCutoff,
    msUntilDigitalSunset,
    isCaffeinePermissible,
    isPastCaffeineCutoff,
    isLightWindowActive,
    isDigitalSunsetActive,
    dockPhase,
  };

  // Determine detailed biological phase
  let phaseId: CircadianPhaseId;
  if (hoursSinceWake < 2.0) {
    phaseId = 'photonic_reset';
  } else if (hoursSinceWake < 5.5) {
    phaseId = 'peak_clarity';
  } else if (hoursSinceWake < 8.5) {
    phaseId = 'postprandial_dip';
  } else if (hoursSinceWake < 11.5) {
    phaseId = 'secondary_focus';
  } else if (hoursSinceWake < 15.0) {
    phaseId = 'cortisol_winddown';
  } else {
    phaseId = 'melatonin_gate';
  }

  const basePhase = PHASES[phaseId];
  const timeRange = `${formatMinutesToClock(wakeMinutesFromMidnight)} + ${hoursSinceWake}h`;

  // Fine-grained alertness score
  let alertnessScore = basePhase.alertnessPercent;
  if (phaseId === 'photonic_reset') {
    alertnessScore = Math.round(55 + (hoursSinceWake / 2.0) * 30);
  } else if (phaseId === 'peak_clarity') {
    alertnessScore = Math.round(85 + Math.sin(((hoursSinceWake - 2.0) / 3.5) * Math.PI) * 12);
  } else if (phaseId === 'postprandial_dip') {
    alertnessScore = Math.round(42 + (1 - Math.sin(((hoursSinceWake - 5.5) / 3.0) * Math.PI)) * 15);
  } else if (phaseId === 'secondary_focus') {
    alertnessScore = Math.round(72 + Math.sin(((hoursSinceWake - 8.5) / 3.0) * Math.PI) * 8);
  } else if (phaseId === 'cortisol_winddown') {
    alertnessScore = Math.round(60 - ((hoursSinceWake - 11.5) / 3.5) * 25);
  } else {
    alertnessScore = Math.max(15, Math.round(35 - ((hoursSinceWake - 15.0) / 9.0) * 20));
  }

  // Sample 16 waking hours points
  const curvePoints: CircadianCurvePoint[] = [];
  for (let step = 0; step <= 16; step += 1) {
    const pointOffset = step;
    const pointMinutes = (wakeMinutesFromMidnight + pointOffset * 60) % (24 * 60);
    const pointHour = Math.floor(pointMinutes / 60);

    let pointPhase: CircadianPhaseId;
    let score = 50;

    if (pointOffset < 2.0) {
      pointPhase = 'photonic_reset';
      score = Math.round(55 + (pointOffset / 2.0) * 30);
    } else if (pointOffset < 5.5) {
      pointPhase = 'peak_clarity';
      score = Math.round(85 + Math.sin(((pointOffset - 2.0) / 3.5) * Math.PI) * 12);
    } else if (pointOffset < 8.5) {
      pointPhase = 'postprandial_dip';
      score = Math.round(42 + (1 - Math.sin(((pointOffset - 5.5) / 3.0) * Math.PI)) * 15);
    } else if (pointOffset < 11.5) {
      pointPhase = 'secondary_focus';
      score = Math.round(72 + Math.sin(((pointOffset - 8.5) / 3.0) * Math.PI) * 8);
    } else if (pointOffset < 15.0) {
      pointPhase = 'cortisol_winddown';
      score = Math.round(60 - ((pointOffset - 11.5) / 3.5) * 25);
    } else {
      pointPhase = 'melatonin_gate';
      score = 25;
    }

    curvePoints.push({
      hourOfDay: pointHour,
      timeLabel: formatHourLabel(pointHour),
      alertnessScore: Math.min(100, Math.max(10, score)),
      phaseId: pointPhase,
    });
  }

  const currentProgressFraction = Math.min(1, Math.max(0, hoursSinceWake / 16));

  return {
    currentHour,
    currentMinute,
    wakeHour,
    wakeMinute,
    hoursSinceWake,
    currentPhase: {
      ...basePhase,
      timeRange,
    },
    alertnessScore: Math.min(100, Math.max(10, alertnessScore)),
    curvePoints,
    currentProgressFraction,
    milestones,
  };
}

function formatHourLabel(hour24: number): string {
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const h12 = hour24 % 12 || 12;
  return `${h12} ${suffix}`;
}
