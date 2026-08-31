import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyath.app';
  const currentDate = new Date().toISOString();

  const routes = [
    '',
    '/recipes',
    '/protocols',
    '/correlations',
    '/sanctuary',
    '/dashboard',
    '/login',
    '/privacy',
    '/terms',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '/dashboard' || route === '/recipes' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/recipes' || route === '/sanctuary' ? 0.9 : 0.8,
  }));
}
