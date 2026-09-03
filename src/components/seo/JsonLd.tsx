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
  const recipeUrl = `${SITE_URL}/recipes/${encodeURIComponent(recipe.id)}`;

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

export function ProtocolsJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Circadian Health Protocols & Guided Routines',
    description:
      'Evidence-based daily routines for morning sunlight, deep sleep restoration, sustained mental focus, and muscle recovery.',
    url: `${SITE_URL}/protocols`,
    itemListElement: [
      {
        '@type': 'HowTo',
        position: 1,
        name: 'Morning Sunlight & Energy Protocol',
        description: 'Clears morning grogginess and resets your circadian clock in 15 minutes.',
        totalTime: 'PT30M',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: '15m outdoor morning sunlight',
            text: 'Get 10-15 minutes of natural sunlight in your eyes without sunglasses to reset your master circadian clock.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: '500ml water with pinch of sea salt',
            text: 'Rehydrate cells and replenish morning electrolytes with filtered water and a pinch of unrefined sea salt.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Cold splash or quick rinse',
            text: 'Splash cold water on your face or take a brisk cold rinse to naturally elevate cortisol and morning alertness.',
          },
        ],
      },
      {
        '@type': 'HowTo',
        position: 2,
        name: 'Deep Focus Sprint Protocol',
        description: 'Protects focus and metabolic energy for deep creative and analytical work.',
        totalTime: 'PT90M',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Zero phone input first 30 mins',
            text: 'Protect dopamine and attention by leaving phone notifications off for the first 30 minutes of the morning.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'High-protein breakfast (35g+)',
            text: 'Consume whole-food protein (eggs, smoked salmon, or Greek yogurt) to stabilize blood sugar without a mid-morning crash.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: '90-min single-task work block',
            text: 'Work on your single highest-leverage task for 90 uninterrupted minutes aligned with ultradian rhythms.',
          },
        ],
      },
      {
        '@type': 'HowTo',
        position: 3,
        name: 'Restful Sleep Wind-Down Protocol',
        description: 'Calms your nervous system and triggers melatonin production for deep, restorative sleep.',
        totalTime: 'PT60M',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Screens off 60 mins before bed',
            text: 'Eliminate blue and bright white screens 60 minutes before sleep to allow endogenous melatonin secretion.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Cool bedroom temperature (~67°F)',
            text: 'Lower room temperature to 65-68°F to facilitate natural core body temperature drop required for REM sleep.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Evening relaxation tea or mineral magnesium',
            text: 'Sip hot herbal chamomile or take bioavailable magnesium glycinate to relax smooth muscles and calm neural excitation.',
          },
        ],
      },
      {
        '@type': 'HowTo',
        position: 4,
        name: 'Daily Movement & Posture Protocol',
        description: 'Improves metabolic glucose clearance and undoes postural stagnation throughout the work day.',
        totalTime: 'PT20M',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Post-meal 10-min walk',
            text: 'Take a brisk 10-minute walk after lunch or dinner to stimulate GLUT4 transporters and blunt glucose spikes by up to 30%.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Desk mobility and thoracic opening',
            text: 'Perform 2 minutes of shoulder rolls, neck stretches, and thoracic extensions every 60 minutes at your workstation.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Zone 2 aerobic flush',
            text: 'Complete 20 minutes of nasal-breathing aerobic movement (walking, light cycling, or rucking) to build mitochondrial density.',
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
