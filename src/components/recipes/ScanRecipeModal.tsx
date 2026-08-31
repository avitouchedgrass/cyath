'use client';
import React, { useState, useRef, useMemo, useEffect } from 'react';
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
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showApiKeyField, setShowApiKeyField] = useState<boolean>(false);
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

  // Auto-load saved Gemini key from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('cyath_gemini_api_key');
      if (savedKey) {
        setApiKeyInput(savedKey);
      }
    }
  }, []);

  const currentDisplayedImage = useMemo(() => {
    if (photoStyle === 'matched_sprite') {
      return matchedSpriteImage;
    }
    if (photoStyle === 'retro_frame') {
      return retroFrameImage || selectedImage || '/assets/food/grain-bowl-1.0.png';
    }
    return pixelPlateImage || selectedImage || '/assets/food/grain-bowl-1.0.png';
  }, [photoStyle, matchedSpriteImage, retroFrameImage, pixelPlateImage, selectedImage]);

  const handleApiKeyChange = (val: string) => {
    setApiKeyInput(val);
    if (typeof window !== 'undefined') {
      if (val.trim()) {
        localStorage.setItem('cyath_gemini_api_key', val.trim());
      } else {
        localStorage.removeItem('cyath_gemini_api_key');
      }
    }
  };

  const SCAN_LOGS = [
    'Connecting to Google Gemini Vision Neural Mesh...',
    'Decomposing Plate Topology & Contrast...',
    'Segmenting Protein & Complex Carbohydrate Density...',
    'Calibrating Amino Mass & Thermal Prep Curves...',
    'Synthesizing Cyath Metabolic Manifest...',
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
          apiKey: apiKeyInput.trim() || undefined,
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
          const [plateUri, frameUri] = await Promise.all([
            generatePixelatedPlate(imgData),
            generateRetroFramedBadge(imgData),
          ]);
          setPixelPlateImage(plateUri);
          setRetroFrameImage(frameUri);
        } catch (err) {
          console.warn('Canvas stylizer failed:', err);
        }

        setExtractedRecipe({
          ...data.recipe,
          id: `custom-${Date.now()}`,
          image: imgData,
          rawImage: imgData,
          isCustom: true,
        });
        retroAudio.playInspectConfirm();
        setStep('review');
      } else {
        throw new Error('Vision model did not return structured recipe data.');
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error('Scan failed:', err);
      setErrorMsg(err?.message || 'Vision scan encountered an error. Please verify your Gemini API key.');
      setStep('upload');
      setShowApiKeyField(true);
    }
  };

  const handleFinalSave = () => {
    if (!extractedRecipe || !extractedRecipe.name) return;

    const fullRecipe: Recipe = {
      id: extractedRecipe.id || `custom-${Date.now()}`,
      name: extractedRecipe.name || 'Custom Plate',
      subtitle: extractedRecipe.subtitle || 'User crafted custom meal',
      image: currentDisplayedImage,
      rawImage: selectedImage || undefined,
      calories: Number(extractedRecipe.calories) || 500,
      protein: Number(extractedRecipe.protein) || 30,
      carbs: Number(extractedRecipe.carbs) || 45,
      fats: Number(extractedRecipe.fats) || 15,
      prepTimeMinutes: Number(extractedRecipe.prepTimeMinutes) || 20,
      category: extractedRecipe.category || 'High Protein',
      dietType: extractedRecipe.dietType || 'omnivore',
      tags: extractedRecipe.tags || ['Custom Meal', 'Vision Scanned'],
      focusScore: extractedRecipe.focusScore || '9.0/10',
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
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#10B981] border border-[#1A3629] animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1A3629]">
              AI Neural Vision Scanner · Multimodal Food Reasoning
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div className="flex flex-col gap-5">
              <div className="text-center sm:text-left">
                <h3 className="font-fraunces font-black text-2xl text-[#1A3629] tracking-tight">
                  Scan Any Meal with AI
                </h3>
                <p className="text-xs font-cabinet font-medium text-[#4A5D4E] mt-1">
                  Upload a photo of your plate. Our computer vision model identifies ingredients, calculates calories & macros, and extracts culinary instructions.
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
                  Supports JPEG, PNG, WebP (camera photos, food delivery, home cooking)
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

              {/* Engine Status Banner */}
              <div className="p-3.5 rounded-2xl border-2 border-[#1A3629]/25 bg-[#FAF6EE] flex items-center justify-between shadow-[2px_2px_0px_#1A3629]">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                  <div>
                    <span className="text-xs font-cabinet font-bold text-[#1A3629] block">
                      Cyath Neural Computer Vision
                    </span>
                    <span className="text-[10px] font-mono text-[#4A5D4E]">
                      Live Multimodal Gemini Reasoning Engine
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#065F46] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#10B981]">
                  Active
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: SCANNING (CRT HUD + REASONING PROGRESS) */}
          {step === 'scanning' && (
            <div className="flex flex-col items-center justify-center py-8 gap-5 text-center">
              {/* Image Preview with Scanning Beam */}
              <div className="relative w-44 h-44 rounded-2xl border-3 border-[#1A3629] overflow-hidden bg-[#1A3629] shadow-[5px_5px_0px_#1A3629]">
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt="Scanning target"
                    className="w-full h-full object-cover opacity-85 [image-rendering:pixelated]"
                  />
                )}

                {/* Laser scanline beam */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#10B981]/40 to-transparent h-8 w-full animate-[bounce_1.5s_infinite] pointer-events-none" />
                <div className="absolute inset-0 border border-[#10B981]/50 pointer-events-none" />
              </div>

              {/* Terminal Logs Ticker */}
              <div className="w-full max-w-md bg-[#1A3629] text-[#A7F3D0] rounded-xl p-4 font-mono text-xs text-left shadow-inner border border-[#10B981]/30">
                <div className="flex items-center justify-between border-b border-[#10B981]/25 pb-2 mb-2 text-[10px] text-[#34D399]">
                  <span>CYATH_VISION_ENGINE_V2</span>
                  <span className="animate-pulse">● LIVE_FEED</span>
                </div>
                <div className="flex flex-col gap-1.5 min-h-[50px]">
                  <p className="text-[11px] leading-relaxed text-[#FFFDF9]">
                    &gt; {SCAN_LOGS[scanStatusIndex]}
                  </p>
                </div>
              </div>

              <span className="text-xs font-cabinet font-medium text-[#4A5D4E]">
                Neural reasoning in progress · Estimating weights & amino balance...
              </span>
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
                        AI Verified
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

              {/* Chain of Thought Reasoning Steps */}
              {extractedRecipe.reasoningSteps && extractedRecipe.reasoningSteps.length > 0 && (
                <div className="p-3.5 rounded-xl border-2 border-[#1A3629]/20 bg-[#FFFDF9] flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1A3629]">
                    <span>Visual Recognition Reasoning Trace:</span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {extractedRecipe.reasoningSteps.map((stepText, idx) => (
                      <li key={idx} className="text-[11px] font-cabinet text-[#2C4A3B] leading-relaxed flex items-start gap-2">
                        <span className="text-[#10B981] font-mono font-bold">↳</span>
                        <span>{stepText}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Editable Macros Grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 rounded-xl border-2 border-[#1A3629]/20 bg-[#FFFDF9]">
                  <span className="text-[10px] font-mono font-bold block text-[#1A3629]">PROTEIN</span>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <input
                      type="number"
                      value={extractedRecipe.protein ?? 0}
                      onChange={(e) => setExtractedRecipe({ ...extractedRecipe, protein: Number(e.target.value) })}
                      className="w-12 text-center font-mono text-base font-bold text-[#1A3629] bg-transparent border-b border-transparent hover:border-[#1A3629] outline-none"
                    />
                    <span className="text-xs font-mono font-bold">g</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border-2 border-[#1A3629]/20 bg-[#FFFDF9]">
                  <span className="text-[10px] font-mono font-bold block text-[#1A3629]">CALORIES</span>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <input
                      type="number"
                      value={extractedRecipe.calories ?? 0}
                      onChange={(e) => setExtractedRecipe({ ...extractedRecipe, calories: Number(e.target.value) })}
                      className="w-14 text-center font-mono text-base font-bold text-[#1A3629] bg-transparent border-b border-transparent hover:border-[#1A3629] outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl border-2 border-[#1A3629]/20 bg-[#FFFDF9]">
                  <span className="text-[10px] font-mono font-bold block text-[#1A3629]">CARBS</span>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <input
                      type="number"
                      value={extractedRecipe.carbs ?? 0}
                      onChange={(e) => setExtractedRecipe({ ...extractedRecipe, carbs: Number(e.target.value) })}
                      className="w-12 text-center font-mono text-base font-bold text-[#1A3629] bg-transparent border-b border-transparent hover:border-[#1A3629] outline-none"
                    />
                    <span className="text-xs font-mono font-bold">g</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border-2 border-[#1A3629]/20 bg-[#FFFDF9]">
                  <span className="text-[10px] font-mono font-bold block text-[#1A3629]">FATS</span>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <input
                      type="number"
                      value={extractedRecipe.fats ?? 0}
                      onChange={(e) => setExtractedRecipe({ ...extractedRecipe, fats: Number(e.target.value) })}
                      className="w-12 text-center font-mono text-base font-bold text-[#1A3629] bg-transparent border-b border-transparent hover:border-[#1A3629] outline-none"
                    />
                    <span className="text-xs font-mono font-bold">g</span>
                  </div>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="p-4 rounded-xl border-2 border-[#1A3629]/20 bg-[#FAF6EE] flex flex-col gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629]">
                  Identified Ingredients & Estimated Portions
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {extractedRecipe.ingredients?.map((ing, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#FFFDF9] px-2.5 py-1.5 rounded-lg border border-[#1A3629]/15 text-xs font-mono">
                      <span className="text-[#1A3629] font-medium">{ing.item}</span>
                      <span className="text-[#10B981] font-bold">{ing.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="px-4 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs hover:bg-[#FAF6EE] cursor-pointer"
                >
                  ← Rescan Photo
                </button>

                <button
                  type="button"
                  onClick={handleFinalSave}
                  className="flex-1 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[3px_3px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>✓ Save to My Recipe Library</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
