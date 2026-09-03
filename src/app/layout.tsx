import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono, Fraunces, Pixelify_Sans } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { XpToastLayer } from "@/components/progression/XpToastLayer";
import { LevelUpModal } from "@/components/progression/LevelUpModal";
import { BottomCornerLevelBadge } from "@/components/progression/BottomCornerLevelBadge";
import { PioneerWalkthrough } from "@/components/walkthrough/PioneerWalkthrough";
import { StoveSageChatbot } from "@/components/stovesage/StoveSageChatbot";
import { XpParticleCanvas } from "@/components/effects/XpParticleCanvas";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { GlobalJsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-fraunces",
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
    default: 'Cyath · Science-Backed Daily Habit & Nutrition Engine',
    template: '%s · Cyath',
  },
  description:
    'Frictionless 30-second daily habit tracking, whole-food high-protein recipes, circadian protocols, and statistical energy pattern insights.',
  keywords: [
    'habit tracker',
    'metabolic health',
    'high protein recipes',
    'whole food nutrition',
    'energy tracking',
    'circadian rhythm',
    'gamified habits',
  ],
  authors: [{ name: 'Cyath Health', url: SITE_URL }],
  creator: 'Cyath',
  publisher: 'Cyath Health',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Cyath · Science-Backed Daily Habit & Nutrition Engine',
    description:
      'Track daily habits in 30 seconds, calibrate whole-food protein targets, and uncover what drives your best energy days.',
    url: SITE_URL,
    siteName: 'Cyath',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cyath · Science-Backed Daily Habit & Nutrition Engine',
    description: 'Track daily habits, hit protein goals, and discover what fuels your good days.',
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
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${fraunces.variable} ${jetbrainsMono.variable} ${pixelFont.variable} h-full antialiased`}>
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
          <ErrorBoundary name="Level Badge">
            <BottomCornerLevelBadge />
          </ErrorBoundary>
          <ErrorBoundary name="Walkthrough">
            <PioneerWalkthrough />
          </ErrorBoundary>
          <ErrorBoundary name="AI Coach" fallback={null}>
            <StoveSageChatbot />
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
