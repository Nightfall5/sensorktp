import type { Rect, Region } from '@/lib/regions';

export type SensorStyle = 'solid' | 'blur';

const BLUR_CELL_SIZE = 12;

export const SENSOR_STYLE_LABELS: Record<SensorStyle, string> = {
  solid: 'Hitam penuh',
  blur: 'Blur',
};

function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number, text: string) {
  const fontSize = Math.max(18, Math.round(width * 0.03));
  ctx.save();
  ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = Math.max(2, fontSize / 10);
  ctx.textBaseline = 'middle';

  const stepX = ctx.measureText(text).width + fontSize * 2;
  const stepY = fontSize * 4;
  const diagonal = Math.hypot(width, height);

  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 8);
  for (let y = -diagonal / 2; y < diagonal / 2; y += stepY) {
    for (let x = -diagonal / 2; x < diagonal / 2; x += stepX) {
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
    }
  }
  ctx.restore();
}

function blurRegion(ctx: CanvasRenderingContext2D, source: HTMLCanvasElement, rect: Rect) {
  const cellsWide = Math.max(1, Math.round(rect.width / BLUR_CELL_SIZE));
  const cellsHigh = Math.max(1, Math.round(rect.height / BLUR_CELL_SIZE));
  const small = document.createElement('canvas');
  small.width = cellsWide;
  small.height = cellsHigh;
  const smallCtx = small.getContext('2d');
  if (!smallCtx) return;

  smallCtx.imageSmoothingEnabled = true;
  smallCtx.drawImage(source, rect.x, rect.y, rect.width, rect.height, 0, 0, cellsWide, cellsHigh);

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(small, 0, 0, cellsWide, cellsHigh, rect.x, rect.y, rect.width, rect.height);
}

function applyRegion(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  region: Region,
  style: SensorStyle,
) {
  if (style === 'solid') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(region.x, region.y, region.width, region.height);
  } else {
    blurRegion(ctx, source, region);
  }
}

export function renderSanitized(
  target: HTMLCanvasElement,
  source: HTMLCanvasElement,
  regions: Region[],
  watermarkText: string,
  style: SensorStyle,
  guide?: Rect | null,
) {
  target.width = source.width;
  target.height = source.height;
  const ctx = target.getContext('2d');
  if (!ctx) return;

  ctx.drawImage(source, 0, 0);
  for (const region of regions) {
    if (region.enabled) applyRegion(ctx, source, region, style);
  }
  drawWatermark(ctx, target.width, target.height, watermarkText);

  if (guide) {
    ctx.save();
    ctx.setLineDash([12, 8]);
    ctx.lineWidth = Math.max(3, target.width / 300);
    ctx.strokeStyle = '#0d9488';
    ctx.strokeRect(guide.x, guide.y, guide.width, guide.height);
    ctx.restore();
  }
}

export function exportSanitized(
  source: HTMLCanvasElement,
  regions: Region[],
  watermarkText: string,
  style: SensorStyle,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  renderSanitized(canvas, source, regions, watermarkText, style);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Gagal menyimpan gambar'))),
      'image/jpeg',
      0.92,
    );
  });
}
