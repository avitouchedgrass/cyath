export interface TrophyExportData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tier?: string;
  isShame?: boolean;
  count: number;
  masteryLabel: string;
  masteryTier: 'standard' | 'silver' | 'gold';
}

export async function generateTrophyCanvas(data: TrophyExportData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  const width = 640;
  const height = 800;
  canvas.width = width;
  canvas.height = height;

  // 1. Velvet Dark Obsidian Background
  ctx.fillStyle = '#0B1711';
  ctx.fillRect(0, 0, width, height);

  // Subtle radial glow from trophy center
  const radialGlow = ctx.createRadialGradient(width / 2, 280, 20, width / 2, 280, 280);
  if (data.isShame) {
    radialGlow.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
    radialGlow.addColorStop(1, 'rgba(11, 23, 17, 0)');
  } else if (data.tier === 'Celestial') {
    radialGlow.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
    radialGlow.addColorStop(0.6, 'rgba(6, 182, 212, 0.15)');
    radialGlow.addColorStop(1, 'rgba(11, 23, 17, 0)');
  } else if (data.masteryTier === 'gold' || data.tier === 'Gold') {
    radialGlow.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
    radialGlow.addColorStop(1, 'rgba(11, 23, 17, 0)');
  } else {
    radialGlow.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
    radialGlow.addColorStop(1, 'rgba(11, 23, 17, 0)');
  }
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // 2. 16-Bit Pixel Museum Frame
  ctx.strokeStyle = '#1A3629';
  ctx.lineWidth = 6;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  ctx.strokeStyle = data.isShame ? '#DC2626' : '#C89332';
  ctx.lineWidth = 2;
  ctx.strokeRect(26, 26, width - 52, height - 52);

  // Corner pixel studs
  const drawCornerStud = (x: number, y: number) => {
    ctx.fillStyle = '#E8BE5A';
    ctx.fillRect(x - 5, y - 5, 10, 10);
    ctx.fillStyle = '#7E5316';
    ctx.fillRect(x - 3, y - 3, 6, 6);
    ctx.fillStyle = '#FFEAA7';
    ctx.fillRect(x - 2, y - 2, 3, 3);
  };
  drawCornerStud(32, 32);
  drawCornerStud(width - 32, 32);
  drawCornerStud(32, height - 32);
  drawCornerStud(width - 32, height - 32);

  // 3. Top Banner
  ctx.textAlign = 'center';
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = data.isShame ? '#F87171' : '#FCD34D';
  ctx.fillText(
    data.isShame ? 'SATIRICAL SHAME RELIC' : 'CYATH SPECIMEN ARCHIVE',
    width / 2,
    64
  );

  ctx.font = '10px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText('OFFICIAL SANCTUARY CITATION', width / 2, 82);

  // Divider Line
  ctx.strokeStyle = 'rgba(200, 147, 50, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 96);
  ctx.lineTo(width - 80, 96);
  ctx.stroke();

  // 4. Draw Center Pixel Chalice / Trophy
  const cx = width / 2;
  const cy = 250;

  // Chalice Pedestal & Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 90, 80, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Color Palette per tier
  let primaryCol = '#C89332';
  let lightCol = '#FDE047';
  let shadowCol = '#78350F';

  if (data.isShame) {
    primaryCol = '#DC2626';
    lightCol = '#F87171';
    shadowCol = '#7F1D1D';
  } else if (data.tier === 'Celestial') {
    primaryCol = '#9333EA';
    lightCol = '#C084FC';
    shadowCol = '#581C87';
  } else if (data.masteryTier === 'silver' || data.tier === 'Silver') {
    primaryCol = '#94A3B8';
    lightCol = '#E2E8F0';
    shadowCol = '#475569';
  }

  // Pixelated Chalice Base
  ctx.fillStyle = shadowCol;
  ctx.fillRect(cx - 45, cy + 68, 90, 14);
  ctx.fillStyle = primaryCol;
  ctx.fillRect(cx - 36, cy + 54, 72, 14);
  ctx.fillStyle = lightCol;
  ctx.fillRect(cx - 32, cy + 56, 64, 4);

  // Stem
  ctx.fillStyle = shadowCol;
  ctx.fillRect(cx - 12, cy + 18, 24, 36);
  ctx.fillStyle = primaryCol;
  ctx.fillRect(cx - 8, cy + 18, 16, 36);
  ctx.fillStyle = lightCol;
  ctx.fillRect(cx - 6, cy + 20, 6, 32);

  // Main Cup / Chalice Bowl
  ctx.fillStyle = shadowCol;
  ctx.fillRect(cx - 52, cy - 54, 104, 72);
  ctx.fillStyle = primaryCol;
  ctx.fillRect(cx - 46, cy - 50, 92, 64);
  ctx.fillStyle = lightCol;
  ctx.fillRect(cx - 42, cy - 46, 84, 10);
  ctx.fillRect(cx - 40, cy - 36, 14, 44);

  // Handles
  ctx.fillStyle = primaryCol;
  ctx.fillRect(cx - 72, cy - 40, 20, 10);
  ctx.fillRect(cx - 72, cy - 30, 10, 36);
  ctx.fillRect(cx - 64, cy + 2, 16, 8);

  ctx.fillRect(cx + 52, cy - 40, 20, 10);
  ctx.fillRect(cx + 62, cy - 30, 10, 36);
  ctx.fillRect(cx + 48, cy + 2, 16, 8);

  // Chalice Emblem Gem
  ctx.fillStyle = data.isShame ? '#FCA5A5' : '#67E8F9';
  ctx.fillRect(cx - 10, cy - 14, 20, 20);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(cx - 6, cy - 10, 6, 6);

  // 5. Specimen Title & Subtitle
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 30px "Cabinet Grotesk", sans-serif';
  ctx.fillText(data.title, width / 2, 420);

  ctx.fillStyle = data.isShame ? '#FCA5A5' : '#FCD34D';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(data.subtitle, width / 2, 452);

  // 6. Mastery Badge Pill
  const badgeY = 482;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(cx - 130, badgeY, 260, 32);
  ctx.strokeStyle = data.masteryTier === 'gold' ? '#F59E0B' : data.masteryTier === 'silver' ? '#CBD5E1' : '#10B981';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cx - 130, badgeY, 260, 32);

  ctx.fillStyle = data.masteryTier === 'gold' ? '#FDE68A' : data.masteryTier === 'silver' ? '#F1F5F9' : '#A7F3D0';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`${data.masteryLabel} · ${data.count}x Claimed`, width / 2, badgeY + 20);

  // 7. Lore / Citation Description (Multi-line wrap)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
  ctx.font = '13px "Cabinet Grotesk", sans-serif';

  const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
  };

  wrapText(data.description, width / 2, 555, 500, 22);

  // 8. Footer
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 715);
  ctx.lineTo(width - 80, 715);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '11px monospace';
  ctx.fillText(`SPECIMEN ID: ${data.id.toUpperCase()} · VERIFIED PROTOCOL`, width / 2, 742);

  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('https://cyath.space · Circadian Sanctuary', width / 2, 762);

  return canvas;
}

export async function downloadTrophyPng(data: TrophyExportData, filename?: string): Promise<void> {
  const canvas = await generateTrophyCanvas(data);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `cyath-trophy-${data.id}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function shareTrophyImage(data: TrophyExportData): Promise<{ shared: boolean; method: 'native' | 'clipboard' | 'download' }> {
  const canvas = await generateTrophyCanvas(data);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return { shared: false, method: 'download' };

  const file = new File([blob], `cyath-trophy-${data.id}.png`, { type: 'image/png' });

  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `${data.title} · Cyath Relic`,
        text: `[Cyath Specimen Relic] ${data.title} (${data.masteryLabel})\n${data.subtitle}\nVerified consistency on Cyath: https://cyath.space`,
        files: [file],
      });
      return { shared: true, method: 'native' };
    } catch {}
  }

  // Fallback to direct PNG download
  await downloadTrophyPng(data);
  return { shared: true, method: 'download' };
}
