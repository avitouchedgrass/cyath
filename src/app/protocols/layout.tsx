import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyath.space';

export const metadata: Metadata = {
  title: 'Circadian Health Protocols',
  description:
    'Evidence-based daily routines for morning sunlight, deep sleep restoration, sustained mental focus, and muscle recovery.',
  alternates: {
    canonical: `${SITE_URL}/protocols`,
  },
  openGraph: {
    title: 'Circadian Health Protocols · Cyath',
    description: 'Evidence-based habit protocols designed for 1-tap activation into your daily planner.',
    url: `${SITE_URL}/protocols`,
    siteName: 'Cyath',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Circadian Health Protocols · Cyath',
    description: 'Science-backed daily routines for focus, recovery, and sleep.',
  },
};

export default function ProtocolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
