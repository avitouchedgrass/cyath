import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyath.space';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Cyath privacy standards: transparent data protection, zero third-party advertising trackers, and complete control over your health telemetry.',
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy · Cyath',
    description: 'Learn how Cyath protects your personal health and habit data.',
    url: `${SITE_URL}/privacy`,
    siteName: 'Cyath',
    type: 'website',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
