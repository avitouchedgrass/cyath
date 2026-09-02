'use client';

import React, { useState } from 'react';
import { Recipe } from '@/lib/recipes';
import { retroAudio } from '@/lib/retroAudio';

interface CustomRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecipe: (recipe: Recipe) => void;
  initialRecipe?: Recipe | null;
}

const CATEGORY_OPTIONS: Recipe['category'][] = [
  'High Protein',
  'Steady Carbs',
  'Quick Fuel',
  'Keto Clean',
  'Post Workout',
];

const DIET_OPTIONS: Recipe['dietType'][] = [
  'vegetarian',
  'eggetarian',
  'vegan',
  'pescatarian',
  'omnivore',
];

const DEFAULT_PLATES = [
  { label: 'Grilled Chicken', url: '/assets/food/grilled-chicken-1.0.png' },
  { label: 'Egg Rice Bowl', url: '/assets/food/egg-rice-bowl-1.0.png' },
  { label: 'Ancient Grain', url: '/assets/food/grain-bowl-1.0.png' },
  { label: 'Rajma Chawal', url: '/assets/food/rajma-chawal-1.0.png' },
  { label: 'Paneer Bhurji', url: '/assets/food/paneer-bhurji-1.0.png' },
  { label: 'Tariwala Chicken', url: '/assets/food/chicken-curry-1.0.png' },
  { label: 'Soya Pulao', url: '/assets/food/soya-pulao-1.0.png' },
  { label: 'Halloumi Shakshuka', url: '/assets/food/halloumi-shakshuka-1.0.png' },
  { label: 'Paneer Roll', url: '/assets/food/paneer-kathi-roll-1.0.png' },
  { label: 'Egg Fried Rice', url: '/assets/food/egg-fried-rice-1.0.png' },
  { label: 'Curd Rice', url: '/assets/food/curd-rice-1.0.png' },
  { label: 'Chicken Tikka', url: '/assets/food/chicken-tikka-1.0.png' },
];

export function CustomRecipeModal({ isOpen, onClose, onSaveRecipe, initialRecipe }: CustomRecipeModalProps) {
  const [name, setName] = useState(initialRecipe?.name || '');
  const [subtitle, setSubtitle] = useState(initialRecipe?.subtitle || '');
  const [category, setCategory] = useState<Recipe['category']>(initialRecipe?.category || 'High Protein');
  const [dietType, setDietType] = useState<Recipe['dietType']>(initialRecipe?.dietType || 'vegetarian');
  const [calories, setCalories] = useState<number>(initialRecipe?.calories || 480);
  const [protein, setProtein] = useState<number>(initialRecipe?.protein || 32);
  const [carbs, setCarbs] = useState<number>(initialRecipe?.carbs || 45);
  const [fats, setFats] = useState<number>(initialRecipe?.fats || 14);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number>(initialRecipe?.prepTimeMinutes || 20);
  const [focusScore, setFocusScore] = useState(initialRecipe?.focusScore || '9.1/10');
  const [selectedImage, setSelectedImage] = useState(initialRecipe?.image || DEFAULT_PLATES[0].url);

  // Ingredients and Instructions state
  const [ingredientList, setIngredientList] = useState<{ item: string; amount: string }[]>(
    initialRecipe?.ingredients || [
      { item: 'Main Protein / Base', amount: '180g' },
      { item: 'Whole Grain or Veggies', amount: '120g' },
      { item: 'Olive Oil / Spices', amount: '1 tbsp' },
    ]
  );

  const [instructionsText, setInstructionsText] = useState<string>(
    initialRecipe?.instructions.join('\n') ||
      'Prepare ingredients and heat pan over medium heat.\nSear or sauté main protein with spices.\nAssemble on plate and serve hot.'
  );

  if (!isOpen) return null;

  const handleAddIngredient = () => {
    setIngredientList([...ingredientList, { item: '', amount: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredientList(ingredientList.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: 'item' | 'amount', value: string) => {
    const next = [...ingredientList];
    next[index][field] = value;
    setIngredientList(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const instructionsArray = instructionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const validIngredients = ingredientList.filter((ing) => ing.item.trim().length > 0);

    const finalRecipe: Recipe = {
      id: initialRecipe?.id || `custom-${Date.now()}`,
      name: name.trim(),
      subtitle: subtitle.trim() || 'Custom created recipe',
      image: selectedImage,
      calories: Number(calories) || 500,
      protein: Number(protein) || 30,
      carbs: Number(carbs) || 40,
      fats: Number(fats) || 15,
      prepTimeMinutes: Number(prepTimeMinutes) || 20,
      category,
      dietType,
      tags: ['Custom', category, dietType.charAt(0).toUpperCase() + dietType.slice(1)],
      focusScore,
      description: `Custom home-cooked ${name.trim()} calibrated for clean energy and steady satiety.`,
      ingredients: validIngredients.length > 0 ? validIngredients : [{ item: 'Plate Ingredients', amount: '1 serving' }],
      instructions: instructionsArray.length > 0 ? instructionsArray : ['Prepare and serve warm.'],
      isCustom: true,
    };

    retroAudio.playInspectConfirm();
    onSaveRecipe(finalRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-[#1A3629]/70 backdrop-blur-md animate-[fadeScale_0.25s_ease-out]">
      <div className="relative w-full max-w-2xl bg-[#FFFDF9] border-3 border-[#1A3629] rounded-t-3xl sm:rounded-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.25)] sm:shadow-[8px_8px_0px_#1A3629] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden w-12 h-1.5 bg-[#1A3629]/25 rounded-full mx-auto mt-2 -mb-1 shrink-0" />

        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b-2 border-[#1A3629] bg-[#FAF6EE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-fraunces font-black text-xl text-[#1A3629]">
              {initialRecipe ? 'Edit Custom Recipe' : 'Add Custom Recipe'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] font-mono text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center cursor-pointer shadow-[1px_1px_0px_#1A3629]"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* Name & Subtitle */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629] mb-1">
                Dish Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Garlic Butter Paneer Scramble"
                className="w-full px-3.5 py-2 rounded-xl border-2 border-[#1A3629] bg-[#FAF6EE]/50 font-cabinet font-bold text-sm text-[#1A3629] outline-none focus:bg-[#FFFDF9]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629] mb-1">
                Short Description / Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. High protein breakfast with green peppers and warm roti"
                className="w-full px-3.5 py-2 rounded-xl border-2 border-[#1A3629] bg-[#FAF6EE]/50 font-cabinet font-medium text-xs text-[#1A3629] outline-none focus:bg-[#FFFDF9]"
              />
            </div>
          </div>

          {/* Category & Diet Dropdowns */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Recipe['category'])}
                className="w-full px-3 py-2 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] font-mono text-xs font-bold text-[#1A3629] outline-none"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629] mb-1">
                Dietary Style
              </label>
              <select
                value={dietType}
                onChange={(e) => setDietType(e.target.value as Recipe['dietType'])}
                className="w-full px-3 py-2 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] font-mono text-xs font-bold text-[#1A3629] outline-none capitalize"
              >
                {DIET_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Macros Row */}
          <div className="grid grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629] mb-1 text-center">
                Protein (g)
              </label>
              <input
                type="number"
                min="0"
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                className="w-full text-center py-2 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] font-mono font-bold text-sm text-[#1A3629] outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629] mb-1 text-center">
                Calories
              </label>
              <input
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-full text-center py-2 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] font-mono font-bold text-sm text-[#1A3629] outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629] mb-1 text-center">
                Carbs (g)
              </label>
              <input
                type="number"
                min="0"
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                className="w-full text-center py-2 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] font-mono font-bold text-sm text-[#1A3629] outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629] mb-1 text-center">
                Fats (g)
              </label>
              <input
                type="number"
                min="0"
                value={fats}
                onChange={(e) => setFats(Number(e.target.value))}
                className="w-full text-center py-2 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] font-mono font-bold text-sm text-[#1A3629] outline-none"
              />
            </div>
          </div>

          {/* Plate Image Selector */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629] mb-2">
              Choose Plate Visual Sprite
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {DEFAULT_PLATES.map((p) => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => setSelectedImage(p.url)}
                  className={`p-2 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    selectedImage === p.url
                      ? 'border-[#1A3629] bg-[#FAF6EE] shadow-[2px_2px_0px_#1A3629] -translate-y-0.5'
                      : 'border-[#1A3629]/20 hover:border-[#1A3629] bg-[#FFFDF9]'
                  }`}
                >
                  <img
                    src={p.url}
                    alt={p.label}
                    className="w-12 h-12 object-contain [image-rendering:pixelated]"
                  />
                  <span className="text-[9px] font-mono font-bold text-[#1A3629] truncate w-full text-center">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="p-4 rounded-xl border-2 border-[#1A3629]/20 bg-[#FAF6EE] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629]">
                Ingredients & Amounts
              </span>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="text-[10px] font-mono font-bold text-[#10B981] hover:underline cursor-pointer"
              >
                + Add Item
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {ingredientList.map((ing, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ingredient item"
                    value={ing.item}
                    onChange={(e) => handleIngredientChange(i, 'item', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#1A3629] bg-[#FFFDF9] font-mono text-xs text-[#1A3629] outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Amount (e.g. 150g)"
                    value={ing.amount}
                    onChange={(e) => handleIngredientChange(i, 'amount', e.target.value)}
                    className="w-28 px-3 py-1.5 rounded-lg border border-[#1A3629] bg-[#FFFDF9] font-mono text-xs text-[#1A3629] outline-none"
                  />
                  {ingredientList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(i)}
                      className="text-xs font-mono font-bold text-red-600 hover:text-red-800 p-1 cursor-pointer"
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions Section */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629] mb-1">
              Instructions (One per line)
            </label>
            <textarea
              rows={3}
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] font-mono text-xs text-[#1A3629] outline-none leading-relaxed"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs hover:bg-[#FAF6EE] cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[3px_3px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>✓ Save Custom Recipe</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
