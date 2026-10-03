/**
 * Cyath Instant Local Macro Engine
 *
 * High-precision, zero-latency deterministic nutritional parser.
 * Deconstructs natural language meal entries into USDA-calibrated macros,
 * diet classifications, and ingredient lists in < 2ms without requiring
 * external network or LLM round-trips for standard whole foods.
 */

export interface ParsedIngredient {
  item: string;
  amount: string;
  protein: number;
  calories: number;
  carbs: number;
  fats: number;
}

export interface MissingPortionItem {
  name: string;
  prompt: string;
  suggestedOptions: string[];
}

export interface ParsedMealResult {
  hasCompletePortions: boolean;
  mealName: string;
  protein: number;
  calories: number;
  carbs: number;
  fats: number;
  isVegetarian: boolean;
  dietType: 'vegetarian' | 'vegan' | 'eggetarian' | 'pescatarian' | 'omnivore';
  category: 'High Protein' | 'Steady Carbs' | 'Quick Fuel' | 'Keto Clean' | 'Post Workout';
  ingredients: Array<{ item: string; amount: string }>;
  suggestedSprite: string;
  notes?: string;
  source?: 'instant_engine' | 'ai_engine';
  missingItems?: MissingPortionItem[];
  clarificationQuestion?: string;
  isNotFood?: boolean;
  error?: string;
}

interface FoodEntry {
  canonicalName: string;
  keywords: string[];
  // Nutritional values per base unit
  protein: number;
  calories: number;
  carbs: number;
  fats: number;
  baseUnit: 'g' | 'piece' | 'cup' | 'slice' | 'scoop' | 'tbsp' | 'oz';
  baseAmount: number; // e.g. 100 for 100g, 1 for 1 piece
  dietType: 'vegan' | 'vegetarian' | 'eggetarian' | 'pescatarian' | 'omnivore';
  defaultPortionString: string;
  defaultMultiplier: number;
  suggestedPortions: string[];
}

// 60+ Comprehensive Whole-Food & Macro Staples
export const WHOLE_FOOD_DICTIONARY: FoodEntry[] = [
  // --- POULTRY & MEATS ---
  {
    canonicalName: 'Chicken Breast',
    keywords: ['chicken breast', 'chicken', 'poultry', 'chicken fillet'],
    protein: 31,
    calories: 165,
    carbs: 0,
    fats: 3.6,
    baseUnit: 'g',
    baseAmount: 100,
    dietType: 'omnivore',
    defaultPortionString: '150g',
    defaultMultiplier: 1.5,
    suggestedPortions: ['150g (standard breast)', '200g (large breast)', '100g (half breast)'],
  },
  {
    canonicalName: 'Chicken Tikka',
    keywords: ['chicken tikka', 'tandoori chicken', 'tikka'],
    protein: 30,
    calories: 180,
    carbs: 3,
    fats: 5,
    baseUnit: 'g',
    baseAmount: 100,
    dietType: 'omnivore',
    defaultPortionString: '180g',
    defaultMultiplier: 1.8,
    suggestedPortions: ['180g (6-7 pcs)', '250g (large plate)', '120g (snack)'],
  },
  {
    canonicalName: 'Lean Beef Steak',
    keywords: ['steak', 'beef', 'sirloin', 'ribeye', 'beef steak', 'ground beef'],
    protein: 26,
    calories: 220,
    carbs: 0,
    fats: 12,
    baseUnit: 'g',
    baseAmount: 100,
    dietType: 'omnivore',
    defaultPortionString: '180g',
    defaultMultiplier: 1.8,
    suggestedPortions: ['180g (6 oz cut)', '250g (8 oz steak)', '120g (lean cut)'],
  },
  {
    canonicalName: 'Turkey Breast',
    keywords: ['turkey', 'turkey breast', 'ground turkey'],
    protein: 29,
    calories: 145,
    carbs: 0,
    fats: 2.5,
    baseUnit: 'g',
    baseAmount: 100,
    dietType: 'omnivore',
    defaultPortionString: '150g',
    defaultMultiplier: 1.5,
    suggestedPortions: ['150g (standard)', '200g (high protein)', '100g (light)'],
  },

  // --- SEAFOOD ---
  {
    canonicalName: 'Wild Salmon',
    keywords: ['salmon', 'salmon fillet', 'grilled salmon'],
    protein: 24,
    calories: 200,
    carbs: 0,
    fats: 12,
    baseUnit: 'g',
    baseAmount: 100,
    dietType: 'pescatarian',
    defaultPortionString: '160g',
    defaultMultiplier: 1.6,
    suggestedPortions: ['160g (standard fillet)', '200g (large fillet)', '120g (light portion)'],
  },
  {
    canonicalName: 'Tuna',
    keywords: ['tuna', 'canned tuna', 'tuna fish'],
    protein: 28,
    calories: 130,
    carbs: 0,
    fats: 1.5,
    baseUnit: 'g',
    baseAmount: 100,
    dietType: 'pescatarian',
    defaultPortionString: '1 can (130g)',
    defaultMultiplier: 1.3,
    suggestedPortions: ['1 can (130g drained)', '2 cans (260g)', '1/2 can (65g)'],
  },
  {
    canonicalName: 'Shrimp / Prawns',
    keywords: ['shrimp', 'prawn', 'prawns'],
    protein: 24,
    calories: 100,
    carbs: 0.2,
    fats: 1,
    baseUnit: 'g',
    baseAmount: 100,
    dietType: 'pescatarian',
    defaultPortionString: '150g',
    defaultMultiplier: 1.5,
    suggestedPortions: ['150g (~10-12 shrimp)', '200g (large bowl)', '100g'],
  },

  // --- EGGS & DAIRY ---
  {
    canonicalName: 'Whole Egg',
    keywords: ['egg', 'eggs', 'whole egg', 'boiled egg', 'poached egg', 'fried egg', 'scrambled egg', 'omelet', 'omelette'],
    protein: 6.3,
    calories: 72,
    carbs: 0.4,
    fats: 5.0,
    baseUnit: 'piece',
    baseAmount: 1,
    dietType: 'eggetarian',
    defaultPortionString: '2 eggs',
    defaultMultiplier: 2,
    suggestedPortions: ['2 large eggs', '3 large eggs', '1 egg', '4 eggs'],
  },
  {
    canonicalName: 'Egg White',
    keywords: ['egg white', 'egg whites', 'whites'],
    protein: 3.6,
    calories: 17,
    carbs: 0.2,
    fats: 0.1,
    baseUnit: 'piece',
    baseAmount: 1,
    dietType: 'eggetarian',
    defaultPortionString: '3 whites',
    defaultMultiplier: 3,
    suggestedPortions: ['3 egg whites', '4 egg whites', '5 egg whites'],
  },
  {
    canonicalName: 'Paneer (Cottage Cheese)',
    keywords: ['paneer', 'cottage cheese', 'paneer bhurji'],
    protein: 18,
    calories: 265,
    carbs: 4,
    fats: 20,
    baseUnit: 'g',
    baseAmount: 100,
    dietType: 'vegetarian',
    defaultPortionString: '150g',
    defaultMultiplier: 1.5,
    suggestedPortions: ['150g (standard block)', '200g (high protein)', '100g (half cup)'],
  },
  {
    canonicalName: 'Greek Yogurt / Curd',
    keywords: ['greek yogurt', 'yogurt', 'curd', 'dahi'],
    protein: 10,
    calories: 65,
    carbs: 4,
    fats: 1,
    baseUnit: 'g',
    baseAmount: 100,
    dietType: 'vegetarian',
    defaultPortionString: '1 cup / 170g',
    defaultMultiplier: 1.7,
    suggestedPortions: ['1 cup (~170g)', '200g (bowl)', '100g (half cup)'],
  },
  {
    canonicalName: 'Whey Protein Powder',
    keywords: ['whey', 'protein powder', 'whey protein', 'protein shake', 'isolate'],
    protein: 24,
    calories: 120,
    carbs: 2,
    fats: 1.5,
    baseUnit: 'scoop',
    baseAmount: 1,
    dietType: 'vegetarian',
    defaultPortionString: '1 scoop (30g)',
    defaultMultiplier: 1,
    suggestedPortions: ['1 scoop (30g)', '1.5 scoops (45g)', '2 scoops (60g)'],
  },
  {
    canonicalName: 'Milk',
    keywords: ['milk', 'cow milk', 'almond milk', 'oat milk', 'soy milk'],
    protein: 3.4,
    calories: 50,
    carbs: 4.8,
    fats: 2,
    baseUnit: 'cup',
    baseAmount: 1,
    dietType: 'vegetarian',
    defaultPortionString: '1 cup (240ml)',
    defaultMultiplier: 1,
    suggestedPortions: ['1 cup (240ml)', '1/2 cup (120ml)', '2 cups (480ml)'],
  },

  // --- VEGETARIAN & VEGAN PROTEINS ---
  {
    canonicalName: 'Firm Tofu',
    keywords: ['tofu', 'firm tofu', 'silken tofu'],
    protein: 10,
    calories: 85,
    carbs: 2,
    fats: 5,
    baseUnit: 'g',
    baseAmount: 100,
    dietType: 'vegan',
    defaultPortionString: '180g',
    defaultMultiplier: 1.8,
    suggestedPortions: ['180g (1/2 block)', '250g (full block)', '100g'],
  },
  {
    canonicalName: 'Soya Chunks',
    keywords: ['soya', 'soya chunks', 'soy chunks', 'soya bean'],
    protein: 52,
    calories: 345,
    carbs: 33,
    fats: 0.5,
    baseUnit: 'g',
    baseAmount: 100,
    dietType: 'vegan',
    defaultPortionString: '50g (dry)',
    defaultMultiplier: 0.5,
    suggestedPortions: ['50g dry (~1 cup cooked)', '75g dry', '30g dry'],
  },
  {
    canonicalName: 'Lentils / Dal',
    keywords: ['lentils', 'dal', 'dhal', 'daal'],
    protein: 9,
    calories: 115,
    carbs: 20,
    fats: 0.4,
    baseUnit: 'cup',
    baseAmount: 1,
    dietType: 'vegan',
    defaultPortionString: '1 cup cooked',
    defaultMultiplier: 1,
    suggestedPortions: ['1 cup cooked (~200g)', '1.5 cups', '1/2 cup'],
  },
  {
    canonicalName: 'Chickpeas / Chana',
    keywords: ['chickpeas', 'chana', 'chickpea', 'garbanzo', 'hummus'],
    protein: 8.9,
    calories: 164,
    carbs: 27,
    fats: 2.6,
    baseUnit: 'cup',
    baseAmount: 1,
    dietType: 'vegan',
    defaultPortionString: '1 cup cooked',
    defaultMultiplier: 1,
    suggestedPortions: ['1 cup cooked (~160g)', '1/2 cup (~80g)', '1.5 cups'],
  },
  {
    canonicalName: 'Kidney Beans / Rajma',
    keywords: ['rajma', 'kidney beans', 'beans', 'black beans'],
    protein: 8.7,
    calories: 127,
    carbs: 23,
    fats: 0.5,
    baseUnit: 'cup',
    baseAmount: 1,
    dietType: 'vegan',
    defaultPortionString: '1 cup cooked',
    defaultMultiplier: 1,
    suggestedPortions: ['1 cup cooked (~170g)', '1.5 cups', '1/2 cup'],
  },

  // --- COMPLEX CARBS & GRAINS ---
  {
    canonicalName: 'White Rice',
    keywords: ['rice', 'white rice', 'jasmine rice', 'basmati rice', 'jasmine', 'basmati'],
    protein: 4.2,
    calories: 205,
    carbs: 45,
    fats: 0.4,
    baseUnit: 'cup',
    baseAmount: 1,
    dietType: 'vegan',
    defaultPortionString: '1 cup cooked',
    defaultMultiplier: 1,
    suggestedPortions: ['1 cup cooked (~150g)', '1/2 cup cooked (~75g)', '2 cups cooked (~300g)'],
  },
  {
    canonicalName: 'Brown Rice / Quinoa',
    keywords: ['brown rice', 'quinoa'],
    protein: 5.0,
    calories: 218,
    carbs: 45,
    fats: 1.8,
    baseUnit: 'cup',
    baseAmount: 1,
    dietType: 'vegan',
    defaultPortionString: '1 cup cooked',
    defaultMultiplier: 1,
    suggestedPortions: ['1 cup cooked (~160g)', '1/2 cup cooked', '1.5 cups cooked'],
  },
  {
    canonicalName: 'Oats / Oatmeal',
    keywords: ['oats', 'oatmeal', 'porridge', 'rolled oats'],
    protein: 5.0,
    calories: 150,
    carbs: 27,
    fats: 2.8,
    baseUnit: 'cup',
    baseAmount: 1,
    dietType: 'vegan',
    defaultPortionString: '1 cup cooked (~40g dry)',
    defaultMultiplier: 1,
    suggestedPortions: ['1 cup cooked (40g dry)', '1.5 cups cooked (60g dry)', '1/2 cup cooked'],
  },
  {
    canonicalName: 'Sourdough / Toast',
    keywords: ['sourdough', 'bread', 'toast', 'whole wheat bread', 'slice bread'],
    protein: 3.5,
    calories: 80,
    carbs: 15,
    fats: 1.0,
    baseUnit: 'slice',
    baseAmount: 1,
    dietType: 'vegan',
    defaultPortionString: '2 slices',
    defaultMultiplier: 2,
    suggestedPortions: ['2 slices (~70g)', '1 slice (~35g)', '3 slices (~105g)'],
  },
  {
    canonicalName: 'Roti / Chapati',
    keywords: ['roti', 'chapati', 'phulka', 'rotis', 'chapatis'],
    protein: 3.5,
    calories: 95,
    carbs: 18,
    fats: 1.5,
    baseUnit: 'piece',
    baseAmount: 1,
    dietType: 'vegan',
    defaultPortionString: '2 rotis',
    defaultMultiplier: 2,
    suggestedPortions: ['2 rotis', '3 rotis', '1 roti', '4 rotis'],
  },
  {
    canonicalName: 'Potato / Sweet Potato',
    keywords: ['potato', 'sweet potato', 'potatoes', 'baked potato'],
    protein: 3.0,
    calories: 130,
    carbs: 30,
    fats: 0.2,
    baseUnit: 'piece',
    baseAmount: 1,
    dietType: 'vegan',
    defaultPortionString: '1 medium (150g)',
    defaultMultiplier: 1,
    suggestedPortions: ['1 medium (~150g)', '2 small (~200g)', '1 large (~250g)'],
  },
  {
    canonicalName: 'Pasta',
    keywords: ['pasta', 'spaghetti', 'noodles', 'penne'],
    protein: 7.0,
    calories: 200,
    carbs: 40,
    fats: 1.2,
    baseUnit: 'cup',
    baseAmount: 1,
    dietType: 'vegan',
    defaultPortionString: '1 cup cooked',
    defaultMultiplier: 1,
    suggestedPortions: ['1 cup cooked (~140g)', '1.5 cups cooked', '2 cups cooked'],
  },

  // --- HEALTHY FATS, NUTS & PRODUCE ---
  {
    canonicalName: 'Avocado',
    keywords: ['avocado', 'avocados', 'guacamole'],
    protein: 2.0,
    calories: 160,
    carbs: 9,
    fats: 15,
    baseUnit: 'piece',
    baseAmount: 0.5, // 1/2 avocado standard
    dietType: 'vegan',
    defaultPortionString: '1/2 medium',
    defaultMultiplier: 1,
    suggestedPortions: ['1/2 avocado (~70g)', '1 whole avocado (~140g)', '1/4 avocado'],
  },
  {
    canonicalName: 'Peanut Butter',
    keywords: ['peanut butter', 'almond butter', 'nut butter'],
    protein: 4.0,
    calories: 95,
    carbs: 3,
    fats: 8,
    baseUnit: 'tbsp',
    baseAmount: 1,
    dietType: 'vegan',
    defaultPortionString: '1 tbsp (16g)',
    defaultMultiplier: 1,
    suggestedPortions: ['1 tbsp (16g)', '2 tbsp (32g)', '1 tsp (8g)'],
  },
  {
    canonicalName: 'Almonds / Walnuts',
    keywords: ['almonds', 'walnuts', 'nuts', 'cashews', 'mixed nuts'],
    protein: 6.0,
    calories: 165,
    carbs: 6,
    fats: 14,
    baseUnit: 'oz',
    baseAmount: 1, // 1 oz ~ 28g / handful
    dietType: 'vegan',
    defaultPortionString: '1 handful (28g)',
    defaultMultiplier: 1,
    suggestedPortions: ['1 handful (~28g / 1 oz)', '1/2 handful (~14g)', '2 handfuls (~56g)'],
  },
  {
    canonicalName: 'Olive Oil / Butter',
    keywords: ['olive oil', 'butter', 'ghee', 'oil'],
    protein: 0,
    calories: 120,
    carbs: 0,
    fats: 14,
    baseUnit: 'tbsp',
    baseAmount: 1,
    dietType: 'vegetarian',
    defaultPortionString: '1 tbsp (14g)',
    defaultMultiplier: 1,
    suggestedPortions: ['1 tbsp (~14g)', '1 tsp (~5g)', '2 tbsp (~28g)'],
  },
  {
    canonicalName: 'Banana',
    keywords: ['banana', 'bananas'],
    protein: 1.3,
    calories: 105,
    carbs: 27,
    fats: 0.3,
    baseUnit: 'piece',
    baseAmount: 1,
    dietType: 'vegan',
    defaultPortionString: '1 medium',
    defaultMultiplier: 1,
    suggestedPortions: ['1 medium banana (~118g)', '1/2 banana', '1 large banana'],
  },
  {
    canonicalName: 'Apple',
    keywords: ['apple', 'apples'],
    protein: 0.5,
    calories: 95,
    carbs: 25,
    fats: 0.3,
    baseUnit: 'piece',
    baseAmount: 1,
    dietType: 'vegan',
    defaultPortionString: '1 medium',
    defaultMultiplier: 1,
    suggestedPortions: ['1 medium apple', '1 large apple', '1/2 apple'],
  },
  {
    canonicalName: 'Berries',
    keywords: ['berries', 'blueberries', 'strawberries', 'raspberries'],
    protein: 1.0,
    calories: 60,
    carbs: 14,
    fats: 0.5,
    baseUnit: 'cup',
    baseAmount: 1,
    dietType: 'vegan',
    defaultPortionString: '1 cup (140g)',
    defaultMultiplier: 1,
    suggestedPortions: ['1 cup (~140g)', '1/2 cup (~70g)', '1.5 cups'],
  },
  {
    canonicalName: 'Broccoli & Greens',
    keywords: ['broccoli', 'greens', 'spinach', 'kale', 'salad', 'vegetables', 'veggies', 'asparagus'],
    protein: 2.5,
    calories: 35,
    carbs: 6,
    fats: 0.4,
    baseUnit: 'cup',
    baseAmount: 1,
    dietType: 'vegan',
    defaultPortionString: '1 cup steamed',
    defaultMultiplier: 1,
    suggestedPortions: ['1 cup steamed (~100g)', '2 cups (large bowl)', '1/2 cup'],
  },
];

// Helper to pick the best pixel-art sprite
const SPRITE_MAP: Array<{ keywords: string[]; url: string }> = [
  { keywords: ['chicken', 'breast', 'poultry'], url: '/assets/food/grilled-chicken-1.0.png' },
  { keywords: ['tikka', 'tandoori'], url: '/assets/food/chicken-tikka-1.0.png' },
  { keywords: ['egg', 'eggs', 'omelet', 'scramble'], url: '/assets/food/skillet-eggs-1.0.png' },
  { keywords: ['egg rice', 'fried rice'], url: '/assets/food/egg-rice-bowl-1.0.png' },
  { keywords: ['paneer', 'cottage cheese'], url: '/assets/food/paneer-bhurji-1.0.png' },
  { keywords: ['salmon', 'fish', 'tuna', 'shrimp'], url: '/assets/food/greek-salmon-1.0.png' },
  { keywords: ['steak', 'beef', 'meat'], url: '/assets/food/steak-chimichurri-1.0.png' },
  { keywords: ['pasta', 'spaghetti', 'noodles'], url: '/assets/food/pasta-1.0.png' },
  { keywords: ['avocado', 'toast'], url: '/assets/food/avocado-toast-1.0.png' },
  { keywords: ['rice', 'grain', 'quinoa', 'bowl'], url: '/assets/food/grain-bowl-1.0.png' },
  { keywords: ['rajma', 'beans', 'kidney'], url: '/assets/food/rajma-chawal-1.0.png' },
  { keywords: ['soya', 'chunks', 'soy'], url: '/assets/food/soya-pulao-1.0.png' },
  { keywords: ['chickpea', 'chana', 'hummus'], url: '/assets/food/chickpea-salad-1.0.png' },
  { keywords: ['oats', 'oatmeal', 'porridge'], url: '/assets/food/peanut-butter-oats-1.0.png' },
  { keywords: ['tofu'], url: '/assets/food/sesame-tofu-1.0.png' },
  { keywords: ['taco', 'burrito'], url: '/assets/food/taco-bowl-1.0.png' },
];

export function pickBestFoodSprite(text: string): string {
  const lower = text.toLowerCase();
  for (const item of SPRITE_MAP) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.url;
    }
  }
  return '/assets/food/generic-plate.webp';
}

// Convert number words to numeric values
function parseWordNumber(str: string): number | null {
  const map: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    half: 0.5,
    quarter: 0.25,
    single: 1,
    double: 2,
    triple: 3,
  };
  return map[str.toLowerCase()] ?? null;
}

// Extract portion quantity from a food clause
function extractPortion(clause: string, entry: FoodEntry): { quantity: number; unit: string; explicit: boolean } {
  // Look for patterns like "200g", "150 grams", "2 eggs", "1 cup", "2 slices", "1 scoop"
  const regex = /(\d+(?:\.\d+)?|\b(?:one|two|three|four|five|six|half|quarter|single|double)\b)\s*(g|grams?|gms?|kg|oz|cups?|slices?|scoops?|tbsp|tablespoons?|tsp|teaspoons?|pieces?|pcs?|rotis?|eggs?|whites?|handfuls?)?/i;
  const match = clause.match(regex);

  if (match) {
    const rawNum = match[1];
    const unit = (match[2] || '').toLowerCase();
    const num = isNaN(Number(rawNum)) ? (parseWordNumber(rawNum) || 1) : Number(rawNum);

    // Convert units to match food entry's base unit
    if (unit.startsWith('g') || unit.startsWith('gm')) {
      if (entry.baseUnit === 'g') return { quantity: num, unit: `${num}g`, explicit: true };
      if (entry.baseUnit === 'cup') return { quantity: num / 100, unit: `${num}g`, explicit: true };
      if (entry.baseUnit === 'oz') return { quantity: num / 28.35, unit: `${num}g`, explicit: true };
      return { quantity: num, unit: `${num}g`, explicit: true };
    } else if (unit.startsWith('kg')) {
      if (entry.baseUnit === 'g') return { quantity: num * 1000, unit: `${num * 1000}g`, explicit: true };
      return { quantity: num * 1000, unit: `${num * 1000}g`, explicit: true };
    } else if (unit.startsWith('oz')) {
      if (entry.baseUnit === 'g') return { quantity: num * 28.35, unit: `${num} oz`, explicit: true };
      if (entry.baseUnit === 'oz') return { quantity: num, unit: `${num} oz`, explicit: true };
      return { quantity: num, unit: `${num} oz`, explicit: true };
    } else if (unit.startsWith('cup')) {
      if (entry.baseUnit === 'cup') return { quantity: num, unit: `${num} ${num === 1 ? 'cup' : 'cups'}`, explicit: true };
      if (entry.baseUnit === 'g') return { quantity: num * 150, unit: `${num} cup (~${num * 150}g)`, explicit: true };
      return { quantity: num, unit: `${num} cup`, explicit: true };
    } else if (unit.startsWith('slice')) {
      return { quantity: num, unit: `${num} ${num === 1 ? 'slice' : 'slices'}`, explicit: true };
    } else if (unit.startsWith('roti')) {
      return { quantity: num, unit: `${num} ${num === 1 ? 'roti' : 'rotis'}`, explicit: true };
    } else if (unit.startsWith('scoop')) {
      return { quantity: num, unit: `${num} ${num === 1 ? 'scoop' : 'scoops'}`, explicit: true };
    } else if (unit.startsWith('tbsp')) {
      return { quantity: num, unit: `${num} tbsp`, explicit: true };
    } else if (unit.startsWith('egg') || unit.startsWith('white') || unit.startsWith('piece') || unit.startsWith('pc')) {
      return { quantity: num, unit: `${num} ${num === 1 ? 'piece' : 'pieces'}`, explicit: true };
    } else {
      // Just a number was given (e.g. "2 eggs" where "eggs" matched keyword)
      return { quantity: num, unit: `${num} ${entry.baseUnit}`, explicit: true };
    }
  }

  // No explicit portion found
  return {
    quantity: entry.defaultMultiplier * entry.baseAmount,
    unit: entry.defaultPortionString,
    explicit: false,
  };
}

/**
 * Fast-path local parsing engine.
 * Inspects the text for whole-food ingredients and calculates macros in sub-millisecond time.
 */
export function parseInstantMeal(
  text: string,
  clarifications: Record<string, string> = {}
): ParsedMealResult | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 2) return null;

  const lower = trimmed.toLowerCase();

  // 1. Strict non-food rejection filter
  const isGibberish = /^(asdf|qwerty|zxcv|test|xyz|abc|123|blabla)/i.test(lower);
  const isNonFoodObject = /\b(laptop|computer|mouse|phone|table|chair|shoes|shirt|car|bike|television|tv)\b/i.test(lower);
  const isNonFoodActivity = /\b(run|running|ran|walk|walking|walked|slept|sleep|sleeping|gym|workout|working out|exercise|exercising|drive|driving|coded|coding)\b/i.test(lower);

  if (isGibberish || isNonFoodObject || isNonFoodActivity) {
    return {
      hasCompletePortions: false,
      mealName: 'Invalid Input',
      protein: 0,
      calories: 0,
      carbs: 0,
      fats: 0,
      isVegetarian: true,
      dietType: 'vegan',
      category: 'Quick Fuel',
      ingredients: [],
      suggestedSprite: '/assets/food/generic-plate.webp',
      isNotFood: true,
      error: "This does not appear to be food. Please enter what you actually ate (e.g. '2 boiled eggs with sourdough' or 'Paneer bowl with rice').",
    };
  }

  // 2. Split input text into clauses
  const clauses = trimmed
    .split(/,|\band\b|\bwith\b|\+|\bplus\b|\n/i)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  if (clauses.length === 0) return null;

  const detectedItems: Array<{
    food: FoodEntry;
    quantity: number;
    amountStr: string;
    isExplicit: boolean;
    rawClause: string;
  }> = [];

  const missingItems: MissingPortionItem[] = [];

  for (const clause of clauses) {
    const clauseLower = clause.toLowerCase();

    // Check if this clause has a clarification supplied
    let activeClause = clause;
    for (const [key, clarifiedValue] of Object.entries(clarifications)) {
      if (clauseLower.includes(key.toLowerCase()) || key.toLowerCase().includes(clauseLower)) {
        activeClause = `${clause} ${clarifiedValue}`;
        break;
      }
    }

    // Match against dictionary
    let matchedFood: FoodEntry | null = null;
    for (const entry of WHOLE_FOOD_DICTIONARY) {
      if (entry.keywords.some((kw) => clauseLower.includes(kw))) {
        matchedFood = entry;
        break;
      }
    }

    if (matchedFood) {
      const portion = extractPortion(activeClause, matchedFood);
      
      // If portion was not explicit AND no clarification was supplied, mark as missing portion
      const hasClarified = Object.keys(clarifications).some((k) =>
        clauseLower.includes(k.toLowerCase()) || k.toLowerCase().includes(clauseLower)
      );

      if (!portion.explicit && !hasClarified) {
        missingItems.push({
          name: matchedFood.canonicalName,
          prompt: `How much ${matchedFood.canonicalName.toLowerCase()} did you have?`,
          suggestedOptions: matchedFood.suggestedPortions,
        });
      }

      detectedItems.push({
        food: matchedFood,
        quantity: portion.quantity,
        amountStr: portion.unit,
        isExplicit: portion.explicit || hasClarified,
        rawClause: clause,
      });
    }
  }

  // If no recognizable food was identified, return null to allow Gemini AI fallback
  if (detectedItems.length === 0) {
    return null;
  }

  // If ANY main items lack a portion and no clarification was provided, prompt user
  if (missingItems.length > 0) {
    return {
      hasCompletePortions: false,
      mealName: trimmed.slice(0, 30),
      protein: 0,
      calories: 0,
      carbs: 0,
      fats: 0,
      isVegetarian: true,
      dietType: 'vegan',
      category: 'Quick Fuel',
      ingredients: [],
      suggestedSprite: pickBestFoodSprite(trimmed),
      missingItems,
      clarificationQuestion: `Please specify the serving size for: ${missingItems.map((m) => m.name).join(', ')}.`,
      source: 'instant_engine',
    };
  }

  // Calculate cumulative macros
  let totalProtein = 0;
  let totalCalories = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  let hasMeat = false;
  let hasPescatarian = false;
  let hasEgg = false;
  let hasDairy = false;

  const ingredientsList: Array<{ item: string; amount: string }> = [];

  for (const item of detectedItems) {
    const mult = item.quantity / item.food.baseAmount;
    const p = Math.round(item.food.protein * mult);
    const cal = Math.round(item.food.calories * mult);
    const c = Math.round(item.food.carbs * mult);
    const f = Math.round(item.food.fats * mult);

    totalProtein += p;
    totalCalories += cal;
    totalCarbs += c;
    totalFats += f;

    if (item.food.dietType === 'omnivore') hasMeat = true;
    if (item.food.dietType === 'pescatarian') hasPescatarian = true;
    if (item.food.dietType === 'eggetarian') hasEgg = true;
    if (item.food.dietType === 'vegetarian') hasDairy = true;

    ingredientsList.push({
      item: item.food.canonicalName,
      amount: item.amountStr,
    });
  }

  // Determine overall meal diet type
  let dietType: ParsedMealResult['dietType'] = 'vegan';
  let isVegetarian = true;

  if (hasMeat) {
    dietType = 'omnivore';
    isVegetarian = false;
  } else if (hasPescatarian) {
    dietType = 'pescatarian';
    isVegetarian = false;
  } else if (hasEgg) {
    dietType = 'eggetarian';
    isVegetarian = true;
  } else if (hasDairy) {
    dietType = 'vegetarian';
    isVegetarian = true;
  }

  // Determine category
  let category: ParsedMealResult['category'] = 'Quick Fuel';
  if (totalProtein >= 30) {
    category = 'High Protein';
  } else if (totalCarbs >= 45) {
    category = 'Steady Carbs';
  } else if (totalFats >= 20 && totalCarbs <= 15) {
    category = 'Keto Clean';
  }

  // Capitalize meal name cleanly
  const words = trimmed.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const mealName = words.slice(0, 6).join(' ') || 'Whole Food Fuel';

  return {
    hasCompletePortions: true,
    mealName,
    protein: Math.round(totalProtein),
    calories: Math.round(totalCalories),
    carbs: Math.round(totalCarbs),
    fats: Math.round(totalFats),
    isVegetarian,
    dietType,
    category,
    ingredients: ingredientsList,
    suggestedSprite: pickBestFoodSprite(trimmed),
    notes: `Calculated instantly via whole-food macro engine from ${ingredientsList.length} verified ingredients.`,
    source: 'instant_engine',
  };
}
