import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateReferralCodeInput, KNOWN_SEED_CODES } from '@/lib/referralUtils';
import { getClientIp, checkRateLimit, createRateLimitResponse } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // 1. IP Sliding Window Rate Limiting (15 attempts / min)
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit('referral_claim', clientIp, {
      windowMs: 60 * 1000,
      maxRequests: 15,
    });

    if (!rateLimit.allowed) {
      return createRateLimitResponse(
        'Too many referral attempts. Please wait a moment before trying again.',
        rateLimit.retryAfterSeconds
      );
    }

    const body = await req.json().catch(() => ({}));
    const { referralCode, recruitUserId, recruitEmail } = body;

    // 2. Strict input & format validation (no links, URLs, or gibberish)
    const validation = validateReferralCodeInput(referralCode);
    if (!validation.valid || !validation.cleanCode) {
      return NextResponse.json(
        { error: validation.error || 'Please enter a valid referral code.' },
        { status: 400 }
      );
    }

    const cleanCode = validation.cleanCode;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mcljekdjzwdrywxryuli.supabase.co';
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'sb_publishable_ZbeKmY9Lnhlx77yRWHO2Ew_UZJ69m4g';
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 2. Check if recruit user has already claimed a referral bonus
    if (recruitUserId && !recruitUserId.startsWith('guest_')) {
      const { data: recruitProfile } = await supabase
        .from('user_profiles')
        .select('claimed_referral, referral_code')
        .eq('user_id', recruitUserId)
        .maybeSingle();

      if (recruitProfile?.claimed_referral) {
        return NextResponse.json(
          { error: 'You have already claimed a starter referral code on this account.' },
          { status: 400 }
        );
      }

      if (recruitProfile?.referral_code === cleanCode) {
        return NextResponse.json(
          { error: 'You cannot claim your own referral code.' },
          { status: 400 }
        );
      }
    }

    // 3. Look up referrer in database
    const { data: referrer, error: referrerErr } = await supabase
      .from('user_profiles')
      .select('user_id, total_xp, full_name, referral_code')
      .eq('referral_code', cleanCode)
      .maybeSingle();

    const isKnownSeedCode = KNOWN_SEED_CODES.has(cleanCode);

    // If code doesn't exist in Supabase and is not an official system seed code -> REJECT!
    if (!referrer && !isKnownSeedCode) {
      return NextResponse.json(
        {
          error: `Referral code "${cleanCode}" does not exist. Please check with your companion for their active code.`,
        },
        { status: 404 }
      );
    }

    // Prevent self-referral by user_id
    if (referrer && recruitUserId && referrer.user_id === recruitUserId) {
      return NextResponse.json(
        { error: 'You cannot claim your own referral code.' },
        { status: 400 }
      );
    }

    // 4. If referrer found and user is logged in, credit referrer with +250 XP & log referral ledger
    if (referrer && recruitUserId && !recruitUserId.startsWith('guest_')) {
      try {
        await supabase.from('user_referrals').insert({
          referrer_id: referrer.user_id,
          referred_user_id: recruitUserId,
          referral_code: cleanCode,
          xp_awarded: 250,
        });

        // Credit referrer with +250 XP
        const newReferrerXp = (referrer.total_xp || 0) + 250;
        await supabase
          .from('user_profiles')
          .update({
            total_xp: newReferrerXp,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', referrer.user_id);

        await supabase.from('xp_events').insert({
          user_id: referrer.user_id,
          amount: 250,
          reason: `Guild Recruit Bonus (${recruitEmail || 'Friend'})`,
          source: 'referral',
        });
      } catch (dbErr) {
        console.warn('Referral ledger insertion warning:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Guild Pact activated! +250 Starter XP awarded for joining via ${cleanCode}.`,
      xpAwarded: 250,
      referralCode: cleanCode,
      referrerName: referrer?.full_name || 'Guild Member',
    });
  } catch (err: any) {
    console.error('Error in /api/referrals/claim:', err);
    return NextResponse.json(
      { error: 'Unable to verify referral code. Please check your internet connection.' },
      { status: 500 }
    );
  }
}
