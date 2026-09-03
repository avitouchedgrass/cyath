import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SingleRecipeJsonLd } from '@/components/seo/JsonLd';
import { RECIPES, Recipe } from '@/lib/recipes';
import { Clock, Flame, Dumbbell, Sparkles, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyath.space';

export function generateStaticParams() {
  return RECIPES.map((recipe) => ({
    id: recipe.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const recipe = RECIPES.find((r) => r.id === id);

  if (!recipe) {
    return {
      title: 'Recipe Not Found · Cyath',
    };
  }

  const recipeUrl = `${SITE_URL}/recipes/${recipe.id}`;
  const imageUrl = recipe.image.startsWith('http')
    ? recipe.image
    : `${SITE_URL}${recipe.image}`;

  const description = `${recipe.name} — ${recipe.subtitle}. Whole-food meal calibrated with ${recipe.protein}g protein, ${recipe.calories} calories, ${recipe.carbs}g carbs, and ${recipe.fats}g healthy fats. Prep time: ${recipe.prepTimeMinutes} mins.`;

  return {
    title: `${recipe.name} (${recipe.protein}g Protein) · Cyath Fuel Recipes`,
    description,
    alternates: {
      canonical: recipeUrl,
    },
    keywords: [
      recipe.name,
      ...recipe.tags,
      `${recipe.protein}g protein recipe`,
      'whole food meal',
      'metabolic nutrition',
      'high protein fuel',
    ],
    openGraph: {
      title: `${recipe.name} (${recipe.protein}g Protein) · Cyath`,
      description,
      url: recipeUrl,
      siteName: 'Cyath',
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: recipe.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${recipe.name} (${recipe.protein}g Protein) · Cyath`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = RECIPES.find((r) => r.id === id);

  if (!recipe) {
    notFound();
  }

  const relatedRecipes = RECIPES.filter(
    (r) => r.id !== recipe.id && (r.category === recipe.category || r.dietType === recipe.dietType)
  ).slice(0, 3);

  const interactiveUrl = `/recipes?inspect=${encodeURIComponent(recipe.id)}`;

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] flex flex-col">
      <SingleRecipeJsonLd recipe={recipe} />
      <HeaderNav />

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 lg:px-12 pt-28 pb-20">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'Fuel Recipes', href: '/recipes' },
              { label: recipe.name, href: `/recipes/${recipe.id}` },
            ]}
          />
        </div>

        {/* Recipe Article Container */}
        <article className="border-3 border-[#1A3629] bg-[#FFFDF9] rounded-2xl shadow-[6px_6px_0px_#1A3629] p-6 sm:p-10 mb-12">
          
          {/* Header Area */}
          <header className="border-b-2 border-[#1A3629]/15 pb-8 mb-8">
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="px-3 py-1 rounded-full border-2 border-[#1A3629] bg-[#EFE9DF] text-xs font-mono font-bold uppercase tracking-wider text-[#1A3629]">
                {recipe.category}
              </span>
              <span className="px-3 py-1 rounded-full border-2 border-[#1A3629]/30 bg-[#FFFDF9] text-xs font-cabinet font-bold capitalize text-[#2C4A3B]">
                {recipe.dietType}
              </span>
              <span className="px-3 py-1 rounded-full border-2 border-[#D97706]/40 bg-[#FEF3C7] text-xs font-mono font-bold text-[#92400E]">
                Focus {recipe.focusScore}
              </span>
            </div>

            <h1 className="font-fraunces font-black text-3xl sm:text-5xl tracking-tight text-[#1A3629] leading-tight mb-3">
              {recipe.name}
            </h1>

            <p className="text-base sm:text-lg font-cabinet font-medium text-[#2C4A3B] max-w-3xl leading-relaxed">
              {recipe.subtitle}
            </p>

            {/* Macro Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="border-2 border-[#1A3629] bg-[#F4F0EA] rounded-xl p-3.5 text-center shadow-[2px_2px_0px_#1A3629]">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#4A5D4E]">Protein</div>
                <div className="font-fraunces font-black text-2xl sm:text-3xl text-[#10B981] mt-0.5">{recipe.protein}g</div>
              </div>

              <div className="border-2 border-[#1A3629] bg-[#F4F0EA] rounded-xl p-3.5 text-center shadow-[2px_2px_0px_#1A3629]">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#4A5D4E]">Calories</div>
                <div className="font-fraunces font-black text-2xl sm:text-3xl text-[#D97706] mt-0.5">{recipe.calories}</div>
              </div>

              <div className="border-2 border-[#1A3629] bg-[#F4F0EA] rounded-xl p-3.5 text-center shadow-[2px_2px_0px_#1A3629]">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#4A5D4E]">Carbs</div>
                <div className="font-fraunces font-black text-2xl sm:text-3xl text-[#2563EB] mt-0.5">{recipe.carbs}g</div>
              </div>

              <div className="border-2 border-[#1A3629] bg-[#F4F0EA] rounded-xl p-3.5 text-center shadow-[2px_2px_0px_#1A3629]">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#4A5D4E]">Fats</div>
                <div className="font-fraunces font-black text-2xl sm:text-3xl text-[#7C3AED] mt-0.5">{recipe.fats}g</div>
              </div>
            </div>
          </header>

          {/* Body Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Visual & Interactive Scaler CTA */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              <div className="relative aspect-square w-full rounded-2xl border-3 border-[#1A3629] bg-[#F4F0EA] overflow-hidden flex items-center justify-center p-6 shadow-[4px_4px_0px_#1A3629]">
                <Image
                  src={recipe.image}
                  alt={recipe.name}
                  width={380}
                  height={380}
                  className="w-full h-full object-contain [image-rendering:pixelated]"
                  priority
                />
              </div>

              <div className="border-2 border-[#1A3629]/20 bg-[#F4F0EA] rounded-xl p-4.5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#1A3629]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#D97706]" />
                    <span>Prep Time:</span>
                  </span>
                  <span>{recipe.prepTimeMinutes} mins</span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#1A3629]">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-[#EF4444]" />
                    <span>Focus Score:</span>
                  </span>
                  <span>{recipe.focusScore}</span>
                </div>

                <div className="pt-2 border-t border-[#1A3629]/15 flex flex-wrap gap-1.5">
                  {recipe.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-[#1A3629]/20 bg-[#FFFDF9] text-[#2C4A3B]">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interactive Logger CTA */}
              <div className="border-3 border-[#1A3629] bg-[#EFE9DF] rounded-xl p-5 shadow-[3px_3px_0px_#1A3629]">
                <div className="flex items-center gap-2 font-cabinet font-bold text-sm text-[#1A3629] mb-1">
                  <Sparkles className="w-4 h-4 text-[#D97706]" />
                  <span>Dynamic Portion Scaler</span>
                </div>
                <p className="text-xs font-cabinet font-medium text-[#2C4A3B] leading-relaxed mb-4">
                  Need to scale this recipe for 0.5x, 1.5x, or 2.0x portions? Open our interactive calculator to log calibrated macros directly to your daily journal.
                </p>
                <Link
                  href={interactiveUrl}
                  className="w-full inline-flex items-center justify-center gap-2 text-xs font-cabinet font-bold px-4 py-3 rounded-xl border-2 bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-[3px_3px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer text-center"
                >
                  <span>Open in Interactive Scaler</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: Ingredients & Step-by-Step Instructions */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Metabolic Philosophy Description */}
              <div>
                <h2 className="font-fraunces font-black text-xl text-[#1A3629] mb-2.5">
                  Metabolic Calibration
                </h2>
                <p className="text-sm font-cabinet font-medium leading-relaxed text-[#2C4A3B]">
                  {recipe.description}
                </p>
              </div>

              {/* Ingredients List */}
              <div>
                <div className="flex items-center justify-between mb-3 border-b-2 border-[#1A3629]/15 pb-2">
                  <h2 className="font-fraunces font-black text-xl text-[#1A3629]">
                    Whole-Food Ingredients
                  </h2>
                  <span className="text-xs font-mono font-bold text-[#4A5D4E]">
                    {recipe.ingredients.length} items
                  </span>
                </div>

                <ul className="space-y-2.5">
                  {recipe.ingredients.map((ing, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border-2 border-[#1A3629]/15 bg-[#F4F0EA] text-xs sm:text-sm font-cabinet font-bold text-[#1A3629]"
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                        <span>{ing.item}</span>
                      </span>
                      <span className="font-mono text-xs text-[#2C4A3B] shrink-0 ml-2 bg-[#FFFDF9] px-2.5 py-1 rounded-md border border-[#1A3629]/15">
                        {ing.amount}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preparation Steps */}
              <div>
                <div className="flex items-center justify-between mb-3 border-b-2 border-[#1A3629]/15 pb-2">
                  <h2 className="font-fraunces font-black text-xl text-[#1A3629]">
                    Step-by-Step Instructions
                  </h2>
                  <span className="text-xs font-mono font-bold text-[#4A5D4E]">
                    {recipe.instructions.length} steps
                  </span>
                </div>

                <ol className="space-y-3.5">
                  {recipe.instructions.map((step, idx) => (
                    <li
                      key={idx}
                      id={`step-${idx + 1}`}
                      className="p-4 rounded-xl border-2 border-[#1A3629]/20 bg-[#FFFDF9] shadow-[2px_2px_0px_rgba(26,54,41,0.08)] flex items-start gap-3.5"
                    >
                      <span className="w-6 h-6 rounded-full border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="space-y-1 text-xs sm:text-sm font-cabinet font-medium text-[#2C4A3B] leading-relaxed">
                        <strong className="block text-xs font-mono font-bold uppercase tracking-wider text-[#1A3629]">
                          Step {idx + 1}
                        </strong>
                        <p>{step}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

            </div>

          </div>

        </article>

        {/* Related Recipes Section */}
        {relatedRecipes.length > 0 && (
          <section className="mt-16 pt-10 border-t-2 border-[#1A3629]/15">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-fraunces font-black text-2xl sm:text-3xl text-[#1A3629]">
                  Related Whole-Food Recipes
                </h2>
                <p className="text-xs sm:text-sm font-cabinet font-medium text-[#2C4A3B] mt-0.5">
                  More {recipe.category.toLowerCase()} and {recipe.dietType} meals calibrated for steady energy.
                </p>
              </div>
              <Link
                href="/recipes"
                className="text-xs font-mono font-bold text-[#1A3629] hover:underline inline-flex items-center gap-1 shrink-0"
              >
                <span>View All 42</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedRecipes.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/recipes/${rel.id}`}
                  className="group border-2 border-[#1A3629] bg-[#FFFDF9] rounded-xl p-4 shadow-[3px_3px_0px_#1A3629] hover:-translate-y-1 hover:shadow-[5px_5px_0px_#1A3629] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square w-full rounded-lg bg-[#F4F0EA] border border-[#1A3629]/20 overflow-hidden flex items-center justify-center p-3 mb-3">
                      <Image
                        src={rel.image}
                        alt={rel.name}
                        width={160}
                        height={160}
                        className="w-full h-full object-contain [image-rendering:pixelated] group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#4A5D4E] mb-1">
                      {rel.category} · {rel.dietType}
                    </div>
                    <h3 className="font-fraunces font-bold text-base text-[#1A3629] line-clamp-1 group-hover:underline">
                      {rel.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1A3629]/15 flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-[#10B981]">{rel.protein}g Protein</span>
                    <span className="text-[#D97706]">{rel.calories} kcal</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>

      <SiteFooter />
    </div>
  );
}
