export interface RecipeMicros {
  fiberG: number;
  potassiumMg: number;
  magnesiumMg: number;
  ironMg: number;
  zincMg: number;
  calciumMg: number;
  vitaminB12Mcg?: number;
  vitaminD_IU?: number;
  omega3Mg?: number;
  sodiumMg?: number;
}

export interface RecipeMacros {
  proteinCalPct: number;
  carbsCalPct: number;
  fatsCalPct: number;
}

export interface Recipe {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  portionImages?: Partial<Record<0.5 | 1.0 | 1.5 | 2.0, string>>;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prepTimeMinutes: number;
  category: 'High Protein' | 'Steady Carbs' | 'Quick Fuel' | 'Keto Clean' | 'Post Workout';
  dietType: 'vegetarian' | 'vegan' | 'eggetarian' | 'pescatarian' | 'omnivore';
  tags: string[];
  focusScore: string;
  description: string;
  ingredients: { item: string; amount: string }[];
  instructions: string[];
  isCustom?: boolean;
  rawImage?: string;
  reasoningSteps?: string[];
  macros?: RecipeMacros;
  micros?: RecipeMicros;
}

export interface NutritionBreakdown {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  macros: {
    proteinCalPct: number;
    carbsCalPct: number;
    fatsCalPct: number;
  };
  micros: {
    fiberG: number;
    fiberDvPct: number;
    potassiumMg: number;
    potassiumDvPct: number;
    magnesiumMg: number;
    magnesiumDvPct: number;
    ironMg: number;
    ironDvPct: number;
    zincMg: number;
    zincDvPct: number;
    calciumMg: number;
    calciumDvPct: number;
    vitaminB12Mcg: number;
    vitaminB12DvPct: number;
    vitaminD_IU: number;
    vitaminDDvPct: number;
    omega3Mg: number;
    omega3DvPct: number;
  };
}

export function calculateRecipeNutrition(recipe: Recipe, multiplier: number = 1.0): NutritionBreakdown {
  const m = Math.max(0.25, Math.min(4.0, multiplier));
  const cals = Math.round(recipe.calories * m);
  const pro = Math.round(recipe.protein * m);
  const carb = Math.round(recipe.carbs * m);
  const fat = Math.round(recipe.fats * m);

  const proKcal = pro * 4;
  const carbKcal = carb * 4;
  const fatKcal = fat * 9;
  const totalKcal = Math.max(1, proKcal + carbKcal + fatKcal);

  const proteinCalPct = Math.round((proKcal / totalKcal) * 100);
  const carbsCalPct = Math.round((carbKcal / totalKcal) * 100);
  const fatsCalPct = Math.max(0, 100 - proteinCalPct - carbsCalPct);

  // Reference Daily Values (FDA Standard Reference)
  const DV = {
    fiber: 28,
    potassium: 3400,
    magnesium: 420,
    iron: 18,
    zinc: 11,
    calcium: 1000,
    vitaminB12: 2.4,
    vitaminD: 800,
    omega3: 1000,
  };

  const baseMicros: RecipeMicros = recipe.micros || {
    fiberG: Math.round(carb * 0.18 * 10) / 10,
    potassiumMg: Math.round(pro * 14 + carb * 6),
    magnesiumMg: Math.round(pro * 1.8 + carb * 1.5),
    ironMg: Math.round((pro * 0.08 + carb * 0.06) * 10) / 10,
    zincMg: Math.round((pro * 0.09) * 10) / 10,
    calciumMg: Math.round(pro * 4.5 + carb * 2),
    vitaminB12Mcg: recipe.dietType === 'vegan' ? 0 : Math.round((pro * 0.05) * 10) / 10,
    vitaminD_IU: recipe.tags.includes('Fish') || recipe.tags.includes('Salmon') || recipe.tags.includes('Eggs') ? 160 : 30,
    omega3Mg: recipe.tags.includes('Salmon') || recipe.tags.includes('Omega-3') ? 1400 : 150,
  };

  const fiberG = Number((baseMicros.fiberG * m).toFixed(1));
  const potassiumMg = Math.round(baseMicros.potassiumMg * m);
  const magnesiumMg = Math.round(baseMicros.magnesiumMg * m);
  const ironMg = Number((baseMicros.ironMg * m).toFixed(1));
  const zincMg = Number((baseMicros.zincMg * m).toFixed(1));
  const calciumMg = Math.round(baseMicros.calciumMg * m);
  const vitaminB12Mcg = Number(((baseMicros.vitaminB12Mcg || 0) * m).toFixed(1));
  const vitaminD_IU = Math.round((baseMicros.vitaminD_IU || 0) * m);
  const omega3Mg = Math.round((baseMicros.omega3Mg || 0) * m);

  return {
    calories: cals,
    protein: pro,
    carbs: carb,
    fats: fat,
    macros: {
      proteinCalPct,
      carbsCalPct,
      fatsCalPct,
    },
    micros: {
      fiberG,
      fiberDvPct: Math.min(100, Math.round((fiberG / DV.fiber) * 100)),
      potassiumMg,
      potassiumDvPct: Math.min(100, Math.round((potassiumMg / DV.potassium) * 100)),
      magnesiumMg,
      magnesiumDvPct: Math.min(100, Math.round((magnesiumMg / DV.magnesium) * 100)),
      ironMg,
      ironDvPct: Math.min(100, Math.round((ironMg / DV.iron) * 100)),
      zincMg,
      zincDvPct: Math.min(100, Math.round((zincMg / DV.zinc) * 100)),
      calciumMg,
      calciumDvPct: Math.min(100, Math.round((calciumMg / DV.calcium) * 100)),
      vitaminB12Mcg,
      vitaminB12DvPct: Math.min(100, Math.round((vitaminB12Mcg / DV.vitaminB12) * 100)),
      vitaminD_IU,
      vitaminDDvPct: Math.min(100, Math.round((vitaminD_IU / DV.vitaminD) * 100)),
      omega3Mg,
      omega3DvPct: Math.min(100, Math.round((omega3Mg / DV.omega3) * 100)),
    },
  };
}

export const RECIPES: Recipe[] = [
  {
    "id": "herb-grilled-chicken",
    "name": "Herb Grilled Chicken & Crispy Greens",
    "subtitle": "Lean pasture-raised breast with rosemary and wilted greens",
    "image": "/assets/food/grilled-chicken-1.0.webp",
    "calories": 520,
    "protein": 48,
    "carbs": 16,
    "fats": 14,
    "prepTimeMinutes": 20,
    "category": "High Protein",
    "dietType": "omnivore",
    "tags": [
      "High Protein",
      "Gluten-Free",
      "Post Workout",
      "Omnivore",
      "Poultry"
    ],
    "focusScore": "9.4/10",
    "description": "High-bioavailability protein paired with micro-nutrient dense dark greens. Calibrated to supply steady amino acids for physical recovery without post-meal fatigue.",
    "ingredients": [
      {
        "item": "Free-Range Chicken Breast",
        "amount": "250g"
      },
      {
        "item": "Fresh Rosemary & Thyme",
        "amount": "2 tbsp"
      },
      {
        "item": "Cold-Pressed Olive Oil",
        "amount": "1 tbsp"
      },
      {
        "item": "Baby Spinach & Arugula",
        "amount": "100g"
      },
      {
        "item": "Sea Salt & Crushed Black Pepper",
        "amount": "To taste"
      },
      {
        "item": "Lemon Juice",
        "amount": "1/2 lemon"
      }
    ],
    "instructions": [
      "Pound chicken breast to uniform 1/2-inch thickness for even searing.",
      "Rub chicken with olive oil, minced fresh herbs, sea salt, and black pepper.",
      "Heat cast-iron pan to medium-high and sear chicken for 5-6 minutes per side until internal temp reaches 165°F.",
      "In the residual pan juices, toss spinach and arugula for 45 seconds until wilted.",
      "Slice chicken across the grain, serve atop greens with a fresh squeeze of lemon."
    ],
    "micros": {
      "fiberG": 4.2,
      "potassiumMg": 780,
      "magnesiumMg": 88,
      "ironMg": 3.4,
      "zincMg": 2.8,
      "calciumMg": 140,
      "vitaminB12Mcg": 0.9,
      "vitaminD_IU": 24,
      "omega3Mg": 210
    }
  },
  {
    "id": "smoked-citrus-taco-bowl",
    "name": "Smoked Citrus Fiesta Taco Bowl",
    "subtitle": "Seasoned shredded chicken, cilantro cauliflower rice, black beans, and salsa",
    "image": "/assets/food/taco-bowl-1.0.webp",
    "calories": 540,
    "protein": 44,
    "carbs": 48,
    "fats": 16,
    "prepTimeMinutes": 20,
    "category": "Steady Carbs",
    "dietType": "omnivore",
    "tags": [
      "High Protein",
      "Gluten-Free",
      "Fiber Rich",
      "Poultry",
      "Omnivore"
    ],
    "focusScore": "9.1/10",
    "description": "Lean poultry and dietary fiber from slow-simmered black beans. Supplies sustained blood glucose stability with crisp fresh salsa.",
    "ingredients": [
      {
        "item": "Shredded Chicken Breast",
        "amount": "200g"
      },
      {
        "item": "Simmered Black Beans",
        "amount": "120g"
      },
      {
        "item": "Riced Cauliflower & Cilantro",
        "amount": "150g"
      },
      {
        "item": "Fresh Pico de Gallo Salsa",
        "amount": "3 tbsp"
      },
      {
        "item": "Hass Avocado",
        "amount": "1/4 sliced"
      },
      {
        "item": "Smoked Paprika & Cumin",
        "amount": "1 tsp"
      }
    ],
    "instructions": [
      "Warm shredded chicken in a skillet with cumin, smoked paprika, and 2 tbsp water.",
      "Flash-steam cauliflower rice in a pan with chopped cilantro and lime zest for 3 minutes.",
      "Assemble bowl with warm black beans, seasoned chicken, and cauliflower rice.",
      "Top with fresh pico de gallo and ripe avocado slices."
    ],
    "micros": {
      "fiberG": 9.8,
      "potassiumMg": 920,
      "magnesiumMg": 112,
      "ironMg": 4.1,
      "zincMg": 3.2,
      "calciumMg": 95,
      "vitaminB12Mcg": 0.8,
      "vitaminD_IU": 18,
      "omega3Mg": 310
    }
  },
  {
    "id": "garlic-prawn-linguine",
    "name": "Garlic Butter Prawn Linguine",
    "subtitle": "Wild tiger prawns, blistered cherry tomatoes, white wine reduction, and fresh parsley",
    "image": "/assets/food/prawn-linguine-1.0.webp",
    "calories": 590,
    "protein": 44,
    "carbs": 62,
    "fats": 15,
    "prepTimeMinutes": 18,
    "category": "Post Workout",
    "dietType": "pescatarian",
    "tags": [
      "High Protein",
      "Glycogen Reload",
      "Seafood",
      "Pescatarian"
    ],
    "focusScore": "9.0/10",
    "description": "High-density marine protein paired with complex semolina pasta. Replenishes muscle glycogen stores while delivering essential iodine and astaxanthin.",
    "ingredients": [
      {
        "item": "Wild Tiger Prawns (peeled)",
        "amount": "220g"
      },
      {
        "item": "Artisanal Durum Linguine",
        "amount": "90g dry"
      },
      {
        "item": "Blistered Cherry Tomatoes",
        "amount": "100g"
      },
      {
        "item": "Garlic Cloves (thinly sliced)",
        "amount": "4 cloves"
      },
      {
        "item": "Extra Virgin Olive Oil & Butter",
        "amount": "1 tbsp each"
      },
      {
        "item": "Flat-Leaf Italian Parsley",
        "amount": "Handful chopped"
      }
    ],
    "instructions": [
      "Cook linguine in salted boiling water until firm to the bite (al dente).",
      "Sear prawns with olive oil and sliced garlic in a hot pan for 90 seconds per side until pink.",
      "Add cherry tomatoes; burst gently to release sweet juices.",
      "Toss drained pasta into the skillet with a splash of pasta water, finish with parsley and fresh black pepper."
    ],
    "micros": {
      "fiberG": 3.6,
      "potassiumMg": 640,
      "magnesiumMg": 74,
      "ironMg": 3.8,
      "zincMg": 2.5,
      "calciumMg": 110,
      "vitaminB12Mcg": 1.8,
      "vitaminD_IU": 35,
      "omega3Mg": 520
    }
  },
  {
    "id": "homestyle-tariwala-chicken",
    "name": "Homestyle Tariwala Chicken & Phulkas",
    "subtitle": "Slow-simmered onion-tomato gravy with whole-wheat roti and fresh coriander",
    "image": "/assets/food/chicken-curry-1.0.webp",
    "calories": 530,
    "protein": 46,
    "carbs": 45,
    "fats": 14,
    "prepTimeMinutes": 30,
    "category": "High Protein",
    "dietType": "omnivore",
    "tags": [
      "High Protein",
      "Indian",
      "Comfort Fuel",
      "Poultry",
      "Omnivore"
    ],
    "focusScore": "9.2/10",
    "description": "Traditional Punjabi-style thin gravy chicken rich in anti-inflammatory turmeric, ginger, and garlic, paired with whole-wheat phulkas.",
    "ingredients": [
      {
        "item": "Skinless Bone-In Chicken Thighs & Breast",
        "amount": "260g"
      },
      {
        "item": "Whole Wheat Phulkas",
        "amount": "2 flatbreads"
      },
      {
        "item": "Onion-Tomato Puree Base",
        "amount": "150g"
      },
      {
        "item": "Ginger-Garlic Paste",
        "amount": "1 tbsp"
      },
      {
        "item": "Turmeric & Coriander Powder",
        "amount": "1 tsp each"
      },
      {
        "item": "Fresh Cilantro",
        "amount": "2 tbsp"
      }
    ],
    "instructions": [
      "Saute onions until golden brown, add ginger-garlic paste and ground spices.",
      "Add chicken pieces; sear on high heat for 5 minutes until sealed.",
      "Pour in hot water, cover and simmer on low for 18 minutes until tender and fragrant.",
      "Garnish with fresh cilantro and serve hot alongside fresh puffed whole-wheat phulkas."
    ],
    "micros": {
      "fiberG": 5.4,
      "potassiumMg": 860,
      "magnesiumMg": 96,
      "ironMg": 4.2,
      "zincMg": 3.4,
      "calciumMg": 72,
      "vitaminB12Mcg": 0.9,
      "vitaminD_IU": 18,
      "omega3Mg": 180
    }
  },
  {
    "id": "chettinad-pepper-chicken",
    "name": "Chettinad Black Pepper Chicken Kadai Roast",
    "subtitle": "Fiery South Indian black pepper chicken with curry leaves and steamed parboiled rice",
    "image": "/assets/food/pepper-chicken-1.0.webp",
    "calories": 540,
    "protein": 47,
    "carbs": 48,
    "fats": 14,
    "prepTimeMinutes": 25,
    "category": "High Protein",
    "dietType": "omnivore",
    "tags": [
      "High Protein",
      "South Indian",
      "Metabolic Boost",
      "Poultry",
      "Omnivore"
    ],
    "focusScore": "9.3/10",
    "description": "Freshly cracked Tellicherry black peppercorns stimulate digestive piperine, accelerating nutrient uptake alongside lean pasture-raised chicken.",
    "ingredients": [
      {
        "item": "Boneless Diced Chicken Breast",
        "amount": "240g"
      },
      {
        "item": "Coarsely Cracked Black Peppercorns",
        "amount": "1.5 tbsp"
      },
      {
        "item": "Fresh Curry Leaves",
        "amount": "15 leaves"
      },
      {
        "item": "Shallots (Sambhar Onions)",
        "amount": "80g sliced"
      },
      {
        "item": "Steamed Parboiled Rice",
        "amount": "120g"
      },
      {
        "item": "Cold-Pressed Sesame Oil",
        "amount": "1 tbsp"
      }
    ],
    "instructions": [
      "Heat sesame oil in a heavy-bottomed kadai, temper mustard seeds and fresh curry leaves.",
      "Saute sliced shallots until translucent and caramelized.",
      "Add chicken and roast with crushed black pepper, fennel seeds, and coriander powder on high heat.",
      "Cover on low heat for 10 minutes until chicken is tender with a dry aromatic coating.",
      "Serve alongside steamed parboiled rice."
    ],
    "micros": {
      "fiberG": 3.8,
      "potassiumMg": 810,
      "magnesiumMg": 92,
      "ironMg": 4.5,
      "zincMg": 3.1,
      "calciumMg": 68,
      "vitaminB12Mcg": 0.8,
      "vitaminD_IU": 16,
      "omega3Mg": 190
    }
  },
  {
    "id": "tawa-chicken-tikka",
    "name": "Smoky Tawa Chicken Tikka Skewers",
    "subtitle": "Yogurt-marinated chicken breast cubes with mint coriander chutney and pickled onions",
    "image": "/assets/food/chicken-tikka-1.0.webp",
    "calories": 460,
    "protein": 49,
    "carbs": 14,
    "fats": 11,
    "prepTimeMinutes": 20,
    "category": "High Protein",
    "dietType": "omnivore",
    "tags": [
      "High Protein",
      "Low Carb",
      "Keto Clean",
      "Poultry",
      "Omnivore"
    ],
    "focusScore": "9.5/10",
    "description": "Hung-curd marinated chicken breast delivers pure bioavailable protein with zero sugar. Mint-coriander chutney supplies digestive enzymes.",
    "ingredients": [
      {
        "item": "Chicken Breast (cut into 1-inch cubes)",
        "amount": "260g"
      },
      {
        "item": "Greek Yogurt (Hung Curd)",
        "amount": "3 tbsp"
      },
      {
        "item": "Kashmiri Red Chili & Garam Masala",
        "amount": "1 tsp each"
      },
      {
        "item": "Kasuri Methi (Dried Fenugreek)",
        "amount": "1 tsp"
      },
      {
        "item": "Fresh Mint Coriander Chutney",
        "amount": "2 tbsp"
      },
      {
        "item": "Lemon Juice & Chaat Masala",
        "amount": "To taste"
      }
    ],
    "instructions": [
      "Marinate chicken cubes with greek yogurt, spices, ginger-garlic paste, and lemon juice for 15 minutes.",
      "Thread onto skewers and sear on a scorching cast-iron tawa with a drizzle of oil for 4 minutes per side.",
      "Allow char marks to develop for authentic tandoor smokiness.",
      "Dust with chaat masala and serve with chilled mint chutney."
    ],
    "micros": {
      "fiberG": 2.1,
      "potassiumMg": 820,
      "magnesiumMg": 78,
      "ironMg": 2.9,
      "zincMg": 3.3,
      "calciumMg": 130,
      "vitaminB12Mcg": 1.1,
      "vitaminD_IU": 22,
      "omega3Mg": 160
    }
  },
  {
    "id": "sizzling-chicken-fajita-platter",
    "name": "Sizzling Mexican Chicken & Pepper Fajitas",
    "subtitle": "Cast-iron seared chicken strips with tri-color bell peppers, guacamole, and warm corn tortillas",
    "image": "/assets/food/chicken-fajitas-1.0.webp",
    "calories": 520,
    "protein": 44,
    "carbs": 38,
    "fats": 16,
    "prepTimeMinutes": 20,
    "category": "Steady Carbs",
    "dietType": "omnivore",
    "tags": [
      "High Protein",
      "Gluten-Free",
      "Mexican",
      "Poultry",
      "Omnivore"
    ],
    "focusScore": "9.2/10",
    "description": "Lean poultry breast tossed with vitamin-C rich sweet bell peppers. Supports collagen synthesis and immune cell resilience.",
    "ingredients": [
      {
        "item": "Chicken Breast Strips",
        "amount": "220g"
      },
      {
        "item": "Tri-Color Bell Peppers (sliced)",
        "amount": "150g"
      },
      {
        "item": "Red Onion (sliced)",
        "amount": "60g"
      },
      {
        "item": "Stone-Ground Corn Tortillas",
        "amount": "2 tortillas"
      },
      {
        "item": "Fresh Guacamole",
        "amount": "2 tbsp"
      },
      {
        "item": "Fajita Spice (Cumin, Smoked Paprika, Oregano)",
        "amount": "1 tbsp"
      }
    ],
    "instructions": [
      "Toss chicken breast strips with fajita seasonings, lime juice, and olive oil.",
      "Heat a seasoned cast-iron skillet until smoking; sear chicken strips for 5 minutes until browned.",
      "Toss in sliced bell peppers and onions; flash-fry for 3 minutes retaining crisp-tender crunch.",
      "Warm corn tortillas and serve directly from the sizzling skillet with fresh guacamole."
    ],
    "micros": {
      "fiberG": 6.2,
      "potassiumMg": 890,
      "magnesiumMg": 84,
      "ironMg": 3.6,
      "zincMg": 2.9,
      "calciumMg": 88,
      "vitaminB12Mcg": 0.8,
      "vitaminD_IU": 18,
      "omega3Mg": 240
    }
  },
  {
    "id": "greek-lemon-herb-salmon",
    "name": "Greek Lemon Herb Salmon & Warm Orzo",
    "subtitle": "Pan-crisped wild salmon fillet with garlic dill orzo, wilted spinach, and crumbled feta",
    "image": "/assets/food/greek-salmon-1.0.webp",
    "calories": 580,
    "protein": 45,
    "carbs": 42,
    "fats": 22,
    "prepTimeMinutes": 20,
    "category": "High Protein",
    "dietType": "pescatarian",
    "tags": [
      "Omega-3 Dense",
      "Seafood",
      "Anti-Inflammatory",
      "Pescatarian",
      "Salmon"
    ],
    "focusScore": "9.6/10",
    "description": "Rich in marine EPA and DHA omega-3 fatty acids for neural membrane fluidity and cardiovascular health. Paired with herbed orzo.",
    "ingredients": [
      {
        "item": "Wild-Caught Salmon Fillet (skin-on)",
        "amount": "220g"
      },
      {
        "item": "Semolina Orzo Pasta",
        "amount": "70g dry"
      },
      {
        "item": "Baby Spinach",
        "amount": "80g"
      },
      {
        "item": "Authentic Sheep Milk Feta",
        "amount": "25g"
      },
      {
        "item": "Fresh Dill & Lemon Zest",
        "amount": "1 tbsp each"
      },
      {
        "item": "Cold-Pressed Olive Oil",
        "amount": "1 tsp"
      }
    ],
    "instructions": [
      "Boil orzo pasta in salted water for 9 minutes until al dente; stir in fresh dill and spinach.",
      "Pat salmon skin dry; sear in hot skillet skin-side down for 5 minutes until golden and shatter-crisp.",
      "Flip salmon and finish for 2 minutes on low heat.",
      "Plate crispy salmon atop warm herbed orzo, crumble feta, and finish with lemon zest."
    ],
    "micros": {
      "fiberG": 3.8,
      "potassiumMg": 960,
      "magnesiumMg": 110,
      "ironMg": 3.5,
      "zincMg": 2.4,
      "calciumMg": 160,
      "vitaminB12Mcg": 4.8,
      "vitaminD_IU": 540,
      "omega3Mg": 2100
    }
  },
  {
    "id": "thai-red-coconut-curry-prawns",
    "name": "Creamy Thai Red Coconut Curry & Tiger Prawns",
    "subtitle": "Succulent prawns in lemongrass red coconut broth with bamboo shoots and jasmine rice",
    "image": "/assets/food/thai-curry-1.0.webp",
    "calories": 520,
    "protein": 38,
    "carbs": 46,
    "fats": 18,
    "prepTimeMinutes": 22,
    "category": "Steady Carbs",
    "dietType": "pescatarian",
    "tags": [
      "Seafood",
      "Thai",
      "Anti-Inflammatory",
      "Pescatarian"
    ],
    "focusScore": "9.0/10",
    "description": "Light coconut milk supplies medium-chain triglycerides (MCTs) for rapid brain energy, while wild prawns provide iodine and selenium.",
    "ingredients": [
      {
        "item": "Tiger Prawns (peeled & deveined)",
        "amount": "220g"
      },
      {
        "item": "Light Coconut Milk",
        "amount": "160ml"
      },
      {
        "item": "Authentic Thai Red Curry Paste",
        "amount": "1.5 tbsp"
      },
      {
        "item": "Thai Basil & Kaffir Lime Leaves",
        "amount": "Handful"
      },
      {
        "item": "Bamboo Shoots & Snow Peas",
        "amount": "80g"
      },
      {
        "item": "Steamed Jasmine Rice",
        "amount": "120g"
      }
    ],
    "instructions": [
      "Simmer red curry paste in 2 tbsp coconut cream until aromatic oils separate.",
      "Pour in remaining coconut milk, bring to gentle boil, add bamboo shoots and snow peas.",
      "Add tiger prawns and simmer gently for 3 minutes until tender and opaque.",
      "Stir in fresh Thai basil leaves off the heat; serve alongside jasmine rice."
    ],
    "micros": {
      "fiberG": 3.2,
      "potassiumMg": 680,
      "magnesiumMg": 78,
      "ironMg": 3.9,
      "zincMg": 2.7,
      "calciumMg": 125,
      "vitaminB12Mcg": 1.6,
      "vitaminD_IU": 40,
      "omega3Mg": 480
    }
  },
  {
    "id": "spanish-saffron-chicken-paella",
    "name": "Spanish Saffron & Smoked Paprika Chicken Skillet",
    "subtitle": "Bomba rice simmered in saffron broth with chicken breast, green beans, and sweet peas",
    "image": "/assets/food/spanish-paella-1.0.webp",
    "calories": 560,
    "protein": 44,
    "carbs": 58,
    "fats": 14,
    "prepTimeMinutes": 30,
    "category": "Steady Carbs",
    "dietType": "omnivore",
    "tags": [
      "High Protein",
      "Spanish",
      "Glycogen Reload",
      "Poultry",
      "Omnivore"
    ],
    "focusScore": "9.1/10",
    "description": "Saffron is clinically proven to support healthy neurotransmitter regulation and mood stamina. Paired with lean chicken in slow-simmered paella rice.",
    "ingredients": [
      {
        "item": "Chicken Breast Cubes",
        "amount": "220g"
      },
      {
        "item": "Spanish Bomba Rice",
        "amount": "75g dry"
      },
      {
        "item": "Spanish Saffron Strands",
        "amount": "Pinch infused in warm stock"
      },
      {
        "item": "Flat Green Beans & Sweet Peas",
        "amount": "100g"
      },
      {
        "item": "Smoked Spanish Paprika (Pimentón)",
        "amount": "1 tsp"
      },
      {
        "item": "Chicken Bone Broth",
        "amount": "250ml"
      }
    ],
    "instructions": [
      "Brown chicken cubes in olive oil in a wide paella skillet.",
      "Add sweet paprika, green beans, and toast the Bomba rice for 2 minutes.",
      "Pour in hot saffron-infused bone broth; do not stir, allowing the rice to absorb evenly.",
      "Simmer on medium-low for 16 minutes until stock is absorbed and a golden socarrat forms on the bottom.",
      "Rest for 5 minutes with a clean towel before serving."
    ],
    "micros": {
      "fiberG": 4.8,
      "potassiumMg": 760,
      "magnesiumMg": 82,
      "ironMg": 3.8,
      "zincMg": 3,
      "calciumMg": 65,
      "vitaminB12Mcg": 0.8,
      "vitaminD_IU": 20,
      "omega3Mg": 220
    }
  },
  {
    "id": "japanese-teriyaki-chicken-donburi",
    "name": "Glazed Teriyaki Chicken Donburi with Edamame",
    "subtitle": "Mirin-glazed chicken breast, steamed short-grain rice, edamame, and pickled red ginger",
    "image": "/assets/food/teriyaki-chicken-1.0.webp",
    "calories": 550,
    "protein": 46,
    "carbs": 56,
    "fats": 12,
    "prepTimeMinutes": 20,
    "category": "Steady Carbs",
    "dietType": "omnivore",
    "tags": [
      "High Protein",
      "Japanese",
      "Post Workout",
      "Poultry",
      "Omnivore"
    ],
    "focusScore": "9.2/10",
    "description": "Traditional teriyaki glaze prepared with low-sodium tamari and mirin. Delivers an ideal post-workout carbohydrate-to-protein replenishment ratio.",
    "ingredients": [
      {
        "item": "Diced Chicken Breast",
        "amount": "240g"
      },
      {
        "item": "Shelled Edamame Beans",
        "amount": "60g"
      },
      {
        "item": "Steamed Short-Grain Japanese Rice",
        "amount": "130g"
      },
      {
        "item": "Low-Sodium Tamari & Mirin Glaze",
        "amount": "2 tbsp"
      },
      {
        "item": "Beni Shoga (Pickled Ginger)",
        "amount": "1 tbsp"
      },
      {
        "item": "Toasted White Sesame Seeds",
        "amount": "1 tsp"
      }
    ],
    "instructions": [
      "Sear chicken breast cubes in a hot wok until edges are lightly browned.",
      "Pour in tamari, mirin, and grated ginger reduction; let bubble until glossy and coats chicken.",
      "Steam shelled edamame beans for 2 minutes.",
      "Spoon warm rice into a bowl, arrange glazed chicken and edamame, finish with toasted sesame seeds."
    ],
    "micros": {
      "fiberG": 4.5,
      "potassiumMg": 820,
      "magnesiumMg": 95,
      "ironMg": 3.7,
      "zincMg": 3.3,
      "calciumMg": 85,
      "vitaminB12Mcg": 0.8,
      "vitaminD_IU": 18,
      "omega3Mg": 260
    }
  },
  {
    "id": "moroccan-chermoula-fish-fillet",
    "name": "Moroccan Chermoula Seared White Fish & Couscous",
    "subtitle": "Herb-marinated white fish fillet with warm whole-wheat couscous, roasted peppers, and mint",
    "image": "/assets/food/chermoula-fish-1.0.webp",
    "calories": 480,
    "protein": 43,
    "carbs": 45,
    "fats": 12,
    "prepTimeMinutes": 20,
    "category": "High Protein",
    "dietType": "pescatarian",
    "tags": [
      "High Protein",
      "Seafood",
      "Mediterranean",
      "Pescatarian"
    ],
    "focusScore": "9.3/10",
    "description": "Fresh chermoula (cilantro, parsley, cumin, lemon, garlic) provides polyphenol defense and enhances bioavailable lean marine protein.",
    "ingredients": [
      {
        "item": "White Fish Fillet (Cod or Halibut)",
        "amount": "240g"
      },
      {
        "item": "Whole-Wheat Couscous",
        "amount": "70g dry"
      },
      {
        "item": "Fresh Chermoula Herb Rub",
        "amount": "2.5 tbsp"
      },
      {
        "item": "Roasted Red Bell Pepper Strips",
        "amount": "80g"
      },
      {
        "item": "Fresh Lemon Juice",
        "amount": "1 tbsp"
      },
      {
        "item": "Toasted Almond Slivers",
        "amount": "1 tbsp"
      }
    ],
    "instructions": [
      "Coat white fish fillet with fresh chermoula marinade for 10 minutes.",
      "Steam couscous in hot broth for 5 minutes, fluff with a fork and toss with toasted almonds.",
      "Pan-sear fish in a hot skillet for 4 minutes per side until flaky, golden, and opaque.",
      "Serve atop couscous with roasted peppers and a squeeze of fresh lemon."
    ],
    "micros": {
      "fiberG": 5.6,
      "potassiumMg": 780,
      "magnesiumMg": 86,
      "ironMg": 3.2,
      "zincMg": 2.1,
      "calciumMg": 90,
      "vitaminB12Mcg": 2.4,
      "vitaminD_IU": 110,
      "omega3Mg": 680
    }
  },
  {
    "id": "greek-lemon-chicken-souvlaki",
    "name": "Greek Lemon Chicken Souvlaki & Tzatziki Plate",
    "subtitle": "Oregano skewers with cucumber-mint tzatziki, kalamata olives, and warm pita wedges",
    "image": "/assets/food/chicken-souvlaki-1.0.webp",
    "calories": 510,
    "protein": 47,
    "carbs": 34,
    "fats": 17,
    "prepTimeMinutes": 22,
    "category": "High Protein",
    "dietType": "omnivore",
    "tags": [
      "High Protein",
      "Mediterranean",
      "Poultry",
      "Omnivore"
    ],
    "focusScore": "9.4/10",
    "description": "Rich in clean amino acids and probiotic Greek yogurt tzatziki for gut microbiome integrity and muscular rebuild.",
    "ingredients": [
      {
        "item": "Chicken Breast (skewered & cubed)",
        "amount": "250g"
      },
      {
        "item": "Greek Yogurt Tzatziki with Mint",
        "amount": "3 tbsp"
      },
      {
        "item": "Whole-Wheat Greek Pita",
        "amount": "1 pita"
      },
      {
        "item": "Kalamata Olives (pitted)",
        "amount": "6 olives"
      },
      {
        "item": "Fresh Oregano & Garlic Marinade",
        "amount": "1.5 tbsp"
      },
      {
        "item": "Sliced Persian Cucumbers",
        "amount": "60g"
      }
    ],
    "instructions": [
      "Marinate chicken cubes with lemon juice, minced garlic, extra virgin olive oil, and Greek oregano.",
      "Grill skewers over high heat for 8-10 minutes, rotating until charred and juicy.",
      "Warm pita on the grill for 30 seconds.",
      "Serve skewers alongside cold tzatziki, kalamata olives, and fresh cucumber slices."
    ],
    "micros": {
      "fiberG": 3.9,
      "potassiumMg": 840,
      "magnesiumMg": 82,
      "ironMg": 3.5,
      "zincMg": 3.2,
      "calciumMg": 145,
      "vitaminB12Mcg": 0.9,
      "vitaminD_IU": 22,
      "omega3Mg": 210
    }
  },
  {
    "id": "rosemary-turkey-skillet",
    "name": "Rosemary Roasted Turkey Skillet",
    "subtitle": "Lean sliced pasture turkey breast with sweet potatoes and tender steamed asparagus",
    "image": "/assets/food/turkey-skillet-1.0.webp",
    "calories": 490,
    "protein": 46,
    "carbs": 38,
    "fats": 12,
    "prepTimeMinutes": 22,
    "category": "High Protein",
    "dietType": "omnivore",
    "tags": [
      "High Protein",
      "Gluten-Free",
      "Poultry",
      "Clean Fuel",
      "Omnivore"
    ],
    "focusScore": "9.5/10",
    "description": "Ultra-lean turkey breast loaded with l-tryptophan and B-vitamins, paired with slow-release beta-carotene from roasted sweet potato.",
    "ingredients": [
      {
        "item": "Pasture-Raised Turkey Breast",
        "amount": "240g"
      },
      {
        "item": "Cubed Sweet Potato",
        "amount": "140g"
      },
      {
        "item": "Fresh Tender Asparagus",
        "amount": "100g"
      },
      {
        "item": "Fresh Rosemary & Thyme",
        "amount": "1.5 tbsp"
      },
      {
        "item": "Cold-Pressed Olive Oil",
        "amount": "1 tbsp"
      },
      {
        "item": "Sea Salt & Black Pepper",
        "amount": "To taste"
      }
    ],
    "instructions": [
      "Roast sweet potato cubes in olive oil at 400°F for 18 minutes until tender and caramelized.",
      "Season turkey breast with fresh rosemary, garlic, and sea salt.",
      "Pan-sear turkey for 5 minutes per side until golden and internal temperature reaches 165°F.",
      "Flash-steam asparagus spears in the pan juices for 2 minutes.",
      "Slice turkey across grain and serve atop sweet potatoes and asparagus."
    ],
    "micros": {
      "fiberG": 5.8,
      "potassiumMg": 940,
      "magnesiumMg": 92,
      "ironMg": 3.6,
      "zincMg": 3.8,
      "calciumMg": 85,
      "vitaminB12Mcg": 1.2,
      "vitaminD_IU": 24,
      "omega3Mg": 230
    }
  },
  {
    "id": "lemon-garlic-cod",
    "name": "Pan-Seared Lemon Garlic Cod",
    "subtitle": "Flaky Pacific cod fillet with salty capers, blistered cherry tomatoes, and green beans",
    "image": "/assets/food/lemon-garlic-cod-1.0.webp",
    "calories": 410,
    "protein": 42,
    "carbs": 14,
    "fats": 18,
    "prepTimeMinutes": 15,
    "category": "Keto Clean",
    "dietType": "pescatarian",
    "tags": [
      "High Protein",
      "Keto Clean",
      "Seafood",
      "Low Carb",
      "Pescatarian"
    ],
    "focusScore": "9.4/10",
    "description": "Lean wild white fish offering high protein efficiency per calorie. Rich in bioavailable iodine and selenium to support thyroid and metabolic rate.",
    "ingredients": [
      {
        "item": "Wild Pacific Cod Fillet",
        "amount": "250g"
      },
      {
        "item": "Baby Green Beans (haricots verts)",
        "amount": "110g"
      },
      {
        "item": "Halved Cherry Tomatoes",
        "amount": "80g"
      },
      {
        "item": "Capers in Brine",
        "amount": "1.5 tbsp"
      },
      {
        "item": "Garlic & Extra Virgin Olive Oil",
        "amount": "1 tbsp"
      },
      {
        "item": "Fresh Lemon Wedges",
        "amount": "1 lemon"
      }
    ],
    "instructions": [
      "Pat cod fillet dry with a towel and season with sea salt and cracked pepper.",
      "Heat olive oil in a stainless steel skillet over medium-high heat.",
      "Sear cod for 3.5 minutes without moving until a golden crust forms; flip gently for 2 minutes.",
      "Add capers, tomatoes, and green beans to the skillet; sauté until tomatoes blister.",
      "Spoon pan juices over cod and finish with fresh lemon."
    ],
    "micros": {
      "fiberG": 3.9,
      "potassiumMg": 790,
      "magnesiumMg": 78,
      "ironMg": 2.4,
      "zincMg": 1.8,
      "calciumMg": 72,
      "vitaminB12Mcg": 2.1,
      "vitaminD_IU": 65,
      "omega3Mg": 420
    }
  },
  {
    "id": "blackened-cajun-salmon",
    "name": "Blackened Cajun Wild Salmon",
    "subtitle": "Crispy-crusted salmon fillet with fluffy herb quinoa and charred lime",
    "image": "/assets/food/blackened-salmon-1.0.webp",
    "calories": 560,
    "protein": 44,
    "carbs": 34,
    "fats": 24,
    "prepTimeMinutes": 20,
    "category": "High Protein",
    "dietType": "pescatarian",
    "tags": [
      "Omega-3 Dense",
      "High Protein",
      "Seafood",
      "Salmon",
      "Pescatarian"
    ],
    "focusScore": "9.6/10",
    "description": "Potent marine astaxanthin and long-chain omega-3s combat systemic inflammation while complete-protein quinoa provides steady glycogen recharge.",
    "ingredients": [
      {
        "item": "Wild Alaskan Sockeye Salmon",
        "amount": "220g"
      },
      {
        "item": "Cajun Blackening Spice Blend",
        "amount": "1.5 tbsp"
      },
      {
        "item": "Cooked Tricolor Quinoa with Parsley",
        "amount": "130g"
      },
      {
        "item": "Avocado Oil",
        "amount": "1 tbsp"
      },
      {
        "item": "Fresh Lime Wedges",
        "amount": "1 lime"
      },
      {
        "item": "Minced Red Onion & Cilantro",
        "amount": "2 tbsp"
      }
    ],
    "instructions": [
      "Press Cajun spice blend firmly onto the flesh side of the salmon fillet.",
      "Heat avocado oil in cast-iron skillet over high heat until shimmering.",
      "Sear spiced side down for 3 minutes until charred and deeply aromatic.",
      "Flip to skin side, lower heat to medium, cook for 3 minutes until medium-rare to medium.",
      "Serve immediately atop fluffy quinoa salad with charred lime."
    ],
    "micros": {
      "fiberG": 4.8,
      "potassiumMg": 980,
      "magnesiumMg": 120,
      "ironMg": 3.8,
      "zincMg": 2.6,
      "calciumMg": 80,
      "vitaminB12Mcg": 5.2,
      "vitaminD_IU": 580,
      "omega3Mg": 2200
    }
  },
  {
    "id": "cilantro-garlic-shrimp",
    "name": "Cilantro Lime Garlic Butter Shrimp",
    "subtitle": "Tail-on sautéed prawns over riced cauliflower and fresh lemon",
    "image": "/assets/food/garlic-butter-shrimp-1.0.webp",
    "calories": 380,
    "protein": 38,
    "carbs": 12,
    "fats": 16,
    "prepTimeMinutes": 15,
    "category": "Keto Clean",
    "dietType": "pescatarian",
    "tags": [
      "High Protein",
      "Keto Clean",
      "Seafood",
      "Low Carb",
      "Pescatarian"
    ],
    "focusScore": "9.3/10",
    "description": "Fast-digesting shellfish protein packed with selenium, copper, and choline over vitamin-dense riced cauliflower.",
    "ingredients": [
      {
        "item": "Large Tiger Prawns (peeled, tail-on)",
        "amount": "240g"
      },
      {
        "item": "Riced Cauliflower",
        "amount": "180g"
      },
      {
        "item": "Grass-Fed Butter & Olive Oil",
        "amount": "1 tbsp each"
      },
      {
        "item": "Minced Garlic Cloves",
        "amount": "4 cloves"
      },
      {
        "item": "Fresh Cilantro & Lime Juice",
        "amount": "Handful"
      },
      {
        "item": "Crushed Red Pepper Flakes",
        "amount": "1/2 tsp"
      }
    ],
    "instructions": [
      "Melt butter and olive oil in skillet with minced garlic and red pepper flakes.",
      "Add prawns in a single layer; cook for 90 seconds per side until opaque and pink.",
      "Steam cauliflower rice in a separate hot dry skillet for 3 minutes until tender.",
      "Pour garlic butter shrimp and juices directly over cauliflower rice, finish with cilantro."
    ],
    "micros": {
      "fiberG": 3.6,
      "potassiumMg": 620,
      "magnesiumMg": 68,
      "ironMg": 3.4,
      "zincMg": 2.2,
      "calciumMg": 115,
      "vitaminB12Mcg": 1.7,
      "vitaminD_IU": 32,
      "omega3Mg": 490
    }
  },
  {
    "id": "seared-tuna-nicoise",
    "name": "Seared Yellowfin Tuna Niçoise",
    "subtitle": "Crusted ahi tuna with soft jammy egg, green beans, and kalamata olives",
    "image": "/assets/food/tuna-nicoise-1.0.webp",
    "calories": 520,
    "protein": 50,
    "carbs": 18,
    "fats": 22,
    "prepTimeMinutes": 18,
    "category": "High Protein",
    "dietType": "pescatarian",
    "tags": [
      "High Protein",
      "Seafood",
      "Keto Clean",
      "Pescatarian"
    ],
    "focusScore": "9.6/10",
    "description": "Elite athlete recovery meal delivering 50g complete marine protein, whole-egg choline for neurotransmitter synthesis, and polyphenol-packed olives.",
    "ingredients": [
      {
        "item": "Sashimi-Grade Yellowfin Tuna Steak",
        "amount": "220g"
      },
      {
        "item": "Pasture-Raised Egg (soft-boiled)",
        "amount": "1 egg"
      },
      {
        "item": "Steamed French Green Beans",
        "amount": "100g"
      },
      {
        "item": "Kalamata Olives",
        "amount": "8 olives"
      },
      {
        "item": "Dijon Mustard & Red Wine Vinegar Dressing",
        "amount": "1.5 tbsp"
      },
      {
        "item": "Cracked Peppercorn Crust",
        "amount": "1 tsp"
      }
    ],
    "instructions": [
      "Coat tuna steak in coarse cracked black pepper and sea salt.",
      "Sear in a smoking cast-iron pan for exactly 60 seconds per side for rare center.",
      "Boil egg for 6.5 minutes, plunge into ice bath, peel, and halve for jammy center.",
      "Slice tuna into thick pieces; arrange on plate with green beans, egg, and olives.",
      "Drizzle with light Dijon red wine vinaigrette."
    ],
    "micros": {
      "fiberG": 4.1,
      "potassiumMg": 890,
      "magnesiumMg": 98,
      "ironMg": 3.9,
      "zincMg": 2.8,
      "calciumMg": 95,
      "vitaminB12Mcg": 5.4,
      "vitaminD_IU": 120,
      "omega3Mg": 1100
    }
  },
  {
    "id": "honey-dijon-chicken-thigh",
    "name": "Honey Dijon Roasted Chicken Thigh",
    "subtitle": "Crispy pan-roasted chicken with glazed baby carrots and fresh rosemary",
    "image": "/assets/food/honey-dijon-chicken-1.0.webp",
    "calories": 540,
    "protein": 42,
    "carbs": 28,
    "fats": 24,
    "prepTimeMinutes": 25,
    "category": "Post Workout",
    "dietType": "omnivore",
    "tags": [
      "High Protein",
      "Gluten-Free",
      "Poultry",
      "Omnivore"
    ],
    "focusScore": "9.1/10",
    "description": "Tender chicken thigh provides beneficial zinc and iron with a gentle glaze of unprocessed honey and stoneground mustard.",
    "ingredients": [
      {
        "item": "Skin-On Chicken Thigh (bone-in)",
        "amount": "260g"
      },
      {
        "item": "Dutch Baby Carrots (trimmed)",
        "amount": "130g"
      },
      {
        "item": "Raw Honey & Dijon Mustard",
        "amount": "1 tbsp each"
      },
      {
        "item": "Fresh Rosemary Sprigs",
        "amount": "3 sprigs"
      },
      {
        "item": "Avocado Oil",
        "amount": "1 tsp"
      },
      {
        "item": "Flaky Sea Salt",
        "amount": "Pinch"
      }
    ],
    "instructions": [
      "Score chicken skin, season with sea salt, and sear skin-down in an oven-safe skillet for 8 minutes.",
      "Flip chicken, add carrots and rosemary sprigs around the pan.",
      "Brush chicken and carrots with honey Dijon whisked glaze.",
      "Transfer skillet to 400°F oven for 14 minutes until chicken registers 175°F and carrots are glazed."
    ],
    "micros": {
      "fiberG": 4.2,
      "potassiumMg": 780,
      "magnesiumMg": 74,
      "ironMg": 3.1,
      "zincMg": 3.6,
      "calciumMg": 68,
      "vitaminB12Mcg": 0.9,
      "vitaminD_IU": 22,
      "omega3Mg": 280
    }
  },
  {
    "id": "coconut-lime-poached-prawns",
    "name": "Coconut Lime Poached Tiger Prawns",
    "subtitle": "Juicy prawns in fragrant coconut lemongrass broth with tender snap peas",
    "image": "/assets/food/coconut-lime-shrimp-1.0.webp",
    "calories": 460,
    "protein": 36,
    "carbs": 20,
    "fats": 22,
    "prepTimeMinutes": 18,
    "category": "Quick Fuel",
    "dietType": "pescatarian",
    "tags": [
      "Seafood",
      "Dairy Free",
      "Anti-Inflammatory",
      "Pescatarian"
    ],
    "focusScore": "9.2/10",
    "description": "Light coconut broth infused with fresh ginger and lemongrass provides lauric acid for immune vitality, paired with lean marine shellfish.",
    "ingredients": [
      {
        "item": "Fresh Tiger Prawns (peeled)",
        "amount": "220g"
      },
      {
        "item": "Light Coconut Milk",
        "amount": "180ml"
      },
      {
        "item": "Sugar Snap Peas",
        "amount": "90g"
      },
      {
        "item": "Lemongrass & Minced Ginger",
        "amount": "1 tbsp each"
      },
      {
        "item": "Fresh Lime Juice & Zest",
        "amount": "1 lime"
      },
      {
        "item": "Fresh Cilantro & Scallions",
        "amount": "2 tbsp"
      }
    ],
    "instructions": [
      "Bruise lemongrass and simmer in coconut milk with ginger and lime zest for 6 minutes.",
      "Add sugar snap peas and prawns to the fragrant poaching liquid.",
      "Gently simmer on low for 3 minutes until prawns turn pink and tender.",
      "Remove lemongrass stalk, stir in lime juice, and serve garnished with cilantro."
    ],
    "micros": {
      "fiberG": 3.1,
      "potassiumMg": 690,
      "magnesiumMg": 82,
      "ironMg": 3.6,
      "zincMg": 2.4,
      "calciumMg": 110,
      "vitaminB12Mcg": 1.5,
      "vitaminD_IU": 35,
      "omega3Mg": 460
    }
  },
  {
    "id": "cantonese-ginger-tilapia",
    "name": "Cantonese Ginger Steamed Tilapia",
    "subtitle": "Delicate white fish with julienned ginger, scallions, and light tamari",
    "image": "/assets/food/ginger-steamed-tilapia-1.0.webp",
    "calories": 360,
    "protein": 40,
    "carbs": 8,
    "fats": 14,
    "prepTimeMinutes": 16,
    "category": "Keto Clean",
    "dietType": "pescatarian",
    "tags": [
      "High Protein",
      "Keto Clean",
      "Seafood",
      "Clean Fuel",
      "Pescatarian"
    ],
    "focusScore": "9.5/10",
    "description": "Pure, easily assimilable protein cooked using traditional steam preservation. Gingerol compounds improve gastric motility and lower markers of muscle soreness.",
    "ingredients": [
      {
        "item": "Fresh Tilapia Fillets",
        "amount": "240g"
      },
      {
        "item": "Julienned Fresh Ginger",
        "amount": "2 tbsp"
      },
      {
        "item": "Green Scallions (sliced lengthwise)",
        "amount": "3 stalks"
      },
      {
        "item": "Light Tamari Soy Sauce",
        "amount": "1.5 tbsp"
      },
      {
        "item": "Toasted Sesame Oil",
        "amount": "1 tbsp"
      },
      {
        "item": "Fresh Cilantro Sprigs",
        "amount": "Handful"
      }
    ],
    "instructions": [
      "Place tilapia on a heatproof plate, top with julienned ginger and scallion whites.",
      "Steam over boiling water for 8 minutes until fish flakes effortlessly with a fork.",
      "Discard steaming liquid, drizzle with light tamari and arrange fresh cilantro.",
      "Heat sesame oil in a small pan until smoking; pour over herbs to release deep aromatics."
    ],
    "micros": {
      "fiberG": 1.5,
      "potassiumMg": 620,
      "magnesiumMg": 64,
      "ironMg": 2.1,
      "zincMg": 1.9,
      "calciumMg": 45,
      "vitaminB12Mcg": 2.2,
      "vitaminD_IU": 120,
      "omega3Mg": 380
    }
  },
  {
    "id": "smoked-paprika-chicken-skewers",
    "name": "Smoked Paprika Chicken Skewers",
    "subtitle": "Grilled marinated chicken cubes with bell peppers and roasted pepper dip",
    "image": "/assets/food/paprika-chicken-skewers-1.0.webp",
    "calories": 480,
    "protein": 46,
    "carbs": 16,
    "fats": 18,
    "prepTimeMinutes": 22,
    "category": "High Protein",
    "dietType": "omnivore",
    "tags": [
      "High Protein",
      "Keto Clean",
      "Poultry",
      "Omnivore"
    ],
    "focusScore": "9.4/10",
    "description": "Skewered chicken breast marinated in Spanish smoked pimentón and garlic. Served with a roasted red pepper and walnut romesco dip.",
    "ingredients": [
      {
        "item": "Chicken Breast (diced into cubes)",
        "amount": "250g"
      },
      {
        "item": "Zucchini & Red Bell Pepper (sliced)",
        "amount": "120g"
      },
      {
        "item": "Smoked Sweet Paprika",
        "amount": "1 tbsp"
      },
      {
        "item": "Roasted Red Pepper Romesco Dip",
        "amount": "2 tbsp"
      },
      {
        "item": "Extra Virgin Olive Oil",
        "amount": "1 tbsp"
      },
      {
        "item": "Garlic Powder & Sea Salt",
        "amount": "1 tsp each"
      }
    ],
    "instructions": [
      "Toss chicken cubes, zucchini, and peppers in olive oil, paprika, garlic, and sea salt.",
      "Thread onto skewers alternating chicken and vegetables.",
      "Grill or pan-sear on medium-high heat for 9 minutes, turning occasionally until charred.",
      "Serve hot alongside warm roasted pepper dip."
    ],
    "micros": {
      "fiberG": 3.4,
      "potassiumMg": 820,
      "magnesiumMg": 80,
      "ironMg": 3.2,
      "zincMg": 3.1,
      "calciumMg": 62,
      "vitaminB12Mcg": 0.8,
      "vitaminD_IU": 20,
      "omega3Mg": 190
    }
  },
  {
    "id": "spiced-turkey-stuffed-pepper",
    "name": "Spiced Turkey & Black Bean Stuffed Pepper",
    "subtitle": "Oven-roasted bell pepper filled with seasoned ground turkey and corn",
    "image": "/assets/food/turkey-stuffed-pepper-1.0.webp",
    "calories": 470,
    "protein": 40,
    "carbs": 36,
    "fats": 14,
    "prepTimeMinutes": 28,
    "category": "Steady Carbs",
    "dietType": "omnivore",
    "tags": [
      "High Protein",
      "Fiber Rich",
      "Poultry",
      "Omnivore"
    ],
    "focusScore": "9.3/10",
    "description": "Capsaicin and vitamin C from roasted peppers enhance non-heme iron absorption from black beans, paired with lean ground turkey.",
    "ingredients": [
      {
        "item": "Extra-Lean Ground Turkey (93/7)",
        "amount": "200g"
      },
      {
        "item": "Large Red Bell Pepper (halved)",
        "amount": "1 pepper"
      },
      {
        "item": "Black Beans & Sweet Corn",
        "amount": "80g"
      },
      {
        "item": "Part-Skim Mozzarella",
        "amount": "25g"
      },
      {
        "item": "Cumin, Chili Powder, Oregano",
        "amount": "1 tbsp"
      },
      {
        "item": "Fresh Cilantro",
        "amount": "1 tbsp"
      }
    ],
    "instructions": [
      "Brown ground turkey in a skillet with cumin, chili powder, and black beans.",
      "Stuff hollowed bell pepper halves with the savory turkey mixture.",
      "Top with a sprinkle of part-skim mozzarella.",
      "Bake at 375°F for 20 minutes until the pepper is tender and cheese is bubbling."
    ],
    "micros": {
      "fiberG": 7.8,
      "potassiumMg": 880,
      "magnesiumMg": 96,
      "ironMg": 3.9,
      "zincMg": 3.5,
      "calciumMg": 140,
      "vitaminB12Mcg": 1.1,
      "vitaminD_IU": 18,
      "omega3Mg": 220
    }
  },
  {
    "id": "sesame-ginger-chicken-lettuce-cups",
    "name": "Sesame Ginger Chicken Lettuce Cups",
    "subtitle": "Diced chicken breast with water chestnuts in crisp butterhead lettuce",
    "image": "/assets/food/chicken-lettuce-cups-1.0.webp",
    "calories": 420,
    "protein": 44,
    "carbs": 14,
    "fats": 16,
    "prepTimeMinutes": 15,
    "category": "Quick Fuel",
    "dietType": "omnivore",
    "tags": [
      "High Protein",
      "Low Carb",
      "Keto Clean",
      "Poultry",
      "Omnivore"
    ],
    "focusScore": "9.5/10",
    "description": "Crisp, refreshing hand-held cups providing 44g protein with negligible carbohydrates for zero afternoon brain slump.",
    "ingredients": [
      {
        "item": "Finely Minced Chicken Breast",
        "amount": "240g"
      },
      {
        "item": "Butterhead Lettuce Leaves",
        "amount": "4 large cups"
      },
      {
        "item": "Diced Water Chestnuts",
        "amount": "50g"
      },
      {
        "item": "Sliced Scallions & Ginger",
        "amount": "2 tbsp"
      },
      {
        "item": "Toasted Sesame Oil & Tamari",
        "amount": "1 tbsp"
      },
      {
        "item": "Toasted Sesame Seeds",
        "amount": "1 tsp"
      }
    ],
    "instructions": [
      "Heat sesame oil in wok, sear chicken with minced ginger and garlic for 4 minutes.",
      "Stir in water chestnuts, scallions, and tamari; toss for 2 minutes until glossy.",
      "Spoon savory chicken mixture into crisp washed lettuce cups.",
      "Garnish with toasted sesame seeds and chili flakes."
    ],
    "micros": {
      "fiberG": 3.2,
      "potassiumMg": 760,
      "magnesiumMg": 78,
      "ironMg": 2.8,
      "zincMg": 2.9,
      "calciumMg": 65,
      "vitaminB12Mcg": 0.8,
      "vitaminD_IU": 18,
      "omega3Mg": 210
    }
  },
  {
    "id": "chilean-sea-bass-spinach",
    "name": "Seared Chilean Sea Bass & Sautéed Greens",
    "subtitle": "Golden crust sea bass fillet with garlic wilted spinach and lemon butter",
    "image": "/assets/food/seared-sea-bass-1.0.webp",
    "calories": 490,
    "protein": 42,
    "carbs": 10,
    "fats": 26,
    "prepTimeMinutes": 18,
    "category": "Keto Clean",
    "dietType": "pescatarian",
    "tags": [
      "High Protein",
      "Keto Clean",
      "Seafood",
      "Pescatarian"
    ],
    "focusScore": "9.6/10",
    "description": "Melt-in-your-mouth white fish rich in healthy monounsaturated fats and omega-3s, paired with lutein and folate from fresh spinach.",
    "ingredients": [
      {
        "item": "Chilean Sea Bass Fillet",
        "amount": "220g"
      },
      {
        "item": "Baby Spinach",
        "amount": "150g"
      },
      {
        "item": "Clarified Butter (Ghee)",
        "amount": "1 tbsp"
      },
      {
        "item": "Garlic Cloves (sliced)",
        "amount": "3 cloves"
      },
      {
        "item": "Lemon Juice & Zest",
        "amount": "1 lemon"
      },
      {
        "item": "Flaky Maldon Sea Salt",
        "amount": "Pinch"
      }
    ],
    "instructions": [
      "Dry sea bass skin thoroughly with paper towels.",
      "Sear skin-down in foaming clarified butter for 5 minutes until crispy and golden.",
      "Flip gently and finish cooking on low heat for 3 minutes.",
      "In residual butter, flash-sauté garlic and spinach for 60 seconds.",
      "Plate fish atop greens, squeeze lemon, and finish with flaky sea salt."
    ],
    "micros": {
      "fiberG": 3.4,
      "potassiumMg": 820,
      "magnesiumMg": 115,
      "ironMg": 3.5,
      "zincMg": 2.2,
      "calciumMg": 135,
      "vitaminB12Mcg": 3.2,
      "vitaminD_IU": 240,
      "omega3Mg": 1650
    }
  },
  {
    "id": "truffle-tagliatelle-pasta",
    "name": "Truffle & Parmesan Tagliatelle",
    "subtitle": "Slow-digesting durum wheat with aged parmesan and truffle oil",
    "image": "/assets/food/pasta-1.0.webp",
    "calories": 610,
    "protein": 18,
    "carbs": 78,
    "fats": 19,
    "prepTimeMinutes": 18,
    "category": "Steady Carbs",
    "dietType": "vegetarian",
    "tags": [
      "Glycogen Reload",
      "Pre-Workout",
      "Vegetarian",
      "Complex Carbs"
    ],
    "focusScore": "8.4/10",
    "description": "Clean complex carbohydrates designed for pre-training glycogen storage and prolonged aerobic stamina. Balanced with aged parmesan for sustained release.",
    "ingredients": [
      {
        "item": "Artisanal Tagliatelle or Fettuccine",
        "amount": "110g dry"
      },
      {
        "item": "Grass-Fed Butter",
        "amount": "1.5 tbsp"
      },
      {
        "item": "24-Month Aged Parmigiano Reggiano",
        "amount": "35g freshly grated"
      },
      {
        "item": "White Truffle Infused Olive Oil",
        "amount": "1 tsp"
      },
      {
        "item": "Reserved Pasta Water",
        "amount": "60ml"
      },
      {
        "item": "Cracked Black Peppercorn",
        "amount": "1/2 tsp"
      }
    ],
    "instructions": [
      "Boil pasta in salted water for 8 minutes until strictly al dente.",
      "Melt grass-fed butter in a wide saucepan over low heat and crack black pepper.",
      "Transfer pasta directly to pan with 60ml reserved starchy cooking water.",
      "Remove from heat; vigorously emulsify with parmesan until a glossy, silk sauce forms.",
      "Drizzle truffle oil and finish with additional shaved parmigiano."
    ],
    "micros": {
      "fiberG": 4.8,
      "potassiumMg": 380,
      "magnesiumMg": 62,
      "ironMg": 2.6,
      "zincMg": 2.4,
      "calciumMg": 380,
      "vitaminB12Mcg": 0.9,
      "vitaminD_IU": 28,
      "omega3Mg": 140
    }
  },
  {
    "id": "cast-iron-skillet-eggs",
    "name": "Cast-Iron Skillet Eggs & Greens",
    "subtitle": "Three pasture eggs gently basted over garlic sautéed kale and avocado",
    "image": "/assets/food/skillet-eggs-1.0.webp",
    "calories": 420,
    "protein": 26,
    "carbs": 12,
    "fats": 28,
    "prepTimeMinutes": 12,
    "category": "High Protein",
    "dietType": "eggetarian",
    "tags": [
      "Choline Rich",
      "Keto Clean",
      "Bioavailable",
      "Eggetarian",
      "Eggs"
    ],
    "focusScore": "9.6/10",
    "description": "Whole pasture-raised eggs supply bioavailable dietary choline to support acetylcholine synthesis for deep, uninterrupted mental focus.",
    "ingredients": [
      {
        "item": "Pasture-Raised Eggs",
        "amount": "3 whole eggs"
      },
      {
        "item": "Lacinato Kale (ribs removed)",
        "amount": "120g"
      },
      {
        "item": "Ghee or Grass-Fed Butter",
        "amount": "1 tbsp"
      },
      {
        "item": "Hass Avocado",
        "amount": "1/2 sliced"
      },
      {
        "item": "Thinly Sliced Garlic",
        "amount": "2 cloves"
      },
      {
        "item": "Flaky Sea Salt & Chili Flakes",
        "amount": "To taste"
      }
    ],
    "instructions": [
      "Melt ghee in a 10-inch cast-iron skillet over medium heat, saute garlic for 30 seconds.",
      "Add chopped kale, season with sea salt, and saute for 3 minutes until tender.",
      "Create 3 small wells in the greens; crack eggs directly into each well.",
      "Cover skillet for 2.5 minutes until whites set while yolks stay warm and runny.",
      "Serve directly from the skillet topped with sliced avocado and red chili flakes."
    ],
    "micros": {
      "fiberG": 5.2,
      "potassiumMg": 740,
      "magnesiumMg": 92,
      "ironMg": 4.2,
      "zincMg": 3.1,
      "calciumMg": 195,
      "vitaminB12Mcg": 1.8,
      "vitaminD_IU": 180,
      "omega3Mg": 480
    }
  },
  {
    "id": "warm-ancient-grain-bowl",
    "name": "Warm Ancient Grain & Avocado Bowl",
    "subtitle": "Warm sprouted farro, golden quinoa, massaged kale, roasted almonds, and tahini",
    "image": "/assets/food/grain-bowl-1.0.webp",
    "calories": 540,
    "protein": 19,
    "carbs": 64,
    "fats": 22,
    "prepTimeMinutes": 15,
    "category": "Steady Carbs",
    "dietType": "vegan",
    "tags": [
      "Plant Protein",
      "Slow Carbs",
      "Vegan",
      "Complex Carbs"
    ],
    "focusScore": "8.8/10",
    "description": "Unrefined ancient grains provide sustained, gradual glucose release alongside magnesium and B-complex vitamins for nervous system calm.",
    "ingredients": [
      {
        "item": "Cooked Sprouted Farro & Quinoa Mix",
        "amount": "180g"
      },
      {
        "item": "Baby Kale (massaged in olive oil)",
        "amount": "80g"
      },
      {
        "item": "Toasted Almond Slivers",
        "amount": "25g"
      },
      {
        "item": "Hass Avocado",
        "amount": "1/2 diced"
      },
      {
        "item": "Raw Sesame Tahini Dressing",
        "amount": "2 tbsp"
      },
      {
        "item": "Pomegranate Arils",
        "amount": "2 tbsp"
      }
    ],
    "instructions": [
      "Warm cooked farro and quinoa in a saucepan with a tablespoon of water.",
      "Massage kale in a bowl with a pinch of salt until dark green and tender.",
      "Layer warm grains over kale; top with diced avocado and toasted almonds.",
      "Drizzle with lemon-tahini dressing and finish with fresh pomegranate arils."
    ],
    "micros": {
      "fiberG": 11.4,
      "potassiumMg": 820,
      "magnesiumMg": 145,
      "ironMg": 4.8,
      "zincMg": 3.4,
      "calciumMg": 160,
      "vitaminB12Mcg": 0,
      "vitaminD_IU": 0,
      "omega3Mg": 280
    }
  },
  {
    "id": "avocado-sourdough-toast",
    "name": "Poached Egg & Whipped Avocado Sourdough",
    "subtitle": "Fermented sourdough bread with ripe avocado, soft poached eggs, and seeds",
    "image": "/assets/food/avocado-toast-1.0.webp",
    "calories": 480,
    "protein": 24,
    "carbs": 46,
    "fats": 21,
    "prepTimeMinutes": 14,
    "category": "Quick Fuel",
    "dietType": "eggetarian",
    "tags": [
      "Brain Fats",
      "Choline Rich",
      "Eggetarian",
      "Fermented"
    ],
    "focusScore": "9.2/10",
    "description": "Slow-fermented artisan sourdough is gentle on digestion and blunts glycemic response. Paired with healthy monounsaturated fats from avocado.",
    "ingredients": [
      {
        "item": "Slow-Fermented Artisan Sourdough",
        "amount": "2 thick slices"
      },
      {
        "item": "Ripe Hass Avocado",
        "amount": "1 whole"
      },
      {
        "item": "Pasture-Raised Eggs",
        "amount": "2 poached"
      },
      {
        "item": "Pumpkin & Hemp Seeds",
        "amount": "1 tbsp each"
      },
      {
        "item": "Aleppo Pepper Flakes & Lemon",
        "amount": "Pinch"
      }
    ],
    "instructions": [
      "Toast sourdough slices in a pan with olive oil until golden and crisp.",
      "Mash avocado with lemon juice, sea salt, and black pepper.",
      "Poach eggs in simmering water with a drop of vinegar for 3 minutes.",
      "Spread avocado generously on sourdough, top with poached eggs, seeds, and chili flakes."
    ],
    "micros": {
      "fiberG": 8.5,
      "potassiumMg": 840,
      "magnesiumMg": 110,
      "ironMg": 3.8,
      "zincMg": 3.2,
      "calciumMg": 75,
      "vitaminB12Mcg": 1.2,
      "vitaminD_IU": 120,
      "omega3Mg": 410
    }
  },
  {
    "id": "tamago-sesame-rice-bowl",
    "name": "Tamago Sesame Soft Egg Rice Bowl",
    "subtitle": "Soy-marinated soft boiled eggs over warm short grain rice, furikake, and scallions",
    "image": "/assets/food/egg-rice-bowl-1.0.webp",
    "calories": 460,
    "protein": 22,
    "carbs": 58,
    "fats": 14,
    "prepTimeMinutes": 10,
    "category": "Quick Fuel",
    "dietType": "eggetarian",
    "tags": [
      "Fast Carbs",
      "Comfort Fuel",
      "Eggetarian",
      "Japanese"
    ],
    "focusScore": "8.8/10",
    "description": "Traditional Japanese egg-and-rice breakfast delivering fast, clean fuel for morning work without heavy digestive overhead.",
    "ingredients": [
      {
        "item": "Steamed Japanese Short-Grain Rice",
        "amount": "160g warm"
      },
      {
        "item": "Soy-Mirin Marinated Eggs (Ajitsuke Tamago)",
        "amount": "2 jammy eggs"
      },
      {
        "item": "Toasted Sesame Furikake & Nori",
        "amount": "1 tbsp"
      },
      {
        "item": "Sliced Scallions",
        "amount": "2 tbsp"
      },
      {
        "item": "Toasted Sesame Oil",
        "amount": "1 tsp"
      }
    ],
    "instructions": [
      "Spoon steaming rice into an earthenware bowl.",
      "Halve marinated jammy eggs and arrange over rice.",
      "Drizzle with toasted sesame oil and sprinkle with furikake and scallions."
    ],
    "micros": {
      "fiberG": 2.2,
      "potassiumMg": 420,
      "magnesiumMg": 52,
      "ironMg": 2.6,
      "zincMg": 2.1,
      "calciumMg": 65,
      "vitaminB12Mcg": 1.3,
      "vitaminD_IU": 110,
      "omega3Mg": 240
    }
  },
  {
    "id": "rajma-chawal-bowl",
    "name": "Slow-Simmered Rajma & Jeera Basmati",
    "subtitle": "Rich dark kidney beans slow cooked with whole spices, aged basmati, and pickled onions",
    "image": "/assets/food/rajma-chawal-1.0.webp",
    "calories": 520,
    "protein": 22,
    "carbs": 84,
    "fats": 8,
    "prepTimeMinutes": 25,
    "category": "Steady Carbs",
    "dietType": "vegan",
    "tags": [
      "High Fiber",
      "Indian",
      "Plant Protein",
      "Slow Carbs",
      "Vegan"
    ],
    "focusScore": "9.0/10",
    "description": "Slow-cooked kidney beans paired with basmati form a complete amino acid chain. Delivers 16g dietary prebiotic fiber for gut microbiome diversity.",
    "ingredients": [
      {
        "item": "Soaked & Pressure Cooked Red Kidney Beans (Rajma)",
        "amount": "200g cooked"
      },
      {
        "item": "Aged Basmati Rice cooked with Cumin Seeds",
        "amount": "150g"
      },
      {
        "item": "Onion, Tomato & Ginger Masala Gravy",
        "amount": "120g"
      },
      {
        "item": "Cold-Pressed Mustard or Ghee",
        "amount": "1 tsp"
      },
      {
        "item": "Pickled Red Onions & Lime",
        "amount": "2 tbsp"
      }
    ],
    "instructions": [
      "Simmer cooked kidney beans in roasted onion-tomato masala for 20 minutes until thick and gravy-rich.",
      "Mash a small ladle of beans against the pot wall to create rich natural body.",
      "Serve over fragrant cumin basmati rice with crunchy pickled onions."
    ],
    "micros": {
      "fiberG": 14.2,
      "potassiumMg": 960,
      "magnesiumMg": 125,
      "ironMg": 5.4,
      "zincMg": 3.1,
      "calciumMg": 95,
      "vitaminB12Mcg": 0,
      "vitaminD_IU": 0,
      "omega3Mg": 160
    }
  },
  {
    "id": "paneer-bhurji-tiffin",
    "name": "Tawa Paneer Bhurji & Crisp Bell Peppers",
    "subtitle": "Crumbled whole milk paneer scrambled with turmeric, green peas, and warm roti",
    "image": "/assets/food/paneer-bhurji-1.0.webp",
    "calories": 560,
    "protein": 34,
    "carbs": 36,
    "fats": 28,
    "prepTimeMinutes": 15,
    "category": "High Protein",
    "dietType": "vegetarian",
    "tags": [
      "High Protein",
      "Indian",
      "Calcium Rich",
      "Vegetarian",
      "Paneer"
    ],
    "focusScore": "9.4/10",
    "description": "Whole milk paneer provides high-density slow-release casein protein to feed lean muscle for hours, paired with fresh peppers and spices.",
    "ingredients": [
      {
        "item": "Fresh Artisanal Paneer (crumbled)",
        "amount": "220g"
      },
      {
        "item": "Whole Wheat Phulkas",
        "amount": "2 rotis"
      },
      {
        "item": "Green Bell Pepper & Green Peas",
        "amount": "80g"
      },
      {
        "item": "Diced Red Onions & Tomatoes",
        "amount": "100g"
      },
      {
        "item": "Ghee & Cumin Seeds",
        "amount": "1 tbsp"
      },
      {
        "item": "Turmeric, Garam Masala & Kasuri Methi",
        "amount": "1 tsp each"
      }
    ],
    "instructions": [
      "Heat ghee in a pan, crackle cumin seeds, and saute onions until golden.",
      "Add bell peppers, peas, and tomatoes; cook for 4 minutes.",
      "Toss in crumbled paneer, spices, and fresh cilantro; stir-fry gently for 3 minutes.",
      "Serve warm with fresh whole-wheat rotis."
    ],
    "micros": {
      "fiberG": 5.6,
      "potassiumMg": 680,
      "magnesiumMg": 84,
      "ironMg": 3.6,
      "zincMg": 3.4,
      "calciumMg": 560,
      "vitaminB12Mcg": 1.4,
      "vitaminD_IU": 45,
      "omega3Mg": 180
    }
  },
  {
    "id": "healing-moong-khichdi",
    "name": "Healing Moong Khichdi & Golden Ghee",
    "subtitle": "Split yellow moong dal and aged rice stewed with cumin, ginger, and a drizzle of ghee",
    "image": "/assets/food/moong-khichdi-1.0.webp",
    "calories": 440,
    "protein": 20,
    "carbs": 68,
    "fats": 9,
    "prepTimeMinutes": 20,
    "category": "Steady Carbs",
    "dietType": "vegetarian",
    "tags": [
      "Gut Reset",
      "Easy Digest",
      "Comfort Fuel",
      "Ayurvedic",
      "Vegetarian"
    ],
    "focusScore": "9.1/10",
    "description": "Ayurvedic gold-standard recovery meal. Zero gastrointestinal strain; ideal when cognitive energy needs to be directed to work rather than digestion.",
    "ingredients": [
      {
        "item": "Split Yellow Moong Dal & Rice (equal parts)",
        "amount": "140g dry"
      },
      {
        "item": "Grass-Fed Cow Ghee (A2)",
        "amount": "1 tbsp"
      },
      {
        "item": "Fresh Grated Ginger & Asafoetida (Hing)",
        "amount": "1 tbsp"
      },
      {
        "item": "Cumin Seeds & Black Peppercorns",
        "amount": "1 tsp"
      },
      {
        "item": "Turmeric & Rock Salt",
        "amount": "1 tsp"
      }
    ],
    "instructions": [
      "Rinse dal and rice together thoroughly.",
      "Pressure cook or pot-simmer with 4x water, ginger, turmeric, and salt until creamy and soft.",
      "In a small tadka pan, heat ghee, crackle cumin seeds and hing.",
      "Pour sizzling golden ghee over the hot khichdi and stir gently."
    ],
    "micros": {
      "fiberG": 7.2,
      "potassiumMg": 710,
      "magnesiumMg": 96,
      "ironMg": 3.9,
      "zincMg": 2.6,
      "calciumMg": 90,
      "vitaminB12Mcg": 0.3,
      "vitaminD_IU": 15,
      "omega3Mg": 120
    }
  },
  {
    "id": "dhabawala-egg-curry",
    "name": "Dhabawala Spiced Egg Curry & Basmati",
    "subtitle": "Pan-blistered hard boiled eggs simmered in a robust highway-style onion tomato gravy",
    "image": "/assets/food/egg-curry-1.0.webp",
    "calories": 490,
    "protein": 28,
    "carbs": 48,
    "fats": 19,
    "prepTimeMinutes": 22,
    "category": "High Protein",
    "dietType": "eggetarian",
    "tags": [
      "High Protein",
      "Indian",
      "Choline Rich",
      "Eggetarian",
      "Eggs"
    ],
    "focusScore": "9.3/10",
    "description": "Whole eggs provide the complete amino acid spectrum alongside carotenoids lutein and zeaxanthin for blue-light screen defense.",
    "ingredients": [
      {
        "item": "Hard-Boiled Pasture Eggs",
        "amount": "3 eggs"
      },
      {
        "item": "Steamed Basmati Rice",
        "amount": "130g"
      },
      {
        "item": "Slow-Browned Onion Tomato Masala",
        "amount": "120g"
      },
      {
        "item": "Mustard Oil",
        "amount": "1 tbsp"
      },
      {
        "item": "Turmeric, Cumin, Garam Masala",
        "amount": "1 tsp each"
      },
      {
        "item": "Coriander Leaves",
        "amount": "Handful"
      }
    ],
    "instructions": [
      "Score boiled eggs and fry in hot turmeric-oil for 2 minutes until blistered and golden.",
      "Add onion-tomato masala base and simmer with a splash of water for 8 minutes.",
      "Drop fried eggs into bubbling gravy and let flavors absorb for 4 minutes.",
      "Serve hot with steamed basmati rice and fresh coriander."
    ],
    "micros": {
      "fiberG": 4.1,
      "potassiumMg": 640,
      "magnesiumMg": 68,
      "ironMg": 3.8,
      "zincMg": 2.9,
      "calciumMg": 110,
      "vitaminB12Mcg": 1.9,
      "vitaminD_IU": 190,
      "omega3Mg": 360
    }
  },
  {
    "id": "soya-matar-pulao",
    "name": "High-Protein Soya Chunk & Matar Pulao",
    "subtitle": "Juicy spiced soya chunks with fragrant basmati, green peas, and whole spices",
    "image": "/assets/food/soya-pulao-1.0.webp",
    "calories": 510,
    "protein": 38,
    "carbs": 64,
    "fats": 10,
    "prepTimeMinutes": 20,
    "category": "High Protein",
    "dietType": "vegan",
    "tags": [
      "High Protein",
      "Vegan",
      "Indian",
      "Meal Prep Friendly"
    ],
    "focusScore": "9.3/10",
    "description": "De-fatted soya chunks deliver over 52g protein per 100g dry weight. One of the densest plant-based protein sources available on earth.",
    "ingredients": [
      {
        "item": "Textured Soya Chunks (rehydrated & squeezed)",
        "amount": "70g dry (160g rehydrated)"
      },
      {
        "item": "Aged Basmati Rice",
        "amount": "80g dry"
      },
      {
        "item": "Sweet Green Peas (Matar)",
        "amount": "60g"
      },
      {
        "item": "Whole Spices (Cardamom, Cloves, Bay Leaf)",
        "amount": "Standard tempering"
      },
      {
        "item": "Cold-Pressed Peanut Oil",
        "amount": "1 tbsp"
      },
      {
        "item": "Mint & Mint-Garlic Paste",
        "amount": "1 tbsp"
      }
    ],
    "instructions": [
      "Boil soya chunks in salted water for 5 minutes, rinse in cold water and squeeze dry.",
      "Saute whole spices and onions in oil until fragrant, add ginger-mint paste.",
      "Toss in soya chunks and green peas; fry for 3 minutes.",
      "Add soaked basmati rice and water; simmer covered for 12 minutes until fluffy."
    ],
    "micros": {
      "fiberG": 9.2,
      "potassiumMg": 920,
      "magnesiumMg": 140,
      "ironMg": 6.8,
      "zincMg": 3.8,
      "calciumMg": 180,
      "vitaminB12Mcg": 0,
      "vitaminD_IU": 0,
      "omega3Mg": 190
    }
  },
  {
    "id": "paneer-kathi-roll",
    "name": "Tawa Paneer Tikka Kathi Roll",
    "subtitle": "Charred spiced paneer cubes, crunchy peppers, and mint chutney wrapped in a flaky paratha",
    "image": "/assets/food/paneer-kathi-roll-1.0.webp",
    "calories": 520,
    "protein": 26,
    "carbs": 48,
    "fats": 22,
    "prepTimeMinutes": 16,
    "category": "Quick Fuel",
    "dietType": "vegetarian",
    "tags": [
      "High Protein",
      "Street Fuel",
      "Vegetarian",
      "Paneer"
    ],
    "focusScore": "9.0/10",
    "description": "High-protein portable wrap featuring grilled paneer cubes, crunchy bell peppers, and antioxidant-rich mint-coriander chutney.",
    "ingredients": [
      {
        "item": "Paneer Cubes (marinated & charred)",
        "amount": "160g"
      },
      {
        "item": "Whole-Wheat Paratha or Roti",
        "amount": "1 large"
      },
      {
        "item": "Julienned Onions & Bell Peppers",
        "amount": "60g"
      },
      {
        "item": "Mint Coriander Green Chutney",
        "amount": "2 tbsp"
      },
      {
        "item": "Chaat Masala & Lemon Juice",
        "amount": "Pinch"
      }
    ],
    "instructions": [
      "Sear spiced paneer cubes and peppers on high heat on a cast-iron tawa.",
      "Warm the whole-wheat paratha on the tawa until crisp and pliable.",
      "Spread mint chutney down the center of the paratha.",
      "Lay charred paneer and peppers, dust with chaat masala, roll tightly and slice."
    ],
    "micros": {
      "fiberG": 4.8,
      "potassiumMg": 560,
      "magnesiumMg": 72,
      "ironMg": 3.2,
      "zincMg": 2.8,
      "calciumMg": 480,
      "vitaminB12Mcg": 1.1,
      "vitaminD_IU": 35,
      "omega3Mg": 160
    }
  },
  {
    "id": "garlic-chili-egg-fried-rice",
    "name": "Street-Style Garlic Chili Egg Fried Rice",
    "subtitle": "Wok-tossed chilled rice with scrambled eggs, scallions, and toasted sesame oil",
    "image": "/assets/food/egg-fried-rice-1.0.webp",
    "calories": 520,
    "protein": 26,
    "carbs": 65,
    "fats": 16,
    "prepTimeMinutes": 12,
    "category": "Quick Fuel",
    "dietType": "eggetarian",
    "tags": [
      "Quick Energy",
      "Post Workout",
      "Eggetarian",
      "Eggs"
    ],
    "focusScore": "8.9/10",
    "description": "Chilled cooked rice forms resistant starch, lowering insulin spikes. Wok-scrambled pasture eggs provide quick-absorbing amino acids.",
    "ingredients": [
      {
        "item": "Day-Old Chilled Jasmine or Sona Masoori Rice",
        "amount": "180g"
      },
      {
        "item": "Pasture-Raised Eggs",
        "amount": "3 eggs"
      },
      {
        "item": "Minced Garlic & Green Chilies",
        "amount": "2 tbsp"
      },
      {
        "item": "Sliced Spring Onions",
        "amount": "3 stalks"
      },
      {
        "item": "Tamari & Sesame Oil",
        "amount": "1 tbsp each"
      }
    ],
    "instructions": [
      "Scramble eggs in smoking-hot wok with oil until 80% set, remove to plate.",
      "Add garlic and green chilies; flash-fry for 20 seconds.",
      "Toss in chilled rice, breaking clumps over high heat.",
      "Return scrambled eggs, drizzle tamari and sesame oil, and finish with scallions."
    ],
    "micros": {
      "fiberG": 2.4,
      "potassiumMg": 460,
      "magnesiumMg": 58,
      "ironMg": 3.1,
      "zincMg": 2.4,
      "calciumMg": 85,
      "vitaminB12Mcg": 1.8,
      "vitaminD_IU": 160,
      "omega3Mg": 340
    }
  },
  {
    "id": "tempered-curd-rice",
    "name": "South Indian Tempered Curd Rice & Roasted Cashews",
    "subtitle": "Creamy probiotic yogurt rice with mustard seeds, curry leaves, ginger, and cashews",
    "image": "/assets/food/curd-rice-1.0.webp",
    "calories": 460,
    "protein": 18,
    "carbs": 62,
    "fats": 14,
    "prepTimeMinutes": 10,
    "category": "Quick Fuel",
    "dietType": "vegetarian",
    "tags": [
      "Probiotic Gut Health",
      "South Indian",
      "Cooling Fuel",
      "Vegetarian"
    ],
    "focusScore": "9.2/10",
    "description": "Living lactobacillus cultures replenish the intestinal barrier, blunting exercise-induced inflammation and calming systemic cortisol.",
    "ingredients": [
      {
        "item": "Soft-Cooked Rice (mashed)",
        "amount": "160g"
      },
      {
        "item": "Fresh Artisanal Yogurt (Curd)",
        "amount": "180g"
      },
      {
        "item": "Mustard Seeds, Urad Dal, Curry Leaves",
        "amount": "Tadka mix"
      },
      {
        "item": "Roasted Cashew Nuts",
        "amount": "15g"
      },
      {
        "item": "Finely Minced Ginger & Green Chili",
        "amount": "1 tsp"
      },
      {
        "item": "Pomegranate Seeds",
        "amount": "1 tbsp"
      }
    ],
    "instructions": [
      "Mash soft warm rice with fresh curd, a splash of milk, and sea salt.",
      "In a tadka ladle, heat oil, crackle mustard seeds, urad dal, curry leaves, and cashews.",
      "Pour fragrant tempering over the curd rice and mix gently.",
      "Garnish with pomegranate seeds and grated ginger."
    ],
    "micros": {
      "fiberG": 2.6,
      "potassiumMg": 580,
      "magnesiumMg": 78,
      "ironMg": 2.2,
      "zincMg": 2.5,
      "calciumMg": 320,
      "vitaminB12Mcg": 1.1,
      "vitaminD_IU": 25,
      "omega3Mg": 110
    }
  },
  {
    "id": "savory-masala-oats",
    "name": "Savory Masala Oats with Soft Jammy Egg",
    "subtitle": "Rolled oats cooked with turmeric, carrots, peas, and a soft-boiled egg",
    "image": "/assets/food/masala-oats-1.0.webp",
    "calories": 420,
    "protein": 22,
    "carbs": 52,
    "fats": 14,
    "prepTimeMinutes": 12,
    "category": "Steady Carbs",
    "dietType": "eggetarian",
    "tags": [
      "Beta Glucan",
      "High Fiber",
      "Eggetarian",
      "Morning Fuel"
    ],
    "focusScore": "9.1/10",
    "description": "Oat beta-glucan soluble fiber stabilizes post-meal glucose and sustains energy for up to 4 hours, complemented by whole-egg protein.",
    "ingredients": [
      {
        "item": "Whole Rolled Oats",
        "amount": "70g dry"
      },
      {
        "item": "Pasture-Raised Egg",
        "amount": "1 soft-boiled"
      },
      {
        "item": "Finely Chopped Carrots, Peas, Beans",
        "amount": "80g"
      },
      {
        "item": "Turmeric, Cumin, Garam Masala",
        "amount": "1 tsp each"
      },
      {
        "item": "Ghee",
        "amount": "1 tsp"
      },
      {
        "item": "Fresh Lemon & Coriander",
        "amount": "To taste"
      }
    ],
    "instructions": [
      "Heat ghee in a pot, saute cumin seeds and vegetables for 3 minutes.",
      "Add rolled oats, turmeric, and 250ml water; simmer for 5 minutes until creamy.",
      "Pour savory oats into bowl, top with a halved 6-minute jammy egg and cilantro."
    ],
    "micros": {
      "fiberG": 7.8,
      "potassiumMg": 610,
      "magnesiumMg": 92,
      "ironMg": 3.8,
      "zincMg": 2.7,
      "calciumMg": 95,
      "vitaminB12Mcg": 0.8,
      "vitaminD_IU": 65,
      "omega3Mg": 280
    }
  },
  {
    "id": "besan-paneer-chilla",
    "name": "Crispy Besan Chilla with Spiced Paneer",
    "subtitle": "Spiced chickpea flour crepes stuffed with grated paneer, onions, and green chutney",
    "image": "/assets/food/besan-chilla-1.0.webp",
    "calories": 470,
    "protein": 28,
    "carbs": 38,
    "fats": 22,
    "prepTimeMinutes": 15,
    "category": "High Protein",
    "dietType": "vegetarian",
    "tags": [
      "High Protein",
      "Gluten-Free",
      "Indian",
      "Vegetarian"
    ],
    "focusScore": "9.3/10",
    "description": "Chickpea flour (besan) is naturally gluten-free and low-glycemic. Grated paneer stuffing elevates the complete protein payload to 28g.",
    "ingredients": [
      {
        "item": "Gram Flour (Besan)",
        "amount": "70g"
      },
      {
        "item": "Grated Fresh Paneer",
        "amount": "120g"
      },
      {
        "item": "Ajwain (Carom Seeds)",
        "amount": "1/2 tsp"
      },
      {
        "item": "Finely Chopped Onions & Chilies",
        "amount": "40g"
      },
      {
        "item": "Cold-Pressed Mustard Oil or Ghee",
        "amount": "1 tbsp"
      },
      {
        "item": "Mint Coriander Chutney",
        "amount": "2 tbsp"
      }
    ],
    "instructions": [
      "Whisk besan with water, ajwain, turmeric, and sea salt into smooth pouring batter.",
      "Pour ladleful onto hot skillet, spreading in circular motion into a thin crepe.",
      "Drizzle ghee along edges; once golden and crisp, sprinkle grated paneer and onions on top.",
      "Fold chilla and serve crisp with spicy green chutney."
    ],
    "micros": {
      "fiberG": 6.8,
      "potassiumMg": 690,
      "magnesiumMg": 98,
      "ironMg": 3.9,
      "zincMg": 3,
      "calciumMg": 420,
      "vitaminB12Mcg": 0.9,
      "vitaminD_IU": 28,
      "omega3Mg": 150
    }
  },
  {
    "id": "kala-chana-sundal",
    "name": "Warm Kala Chana Sundal & Fresh Coconut Bowl",
    "subtitle": "Protein-packed black chickpeas tempered with mustard, curry leaves, and grated coconut",
    "image": "/assets/food/kala-chana-1.0.webp",
    "calories": 430,
    "protein": 22,
    "carbs": 58,
    "fats": 11,
    "prepTimeMinutes": 12,
    "category": "Steady Carbs",
    "dietType": "vegan",
    "tags": [
      "Ancient Grains",
      "High Fiber",
      "Vegan",
      "South Indian"
    ],
    "focusScore": "9.2/10",
    "description": "Desi black chickpeas are exceptionally rich in resistant starch and iron. Fresh grated coconut provides healthy fats for sustained cellular energy.",
    "ingredients": [
      {
        "item": "Boiled Black Chickpeas (Kala Chana)",
        "amount": "220g"
      },
      {
        "item": "Freshly Grated Coconut",
        "amount": "3 tbsp"
      },
      {
        "item": "Mustard Seeds, Urad Dal, Curry Leaves",
        "amount": "Tempering mix"
      },
      {
        "item": "Asafoetida & Dry Red Chili",
        "amount": "Pinch"
      },
      {
        "item": "Coconut Oil",
        "amount": "1 tbsp"
      },
      {
        "item": "Lemon Juice & Rock Salt",
        "amount": "To taste"
      }
    ],
    "instructions": [
      "Heat coconut oil, splutter mustard seeds, urad dal, curry leaves, and red chilies.",
      "Add boiled black chickpeas and rock salt; toss on medium-high heat for 3 minutes.",
      "Turn off heat, fold in freshly grated coconut and fresh lemon juice."
    ],
    "micros": {
      "fiberG": 13.5,
      "potassiumMg": 820,
      "magnesiumMg": 115,
      "ironMg": 5.8,
      "zincMg": 2.9,
      "calciumMg": 110,
      "vitaminB12Mcg": 0,
      "vitaminD_IU": 0,
      "omega3Mg": 130
    }
  },
  {
    "id": "peanut-butter-banana-oats",
    "name": "Creamy Peanut Butter & Banana Power Oatmeal",
    "subtitle": "Warm oats cooked in almond milk with natural peanut butter, banana slices, and chia seeds",
    "image": "/assets/food/peanut-butter-oats-1.0.webp",
    "calories": 520,
    "protein": 20,
    "carbs": 68,
    "fats": 18,
    "prepTimeMinutes": 8,
    "category": "Steady Carbs",
    "dietType": "vegetarian",
    "tags": [
      "High Fiber",
      "Clean Energy",
      "Vegetarian",
      "Quick Fuel"
    ],
    "focusScore": "9.0/10",
    "description": "Classic high-satiety breakfast pairing soluble oat fiber with potassium-dense banana and monounsaturated healthy fats from peanut butter.",
    "ingredients": [
      {
        "item": "Rolled Whole Oats",
        "amount": "80g"
      },
      {
        "item": "Pure 100% Roasted Peanut Butter",
        "amount": "2 tbsp"
      },
      {
        "item": "Ripe Banana (sliced)",
        "amount": "1 medium"
      },
      {
        "item": "Black Chia Seeds",
        "amount": "1 tbsp"
      },
      {
        "item": "Unsweetened Almond Milk",
        "amount": "220ml"
      },
      {
        "item": "Ground Ceylon Cinnamon",
        "amount": "1/2 tsp"
      }
    ],
    "instructions": [
      "Simmer oats in almond milk with cinnamon for 5 minutes until thick and creamy.",
      "Transfer to a bowl, swirl in creamy peanut butter.",
      "Top with banana slices and chia seeds."
    ],
    "micros": {
      "fiberG": 9.6,
      "potassiumMg": 780,
      "magnesiumMg": 135,
      "ironMg": 3.4,
      "zincMg": 2.8,
      "calciumMg": 180,
      "vitaminB12Mcg": 0,
      "vitaminD_IU": 40,
      "omega3Mg": 1800
    }
  },
  {
    "id": "masala-french-toast",
    "name": "Mumbai Street Masala Egg French Toast",
    "subtitle": "Sourdough soaked in spiced beaten eggs with onions, tomatoes, green chilies, and cilantro",
    "image": "/assets/food/masala-french-toast-1.0.webp",
    "calories": 460,
    "protein": 25,
    "carbs": 46,
    "fats": 18,
    "prepTimeMinutes": 12,
    "category": "Quick Fuel",
    "dietType": "eggetarian",
    "tags": [
      "High Protein",
      "Indian",
      "Eggetarian",
      "Eggs"
    ],
    "focusScore": "9.1/10",
    "description": "Mumbai street food reinvented with artisan sourdough and pasture eggs. Delivers quick morning choline and sustained energy.",
    "ingredients": [
      {
        "item": "Artisanal Sourdough Bread",
        "amount": "2 thick slices"
      },
      {
        "item": "Pasture-Raised Eggs",
        "amount": "3 eggs"
      },
      {
        "item": "Finely Minced Onions & Tomatoes",
        "amount": "3 tbsp"
      },
      {
        "item": "Green Chilies & Fresh Cilantro",
        "amount": "1 tbsp"
      },
      {
        "item": "Turmeric, Chaat Masala & Salt",
        "amount": "Pinch each"
      },
      {
        "item": "Ghee or Grass-Fed Butter",
        "amount": "1 tbsp"
      }
    ],
    "instructions": [
      "Whisk eggs vigorously with minced vegetables, turmeric, chaat masala, and cilantro.",
      "Dip sourdough slices into spiced egg mixture until soaked.",
      "Melt ghee in skillet; toast bread for 3 minutes per side until golden and fluffy.",
      "Serve warm with homemade green mint chutney."
    ],
    "micros": {
      "fiberG": 4.2,
      "potassiumMg": 520,
      "magnesiumMg": 68,
      "ironMg": 3.6,
      "zincMg": 2.6,
      "calciumMg": 95,
      "vitaminB12Mcg": 1.7,
      "vitaminD_IU": 155,
      "omega3Mg": 320
    }
  },
  {
    "id": "mediterranean-chickpea-salad",
    "name": "Mediterranean Chickpea & Feta Crisp Salad",
    "subtitle": "Chickpeas, diced cucumbers, kalamata olives, cherry tomatoes, and sheep feta",
    "image": "/assets/food/chickpea-salad-1.0.webp",
    "calories": 460,
    "protein": 21,
    "carbs": 52,
    "fats": 18,
    "prepTimeMinutes": 10,
    "category": "Steady Carbs",
    "dietType": "vegetarian",
    "tags": [
      "No Cook",
      "Gut Health",
      "Vegetarian",
      "Mediterranean"
    ],
    "focusScore": "9.2/10",
    "description": "Zero-cooking high-fiber power bowl. Delivers prebiotic fiber from chickpeas and polyphenols from extra virgin olive oil.",
    "ingredients": [
      {
        "item": "Cooked Chickpeas (Kabuli Chana)",
        "amount": "220g"
      },
      {
        "item": "Authentic Greek Sheep Milk Feta",
        "amount": "40g crumbled"
      },
      {
        "item": "Persian Cucumbers & Cherry Tomatoes",
        "amount": "120g"
      },
      {
        "item": "Kalamata Olives (halved)",
        "amount": "8 olives"
      },
      {
        "item": "Cold-Pressed Extra Virgin Olive Oil",
        "amount": "1.5 tbsp"
      },
      {
        "item": "Fresh Oregano & Lemon Juice",
        "amount": "1 tbsp"
      }
    ],
    "instructions": [
      "Combine rinsed chickpeas, diced cucumbers, tomatoes, and kalamata olives in a bowl.",
      "Whisk olive oil, lemon juice, dried oregano, and sea salt in a small cup.",
      "Pour dressing over chickpeas, toss well, and top with crumbled feta."
    ],
    "micros": {
      "fiberG": 10.8,
      "potassiumMg": 780,
      "magnesiumMg": 110,
      "ironMg": 4.2,
      "zincMg": 2.9,
      "calciumMg": 260,
      "vitaminB12Mcg": 0.6,
      "vitaminD_IU": 18,
      "omega3Mg": 240
    }
  },
  {
    "id": "mediterranean-hummus-platter",
    "name": "Loaded Mediterranean Hummus & Spiced Chana Plate",
    "subtitle": "Creamy velvet tahini hummus topped with warm cumin-roasted chickpeas, olive oil, and warm pita",
    "image": "/assets/food/mediterranean-hummus-1.0.webp",
    "calories": 530,
    "protein": 20,
    "carbs": 64,
    "fats": 22,
    "prepTimeMinutes": 12,
    "category": "Steady Carbs",
    "dietType": "vegan",
    "tags": [
      "Plant Protein",
      "Prebiotic Fiber",
      "Vegan",
      "Mediterranean"
    ],
    "focusScore": "9.1/10",
    "description": "Sesame tahini provides calcium, copper, and sesamin lignans, while warm roasted chickpeas supply long-chain prebiotic fiber.",
    "ingredients": [
      {
        "item": "Creamy Velvet Hummus (Chickpeas & Tahini)",
        "amount": "160g"
      },
      {
        "item": "Warm Cumin-Roasted Chickpeas",
        "amount": "80g"
      },
      {
        "item": "Whole-Wheat Greek Pita",
        "amount": "1 large flatbread"
      },
      {
        "item": "Extra Virgin Olive Oil & Zaatar",
        "amount": "1 tbsp"
      },
      {
        "item": "Cucumber Ribbons & Cherry Tomatoes",
        "amount": "80g"
      }
    ],
    "instructions": [
      "Swirl smooth hummus onto a wide earthenware plate creating a well.",
      "Spoon warm cumin-roasted chickpeas into the center.",
      "Drizzle generously with extra virgin olive oil and dust with zaatar spice.",
      "Serve alongside warm sliced pita and crunchy cucumber ribbons."
    ],
    "micros": {
      "fiberG": 12.2,
      "potassiumMg": 790,
      "magnesiumMg": 128,
      "ironMg": 4.6,
      "zincMg": 3.2,
      "calciumMg": 190,
      "vitaminB12Mcg": 0,
      "vitaminD_IU": 0,
      "omega3Mg": 210
    }
  },
  {
    "id": "japanese-sesame-tofu-stirfry",
    "name": "Crispy Sesame-Glazed Tofu & Broccoli Rice Bowl",
    "subtitle": "Extra-firm pressed tofu seared in tamari sesame glaze with tender broccoli florets and brown rice",
    "image": "/assets/food/sesame-tofu-1.0.webp",
    "calories": 490,
    "protein": 30,
    "carbs": 52,
    "fats": 18,
    "prepTimeMinutes": 18,
    "category": "High Protein",
    "dietType": "vegan",
    "tags": [
      "High Protein",
      "Plant Protein",
      "Vegan",
      "Clean Fuel"
    ],
    "focusScore": "9.3/10",
    "description": "Non-GMO pressed tofu delivers complete plant protein and calcium. Paired with sulforaphane-rich steamed broccoli.",
    "ingredients": [
      {
        "item": "Extra-Firm Organic Tofu (pressed & cubed)",
        "amount": "220g"
      },
      {
        "item": "Fresh Broccoli Florets",
        "amount": "140g"
      },
      {
        "item": "Steamed Short-Grain Brown Rice",
        "amount": "130g"
      },
      {
        "item": "Tamari, Mirin & Ginger Reduction",
        "amount": "2 tbsp"
      },
      {
        "item": "Toasted Sesame Oil & White Seeds",
        "amount": "1 tbsp"
      }
    ],
    "instructions": [
      "Pan-sear pressed tofu cubes in sesame oil on high heat until crispy and golden on all sides.",
      "Steam broccoli florets for 3 minutes until vibrant emerald green and crisp-tender.",
      "Toss tofu and broccoli in savory tamari-ginger glaze until glossy.",
      "Serve over warm brown rice, finished with toasted sesame seeds."
    ],
    "micros": {
      "fiberG": 7.4,
      "potassiumMg": 820,
      "magnesiumMg": 135,
      "ironMg": 5.2,
      "zincMg": 3.1,
      "calciumMg": 410,
      "vitaminB12Mcg": 0,
      "vitaminD_IU": 0,
      "omega3Mg": 380
    }
  },
  {
    "id": "mexican-chipotle-black-bean-bowl",
    "name": "Fiesta Black Bean & Sweet Corn Burrito Bowl",
    "subtitle": "Seasoned black beans, golden sweet corn, brown rice, fresh guacamole, and cilantro lime salsa",
    "image": "/assets/food/mexican-black-bean-1.0.webp",
    "calories": 510,
    "protein": 21,
    "carbs": 76,
    "fats": 15,
    "prepTimeMinutes": 15,
    "category": "Steady Carbs",
    "dietType": "vegan",
    "tags": [
      "Fiber Dense",
      "Mexican",
      "Vegan",
      "Slow Carbs"
    ],
    "focusScore": "9.0/10",
    "description": "Dense dietary fiber from black beans and whole brown rice feeds butyrate-producing gut microbes, promoting steady mental stamina.",
    "ingredients": [
      {
        "item": "Slow-Simmered Black Beans",
        "amount": "180g"
      },
      {
        "item": "Fire-Roasted Sweet Corn",
        "amount": "80g"
      },
      {
        "item": "Steamed Brown Rice with Cilantro",
        "amount": "140g"
      },
      {
        "item": "Fresh Guacamole (Hass Avocado & Lime)",
        "amount": "3 tbsp"
      },
      {
        "item": "Pico de Gallo & Shredded Romaine",
        "amount": "80g"
      }
    ],
    "instructions": [
      "Warm black beans with cumin, chili powder, and sea salt.",
      "Spoon brown rice into a bowl as the base.",
      "Arrange black beans, sweet corn, fresh pico de gallo, and crisp romaine.",
      "Top with a generous scoop of guacamole and a lime wedge."
    ],
    "micros": {
      "fiberG": 13.8,
      "potassiumMg": 910,
      "magnesiumMg": 140,
      "ironMg": 4.8,
      "zincMg": 2.8,
      "calciumMg": 85,
      "vitaminB12Mcg": 0,
      "vitaminD_IU": 0,
      "omega3Mg": 290
    }
  },
  {
    "id": "moroccan-spiced-lentil-tagine",
    "name": "Moroccan Spiced Red Lentil & Chickpea Tagine",
    "subtitle": "Red lentils and chickpeas slow-simmered with cumin, cinnamon, apricots, and fluffy couscous",
    "image": "/assets/food/moroccan-lentil-1.0.webp",
    "calories": 520,
    "protein": 24,
    "carbs": 82,
    "fats": 10,
    "prepTimeMinutes": 25,
    "category": "Steady Carbs",
    "dietType": "vegan",
    "tags": [
      "Iron Rich",
      "Vegan",
      "Mediterranean",
      "Slow Carbs"
    ],
    "focusScore": "9.1/10",
    "description": "Polyphenol-dense warming spices (cinnamon, ginger, coriander) improve insulin sensitivity while red lentils provide bioavailable non-heme iron.",
    "ingredients": [
      {
        "item": "Red Lentils & Cooked Chickpeas",
        "amount": "180g combined"
      },
      {
        "item": "Whole-Wheat Steamed Couscous",
        "amount": "140g"
      },
      {
        "item": "Moroccan Spice Blend (Cinnamon, Cumin, Turmeric)",
        "amount": "1 tbsp"
      },
      {
        "item": "Diced Dried Apricots",
        "amount": "20g"
      },
      {
        "item": "Extra Virgin Olive Oil",
        "amount": "1 tbsp"
      },
      {
        "item": "Fresh Mint & Toasted Almonds",
        "amount": "Handful"
      }
    ],
    "instructions": [
      "Saute onions and Moroccan spices in olive oil until aromatic.",
      "Add red lentils, chickpeas, diced apricots, and vegetable broth; simmer for 18 minutes.",
      "Steam couscous in boiling water with a pinch of salt for 5 minutes, then fluff with a fork.",
      "Ladle aromatic lentil stew over couscous, garnish with toasted almonds and fresh mint."
    ],
    "micros": {
      "fiberG": 14.5,
      "potassiumMg": 890,
      "magnesiumMg": 130,
      "ironMg": 5.6,
      "zincMg": 3.2,
      "calciumMg": 95,
      "vitaminB12Mcg": 0,
      "vitaminD_IU": 0,
      "omega3Mg": 170
    }
  },
  {
    "id": "thai-peanut-sesame-noodles",
    "name": "Thai Spicy Peanut & Sesame Noodle Bowl",
    "subtitle": "Buckwheat soba noodles in creamy ginger peanut sauce with crisp edamame and red peppers",
    "image": "/assets/food/thai-peanut-noodles-1.0.webp",
    "calories": 540,
    "protein": 23,
    "carbs": 68,
    "fats": 20,
    "prepTimeMinutes": 14,
    "category": "Steady Carbs",
    "dietType": "vegan",
    "tags": [
      "Plant Protein",
      "Buckwheat Soba",
      "Vegan",
      "Quick Fuel"
    ],
    "focusScore": "8.9/10",
    "description": "Pure 100% buckwheat soba noodles deliver rutin, a potent bioflavonoid supporting vascular health, tossed in nutrient-dense natural peanut sauce.",
    "ingredients": [
      {
        "item": "Buckwheat Soba Noodles",
        "amount": "90g dry"
      },
      {
        "item": "Creamy Peanut Butter & Tamari Sauce",
        "amount": "2.5 tbsp"
      },
      {
        "item": "Shelled Edamame Beans",
        "amount": "60g"
      },
      {
        "item": "Red Bell Pepper & Cucumber Matchsticks",
        "amount": "80g"
      },
      {
        "item": "Lime Juice & Sriracha",
        "amount": "1 tbsp"
      },
      {
        "item": "Toasted Crushed Peanuts & Scallions",
        "amount": "2 tbsp"
      }
    ],
    "instructions": [
      "Boil soba noodles for 4.5 minutes, rinse immediately under icy cold water to remove starch.",
      "Whisk peanut butter, warm water, tamari, lime juice, ginger, and sriracha into a smooth sauce.",
      "Toss cold soba noodles with peanut sauce, edamame, and crunchy peppers.",
      "Garnish with crushed peanuts and scallions."
    ],
    "micros": {
      "fiberG": 8.4,
      "potassiumMg": 780,
      "magnesiumMg": 140,
      "ironMg": 4.2,
      "zincMg": 3.1,
      "calciumMg": 80,
      "vitaminB12Mcg": 0,
      "vitaminD_IU": 0,
      "omega3Mg": 310
    }
  },
  {
    "id": "glazed-tempeh-edamame-bowl",
    "name": "Glazed Tempeh & Edamame Power Bowl",
    "subtitle": "Marinated seared tempeh strips, steamed edamame, purple cabbage, and nutty brown rice",
    "image": "/assets/food/edamame-tempeh-bowl-1.0.webp",
    "calories": 530,
    "protein": 34,
    "carbs": 56,
    "fats": 18,
    "prepTimeMinutes": 18,
    "category": "High Protein",
    "dietType": "vegan",
    "tags": [
      "High Protein",
      "Fermented Plant",
      "Vegan",
      "Clean Fuel"
    ],
    "focusScore": "9.4/10",
    "description": "Fermented organic tempeh is exceptionally gentle on digestion while providing complete plant amino acids, paired with folate-dense edamame and purple anthocyanins.",
    "ingredients": [
      {
        "item": "Organic Whole Bean Tempeh (sliced)",
        "amount": "180g"
      },
      {
        "item": "Shelled Edamame Beans",
        "amount": "80g"
      },
      {
        "item": "Steamed Short-Grain Brown Rice",
        "amount": "130g"
      },
      {
        "item": "Shredded Purple Cabbage",
        "amount": "70g"
      },
      {
        "item": "Ripe Avocado Slices",
        "amount": "1/4 avocado"
      },
      {
        "item": "Tamari Maple Sesame Glaze",
        "amount": "2 tbsp"
      }
    ],
    "instructions": [
      "Steam tempeh slices for 5 minutes, then pan-sear in sesame oil until golden on both sides.",
      "Brush with tamari-maple glaze and let caramelize for 1 minute.",
      "Assemble warm bowl with brown rice base, glazed tempeh strips, and steamed edamame.",
      "Add crisp purple cabbage, avocado slices, and sprinkle with sesame seeds."
    ],
    "micros": {
      "fiberG": 11.2,
      "potassiumMg": 920,
      "magnesiumMg": 155,
      "ironMg": 5.4,
      "zincMg": 3.8,
      "calciumMg": 210,
      "vitaminB12Mcg": 0,
      "vitaminD_IU": 0,
      "omega3Mg": 450
    }
  }
];

export function findClosestRecipe(customDish: Partial<Recipe>): { recipe: Recipe; spriteUrl: string; score: number } {
  let bestRecipe = RECIPES[0];
  let bestScore = -999;

  const normName = (customDish.name || '').toLowerCase();
  const normDesc = (customDish.description || '').toLowerCase();
  const normCat = (customDish.category || '').toLowerCase();
  const normDiet = (customDish.dietType || '').toLowerCase();

  const allText = (normName + ' ' + normDesc).toLowerCase();

  const keyAnchorMap = [
    { keys: ['egg', 'shakshuka', 'omelette', 'bhurji', 'french toast', 'tamago'], ids: ['cast-iron-skillet-eggs', 'dhabawala-egg-curry', 'tamago-sesame-rice-bowl', 'masala-french-toast', 'garlic-chili-egg-fried-rice'] },
    { keys: ['paneer', 'cottage cheese'], ids: ['paneer-bhurji-tiffin', 'besan-paneer-chilla', 'paneer-kathi-roll'] },
    { keys: ['tofu', 'tempeh'], ids: ['japanese-sesame-tofu-stirfry', 'glazed-tempeh-edamame-bowl'] },
    { keys: ['prawn', 'shrimp'], ids: ['garlic-prawn-linguine', 'thai-red-coconut-curry-prawns', 'cilantro-garlic-shrimp', 'coconut-lime-poached-prawns'] },
    { keys: ['salmon', 'tuna', 'fish', 'cod', 'tilapia', 'sea bass'], ids: ['greek-lemon-herb-salmon', 'moroccan-chermoula-fish-fillet', 'lemon-garlic-cod', 'blackened-cajun-salmon', 'seared-tuna-nicoise', 'cantonese-ginger-tilapia', 'chilean-sea-bass-spinach'] },
    { keys: ['oat', 'oatmeal'], ids: ['savory-masala-oats', 'peanut-butter-banana-oats'] },
    { keys: ['khichdi', 'lentil', 'dal', 'dhal'], ids: ['healing-moong-khichdi', 'moroccan-spiced-lentil-tagine'] },
    { keys: ['chana', 'chickpea', 'hummus'], ids: ['kala-chana-sundal', 'mediterranean-chickpea-salad', 'mediterranean-hummus-platter'] },
    { keys: ['black bean', 'burrito', 'fajita', 'taco', 'mexican'], ids: ['mexican-chipotle-black-bean-bowl', 'sizzling-chicken-fajita-platter', 'smoked-citrus-taco-bowl', 'spiced-turkey-stuffed-pepper'] },
    { keys: ['soya', 'soy chunk', 'nutrela'], ids: ['soya-matar-pulao'] },
    { keys: ['avocado', 'sourdough', 'toast'], ids: ['avocado-sourdough-toast'] },
    { keys: ['curd rice', 'dahi rice'], ids: ['tempered-curd-rice'] },
    { keys: ['rajma', 'kidney bean'], ids: ['rajma-chawal-bowl'] },
    { keys: ['chicken', 'turkey', 'poultry'], ids: ['herb-grilled-chicken', 'homestyle-tariwala-chicken', 'sizzling-chicken-fajita-platter', 'tawa-chicken-tikka', 'japanese-teriyaki-chicken-donburi', 'greek-lemon-chicken-souvlaki', 'rosemary-turkey-skillet', 'honey-dijon-chicken-thigh', 'smoked-paprika-chicken-skewers', 'spiced-turkey-stuffed-pepper', 'sesame-ginger-chicken-lettuce-cups'] }
  ];

  for (const recipe of RECIPES) {
    let score = 0;

    if (normDiet === 'vegan' && recipe.dietType !== 'vegan') score -= 100;
    else if (normDiet === 'vegetarian' && recipe.dietType !== 'vegan' && recipe.dietType !== 'vegetarian') score -= 100;
    else if (normDiet === 'eggetarian' && recipe.dietType === 'omnivore') score -= 80;
    else if (normDiet === 'pescatarian' && recipe.dietType === 'omnivore') score -= 50;

    for (const anchor of keyAnchorMap) {
      if (anchor.keys.some((k) => allText.includes(k))) {
        if (anchor.ids.includes(recipe.id)) score += 30;
      }
    }

    const rName = recipe.name.toLowerCase();
    const rIngs = recipe.ingredients.map((i) => i.item.toLowerCase()).join(' ');
    const tokens = normName.split(/\s+/).filter((w) => w.length > 3);
    for (const token of tokens) {
      if (rName.includes(token)) score += 8;
      if (rIngs.includes(token)) score += 4;
    }

    if (normCat && recipe.category.toLowerCase() === normCat) score += 5;
    if (normDiet && recipe.dietType.toLowerCase() === normDiet) score += 5;

    if (customDish.protein && recipe.protein) {
      const pDiff = Math.abs(customDish.protein - recipe.protein);
      score += Math.max(0, 5 - pDiff / 10);
    }

    if (score > bestScore) {
      bestScore = score;
      bestRecipe = recipe;
    }
  }

  const spriteUrl = bestRecipe.image.replace('.webp', '.png');
  return { recipe: bestRecipe, spriteUrl, score: bestScore };
}
