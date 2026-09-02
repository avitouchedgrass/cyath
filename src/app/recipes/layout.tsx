import type { Metadata } from 'next';
import { RECIPES } from '@/lib/recipes';
import { RecipeListJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyath.health';

export const metadata: Metadata = {
  title: 'Whole-Food Fuel Recipes',
  description:
    'Discover high-protein, steady-carb, and keto-clean recipes designed for sustained energy, muscle recovery, and metabolic health.',
  alternates: {
    canonical: `${SITE_URL}/recipes`,
  },
  openGraph: {
    title: 'Whole-Food Fuel Recipes · Cyath',
    description:
      'Explore high-protein, nutrient-dense dishes with dynamic portion steppers and USDA macro breakdowns.',
    url: `${SITE_URL}/recipes`,
    siteName: 'Cyath',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whole-Food Fuel Recipes · Cyath',
    description: 'High-protein recipes calibrated for peak focus and recovery.',
  },
};

export default function RecipesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RecipeListJsonLd recipes={RECIPES} />
      {children}
    </>
  );
}
