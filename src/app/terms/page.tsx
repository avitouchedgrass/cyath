import React from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { FileText, AlertCircle, ShieldAlert, Sparkles, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] transition-colors duration-300 flex flex-col selection:bg-[#1A3629] selection:text-[#FFFDF9]">
      <HeaderNav />

      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-6 pt-32 pb-24">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Terms of Service' }]} />
        </div>

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
            Agreement &amp; Terms
          </span>
          <h1 className="font-fraunces font-black text-3xl sm:text-5xl tracking-tight text-[#1A3629]">
            Terms of Service
          </h1>
          <p className="text-sm font-mono text-[#4A5D4E] mt-2">
            Last Updated: September 1, 2026 · Effective Immediately
          </p>
        </div>

        {/* Important Health Disclaimer Box */}
        <div className="p-5 sm:p-6 rounded-2xl border-2 border-[#D97706] bg-[#FEF3C7] mb-10 shadow-[3px_3px_0px_#D97706] flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#FFFDF9] border border-[#D97706] flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-[#92400E]" />
          </div>
          <div>
            <h3 className="font-cabinet font-bold text-sm text-[#92400E] uppercase tracking-wider mb-1">
              Important Health &amp; Nutritional Disclaimer
            </h3>
            <p className="text-xs sm:text-sm font-cabinet font-medium text-[#78350F] leading-relaxed">
              Cyath provides habit tracking, culinary ideas, and behavioral statistics for general educational and informational wellness purposes only. Cyath and its AI vision scanner do not provide medical advice, diagnosis, or clinical treatment. Always consult a qualified healthcare provider before undertaking new dietary or strenuous physical regimens.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[5px_5px_0px_#1A3629] rounded-3xl p-6 sm:p-10 space-y-8 text-sm font-cabinet leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="font-fraunces font-bold text-2xl text-[#1A3629]">1. Agreement to Terms</h2>
            <p className="text-[#2C4A3B]">
              By accessing or using the <strong>Cyath</strong> application (the &quot;Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use the Platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces font-bold text-2xl text-[#1A3629]">2. User Accounts &amp; Data Security</h2>
            <p className="text-[#2C4A3B]">
              When creating an account or using guest access:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-[#2C4A3B]">
              <li>You are responsible for maintaining the confidentiality of your authentication credentials.</li>
              <li>You agree to provide accurate baseline information for macro and goal calibrations.</li>
              <li>Cyath reserves the right to suspend accounts engaged in abuse or malicious automated scraping.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces font-bold text-2xl text-[#1A3629]">3. Intellectual Property</h2>
            <p className="text-[#2C4A3B]">
              All custom illustrations, 16-bit pixel art assets, audio synthesis designs, software code, and brand marks associated with Cyath are the exclusive intellectual property of Cyath. You may not reproduce, distribute, or reverse-engineer these assets without prior written consent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces font-bold text-2xl text-[#1A3629]">4. User-Generated Content &amp; Custom Recipes</h2>
            <p className="text-[#2C4A3B]">
              You retain full ownership of any custom recipes, workout notes, or habit titles you create within the application. You grant Cyath a non-exclusive license strictly to process and display this data on your personal interface.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces font-bold text-2xl text-[#1A3629]">5. Limitation of Liability</h2>
            <p className="text-[#2C4A3B]">
              To the fullest extent permitted by applicable law, Cyath and its creators shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of or inability to use the Platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces font-bold text-2xl text-[#1A3629]">6. Modifications &amp; Governing Law</h2>
            <p className="text-[#2C4A3B]">
              We may revise these Terms of Service periodically. Continued use of the Platform following any modifications constitutes your acceptance of the updated terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-fraunces font-bold text-2xl text-[#1A3629]">7. Contact</h2>
            <p className="text-[#2C4A3B]">
              For inquiries regarding these Terms of Service, please contact:
            </p>
            <div className="p-3 rounded-xl border border-[#1A3629]/20 bg-[#FAF6EE] font-mono text-xs font-bold text-[#1A3629] w-fit">
              legal@cyath.app
            </div>
          </section>

        </div>

      </main>
    </div>
  );
}
