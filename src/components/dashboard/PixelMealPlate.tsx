'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';

interface PixelMealPlateProps {
  mealName: string;
  size?: number;
  className?: string;
}

export function PixelMealPlate({
  mealName,
  size = 40,
  className = '',
}: PixelMealPlateProps) {
  const normalized = (mealName || '').toLowerCase().trim();

  // Intelligent fuzzy lookup to genuine 16-bit handcrafted food sprites
  const spriteSrc = useMemo(() => {
    if (!normalized) return '/assets/food/generic-plate.png';

    if (normalized.includes('avocado') || normalized.includes('toast') || normalized.includes('sourdough')) {
      return '/assets/food/avocado-toast-1.0.png';
    }
    if (normalized.includes('salmon') || normalized.includes('fish') || normalized.includes('tuna')) {
      return '/assets/food/greek-salmon-1.0.png';
    }
    if (normalized.includes('prawn') || normalized.includes('shrimp') || normalized.includes('seafood')) {
      return '/assets/food/prawn-linguine-1.0.png';
    }
    if (normalized.includes('steak') || normalized.includes('beef') || normalized.includes('meat') || normalized.includes('burger')) {
      return '/assets/food/steak-chimichurri-1.0.png';
    }
    if (normalized.includes('egg') || normalized.includes('scramble') || normalized.includes('omelet')) {
      return '/assets/food/skillet-eggs-1.0.png';
    }
    if (normalized.includes('chicken') || normalized.includes('poultry') || normalized.includes('turkey')) {
      return '/assets/food/grilled-chicken-1.0.png';
    }
    if (normalized.includes('curry') || normalized.includes('tikka')) {
      return '/assets/food/chicken-curry-1.0.png';
    }
    if (normalized.includes('paneer') || normalized.includes('cottage') || normalized.includes('cheese')) {
      return '/assets/food/paneer-bhurji-1.0.png';
    }
    if (normalized.includes('rice') || normalized.includes('biryani') || normalized.includes('pulao')) {
      return '/assets/food/egg-fried-rice-1.0.png';
    }
    if (normalized.includes('pasta') || normalized.includes('noodle') || normalized.includes('spaghetti')) {
      return '/assets/food/pasta-1.0.png';
    }
    if (normalized.includes('taco') || normalized.includes('burrito') || normalized.includes('mexican')) {
      return '/assets/food/taco-bowl-1.0.png';
    }
    if (normalized.includes('salad') || normalized.includes('chickpea') || normalized.includes('greens') || normalized.includes('hummus')) {
      return '/assets/food/chickpea-salad-1.0.png';
    }
    if (normalized.includes('oat') || normalized.includes('porridge') || normalized.includes('peanut')) {
      return '/assets/food/peanut-butter-oats-1.0.png';
    }
    if (normalized.includes('balanced') || normalized.includes('plate') || normalized.includes('grain')) {
      return '/assets/food/grain-bowl-1.0.png';
    }
    if (normalized.includes('anchor') || normalized.includes('protein')) {
      return '/assets/food/grilled-chicken-1.0.png';
    }

    return '/assets/food/generic-plate.png';
  }, [normalized]);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-lg overflow-hidden select-none ${className}`}
      style={{ width: size, height: size }}
      title={mealName || 'Fuel Plate'}
    >
      <Image
        src={spriteSrc}
        alt={mealName || 'Food Sprite'}
        width={size}
        height={size}
        className="w-full h-full object-contain filter drop-shadow-xs"
        style={{ imageRendering: 'pixelated' }}
        unoptimized
      />
    </div>
  );
}
