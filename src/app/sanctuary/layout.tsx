import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyath.health';

export const metadata: Metadata = {
  title: 'Sanctuary Diorama & Progression',
  description:
    'Watch your 16-bit floating island evolve with dynamic pixel art, ambient weather, and unlocked biomes as you build daily habit consistency.',
  alternates: {
    canonical: `${SITE_URL}/sanctuary`,
  },
  openGraph: {
    title: 'Sanctuary Diorama & Progression · Cyath',
    description: 'An evolving pixel-art sanctuary diorama driven by your real-world habit consistency.',
    url: `${SITE_URL}/sanctuary`,
    siteName: 'Cyath',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sanctuary Diorama & Progression · Cyath',
    description: 'Evolving 16-bit floating island habit diorama.',
  },
};

export default function SanctuaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
