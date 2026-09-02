import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyath.health';
  const currentDate = new Date().toISOString();

  const routes: { path: string; changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'; priority: number }[] = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    { path: '/recipes', changeFrequency: 'daily', priority: 0.9 },
    { path: '/protocols', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/correlations', changeFrequency: 'daily', priority: 0.85 },
    { path: '/sanctuary', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/dashboard', changeFrequency: 'always', priority: 0.8 },
    { path: '/auth', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/privacy', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/terms', changeFrequency: 'monthly', priority: 0.4 },
  ];

  return routes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: currentDate,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
