export interface ReceiptExportData {
  date: string;
  level: number;
  islandName: string;
  islandImageUrl: string;
  sleepDuration: number;
  sunlightDone: boolean | null;
  breakfastDone: boolean | 'not_yet' | null;
  breakfastFuel: string;
  lunchDone: boolean | 'not_yet' | null;
  lunchFuel: string;
  dinnerDone?: boolean | 'not_yet' | null;
  dinnerFuel?: string;
  dinnerXp?: number;
  caffeineDone: boolean | null;
  caffeineTime: string;
  customHabitsCompletedCount: number;
  sleepXp: number;
  sunlightXp: number;
  breakfastXp: number;
  lunchXp: number;
  caffeineXp: number;
  customHabitsXp: number;
  baseSealXp: number;
  totalXp: number;
  format?: 'card' | 'story';
  isDownscaled?: boolean;
}

export async function generateReceiptCanvas(
  data: ReceiptExportData,
  format: 'card' | 'story' = data.format || 'card'
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  const isStory = format === 'story';
  const width = isStory ? 1080 : 640;
  const height = isStory ? 1920 : 960;
  canvas.width = width;
  canvas.height = height;

  // Background Parchment
  ctx.fillStyle = '#FFFDF9';
  ctx.fillRect(0, 0, width, height);

  // Outer 16-Bit Border
  ctx.strokeStyle = '#1A3629';
  ctx.lineWidth = isStory ? 8 : 4;
  const outerMargin = isStory ? 32 : 16;
  ctx.strokeRect(outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2);

  // Inner subtle border
  ctx.strokeStyle = 'rgba(26, 54, 41, 0.2)';
  ctx.lineWidth = isStory ? 2 : 1;
  const innerMargin = isStory ? 44 : 22;
  ctx.strokeRect(innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2);

  // Top Brass Pushpin Graphic
  const pinX = width / 2;
  const pinY = isStory ? 88 : 48;
  const pinScale = isStory ? 1.7 : 1;
  
  // Pin Shadow
  ctx.fillStyle = 'rgba(26, 54, 41, 0.25)';
  ctx.fillRect(pinX - 10 * pinScale, pinY + 8 * pinScale, 24 * pinScale, 6 * pinScale);

  // Pin Head (16-bit brass)
  ctx.fillStyle = '#C89332';
  ctx.fillRect(pinX - 12 * pinScale, pinY - 14 * pinScale, 24 * pinScale, 18 * pinScale);
  ctx.fillStyle = '#E8BE5A';
  ctx.fillRect(pinX - 9 * pinScale, pinY - 11 * pinScale, 18 * pinScale, 12 * pinScale);
  ctx.fillStyle = '#FFEAA7';
  ctx.fillRect(pinX - 6 * pinScale, pinY - 8 * pinScale, 6 * pinScale, 6 * pinScale);
  ctx.fillStyle = '#7E5316';
  ctx.fillRect(pinX - 12 * pinScale, pinY + 2 * pinScale, 24 * pinScale, 4 * pinScale);

  // Header Title
  ctx.fillStyle = '#1A3629';
  ctx.textAlign = 'center';
  ctx.font = isStory ? 'bold 36px monospace' : 'bold 22px monospace';
  ctx.fillText('*** CYATH SANCTUARY DISPATCH ***', width / 2, isStory ? 185 : 105);

  ctx.font = isStory ? '20px monospace' : '13px monospace';
  ctx.fillStyle = '#4A5D4E';
  ctx.fillText(`DATE: ${data.date}  ·  LEVEL ${data.level}`, width / 2, isStory ? 228 : 128);

  // Dashed divider line under header
  ctx.strokeStyle = 'rgba(26, 54, 41, 0.25)';
  ctx.setLineDash(isStory ? [6, 6] : [4, 4]);
  ctx.beginPath();
  const linePad = isStory ? 64 : 36;
  const headerLineY = isStory ? 254 : 142;
  ctx.moveTo(linePad, headerLineY);
  ctx.lineTo(width - linePad, headerLineY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw Island Artwork
  const imgSize = isStory ? 360 : 220;
  const imgY = isStory ? 280 : 155;
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = data.islandImageUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, width / 2 - imgSize / 2, imgY, imgSize, imgSize);
  } catch {}

  // Island Name & Sub-badge
  ctx.fillStyle = '#1A3629';
  ctx.font = isStory ? 'bold 28px monospace' : 'bold 16px monospace';
  const islandNameY = isStory ? 685 : 400;
  ctx.fillText(data.islandName.toUpperCase(), width / 2, islandNameY);

  ctx.strokeStyle = 'rgba(26, 54, 41, 0.25)';
  ctx.setLineDash(isStory ? [6, 6] : [4, 4]);
  ctx.beginPath();
  const subDividerY = isStory ? 720 : 420;
  ctx.moveTo(linePad, subDividerY);
  ctx.lineTo(width - linePad, subDividerY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Itemized Biometric Rows
  const startY = isStory ? 790 : 460;
  const rowGap = isStory ? 66 : 38;
  const leftX = isStory ? 84 : 48;
  const rightX = width - leftX;

  const rows = [
    {
      label: 'Sleep Restored',
      value: `${data.sleepDuration}h`,
      xp: `+${data.sleepXp} XP`,
      highlight: data.sleepXp >= 30,
    },
    {
      label: 'Morning Sun',
      value: data.sunlightDone ? 'Secured' : 'Missed',
      xp: `+${data.sunlightXp} XP`,
      highlight: !!data.sunlightDone,
    },
    {
      label: 'Breakfast Fuel',
      value: data.breakfastFuel ? (data.breakfastFuel.length > 20 ? data.breakfastFuel.slice(0, 19) + '…' : data.breakfastFuel) : (data.breakfastDone === true ? '30g+ Hit' : data.breakfastDone === 'not_yet' ? 'Fasting/Later' : 'Light/Skip'),
      xp: `+${data.breakfastXp} XP`,
      highlight: data.breakfastDone === true,
    },
    {
      label: 'Lunch Fuel',
      value: data.lunchFuel ? (data.lunchFuel.length > 20 ? data.lunchFuel.slice(0, 19) + '…' : data.lunchFuel) : (data.lunchDone === true ? '40g+ Hit' : data.lunchDone === 'not_yet' ? 'Fasting/Later' : 'Light/Skip'),
      xp: `+${data.lunchXp} XP`,
      highlight: data.lunchDone === true,
    },
    ...(data.dinnerDone !== undefined ? [{
      label: 'Dinner Fuel',
      value: data.dinnerFuel ? (data.dinnerFuel.length > 20 ? data.dinnerFuel.slice(0, 19) + '…' : data.dinnerFuel) : (data.dinnerDone === true ? '35g+ Hit' : data.dinnerDone === 'not_yet' ? 'Fasting/Later' : 'Light/Skip'),
      xp: `+${data.dinnerXp ?? 0} XP`,
      highlight: data.dinnerDone === true,
    }] : []),
    {
      label: 'Caffeine Air-Lock',
      value: data.caffeineDone ? (data.caffeineTime.length > 18 ? data.caffeineTime.slice(0, 17) + '…' : data.caffeineTime) : 'Past Cutoff',
      xp: `+${data.caffeineXp} XP`,
      highlight: !!data.caffeineDone,
    },
    ...(data.isDownscaled ? [{
      label: 'Recovery Protocol',
      value: '15m Kinetic Sprint',
      xp: 'Protected',
      highlight: true,
    }] : []),
    {
      label: 'Daily Wrap & Seal',
      value: 'Anchored',
      xp: `+${data.baseSealXp} XP`,
      highlight: true,
    },
  ];

  if (data.customHabitsCompletedCount > 0) {
    rows.push({
      label: 'Custom Habits',
      value: `${data.customHabitsCompletedCount} Completed`,
      xp: `+${data.customHabitsXp} XP`,
      highlight: true,
    });
  }

  rows.forEach((row, i) => {
    const y = startY + i * rowGap;

    ctx.textAlign = 'left';
    ctx.fillStyle = '#4A5D4E';
    ctx.font = isStory ? '21px monospace' : '13px monospace';
    ctx.fillText(row.label, leftX, y);

    ctx.textAlign = 'center';
    ctx.fillStyle = row.highlight ? '#1A3629' : '#738677';
    ctx.font = isStory ? 'bold 21px monospace' : 'bold 13px monospace';
    ctx.fillText(row.value, width / 2, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#B8862D';
    ctx.font = isStory ? 'bold 21px monospace' : 'bold 13px monospace';
    ctx.fillText(row.xp, rightX, y);
  });

  // Total Sealed XP Footer
  const footerY = isStory ? 1440 : 760;
  ctx.strokeStyle = '#1A3629';
  ctx.lineWidth = isStory ? 4 : 2;
  ctx.beginPath();
  ctx.moveTo(linePad, footerY);
  ctx.lineTo(width - linePad, footerY);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#1A3629';
  ctx.font = isStory ? 'bold 30px monospace' : 'bold 18px monospace';
  ctx.fillText('TOTAL EARNED', leftX, footerY + (isStory ? 60 : 36));

  ctx.textAlign = 'right';
  ctx.fillStyle = '#B8862D';
  ctx.font = isStory ? 'bold 36px monospace' : 'bold 22px monospace';
  ctx.fillText(`+${data.totalXp} XP`, rightX, footerY + (isStory ? 60 : 36));

  // Status Stamp
  ctx.textAlign = 'center';
  ctx.font = isStory ? 'bold 20px monospace' : 'bold 12px monospace';
  ctx.fillStyle = '#1A3629';
  ctx.fillText('[ LOGGED & SAVED ]', width / 2, footerY + (isStory ? 125 : 75));

  // Crisp Watermark (cyath.space / cyath.app)
  ctx.font = isStory ? 'bold 18px monospace' : '11px monospace';
  ctx.fillStyle = '#1A3629';
  ctx.fillText('cyath.space · Pixel-Perfect Health & Daily Habits', width / 2, footerY + (isStory ? 165 : 95));

  if (isStory) {
    ctx.font = '14px monospace';
    ctx.fillStyle = '#4A5D4E';
    ctx.fillText('1-TAP NUTRITION ENGINE · ZERO STREAK BURNOUT', width / 2, footerY + 200);
  }

  // Bottom Sawtooth Effect
  ctx.fillStyle = '#FFFDF9';
  const toothWidth = isStory ? 24 : 16;
  const toothHeight = isStory ? 16 : 10;
  const numTeeth = Math.ceil(width / toothWidth);
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let i = 0; i <= numTeeth; i++) {
    const x = i * toothWidth;
    ctx.lineTo(x + toothWidth / 2, height - toothHeight);
    ctx.lineTo(x + toothWidth, height);
  }
  ctx.closePath();
  ctx.fillStyle = '#1A3629';
  ctx.fill();

  return canvas;
}

export async function downloadReceiptPng(
  data: ReceiptExportData,
  filename?: string,
  format: 'card' | 'story' = data.format || 'card'
): Promise<void> {
  const canvas = await generateReceiptCanvas(data, format);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return;

  const defaultName = format === 'story'
    ? `cyath-story-${data.date}.png`
    : `cyath-receipt-${data.date}.png`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || defaultName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function shareReceiptImage(
  data: ReceiptExportData,
  format: 'card' | 'story' = data.format || 'card'
): Promise<{ shared: boolean; method: 'native' | 'clipboard' | 'download' }> {
  const canvas = await generateReceiptCanvas(data, format);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return { shared: false, method: 'download' };

  const defaultName = format === 'story'
    ? `cyath-story-${data.date}.png`
    : `cyath-receipt-${data.date}.png`;
  const file = new File([blob], defaultName, { type: 'image/png' });

  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `Cyath Daily ${format === 'story' ? 'Story' : 'Receipt'} · ${data.date}`,
        text: `Cyath Daily Metabolic ${format === 'story' ? 'Story (9:16)' : 'Receipt'} · Sealed +${data.totalXp} XP\nTrack your metabolic flow at cyath.space`,
        files: [file],
      });
      return { shared: true, method: 'native' };
    } catch {}
  }

  // Fallback to PNG download
  await downloadReceiptPng(data, undefined, format);
  return { shared: true, method: 'download' };
}
