import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface VisionExtractionResult {
  name: string;
  subtitle: string;
  category: 'High Protein' | 'Steady Carbs' | 'Quick Fuel' | 'Keto Clean' | 'Post Workout';
  dietType: 'vegetarian' | 'vegan' | 'pescatarian' | 'omnivore';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prepTimeMinutes: number;
  focusScore: string;
  tags: string[];
  description: string;
  ingredients: { item: string; amount: string }[];
  instructions: string[];
  reasoningSteps: string[];
}

const VISION_SYSTEM_PROMPT = `You are Cyath's scientific nutritional computer vision and metabolic reasoning AI.
You are inspecting an ACTUAL photograph of a real dish or food plate provided by the user.

Your task:
1. Examine the image carefully. Identify the exact dish, visible items, textures, colors, cooking method (fried, baked, grilled, steamed, sautéed), and portion sizes.
2. Decompose the plate into specific ingredients with realistic estimated gram weights (e.g., "Paneer cubes: 160g", "Basmati rice: 150g", "Ghee/Oil: 15ml", "Tomato gravy: 120g").
3. Accurately calculate nutritional macronutrients based on USDA standard reference values for the estimated portions:
   - Total Calories (kcal)
   - Protein (g)
   - Carbohydrates (g)
   - Fats (g)
4. Classify:
   - category: strictly one of ["High Protein", "Steady Carbs", "Quick Fuel", "Keto Clean", "Post Workout"]
   - dietType: strictly one of ["vegetarian", "vegan", "pescatarian", "omnivore"]
5. Formulate 3 to 5 chain-of-thought visual reasoning steps explicitly detailing:
   - What visual markers you spotted (e.g. "Recognized red kidney bean legumes simmered in spiced tomato gravy alongside long-grain basmati...")
   - Why you estimated the particular volume/weight
   - How you computed the macronutrient density and calorie count
6. Provide accurate culinary preparation instructions to recreate the dish.

Output strictly valid JSON matching this schema:
{
  "name": "string",
  "subtitle": "string",
  "category": "High Protein" | "Steady Carbs" | "Quick Fuel" | "Keto Clean" | "Post Workout",
  "dietType": "vegetarian" | "vegan" | "pescatarian" | "omnivore",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number,
  "prepTimeMinutes": number,
  "focusScore": "string (e.g. 9.2/10)",
  "tags": ["string"],
  "description": "string",
  "ingredients": [{ "item": "string", "amount": "string" }],
  "instructions": ["string"],
  "reasoningSteps": ["string"]
}`;

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash',
  'gemini-flash-latest',
];

async function callGeminiVision(apiKey: string, model: string, base64Data: string, mimeType: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: VISION_SYSTEM_PROMPT },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.1,
      },
    }),
  });

  return res;
}

// In-memory rate limiting map: ip -> timestamps
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;
const MAX_IMAGE_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown_ip';
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;
    const timestamps = (rateLimitMap.get(ip) || []).filter((t) => t > windowStart);

    if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { error: 'Scan request limit exceeded. Please wait a minute before scanning another meal.' },
        { status: 429 }
      );
    }
    timestamps.push(now);
    rateLimitMap.set(ip, timestamps);

    const body = await req.json();
    const { image, mimeType = 'image/jpeg', apiKey } = body;

    // 2. Input & Payload Validation
    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'No food image was provided to scan.' }, { status: 400 });
    }

    if (image.length > MAX_IMAGE_PAYLOAD_BYTES) {
      return NextResponse.json({ error: 'Image payload exceeds 10MB limit.' }, { status: 413 });
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json({ error: 'Unsupported image format. Please upload a JPEG, PNG, or WebP image.' }, { status: 415 });
    }

    // Resolve server-side API key for all users
    const activeKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || apiKey;

    if (!activeKey) {
      return NextResponse.json(
        {
          error: 'AI Plate Scanner is temporarily unavailable on this deployment. Please verify server environment variables.',
        },
        { status: 503 }
      );
    }

    // Strip data URI prefix if present
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');

    // Try candidate models sequentially until one succeeds
    let lastError: string = '';
    let parsedRecipe: VisionExtractionResult | null = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await callGeminiVision(activeKey, model, base64Data, mimeType);

        if (!response.ok) {
          const errBody = await response.text();
          lastError = `Model ${model} returned HTTP ${response.status}: ${errBody}`;
          console.warn(lastError);
          continue;
        }

        const data = await response.json();
        let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
          lastError = `Model ${model} returned empty candidates`;
          continue;
        }

        // Clean markdown backticks if present
        rawText = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();

        const parsed = JSON.parse(rawText);

        // Normalize reasoningSteps (in case model returned objects like [{step: "..."}])
        let normalizedReasoning: string[] = [];
        if (Array.isArray(parsed.reasoningSteps)) {
          normalizedReasoning = parsed.reasoningSteps.map((r: any) =>
            typeof r === 'string' ? r : r?.step || r?.description || JSON.stringify(r)
          );
        }

        // Normalize ingredients
        let normalizedIngredients = Array.isArray(parsed.ingredients)
          ? parsed.ingredients.map((ing: any) => ({
              item: String(ing.item || ing.name || 'Ingredient'),
              amount: String(ing.amount || ing.portion || ing.quantity || '1 serving'),
            }))
          : [{ item: 'Whole Food Plate Ingredients', amount: '1 serving' }];

        parsedRecipe = {
          name: parsed.name || 'Identified Dish',
          subtitle: parsed.subtitle || 'Freshly prepared whole-food plate',
          category: parsed.category || 'High Protein',
          dietType: parsed.dietType || 'omnivore',
          calories: Number(parsed.calories) || 500,
          protein: Number(parsed.protein) || 30,
          carbs: Number(parsed.carbs) || 45,
          fats: Number(parsed.fats) || 15,
          prepTimeMinutes: Number(parsed.prepTimeMinutes) || 20,
          focusScore: parsed.focusScore || '9.0/10',
          tags: Array.isArray(parsed.tags) ? parsed.tags : ['Vision Scanned', 'Whole Food'],
          description: parsed.description || 'Nutritional breakdown computed via computer vision.',
          ingredients: normalizedIngredients,
          instructions: Array.isArray(parsed.instructions)
            ? parsed.instructions
            : ['Prepare ingredients and serve hot.'],
          reasoningSteps: normalizedReasoning,
        };

        break;
      } catch (err: any) {
        lastError = err?.message || 'Inference error';
        console.warn(`Attempt with ${model} failed:`, err);
      }
    }

    if (!parsedRecipe) {
      return NextResponse.json(
        {
          error: `AI Vision analysis failed across models. ${lastError}`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      recipe: parsedRecipe,
      source: 'gemini-live-vision',
    });
  } catch (error: any) {
    console.error('Fatal error in /api/ai/scan-recipe:', error);
    return NextResponse.json(
      { error: error?.message || 'Unexpected failure while running computer vision model.' },
      { status: 500 }
    );
  }
}
