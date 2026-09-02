import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyath.health';

export const metadata: Metadata = {
  title: 'Daily Planner & Habit Engine',
  description:
    'Track 30-second daily habits, log whole-food protein targets, monitor hydration, and build streak momentum on Cyath.',
  alternates: {
    canonical: `${SITE_URL}/dashboard`,
  },
  openGraph: {
    title: 'Daily Planner & Habit Engine · Cyath',
    description: 'Track daily habits, hit protein targets, and monitor energy momentum without complex spreadsheets.',
    url: `${SITE_URL}/dashboard`,
    siteName: 'Cyath',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily Planner & Habit Engine · Cyath',
    description: '30-second daily habit tracking and protein logging.',
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
