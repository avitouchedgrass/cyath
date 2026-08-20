'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useHabitStore } from '@/store/useHabitStore';
import { Logo } from '@/components/ui/Logo';
import { retroAudio } from '@/lib/retroAudio';
import { ArrowLeft, Loader2, Mail, CheckCircle2, RefreshCw, KeyRound, Lock, Sparkles, Check } from 'lucide-react';

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

  // Auth State Listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('update_password');
        setErrorMsg(null);
        setSuccessMsg(null);
      } else if (isVerificationSent && session?.user?.id && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        setSuccessMsg('Email verified! Launching your dashboard...');
        setTimeout(() => {
          completeAuthentication({ id: session.user.id, email: session.user.email || email });
        }, 1200);
      }
    });

    let pollTimer: NodeJS.Timeout | null = null;
    if (isVerificationSent) {
      pollTimer = setInterval(async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            setSuccessMsg('Email verified! Launching your dashboard...');
            if (pollTimer) clearInterval(pollTimer);
            setTimeout(() => {
              completeAuthentication({ id: session.user.id, email: session.user.email || email });
            }, 1200);
          }
        } catch {
          // Poll
        }
      }, 2500);
    }

    return () => {
      subscription.unsubscribe();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [isVerificationSent, email]);

  const completeAuthentication = (user?: { id: string; email?: string }) => {
    retroAudio.playInspectConfirm();
    const { setUserSession, executePendingAction, userProfile } = useHabitStore.getState();
    if (user) {
      setUserSession(user);
    } else {
      useHabitStore.getState().initDemoSession();
      router.push('/dashboard');
      return;
    }

    const { success, executedAction } = executePendingAction();
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
    retroAudio.playBlip();

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
        msg.toLowerCase().includes('user already exists')
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
    retroAudio.playBlip();

    try {
      const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback?next=/auth?mode=update_password`
        : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });
      if (error) throw error;

      setSuccessMsg(`We sent a password reset link to ${email}. Check your inbox!`);
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
    retroAudio.playBlip();

    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      if (error) throw error;

      setSuccessMsg('Password updated successfully! Redirecting...');
      setTimeout(() => {
        if (data.user) {
          completeAuthentication({ id: data.user.id, email: data.user.email });
        } else {
          router.push('/dashboard');
        }
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    retroAudio.playBlip();

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
    retroAudio.playBlip();

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
    retroAudio.playBlip();
    useHabitStore.getState().initDemoSession();
    const { success, executedAction } = useHabitStore.getState().executePendingAction();
    if (success && executedAction?.returnUrl) {
      router.push(executedAction.returnUrl);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#111914] text-[#F4F0EA] px-4 py-12">
      
      {/* Brand Link */}
      <Link 
        href="/"
        className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20 flex items-center gap-2.5 text-[#C2CDBF] hover:text-[#F4F0EA] transition-all group"
        aria-label="Back to home"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <Logo className="w-7 h-7" />
        <span className="font-fraunces font-bold text-base text-[#F4F0EA] hidden sm:inline-block">Cyath</span>
      </Link>

      {/* Centered Retro Auth Card */}
      <div className="w-full max-w-[430px] rounded-3xl bg-[#1A261E] border-4 border-[#F4F0EA] p-8 shadow-[8px_8px_0px_#D9A036] flex flex-col gap-6 relative z-10">
        
        {/* VIEW 1: Email Verification Sent Screen */}
        {isVerificationSent ? (
          <div className="flex flex-col gap-5 py-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#111914] border-2 border-[#F4F0EA] flex items-center justify-center text-[#D9A036]">
                <Mail className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#111914] text-[#D9A036] border-2 border-[#F4F0EA]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verification Sent
                </span>
              </div>
            </div>

            <div>
              <h1 className="font-fraunces font-black text-2xl sm:text-3xl text-[#F4F0EA] tracking-tight">
                Check your inbox
              </h1>
              <p className="text-[#C2CDBF] text-xs sm:text-sm mt-2 font-cabinet font-medium leading-relaxed">
                We sent a secure link to <span className="text-[#F4F0EA] font-mono font-bold">{email}</span>. Click it to activate your account.
              </p>
            </div>

            {errorMsg && (
              <div className="px-4 py-3 rounded-xl bg-red-900/40 border-2 border-red-400 text-red-200 text-xs font-mono font-bold">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="px-4 py-3 rounded-xl bg-[#111914] border-2 border-[#D9A036] text-[#D9A036] text-xs font-mono font-bold">
                {successMsg}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendCooldown > 0 || resending}
                className="w-full py-3.5 rounded-xl bg-[#F4F0EA] text-[#111914] font-cabinet font-bold text-xs border-2 border-[#F4F0EA] shadow-[3px_3px_0px_#D9A036] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {resending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#111914]" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-[#111914]" />
                )}
                <span>
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend Verification Email'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleGuestAccess}
                className="w-full py-3 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] text-xs font-mono font-bold text-[#F4F0EA] hover:bg-[#1A261E] transition-all cursor-pointer"
              >
                <span>Explore Demo Dashboard</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsVerificationSent(false);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-[#C2CDBF] hover:text-[#F4F0EA] underline cursor-pointer"
                >
                  Use a different email address
                </button>
              </div>
            </div>
          </div>
        ) : mode === 'forgot' ? (
          /* VIEW 2: Reset Password */
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] flex items-center justify-center text-[#D9A036] shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D9A036]">
                  Account Recovery
                </span>
                <h1 className="font-fraunces font-black text-2xl text-[#F4F0EA] tracking-tight">
                  Reset Password
                </h1>
              </div>
            </div>

            <p className="text-[#C2CDBF] text-xs sm:text-sm font-cabinet font-medium leading-relaxed">
              Enter your account email and we&apos;ll send you a password reset link.
            </p>

            {errorMsg && (
              <div className="px-4 py-3 rounded-xl bg-red-900/40 border-2 border-red-400 text-red-200 text-xs font-mono font-bold">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="px-4 py-3 rounded-xl bg-[#111914] border-2 border-[#D9A036] text-[#D9A036] text-xs font-mono font-bold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleResetPasswordRequest} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-mono uppercase font-bold text-[#F4F0EA] mb-1.5 block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] text-[#F4F0EA] placeholder-[#C2CDBF]/50 text-sm font-cabinet font-bold focus:outline-none shadow-[2px_2px_0px_#D9A036]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#F4F0EA] text-[#111914] font-cabinet font-bold text-xs border-2 border-[#F4F0EA] shadow-[3px_3px_0px_#D9A036] hover:-translate-y-0.5 transition-all mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin text-[#111914]" />}
                <span>Send Reset Link</span>
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs font-mono font-bold text-[#C2CDBF] hover:text-[#F4F0EA] cursor-pointer"
              >
                ← Back to Log In
              </button>
            </div>
          </div>
        ) : mode === 'update_password' ? (
          /* VIEW 3: Set New Password */
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] flex items-center justify-center text-[#D9A036] shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D9A036]">
                  Security Update
                </span>
                <h1 className="font-fraunces font-black text-2xl text-[#F4F0EA] tracking-tight">
                  Set New Password
                </h1>
              </div>
            </div>

            <p className="text-[#C2CDBF] text-xs sm:text-sm font-cabinet font-medium leading-relaxed">
              Create a strong new password for your account.
            </p>

            {errorMsg && (
              <div className="px-4 py-3 rounded-xl bg-red-900/40 border-2 border-red-400 text-red-200 text-xs font-mono font-bold">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="px-4 py-3 rounded-xl bg-[#111914] border-2 border-[#D9A036] text-[#D9A036] text-xs font-mono font-bold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-mono uppercase font-bold text-[#F4F0EA] mb-1.5 block">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] text-[#F4F0EA] text-sm font-mono font-bold focus:outline-none shadow-[2px_2px_0px_#D9A036]"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase font-bold text-[#F4F0EA] mb-1.5 block">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] text-[#F4F0EA] text-sm font-mono font-bold focus:outline-none shadow-[2px_2px_0px_#D9A036]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#F4F0EA] text-[#111914] font-cabinet font-bold text-xs border-2 border-[#F4F0EA] shadow-[3px_3px_0px_#D9A036] hover:-translate-y-0.5 transition-all mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin text-[#111914]" />}
                <span>Update Password</span>
              </button>
            </form>
          </div>
        ) : (
          /* VIEW 4: Login / Signup Mode */
          <div className="flex flex-col gap-5">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#111914] border-2 border-[#F4F0EA]">
              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setMode('signup');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#F4F0EA] text-[#111914] shadow-[2px_2px_0px_#D9A036]'
                    : 'text-[#C2CDBF] hover:text-[#F4F0EA]'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#F4F0EA] text-[#111914] shadow-[2px_2px_0px_#D9A036]'
                    : 'text-[#C2CDBF] hover:text-[#F4F0EA]'
                }`}
              >
                Log In
              </button>
            </div>

            <div>
              <h1 className="font-fraunces font-black text-2xl sm:text-3xl text-[#F4F0EA] tracking-tight">
                {mode === 'signup' ? 'Start Your Daily Protocol' : 'Welcome Back'}
              </h1>
              <p className="text-[#C2CDBF] text-xs sm:text-sm mt-1 font-cabinet font-medium">
                {mode === 'signup'
                  ? 'Track proven daily habits, fuel with whole foods, and uncover energy patterns.'
                  : 'Sign in to access your habit checklist and energy logs.'}
              </p>
            </div>

            {errorMsg && (
              <div className="px-4 py-3 rounded-xl bg-red-900/40 border-2 border-red-400 text-red-200 text-xs font-mono font-bold">
                {errorMsg}
              </div>
            )}

            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={googleLoading}
              className="w-full py-3 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] text-xs font-cabinet font-bold text-[#F4F0EA] hover:bg-[#1A261E] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-[2px_2px_0px_#D9A036]"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#F4F0EA]" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-0.5 bg-[#F4F0EA]/20" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D9A036]">or email</span>
              <div className="flex-1 h-0.5 bg-[#F4F0EA]/20" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-mono uppercase font-bold text-[#F4F0EA] mb-1 block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] text-[#F4F0EA] placeholder-[#C2CDBF]/50 text-sm font-cabinet font-bold focus:outline-none shadow-[2px_2px_0px_#D9A036]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono uppercase font-bold text-[#F4F0EA]">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        retroAudio.playBlip();
                        setMode('forgot');
                        setErrorMsg(null);
                      }}
                      className="text-[11px] font-mono font-bold text-[#D9A036] hover:underline cursor-pointer"
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
                  className="w-full px-4 py-3 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] text-[#F4F0EA] text-sm font-mono font-bold focus:outline-none shadow-[2px_2px_0px_#D9A036]"
                />
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-mono uppercase font-bold text-[#F4F0EA] mb-1 block">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-[#111914] border-2 border-[#F4F0EA] text-[#F4F0EA] text-sm font-mono font-bold focus:outline-none shadow-[2px_2px_0px_#D9A036]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#F4F0EA] text-[#111914] font-cabinet font-bold text-xs border-2 border-[#F4F0EA] shadow-[3px_3px_0px_#D9A036] hover:-translate-y-0.5 transition-all mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin text-[#111914]" />}
                <span>{mode === 'signup' ? 'Create Account & Continue' : 'Log In'}</span>
              </button>
            </form>

            {/* Quick Guest Demo Button */}
            <div className="pt-2 border-t-2 border-[#F4F0EA]/20 text-center">
              <button
                type="button"
                onClick={handleGuestAccess}
                className="text-xs font-mono font-bold text-[#C2CDBF] hover:text-[#F4F0EA] hover:underline cursor-pointer"
              >
                ⚡ Explore Demo Without Account
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#111914] flex items-center justify-center text-xs font-mono text-[#F4F0EA]">
          Loading...
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
