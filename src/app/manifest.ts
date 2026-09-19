import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cyath · Science-Backed Daily Habit & Nutrition Engine',
    short_name: 'Cyath',
    description: 'Frictionless 30-second daily habit tracking, whole-food high-protein recipes, circadian protocols, and energy pattern insights.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#1A3629',
    theme_color: '#1A3629',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
