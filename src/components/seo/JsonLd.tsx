import React from 'react';
import { Recipe } from '@/lib/recipes';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cyath.space';

export function GlobalJsonLd() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Cyath',
    alternateName: 'Cyath Health',
    url: SITE_URL,
    description: 'A 16-bit retro neobrutalist metabolic health platform combining behavioral habit tracking, whole-food recipes, and daily energy insights.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/recipes?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Cyath',
    operatingSystem: 'Any',
    applicationCategory: 'HealthApplication',
    url: SITE_URL,
    description: 'Gamified metabolic wellness combining 30-second habit tracking, high-protein fuel recipes, and 16-bit island diorama progression.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1480',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      '30-second daily habit check-ins',
      'Whole-food protein and calorie calibration',
      'Circadian protocols and hydration tracking',
      '16-bit evolving floating sanctuary diorama',
      'Statistical food-to-energy correlation engine',
    ],
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Cyath Health',
    url: SITE_URL,
    logo: `${SITE_URL}/assets/logo.svg`,
    sameAs: [
      'https://twitter.com/CyathHealth',
      'https://github.com/avitouchedgrass/cyath',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${SITE_URL}/dashboard`,
    },
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: 'Cyath Wellness Platform',
    image: `${SITE_URL}/assets/cyath-logo-trans-white.svg`,
    url: SITE_URL,
    priceRange: '$$',
    description: 'Digital health and daily habit coaching platform providing metabolic calibration and whole-food nutritional guides.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Cyath?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Cyath is a 16-bit retro neobrutalist metabolic health platform combining 30-second daily habit tracking, whole-food high-protein recipes, circadian protocols, and energy pattern correlations.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the 30-second habit tracker work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Cyath allows you to log morning sunlight, whole-food protein targets, hydration checkpoints, and evening sleep hygiene in under 30 seconds, earning XP and evolving your personal 16-bit island sanctuary.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are all Cyath recipes whole-food based?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. All recipes in Cyath emphasize single-ingredient, whole-food sources like wild salmon, pasture-raised eggs, dairy paneer, lean poultry, and legumes with exact USDA macro breakdowns and dynamic portion scaling.',
        },
      },
      {
        '@type': 'Question',
        name: 'What diet types are supported in Cyath?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Cyath supports Vegetarian (dairy and plant foods), Eggetarian (pasture-raised eggs and dairy), Vegan (100% plant-based), Pescatarian (wild seafood), and Omnivore (whole-food meats) meal plans.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

export function BreadcrumbsJsonLd({ items }: { items: { name: string; item: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.item.startsWith('http') ? crumb.item : `${SITE_URL}${crumb.item}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function buildRecipeSchema(recipe: Recipe) {
  const imageUrl = recipe.image.startsWith('http')
    ? recipe.image
    : `${SITE_URL}${recipe.image}`;
  const recipeUrl = `${SITE_URL}/recipes?inspect=${encodeURIComponent(recipe.id)}`;

  return {
    '@type': 'Recipe',
    name: recipe.name,
    headline: recipe.subtitle || recipe.name,
    description: recipe.description,
    url: recipeUrl,
    image: [imageUrl],
    recipeCategory: recipe.category,
    recipeCuisine: 'Healthy Whole-Food',
    author: {
      '@type': 'Organization',
      name: 'Cyath Health',
      url: SITE_URL,
    },
    prepTime: `PT${recipe.prepTimeMinutes}M`,
    cookTime: `PT${recipe.prepTimeMinutes}M`,
    totalTime: `PT${recipe.prepTimeMinutes}M`,
    keywords: (recipe.tags || []).join(', '),
    recipeYield: '1 serving',
    nutrition: {
      '@type': 'NutritionInformation',
      calories: `${recipe.calories} calories`,
      proteinContent: `${recipe.protein} g`,
      carbohydrateContent: `${recipe.carbs} g`,
      fatContent: `${recipe.fats} g`,
    },
    recipeIngredient: recipe.ingredients.map((i) => `${i.amount} ${i.item}`),
    recipeInstructions: recipe.instructions.map((inst, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: `Step ${idx + 1}`,
      text: inst,
      url: `${recipeUrl}#step-${idx + 1}`,
      image: imageUrl,
    })),
  };
}

export function SingleRecipeJsonLd({ recipe }: { recipe: Recipe }) {
  const schema = {
    '@context': 'https://schema.org',
    ...buildRecipeSchema(recipe),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function RecipeListJsonLd({ recipes }: { recipes: Recipe[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: recipes.map((recipe, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: buildRecipeSchema(recipe),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
