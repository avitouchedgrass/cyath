export type CommandType =
  | 'LOG_PROTEIN'
  | 'LOG_HYDRATION'
  | 'LOG_SLEEP'
  | 'LOG_ENERGY'
  | 'LOG_MOOD'
  | 'TOGGLE_HABIT'
  | 'TRIGGER_RITUAL'
  | 'ACCEPT_PROTOCOL'
  | 'NAVIGATE'
  | 'TRIGGER_COACH'
  | 'AI_NATURAL_LANGUAGE';

export interface HabitLookup {
  id: string;
  title: string;
}

export interface ParsedCommand {
  type: CommandType;
  title: string;
  description: string;
  badge: string;
  payload: any;
  actionable: boolean;
}

const HABIT_ALIASES: Record<string, string[]> = {
  sunlight: ['sunlight', 'sun', 'morning sunlight', 'electrolytes', 'light'],
  movement: ['movement', 'workout', 'cardio', 'resistance', 'gym', 'exercise', 'training'],
  digital_sunset: ['digital sunset', 'sunset', 'dark sleep', 'screen off'],
  mobility: ['mobility', 'cold shower', 'cold rinse', 'stretch', 'thoracic'],
  protein_target: ['protein target', 'hit protein', 'daily protein'],
  hydration: ['hydration target', 'drink water', 'daily hydration'],
};

export function parseQuickLog(
  rawInput: string,
  userHabits: HabitLookup[] = []
): ParsedCommand | null {
  const query = rawInput.trim().toLowerCase();
  if (!query) return null;

  // 1. Protein logging
  // Matches: "+30g pro", "30g protein", "40p", "+25p", "pro 40", "protein 50", "log 30g pro"
  const proteinMatch =
    query.match(/^(?:\+)?(\d{1,3})\s*(?:g)?\s*(?:pro|protein|p)$/) ||
    query.match(/^(?:pro|protein)\s*(?:\+)?(\d{1,3})(?:g)?$/) ||
    query.match(/^log\s*(\d{1,3})\s*(?:g)?\s*(?:pro|protein|p)?$/);

  if (proteinMatch) {
    const amount = parseInt(proteinMatch[1], 10);
    if (!isNaN(amount) && amount > 0 && amount <= 300) {
      const isRelative = query.includes('+') || !query.startsWith('set');
      return {
        type: 'LOG_PROTEIN',
        title: isRelative ? `Add +${amount}g Protein` : `Set Protein to ${amount}g`,
        description: `Update daily protein intake telemetry`,
        badge: 'LOCAL PARSER · <1MS',
        payload: { amount, isRelative },
        actionable: true,
      };
    }
  }

  // 2. Hydration logging
  // Matches: "1.5l water", "500ml water", "2l", "+1l", "water 1.5l", "water 500ml", "+500ml"
  const waterLiterMatch =
    query.match(/^(?:\+)?(\d+(?:\.\d+)?)\s*l(?:\s*water)?$/) ||
    query.match(/^water\s*(?:\+)?(\d+(?:\.\d+)?)(?:l)?$/);

  if (waterLiterMatch) {
    const liters = parseFloat(waterLiterMatch[1]);
    if (!isNaN(liters) && liters > 0 && liters <= 10) {
      const isRelative = query.includes('+') || !query.startsWith('set');
      return {
        type: 'LOG_HYDRATION',
        title: isRelative ? `Add +${liters}L Water` : `Set Hydration to ${liters}L`,
        description: `Update daily cellular hydration record`,
        badge: 'LOCAL PARSER · <1MS',
        payload: { liters, isRelative },
        actionable: true,
      };
    }
  }

  const waterMlMatch =
    query.match(/^(?:\+)?(\d{2,4})\s*ml(?:\s*water)?$/) ||
    query.match(/^water\s*(?:\+)?(\d{2,4})ml$/);

  if (waterMlMatch) {
    const ml = parseInt(waterMlMatch[1], 10);
    if (!isNaN(ml) && ml > 0 && ml <= 10000) {
      const liters = Number((ml / 1000).toFixed(2));
      const isRelative = query.includes('+') || !query.startsWith('set');
      return {
        type: 'LOG_HYDRATION',
        title: isRelative ? `Add +${liters}L Water (${ml}ml)` : `Set Hydration to ${liters}L`,
        description: `Update daily cellular hydration record`,
        badge: 'LOCAL PARSER · <1MS',
        payload: { liters, isRelative },
        actionable: true,
      };
    }
  }

  // 3. Sleep recording
  // Matches: "7.5h sleep", "8h", "sleep 8h", "sleep 7.5"
  const sleepMatch =
    query.match(/^(\d+(?:\.\d+)?)\s*h(?:\s*sleep)?$/) ||
    query.match(/^sleep\s*(\d+(?:\.\d+)?)(?:h)?$/);

  if (sleepMatch) {
    const hours = parseFloat(sleepMatch[1]);
    if (!isNaN(hours) && hours >= 0 && hours <= 24) {
      return {
        type: 'LOG_SLEEP',
        title: `Record Sleep · ${hours} Hours`,
        description: `Log previous night's recovery duration`,
        badge: 'LOCAL PARSER · <1MS',
        payload: { hours },
        actionable: true,
      };
    }
  }

  // 4. Energy rating
  // Matches: "energy 8", "energy 8/10", "e 8"
  const energyMatch =
    query.match(/^energy\s*(\d{1,2})(?:\/10)?$/) ||
    query.match(/^e\s*(\d{1,2})$/);

  if (energyMatch) {
    const level = parseInt(energyMatch[1], 10);
    if (!isNaN(level) && level >= 1 && level <= 10) {
      return {
        type: 'LOG_ENERGY',
        title: `Rate Energy · Level ${level}/10`,
        description: `Record daily biological vigor level`,
        badge: 'LOCAL PARSER · <1MS',
        payload: { level },
        actionable: true,
      };
    }
  }

  // 5. Mood rating
  // Matches: "mood 8", "mood 8/10", "m 8"
  const moodMatch =
    query.match(/^mood\s*(\d{1,2})(?:\/10)?$/) ||
    query.match(/^m\s*(\d{1,2})$/);

  if (moodMatch) {
    const score = parseInt(moodMatch[1], 10);
    if (!isNaN(score) && score >= 1 && score <= 10) {
      return {
        type: 'LOG_MOOD',
        title: `Rate Mood · Score ${score}/10`,
        description: `Record cognitive mindset score`,
        badge: 'LOCAL PARSER · <1MS',
        payload: { score },
        actionable: true,
      };
    }
  }

  // 6. Desk Rituals & Protocols
  if (['boot', 'morning boot', 'boot ritual'].includes(query)) {
    return {
      type: 'TRIGGER_RITUAL',
      title: 'Run Morning Boot Ritual',
      description: 'Open the morning alignment protocol',
      badge: 'RITUAL',
      payload: { ritual: 'morning-boot' },
      actionable: true,
    };
  }

  if (['wrap', 'evening wrap', 'wrap ritual'].includes(query)) {
    return {
      type: 'TRIGGER_RITUAL',
      title: 'Run Evening Wrap Ritual',
      description: 'Open the evening shutdown protocol',
      badge: 'RITUAL',
      payload: { ritual: 'evening-wrap' },
      actionable: true,
    };
  }

  if (['protocol', 'accept protocol', 'commit'].includes(query)) {
    return {
      type: 'ACCEPT_PROTOCOL',
      title: 'Accept Today\'s Protocol Directive',
      description: 'Lock in today\'s evidence-based circadian challenge',
      badge: 'PROTOCOL',
      payload: {},
      actionable: true,
    };
  }

  // 7. Navigation
  const navTargets: Record<string, { path: string; label: string }> = {
    dashboard: { path: '/dashboard', label: 'Dashboard Cockpit' },
    dash: { path: '/dashboard', label: 'Dashboard Cockpit' },
    cockpit: { path: '/dashboard', label: 'Dashboard Cockpit' },
    recipes: { path: '/playbook', label: 'Playbook & Methodology' },
    meals: { path: '/playbook', label: 'Playbook & Methodology' },
    food: { path: '/playbook', label: 'Playbook & Methodology' },
    sanctuary: { path: '/sanctuary', label: 'Island Sanctuary' },
    island: { path: '/sanctuary', label: 'Island Sanctuary' },
    protocols: { path: '/protocols', label: 'Circadian Protocols Matrix' },
    correlations: { path: '/correlations', label: 'Pattern Correlation Engine' },
    patterns: { path: '/correlations', label: 'Pattern Correlation Engine' },
  };

  const cleanNav = query.replace(/^go(?:to)?\s+/, '');
  if (navTargets[cleanNav]) {
    const target = navTargets[cleanNav];
    return {
      type: 'NAVIGATE',
      title: `Navigate to ${target.label}`,
      description: `Open route ${target.path}`,
      badge: 'NAVIGATION',
      payload: { path: target.path },
      actionable: true,
    };
  }

  if (['coach', 'stovesage', 'ask ai', 'ai coach'].includes(query)) {
    return {
      type: 'TRIGGER_COACH',
      title: 'Consult StoveSage AI Coach',
      description: 'Open conversational nutrition and habit advisor',
      badge: 'AI COACH',
      payload: {},
      actionable: true,
    };
  }

  // 8. Habit matching
  // Check against known aliases
  for (const [habitId, aliases] of Object.entries(HABIT_ALIASES)) {
    if (aliases.some((alias) => query === alias || query === `toggle ${alias}` || query === `done ${alias}`)) {
      const matchedHabit = userHabits.find((h) => h.id === habitId);
      const title = matchedHabit ? matchedHabit.title : habitId.replace('_', ' ');
      return {
        type: 'TOGGLE_HABIT',
        title: `Toggle Habit · ${title}`,
        description: `Mark today's checklist status`,
        badge: 'HABIT TOGGLE',
        payload: { habitId },
        actionable: true,
      };
    }
  }

  // Check against user custom habit titles
  for (const habit of userHabits) {
    const lowerTitle = habit.title.toLowerCase();
    if (lowerTitle.includes(query) || query.includes(lowerTitle)) {
      return {
        type: 'TOGGLE_HABIT',
        title: `Toggle Habit · ${habit.title}`,
        description: `Mark today's checklist status`,
        badge: 'HABIT TOGGLE',
        payload: { habitId: habit.id },
        actionable: true,
      };
    }
  }

  // 9. Natural language / freeform AI fallback
  // If the query contains spaces and is at least 6 characters, treat as AI prompt
  if (query.length >= 6 && query.includes(' ')) {
    return {
      type: 'AI_NATURAL_LANGUAGE',
      title: `Parse with StoveSage · "${rawInput.trim()}"`,
      description: `Extract meals, macros, or habits automatically with AI`,
      badge: 'AI FALLBACK',
      payload: { text: rawInput.trim() },
      actionable: true,
    };
  }

  return null;
}
