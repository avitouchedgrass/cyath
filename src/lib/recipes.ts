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
  isCustom?: boolean;
  rawImage?: string;
  reasoningSteps?: string[];
}

export const RECIPES: Recipe[] = [
  {
    id: 'herb-grilled-chicken',
    name: 'Herb Grilled Chicken & Crispy Greens',
    subtitle: 'Lean pasture-raised breast with rosemary and wilted greens',
    image: '/assets/food/grilled-chicken-1.0.webp',
    portionImages: {
      0.5: '/assets/food/grilled-chicken-0.5.webp',
      1.0: '/assets/food/grilled-chicken-1.0.webp',
      1.5: '/assets/food/grilled-chicken-1.5.webp',
      2.0: '/assets/food/grilled-chicken-2.0.webp',
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
    image: '/assets/food/pasta-1.0.webp',
    portionImages: {
      0.5: '/assets/food/pasta-0.5.webp',
      1.0: '/assets/food/pasta-1.0.webp',
      1.5: '/assets/food/pasta-1.5.webp',
      2.0: '/assets/food/pasta-2.0.webp',
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
    image: '/assets/food/skillet-eggs-1.0.webp',
    portionImages: {
      0.5: '/assets/food/skillet-eggs-0.5.webp',
      1.0: '/assets/food/skillet-eggs-1.0.webp',
      1.5: '/assets/food/skillet-eggs-1.5.webp',
      2.0: '/assets/food/skillet-eggs-2.0.webp',
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
    image: '/assets/food/taco-bowl-1.0.webp',
    portionImages: {
      0.5: '/assets/food/taco-bowl-0.5.webp',
      1.0: '/assets/food/taco-bowl-1.0.webp',
      1.5: '/assets/food/taco-bowl-1.5.webp',
      2.0: '/assets/food/taco-bowl-2.0.webp',
    },
    calories: 560,
    protein: 42,
    carbs: 48,
    fats: 16,
    prepTimeMinutes: 22,
    category: 'High Protein',
    dietType: 'omnivore',
    tags: ['High Protein', 'Whole Food', 'Comfort Classic', 'Clean Energy'],
    focusScore: '9.5/10',
    description:
      'Rich protein and essential minerals from steak and eggs to restore energy and support muscle recovery.',
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
    image: '/assets/food/grain-bowl-1.0.webp',
    portionImages: {
      0.5: '/assets/food/grain-bowl-0.5.webp',
      1.0: '/assets/food/grain-bowl-1.0.webp',
      1.5: '/assets/food/grain-bowl-1.5.webp',
      2.0: '/assets/food/grain-bowl-2.0.webp',
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
    image: '/assets/food/avocado-toast-1.0.webp',
    portionImages: {
      0.5: '/assets/food/avocado-toast-0.5.webp',
      1.0: '/assets/food/avocado-toast-1.0.webp',
      1.5: '/assets/food/avocado-toast-1.5.webp',
      2.0: '/assets/food/avocado-toast-2.0.webp',
    },
    calories: 410,
    protein: 24,
    carbs: 38,
    fats: 18,
    prepTimeMinutes: 10,
    category: 'Quick Fuel',
    dietType: 'vegetarian',
    tags: ['Fast Prep', 'Healthy Fats', 'Vegetarian', 'Breakfast'],
    focusScore: '9.0/10',
    description:
      'Whole-grain sourdough toast paired with rich avocado and eggs for steady morning energy.',
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
    id: 'tamago-sesame-rice-bowl',
    name: 'Tamago Sesame Soft Egg Rice Bowl',
    subtitle: 'Steamed short-grain rice with furikake, soy glaze, and spring onions',
    image: '/assets/food/egg-rice-bowl-1.0.webp',
    portionImages: {
      0.5: '/assets/food/egg-rice-bowl-0.5.webp',
      1.0: '/assets/food/egg-rice-bowl-1.0.webp',
      1.5: '/assets/food/egg-rice-bowl-1.5.webp',
      2.0: '/assets/food/egg-rice-bowl-2.0.webp',
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
    image: '/assets/food/prawn-linguine-1.0.webp',
    portionImages: {
      0.5: '/assets/food/prawn-linguine-0.5.webp',
      1.0: '/assets/food/prawn-linguine-1.0.webp',
      1.5: '/assets/food/prawn-linguine-1.5.webp',
      2.0: '/assets/food/prawn-linguine-2.0.webp',
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
  },
  {
    id: 'rajma-chawal-bowl',
    name: 'Slow-Simmered Rajma & Jeera Basmati',
    subtitle: 'Kashmiri red kidney beans in spiced tomato gravy with fragrant cumin rice',
    image: '/assets/food/rajma-chawal-1.0.webp',
    calories: 510,
    protein: 21,
    carbs: 84,
    fats: 9,
    prepTimeMinutes: 35,
    category: 'Steady Carbs',
    dietType: 'vegan',
    tags: ['High Fiber', 'Plant Protein', 'Vegan', 'Steady Energy'],
    focusScore: '9.0/10',
    description:
      'Classic North Indian comfort food. Slow-simmered kidney beans and fragrant basmati rice deliver hearty plant protein and sustained, steady energy.',
    ingredients: [
      { item: 'Kashmiri Red Kidney Beans (Rajma)', amount: '180g cooked' },
      { item: 'Aged Basmati Rice with Roasted Jeera', amount: '160g steamed' },
      { item: 'San Marzano or Country Plum Tomatoes', amount: '2 pureed' },
      { item: 'Red Onion & Fresh Ginger-Garlic Paste', amount: '2 tbsp' },
      { item: 'Kashmiri Chili, Coriander & Garam Masala', amount: '1 tbsp blend' },
      { item: 'Cold-Pressed Mustard or Coconut Oil', amount: '1 tsp' },
      { item: 'Fresh Coriander & Lemon Wedge', amount: 'For garnish' }
    ],
    instructions: [
      'Soak red kidney beans overnight; pressure-cook with bay leaf and black cardamom until melt-in-mouth tender.',
      'Sauté cumin seeds, finely diced onions, and ginger-garlic paste in cold-pressed oil until golden brown.',
      'Stir in spiced tomato reduction and cook until natural oils release around edges.',
      'Add simmered rajma along with its mineral-rich broth; lightly crush 20% of beans to thicken gravy.',
      'Simmer on gentle heat for 12 minutes until velvety; serve alongside warm cumin-tempered basmati rice with a fresh lemon squeeze.'
    ]
  },
  {
    id: 'homestyle-tariwala-chicken',
    name: 'Homestyle Tariwala Chicken & Phulkas',
    subtitle: 'Tender chicken simmered in ginger-coriander spiced broth with puffed tawa rotis',
    image: '/assets/food/chicken-curry-1.0.webp',
    calories: 540,
    protein: 46,
    carbs: 42,
    fats: 18,
    prepTimeMinutes: 30,
    category: 'High Protein',
    dietType: 'omnivore',
    tags: ['High Protein', 'Lean Poultry', 'Omnivore', 'Post Workout'],
    focusScore: '9.3/10',
    description:
      'The quintessential Indian home-cooked poultry meal. Clean chicken cuts simmered in a light, unrefined whole-spice broth (tari) rich in carnosine, curcumin, and gingerols for systemic inflammation control and accelerated myofibrillar recovery.',
    ingredients: [
      { item: 'Free-Range Chicken Cuts (Bone-In / Thigh & Breast)', amount: '240g' },
      { item: 'Stone-Ground 100% Whole Wheat Phulkas', amount: '2 rotis' },
      { item: 'Sliced Red Onion & Ripe Tomato Puree', amount: '1 cup' },
      { item: 'Fresh Ginger, Garlic & Green Chili Crush', amount: '1.5 tbsp' },
      { item: 'Whole Spices (Cinnamon Stick, Cloves, Cardamom)', amount: '1 tsp' },
      { item: 'Turmeric, Roasted Cumin & Coriander Powder', amount: '1 tbsp' },
      { item: 'Cold-Pressed Mustard Oil or Ghee', amount: '1 tbsp' }
    ],
    instructions: [
      'Bloom whole cinnamon, cardamom, and cloves in hot mustard oil until crackling and aromatic.',
      'Caramelize sliced onions slowly until deep golden brown, then incorporate crushed ginger-garlic paste.',
      'Add bone-in chicken cuts and sear on high heat for 4 minutes to seal juices and bloom spices.',
      'Pour in hot water, cover, and gently simmer for 18 minutes until chicken is tender and fragrant broth forms.',
      'Garnish with freshly chopped cilantro and serve piping hot with soft, puffed whole-wheat phulkas and raw onion rings.'
    ]
  },
  {
    id: 'paneer-bhurji-tiffin',
    name: 'Tawa Paneer Bhurji & Crisp Bell Peppers',
    subtitle: 'Fresh crumbled dairy paneer sauteed with turmeric, green chillies, and cumin',
    image: '/assets/food/paneer-bhurji-1.0.webp',
    calories: 480,
    protein: 32,
    carbs: 18,
    fats: 32,
    prepTimeMinutes: 15,
    category: 'High Protein',
    dietType: 'vegetarian',
    tags: ['High Protein', 'Vegetarian', 'Quick Fuel', 'Brain Fats'],
    focusScore: '9.1/10',
    description:
      'High-bioavailability dairy casein and essential fatty acids paired with capsanthin from crisp bell peppers. Digests steadily over 4 to 6 hours, delivering continuous amino acid trickle to prevent mental fatigue and mid-day hunger crashes.',
    ingredients: [
      { item: 'Fresh Malai Paneer (Crumbled by hand)', amount: '180g' },
      { item: 'Stone-Ground Whole Wheat Roti', amount: '1 roti' },
      { item: 'Diced Crunchy Green Bell Pepper (Capsicum)', amount: '60g' },
      { item: 'Finely Chopped Red Onion & Roma Tomato', amount: '1/2 cup each' },
      { item: 'Slit Green Chili & Minced Ginger', amount: '1 tbsp' },
      { item: 'Pure A2 Desi Ghee or Cold-Pressed Oil', amount: '1 tbsp' },
      { item: 'Turmeric, Pav Bhaji Spices & Kasuri Methi', amount: '1 tsp each' }
    ],
    instructions: [
      'Heat desi ghee in a heavy cast-iron tawa or skillet; crackle cumin seeds and sauté ginger and green chili.',
      'Toss in onions and sauté until translucent, followed by diced tomatoes and turmeric until soft.',
      'Fold in diced bell peppers for 90 seconds to preserve crunch and vitamin C content.',
      'Gently fold in fresh crumbled paneer and crushed fragrant kasuri methi (fenugreek leaves); stir for only 2 minutes to keep paneer tender and moist.',
      'Serve warm with hot whole-wheat roti or alongside sprouted salads.'
    ]
  },
  {
    id: 'healing-moong-khichdi',
    name: 'Healing Moong Khichdi & Golden Ghee',
    subtitle: 'Slow-cooked yellow lentils and rice tempered with roasted cumin, hing, and ginger',
    image: '/assets/food/moong-khichdi-1.0.webp',
    calories: 420,
    protein: 18,
    carbs: 64,
    fats: 11,
    prepTimeMinutes: 20,
    category: 'Quick Fuel',
    dietType: 'vegetarian',
    tags: ['Ayurvedic Cleanse', 'Gut Soothing', 'Vegetarian', 'Quick Fuel'],
    focusScore: '8.9/10',
    description:
      'Celebrated for millennia as the quintessential restorative Indian comfort meal. The gentle starch-protein matrix of split yellow mung lentils and polished rice places virtually zero enzymatic load on the gastrointestinal tract, promoting rapid parasympathetic activation and gut healing.',
    ingredients: [
      { item: 'Split Yellow Moong Lentils (Dhuli Moong)', amount: '70g dry' },
      { item: 'Small-Grain Rice', amount: '50g dry' },
      { item: 'Pure Desi A2 Cow Ghee', amount: '1.5 tbsp' },
      { item: 'Whole Cumin Seeds & Asafoetida (Hing)', amount: '1/2 tsp each' },
      { item: 'Freshly Grated Ginger & Black Peppercorns', amount: '1 tsp' },
      { item: 'Fresh Probiotic Set Curd (Dahi)', amount: '80g' },
      { item: 'Himalayan Pink Salt & Wild Turmeric', amount: 'To taste' }
    ],
    instructions: [
      'Wash yellow moong dal and rice together; cook with 4x water, turmeric, salt, and grated ginger until soft and porridge-like.',
      'In a small tadka pan, heat pure A2 cow ghee until warm.',
      'Add cumin seeds, cracked black pepper, and a pinch of hing; let seeds sputter and release fragrant aromas.',
      'Pour the sizzling golden ghee tadka directly over the steaming khichdi.',
      'Swirl gently and serve hot alongside a bowl of cool probiotic curd.'
    ]
  },
  {
    id: 'dhabawala-egg-curry',
    name: 'Dhabawala Spiced Egg Curry & Basmati',
    subtitle: 'Golden pan-crisped farm eggs in a robust onion-tomato masala and steamed rice',
    image: '/assets/food/egg-curry-1.0.webp',
    calories: 490,
    protein: 30,
    carbs: 52,
    fats: 18,
    prepTimeMinutes: 20,
    category: 'High Protein',
    dietType: 'omnivore',
    tags: ['High Protein', 'Choline Rich', 'Omnivore', 'Post Workout'],
    focusScore: '9.2/10',
    description:
      'A beloved roadside dhaba staple featuring farm eggs lightly pan-seared in turmeric and chili until blistered, then simmered in a reduced tomato, onion, and roasted garam masala gravy. High in natural choline and leucine for muscle protein synthesis and neural resilience.',
    ingredients: [
      { item: 'Farm-Fresh Large Eggs (Hard-Boiled)', amount: '3 whole' },
      { item: 'Steamed Long-Grain Basmati Rice', amount: '150g' },
      { item: 'Finely Chopped Red Onion & Ginger-Garlic', amount: '1/2 cup' },
      { item: 'Fresh Tomato Puree', amount: '3/4 cup' },
      { item: 'Cold-Pressed Mustard Oil or Ghee', amount: '1 tbsp' },
      { item: 'Turmeric, Kashmiri Chili & Roasted Garam Masala', amount: '1 tbsp blend' },
      { item: 'Kasuri Methi & Fresh Cilantro', amount: '1 tsp' }
    ],
    instructions: [
      'Prick boiled eggs lightly with a fork and shallow-fry in 1 tsp oil with turmeric and chili powder until blistered and golden.',
      'In the same pan, temper whole cumin seeds and sauté finely chopped onions until caramelized brown.',
      'Add ginger-garlic paste and cook tomato puree until fragrant and oil begins to separate.',
      'Pour in 1/2 cup warm water, drop in the halved blistered eggs, and simmer for 5 minutes to infuse flavor.',
      'Finish with crushed kasuri methi and fresh cilantro; serve over steaming basmati rice with pickled onion rings.'
    ]
  },
  {
    id: 'soya-matar-pulao',
    name: 'High-Protein Soya Chunk & Matar Pulao',
    subtitle: 'Spiced basmati rice with golden seared soya chunks, sweet green peas, and fresh mint',
    image: '/assets/food/soya-pulao-1.0.webp',
    calories: 480,
    protein: 36,
    carbs: 68,
    fats: 8,
    prepTimeMinutes: 20,
    category: 'High Protein',
    dietType: 'vegan',
    tags: ['Plant Protein', 'Soya Nugget', 'Vegan', 'Post Workout', 'Easy One-Pot'],
    focusScore: '9.3/10',
    description:
      'Soya chunks deliver over 52% protein density by dry weight. Tempered with fragrant cumin, cloves, cardamom, and fresh mint, this one-pot powerhouse restocks glycogen and supplies high BCAAs with minimal digestive drag.',
    ingredients: [
      { item: 'Soya Chunks (Nutrela / Soy Nuggets)', amount: '60g dry' },
      { item: 'Aged Basmati Rice', amount: '80g dry' },
      { item: 'Green Sweet Peas (Matar)', amount: '50g' },
      { item: 'Onion & Ginger-Garlic Paste', amount: '1 medium sliced + 1 tbsp' },
      { item: 'Whole Spices (Cloves, Cinnamon, Cardamom, Jeera)', amount: '1 tsp' },
      { item: 'Cold-Pressed Mustard Oil or Ghee', amount: '1 tbsp' },
      { item: 'Fresh Mint & Coriander Leaves', amount: 'Small handful' }
    ],
    instructions: [
      'Boil soya chunks in salted water for 5 minutes, rinse under cold water, and squeeze out excess moisture thoroughly.',
      'Heat ghee or mustard oil in a cooker or pot; bloom cumin, cinnamon, cloves, and sliced onions until golden brown.',
      'Add ginger-garlic paste, turmeric, garam masala, and squeeze-dried soya chunks; pan-sear for 3 minutes until lightly blistered.',
      'Add washed basmati rice, green peas, chopped mint, and 1.75 cups water; season with salt.',
      'Pressure-cook for 1 whistle on high (or cover and simmer for 12 minutes on low); let rest 5 minutes before fluffing with a fork.'
    ]
  },
  {
    id: 'desi-skillet-shakshuka',
    name: 'Desi Skillet Shakshuka with Poached Eggs',
    subtitle: 'Runny pasture-raised eggs poached in spiced tomato, bell pepper, and roasted cumin reduction',
    image: '/assets/food/desi-shakshuka-1.0.webp',
    calories: 420,
    protein: 28,
    carbs: 22,
    fats: 24,
    prepTimeMinutes: 15,
    category: 'Quick Fuel',
    dietType: 'vegetarian',
    tags: ['Choline Rich', 'Fast Prep', 'Vegetarian', 'Brain Fuel', 'Low Carb'],
    focusScore: '9.2/10',
    description:
      'A vibrant cross between Mediterranean shakshuka and Indian tomato-egg curry. Rich in dietary choline, carotenoids, and lycopene. The runny yolks create an unctuous sauce when scooped with hot roti or crisp toast.',
    ingredients: [
      { item: 'Farm-Fresh Large Eggs', amount: '3 whole' },
      { item: 'Ripe Plum Tomatoes', amount: '3 finely chopped' },
      { item: 'Green Bell Pepper (Capsicum)', amount: '1/2 diced' },
      { item: 'Red Onion & Garlic', amount: '1 small diced + 3 cloves minced' },
      { item: 'Roasted Jeera, Smoked Paprika & Coriander', amount: '1 tbsp blend' },
      { item: 'Olive Oil or Desi Ghee', amount: '1 tbsp' },
      { item: 'Fresh Coriander & Green Chili', amount: 'For garnish' }
    ],
    instructions: [
      'Heat olive oil or ghee in a skillet; sauté cumin seeds, onions, garlic, and diced capsicum until soft.',
      'Add chopped tomatoes, turmeric, paprika, coriander, and salt; simmer for 6–7 minutes until thick and glossy.',
      'Make 3 small hollow wells in the simmering tomato sauce and crack eggs directly into each well.',
      'Cover with lid on medium-low heat for 3–4 minutes until egg whites are set but yolks remain molten and runny.',
      'Scatter fresh chopped coriander and green chilies; serve immediately hot from the skillet with warm phulkas or toast.'
    ]
  },
  {
    id: 'paneer-kathi-roll',
    name: 'Tawa Paneer Tikka Kathi Roll',
    subtitle: 'Spiced charred paneer batons wrapped in whole-wheat flatbread with mint chutney and crisp onions',
    image: '/assets/food/paneer-kathi-roll-1.0.webp',
    calories: 520,
    protein: 30,
    carbs: 46,
    fats: 24,
    prepTimeMinutes: 18,
    category: 'High Protein',
    dietType: 'vegetarian',
    tags: ['High Protein', 'Vegetarian', 'Balanced Macros', 'Street Classic'],
    focusScore: '9.1/10',
    description:
      'Iconic Kolkata-style street roll redesigned for clean home preparation. Provides sustained-release dairy casein, complex carbs from stone-ground wheat, and digestive capsanthin from grilled capsicum.',
    ingredients: [
      { item: 'Fresh Dairy Paneer', amount: '160g cut into thick batons' },
      { item: 'Stone-Ground 100% Whole Wheat Rotis / Parathas', amount: '2 rotis' },
      { item: 'Crunchy Green Capsicum & Red Onion', amount: '1/2 cup thinly sliced' },
      { item: 'Thick Hung Curd (Dahi) Marinade', amount: '2 tbsp' },
      { item: 'Kashmiri Chili, Kasuri Methi & Chaat Masala', amount: '1.5 tsp' },
      { item: 'Fresh Mint-Coriander Chutney', amount: '2 tbsp' },
      { item: 'Ghee or Cold-Pressed Mustard Oil', amount: '1 tsp for searing' }
    ],
    instructions: [
      'Coat paneer batons in hung curd, Kashmiri chili, turmeric, kasuri methi, and salt.',
      'Sear paneer and sliced bell peppers on a smoking-hot tawa for 2–3 minutes until charred around edges.',
      'Warm whole-wheat roti on the tawa until soft and lightly crisp.',
      'Spread a generous layer of mint-coriander yogurt chutney down the center of each roti.',
      'Layer charred paneer, peppers, raw sliced red onions, a pinch of chaat masala, squeeze lemon, and tightly roll.'
    ]
  },
  {
    id: 'garlic-chili-egg-fried-rice',
    name: 'Street-Style Garlic Chili Egg Fried Rice',
    subtitle: 'Fluffy rice tossed on high flame with scrambled egg ribbons, crispy garlic bits, and scallions',
    image: '/assets/food/egg-fried-rice-1.0.webp',
    calories: 470,
    protein: 24,
    carbs: 62,
    fats: 14,
    prepTimeMinutes: 12,
    category: 'Steady Carbs',
    dietType: 'vegetarian',
    tags: ['Quick Fuel', 'Fast Prep', 'Vegetarian', 'Comfort Food'],
    focusScore: '8.9/10',
    description:
      'The ultimate quick pantry dish using leftover rice and eggs. Fast-absorbing carbs combine with protein and toasted garlic for a quick, energizing meal.',
    ingredients: [
      { item: 'Chilled Steamed Rice (Basmati or Jasmine)', amount: '180g cooked' },
      { item: 'Farm-Fresh Large Eggs', amount: '3 whisked' },
      { item: 'Garlic Cloves', amount: '5 cloves finely minced' },
      { item: 'Spring Onions (Scallions)', amount: '3 stalks separated' },
      { item: 'Soy Sauce & Vinegar', amount: '1 tbsp soy + 1/2 tsp white vinegar' },
      { item: 'Crushed Black Pepper & Red Chili Flakes', amount: '1 tsp' },
      { item: 'Toasted Sesame Oil or Neutral Oil', amount: '1 tbsp' }
    ],
    instructions: [
      'Heat a wok or deep kadai on highest flame until lightly smoking.',
      'Add oil and scramble whisked eggs for 30 seconds into tender curds; push to side of wok.',
      'Toss in minced garlic and scallion whites; sizzle for 45 seconds until golden and fragrant.',
      'Dump cold cooked rice into wok, breaking lumps with spatula on high heat.',
      'Drizzle soy sauce, vinegar, black pepper, and chili flakes around rim; toss vigorously for 2 minutes and finish with spring onion greens.'
    ]
  },
  {
    id: 'tempered-curd-rice',
    name: 'South Indian Tempered Curd Rice & Roasted Cashews',
    subtitle: 'Cool probiotic dahi chawal with crackling mustard seeds, curry leaves, ginger, and pomegranate',
    image: '/assets/food/curd-rice-1.0.webp',
    calories: 410,
    protein: 16,
    carbs: 58,
    fats: 13,
    prepTimeMinutes: 10,
    category: 'Steady Carbs',
    dietType: 'vegetarian',
    tags: ['Gut Friendly', 'Comfort Food', 'Vegetarian', 'Cooling Fuel'],
    focusScore: '9.0/10',
    description:
      'A classic soothing South Indian comfort meal. Fresh yogurt and fragrant spices aid gentle digestion, keeping your stomach calm and energized.',
    ingredients: [
      { item: 'Soft Over-Cooked Rice (Sona Masoori / Basmati)', amount: '160g cooked warm' },
      { item: 'Fresh Whole Milk Set Curd (Dahi)', amount: '150g whisked smooth' },
      { item: 'A2 Desi Ghee or Coconut Oil', amount: '1 tsp' },
      { item: 'Mustard Seeds & Urad Dal', amount: '1/2 tsp each' },
      { item: 'Fresh Curry Leaves & Slit Green Chili', amount: '8-10 leaves + 1 chili' },
      { item: 'Finely Minced Ginger', amount: '1 tsp' },
      { item: 'Roasted Cashews & Pomegranate Pearls', amount: '1 tbsp each for garnish' }
    ],
    instructions: [
      'Lightly mash warm cooked rice in a bowl using the back of a ladle.',
      'Fold in fresh whisked curd and a splash of milk; season with sea salt until creamy and soothing.',
      'Heat ghee or coconut oil in a small tadka pan; sputter mustard seeds, urad dal, and golden cashews.',
      'Add curry leaves, minced ginger, and green chilies; fry for 20 seconds until leaves are crackling crisp.',
      'Pour the aromatic sizzling tadka over the curd rice; fold gently and top with ruby pomegranate pearls.'
    ]
  },
  {
    id: 'savory-masala-oats',
    name: 'Savory Masala Oats with Soft Jammy Egg',
    subtitle: 'Toasted rolled oats simmered with turmeric, diced veggies, cumin, and a molten-yolk egg',
    image: '/assets/food/masala-oats-1.0.webp',
    calories: 390,
    protein: 22,
    carbs: 48,
    fats: 12,
    prepTimeMinutes: 12,
    category: 'Quick Fuel',
    dietType: 'vegetarian',
    tags: ['High Fiber', 'Fast Prep', 'Vegetarian', 'Morning Fuel', 'Steady Energy'],
    focusScore: '9.1/10',
    description:
      'Rolled oats simmered with golden turmeric, cumin, and vegetables, topped with a soft-boiled egg for clean, satisfying morning fuel.',
    ingredients: [
      { item: 'Whole Rolled Oats', amount: '55g' },
      { item: 'Pasture-Raised Egg', amount: '1 soft-boiled (6.5 min)' },
      { item: 'Finely Diced Carrot, Peas & Onion', amount: '1/2 cup total' },
      { item: 'Chopped Tomato', amount: '1/2 medium' },
      { item: 'Cumin Seeds, Turmeric & Garam Masala', amount: '1 tsp total' },
      { item: 'Desi Ghee or Olive Oil', amount: '1 tsp' },
      { item: 'Fresh Coriander & Lemon Juice', amount: 'To finish' }
    ],
    instructions: [
      'Heat ghee in a saucepan; crackle cumin seeds and sauté onions, carrots, and peas for 2 minutes.',
      'Add diced tomatoes, turmeric, garam masala, and salt; cook until soft and fragrant.',
      'Add rolled oats and roast lightly with spices for 1 minute.',
      'Pour in 1.5 cups hot water, stir well, and simmer on medium-low for 4–5 minutes until thick and creamy.',
      'Ladle into bowl, halve the soft-boiled jammy egg on top, squeeze fresh lemon, and scatter cilantro.'
    ]
  },
  {
    id: 'chettinad-pepper-chicken',
    name: 'Chettinad Black Pepper Chicken Kadai Roast',
    subtitle: 'Boneless chicken bites seared with freshly crushed black peppercorns, curry leaves, and fennel',
    image: '/assets/food/pepper-chicken-1.0.webp',
    calories: 490,
    protein: 48,
    carbs: 10,
    fats: 18,
    prepTimeMinutes: 16,
    category: 'Keto Clean',
    dietType: 'omnivore',
    tags: ['Ultra High Protein', 'Keto Clean', 'Omnivore', 'Post Workout', 'Thermogenic'],
    focusScore: '9.4/10',
    description:
      'Southern Indian culinary mastery engineered for extreme protein density. Freshly ground piperine enhances nutrient assimilation, revs thermogenesis, and pairs with lean poultry cuts for rapid myofibrillar repair.',
    ingredients: [
      { item: 'Boneless Chicken Thigh or Breast (cubed)', amount: '250g' },
      { item: 'Coarsely Crushed Black Peppercorns', amount: '1.5 tbsp freshly ground' },
      { item: 'Fennel Seeds (Saunf) & Cumin Seeds', amount: '1/2 tsp each' },
      { item: 'Fresh Curry Leaves', amount: '15 leaves' },
      { item: 'Sliced Shallots or Red Onion', amount: '1 medium sliced' },
      { item: 'Ginger-Garlic Paste', amount: '1 tbsp' },
      { item: 'Cold-Pressed Coconut Oil or Ghee', amount: '1 tbsp' }
    ],
    instructions: [
      'Dry roast whole black peppercorns and fennel seeds in a hot pan for 60 seconds; crush coarsely in a mortar-pestle.',
      'Heat coconut oil or ghee in a heavy kadai; crackle cumin seeds, curry leaves, and sliced onions until caramelized.',
      'Add ginger-garlic paste and turmeric; sauté 1 minute until fragrant.',
      'Toss in cubed chicken bites on high heat; sear for 5 minutes until sealed and lightly browned.',
      'Lower flame, fold in the freshly crushed black pepper spice blend and a pinch of salt; roast dry for 4 minutes until dark, glossy, and fragrant. Serve with lime wedge.'
    ]
  },
  {
    id: 'besan-paneer-chilla',
    name: 'Crispy Besan Chilla with Spiced Paneer',
    subtitle: 'Golden spiced gram-flour crepes stuffed with grated dairy paneer, green chilies, and mint chutney',
    image: '/assets/food/besan-chilla-1.0.webp',
    calories: 460,
    protein: 28,
    carbs: 36,
    fats: 22,
    prepTimeMinutes: 14,
    category: 'High Protein',
    dietType: 'vegetarian',
    tags: ['Plant & Dairy Protein', 'Gluten-Free', 'Vegetarian', 'Quick Fuel'],
    focusScore: '9.1/10',
    description:
      'Crispy chickpea flour crepe stuffed with seasoned paneer. High in plant protein and calcium, keeping you full and focused for hours.',
    ingredients: [
      { item: 'Gram Flour (Besan / Chickpea Flour)', amount: '70g' },
      { item: 'Fresh Grated Paneer', amount: '90g' },
      { item: 'Ajwain (Carom Seeds) & Hing', amount: '1/4 tsp each' },
      { item: 'Finely Chopped Green Chili & Coriander', amount: '1 tbsp' },
      { item: 'Turmeric & Red Chili Powder', amount: '1/2 tsp each' },
      { item: 'Desi Ghee or Cold-Pressed Oil', amount: '1 tsp for tawa' },
      { item: 'Homemade Mint Chutney', amount: '2 tbsp' }
    ],
    instructions: [
      'Whisk besan with ajwain, turmeric, chili powder, salt, and water into a smooth, pourable pancake batter.',
      'Heat a non-stick or well-seasoned iron tawa; pour a ladle of batter and spread into a thin round crepe.',
      'Drizzle drops of ghee along perimeter; cook on medium-high until underside turns crisp and golden.',
      'Scatter freshly grated spiced paneer and chopped coriander evenly across one half of the crepe.',
      'Fold over into a semi-circle, press lightly for 30 seconds until paneer warms through, and serve with mint chutney.'
    ]
  },
  {
    id: 'kala-chana-sundal',
    name: 'Warm Kala Chana Sundal & Fresh Coconut Bowl',
    subtitle: 'Tender black chickpeas tempered with mustard, crisp curry leaves, fresh grated coconut, and lemon',
    image: '/assets/food/kala-chana-1.0.webp',
    calories: 380,
    protein: 20,
    carbs: 54,
    fats: 10,
    prepTimeMinutes: 12,
    category: 'Steady Carbs',
    dietType: 'vegan',
    tags: ['High Fiber', 'High Iron', 'Vegan', 'Steady Energy'],
    focusScore: '9.0/10',
    description:
      'Tender black chickpeas tossed with crackling mustard seeds, curry leaves, and fresh coconut for hearty fiber and clean energy.',
    ingredients: [
      { item: 'Boiled Black Chickpeas (Kala Chana)', amount: '200g cooked tender' },
      { item: 'Fresh Grated Coconut', amount: '2 tbsp' },
      { item: 'Cold-Pressed Coconut Oil', amount: '1 tsp' },
      { item: 'Black Mustard Seeds, Urad Dal & Hing', amount: '1/2 tsp each' },
      { item: 'Fresh Curry Leaves & Slit Green Chili', amount: '8 leaves + 1 chili' },
      { item: 'Fresh Lemon Juice & Rock Salt', amount: '1/2 lemon + to taste' }
    ],
    instructions: [
      'Drain tender boiled black chickpeas (cooked in pressure cooker with salt until soft).',
      'Heat coconut oil in a kadai or skillet; sputter mustard seeds, urad dal, and hing until dal is golden.',
      'Toss in green chili and curry leaves for 15 seconds until aromatic.',
      'Add the warm boiled black chickpeas, season with pink rock salt, and toss for 2 minutes to absorb flavors.',
      'Turn off heat, fold in freshly grated coconut and fresh lemon juice; enjoy warm as a powerhouse protein snack or lunch bowl.'
    ]
  },
  {
    id: 'peanut-butter-banana-oats',
    name: 'Creamy Peanut Butter & Banana Power Oatmeal',
    subtitle: 'Rolled oats soaked in milk with 100% roasted peanut butter, fresh banana slices, and chia seeds',
    image: '/assets/food/peanut-butter-oats-1.0.webp',
    calories: 460,
    protein: 20,
    carbs: 64,
    fats: 16,
    prepTimeMinutes: 5,
    category: 'Steady Carbs',
    dietType: 'vegetarian',
    tags: ['Fast Prep', 'Omega-3', 'Vegetarian', 'Pre-Workout', 'Breakfast'],
    focusScore: '9.0/10',
    description:
      'A 5-minute staple made with ordinary kitchen staples. Slow-burning oat carbs meet monounsaturated fats and arginine from natural peanut butter, potassium from banana, and ALA omega-3s from chia seeds.',
    ingredients: [
      { item: 'Rolled Oats (Jumbo Oats)', amount: '60g' },
      { item: '100% Pure Roasted Peanut Butter', amount: '2 tbsp (32g)' },
      { item: 'Chilled Milk or Soy Milk', amount: '180ml' },
      { item: 'Ripe Robusta / Elaichi Banana', amount: '1 sliced' },
      { item: 'Chia Seeds', amount: '1 tsp' },
      { item: 'Ground Cinnamon & Pinch of Sea Salt', amount: '1/4 tsp' }
    ],
    instructions: [
      'Combine rolled oats, chia seeds, cinnamon, and a pinch of salt in a bowl or mason jar.',
      'Pour in milk and stir thoroughly; refrigerate overnight (or rest for 15 minutes if making warm on the stove).',
      'Swirl a generous dollop of natural roasted peanut butter into the center.',
      'Top with freshly sliced ripe banana rounds and a light dusting of cinnamon before digging in.'
    ]
  },
  {
    id: 'masala-french-toast',
    name: 'Mumbai Street Masala Egg French Toast',
    subtitle: 'Whole-wheat bread slices coated in spiced onion-chili egg batter and pan-toasted golden on tawa',
    image: '/assets/food/masala-french-toast-1.0.webp',
    calories: 430,
    protein: 24,
    carbs: 38,
    fats: 18,
    prepTimeMinutes: 8,
    category: 'Quick Fuel',
    dietType: 'vegetarian',
    tags: ['Fast Prep', 'Choline Rich', 'Vegetarian', 'Street Classic', 'Breakfast'],
    focusScore: '9.1/10',
    description:
      'The beloved Indian roadside upgrade to European French toast. Whisked eggs infused with finely minced red onions, fiery green chilies, cilantro, and turmeric, crisped in a skillet for an instant 8-minute protein breakfast.',
    ingredients: [
      { item: '100% Whole Wheat Bread Slices', amount: '2 thick slices' },
      { item: 'Farm-Fresh Large Eggs', amount: '3 whole' },
      { item: 'Finely Minced Red Onion & Green Chili', amount: '2 tbsp onion + 1 chili' },
      { item: 'Finely Chopped Fresh Coriander', amount: '1 tbsp' },
      { item: 'Turmeric, Red Chili Powder & Salt', amount: '1/2 tsp each' },
      { item: 'Butter or Desi Ghee', amount: '1 tsp for pan' }
    ],
    instructions: [
      'Crack eggs into a wide shallow bowl; add minced onion, green chili, cilantro, turmeric, chili powder, and salt. Whisk vigorously.',
      'Heat butter or ghee on a flat tawa or skillet over medium heat.',
      'Dip bread slices into the egg mixture for 5 seconds per side, ensuring herbs adhere to bread surface.',
      'Place onto the hot tawa and pour any leftover egg-onion mixture directly over the bread.',
      'Cook for 2–3 minutes per side until golden brown and crisped at the edges; slice into triangles and serve hot with pickled onions.'
    ]
  },
  {
    id: 'mediterranean-chickpea-salad',
    name: 'Mediterranean Chickpea & Feta Crisp Salad',
    subtitle: 'Tender kabuli chana tossed with crisp cucumber, cherry tomatoes, crumbled paneer/feta, and oregano',
    image: '/assets/food/chickpea-salad-1.0.webp',
    calories: 440,
    protein: 24,
    carbs: 52,
    fats: 16,
    prepTimeMinutes: 8,
    category: 'Steady Carbs',
    dietType: 'vegetarian',
    tags: ['Zero Cook', 'Plant Protein', 'Vegetarian', 'Clean Balance', 'Fiber Rich'],
    focusScore: '9.2/10',
    description:
      'No stove required if using cooked chickpeas. Combines prebiotic legumes with crisp hydrating vegetables, aged crumbled cheese, and polyphenol-dense extra virgin olive oil for effortless digestive vitality.',
    ingredients: [
      { item: 'Boiled Kabuli Chana (Chickpeas)', amount: '180g' },
      { item: 'Diced English Cucumber & Cherry Tomatoes', amount: '1/2 cup each' },
      { item: 'Crumbled Feta or Firm Dairy Paneer', amount: '40g' },
      { item: 'Thinly Sliced Red Onion & Parsley/Mint', amount: '2 tbsp each' },
      { item: 'Extra Virgin Olive Oil', amount: '1.5 tbsp' },
      { item: 'Fresh Lemon Juice & Dried Oregano', amount: '1 tbsp lemon + 1/2 tsp oregano' },
      { item: 'Sea Salt & Cracked Black Pepper', amount: 'To taste' }
    ],
    instructions: [
      'Add boiled drained chickpeas to a wide serving bowl.',
      'Add diced cucumbers, ripe cherry tomato halves, and thinly sliced red onions.',
      'Whisk extra virgin olive oil, fresh lemon juice, dried oregano, salt, and black pepper in a small cup.',
      'Drizzle dressing over the salad and toss gently to coat every chickpea.',
      'Scatter crumbled feta or fresh paneer cubes and chopped parsley over the top; serve cool.'
    ]
  },
  {
    id: 'tawa-chicken-tikka',
    name: 'Smoky Tawa Chicken Tikka Skewers',
    subtitle: 'Lean chicken breast cubes marinated in hung curd, Kashmiri chili, and kasuri methi, charred on skewers',
    image: '/assets/food/chicken-tikka-1.0.webp',
    calories: 510,
    protein: 54,
    carbs: 8,
    fats: 16,
    prepTimeMinutes: 20,
    category: 'High Protein',
    dietType: 'omnivore',
    tags: ['Ultra High Protein', 'Keto Clean', 'Omnivore', 'Post Workout', 'Gym Staple'],
    focusScore: '9.5/10',
    description:
      'The holy grail of clean Indian fitness nutrition. Massive 54g protein payload with virtually zero simple carbohydrates. Charred with tandoori spices and served with fresh mint and lemon for peak anabolic recovery.',
    ingredients: [
      { item: 'Boneless Chicken Breast (Cubed)', amount: '280g' },
      { item: 'Thick Hung Curd (Greek Yogurt or Strained Dahi)', amount: '3 tbsp' },
      { item: 'Ginger-Garlic Paste', amount: '1.5 tbsp' },
      { item: 'Kashmiri Red Chili, Garam Masala & Kasuri Methi', amount: '1 tbsp total' },
      { item: 'Diced Red Onion & Capsicum Squares', amount: '1/2 cup' },
      { item: 'Mustard Oil or Ghee', amount: '1 tsp' },
      { item: 'Lemon Wedges & Chaat Masala', amount: 'For finishing' }
    ],
    instructions: [
      'Whisk hung curd, ginger-garlic paste, mustard oil, Kashmiri chili, garam masala, crushed kasuri methi, and salt.',
      'Coat chicken cubes thoroughly in the marinade and let rest for 15 minutes (or overnight in fridge).',
      'Thread marinated chicken cubes onto skewers alternating with crunchy onion and capsicum squares.',
      'Heat a grill pan or cast-iron tawa on high heat with a brush of oil; sear skewers for 4 minutes per side until charred.',
      'Dust with tangy chaat masala, squeeze fresh lemon juice, and serve alongside fresh mint sprigs.'
    ]
  },
  {
    id: 'mediterranean-hummus-platter',
    name: 'Loaded Mediterranean Hummus & Spiced Chana Plate',
    subtitle: 'Silky whipped kabuli chana hummus with spiced roasted chickpeas, crisp cucumbers, and toasted roti triangles',
    image: '/assets/food/mediterranean-hummus-1.0.webp',
    calories: 460,
    protein: 22,
    carbs: 58,
    fats: 16,
    prepTimeMinutes: 15,
    category: 'Steady Carbs',
    dietType: 'vegan',
    tags: ['Plant Protein', 'Prebiotic Fiber', 'Vegan', 'Mediterranean', 'Slow Glycemic'],
    focusScore: '9.2/10',
    description:
      'Classic Levantine mezze made entirely with accessible kitchen staples. Kabuli chana blended with toasted white sesame (til) paste, garlic, and fresh lemon. Provides resilient prebiotic fiber and slow-burning carbs for steady mental clarity.',
    ingredients: [
      { item: 'Boiled Kabuli Chana (Chickpeas)', amount: '220g tender' },
      { item: 'Toasted White Sesame Paste (Homemade Tahini) or Cold-Pressed Til Oil', amount: '2 tbsp' },
      { item: 'Garlic Cloves & Fresh Lemon Juice', amount: '2 cloves + 2 tbsp lemon' },
      { item: 'Extra Virgin Olive Oil', amount: '1 tbsp' },
      { item: 'Roasted Cumin & Paprika', amount: '1/2 tsp each' },
      { item: 'Diced Cucumber, Tomato & Fresh Coriander', amount: '1/2 cup' },
      { item: 'Warm Whole Wheat Roti or Pita Triangles', amount: '1 bread' }
    ],
    instructions: [
      'Blend 180g boiled chickpeas with toasted sesame paste, garlic cloves, fresh lemon juice, cold water, and salt in a mixer until completely velvety and smooth.',
      'Toss remaining 40g chickpeas in a dry pan with a drop of oil, roasted cumin, paprika, and salt until lightly crispy.',
      'Spoon smooth hummus onto a wide plate, creating a swirl well with the back of a spoon.',
      'Drizzle extra virgin olive oil into the well, and scatter the warm spiced chickpeas, diced cucumber, tomatoes, and chopped coriander.',
      'Serve with warm whole wheat roti or toasted pita triangles for scooping.'
    ]
  },
  {
    id: 'japanese-sesame-tofu-stirfry',
    name: 'Crispy Sesame-Glazed Tofu & Broccoli Rice Bowl',
    subtitle: 'Golden pan-crisped soya tofu cubes and tender broccoli florets in a savory ginger-soy sesame glaze',
    image: '/assets/food/sesame-tofu-1.0.webp',
    calories: 480,
    protein: 32,
    carbs: 46,
    fats: 18,
    prepTimeMinutes: 18,
    category: 'High Protein',
    dietType: 'vegan',
    tags: ['High Plant Protein', 'Isoflavone Rich', 'Vegan', 'Japanese Style', 'Post Workout'],
    focusScore: '9.4/10',
    description:
      'High-yield plant protein powerhouse. Firm soya tofu cubes are pressed and pan-seared until crispy, then coated in a rich umami reduction of dark soy sauce, grated ginger, and toasted sesame seeds. Delivers complete branched-chain amino acids for lean muscle synthesis.',
    ingredients: [
      { item: 'Firm Soya Tofu (Pressed & Cubed)', amount: '240g' },
      { item: 'Fresh Broccoli Florets', amount: '150g' },
      { item: 'Dark Soy Sauce & Jaggery / Honey', amount: '2 tbsp soy + 1 tsp jaggery' },
      { item: 'Fresh Grated Ginger & Garlic', amount: '1 tbsp each' },
      { item: 'Cornstarch (Ararot)', amount: '1 tbsp' },
      { item: 'Til (Toasted White Sesame Seeds) & Sesame Oil', amount: '1 tbsp seeds + 1 tsp oil' },
      { item: 'Steamed Rice or Millets', amount: '100g cooked' }
    ],
    instructions: [
      'Pat tofu cubes dry with a towel, dust with 1 tbsp cornstarch and a pinch of salt for a crunchy crust.',
      'Heat 1 tsp oil in a tawa or wok; sear tofu cubes on medium-high until golden and crisp on all sides (about 6 minutes). Remove and set aside.',
      'In the same pan, flash-sear broccoli florets with a splash of water for 3 minutes until tender-crisp.',
      'Whisk dark soy sauce, grated ginger, minced garlic, 1 tsp jaggery powder, and 3 tbsp water; pour into pan and simmer for 1 minute until glossy.',
      'Toss crispy tofu back into the sauce, sprinkle generously with toasted white sesame seeds, and spoon over warm steamed rice.'
    ]
  },
  {
    id: 'mexican-chipotle-black-bean-bowl',
    name: 'Fiesta Black Bean & Sweet Corn Burrito Bowl',
    subtitle: 'Tender black beans (or rajma), charred sweet corn, fresh tomato salsa pico de gallo, and zesty lime',
    image: '/assets/food/mexican-black-bean-1.0.webp',
    calories: 490,
    protein: 24,
    carbs: 76,
    fats: 10,
    prepTimeMinutes: 15,
    category: 'Steady Carbs',
    dietType: 'vegan',
    tags: ['High Fiber', 'Glycogen Storage', 'Vegan', 'Mexican Style', 'Clean Fuel'],
    focusScore: '9.1/10',
    description:
      'A nutrient-dense Latin American favorite easily crafted with Indian pantry essentials. Black beans (or tender small Kashmiri rajma) provide deep antioxidant anthocyanins, resistant starch, and sustained glucose delivery. Fresh coriander, tomatoes, and lime juice optimize micronutrient absorption.',
    ingredients: [
      { item: 'Boiled Black Beans or Small Kashmiri Rajma', amount: '200g tender' },
      { item: 'Sweet Corn Kernels (Steamed or Charred)', amount: '80g' },
      { item: 'Cooked Basmati Rice or Brown Rice', amount: '120g' },
      { item: 'Fresh Diced Tomatoes, Onion & Green Chili (Pico de Gallo)', amount: '1 cup' },
      { item: 'Ground Cumin (Jeera Powder) & Oregano', amount: '1/2 tsp each' },
      { item: 'Fresh Lemon / Lime Juice & Rock Salt', amount: '1 whole lime + to taste' },
      { item: 'Fresh Coriander (Cilantro)', amount: 'Handful chopped' }
    ],
    instructions: [
      'In a warm skillet, toss boiled beans with cumin powder, red chili powder, oregano, and salt for 3 minutes until fragrant.',
      'Make quick pico de gallo salsa: toss diced tomatoes, finely chopped red onion, green chilies, coriander, salt, and fresh lime juice in a bowl.',
      'Layer warm cooked rice into a wide bowl as the base.',
      'Arrange seasoned black beans, golden sweet corn, and fresh tomato salsa in colorful distinct sections across the bowl.',
      'Finish with a generous squeeze of fresh lime juice and freshly cracked black pepper.'
    ]
  },
  {
    id: 'moroccan-spiced-lentil-tagine',
    name: 'Moroccan Spiced Red Lentil & Chickpea Tagine',
    subtitle: 'Rich masoor dal and kabuli chana simmered with warm cumin, cinnamon, carrots, and garden mint',
    image: '/assets/food/moroccan-lentil-1.0.webp',
    calories: 430,
    protein: 24,
    carbs: 68,
    fats: 8,
    prepTimeMinutes: 20,
    category: 'Steady Carbs',
    dietType: 'vegan',
    tags: ['High Iron', 'Gut Health', 'Vegan', 'North African', 'Comfort Food'],
    focusScore: '9.3/10',
    description:
      'Hearty spiced lentil and chickpea stew with cumin, cinnamon, and ginger for warming, slow-burning fuel.',
    ingredients: [
      { item: 'Whole Red Lentils (Sabut Masoor Dal)', amount: '80g dry' },
      { item: 'Boiled Kabuli Chana', amount: '100g' },
      { item: 'Diced Carrots & Tomato Puree', amount: '1 carrot + 1/2 cup puree' },
      { item: 'Cinnamon Stick (Dalchini) & Roasted Jeera Powder', amount: '1 small stick + 1 tsp jeera' },
      { item: 'Grated Ginger & Garlic', amount: '1 tbsp' },
      { item: 'Fresh Mint Leaves & Lemon Wedge', amount: 'Handful mint + 1 wedge' },
      { item: 'Cold-Pressed Olive Oil or Mustard Oil', amount: '1 tsp' }
    ],
    instructions: [
      'Rinse masoor dal; boil in 2 cups of water with a pinch of turmeric and salt until tender (about 12 minutes).',
      'In a saucepan, heat 1 tsp oil; temper cinnamon stick, minced garlic, and grated ginger until fragrant.',
      'Add tomato puree, roasted jeera powder, coriander powder, and diced carrots; cook 4 minutes until oil releases.',
      'Fold in the cooked lentils, boiled chickpeas, and 1/2 cup water; simmer on low heat for 6 minutes until thick and aromatic.',
      'Garnish with fresh mint leaves and a bright squeeze of lemon juice before serving warm.'
    ]
  },
  {
    id: 'thai-peanut-sesame-noodles',
    name: 'Thai Spicy Peanut & Sesame Noodle Bowl',
    subtitle: 'Rice noodles coated in a spicy roasted peanut-lime dressing with crisp purple cabbage, cucumber, and roasted peanuts',
    image: '/assets/food/thai-peanut-noodles-1.0.webp',
    calories: 470,
    protein: 19,
    carbs: 64,
    fats: 17,
    prepTimeMinutes: 12,
    category: 'Steady Carbs',
    dietType: 'vegan',
    tags: ['Plant Fats', 'Prebiotic Fiber', 'Vegan', 'Thai Style', 'Quick Fuel'],
    focusScore: '8.9/10',
    description:
      'Silky rice noodles tossed in an emulsified sauce of natural roasted ground peanuts, dark soy sauce, green chilies, and lime juice. Loaded with crunchy raw cabbage and cucumbers for enzymatic digestion and sustained daytime vitality.',
    ingredients: [
      { item: 'Rice Noodles or Whole Wheat Hakka Noodles', amount: '80g dry' },
      { item: '100% Roasted Peanut Butter (Unsweetened)', amount: '2 tbsp (32g)' },
      { item: 'Dark Soy Sauce & Fresh Lime Juice', amount: '1 tbsp each' },
      { item: 'Finely Minced Green Chili & Ginger', amount: '1 tsp each' },
      { item: 'Shredded Cabbage, Carrot & Cucumber Sticks', amount: '1.5 cups total' },
      { item: 'Crushed Roasted Peanuts & Coriander', amount: '1 tbsp for garnish' }
    ],
    instructions: [
      'Boil rice noodles in salted water for 4–5 minutes until al dente; rinse with cold water to halt cooking.',
      'In a small bowl, whisk peanut butter, soy sauce, lime juice, minced ginger, green chili, and 3 tbsp warm water into a glossy, pourable dressing.',
      'Place cooled noodles into a wide bowl; toss with shredded cabbage, carrot matchsticks, and cucumber ribbons.',
      'Pour the peanut sauce over the bowl and toss thoroughly until every noodle strand is coated.',
      'Garnish with crushed roasted peanuts and coriander sprigs; serve chilled or room temperature.'
    ]
  },
  {
    id: 'vietnamese-crispy-tofu-spring-rolls',
    name: 'Vietnamese Crispy Tofu Fresh Summer Rolls',
    subtitle: 'Translucent rice paper rolls filled with golden tofu batons, fresh mint, cucumber, and roasted peanut dipping sauce',
    image: '/assets/food/vietnamese-rolls-1.0.webp',
    calories: 420,
    protein: 26,
    carbs: 48,
    fats: 14,
    prepTimeMinutes: 16,
    category: 'High Protein',
    dietType: 'vegan',
    tags: ['Light & Refreshing', 'Gut Friendly', 'Vegan', 'Vietnamese', 'Hydrating'],
    focusScore: '9.2/10',
    description:
      'A fresh Vietnamese street staple. Crispy pan-seared tofu wrapped with fresh mint and hydrating cucumber in delicate rice paper. Paired with a warm peanut dipping sauce, offering high bioavailability protein with clean digestion and zero gut heaviness.',
    ingredients: [
      { item: 'Firm Soya Tofu (Sliced into Batons)', amount: '200g' },
      { item: 'Rice Paper Sheets (Easily Available Online / Supermarket)', amount: '4 sheets' },
      { item: 'Fresh Mint Leaves & Coriander', amount: 'Generous handful' },
      { item: 'Cucumber & Carrot Matchsticks', amount: '1 cup' },
      { item: 'Soy Sauce, Lemon Juice & Roasted Peanut Butter (for Dip)', amount: '2 tbsp peanut butter + 1 tbsp soy + lemon' },
      { item: 'Cold-Pressed Til Oil or Mustard Oil', amount: '1 tsp for pan' }
    ],
    instructions: [
      'Pan-sear tofu batons in 1 tsp oil with a splash of soy sauce on high heat until crisp and golden on all sides.',
      'Dip a rice paper sheet in a shallow bowl of warm water for 5 seconds until pliable, then lay flat on a clean board.',
      'Place fresh mint leaves, cucumber matchsticks, carrots, and 2 crispy tofu batons in the center.',
      'Fold bottom over fillings, tuck sides in, and roll tightly into a neat spring roll. Repeat for all 4 rolls.',
      'Whisk peanut butter, soy sauce, lime juice, a pinch of chili flakes, and warm water for the dipping sauce; serve fresh.'
    ]
  },
  {
    id: 'sizzling-chicken-fajita-platter',
    name: 'Sizzling Mexican Chicken & Pepper Fajitas',
    subtitle: 'Smoky spiced chicken breast strips seared on cast iron with crisp bell peppers, onions, and warm rotis',
    image: '/assets/food/chicken-fajitas-1.0.webp',
    calories: 520,
    protein: 52,
    carbs: 34,
    fats: 16,
    prepTimeMinutes: 18,
    category: 'High Protein',
    dietType: 'omnivore',
    tags: ['Massive Protein', 'Post Workout', 'Omnivore', 'Mexican Style', 'Gym Classic'],
    focusScore: '9.5/10',
    description:
      'High-protein Mexican staple using common Indian pantry spices. Lean chicken strips charred with ground cumin, coriander, red chili, and capsicum. High in vitamin C from bell peppers to aid iron absorption, providing an immense 52g protein payload for anabolic recovery.',
    ingredients: [
      { item: 'Boneless Chicken Breast (Cut into Strips)', amount: '260g' },
      { item: 'Sliced Bell Peppers (Green, Yellow, or Red)', amount: '1 large capsicum' },
      { item: 'Thinly Sliced Red Onion', amount: '1 medium onion' },
      { item: 'Ground Jeera, Coriander & Kashmiri Red Chili', amount: '1 tsp each' },
      { item: 'Minced Garlic & Fresh Lime Juice', amount: '1 tbsp garlic + 1 lime' },
      { item: 'Cooking Oil', amount: '1 tbsp' },
      { item: 'Warm Whole Wheat Rotis or Tortillas', amount: '2 rotis' }
    ],
    instructions: [
      'Toss chicken breast strips with jeera powder, coriander powder, Kashmiri chili, minced garlic, 1 tsp oil, and salt.',
      'Heat a cast-iron skillet or tawa on high heat until smoking hot; add chicken strips in a single layer and sear undisturbed for 3 minutes.',
      'Flip chicken, toss in sliced onions and bell peppers; stir-fry vigorously on high heat for 3–4 minutes until peppers blister and chicken is fully cooked.',
      'Squeeze fresh lime juice over the smoking skillet and remove from heat.',
      'Serve sizzling chicken and peppers wrapped inside warm whole wheat rotis.'
    ]
  },
  {
    id: 'greek-lemon-herb-salmon',
    name: 'Greek Lemon Herb Salmon & Warm Orzo',
    subtitle: 'Pan-seared crispy skin salmon fillet with fresh dill, lemon-herb orzo, and cool cucumber tzatziki',
    image: '/assets/food/greek-salmon-1.0.webp',
    calories: 540,
    protein: 46,
    carbs: 38,
    fats: 20,
    prepTimeMinutes: 16,
    category: 'High Protein',
    dietType: 'pescatarian',
    tags: ['Omega-3 Rich', 'High Protein', 'Pescatarian', 'Mediterranean', 'Post Workout'],
    focusScore: '9.5/10',
    description:
      'Restaurant-quality Mediterranean salmon dinner ready in under 20 minutes. High in EPA/DHA omega-3 fatty acids to lower neuroinflammation and boost afternoon cognitive stamina, paired with light orzo and cooling tzatziki.',
    ingredients: [
      { item: 'Wild-Caught Salmon Fillet (Skin-On)', amount: '220g' },
      { item: 'Orzo Pasta', amount: '60g dry' },
      { item: 'Greek Yogurt (0% or 2%)', amount: '3 tbsp' },
      { item: 'Grated English Cucumber & Garlic', amount: '1/4 cup + 1 clove minced' },
      { item: 'Fresh Dill & Lemon Juice', amount: '1 tbsp dill + 1/2 lemon' },
      { item: 'Extra Virgin Olive Oil & Sea Salt', amount: '1 tbsp + to taste' }
    ],
    instructions: [
      'Boil orzo in salted water for 8 minutes until al dente; drain and toss with 1 tsp olive oil, fresh dill, and lemon zest.',
      'Mix Greek yogurt, grated squeezed cucumber, minced garlic, lemon juice, and a pinch of salt for a quick tzatziki.',
      'Pat salmon skin dry with a paper towel and season flesh with sea salt and black pepper.',
      'Heat a skillet over medium-high with 1 tsp olive oil; place salmon skin-side down and press gently with a spatula for 4 minutes until skin is crackling crisp.',
      'Flip and cook for 2 more minutes until medium-rare to medium; serve hot over herb orzo with a dollop of tzatziki.'
    ]
  },
  {
    id: 'thai-red-coconut-curry-prawns',
    name: 'Creamy Thai Red Coconut Curry & Tiger Prawns',
    subtitle: 'Wild tiger prawns and tender bok choy simmered in aromatic lemongrass-coconut broth with jasmine rice',
    image: '/assets/food/thai-curry-1.0.webp',
    calories: 490,
    protein: 42,
    carbs: 44,
    fats: 16,
    prepTimeMinutes: 15,
    category: 'High Protein',
    dietType: 'pescatarian',
    tags: ['Lean Protein', 'Fast Prep', 'Pescatarian', 'Thai Bistro', 'Clean Fuel'],
    focusScore: '9.3/10',
    description:
      'Deceptively simple 15-minute bistro curry. Sautéing red curry paste in light coconut milk creates an intensely fragrant, velvety broth that gently poaches tiger prawns and bok choy for complete protein and zero heaviness.',
    ingredients: [
      { item: 'Peeled Wild Tiger Prawns', amount: '240g' },
      { item: 'Light Coconut Milk', amount: '180ml' },
      { item: 'Authentic Thai Red Curry Paste', amount: '1.5 tbsp' },
      { item: 'Baby Bok Choy (Halved)', amount: '2 heads' },
      { item: 'Steamed Jasmine Rice', amount: '120g cooked' },
      { item: 'Fish Sauce (or Tamari) & Lime Juice', amount: '1 tsp each' },
      { item: 'Fresh Cilantro & Red Chili Slices', amount: 'For garnish' }
    ],
    instructions: [
      'Heat 1 tbsp coconut milk in a pan over medium heat; fry red curry paste for 60 seconds until fragrant and oils split.',
      'Pour in remaining coconut milk, 1/4 cup water, and 1 tsp fish sauce; bring to a gentle simmer.',
      'Add halved baby bok choy and tiger prawns directly into the bubbling broth.',
      'Simmer gently for 3.5 to 4 minutes until prawns curl pink and bok choy stems turn tender.',
      'Remove from heat, stir in fresh lime juice, and ladle over steaming jasmine rice with fresh cilantro.'
    ]
  },
  {
    id: 'spanish-saffron-chicken-paella',
    name: 'Spanish Saffron & Smoked Paprika Chicken Skillet',
    subtitle: 'One-pan caramelized chicken and bomba rice infused with saffron, sweet peas, and smoked paprika',
    image: '/assets/food/spanish-paella-1.0.webp',
    calories: 530,
    protein: 44,
    carbs: 56,
    fats: 14,
    prepTimeMinutes: 24,
    category: 'Steady Carbs',
    dietType: 'omnivore',
    tags: ['One-Pan Wonder', 'High Protein', 'Omnivore', 'Spanish Style', 'Glycogen Reload'],
    focusScore: '9.2/10',
    description:
      'A simplified Spanish paella skillet delivering rich restaurant flavors in one pan. Saffron threads and smoked pimentón infuse the rice with deep aromatic compounds while pasture-raised chicken supplies dense amino acids.',
    ingredients: [
      { item: 'Boneless Skinless Chicken Thighs (Cubed)', amount: '240g' },
      { item: 'Short-Grain Paella / Bomba Rice', amount: '70g dry' },
      { item: 'Sweet Green Peas & Red Bell Pepper Strips', amount: '1/2 cup' },
      { item: 'Chicken Broth & Saffron Threads', amount: '1.5 cups broth + pinch saffron' },
      { item: 'Smoked Spanish Paprika & Garlic', amount: '1 tsp paprika + 2 cloves minced' },
      { item: 'Olive Oil & Fresh Lemon Wedges', amount: '1 tbsp + 2 wedges' }
    ],
    instructions: [
      'Heat olive oil in a wide heavy skillet; sear chicken cubes with smoked paprika and salt for 4 minutes until golden.',
      'Push chicken aside, add minced garlic and bell pepper strips; sauté for 1 minute.',
      'Stir in dry rice, coating the grains in flavorful pan oils for 60 seconds.',
      'Pour in warm chicken broth with saffron threads; stir once, distribute chicken and sweet peas evenly.',
      'Simmer on medium-low undisturbed for 14 minutes until liquid is absorbed and a light crispy crust (socarrat) forms at bottom. Rest 3 mins and serve with lemon.'
    ]
  },
  {
    id: 'mediterranean-halloumi-shakshuka',
    name: 'Skillet Shakshuka with Golden Halloumi & Runny Yolks',
    subtitle: 'Pasture-raised eggs poached in rich tomato-bell pepper reduction with seared halloumi cheese cubes',
    image: '/assets/food/halloumi-shakshuka-1.0.webp',
    calories: 470,
    protein: 30,
    carbs: 24,
    fats: 28,
    prepTimeMinutes: 14,
    category: 'Quick Fuel',
    dietType: 'vegetarian',
    tags: ['Choline Rich', 'High Calcium', 'Vegetarian', 'Fast Prep', 'Mediterranean'],
    focusScore: '9.4/10',
    description:
      'Middle Eastern brunch classic elevated with crispy golden halloumi cheese. Rich in dietary choline, lycopene, and calcium. The runny egg yolks blend with roasted tomato juices for a deeply satisfying, low-glycemic fuel meal.',
    ingredients: [
      { item: 'Farm-Fresh Large Eggs', amount: '3 whole' },
      { item: 'Halloumi Cheese or Firm Paneer (Cubed)', amount: '80g' },
      { item: 'Crushed San Marzano Tomatoes / Tomato Puree', amount: '1 cup' },
      { item: 'Sweet Red Bell Pepper & Onion', amount: '1/2 cup finely diced' },
      { item: 'Ground Cumin, Smoked Paprika & Garlic', amount: '1 tbsp spice blend' },
      { item: 'Olive Oil & Fresh Cilantro / Parsley', amount: '1 tbsp + handful herbs' }
    ],
    instructions: [
      'Heat 1 tsp olive oil in a skillet; sear halloumi cubes for 2 minutes per side until golden brown and crispy; set aside.',
      'In the same pan, sauté diced onion, bell pepper, and garlic with cumin and smoked paprika for 3 minutes.',
      'Pour in crushed tomatoes and simmer on medium heat for 4 minutes until thickened.',
      'Make 3 wells in sauce, crack in eggs, and scatter golden halloumi cubes around the pan.',
      'Cover and cook on low heat for 3–4 minutes until whites are set and yolks remain molten. Garnish with fresh herbs.'
    ]
  },
  {
    id: 'japanese-teriyaki-chicken-donburi',
    name: 'Glazed Teriyaki Chicken Donburi with Edamame',
    subtitle: 'Pan-caramelized chicken thigh slices in sweet ginger-soy glaze over steamed rice with sweet edamame',
    image: '/assets/food/teriyaki-chicken-1.0.webp',
    calories: 540,
    protein: 48,
    carbs: 52,
    fats: 14,
    prepTimeMinutes: 16,
    category: 'High Protein',
    dietType: 'omnivore',
    tags: ['High Protein', 'Japanese Bistro', 'Omnivore', 'Post Workout', 'Gym Favorite'],
    focusScore: '9.5/10',
    description:
      'Japanese izakaya favorite made in 15 minutes. High-protein chicken thighs seared crisp and glazed in a simple 3-ingredient soy, ginger, and honey reduction over short-grain rice with steamed edamame.',
    ingredients: [
      { item: 'Boneless Skinless Chicken Thighs', amount: '260g' },
      { item: 'Steamed Short-Grain White or Brown Rice', amount: '140g cooked' },
      { item: 'Shelled Edamame Beans', amount: '60g steamed' },
      { item: 'Tamari / Soy Sauce & Honey', amount: '2 tbsp soy + 1 tbsp honey' },
      { item: 'Freshly Grated Ginger & Garlic', amount: '1 tsp each' },
      { item: 'Toasted White Sesame Seeds & Sliced Scallions', amount: '1 tbsp each' }
    ],
    instructions: [
      'Season chicken thighs with a pinch of sea salt and sear in a hot skillet for 4–5 minutes per side until deeply browned and cooked through.',
      'Whisk soy sauce, honey, grated ginger, and minced garlic with 2 tbsp water.',
      'Pour sauce directly into the hot pan around chicken; simmer vigorously for 90 seconds until sauce reduces to a glossy, bubbling lacquer.',
      'Transfer chicken to a cutting board and slice into neat strips.',
      'Ladle warm rice into a bowl, arrange sliced glazed chicken and bright green edamame side-by-side, drizzle residual pan glaze, and scatter sesame and scallions.'
    ]
  },
  {
    id: 'moroccan-chermoula-fish-fillet',
    name: 'Moroccan Chermoula Seared White Fish & Couscous',
    subtitle: 'Tender golden sea bass fillet drizzled with zesty cilantro-garlic chermoula over lemon herb couscous',
    image: '/assets/food/chermoula-fish-1.0.webp',
    calories: 430,
    protein: 40,
    carbs: 42,
    fats: 10,
    prepTimeMinutes: 12,
    category: 'Quick Fuel',
    dietType: 'pescatarian',
    tags: ['Ultra Fast Prep', 'Clean Protein', 'Pescatarian', 'Mediterranean', 'Polyphenol Rich'],
    focusScore: '9.3/10',
    description:
      'The fastest gourmet fish dinner in modern cooking. Fluffy couscous steams in 5 minutes with boiling water while tender white fish pan-sears in 5 minutes and is blanketed in fresh Moroccan herb chermoula.',
    ingredients: [
      { item: 'White Fish Fillet (Sea Bass, Cod, or Tilapia)', amount: '220g' },
      { item: 'Instant Semolina Couscous', amount: '60g dry' },
      { item: 'Fresh Cilantro & Parsley (Finely Chopped)', amount: '1/2 cup total' },
      { item: 'Garlic Cloves, Ground Cumin & Paprika', amount: '2 cloves + 1/2 tsp each' },
      { item: 'Extra Virgin Olive Oil & Fresh Lemon Juice', amount: '1.5 tbsp oil + 1 tbsp lemon' },
      { item: 'Sea Salt & Cracked Pepper', amount: 'To taste' }
    ],
    instructions: [
      'Place couscous in a bowl with a pinch of salt; pour 90ml boiling water, cover with a plate, and let steam for 5 minutes. Fluff with a fork and lemon zest.',
      'Make quick chermoula: stir chopped cilantro, parsley, minced garlic, cumin, paprika, olive oil, lemon juice, and sea salt in a small cup.',
      'Season fish fillet with salt and pepper; sear in a hot skillet with 1 tsp oil for 2.5 minutes per side until golden and flaky.',
      'Spoon warm couscous onto a plate and set seared fish fillet on top.',
      'Spoon generous spoonfuls of vibrant green chermoula over the warm fish and serve with lemon wedges.'
    ]
  },
  {
    id: 'tuscan-garlic-rosemary-steak',
    name: 'Tuscan Garlic Rosemary Steak & Crisp Potatoes',
    subtitle: 'Cast-iron seared ribeye steak basted with rosemary garlic butter served with golden roasted baby potatoes',
    image: '/assets/food/tuscan-steak-1.0.webp',
    calories: 580,
    protein: 50,
    carbs: 32,
    fats: 26,
    prepTimeMinutes: 18,
    category: 'High Protein',
    dietType: 'omnivore',
    tags: ['High Bioavailability Iron', 'Massive Protein', 'Omnivore', 'Italian Classic', 'Post Workout'],
    focusScore: '9.6/10',
    description:
      'Italian steakhouse perfection recreated on home stovetops. Lean tender beef steak seared in cast iron with crushed garlic and rosemary-infused butter, delivering heme iron, creatine, and 50g complete protein.',
    ingredients: [
      { item: 'Lean Sirloin or Ribeye Steak', amount: '250g' },
      { item: 'Pre-Boiled Baby Potatoes (Halved)', amount: '140g' },
      { item: 'Fresh Rosemary Sprigs & Garlic Cloves', amount: '2 sprigs + 3 cloves crushed' },
      { item: 'Grass-Fed Butter or Ghee', amount: '1 tbsp' },
      { item: 'Flaky Sea Salt & Coarse Black Pepper', amount: '1 tsp' },
      { item: 'Aged Balsamic Drizzle (Optional)', amount: '1 tsp' }
    ],
    instructions: [
      'Pat steak completely dry and season generously with flaky sea salt and coarse black pepper.',
      'Heat a cast-iron skillet on high until smoking; add 1 tsp oil and lay steak down to sear for 3 minutes.',
      'Flip steak; drop butter, crushed garlic, and rosemary sprigs into the hot pan.',
      'Tilt pan and continuously spoon bubbling aromatic herb butter over the steak for 2 minutes for medium-rare.',
      'In the same pan, toss halved baby potatoes in the remaining beef juices for 2 minutes until crispy; rest steak 5 minutes, slice across the grain, and serve.'
    ]
  },
  {
    id: 'greek-lemon-chicken-souvlaki',
    name: 'Greek Lemon Chicken Souvlaki & Tzatziki Plate',
    subtitle: 'Charred lemon-oregano chicken skewers with warm toasted pita triangles, tomato cucumber salad, and tzatziki',
    image: '/assets/food/chicken-souvlaki-1.0.webp',
    calories: 510,
    protein: 48,
    carbs: 36,
    fats: 18,
    prepTimeMinutes: 16,
    category: 'High Protein',
    dietType: 'omnivore',
    tags: ['High Protein', 'Mediterranean', 'Omnivore', 'Clean Energy', 'Post Workout'],
    focusScore: '9.4/10',
    description:
      'Classic Greek street food optimized for high protein and anti-inflammatory balance. Lean chicken breast cubes marinated in lemon, oregano, and garlic, seared on skewers and served with cool tzatziki and crisp salad.',
    ingredients: [
      { item: 'Boneless Chicken Breast (Cubed)', amount: '250g' },
      { item: 'Dried Greek Oregano, Garlic & Lemon Juice', amount: '1 tbsp oregano + 2 cloves + 1 lemon' },
      { item: 'Greek Yogurt Cucumber Tzatziki', amount: '3 tbsp' },
      { item: 'Diced Cucumber, Tomato & Kalamata Olives', amount: '1 cup' },
      { item: 'Whole Wheat Pita Bread', amount: '1 pita cut into triangles' },
      { item: 'Olive Oil & Sea Salt', amount: '1 tbsp + to taste' }
    ],
    instructions: [
      'Toss chicken cubes in olive oil, lemon juice, dried oregano, minced garlic, and sea salt.',
      'Thread chicken onto 2 skewers and sear in a screaming-hot grill pan or cast iron for 3.5 minutes per side until charred.',
      'Toast pita triangles in the pan for 60 seconds until warm and pliable.',
      'Toss cucumber, tomato, and olives with a drop of olive oil and pinch of oregano.',
      'Arrange skewers on a wide plate alongside warm pita triangles, crisp salad, and a ramekin of chilled tzatziki.'
    ]
  },
  {
    id: 'korean-crispy-tofu-bibimbap',
    name: 'Korean Crispy Tofu & Sesame Bibimbap',
    subtitle: 'Steamed short-grain rice topped with golden tofu cubes, seasoned spinach, kimchi, and a sunny egg',
    image: '/assets/food/korean-bibimbap-1.0.webp',
    calories: 510,
    protein: 28,
    carbs: 62,
    fats: 16,
    prepTimeMinutes: 14,
    category: 'Steady Carbs',
    dietType: 'vegetarian',
    tags: ['Probiotic Kimchi', 'Plant & Egg Protein', 'Vegetarian', 'Korean Style', 'Gut Health'],
    focusScore: '9.2/10',
    description:
      'Vibrant Korean staple engineered for gut microbiome biodiversity and steady glucose delivery. Pan-crisped tofu cubes and a runny pasture-raised egg provide complete proteins over warm rice with probiotic kimchi.',
    ingredients: [
      { item: 'Firm Soya Tofu (Cubed & Pressed)', amount: '180g' },
      { item: 'Steamed Short-Grain Rice', amount: '150g cooked' },
      { item: 'Farm-Fresh Egg', amount: '1 sunny-side up' },
      { item: 'Traditional Fermented Kimchi', amount: '60g' },
      { item: 'Blanched Sesame Spinach & Grated Carrots', amount: '1 cup total' },
      { item: 'Gochujang / Tamari & Toasted Sesame Oil', amount: '1 tbsp each' }
    ],
    instructions: [
      'Pan-sear tofu cubes in 1 tsp sesame oil on medium-high for 5 minutes until crispy on all edges.',
      'Quickly flash-fry an egg sunny-side up until white is set but yolk remains liquid.',
      'Layer warm steamed rice into the bottom of a wide ceramic bowl.',
      'Arrange crispy tofu, fermented kimchi, blanched sesame spinach, and carrots in distinct colorful sections over rice.',
      'Place the sunny-side-up egg in the center, drizzle with sesame oil and gochujang, and mix thoroughly before eating.'
    ]
  },
  {
    id: 'chimichurri-flank-steak',
    name: 'Seared Flank Steak with Herb Chimichurri',
    subtitle: 'Charred lean flank steak slices drizzled with zesty parsley-oregano chimichurri and sweet potato wedges',
    image: '/assets/food/steak-chimichurri-1.0.webp',
    calories: 550,
    protein: 52,
    carbs: 34,
    fats: 20,
    prepTimeMinutes: 18,
    category: 'High Protein',
    dietType: 'omnivore',
    tags: ['Massive Protein', 'Heme Iron', 'Omnivore', 'Argentine Grill', 'Post Workout'],
    focusScore: '9.6/10',
    description:
      'Argentine steakhouse staple prepared with lean flank steak and fresh uncooked herb chimichurri. Loaded with bioavailable iron, B-vitamins, and polyphenols to drive swift recovery without heavy digestion.',
    ingredients: [
      { item: 'Lean Flank or Skirt Steak', amount: '260g' },
      { item: 'Roasted Sweet Potato Wedges', amount: '130g' },
      { item: 'Fresh Flat-Leaf Parsley & Oregano', amount: '1/2 cup finely chopped' },
      { item: 'Garlic Cloves & Red Wine Vinegar', amount: '2 cloves minced + 1 tbsp vinegar' },
      { item: 'Extra Virgin Olive Oil & Red Chili Flakes', amount: '1.5 tbsp oil + 1/2 tsp chili' },
      { item: 'Sea Salt & Black Pepper', amount: 'To taste' }
    ],
    instructions: [
      'Whisk chopped parsley, oregano, minced garlic, red wine vinegar, olive oil, chili flakes, and sea salt into a punchy chimichurri sauce.',
      'Heat a cast-iron skillet on high heat; season flank steak with salt and pepper.',
      'Sear steak for 3.5 minutes per side for a deep crust and juicy medium center.',
      'Transfer steak to a cutting board and allow to rest for 5 minutes so juices redistribute.',
      'Slice thinly across the grain at a 45-degree angle; fan across plate with roasted sweet potato wedges and drizzle chimichurri generously.'
    ]
  }
];
