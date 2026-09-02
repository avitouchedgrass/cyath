'use client';

// Client-side Retro 16-bit Canvas Image Processor for Custom Recipes

export type PhotoStyleMode = 'pixel_plate' | 'matched_sprite' | 'retro_frame';

export const SPRITE_OPTIONS = [
  { id: 'rajma-chawal', name: 'Rajma Chawal', url: '/assets/food/rajma-chawal-1.0.png' },
  { id: 'paneer-bhurji', name: 'Paneer Bhurji', url: '/assets/food/paneer-bhurji-1.0.png' },
  { id: 'chicken-curry', name: 'Chicken Curry', url: '/assets/food/chicken-curry-1.0.png' },
  { id: 'egg-curry', name: 'Egg Curry', url: '/assets/food/egg-curry-1.0.png' },
  { id: 'moong-khichdi', name: 'Moong Khichdi', url: '/assets/food/moong-khichdi-1.0.png' },
  { id: 'soya-pulao', name: 'Soya Matar Pulao', url: '/assets/food/soya-pulao-1.0.png' },
  { id: 'desi-shakshuka', name: 'Desi Shakshuka', url: '/assets/food/desi-shakshuka-1.0.png' },
  { id: 'paneer-kathi-roll', name: 'Paneer Kathi Roll', url: '/assets/food/paneer-kathi-roll-1.0.png' },
  { id: 'egg-fried-rice', name: 'Egg Fried Rice', url: '/assets/food/egg-fried-rice-1.0.png' },
  { id: 'curd-rice', name: 'Tempered Curd Rice', url: '/assets/food/curd-rice-1.0.png' },
  { id: 'masala-oats', name: 'Savory Masala Oats', url: '/assets/food/masala-oats-1.0.png' },
  { id: 'pepper-chicken', name: 'Pepper Chicken Roast', url: '/assets/food/pepper-chicken-1.0.png' },
  { id: 'besan-chilla', name: 'Paneer Besan Chilla', url: '/assets/food/besan-chilla-1.0.png' },
  { id: 'kala-chana', name: 'Kala Chana Sundal', url: '/assets/food/kala-chana-1.0.png' },
  { id: 'peanut-butter-oats', name: 'Peanut Butter Oats', url: '/assets/food/peanut-butter-oats-1.0.png' },
  { id: 'masala-french-toast', name: 'Masala French Toast', url: '/assets/food/masala-french-toast-1.0.png' },
  { id: 'chickpea-salad', name: 'Mediterranean Chickpea Salad', url: '/assets/food/chickpea-salad-1.0.png' },
  { id: 'chicken-tikka', name: 'Tawa Chicken Tikka', url: '/assets/food/chicken-tikka-1.0.png' },
  { id: 'grilled-chicken', name: 'Grilled Chicken', url: '/assets/food/grilled-chicken-1.0.png' },
  { id: 'grain-bowl', name: 'Ancient Grain Bowl', url: '/assets/food/grain-bowl-1.0.png' },
  { id: 'egg-rice-bowl', name: 'Egg Rice Bowl', url: '/assets/food/egg-rice-bowl-1.0.png' },
  { id: 'taco-bowl', name: 'Taco Fiesta Bowl', url: '/assets/food/taco-bowl-1.0.png' },
  { id: 'prawn-linguine', name: 'Prawn Linguine', url: '/assets/food/prawn-linguine-1.0.png' },
  { id: 'avocado-toast', name: 'Avocado Toast', url: '/assets/food/avocado-toast-1.0.png' },
  { id: 'pasta', name: 'Herb Basil Pasta', url: '/assets/food/pasta-1.0.png' },
  { id: 'skillet-eggs', name: 'Skillet Eggs', url: '/assets/food/skillet-eggs-1.0.png' },
];

export function getBestMatchingSprite(name: string, category: string, dietType: string): string {
  const query = `${name} ${category} ${dietType}`.toLowerCase();

  if (query.includes('salmon') || query.includes('orzo')) {
    return '/assets/food/greek-salmon-1.0.png';
  }
  if (query.includes('thai') || (query.includes('curry') && query.includes('coconut'))) {
    return '/assets/food/thai-curry-1.0.png';
  }
  if (query.includes('paella') || query.includes('saffron')) {
    return '/assets/food/spanish-paella-1.0.png';
  }
  if (query.includes('halloumi')) {
    return '/assets/food/halloumi-shakshuka-1.0.png';
  }
  if (query.includes('teriyaki') || query.includes('donburi')) {
    return '/assets/food/teriyaki-chicken-1.0.png';
  }
  if (query.includes('chermoula') || query.includes('couscous')) {
    return '/assets/food/chermoula-fish-1.0.png';
  }
  if (query.includes('steak') || query.includes('chimichurri') || query.includes('ribeye') || query.includes('sirloin')) {
    return '/assets/food/tuscan-steak-1.0.png';
  }
  if (query.includes('souvlaki') || query.includes('gyro') || query.includes('tzatziki')) {
    return '/assets/food/chicken-souvlaki-1.0.png';
  }
  if (query.includes('bibimbap') || query.includes('kimchi')) {
    return '/assets/food/korean-bibimbap-1.0.png';
  }
  if (query.includes('soya') || query.includes('soy chunk') || query.includes('pulao') || query.includes('nutrela')) {
    return '/assets/food/soya-pulao-1.0.png';
  }
  if (query.includes('shakshuka')) {
    return '/assets/food/desi-shakshuka-1.0.png';
  }
  if (query.includes('kathi roll') || query.includes('frankie') || query.includes('wrap') || query.includes('roll')) {
    return '/assets/food/paneer-kathi-roll-1.0.png';
  }
  if (query.includes('fried rice')) {
    return '/assets/food/egg-fried-rice-1.0.png';
  }
  if (query.includes('curd rice') || query.includes('dahi chawal') || query.includes('thayir sadam')) {
    return '/assets/food/curd-rice-1.0.png';
  }
  if (query.includes('masala oats') || (query.includes('oat') && (query.includes('egg') || query.includes('savory')))) {
    return '/assets/food/masala-oats-1.0.png';
  }
  if (query.includes('peanut butter') || (query.includes('oat') && query.includes('banana'))) {
    return '/assets/food/peanut-butter-oats-1.0.png';
  }
  if (query.includes('french toast') || (query.includes('bread') && query.includes('egg'))) {
    return '/assets/food/masala-french-toast-1.0.png';
  }
  if (query.includes('pepper chicken') || query.includes('chettinad')) {
    return '/assets/food/pepper-chicken-1.0.png';
  }
  if (query.includes('chilla') || query.includes('cheela') || query.includes('besan')) {
    return '/assets/food/besan-chilla-1.0.png';
  }
  if (query.includes('sundal') || query.includes('kala chana') || query.includes('black chickpea')) {
    return '/assets/food/kala-chana-1.0.png';
  }
  if (query.includes('chickpea salad') || (query.includes('chickpea') && query.includes('salad'))) {
    return '/assets/food/chickpea-salad-1.0.png';
  }
  if (query.includes('tikka') || query.includes('kebab') || query.includes('skewer')) {
    return '/assets/food/chicken-tikka-1.0.png';
  }
  if (query.includes('rajma') || query.includes('kidney bean') || query.includes('chawal')) {
    return '/assets/food/rajma-chawal-1.0.png';
  }
  if (query.includes('paneer') || query.includes('tofu') || query.includes('cottage cheese')) {
    return '/assets/food/paneer-bhurji-1.0.png';
  }
  if (query.includes('tariwala') || query.includes('curry') || query.includes('gravy') || query.includes('masala')) {
    return query.includes('egg') ? '/assets/food/egg-curry-1.0.png' : '/assets/food/chicken-curry-1.0.png';
  }
  if (query.includes('khichdi') || query.includes('dal') || query.includes('lentil') || query.includes('moong')) {
    return '/assets/food/moong-khichdi-1.0.png';
  }
  if (query.includes('chicken') || query.includes('turkey') || query.includes('poultry')) {
    return '/assets/food/grilled-chicken-1.0.png';
  }
  if (query.includes('chicken') || query.includes('poultry') || query.includes('tikka')) {
    return '/assets/food/grilled-chicken-1.0.png';
  }
  if (query.includes('taco') || query.includes('burrito') || query.includes('fajita') || query.includes('salsa')) {
    return '/assets/food/taco-bowl-1.0.png';
  }
  if (query.includes('prawn') || query.includes('shrimp') || query.includes('salmon') || query.includes('fish') || query.includes('seafood')) {
    return '/assets/food/prawn-linguine-1.0.png';
  }
  if (query.includes('pasta') || query.includes('noodle') || query.includes('linguine') || query.includes('spaghetti')) {
    return '/assets/food/pasta-1.0.png';
  }
  if (query.includes('avocado') || query.includes('toast') || query.includes('sandwich') || query.includes('bread')) {
    return '/assets/food/avocado-toast-1.0.png';
  }
  if (query.includes('skillet') || query.includes('omelet') || query.includes('scramble') || query.includes('frittata')) {
    return '/assets/food/skillet-eggs-1.0.png';
  }
  if (query.includes('egg') && query.includes('rice')) {
    return '/assets/food/egg-rice-bowl-1.0.png';
  }

  return '/assets/food/grain-bowl-1.0.png';
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// 1. Pixelated Plate Shader: Masks into a circular ceramic plate with authentic 16-bit pixelation & clean alpha
export async function generatePixelatedPlate(imageSrc: string): Promise<string> {
  const img = await loadImage(imageSrc);
  const size = 320;
  const center = size / 2;
  const plateRadius = size * 0.44;
  const innerRadius = size * 0.36;

  // Step 1: Pixelate the source food image at low resolution
  const pixelRes = 96;
  const lowCanvas = document.createElement('canvas');
  lowCanvas.width = pixelRes;
  lowCanvas.height = pixelRes;
  const lowCtx = lowCanvas.getContext('2d');
  if (!lowCtx) return imageSrc;

  // Draw square crop of image onto low-res canvas
  const imgMin = Math.min(img.width, img.height);
  const sx = (img.width - imgMin) / 2;
  const sy = (img.height - imgMin) / 2;
  lowCtx.drawImage(img, sx, sy, imgMin, imgMin, 0, 0, pixelRes, pixelRes);

  // Step 2: Assemble onto full-res plate canvas
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageSrc;

  // Outer Plate Rim (Ivory Ceramic)
  ctx.beginPath();
  ctx.arc(center, center, plateRadius, 0, Math.PI * 2);
  const plateGrad = ctx.createRadialGradient(center - 20, center - 20, 10, center, center, plateRadius);
  plateGrad.addColorStop(0, '#FFFDF9');
  plateGrad.addColorStop(0.85, '#EBE4D5');
  plateGrad.addColorStop(1, '#D6CDBC');
  ctx.fillStyle = plateGrad;
  ctx.fill();

  // Dark 16-bit Outer Border Outline
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#1A3629';
  ctx.stroke();

  // Inner Plate Well Shadow
  ctx.beginPath();
  ctx.arc(center, center, innerRadius + 2, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(26, 54, 41, 0.25)';
  ctx.stroke();

  // Inner Food Masking
  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
  ctx.clip();

  // Draw low-res pixelated food with pixelated interpolation
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(lowCanvas, 0, 0, pixelRes, pixelRes, center - innerRadius, center - innerRadius, innerRadius * 2, innerRadius * 2);

  // Inner plate vignette shadow for depth
  const innerVignette = ctx.createRadialGradient(center, center, innerRadius * 0.7, center, center, innerRadius);
  innerVignette.addColorStop(0, 'rgba(0,0,0,0)');
  innerVignette.addColorStop(1, 'rgba(26, 54, 41, 0.35)');
  ctx.fillStyle = innerVignette;
  ctx.fillRect(center - innerRadius, center - innerRadius, innerRadius * 2, innerRadius * 2);
  ctx.restore();

  // Outer Ceramic Highlight Arc
  ctx.beginPath();
  ctx.arc(center, center, plateRadius - 4, -Math.PI * 0.8, -Math.PI * 0.2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

// 2. Retro 16-bit Polaroid / GameBoy Camera Cartridge Badge
export async function generateRetroFramedBadge(imageSrc: string): Promise<string> {
  const img = await loadImage(imageSrc);
  const size = 320;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageSrc;

  const cardW = 270;
  const cardH = 290;
  const x = (size - cardW) / 2;
  const y = (size - cardH) / 2;
  const radius = 24;

  // Draw Card Body (Warm Retro Beige)
  ctx.beginPath();
  ctx.roundRect(x, y, cardW, cardH, radius);
  ctx.fillStyle = '#FFFDF9';
  ctx.fill();

  // Card Outer Pixel Border
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#1A3629';
  ctx.stroke();

  // Photo Screen Area
  const photoMargin = 16;
  const photoW = cardW - photoMargin * 2;
  const photoH = 195;
  const photoX = x + photoMargin;
  const photoY = y + photoMargin;
  const photoRadius = 14;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius);
  ctx.clip();

  // Draw user photo scaled and centered
  const scale = Math.max(photoW / img.width, photoH / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = photoX + (photoW - dw) / 2;
  const dy = photoY + (photoH - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);

  // Subtle scanline overlay
  ctx.fillStyle = 'rgba(26, 54, 41, 0.08)';
  for (let i = 0; i < photoH; i += 4) {
    ctx.fillRect(photoX, photoY + i, photoW, 2);
  }
  ctx.restore();

  // Photo Screen Border
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#1A3629';
  ctx.stroke();

  // Bottom Badge Detail Panel
  const bottomY = photoY + photoH + 14;

  // Mini Green Active LED
  ctx.beginPath();
  ctx.arc(photoX + 8, bottomY + 12, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#10B981';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#1A3629';
  ctx.stroke();

  // Text Stamp: CYATH · FUEL CARTRIDGE
  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#1A3629';
  ctx.fillText('CYATH · 16-BIT SCAN', photoX + 22, bottomY + 16);

  // Mini Barcode / Grate Accent
  const barX = photoX + photoW - 40;
  for (let b = 0; b < 5; b++) {
    ctx.fillStyle = '#1A3629';
    ctx.fillRect(barX + b * 7, bottomY + 6, 3, 12);
  }

  return canvas.toDataURL('image/png');
}
