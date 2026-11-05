import { createWorker, type Line } from 'tesseract.js';
import type { Rect, Region } from '@/lib/regions';

const NIK_PATTERN = /(?:\d\s*){16}/;
const ADDRESS_START = /alamat/i;
const ADDRESS_STOP = /(agama|status|pekerjaan|kewarganegaraan|berlaku|kelamin|darah)/i;
const ADDRESS_MAX_LINES = 5;
const TEXT_PADDING = 6;
const FACE_PADDING_RATIO = 0.12;

interface DetectedFace {
  boundingBox: DOMRectReadOnly;
}

interface FaceDetectorInstance {
  detect(source: CanvasImageSource): Promise<DetectedFace[]>;
}

type FaceDetectorConstructor = new (options?: {
  fastMode?: boolean;
  maxDetectedFaces?: number;
}) => FaceDetectorInstance;

export interface DetectionResult {
  regions: Region[];
  faceDetectionSupported: boolean;
}

function createId(): string {
  return crypto.randomUUID();
}

function unionBox(lines: Line[]): Rect {
  const x0 = Math.min(...lines.map((l) => l.bbox.x0));
  const y0 = Math.min(...lines.map((l) => l.bbox.y0));
  const x1 = Math.max(...lines.map((l) => l.bbox.x1));
  const y1 = Math.max(...lines.map((l) => l.bbox.y1));
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}

function padBox(box: Rect, padding: number, canvas: HTMLCanvasElement): Rect {
  const x = Math.max(0, box.x - padding);
  const y = Math.max(0, box.y - padding);
  const right = Math.min(canvas.width, box.x + box.width + padding);
  const bottom = Math.min(canvas.height, box.y + box.height + padding);
  return { x, y, width: right - x, height: bottom - y };
}

function toRegion(kind: Region['kind'], box: Rect): Region {
  return { id: createId(), kind, ...box, enabled: true };
}

async function readLines(canvas: HTMLCanvasElement, onProgress: (value: number) => void): Promise<Line[]> {
  const worker = await createWorker('ind', 1, {
    logger: (message) => {
      if (message.status === 'recognizing text') onProgress(message.progress);
    },
  });
  try {
    const { data } = await worker.recognize(canvas, {}, { blocks: true });
    return (data.blocks ?? []).flatMap((block) =>
      block.paragraphs.flatMap((paragraph) => paragraph.lines),
    );
  } finally {
    await worker.terminate();
  }
}

function findNikRegions(lines: Line[], canvas: HTMLCanvasElement): Region[] {
  return lines
    .filter((line) => NIK_PATTERN.test(line.text))
    .map((line) => toRegion('nik', padBox(unionBox([line]), TEXT_PADDING, canvas)));
}

function findAddressRegions(lines: Line[], canvas: HTMLCanvasElement): Region[] {
  const start = lines.findIndex((line) => ADDRESS_START.test(line.text));
  if (start === -1) return [];

  const group = [lines[start]];
  for (let i = start + 1; i < lines.length && i < start + ADDRESS_MAX_LINES; i++) {
    if (ADDRESS_STOP.test(lines[i].text)) break;
    group.push(lines[i]);
  }
  return [toRegion('alamat', padBox(unionBox(group), TEXT_PADDING, canvas))];
}

async function findFaceRegions(canvas: HTMLCanvasElement): Promise<Region[] | null> {
  const FaceDetector = (window as unknown as { FaceDetector?: FaceDetectorConstructor }).FaceDetector;
  if (!FaceDetector) return null;

  try {
    const detector = new FaceDetector({ fastMode: false, maxDetectedFaces: 4 });
    const faces = await detector.detect(canvas);
    return faces.map((face) => {
      const { x, y, width, height } = face.boundingBox;
      const padX = width * FACE_PADDING_RATIO;
      const padY = height * FACE_PADDING_RATIO;
      return toRegion('wajah', padBox({ x, y, width, height }, Math.max(padX, padY), canvas));
    });
  } catch {
    return [];
  }
}

export async function detectSensitiveRegions(
  canvas: HTMLCanvasElement,
  onProgress: (value: number) => void,
): Promise<DetectionResult> {
  const lines = await readLines(canvas, onProgress);
  const faceRegions = await findFaceRegions(canvas);

  return {
    regions: [
      ...findNikRegions(lines, canvas),
      ...findAddressRegions(lines, canvas),
      ...(faceRegions ?? []),
    ],
    faceDetectionSupported: faceRegions !== null,
  };
}
