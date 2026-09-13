import React from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ShieldCheck, Lock, EyeOff, Database, Sparkles, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] transition-colors duration-300 flex flex-col selection:bg-[#1A3629] selection:text-[#FFFDF9]">
      <HeaderNav />

      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-6 pt-32 pb-24">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
        </div>
        
        {/* Header */}
        <div className="mb-10 border-b border-[#1A3629]/10 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-cabinet font-semibold px-3.5 py-1.5 rounded-full border border-[#1A3629]/15 bg-[#FFFDF9] text-[#1A3629] shadow-2xs hover:bg-[#F4F0EA] transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <span className="px-3 py-1 rounded-full border border-[#1A3629]/15 bg-[#FAF6EE] text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629] block w-fit mb-2">
            Legal &amp; Trust
          </span>
          <h1 className="font-cabinet font-extrabold text-3xl sm:text-5xl tracking-tight text-[#1A3629]">
            Privacy Policy
          </h1>
          <p className="text-sm font-mono text-[#4A5D4E] mt-2">
            Last Updated: September 1, 2026 · Effective Immediately
          </p>
        </div>

        {/* Core Principles Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="p-5 rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-600/20 flex items-center justify-center mb-3">
              <Lock className="w-4 h-4 text-emerald-800" />
            </div>
            <h3 className="font-cabinet font-bold text-sm text-[#1A3629]">Local-First Storage</h3>
            <p className="text-xs font-cabinet font-medium text-[#2C4A3B] mt-1">
              Your logs and daily routine data reside on your own device by default.
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-600/20 flex items-center justify-center mb-3">
              <EyeOff className="w-4 h-4 text-blue-800" />
            </div>
            <h3 className="font-cabinet font-bold text-sm text-[#1A3629]">Zero Ads or Tracking</h3>
            <p className="text-xs font-cabinet font-medium text-[#2C4A3B] mt-1">
              No tracking cookies, marketing pixels, or third-party behavioral brokers.
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-600/20 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4 text-amber-800" />
            </div>
            <h3 className="font-cabinet font-bold text-sm text-[#1A3629]">Data Ownership</h3>
            <p className="text-xs font-cabinet font-medium text-[#2C4A3B] mt-1">
              Export your data or purge your cloud account at any moment.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] shadow-[0_2px_12px_rgba(26,54,41,0.03)] p-6 sm:p-10 space-y-8 text-sm font-cabinet leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="font-cabinet font-bold text-2xl text-[#1A3629]">1. Introduction &amp; Philosophy</h2>
            <p className="text-[#2C4A3B]">
              At <strong>Cyath</strong>, we believe personal health and behavioral habits should remain strictly private. This Privacy Policy details how we collect, handle, and protect your information when using the Cyath web application and associated services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-cabinet font-bold text-2xl text-[#1A3629]">2. Information We Collect</h2>
            <p className="text-[#2C4A3B]">We collect only information necessary to deliver personalized wellness tracking:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-[#2C4A3B]">
              <li><strong>Account Information:</strong> If you choose to authenticate via Email or Google OAuth, we receive your email address and unique identifier to manage your cloud synchronization.</li>
              <li><strong>Wellness Telemetry:</strong> Logged habits, protein and hydration metrics, sleep duration, subjective energy ratings, and custom recipes you create.</li>
              <li><strong>Guest / Offline Data:</strong> In guest mode, all telemetry is stored strictly in your browser&apos;s local storage without transmitting account identifiers.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-cabinet font-bold text-2xl text-[#1A3629]">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-[#2C4A3B]">
              <li>Calculating daily macro targets, habit completion rates, and streak progression.</li>
              <li>Rendering your 16-bit Sanctuary floating island diorama and XP progression levels.</li>
              <li>Generating offline Pearson correlation statistics between your habits and subjective focus scores.</li>
              <li>Powering the AI Plate Scanner when you choose to photograph a meal.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-cabinet font-bold text-2xl text-[#1A3629]">4. AI Food Vision &amp; Third-Party Services</h2>
            <p className="text-[#2C4A3B]">
              When using the optional AI Plate Scanner in the recipe catalog, image data of your food plate is transmitted securely to Google Gemini Vision APIs to calculate nutritional macro estimates. We do not sell your image data to advertisers or use it for cross-site behavioral profiling.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-cabinet font-bold text-2xl text-[#1A3629]">5. Data Retention &amp; Deletion</h2>
            <p className="text-[#2C4A3B]">
              You have full ownership of your data. You can clear your local browser storage at any time to delete all locally stored logs, or sign out and request permanent deletion of your cloud profile.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-cabinet font-bold text-2xl text-[#1A3629]">6. Contact Us</h2>
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
