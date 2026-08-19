'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/ui/Logo';
import { ArrowLeft, Loader2, Mail, CheckCircle2, RefreshCw } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const router = useRouter();

  // Cooldown countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo,
          },
        });
        if (error) throw error;

        // If session exists immediately (e.g. email confirmation disabled), go to dashboard
        if (data.session) {
          router.push('/dashboard');
        } else {
          // Email confirmation is required
          setIsVerificationSent(true);
          setResendCooldown(60);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) throw error;
      setSuccessMsg('A new verification email has been sent. Check your inbox!');
      setResendCooldown(60);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed.');
      setGoogleLoading(false);
    }
  };

  const handleGuestAccess = () => {
    router.push('/dashboard');
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'signup' ? 'login' : 'signup'));
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsVerificationSent(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#080808] px-4 py-12 selection:bg-white selection:text-black">
      {/* Strict Neutral Monochrome Ambient Highlights (Zero Blue Tinge) */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 65%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.015) 0%, transparent 60%)
          `
        }}
      />

      {/* Brand Link (Top Left) */}
      <Link 
        href="/"
        className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20 flex items-center gap-2.5 text-neutral-400 hover:text-white transition-all group"
        aria-label="Back to home"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <Logo className="w-7 h-7 opacity-85 group-hover:opacity-100 transition-opacity" />
        <span className="font-serif font-bold text-sm tracking-tight text-white hidden sm:inline-block">Cyath</span>
      </Link>

      {/* Centered Auth Card */}
      <div className="w-full max-w-[420px] rounded-3xl backdrop-blur-xl bg-white/[0.03] border border-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-6 relative z-10">
        
        {/* Subtle Card Highlight Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* VIEW 1: Email Verification Sent Screen */}
        {isVerificationSent ? (
          <div className="flex flex-col gap-5 py-2">
            {/* Header Icon */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Mail className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Verification Sent
                </span>
              </div>
            </div>

            <div>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white tracking-tight">
                Check your inbox
              </h1>
              <p className="text-neutral-400 text-sm mt-2 font-sans leading-relaxed">
                We sent a verification link to <span className="text-white font-mono font-medium">{email}</span>. Click the link to activate your Cyath protocol.
              </p>
            </div>

            {/* Error & Success Feedback Alerts */}
            {errorMsg && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                {successMsg}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendCooldown > 0 || resending}
                className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {resending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <RefreshCw className={`w-4 h-4 ${resendCooldown > 0 ? '' : 'text-black'}`} />
                )}
                <span>
                  {resendCooldown > 0
                    ? `Resend available in ${resendCooldown}s`
                    : 'Resend Verification Email'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleGuestAccess}
                className="w-full py-2.5 rounded-xl border border-dashed border-white/15 hover:border-white/30 text-xs font-mono text-neutral-400 hover:text-neutral-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View a Demo (Skip to Dashboard)</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsVerificationSent(false);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-neutral-400 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Use a different email address
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: Standard Sign Up / Log In Form */
          <>
            {/* Card Header & Typography (Cabinet Grotesk) */}
            <div>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white tracking-tight">
                {mode === 'signup' ? 'Sign Up' : 'Log In'}
              </h1>
              <p className="text-neutral-400 text-sm mt-1 font-sans">
                {mode === 'signup'
                  ? 'Calibrate habits and unlock correlation telemetry.'
                  : 'Access your saved routines and streak logs.'}
              </p>
            </div>

            {/* Error / Success Feedback Alerts */}
            {errorMsg && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                {successMsg}
              </div>
            )}

            {/* 1. Fast Auth (Google Provider Only) */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={googleLoading || loading}
              className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 text-sm font-medium text-neutral-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.7 0 3 .6 3.9 1.5l2.9-2.9C17 1.9 14.7 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
              )}
              <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
            </button>

            {/* 2. Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* 3. Input Fields & Form */}
            <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5 block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5 block">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all font-sans"
                />
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5 block">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all font-sans"
                  />
                </div>
              )}

              {/* 4. Primary Submit Action */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-3.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 active:scale-[0.98] transition-all shadow-lg mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                <span>{mode === 'signup' ? 'Sign Up' : 'Log In'}</span>
              </button>
            </form>

            {/* 5. View a Demo Button */}
            <button
              type="button"
              onClick={handleGuestAccess}
              className="w-full py-2.5 rounded-xl border border-dashed border-white/15 hover:border-white/30 text-xs font-mono text-neutral-400 hover:text-neutral-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View a Demo</span>
            </button>

            {/* 6. Footer Switch Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {mode === 'signup' ? (
                  <span>
                    Already have an account? <span className="underline underline-offset-4 text-white">Log in</span>
                  </span>
                ) : (
                  <span>
                    Don&apos;t have an account? <span className="underline underline-offset-4 text-white">Sign up</span>
                  </span>
                )}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
