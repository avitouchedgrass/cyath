import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyath.space';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Cyath terms of service: user agreements, ethical wellness guidelines, and service standards.',
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
  openGraph: {
    title: 'Terms of Service · Cyath',
    description: 'Read the Cyath terms of service and wellness guidelines.',
    url: `${SITE_URL}/terms`,
    siteName: 'Cyath',
    type: 'website',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
