import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (err) {
      console.error('Error exchanging code for session:', err);
    }
  }

  // URL to redirect to after email confirmation/password recovery completes
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}
