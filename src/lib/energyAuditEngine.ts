export interface EnergyAuditAnswers {
  caffeineTiming: 'immediate' | 'delayed';
  middayFuel: 'high_carb' | 'high_protein' | 'skip_fast';
  afternoonSlump: 'none' | 'moderate' | 'severe';
  screenCutoff: 'within_30m' | 'filtered' | 'dark_60m';
}

export interface TrajectoryPoint {
  day: number;
  baseline: number;
  calibrated: number;
  label?: string;
  milestoneTitle?: string;
  milestoneDesc?: string;
}

export interface EnergyAuditResult {
  hoursLostPerDay: number;
  daysLostPerYear: number;
  enduranceDeficitPercent: number;
  primaryLever: {
    title: string;
    protocolId: string;
    mechanism: string;
    expectedGainHours: number;
  };
  secondaryLevers: string[];
  trajectoryPoints: TrajectoryPoint[];
}

export function calculateEnergyAudit(answers: EnergyAuditAnswers): EnergyAuditResult {
  let dailyLeak = 0;

  // 1. Caffeine timing calculation (adenosine clearance mechanism)
  if (answers.caffeineTiming === 'immediate') {
    dailyLeak += 0.7;
  } else {
    dailyLeak += 0.1;
  }

  // 2. Midday fuel (glucose stability vs reactive hypoglycemia)
  if (answers.middayFuel === 'high_carb') {
    dailyLeak += 1.0;
  } else if (answers.middayFuel === 'skip_fast') {
    dailyLeak += 0.5;
  } else {
    dailyLeak += 0.1;
  }

  // 3. Afternoon slump severity
  if (answers.afternoonSlump === 'severe') {
    dailyLeak += 1.1;
  } else if (answers.afternoonSlump === 'moderate') {
    dailyLeak += 0.6;
  } else {
    dailyLeak += 0.1;
  }

  // 4. Evening screen cutoff (melatonin suppression & deep sleep loss)
  if (answers.screenCutoff === 'within_30m') {
    dailyLeak += 0.7;
  } else if (answers.screenCutoff === 'filtered') {
    dailyLeak += 0.3;
  } else {
    dailyLeak += 0.0;
  }

  const hoursLostPerDay = Number(Math.max(0.6, Math.min(3.6, dailyLeak)).toFixed(1));
  const daysLostPerYear = Math.round((hoursLostPerDay * 260) / 8);
  const enduranceDeficitPercent = Math.min(48, Math.round(hoursLostPerDay * 13));

  // Determine primary lever based on largest single leak
  let primaryLever: EnergyAuditResult['primaryLever'];
  const secondaryLevers: string[] = [];

  if (answers.caffeineTiming === 'immediate') {
    primaryLever = {
      title: '90-Minute Caffeine Delay',
      protocolId: 'caffeine-delay-90m',
      mechanism:
        'Gives morning adenosine time to clear naturally, preventing the sharp 2:00 PM crash.',
      expectedGainHours: 0.7,
    };
    secondaryLevers.push('Midday 40g Protein Anchor', 'Screen-Free 60m Prior to Sleep');
  } else if (answers.middayFuel === 'high_carb') {
    primaryLever = {
      title: 'Midday Whole-Food Protein Anchor',
      protocolId: 'midday-protein-anchor',
      mechanism:
        'Replaces heavy starches with 30-40g protein to prevent blood sugar spikes and afternoon sluggishness.',
      expectedGainHours: 1.0,
    };
    secondaryLevers.push('Post-Lunch 10-Minute Walk', 'Evening Screen Dimming');
  } else if (answers.screenCutoff === 'within_30m') {
    primaryLever = {
      title: 'Digital Sunset Before Bed',
      protocolId: 'digital-sunset-60m',
      mechanism:
        'Reduces bright screen exposure before sleep, helping you wind down faster and get deeper rest.',
      expectedGainHours: 0.7,
    };
    secondaryLevers.push('Morning Outdoor Light', 'Consistent Bedtime Window');
  } else {
    primaryLever = {
      title: 'Morning Sunlight Exposure',
      protocolId: 'morning-sunlight-15m',
      mechanism:
        'Natural morning light sets your circadian rhythm for alert mornings and easier sleep at night.',
      expectedGainHours: 0.6,
    };
    secondaryLevers.push('Electrolyte Hydration Intake', 'Zone 2 Movement Break');
  }

  // 90-Day Trajectory points
  const startingScore = Math.max(45, Math.min(62, Math.round(75 - hoursLostPerDay * 9)));
  const trajectoryPoints: TrajectoryPoint[] = [
    {
      day: 1,
      baseline: startingScore,
      calibrated: startingScore,
      label: 'Day 1',
      milestoneTitle: 'Starting Baseline',
      milestoneDesc: `Estimated ~${hoursLostPerDay}h daily loss to afternoon slumps and fatigue. First habit assigned.`,
    },
    {
      day: 7,
      baseline: Math.max(42, startingScore - 1),
      calibrated: startingScore + Math.round(hoursLostPerDay * 4),
      label: 'Day 7',
      milestoneTitle: 'Week 1 · Early Reset',
      milestoneDesc: 'Morning grogginess clears faster and the afternoon crash softens.',
    },
    {
      day: 21,
      baseline: Math.max(40, startingScore - 2),
      calibrated: startingScore + Math.round(hoursLostPerDay * 7),
      label: 'Day 21',
      milestoneTitle: 'Week 3 · Habit Formed',
      milestoneDesc: 'Consistent meal timing and hydration keep energy steady past 2:00 PM.',
    },
    {
      day: 45,
      baseline: Math.max(38, startingScore - 3),
      calibrated: Math.min(91, startingScore + Math.round(hoursLostPerDay * 9)),
      label: 'Day 45',
      milestoneTitle: 'Day 45 · Steady Energy',
      milestoneDesc: 'Afternoon dips become rare. Sleep is noticeably deeper and more restorative.',
    },
    {
      day: 90,
      baseline: Math.max(36, startingScore - 4),
      calibrated: Math.min(96, startingScore + Math.round(hoursLostPerDay * 11)),
      label: 'Day 90',
      milestoneTitle: 'Day 90 · Sustained Energy',
      milestoneDesc: `Daily habits feel second nature. Clear focus and consistent rest throughout the week.`,
    },
  ];

  return {
    hoursLostPerDay,
    daysLostPerYear,
    enduranceDeficitPercent,
    primaryLever,
    secondaryLevers,
    trajectoryPoints,
  };
}
