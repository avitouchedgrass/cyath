import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono, Fraunces, Pixelify_Sans } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { XpToastLayer } from "@/components/progression/XpToastLayer";
import { LevelUpModal } from "@/components/progression/LevelUpModal";
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
  title: "Cyath - Pixel-Perfect Health",
  description: "A full-stack web platform combining behavioral psychology with physical health tracking.",
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
          <XpToastLayer />
          <LevelUpModal />
        </AuthProvider>
      </body>
    </html>
  );
}
