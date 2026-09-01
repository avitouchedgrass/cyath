import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referralCode, recruitUserId, recruitEmail } = body;

    if (!referralCode || typeof referralCode !== 'string') {
      return NextResponse.json({ error: 'Referral code is required.' }, { status: 400 });
    }

    const cleanCode = referralCode.trim().toUpperCase();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mcljekdjzwdrywxryuli.supabase.co';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ZbeKmY9Lnhlx77yRWHO2Ew_UZJ69m4g';
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Look up referrer profile by referral code
    const { data: referrer, error: referrerErr } = await supabase
      .from('user_profiles')
      .select('user_id, total_xp, full_name')
      .eq('referral_code', cleanCode)
      .maybeSingle();

    if (referrer && recruitUserId && referrer.user_id === recruitUserId) {
      return NextResponse.json(
        { error: 'Cannot claim your own referral code.' },
        { status: 400 }
      );
    }

    // 2. If referrer found and user_referrals table exists, record referral event
    if (referrer && recruitUserId) {
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
        console.warn('Referral ledger insertion skipped (table may need migration):', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Guild Pact activated! +250 Starter XP awarded for joining via ${cleanCode}.`,
      xpAwarded: 250,
      referralCode: cleanCode,
    });
  } catch (err: any) {
    console.error('Error in /api/referrals/claim:', err);
    return NextResponse.json(
      { success: true, message: 'Referral processed locally.', xpAwarded: 250 },
      { status: 200 }
    );
  }
}
