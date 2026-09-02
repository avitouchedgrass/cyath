import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyath.health';

export const metadata: Metadata = {
  title: 'Pioneer Calibration & Goal Setup',
  description:
    'Calibrate your personalized daily protein target, primary energy goal, and custom habit baseline in under 60 seconds on Cyath.',
  alternates: {
    canonical: `${SITE_URL}/onboarding`,
  },
  openGraph: {
    title: 'Pioneer Calibration & Goal Setup · Cyath',
    description: 'Calibrate your daily health baseline in 60 seconds.',
    url: `${SITE_URL}/onboarding`,
    siteName: 'Cyath',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Pioneer Calibration & Goal Setup · Cyath',
    description: 'Calibrate your personalized daily wellness baseline.',
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
