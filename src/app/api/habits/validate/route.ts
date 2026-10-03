import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, checkRateLimit, createRateLimitResponse } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite-preview',
  'gemini-3-flash-preview',
  'gemini-3.8-flash',
  'gemini-3.6-flash',
];

const VALIDATOR_SYSTEM_PROMPT = `You are Cyath's scientific metabolic habit auditor and anti-slop guardian.
Users are creating custom daily habit questions for their 16-bit metabolic health sanctuary (e.g. "Did you take 5g creatine?", "Did you complete 20m Zone 2 cardio?", "Did you take a cold shower?").

Your task:
1. Evaluate whether the submitted habit is a LEGITIMATE, impactful health, cognitive, or metabolic practice.
2. Detect and REJECT low-effort XP-farming habits (e.g. "drank a sip of water", "breathed", "woke up", "blinked", "opened my eyes", "scrolled my phone", or random gibberish/insults).
3. If legitimate (APPROVED):
   - Provide an insightful, encouraging scientific compliment (1-2 sentences) explaining the biological or cognitive mechanism.
   - Assign an XP reward between 30 and 50 based on difficulty/impact.
4. If XP-farming or trivial (FLAGGED):
   - Explain with sharp wit why this provides zero metabolic leverage and cannot be used to farm XP.
   - Suggest a high-leverage alternative.

Output strictly valid JSON matching this schema:
{
  "status": "approved" | "flagged",
  "compliment": "string (encouraging scientific insight if approved, or empty if flagged)",
  "reason": "string (explanation of decision)",
  "suggestedXp": number (30 to 50 if approved, 0 if flagged),
  "alternativeSuggestion": "string (helpful alternative if flagged)"
}
Output raw JSON only. Never wrap in markdown code blocks.`;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit('validate-habit', ip, { maxRequests: 20, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return createRateLimitResponse('Too many requests. Please wait a moment.', rateLimit.retryAfterSeconds);
    }

    const body = await req.json().catch(() => ({}));
    const question = String(body.question || '').trim();
    const category = String(body.category || 'general').trim();

    if (!question || question.length < 3) {
      return NextResponse.json(
        { error: 'Please enter a valid habit or question.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Heuristic fallback if API key is missing
      const lower = question.toLowerCase();
      const isFarming = ['blink', 'breath', 'wake up', 'exist', 'open eye', 'sit', 'scroll'].some(w => lower.includes(w));
      if (isFarming) {
        return NextResponse.json({
          status: 'flagged',
          compliment: '',
          reason: 'This habit appears to be trivial or automated biology rather than an intentional health lever.',
          suggestedXp: 0,
          alternativeSuggestion: 'Try adding an intentional habit like "10-minute post-meal walk" or "No screens 45m before bed".',
        });
      }

      return NextResponse.json({
        status: 'approved',
        compliment: 'Solid intentional habit. Consistency on daily non-negotiables reinforces circadian and neural discipline.',
        reason: 'Valid intentional health habit.',
        suggestedXp: 35,
      });
    }

    const userPrompt = `Habit Question: "${question}"\nCategory: "${category}"`;

    for (const model of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 7000);

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${VALIDATOR_SYSTEM_PROMPT}\n\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 400,
              responseMimeType: 'application/json',
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) continue;

        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        const parsed = JSON.parse(rawText.replace(/```json/gi, '').replace(/```/g, '').trim());

        return NextResponse.json({
          status: parsed.status === 'flagged' ? 'flagged' : 'approved',
          compliment: parsed.compliment || '',
          reason: parsed.reason || '',
          suggestedXp: Number(parsed.suggestedXp) || (parsed.status === 'approved' ? 35 : 0),
          alternativeSuggestion: parsed.alternativeSuggestion || '',
        });
      } catch {
        continue;
      }
    }

    // Default safe fallback if models timed out
    return NextResponse.json({
      status: 'approved',
      compliment: 'Intentional daily practice approved. Consistency compounds biological health.',
      reason: 'Habit accepted.',
      suggestedXp: 35,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
