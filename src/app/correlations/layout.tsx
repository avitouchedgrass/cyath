import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyath.health';

export const metadata: Metadata = {
  title: 'Daily Pattern & Energy Insights',
  description:
    'Discover what fuels your best energy days with live Pearson correlation analytics connecting protein, sleep, hydration, and focus depth.',
  alternates: {
    canonical: `${SITE_URL}/correlations`,
  },
  openGraph: {
    title: 'Daily Pattern & Energy Insights · Cyath',
    description: 'Statistical scatter analysis linking your daily nutrition and sleep to peak focus hours.',
    url: `${SITE_URL}/correlations`,
    siteName: 'Cyath',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily Pattern & Energy Insights · Cyath',
    description: 'Food-to-energy pattern engine without guesswork.',
  },
};

export default function CorrelationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
