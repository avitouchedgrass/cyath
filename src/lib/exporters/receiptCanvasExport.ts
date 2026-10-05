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
}

export async function generateReceiptCanvas(data: ReceiptExportData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  const width = 640;
  const height = 960;
  canvas.width = width;
  canvas.height = height;

  // Background Parchment
  ctx.fillStyle = '#FFFDF9';
  ctx.fillRect(0, 0, width, height);

  // Outer 16-Bit Border
  ctx.strokeStyle = '#1A3629';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Inner subtle border
  ctx.strokeStyle = 'rgba(26, 54, 41, 0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(22, 22, width - 44, height - 44);

  // Top Brass Pushpin Graphic
  const pinX = width / 2;
  const pinY = 48;
  
  // Pin Shadow
  ctx.fillStyle = 'rgba(26, 54, 41, 0.25)';
  ctx.fillRect(pinX - 10, pinY + 8, 24, 6);

  // Pin Head (16-bit brass)
  ctx.fillStyle = '#C89332';
  ctx.fillRect(pinX - 12, pinY - 14, 24, 18);
  ctx.fillStyle = '#E8BE5A';
  ctx.fillRect(pinX - 9, pinY - 11, 18, 12);
  ctx.fillStyle = '#FFEAA7';
  ctx.fillRect(pinX - 6, pinY - 8, 6, 6);
  ctx.fillStyle = '#7E5316';
  ctx.fillRect(pinX - 12, pinY + 2, 24, 4);

  // Header Title
  ctx.fillStyle = '#1A3629';
  ctx.textAlign = 'center';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('*** CYATH SANCTUARY DISPATCH ***', width / 2, 105);

  ctx.font = '13px monospace';
  ctx.fillStyle = '#4A5D4E';
  ctx.fillText(`DATE: ${data.date}  ·  LEVEL ${data.level}`, width / 2, 128);

  ctx.strokeStyle = 'rgba(26, 54, 41, 0.25)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(36, 142);
  ctx.lineTo(width - 36, 142);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw Island Artwork
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = data.islandImageUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, width / 2 - 110, 155, 220, 220);
  } catch {}

  // Island Name & Sub-badge
  ctx.fillStyle = '#1A3629';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(data.islandName.toUpperCase(), width / 2, 400);

  ctx.strokeStyle = 'rgba(26, 54, 41, 0.25)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(36, 420);
  ctx.lineTo(width - 36, 420);
  ctx.stroke();
  ctx.setLineDash([]);

  // Itemized Biometric Rows
  const startY = 460;
  const rowGap = 38;
  const leftX = 48;
  const rightX = width - 48;

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
    ctx.font = '13px monospace';
    ctx.fillText(row.label, leftX, y);

    ctx.textAlign = 'center';
    ctx.fillStyle = row.highlight ? '#1A3629' : '#738677';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(row.value, width / 2, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#B8862D';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(row.xp, rightX, y);
  });

  // Total Sealed XP Footer
  const footerY = 760;
  ctx.strokeStyle = '#1A3629';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(36, footerY);
  ctx.lineTo(width - 36, footerY);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#1A3629';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('TOTAL EARNED', leftX, footerY + 36);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#B8862D';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(`+${data.totalXp} XP`, rightX, footerY + 36);

  // Status Stamp
  ctx.textAlign = 'center';
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#1A3629';
  ctx.fillText('[ LOGGED & SAVED ]', width / 2, footerY + 75);
  ctx.font = '11px monospace';
  ctx.fillStyle = '#4A5D4E';
  ctx.fillText('https://cyath.space · Daily Habit Tracker', width / 2, footerY + 95);

  // Bottom Sawtooth Effect
  ctx.fillStyle = '#FFFDF9';
  const toothWidth = 16;
  const toothHeight = 10;
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

export async function downloadReceiptPng(data: ReceiptExportData, filename?: string): Promise<void> {
  const canvas = await generateReceiptCanvas(data);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `cyath-receipt-${data.date}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function shareReceiptImage(data: ReceiptExportData): Promise<{ shared: boolean; method: 'native' | 'clipboard' | 'download' }> {
  const canvas = await generateReceiptCanvas(data);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return { shared: false, method: 'download' };

  const file = new File([blob], `cyath-receipt-${data.date}.png`, { type: 'image/png' });

  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `Cyath Daily Receipt · ${data.date}`,
        text: `Cyath Daily Metabolic Receipt · Sealed +${data.totalXp} XP\nTrack your metabolic flow at cyath.space`,
        files: [file],
      });
      return { shared: true, method: 'native' };
    } catch {}
  }

  // Fallback to PNG download
  await downloadReceiptPng(data);
  return { shared: true, method: 'download' };
}
