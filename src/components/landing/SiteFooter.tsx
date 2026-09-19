import React from 'react';
import Link from 'next/link';

interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className = '' }: SiteFooterProps) {
  return (
    <footer className={`relative z-10 border-t-4 border-[#1A3629] bg-[#EFE9DF] pt-16 pb-12 px-6 lg:px-12 ${className}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-6 gap-10 pb-12 border-b-2 border-[#1A3629]/20">
        
        {/* Brand & Mission */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-pixel font-bold text-2xl tracking-wider lowercase text-[#1A3629] hover:opacity-80 transition-opacity">
              cyath
            </Link>
            <span className="px-2.5 py-0.5 rounded-full border-2 bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] text-[10px] font-mono font-bold">
              v1.0 Retro
            </span>
          </div>
          <p className="text-xs font-cabinet font-medium max-w-sm leading-relaxed text-[#2C4A3B]">
            A science-backed daily habit and metabolic nutrition journal built on frictionless 30-second check-ins, whole-food high-protein recipes, circadian protocols, and energy pattern discoveries.
          </p>
        </div>

        {/* Platform Links */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A3629]">Platform</div>
          <ul className="space-y-2 text-xs font-cabinet font-bold text-[#2C4A3B]">
            <li>
              <Link href="/dashboard" className="hover:underline">Daily Planner</Link>
            </li>
            <li>
              <Link href="/sanctuary" className="hover:underline">Island Sanctuary</Link>
            </li>
            <li>
              <Link href="/correlations" className="hover:underline">Habit Insights</Link>
            </li>
            <li>
              <Link href="/protocols" className="hover:underline">Guided Routines</Link>
            </li>
            <li>
              <Link href="/playbook" className="hover:underline">Playbook &amp; Methodology</Link>
            </li>
          </ul>
        </div>

        {/* Keystone Levers */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A3629]">Keystone Levers</div>
          <ul className="space-y-2 text-xs font-cabinet font-bold text-[#2C4A3B]">
            <li>
              <span className="text-[#2C4A3B]/80">Morning Photons</span>
            </li>
            <li>
              <span className="text-[#2C4A3B]/80">Cellular Hydration</span>
            </li>
            <li>
              <span className="text-[#2C4A3B]/80">Whole-Food Protein</span>
            </li>
            <li>
              <span className="text-[#2C4A3B]/80">Evening Seal Ceremony</span>
            </li>
            <li>
              <Link href="/dashboard" className="text-[#1A3629] font-black hover:underline">Open Cockpit →</Link>
            </li>
          </ul>
        </div>

        {/* Health Protocols */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A3629]">Circadian Routines</div>
          <ul className="space-y-2 text-xs font-cabinet font-bold text-[#2C4A3B]">
            <li>
              <Link href="/protocols" className="hover:underline">Morning Sunlight &amp; Energy</Link>
            </li>
            <li>
              <Link href="/protocols" className="hover:underline">Restful Sleep Wind-Down</Link>
            </li>
            <li>
              <Link href="/protocols" className="hover:underline">Deep Focus Sprint</Link>
            </li>
            <li>
              <Link href="/protocols" className="hover:underline">Daily Movement &amp; Posture</Link>
            </li>
          </ul>
        </div>

        {/* Legal & Account */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A3629]">Account &amp; Legal</div>
          <ul className="space-y-2 text-xs font-cabinet font-bold text-[#2C4A3B]">
            <li>
              <Link href="/auth" className="hover:underline">Sign Up Free</Link>
            </li>
            <li>
              <Link href="/login" className="hover:underline">Log In</Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:underline">Terms of Service</Link>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom copyright line */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono font-bold text-[#2C4A3B]">
        <div>© {new Date().getFullYear()} Cyath.</div>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          <span>·</span>
          <Link href="/sitemap.xml" className="hover:underline">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}
