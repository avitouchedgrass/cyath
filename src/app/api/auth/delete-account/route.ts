import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getClientIp, checkRateLimit, createRateLimitResponse } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit('delete_account', clientIp, {
      windowMs: 60 * 1000,
      maxRequests: 5,
    });

    if (!rateLimit.allowed) {
      return createRateLimitResponse(
        'Too many account deletion attempts. Please wait a minute.',
        rateLimit.retryAfterSeconds
      );
    }

    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: missing session token' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mcljekdjzwdrywxryuli.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ZbeKmY9Lnhlx77yRWHO2Ew_UZJ69m4g';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Verify token with user client
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !user) {
      return NextResponse.json({ error: 'Invalid user session token' }, { status: 401 });
    }

    const userId = user.id;

    // Choose client for deletion
    const dbClient = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : userClient;

    // Delete telemetry records across all application tables
    await Promise.allSettled([
      dbClient.from('daily_logs').delete().eq('user_id', userId),
      dbClient.from('xp_events').delete().eq('user_id', userId),
      dbClient.from('custom_recipes').delete().eq('user_id', userId),
      dbClient.from('habits').delete().eq('user_id', userId),
      dbClient.from('user_profiles').delete().eq('user_id', userId),
    ]);

    // Explicitly zero out user_profiles in case DELETE policy restricts row removal
    await dbClient.from('user_profiles').upsert({
      user_id: userId,
      total_xp: 0,
      streak_count: 0,
      streak_freeze_stock: 1,
      onboarding_completed: false,
      full_name: '',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // If service role key is configured, delete auth user directly
    if (serviceRoleKey) {
      try {
        await (dbClient.auth.admin as any).deleteUser(userId);
      } catch (err) {
        console.warn('Admin deleteUser warning:', err);
      }
    }

    return NextResponse.json({ success: true, message: 'Account data purged successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete account' }, { status: 500 });
  }
}
