'use client';
import React, { useState, useRef, useMemo } from 'react';
import { Recipe } from '@/lib/recipes';
import { retroAudio } from '@/lib/retroAudio';
import {
  PhotoStyleMode,
  SPRITE_OPTIONS,
  getBestMatchingSprite,
  generatePixelatedPlate,
  generateRetroFramedBadge,
} from '@/lib/imageStylizer';

interface ScanRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecipe: (recipe: Recipe) => void;
}

type ScanStep = 'upload' | 'scanning' | 'review';

export function ScanRecipeModal({ isOpen, onClose, onSaveRecipe }: ScanRecipeModalProps) {
  const [step, setStep] = useState<ScanStep>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [scanStatusIndex, setScanStatusIndex] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Photo styling options: Pixelated Plate, Matched Sprite, Retro Frame
  const [photoStyle, setPhotoStyle] = useState<PhotoStyleMode>('pixel_plate');
  const [pixelPlateImage, setPixelPlateImage] = useState<string | null>(null);
  const [retroFrameImage, setRetroFrameImage] = useState<string | null>(null);
  const [matchedSpriteImage, setMatchedSpriteImage] = useState<string>('/assets/food/grain-bowl-1.0.png');

  // Extracted recipe state for editing before saving
  const [extractedRecipe, setExtractedRecipe] = useState<Partial<Recipe> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentDisplayedImage = useMemo(() => {
    if (photoStyle === 'matched_sprite') {
      return matchedSpriteImage;
    }
    if (photoStyle === 'retro_frame') {
      return retroFrameImage || selectedImage || '/assets/food/grain-bowl-1.0.png';
    }
    return pixelPlateImage || selectedImage || '/assets/food/grain-bowl-1.0.png';
  }, [photoStyle, matchedSpriteImage, retroFrameImage, pixelPlateImage, selectedImage]);

  const SCAN_LOGS = [
    'Analyzing food plate photo...',
    'Identifying ingredients & portions...',
    'Calculating protein & macronutrients...',
    'Formulating whole-food recipe...',
  ];

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid food image (JPEG, PNG, or WebP).');
      return;
    }

    setErrorMsg(null);
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      startScan(result, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSampleSelect = (sampleUrl: string) => {
    setErrorMsg(null);
    setSelectedImage(sampleUrl);
    setMimeType('image/png');
    startScan(sampleUrl, 'image/png');
  };

  const startScan = async (imgData: string, mime: string) => {
    setStep('scanning');
    setScanStatusIndex(0);
    retroAudio.playInspectConfirm();

    // Progress ticker interval for visual feedback
    const interval = setInterval(() => {
      setScanStatusIndex((prev) => (prev < SCAN_LOGS.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      const response = await fetch('/api/ai/scan-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imgData,
          mimeType: mime,
        }),
      });

      clearInterval(interval);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Vision scan failed (${response.status})`);
      }

      if (data.recipe) {
        // Pre-compute matched sprite and stylized canvas variants
        const bestSprite = getBestMatchingSprite(
          data.recipe.name || '',
          data.recipe.category || '',
          data.recipe.dietType || ''
        );
        setMatchedSpriteImage(bestSprite);

        try {
          const pixelatedPlate = await generatePixelatedPlate(imgData);
          setPixelPlateImage(pixelatedPlate);
        } catch {
          setPixelPlateImage(bestSprite);
        }

        try {
          const framed = await generateRetroFramedBadge(imgData);
          setRetroFrameImage(framed);
        } catch {
          setRetroFrameImage(null);
        }

        setExtractedRecipe(data.recipe);
        setStep('review');
        retroAudio.playInspectConfirm();
      } else {
        throw new Error('Could not formulate nutritional profile from this image.');
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error('Vision scan error:', err);
      setErrorMsg(err.message || 'Vision analysis failed. Please try another clear photograph.');
      setStep('upload');
    }
  };

  const handleSaveAndClose = () => {
    if (!extractedRecipe) return;

    const fullRecipe: Recipe = {
      id: `scanned-${Date.now()}`,
      name: extractedRecipe.name || 'Custom Scanned Plate',
      subtitle: extractedRecipe.subtitle || 'AI Vision Formulated Whole-Food Plate',
      category: extractedRecipe.category || 'High Protein',
      dietType: extractedRecipe.dietType || 'omnivore',
      calories: extractedRecipe.calories || 450,
      protein: extractedRecipe.protein || 35,
      carbs: extractedRecipe.carbs || 40,
      fats: extractedRecipe.fats || 15,
      prepTimeMinutes: extractedRecipe.prepTimeMinutes || 20,
      focusScore: extractedRecipe.focusScore || '9.0/10',
      tags: extractedRecipe.tags && extractedRecipe.tags.length > 0 ? extractedRecipe.tags : ['High Protein', 'Custom'],
      image: currentDisplayedImage,
      description: extractedRecipe.description || 'Personal calibrated meal scanned with Cyath AI vision.',
      ingredients: extractedRecipe.ingredients && extractedRecipe.ingredients.length > 0
        ? extractedRecipe.ingredients
        : [{ item: 'Custom Plate Ingredients', amount: '1 serving' }],
      instructions: extractedRecipe.instructions && extractedRecipe.instructions.length > 0
        ? extractedRecipe.instructions
        : ['Assemble ingredients as desired and enjoy.'],
      isCustom: true,
      reasoningSteps: extractedRecipe.reasoningSteps,
    };

    retroAudio.playInspectConfirm();
    onSaveRecipe(fullRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1A3629]/70 backdrop-blur-md animate-[fadeScale_0.25s_ease-out]">
      <div className="relative w-full max-w-2xl bg-[#FFFDF9] border-3 border-[#1A3629] rounded-3xl shadow-[8px_8px_0px_#1A3629] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Ribbon */}
        <div className="px-6 py-4 border-b-2 border-[#1A3629] bg-[#FAF6EE] flex items-center justify-between">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1A3629]">
            Scan Meal with AI
          </span>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] font-mono text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center cursor-pointer shadow-[1px_1px_0px_#1A3629]"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div className="flex flex-col gap-5">
              <div className="text-center sm:text-left">
                <h3 className="font-fraunces font-black text-2xl text-[#1A3629] tracking-tight">
                  Scan Any Meal
                </h3>
                <p className="text-xs font-cabinet font-medium text-[#4A5D4E] mt-1">
                  Upload a photo of your plate to automatically estimate ingredients, protein, and calories.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl border-2 border-red-500 bg-red-50 text-red-700 text-xs font-mono font-bold">
                  {errorMsg}
                </div>
              )}

              {/* Drag & Drop Upload Canvas */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-3 border-dashed border-[#1A3629]/40 hover:border-[#1A3629] bg-[#FAF6EE]/60 hover:bg-[#FAF6EE] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-16 h-16 rounded-2xl border-2 border-[#1A3629] bg-[#FFFDF9] flex items-center justify-center shadow-[3px_3px_0px_#1A3629] group-hover:-translate-y-1 transition-transform mb-3">
                  <svg className="w-8 h-8 text-[#1A3629]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-cabinet font-bold text-base text-[#1A3629]">
                  Click or drag photo here to scan
                </span>
                <span className="text-[11px] font-mono text-[#8C9B90] mt-1">
                  Supports JPEG, PNG, WebP
                </span>
              </div>

              {/* Quick Test Gallery (instant one-click testing) */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629]/70">
                  Or test with sample dish photos:
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSampleSelect('/assets/food/grilled-chicken-1.0.png')}
                    className="p-2.5 rounded-xl border-2 border-[#1A3629]/20 hover:border-[#1A3629] bg-[#FFFDF9] hover:bg-[#FAF6EE] text-left transition-all cursor-pointer flex items-center gap-2"
                  >
                    <img src="/assets/food/grilled-chicken-1.0.png" alt="Grilled Chicken" className="w-6 h-6 object-contain shrink-0 [image-rendering:pixelated]" />
                    <div className="min-w-0">
                      <span className="text-xs font-cabinet font-bold text-[#1A3629] block truncate">Grilled Chicken</span>
                      <span className="text-[10px] font-mono text-[#4A5D4E]">High Protein</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSampleSelect('/assets/food/grain-bowl-1.0.png')}
                    className="p-2.5 rounded-xl border-2 border-[#1A3629]/20 hover:border-[#1A3629] bg-[#FFFDF9] hover:bg-[#FAF6EE] text-left transition-all cursor-pointer flex items-center gap-2"
                  >
                    <img src="/assets/food/grain-bowl-1.0.png" alt="Quinoa Bowl" className="w-6 h-6 object-contain shrink-0 [image-rendering:pixelated]" />
                    <div className="min-w-0">
                      <span className="text-xs font-cabinet font-bold text-[#1A3629] block truncate">Quinoa Bowl</span>
                      <span className="text-[10px] font-mono text-[#4A5D4E]">Steady Carbs</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSampleSelect('/assets/food/paneer-bhurji-1.0.png')}
                    className="p-2.5 rounded-xl border-2 border-[#1A3629]/20 hover:border-[#1A3629] bg-[#FFFDF9] hover:bg-[#FAF6EE] text-left transition-all cursor-pointer flex items-center gap-2"
                  >
                    <img src="/assets/food/paneer-bhurji-1.0.png" alt="Paneer Bhurji" className="w-6 h-6 object-contain shrink-0 [image-rendering:pixelated]" />
                    <div className="min-w-0">
                      <span className="text-xs font-cabinet font-bold text-[#1A3629] block truncate">Paneer Bhurji</span>
                      <span className="text-[10px] font-mono text-[#4A5D4E]">Ghar Ka Khana</span>
                    </div>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: SCANNING (PROGRESS LOGS) */}
          {step === 'scanning' && (
            <div className="flex flex-col items-center justify-center py-8 gap-5 text-center">
              {/* Image Preview */}
              <div className="relative w-44 h-44 rounded-2xl border-3 border-[#1A3629] overflow-hidden bg-[#1A3629] shadow-[5px_5px_0px_#1A3629]">
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt="Scanning target"
                    className="w-full h-full object-cover opacity-85 [image-rendering:pixelated]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#10B981]/25 to-transparent animate-[scanline_1.8s_ease-in-out_infinite]" />
              </div>

              {/* Status Ticker */}
              <div className="w-full max-w-md bg-[#1A3629] text-[#A7F3D0] rounded-xl p-4 font-mono text-xs text-left shadow-inner border border-[#1A3629]">
                <p className="text-[12px] leading-relaxed text-[#FFFDF9]">
                  &gt; {SCAN_LOGS[scanStatusIndex]}
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & EDIT EXTRACTED MANIFEST */}
          {step === 'review' && extractedRecipe && (
            <div className="flex flex-col gap-5">
              {/* Visual Card + Style Mode Switcher */}
              <div className="flex flex-col gap-3.5 p-4 rounded-2xl border-2 border-[#1A3629]/20 bg-[#FAF6EE]">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Styled Image Preview */}
                  <div className="relative w-32 h-32 shrink-0 rounded-2xl border-2 border-[#1A3629] overflow-hidden bg-[#FFFDF9] shadow-[3px_3px_0px_#1A3629] flex items-center justify-center p-1.5">
                    <img
                      src={currentDisplayedImage}
                      alt="Custom plate preview"
                      className="w-full h-full object-contain [image-rendering:pixelated]"
                    />
                  </div>

                  {/* Title & Subtitle */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1 w-full">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase bg-[#10B981] text-[#FFFDF9] border-[#1A3629]">
                        Verified
                      </span>
                      <span className="px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase bg-[#FFFDF9] border-[#1A3629] text-[#1A3629]">
                        {extractedRecipe.category}
                      </span>
                    </div>

                    <input
                      type="text"
                      value={extractedRecipe.name || ''}
                      onChange={(e) => setExtractedRecipe({ ...extractedRecipe, name: e.target.value })}
                      className="font-fraunces font-black text-xl text-[#1A3629] bg-transparent border-b border-[#1A3629]/20 focus:border-[#1A3629] outline-none mt-1"
                      placeholder="Dish Name"
                    />

                    <input
                      type="text"
                      value={extractedRecipe.subtitle || ''}
                      onChange={(e) => setExtractedRecipe({ ...extractedRecipe, subtitle: e.target.value })}
                      className="text-xs font-cabinet font-medium text-[#4A5D4E] bg-transparent border-b border-[#1A3629]/10 focus:border-[#1A3629] outline-none"
                      placeholder="Short description"
                    />
                  </div>
                </div>

                {/* 3-Way Retro Photo Styling Controls */}
                <div className="pt-3 border-t border-[#1A3629]/15 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629]">
                      Card Visual Presentation:
                    </span>
                    <span className="text-[10px] font-mono text-[#8C9B90]">
                      {photoStyle === 'pixel_plate' && '16-Bit Ceramic Plate'}
                      {photoStyle === 'matched_sprite' && 'Authentic Food Sprite'}
                      {photoStyle === 'retro_frame' && 'Vintage Polaroid Badge'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoStyle('pixel_plate');
                        retroAudio.playBlip();
                      }}
                      className={`py-2 px-2.5 rounded-xl border-2 font-cabinet font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        photoStyle === 'pixel_plate'
                          ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#3A6B52]'
                          : 'border-[#1A3629]/25 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF6EE]'
                      }`}
                    >
                      <span>Pixel Plate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPhotoStyle('matched_sprite');
                        retroAudio.playBlip();
                      }}
                      className={`py-2 px-2.5 rounded-xl border-2 font-cabinet font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        photoStyle === 'matched_sprite'
                          ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#3A6B52]'
                          : 'border-[#1A3629]/25 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF6EE]'
                      }`}
                    >
                      <span>Matched Sprite</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPhotoStyle('retro_frame');
                        retroAudio.playBlip();
                      }}
                      className={`py-2 px-2.5 rounded-xl border-2 font-cabinet font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        photoStyle === 'retro_frame'
                          ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#3A6B52]'
                          : 'border-[#1A3629]/25 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF6EE]'
                      }`}
                    >
                      <span>Retro Frame</span>
                    </button>
                  </div>

                  {/* If Matched Sprite is selected, display quick-picker row */}
                  {photoStyle === 'matched_sprite' && (
                    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                      {SPRITE_OPTIONS.map((sp) => (
                        <button
                          key={sp.id}
                          type="button"
                          onClick={() => {
                            setMatchedSpriteImage(sp.url);
                            retroAudio.playBlip();
                          }}
                          className={`p-1.5 rounded-lg border shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                            matchedSpriteImage === sp.url
                              ? 'border-[#1A3629] bg-[#ECFDF5] shadow-[1px_1px_0px_#1A3629]'
                              : 'border-[#1A3629]/15 bg-[#FFFDF9] hover:border-[#1A3629]'
                          }`}
                        >
                          <img src={sp.url} alt={sp.name} className="w-5 h-5 object-contain [image-rendering:pixelated]" />
                          <span className="text-[10px] font-mono text-[#1A3629]">{sp.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Macros Dashboard Strip */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl border-2 border-[#1A3629]/20 bg-[#FFFDF9]">
                  <span className="text-[10px] font-mono font-bold text-[#8C9B90] uppercase block">Calories</span>
                  <input
                    type="number"
                    value={extractedRecipe.calories || 0}
                    onChange={(e) => setExtractedRecipe({ ...extractedRecipe, calories: Number(e.target.value) })}
                    className="font-fraunces font-black text-lg text-[#1A3629] w-full text-center bg-transparent outline-none"
                  />
                  <span className="text-[9px] font-mono text-[#4A5D4E]">kcal</span>
                </div>

                <div className="p-2.5 rounded-xl border-2 border-[#10B981] bg-[#ECFDF5]">
                  <span className="text-[10px] font-mono font-bold text-[#065F46] uppercase block">Protein</span>
                  <input
                    type="number"
                    value={extractedRecipe.protein || 0}
                    onChange={(e) => setExtractedRecipe({ ...extractedRecipe, protein: Number(e.target.value) })}
                    className="font-fraunces font-black text-lg text-[#065F46] w-full text-center bg-transparent outline-none"
                  />
                  <span className="text-[9px] font-mono text-[#065F46]">grams</span>
                </div>

                <div className="p-2.5 rounded-xl border-2 border-[#1A3629]/20 bg-[#FFFDF9]">
                  <span className="text-[10px] font-mono font-bold text-[#8C9B90] uppercase block">Carbs</span>
                  <input
                    type="number"
                    value={extractedRecipe.carbs || 0}
                    onChange={(e) => setExtractedRecipe({ ...extractedRecipe, carbs: Number(e.target.value) })}
                    className="font-fraunces font-black text-lg text-[#1A3629] w-full text-center bg-transparent outline-none"
                  />
                  <span className="text-[9px] font-mono text-[#4A5D4E]">grams</span>
                </div>

                <div className="p-2.5 rounded-xl border-2 border-[#1A3629]/20 bg-[#FFFDF9]">
                  <span className="text-[10px] font-mono font-bold text-[#8C9B90] uppercase block">Fats</span>
                  <input
                    type="number"
                    value={extractedRecipe.fats || 0}
                    onChange={(e) => setExtractedRecipe({ ...extractedRecipe, fats: Number(e.target.value) })}
                    className="font-fraunces font-black text-lg text-[#1A3629] w-full text-center bg-transparent outline-none"
                  />
                  <span className="text-[9px] font-mono text-[#4A5D4E]">grams</span>
                </div>
              </div>

              {/* Ingredients & Instructions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ingredients */}
                <div className="p-3.5 rounded-xl border-2 border-[#1A3629]/15 bg-[#FFFDF9] flex flex-col gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A3629]">
                    Decomposed Ingredients ({extractedRecipe.ingredients?.length || 0})
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {(extractedRecipe.ingredients || []).map((ing, idx) => (
                      <div key={idx} className="text-xs font-cabinet flex items-center justify-between border-b border-[#1A3629]/10 pb-1">
                        <span className="font-bold text-[#1A3629] truncate">{ing.item}</span>
                        <span className="font-mono text-[11px] text-[#4A5D4E] shrink-0 ml-2">{ing.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-3.5 rounded-xl border-2 border-[#1A3629]/15 bg-[#FFFDF9] flex flex-col gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A3629]">
                    Prep Instructions ({extractedRecipe.instructions?.length || 0})
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {(extractedRecipe.instructions || []).map((inst, idx) => (
                      <div key={idx} className="text-xs font-cabinet flex items-start gap-1.5">
                        <span className="font-mono font-bold text-[10px] text-[#10B981] mt-0.5">{idx + 1}.</span>
                        <span className="text-[#2C4A3B] leading-snug">{inst}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 rounded-xl border-2 border-[#1A3629]/25 hover:border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs cursor-pointer"
                >
                  ← Rescan Plate
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndClose}
                  className="px-6 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs sm:text-sm shadow-[3px_3px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Save to Whole-Food Catalog →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
