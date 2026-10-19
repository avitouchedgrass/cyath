import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Pixelify_Sans } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { XpToastLayer } from "@/components/progression/XpToastLayer";
import { LevelUpModal } from "@/components/progression/LevelUpModal";
import { PioneerWalkthrough } from "@/components/walkthrough/PioneerWalkthrough";
import { StoveSageChatbot } from "@/components/stovesage/StoveSageChatbot";
import { CommandPalette } from "@/components/commands/CommandPalette";
import { XpParticleCanvas } from "@/components/effects/XpParticleCanvas";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { GlobalJsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const pixelFont = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-pixel",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyath.space';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Cyath · AI Chronobiology & Preventative Metabolic Health Engine',
    template: '%s · Cyath',
  },
  description:
    'Multimodal AI engine for circadian-metabolic health. Detects subclinical fatigue biomarkers, predicts glycemic risk from natural language meal input, and automatically paces daily routines to prevent metabolic burnout.',
  keywords: [
    'AI chronobiology',
    'metabolic health AI',
    'circadian rhythm tracking',
    'glycemic risk detection',
    'allostatic load',
    'preventative healthcare AI',
    'postprandial glucose',
    'subclinical fatigue detection',
    'chrononutrition',
    'adaptive pacing',
    'Gemini AI health',
    'human health AI',
  ],
  authors: [{ name: 'Cyath Health', url: SITE_URL }],
  creator: 'Cyath',
  publisher: 'Cyath Health',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Cyath · AI Chronobiology & Preventative Metabolic Health Engine',
    description:
      'Multimodal AI that detects subclinical fatigue, maps circadian biomarkers to metabolic outcomes, and automatically paces daily routines for chronic fatigue and burnout prevention.',
    url: SITE_URL,
    siteName: 'Cyath',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cyath · AI Chronobiology & Preventative Metabolic Health Engine',
    description: 'Gemini-powered AI that maps circadian biomarkers, predicts glycemic risk, and paces routines to prevent chronic fatigue.',
    creator: '@CyathHealth',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${pixelFont.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.fontshare.com" />
        <link rel="dns-prefetch" href="https://cdn.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@100,200,300,400,500,700,800,900&display=swap"
          rel="stylesheet"
        />
        <GlobalJsonLd />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-[#1A3629] selection:text-[#FFFDF9]">
        <AuthProvider>
          {children}
          <ErrorBoundary name="Particles">
            <XpParticleCanvas />
          </ErrorBoundary>
          <ErrorBoundary name="Toast Layer">
            <XpToastLayer />
          </ErrorBoundary>
          <ErrorBoundary name="Level Up Modal">
            <LevelUpModal />
          </ErrorBoundary>
          <ErrorBoundary name="Walkthrough">
            <PioneerWalkthrough />
          </ErrorBoundary>
          <ErrorBoundary name="AI Coach" fallback={null}>
            <StoveSageChatbot />
          </ErrorBoundary>
          <ErrorBoundary name="Command Palette" fallback={null}>
            <CommandPalette />
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
