import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyath.space';

export const metadata: Metadata = {
  title: 'Daily Plan & Habit Setup',
  description:
    'Set up your daily hydration, protein targets, and core habits in under 60 seconds on Cyath.',
  alternates: {
    canonical: `${SITE_URL}/onboarding`,
  },
  openGraph: {
    title: 'Daily Plan & Habit Setup · Cyath',
    description: 'Set up your daily health habits in 60 seconds.',
    url: `${SITE_URL}/onboarding`,
    siteName: 'Cyath',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Daily Plan & Habit Setup · Cyath',
    description: 'Set up your personalized daily health habits.',
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
