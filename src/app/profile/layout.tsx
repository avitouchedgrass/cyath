import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyath.health';

export const metadata: Metadata = {
  title: 'Profile & Account Settings',
  description:
    'Manage your profile, daily protein and calorie targets, invite friends for bonus XP, and export your wellness data on Cyath.',
  alternates: {
    canonical: `${SITE_URL}/profile`,
  },
  openGraph: {
    title: 'Profile & Account Settings · Cyath',
    description: 'Manage your profile and invite friends to earn bonus XP.',
    url: `${SITE_URL}/profile`,
    siteName: 'Cyath',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Profile & Account Settings · Cyath',
    description: 'Manage your daily targets and wellness profile.',
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
