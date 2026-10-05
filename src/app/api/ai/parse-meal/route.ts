import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, checkRateLimit, createRateLimitResponse } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export interface MissingPortionItem {
  name: string;
  prompt: string;
  suggestedOptions: string[];
}

export interface ParsedMealSuccess {
  hasCompletePortions: true;
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
}

export interface ParsedMealIncomplete {
  hasCompletePortions: false;
  missingItems: MissingPortionItem[];
  clarificationQuestion: string;
}

export type ParsedMealResponse = ParsedMealSuccess | ParsedMealIncomplete;

const CANDIDATE_SPRITES = [
  { keywords: ['chicken', 'breast', 'poultry'], url: '/assets/food/grilled-chicken-1.0.png' },
  { keywords: ['tikka', 'tandoori'], url: '/assets/food/chicken-tikka-1.0.png' },
  { keywords: ['egg', 'eggs', 'omelet', 'scramble'], url: '/assets/food/skillet-eggs-1.0.png' },
  { keywords: ['egg rice', 'fried rice'], url: '/assets/food/egg-rice-bowl-1.0.png' },
  { keywords: ['paneer', 'cottage cheese'], url: '/assets/food/paneer-bhurji-1.0.png' },
  { keywords: ['salmon', 'fish', 'tuna'], url: '/assets/food/greek-salmon-1.0.png' },
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

function pickBestSprite(text: string): string {
  const lower = text.toLowerCase();
  for (const item of CANDIDATE_SPRITES) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.url;
    }
  }
  return '/assets/food/generic-plate.webp';
}

import { parseInstantMeal, extractExplicitMacros, stripExplicitMacroText } from '@/lib/instantMacroEngine';

const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
];

const MEAL_PARSER_SYSTEM_PROMPT = `You are Cyath's scientific nutritional analyst.
Your task is to analyze meals entered by users in natural language.

STEP 0: STRICT FOOD VALIDATION:
Examine if the user entry actually describes edible food, beverages, ingredients, or a meal.
If the input is:
- Random letters or gibberish (e.g. "asdfgh", "qwerty", "xyz123", "blabla")
- Non-food objects, animals, or hardware (e.g. "table", "laptop", "car", "shoes")
- Non-food activities or emotions (e.g. "i ran 10k", "feeling tired", "hello there", "what is this")
You MUST immediately reject it and return strictly:
{
  "isNotFood": true,
  "error": "This does not appear to be food. Please enter what you actually ate (e.g. '2 boiled eggs with sourdough' or 'Paneer bowl with rice')."
}

STEP 0.5: EXPLICIT MACRONUTRIENT DECLARATIONS (CRITICAL OVERRIDE):
If the user explicitly specifies any macro or calorie counts (e.g. "40g protein", "500 calories", "35g carbs", "10g fat", "protein: 45g", "shake with 30g protein"):
1. You MUST adopt and preserve these EXACT numerical values in your final output (protein, calories, carbs, fats). Do not alter or re-estimate user-declared macros!
2. Do NOT confuse macro declarations (such as "40g protein") with food portion weight (such as "40g of chicken").
3. If explicit macros are provided for the meal, consider the nutritional portions complete (hasCompletePortions: true). Do NOT ask for serving clarifications if the user already provided the exact macro payload!

CRITICAL INSTRUCTION: CHECKING SERVING SIZES:
1. Deconstruct the meal into its primary components/ingredients.
2. Carefully inspect whether a quantifiable serving size, weight, or portion count is specified for EVERY main item in the meal.
   - Counted/measurable units count as portions (e.g. "2 eggs", "150g chicken", "1 cup rice", "2 slices bread", "1 tbsp olive oil", "1 apple", "1 scoop whey").
   - If an item is mentioned with NO quantity/serving size (e.g. user just said "chicken and rice", "salmon with broccoli", "curry with roti") and NO explicit macros were stated, then serving sizes are MISSING for those items.
3. If ANY main item lacks a serving size or portion count AND no explicit macros were provided:
   You MUST return "hasCompletePortions": false.
   List each missing item with a helpful prompt and 3 realistic suggested portion options.
   Example JSON:
   {
     "hasCompletePortions": false,
     "missingItems": [
       {
         "name": "Chicken breast",
         "prompt": "How much chicken breast did you have?",
         "suggestedOptions": ["1 medium breast (~150g)", "200g (large portion)", "100g (half breast)"]
       },
       {
         "name": "Rice",
         "prompt": "How much rice?",
         "suggestedOptions": ["1 cup cooked (~150g)", "1/2 cup (~75g)", "2 cups (~300g)"]
       }
     ],
     "clarificationQuestion": "Please specify the serving size for: Chicken breast, Rice."
   }

4. If serving sizes/portions ARE specified for EVERYTHING in the meal (or provided via user clarifications or explicit macros):
   Calculate nutritional metrics based on standard USDA whole-food reference values, respecting any explicit user declarations.
   Determine:
   - mealName: concise, appetizing title
   - protein: total protein in grams (integer)
   - calories: total calories in kcal (integer)
   - carbs: total carbohydrates in grams (integer)
   - fats: total dietary fats in grams (integer)
   - isVegetarian: true if contains no meat, poultry, fish, seafood.
   - dietType: strictly one of ["vegetarian", "vegan", "eggetarian", "pescatarian", "omnivore"]
   - category: strictly one of ["High Protein", "Steady Carbs", "Quick Fuel", "Keto Clean", "Post Workout"]
   - ingredients: array of {"item": string, "amount": string}
   - notes: short sentence explaining key nutritional anchors.

   Example JSON:
   {
     "hasCompletePortions": true,
     "mealName": "Herb Grilled Chicken with Steamed Jasmine Rice & Broccoli",
     "protein": 44,
     "calories": 510,
     "carbs": 48,
     "fats": 11,
     "isVegetarian": false,
     "dietType": "omnivore",
     "category": "High Protein",
     "ingredients": [
       {"item": "Chicken Breast", "amount": "180g"},
       {"item": "Jasmine Rice (cooked)", "amount": "1 cup (150g)"},
       {"item": "Steamed Broccoli", "amount": "1 cup (90g)"}
     ],
     "notes": "Whole-food balanced plate with 44g bioavailable protein."
   }

FORMATTING RULE:
Output raw valid JSON only. Never wrap in markdown codeblocks. Do not include emojis.`;

export function fallbackHeuristicParse(text: string, clarifications?: Record<string, string>): ParsedMealResponse {
  const combined = `${text} ${Object.entries(clarifications || {}).map(([k, v]) => `${k}: ${v}`).join(' ')}`.trim();
  const lower = combined.toLowerCase();
  const explicit = extractExplicitMacros(text);

  // Extract primary potential ingredients
  const rawParts = stripExplicitMacroText(text)
    .split(/,|\band\b|\bwith\b|\+/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);

  const missing: MissingPortionItem[] = [];

  for (const part of rawParts) {
    const partLower = part.toLowerCase();
    // Check if this part has clarification provided
    const hasClarification = Object.keys(clarifications || {}).some(
      (k) => partLower.includes(k.toLowerCase()) || k.toLowerCase().includes(partLower)
    );

    if (hasClarification) continue;

    // Check if portion is mentioned in this part
    const hasPortionPattern = /\d+\s*(g|grams|oz|cup|cups|tbsp|tsp|slice|slices|piece|pieces|bowl|bowls|scoop|scoops|ml|l|can|cans|serving|servings)?/i.test(part) ||
      /\b(one|two|three|four|half|quarter|single|double)\b/i.test(part);

    if (!hasPortionPattern && explicit.protein === undefined && explicit.calories === undefined) {
      let defaultSuggestions = ['1 standard portion (~150g)', '200g (large)', '100g (small)'];
      if (partLower.includes('egg')) {
        defaultSuggestions = ['2 large eggs', '3 large eggs', '1 egg'];
      } else if (partLower.includes('rice') || partLower.includes('oats') || partLower.includes('pasta')) {
        defaultSuggestions = ['1 cup cooked (~150g)', '1/2 cup (~75g)', '2 cups (~300g)'];
      } else if (partLower.includes('chicken') || partLower.includes('salmon') || partLower.includes('steak') || partLower.includes('paneer') || partLower.includes('tofu')) {
        defaultSuggestions = ['150g (standard)', '200g (high protein)', '100g (light)'];
      } else if (partLower.includes('bread') || partLower.includes('toast') || partLower.includes('roti')) {
        defaultSuggestions = ['2 slices / rotis', '1 slice / roti', '3 slices / rotis'];
      }

      missing.push({
        name: part,
        prompt: `How much ${part} did you have?`,
        suggestedOptions: defaultSuggestions,
      });
    }
  }

  // If items lack portions and no clarification was given
  if (missing.length > 0) {
    return {
      hasCompletePortions: false,
      missingItems: missing,
      clarificationQuestion: `Please specify the serving size for: ${missing.map((m) => m.name).join(', ')}.`,
    };
  }

  // Calculate realistic heuristic macros
  let protein = explicit.protein !== undefined ? explicit.protein : 15;
  let calories = explicit.calories !== undefined ? explicit.calories : 250;
  let carbs = explicit.carbs !== undefined ? explicit.carbs : 25;
  let fats = explicit.fats !== undefined ? explicit.fats : 8;
  let isVegetarian = true;
  let isVegan = true;
  let dietType: ParsedMealSuccess['dietType'] = 'vegan';

  const ingredientsList: Array<{ item: string; amount: string }> = [];

  if (/chicken|turkey|poultry/i.test(lower)) {
    protein += 35;
    calories += 200;
    fats += 5;
    isVegetarian = false;
    isVegan = false;
    dietType = 'omnivore';
    ingredientsList.push({ item: 'Chicken Breast / Poultry', amount: '160g' });
  }

  if (/steak|beef|lamb|pork|meat/i.test(lower)) {
    protein += 38;
    calories += 280;
    fats += 14;
    isVegetarian = false;
    isVegan = false;
    dietType = 'omnivore';
    ingredientsList.push({ item: 'Lean Red Meat', amount: '180g' });
  }

  if (/salmon|fish|tuna|prawn|shrimp/i.test(lower)) {
    protein += 32;
    calories += 220;
    fats += 10;
    isVegetarian = false;
    isVegan = false;
    dietType = 'pescatarian';
    ingredientsList.push({ item: 'Fish / Seafood', amount: '170g' });
  }

  if (/egg|eggs|omelet/i.test(lower)) {
    protein += 18;
    calories += 160;
    fats += 11;
    isVegan = false;
    if (isVegetarian) dietType = 'eggetarian';
    ingredientsList.push({ item: 'Whole Eggs', amount: '2-3 eggs' });
  }

  if (/paneer|cheese|yogurt|curd|milk|whey/i.test(lower)) {
    protein += 22;
    calories += 210;
    fats += 12;
    isVegan = false;
    if (isVegetarian && dietType !== 'eggetarian') dietType = 'vegetarian';
    ingredientsList.push({ item: 'Dairy / Paneer / Yogurt', amount: '150g' });
  }

  if (/tofu|soya|soy|tempeh/i.test(lower)) {
    protein += 24;
    calories += 180;
    fats += 8;
    ingredientsList.push({ item: 'Tofu / Soya', amount: '180g' });
  }

  if (/rice|quinoa|grain|oats|bread|toast|roti|pasta|potato/i.test(lower)) {
    carbs += 40;
    calories += 210;
    protein += 5;
    ingredientsList.push({ item: 'Complex Carbs / Grain', amount: '1 cup / 150g' });
  }

  if (/avocado|oil|butter|nuts|peanut/i.test(lower)) {
    fats += 12;
    calories += 130;
    ingredientsList.push({ item: 'Healthy Fats / Seasoning', amount: '1 serving' });
  }

  if (ingredientsList.length === 0) {
    ingredientsList.push({ item: text.slice(0, 40), amount: '1 measured serving' });
  }

  const category: ParsedMealSuccess['category'] = protein >= 30 ? 'High Protein' : carbs >= 50 ? 'Steady Carbs' : 'Quick Fuel';

  // Capitalize meal name cleanly
  const words = text.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const mealName = words.slice(0, 6).join(' ') || 'Whole Food Meal';

  return {
    hasCompletePortions: true,
    mealName,
    protein,
    calories,
    carbs,
    fats,
    isVegetarian,
    dietType,
    category,
    ingredients: ingredientsList,
    suggestedSprite: pickBestSprite(text),
    notes: `Calculated from ${ingredientsList.length} calibrated ingredients.`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit('parse-meal', ip, { maxRequests: 30, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return createRateLimitResponse('Too many meal requests. Please slow down.', rateLimit.retryAfterSeconds);
    }

    const body = await req.json().catch(() => ({}));
    const rawText = String(body.text || '').trim();
    const clarifications: Record<string, string> = body.clarifications || {};

    if (!rawText) {
      return NextResponse.json(
        { error: 'Meal description text is required' },
        { status: 400 }
      );
    }

    const explicitMacros = extractExplicitMacros(rawText);

    // Fast path: if instant whole-food engine can resolve it completely, return with zero latency
    const instantResult = parseInstantMeal(rawText, clarifications);
    if (instantResult && instantResult.hasCompletePortions) {
      return NextResponse.json(instantResult);
    }
    if (instantResult?.isNotFood) {
      return NextResponse.json(
        { error: instantResult.error || 'This does not appear to be food. Please enter what you actually ate.' },
        { status: 422 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      if (instantResult) {
        return NextResponse.json(instantResult);
      }
      const fallback = fallbackHeuristicParse(rawText, clarifications);
      return NextResponse.json(fallback);
    }

    let userPrompt = `User Meal Entry: "${rawText}"`;
    if (Object.keys(clarifications).length > 0) {
      userPrompt += `\nUser Clarified Serving Sizes: ${JSON.stringify(clarifications)}`;
    }
    if (explicitMacros.hasAny) {
      userPrompt += `\nExplicitly Declared User Macros: ${JSON.stringify(explicitMacros)} (MUST PRESERVE IN OUTPUT)`;
    }

    const contents = [
      {
        role: 'user',
        parts: [{ text: `${MEAL_PARSER_SYSTEM_PROMPT}\n\n${userPrompt}` }],
      },
    ];

    let lastError: any = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6500);

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 800,
              responseMimeType: 'application/json',
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
          lastError = new Error(`Model ${model} returned HTTP ${res.status}`);
          continue;
        }

        const data = await res.json();
        const rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!rawResponse) {
          lastError = new Error(`Empty response from ${model}`);
          continue;
        }

        const cleaned = rawResponse
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```$/i, '')
          .trim();

        const parsed = JSON.parse(cleaned);

        if (parsed.isNotFood) {
          return NextResponse.json(
            { error: parsed.error || 'This does not appear to be a food item. Please enter what you actually ate.' },
            { status: 422 }
          );
        }

        // If explicit macros were stated, enforce them over LLM hallucinations/underestimates
        if (explicitMacros.hasAny && (explicitMacros.protein !== undefined || explicitMacros.calories !== undefined)) {
          parsed.hasCompletePortions = true;
          if (explicitMacros.protein !== undefined) parsed.protein = explicitMacros.protein;
          if (explicitMacros.calories !== undefined) parsed.calories = explicitMacros.calories;
          if (explicitMacros.carbs !== undefined) parsed.carbs = explicitMacros.carbs;
          if (explicitMacros.fats !== undefined) parsed.fats = explicitMacros.fats;
          if (!parsed.ingredients || parsed.ingredients.length === 0) {
            parsed.ingredients = [{ item: parsed.mealName || rawText, amount: '1 calibrated portion' }];
          }
          if (parsed.protein >= 30) parsed.category = 'High Protein';
        }

        if (parsed.hasCompletePortions) {
          if (!parsed.suggestedSprite) {
            parsed.suggestedSprite = pickBestSprite(parsed.mealName || rawText);
          }
        }

        return NextResponse.json(parsed);
      } catch (err) {
        lastError = err;
      }
    }

    // If all models failed or timed out, gracefully return offline heuristic parse
    const fallback = fallbackHeuristicParse(rawText, clarifications);
    return NextResponse.json(fallback);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to parse meal' },
      { status: 500 }
    );
  }
}
