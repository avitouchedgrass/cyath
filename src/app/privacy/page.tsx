import React from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { ShieldCheck, Lock, EyeOff, Database, Sparkles, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Cyath Privacy Policy: Local-first health tracking, zero third-party trackers, and complete user data ownership.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] transition-colors duration-300 flex flex-col selection:bg-[#1A3629] selection:text-[#FFFDF9]">
      <HeaderNav />

      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        
        {/* Header */}
        <div className="mb-10 border-b-2 border-[#1A3629]/15 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-cabinet font-bold px-3.5 py-1.5 rounded-full border-2 bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 transition-all mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <span className="px-3 py-1 rounded-full border border-[#1A3629] bg-[#FAF6EE] text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629] block w-fit mb-2">
            Legal &amp; Trust
          </span>
          <h1 className="font-fraunces font-black text-3xl sm:text-5xl tracking-tight text-[#1A3629]">
            Privacy Policy
          </h1>
          <p className="text-sm font-mono text-[#4A5D4E] mt-2">
            Last Updated: September 1, 2026 · Effective Immediately
          </p>
        </div>

        {/* Core Principles Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="p-5 rounded-2xl border-2 border-[#1A3629] bg-[#FFFDF9] shadow-[3px_3px_0px_#1A3629]">
            <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] border border-[#10B981] flex items-center justify-center mb-3">
              <Lock className="w-4 h-4 text-[#065F46]" />
            </div>
            <h3 className="font-cabinet font-bold text-sm text-[#1A3629]">Local-First Storage</h3>
            <p className="text-xs font-cabinet font-medium text-[#2C4A3B] mt-1">
              Your logs and daily routine data reside on your own device by default.
            </p>
          </div>

          <div className="p-5 rounded-2xl border-2 border-[#1A3629] bg-[#FFFDF9] shadow-[3px_3px_0px_#1A3629]">
            <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#2563EB] flex items-center justify-center mb-3">
              <EyeOff className="w-4 h-4 text-[#1D4ED8]" />
            </div>
            <h3 className="font-cabinet font-bold text-sm text-[#1A3629]">Zero Ads or Tracking</h3>
            <p className="text-xs font-cabinet font-medium text-[#2C4A3B] mt-1">
              No tracking cookies, marketing pixels, or third-party behavioral brokers.
            </p>
          </div>

          <div className="p-5 rounded-2xl border-2 border-[#1A3629] bg-[#FFFDF9] shadow-[3px_3px_0px_#1A3629]">
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] border border-[#D97706] flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4 text-[#92400E]" />
            </div>
            <h3 className="font-cabinet font-bold text-sm text-[#1A3629]">Data Ownership</h3>
            <p className="text-xs font-cabinet font-medium text-[#2C4A3B] mt-1">
              Export your data or purge your cloud account at any moment.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[5px_5px_0px_#1A3629] rounded-3xl p-6 sm:p-10 space-y-8 text-sm font-cabinet leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="font-fraunces font-bold text-2xl text-[#1A3629]">1. Introduction &amp; Philosophy</h2>
            <p className="text-[#2C4A3B]">
              At <strong>Cyath</strong>, we believe personal health and behavioral habits should remain strictly private. This Privacy Policy details how we collect, handle, and protect your information when using the Cyath web application and associated services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces font-bold text-2xl text-[#1A3629]">2. Information We Collect</h2>
            <p className="text-[#2C4A3B]">We collect only information necessary to deliver personalized wellness tracking:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-[#2C4A3B]">
              <li><strong>Account Information:</strong> If you choose to authenticate via Email or Google OAuth, we receive your email address and unique identifier to manage your cloud synchronization.</li>
              <li><strong>Wellness Telemetry:</strong> Logged habits, protein and hydration metrics, sleep duration, subjective energy ratings, and custom recipes you create.</li>
              <li><strong>Guest / Offline Data:</strong> In guest mode, all telemetry is stored strictly in your browser&apos;s local storage without transmitting account identifiers.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces font-bold text-2xl text-[#1A3629]">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-[#2C4A3B]">
              <li>Calculating daily macro targets, habit completion rates, and streak progression.</li>
              <li>Rendering your 16-bit Sanctuary floating island diorama and XP progression levels.</li>
              <li>Generating offline Pearson correlation statistics between your habits and subjective focus scores.</li>
              <li>Powering StoveSage AI assistant queries when explicitly prompted by you.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces font-bold text-2xl text-[#1A3629]">4. AI Assistant (StoveSage) &amp; Third-Party Services</h2>
            <p className="text-[#2C4A3B]">
              When interacting with the optional StoveSage AI wizard, prompt text and relevant macro targets are transmitted securely to Google Gemini APIs to formulate recipe and habit recommendations. We do not sell your conversational data to advertisers or use it for cross-site behavioral profiling.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces font-bold text-2xl text-[#1A3629]">5. Data Retention &amp; Deletion</h2>
            <p className="text-[#2C4A3B]">
              You have full ownership of your data. You can clear your local browser storage at any time to delete all locally stored logs, or sign out and request permanent deletion of your cloud profile.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces font-bold text-2xl text-[#1A3629]">6. Contact Us</h2>
            <p className="text-[#2C4A3B]">
              If you have any questions regarding this Privacy Policy or your data, please contact our team at:
            </p>
            <div className="p-3 rounded-xl border border-[#1A3629]/20 bg-[#FAF6EE] font-mono text-xs font-bold text-[#1A3629] w-fit">
              privacy@cyath.app
            </div>
          </section>

        </div>

      </main>
    </div>
  );
}
