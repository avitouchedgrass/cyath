import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono, Fraunces, Pixelify_Sans } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { XpToastLayer } from "@/components/progression/XpToastLayer";
import { LevelUpModal } from "@/components/progression/LevelUpModal";
import { XpParticleCanvas } from "@/components/effects/XpParticleCanvas";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cyath.app'),
  title: {
    default: 'Cyath · 16-Bit Metabolic Health & Habit Tracking',
    template: '%s · Cyath',
  },
  description:
    'A retro neobrutalist metabolic health platform combining behavioral habit tracking, whole-food culinary recipes, and a 16-bit RPG sanctuary diorama.',
  keywords: [
    'metabolic health',
    'habit tracker',
    'high protein recipes',
    'gamified wellness',
    'retro pixel art',
    'circadian protocols',
  ],
  authors: [{ name: 'Cyath' }],
  openGraph: {
    title: 'Cyath · 16-Bit Metabolic Health & Habit Tracking',
    description:
      'Gamified daily wellness combining behavioral psychology, whole-food fuel recipes, and an evolving pixel-art sanctuary.',
    url: 'https://cyath.app',
    siteName: 'Cyath',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cyath · 16-Bit Metabolic Health',
    description: 'Track habits, calibrate protein, and evolve your 16-bit floating sanctuary.',
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
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@100,200,300,400,500,700,800,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-[#1A3629] selection:text-[#FFFDF9]">
        <AuthProvider>
          {children}
          <XpParticleCanvas />
          <XpToastLayer />
          <LevelUpModal />
        </AuthProvider>
      </body>
    </html>
  );
}
