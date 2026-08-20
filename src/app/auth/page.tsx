'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useHabitStore } from '@/store/useHabitStore';
import { Logo } from '@/components/ui/Logo';
import { ArrowLeft, Loader2, Mail, CheckCircle2, RefreshCw, KeyRound, Lock } from 'lucide-react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'update_password' || searchParams.get('reset') === 'true'
    ? 'update_password'
    : (searchParams.get('mode') as 'signup' | 'login' | 'forgot' | 'update_password') || 'signup';

  const [mode, setMode] = useState<'signup' | 'login' | 'forgot' | 'update_password'>(initialMode);
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

  // Password Complexity Standards
  const passwordCriteria = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  };
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  // Cooldown countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auth State Listener (handles verification and password recovery events)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('update_password');
        setErrorMsg(null);
        setSuccessMsg(null);
      } else if (isVerificationSent && session?.user?.id && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        setSuccessMsg('Email verified successfully! Calibrating your account...');
        setTimeout(() => {
          completeAuthentication({ id: session.user.id, email: session.user.email || email });
        }, 1200);
      }
    });

    // Heartbeat polling for verification screen
    let pollTimer: NodeJS.Timeout | null = null;
    if (isVerificationSent) {
      pollTimer = setInterval(async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            setSuccessMsg('Email verified successfully! Calibrating your account...');
            if (pollTimer) clearInterval(pollTimer);
            setTimeout(() => {
              completeAuthentication({ id: session.user.id, email: session.user.email || email });
            }, 1200);
          }
        } catch {
          // Continue polling
        }
      }, 2500);
    }

    return () => {
      subscription.unsubscribe();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [isVerificationSent, email]);

  const completeAuthentication = (user?: { id: string; email?: string }) => {
    const { setUserSession, executePendingAction, userProfile } = useHabitStore.getState();
    if (user) {
      setUserSession(user);
    } else {
      useHabitStore.getState().initDemoSession();
      router.push('/dashboard');
      return;
    }

    const { success, executedAction } = executePendingAction();
    
    // If onboarding not completed, route to onboarding wizard
    const needsOnboarding = !userProfile || !userProfile.onboardingCompleted;
    if (needsOnboarding) {
      router.push('/onboarding');
      return;
    }

    if (success && executedAction) {
      const destination = executedAction.returnUrl || '/dashboard';
      router.push(destination);
    } else {
      router.push('/dashboard');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'signup') {
      if (!isPasswordValid) {
        setErrorMsg('Please satisfy all password complexity requirements.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
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

        // If identities array is empty, the account already exists
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          setErrorMsg('An account with this email address already exists. Please log in instead.');
          setLoading(false);
          return;
        }

        if (data.session) {
          completeAuthentication({ id: data.session.user.id, email: data.session.user.email || email });
        } else {
          setIsVerificationSent(true);
          setResendCooldown(60);
        }
      } else if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        completeAuthentication({ id: data.user.id, email: data.user.email || email });
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (
        msg.toLowerCase().includes('already registered') ||
        msg.toLowerCase().includes('already exists') ||
        msg.toLowerCase().includes('user already exists') ||
        msg.toLowerCase().includes('duplicate')
      ) {
        setErrorMsg('An account with this email address already exists. Please log in instead.');
      } else {
        setErrorMsg(msg || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback?next=/auth?mode=update_password`
        : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });
      if (error) throw error;

      setSuccessMsg(`We've sent a password reset link to ${email}. Check your inbox to proceed.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isPasswordValid) {
      setErrorMsg('Please satisfy all password complexity requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      if (error) throw error;

      setSuccessMsg('Password updated successfully! Redirecting to your dashboard...');
      setTimeout(() => {
        if (data.user) {
          completeAuthentication({ id: data.user.id, email: data.user.email });
        } else {
          router.push('/dashboard');
        }
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password. Your reset link may have expired.');
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
    useHabitStore.getState().initDemoSession();
    const { success, executedAction } = useHabitStore.getState().executePendingAction();
    if (success && executedAction?.returnUrl) {
      router.push(executedAction.returnUrl);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#080808] px-4 py-12 selection:bg-white selection:text-black">
      {/* Strict Neutral Monochrome Ambient Highlights */}
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
        className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20 flex items-center gap-2.5 text-slate-400 hover:text-white transition-all group"
        aria-label="Back to home"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <Logo className="w-7 h-7 opacity-85 group-hover:opacity-100 transition-opacity" />
        <span className="font-serif font-medium text-sm tracking-tight text-white hidden sm:inline-block">Cyath</span>
      </Link>

      {/* Centered Auth Card */}
      <div className="w-full max-w-[420px] rounded-2xl backdrop-blur-xl bg-white/[0.025] border border-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-6 relative z-10">
        
        {/* Subtle Card Highlight Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* VIEW 1: Email Verification Sent Screen */}
        {isVerificationSent ? (
          <div className="flex flex-col gap-5 py-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Mail className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/[0.04] text-slate-300 border border-white/10">
                  <CheckCircle2 className="w-3 h-3" /> Verification Sent
                </span>
              </div>
            </div>

            <div>
              <h1 className="font-cabinet font-bold text-2xl sm:text-3xl text-white tracking-tight">
                Check your inbox
              </h1>
              <p className="text-slate-400 text-sm mt-2 font-sans leading-relaxed">
                We sent a verification link to <span className="text-white font-mono font-medium">{email}</span>. Click the link to activate your Cyath protocol.
              </p>
            </div>

            {errorMsg && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="px-4 py-3 rounded-xl bg-white/[0.05] border border-white/20 text-white text-xs font-mono">
                {successMsg}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendCooldown > 0 || resending}
                className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-slate-200 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                className="w-full py-2.5 rounded-xl border border-dashed border-white/15 hover:border-white/30 text-xs font-mono text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                  className="text-xs text-slate-400 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Use a different email address
                </button>
              </div>
            </div>
          </div>
        ) : mode === 'forgot' ? (
          /* VIEW 2: Request Password Reset Form */
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  Account Recovery
                </span>
                <h1 className="font-cabinet font-bold text-2xl text-white tracking-tight">
                  Reset Password
                </h1>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm font-sans leading-relaxed">
              Enter the email address associated with your account and we&apos;ll send you a secure recovery link.
            </p>

            {errorMsg && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="px-4 py-3 rounded-xl bg-white/[0.05] border border-white/20 text-white text-xs font-mono">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleResetPasswordRequest} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-slate-200 active:scale-[0.98] transition-all shadow-lg mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                <span>Send Reset Link</span>
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Back to Log In
              </button>
            </div>
          </div>
        ) : mode === 'update_password' ? (
          /* VIEW 3: Set New Password Form */
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  Security Update
                </span>
                <h1 className="font-cabinet font-bold text-2xl text-white tracking-tight">
                  Set New Password
                </h1>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm font-sans leading-relaxed">
              Create a strong new password for your Cyath account.
            </p>

            {errorMsg && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="px-4 py-3 rounded-xl bg-white/[0.05] border border-white/20 text-white text-xs font-mono">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 block">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all font-sans"
                />
              </div>

              {password.length > 0 && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Password Security
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.length ? 'text-white' : 'text-slate-600'}`}>
                      <span>{passwordCriteria.length ? '✓' : '○'}</span>
                      <span>8+ Characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasUpper ? 'text-white' : 'text-slate-600'}`}>
                      <span>{passwordCriteria.hasUpper ? '✓' : '○'}</span>
                      <span>Uppercase (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasLower ? 'text-white' : 'text-slate-600'}`}>
                      <span>{passwordCriteria.hasLower ? '✓' : '○'}</span>
                      <span>Lowercase (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? 'text-white' : 'text-slate-600'}`}>
                      <span>{passwordCriteria.hasNumber ? '✓' : '○'}</span>
                      <span>Number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasSymbol ? 'text-white' : 'text-slate-600'} col-span-2`}>
                      <span>{passwordCriteria.hasSymbol ? '✓' : '○'}</span>
                      <span>Special Symbol (!@#$%)</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-slate-200 active:scale-[0.98] transition-all shadow-lg mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                <span>Save New Password</span>
              </button>
            </form>
          </div>
        ) : (
          /* VIEW 4: Standard Sign Up / Log In Form */
          <>
            <div>
              <h1 className="font-cabinet font-bold text-3xl sm:text-4xl text-white tracking-tight">
                {mode === 'signup' ? 'Sign Up' : 'Log In'}
              </h1>
              <p className="text-slate-400 text-sm mt-1 font-sans">
                {mode === 'signup'
                  ? 'Calibrate habits and unlock correlation telemetry.'
                  : 'Access your saved routines and streak logs.'}
              </p>
            </div>

            {errorMsg && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="px-4 py-3 rounded-xl bg-white/[0.05] border border-white/20 text-white text-xs font-mono">
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
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* 3. Input Fields & Form */}
            <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all font-sans"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all font-sans"
                />
              </div>

              {mode === 'signup' && password.length > 0 && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Password Security
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.length ? 'text-white' : 'text-slate-600'}`}>
                      <span>{passwordCriteria.length ? '✓' : '○'}</span>
                      <span>8+ Characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasUpper ? 'text-white' : 'text-slate-600'}`}>
                      <span>{passwordCriteria.hasUpper ? '✓' : '○'}</span>
                      <span>Uppercase (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasLower ? 'text-white' : 'text-slate-600'}`}>
                      <span>{passwordCriteria.hasLower ? '✓' : '○'}</span>
                      <span>Lowercase (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? 'text-white' : 'text-slate-600'}`}>
                      <span>{passwordCriteria.hasNumber ? '✓' : '○'}</span>
                      <span>Number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasSymbol ? 'text-white' : 'text-slate-600'} col-span-2`}>
                      <span>{passwordCriteria.hasSymbol ? '✓' : '○'}</span>
                      <span>Special Symbol (!@#$%)</span>
                    </div>
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 block">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all font-sans"
                  />
                </div>
              )}

              {/* 4. Primary Submit Action */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-3.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-slate-200 active:scale-[0.98] transition-all shadow-lg mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                <span>{mode === 'signup' ? 'Sign Up' : 'Log In'}</span>
              </button>
            </form>

            {/* 5. View a Demo Button */}
            <button
              type="button"
              onClick={handleGuestAccess}
              className="w-full py-2.5 rounded-xl border border-dashed border-white/15 hover:border-white/30 text-xs font-mono text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View a Demo</span>
            </button>

            {/* 6. Footer Switch Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode((prev) => (prev === 'signup' ? 'login' : 'signup'));
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setIsVerificationSent(false);
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
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

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080808] flex items-center justify-center text-slate-400 font-mono text-xs">
          Loading authentication...
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
