import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cyath - Pixel-Perfect Health & Habit Tracking',
    short_name: 'Cyath',
    description: 'A retro neobrutalist metabolic health platform combining daily habit tracking with high-protein recipes and island progression.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F4F0EA',
    theme_color: '#1A3629',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
