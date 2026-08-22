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
  dietType: 'vegetarian' | 'vegan' | 'pescatarian' | 'omnivore';
  tags: string[];
  focusScore: string;
  description: string;
  ingredients: { item: string; amount: string }[];
  instructions: string[];
}

export const RECIPES: Recipe[] = [
  {
    id: 'herb-grilled-chicken',
    name: 'Herb Grilled Chicken & Crispy Greens',
    subtitle: 'Lean pasture-raised breast with rosemary and wilted greens',
    image: '/assets/food/grilled-chicken-1.0.png',
    portionImages: {
      0.5: '/assets/food/grilled-chicken-0.5.png',
      1.0: '/assets/food/grilled-chicken-1.0.png',
      1.5: '/assets/food/grilled-chicken-1.5.png',
      2.0: '/assets/food/grilled-chicken-2.0.png',
    },
    calories: 520,
    protein: 48,
    carbs: 16,
    fats: 14,
    prepTimeMinutes: 20,
    category: 'High Protein',
    dietType: 'omnivore',
    tags: ['High Protein', 'Gluten-Free', 'Post Workout', 'Omnivore'],
    focusScore: '9.4/10',
    description:
      'High-bioavailability protein paired with micro-nutrient dense dark greens. Calibrated to supply steady amino acids for physical recovery without post-meal fatigue.',
    ingredients: [
      { item: 'Free-Range Chicken Breast', amount: '250g' },
      { item: 'Fresh Rosemary & Thyme', amount: '2 tbsp' },
      { item: 'Cold-Pressed Olive Oil', amount: '1 tbsp' },
      { item: 'Baby Spinach & Arugula', amount: '100g' },
      { item: 'Sea Salt & Crushed Black Pepper', amount: 'To taste' },
      { item: 'Lemon Juice', amount: '1/2 lemon' }
    ],
    instructions: [
      'Pound chicken breast to uniform 1/2-inch thickness for even searing.',
      'Rub chicken with olive oil, minced fresh herbs, sea salt, and black pepper.',
      'Heat cast-iron pan to medium-high and sear chicken for 5–6 minutes per side until internal temp reaches 165°F.',
      'In the residual pan juices, toss spinach and arugula for 45 seconds until wilted.',
      'Slice chicken across the grain, serve atop greens with a fresh squeeze of lemon.'
    ]
  },
  {
    id: 'truffle-tagliatelle-pasta',
    name: 'Truffle & Parmesan Tagliatelle',
    subtitle: 'Slow-digesting durum wheat with aged parmesan and truffle oil',
    image: '/assets/food/pasta-1.0.png',
    portionImages: {
      0.5: '/assets/food/pasta-0.5.png',
      1.0: '/assets/food/pasta-1.0.png',
      1.5: '/assets/food/pasta-1.5.png',
      2.0: '/assets/food/pasta-2.0.png',
    },
    calories: 610,
    protein: 18,
    carbs: 78,
    fats: 19,
    prepTimeMinutes: 18,
    category: 'Steady Carbs',
    dietType: 'vegetarian',
    tags: ['Glycogen Reload', 'Pre-Workout', 'Vegetarian', 'Complex Carbs'],
    focusScore: '8.4/10',
    description:
      'Clean complex carbohydrates designed for pre-training glycogen storage and prolonged aerobic stamina. Balanced with aged parmesan for sustained release.',
    ingredients: [
      { item: 'Artisanal Tagliatelle or Fettuccine', amount: '110g dry' },
      { item: 'Grass-Fed Butter', amount: '1.5 tbsp' },
      { item: '24-Month Aged Parmigiano Reggiano', amount: '35g freshly grated' },
      { item: 'White Truffle Infused Olive Oil', amount: '1 tsp' },
      { item: 'Reserved Pasta Water', amount: '60ml' },
      { item: 'Cracked Black Peppercorn', amount: '1/2 tsp' }
    ],
    instructions: [
      'Boil pasta in salted water for 8 minutes until strictly al dente.',
      'Melt grass-fed butter in a wide saucepan over low heat and crack black pepper.',
      'Transfer pasta directly to pan with 60ml reserved starchy cooking water.',
      'Remove from heat; vigorously emulsify with parmesan until a glossy, silk sauce forms.',
      'Drizzle truffle oil and finish with additional shaved parmigiano.'
    ]
  },
  {
    id: 'cast-iron-skillet-eggs',
    name: 'Cast-Iron Skillet Eggs & Greens',
    subtitle: 'Pasture-raised farm eggs sunny-side up with charred asparagus',
    image: '/assets/food/skillet-eggs-1.0.png',
    portionImages: {
      0.5: '/assets/food/skillet-eggs-0.5.png',
      1.0: '/assets/food/skillet-eggs-1.0.png',
      1.5: '/assets/food/skillet-eggs-1.5.png',
      2.0: '/assets/food/skillet-eggs-2.0.png',
    },
    calories: 440,
    protein: 34,
    carbs: 12,
    fats: 28,
    prepTimeMinutes: 12,
    category: 'Quick Fuel',
    dietType: 'vegetarian',
    tags: ['Choline Rich', 'Brain Fuel', 'Vegetarian', 'Morning Alert'],
    focusScore: '9.1/10',
    description:
      'Loaded with dietary choline and healthy fats from pasture-raised yolks to stimulate morning acetylcholine production, alertness, and mental clarity.',
    ingredients: [
      { item: 'Pasture-Raised Large Eggs', amount: '4 whole' },
      { item: 'Fresh Tender Asparagus Spears', amount: '120g' },
      { item: 'Extra Virgin Olive Oil or Ghee', amount: '1 tbsp' },
      { item: 'Himalayan Pink Salt & Smoked Paprika', amount: 'To taste' },
      { item: 'Crumbled Feta or Goat Cheese', amount: '25g' }
    ],
    instructions: [
      'Preheat a small cast-iron skillet over medium heat with ghee or olive oil.',
      'Snap woody ends off asparagus and lay across the skillet for 3 minutes until vibrant and tender.',
      'Crack eggs directly into the spaces between asparagus spears.',
      'Cover with lid for 2 minutes to gently set the whites while keeping yolks runny.',
      'Season with smoked paprika, sea salt, and sprinkle crumbled feta before serving.'
    ]
  },
  {
    id: 'smoked-citrus-taco-bowl',
    name: 'Smoked Citrus Fiesta Taco Bowl',
    subtitle: 'Grass-fed lean beef, black beans, sweet corn, and lime pico',
    image: '/assets/food/taco-bowl-1.0.png',
    portionImages: {
      0.5: '/assets/food/taco-bowl-0.5.png',
      1.0: '/assets/food/taco-bowl-1.0.png',
      1.5: '/assets/food/taco-bowl-1.5.png',
      2.0: '/assets/food/taco-bowl-2.0.png',
    },
    calories: 560,
    protein: 42,
    carbs: 48,
    fats: 16,
    prepTimeMinutes: 22,
    category: 'High Protein',
    dietType: 'omnivore',
    tags: ['High Protein', 'Electrolyte Rich', 'Balanced Macros', 'Omnivore'],
    focusScore: '8.9/10',
    description:
      'Complete amino acid profile combined with natural potassium, magnesium, and bioavailable iron from grass-fed beef to restore muscle and neural vigor.',
    ingredients: [
      { item: '90/10 Grass-Fed Minced Beef', amount: '180g' },
      { item: 'Simmered Black Beans', amount: '80g' },
      { item: 'Fire-Roasted Sweet Corn', amount: '50g' },
      { item: 'Charred Tomato Pico de Gallo', amount: '3 tbsp' },
      { item: 'Cumin, Coriander & Chipotle Powder', amount: '1 tbsp' },
      { item: 'Fresh Lime Wedges', amount: '2 slices' }
    ],
    instructions: [
      'Brown minced beef in a hot pan, breaking into bite-sized crumbles.',
      'Add cumin, coriander, chipotle, and 2 tbsp water; simmer for 4 minutes.',
      'Warm black beans and sweet corn with a pinch of sea salt.',
      'Arrange beef, beans, and corn in equal sections in a wide shallow bowl.',
      'Top with fresh pico de gallo and squeeze fresh lime juice right before enjoying.'
    ]
  },
  {
    id: 'warm-ancient-grain-bowl',
    name: 'Warm Ancient Grain & Avocado Bowl',
    subtitle: 'Tri-color quinoa, roasted sweet potatoes, and avocado wedges',
    image: '/assets/food/grain-bowl-1.0.png',
    portionImages: {
      0.5: '/assets/food/grain-bowl-0.5.png',
      1.0: '/assets/food/grain-bowl-1.0.png',
      1.5: '/assets/food/grain-bowl-1.5.png',
      2.0: '/assets/food/grain-bowl-2.0.png',
    },
    calories: 490,
    protein: 22,
    carbs: 62,
    fats: 17,
    prepTimeMinutes: 25,
    category: 'Steady Carbs',
    dietType: 'vegan',
    tags: ['Plant Protein', 'Fiber Rich', 'Vegan', 'Vegetarian', 'Clean Balance'],
    focusScore: '8.7/10',
    description:
      'High-fiber prebiotic complex with monosaturated lipids. Promotes healthy gut microbiome fermentation for sustained serotonin and steady dopamine levels.',
    ingredients: [
      { item: 'Organic Tri-Color Quinoa', amount: '90g dry' },
      { item: 'Cubed Japanese Sweet Potato', amount: '120g' },
      { item: 'Ripe Haas Avocado', amount: '1/2 sliced' },
      { item: 'Shelled Edamame Beans', amount: '60g' },
      { item: 'Toasted Pumpkin Seeds', amount: '15g' },
      { item: 'Tahini-Lemon Dressing', amount: '1.5 tbsp' }
    ],
    instructions: [
      'Roast cubed sweet potato with a drop of olive oil at 400°F for 20 minutes until caramelized.',
      'Simmer quinoa in vegetable broth for 15 minutes, fluff with a fork.',
      'Steam shelled edamame for 3 minutes.',
      'Assemble warm quinoa base, roasted sweet potatoes, edamame, and sliced avocado.',
      'Drizzle tahini-lemon dressing and scatter toasted pumpkin seeds for crunch.'
    ]
  },
  {
    id: 'avocado-sourdough-toast',
    name: 'Poached Egg & Whipped Avocado Sourdough',
    subtitle: 'Cold-fermented sourdough with chili flakes and microgreens',
    image: '/assets/food/avocado-toast-1.0.png',
    portionImages: {
      0.5: '/assets/food/avocado-toast-0.5.png',
      1.0: '/assets/food/avocado-toast-1.0.png',
      1.5: '/assets/food/avocado-toast-1.5.png',
      2.0: '/assets/food/avocado-toast-2.0.png',
    },
    calories: 410,
    protein: 24,
    carbs: 38,
    fats: 18,
    prepTimeMinutes: 10,
    category: 'Quick Fuel',
    dietType: 'vegetarian',
    tags: ['Fast Prep', 'Brain Fats', 'Vegetarian', 'Breakfast'],
    focusScore: '9.0/10',
    description:
      'Natural whole-grain carbohydrates paired with bioavailable fatty acids. Excellent for fast cognitive activation without glycemic rollercoasters.',
    ingredients: [
      { item: 'Cold-Fermented Sourdough Bread', amount: '2 thick slices' },
      { item: 'Haas Avocado', amount: '1 whole ripe' },
      { item: 'Pasture-Raised Eggs', amount: '2 poached' },
      { item: 'Flaky Maldon Sea Salt & Red Pepper Flakes', amount: '1 tsp' },
      { item: 'Radish & Broccoli Microgreens', amount: 'Small handful' }
    ],
    instructions: [
      'Toast sourdough slices in pan with light ghee or dry toaster until crisp exterior.',
      'Mash avocado with lemon juice, sea salt, and black pepper; spread generously across toast.',
      'Poach eggs in simmering water with 1 tbsp vinegar for 3.5 minutes.',
      'Top avocado toast with poached eggs, chili flakes, and fresh microgreens.'
    ]
  },
  {
    id: 'chimichurri-seared-steak',
    name: 'Cast-Iron Strip Steak with Fresh Chimichurri',
    subtitle: 'Dry-brined sirloin with raw parsley, oregano, and garlic vinaigrette',
    image: '/assets/food/steak-chimichurri-1.0.png',
    portionImages: {
      0.5: '/assets/food/steak-chimichurri-0.5.png',
      1.0: '/assets/food/steak-chimichurri-1.0.png',
      1.5: '/assets/food/steak-chimichurri-1.5.png',
      2.0: '/assets/food/steak-chimichurri-2.0.png',
    },
    calories: 580,
    protein: 52,
    carbs: 6,
    fats: 32,
    prepTimeMinutes: 18,
    category: 'Keto Clean',
    dietType: 'omnivore',
    tags: ['Ultra High Protein', 'Carnivore Clean', 'Keto', 'Omnivore'],
    focusScore: '9.3/10',
    description:
      'Maximum protein density with pure carnitine and zinc. Ideal for nighttime muscle repair or intense physical output recovery.',
    ingredients: [
      { item: 'Grass-Fed Sirloin or NY Strip Steak', amount: '280g' },
      { item: 'Fresh Flat-Leaf Parsley & Oregano', amount: '1/2 cup minced' },
      { item: 'Garlic Cloves', amount: '2 minced' },
      { item: 'Red Wine Vinegar & Olive Oil', amount: '2 tbsp' },
      { item: 'Coarse Sea Salt & Crushed Black Pepper', amount: '1 tbsp' }
    ],
    instructions: [
      'Pat steak dry and season generously with coarse salt 15 mins prior.',
      'Whisk parsley, oregano, garlic, red wine vinegar, olive oil, and chili into fresh chimichurri.',
      'Heat cast iron till smoking hot. Sear steak for 3–4 minutes per side for medium rare.',
      'Rest for 5 minutes before carving against grain; spoon fresh chimichurri over hot slices.'
    ]
  },
  {
    id: 'tamago-sesame-rice-bowl',
    name: 'Tamago Sesame Soft Egg Rice Bowl',
    subtitle: 'Steamed short-grain rice with furikake, soy glaze, and spring onions',
    image: '/assets/food/egg-rice-bowl-1.0.png',
    portionImages: {
      0.5: '/assets/food/egg-rice-bowl-0.5.png',
      1.0: '/assets/food/egg-rice-bowl-1.0.png',
      1.5: '/assets/food/egg-rice-bowl-1.5.png',
      2.0: '/assets/food/egg-rice-bowl-2.0.png',
    },
    calories: 460,
    protein: 26,
    carbs: 56,
    fats: 14,
    prepTimeMinutes: 14,
    category: 'Steady Carbs',
    dietType: 'vegetarian',
    tags: ['Clean Fuel', 'Japanese Minimalist', 'Vegetarian', 'Daily Staple'],
    focusScore: '8.8/10',
    description:
      'Clean, hypoallergenic fuel with easily assimilated rice starches and high-quality egg albumen. Perfect pre-training fuel or recovery comfort bowl.',
    ingredients: [
      { item: 'Steamed Short-Grain White or Jasmine Rice', amount: '180g cooked' },
      { item: 'Pasture-Raised Eggs', amount: '3 soft-boiled (6.5 min)' },
      { item: 'Low-Sodium Tamari / Soy Glaze', amount: '1.5 tbsp' },
      { item: 'Toasted Sesame Furikake & Nori', amount: '1 tbsp' },
      { item: 'Finely Sliced Scallions', amount: '2 stalks' }
    ],
    instructions: [
      'Spoon steaming rice into a ceramic bowl.',
      'Halve soft-boiled eggs to reveal gooey, jammy yolks.',
      'Lay eggs on rice, drizzle with tamari and sesame oil.',
      'Garnish generously with toasted furikake, nori ribbons, and sliced scallions.'
    ]
  },
  {
    id: 'garlic-prawn-linguine',
    name: 'Garlic Butter Prawn Linguine',
    subtitle: 'Wild-caught tiger prawns tossed with garlic, chili, and parsley',
    image: '/assets/food/prawn-linguine-1.0.png',
    portionImages: {
      0.5: '/assets/food/prawn-linguine-0.5.png',
      1.0: '/assets/food/prawn-linguine-1.0.png',
      1.5: '/assets/food/prawn-linguine-1.5.png',
      2.0: '/assets/food/prawn-linguine-2.0.png',
    },
    calories: 530,
    protein: 44,
    carbs: 54,
    fats: 13,
    prepTimeMinutes: 16,
    category: 'Post Workout',
    dietType: 'pescatarian',
    tags: ['High Protein', 'Lean Seafood', 'Pescatarian', 'Post Workout'],
    focusScore: '9.2/10',
    description:
      'High protein-to-calorie ratio from ocean-wild shrimp combined with light pasta to immediately restock muscular glycogen without sluggishness.',
    ingredients: [
      { item: 'Peeled Wild Tiger Prawns', amount: '220g' },
      { item: 'Linguine Pasta', amount: '80g dry' },
      { item: 'Garlic Cloves', amount: '4 thinly sliced' },
      { item: 'Butter & Extra Virgin Olive Oil', amount: '1 tbsp each' },
      { item: 'White Wine or Lemon Broth', amount: '3 tbsp' },
      { item: 'Fresh Chopped Parsley', amount: '2 tbsp' }
    ],
    instructions: [
      'Boil linguine in salted water until al dente.',
      'Sauté garlic and chili in olive oil and butter for 60 seconds until fragrant.',
      'Add prawns and sear 90 seconds per side until pink and curled.',
      'Splash with white wine/lemon broth and toss cooked pasta into pan with fresh parsley.',
      'Toss vigorously for 1 minute to coat every noodle in seafood garlic emulsion.'
    ]
  }
];
