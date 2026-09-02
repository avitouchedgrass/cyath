import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyath.health';

export const metadata: Metadata = {
  title: 'Sign In & Account Access',
  description:
    'Sign in or start your free journey on Cyath to sync your daily habit checklists, whole-food recipes, and sanctuary progress across devices.',
  alternates: {
    canonical: `${SITE_URL}/auth`,
  },
  openGraph: {
    title: 'Sign In & Account Access · Cyath',
    description: 'Access your Cyath account to sync your habits and recipes.',
    url: `${SITE_URL}/auth`,
    siteName: 'Cyath',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Sign In & Account Access · Cyath',
    description: 'Access your Cyath account to sync habits across devices.',
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
