'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/ui/Logo';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

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
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        if (data.session) {
          router.push('/dashboard');
        } else {
          setSuccessMsg('Verification link sent to your email. Check your inbox!');
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
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#0B0F17] px-4 py-12 selection:bg-white selection:text-black">
      {/* Background Ambient Shaders */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 50% 0%, rgba(30, 41, 59, 0.25) 0%, transparent 70%),
            radial-gradient(circle at 10% 90%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.015) 0%, transparent 50%)
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
        <span className="font-cabinet font-bold text-sm tracking-tight text-white hidden sm:inline-block">Cyath</span>
      </Link>

      {/* Centered Auth Card */}
      <div className="w-full max-w-[420px] rounded-3xl backdrop-blur-xl bg-white/[0.03] border border-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-6 relative z-10">
        
        {/* Subtle Card Highlight Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* Card Header & Typography */}
        <div>
          <h1 className="font-serif font-medium text-3xl text-white tracking-tight">
            {mode === 'signup' ? 'Sign Up' : 'Log In'}
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-sans">
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
          className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 text-sm font-medium text-slate-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
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
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 block">
              Password
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
            onClick={toggleMode}
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

      </div>
    </div>
  );
}
