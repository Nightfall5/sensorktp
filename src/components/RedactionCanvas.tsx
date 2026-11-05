import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { renderSanitized, type SensorStyle } from '@/lib/renderSanitized';
import type { Rect, Region } from '@/lib/regions';

const MIN_MANUAL_SIZE = 8;

interface RedactionCanvasProps {
  source: HTMLCanvasElement;
  regions: Region[];
  watermarkText: string;
  style: SensorStyle;
  manualMode: boolean;
  onAddRegion: (rect: Rect) => void;
}

function rectFromPoints(a: { x: number; y: number }, b: { x: number; y: number }): Rect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  };
}

export default function RedactionCanvas({
  source,
  regions,
  watermarkText,
  style,
  manualMode,
  onAddRegion,
}: RedactionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [draft, setDraft] = useState<Rect | null>(null);

  useEffect(() => {
    if (canvasRef.current) renderSanitized(canvasRef.current, source, regions, watermarkText, style, draft);
  }, [source, regions, watermarkText, style, draft]);

  function toCanvasPoint(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
      y: (event.clientY - bounds.top) * (canvas.height / bounds.height),
    };
  }

  function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
    if (!manualMode) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = toCanvasPoint(event);
    setDraft({ x: dragStart.current.x, y: dragStart.current.y, width: 0, height: 0 });
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!dragStart.current) return;
    setDraft(rectFromPoints(dragStart.current, toCanvasPoint(event)));
  }

  function handlePointerUp() {
    if (draft && draft.width >= MIN_MANUAL_SIZE && draft.height >= MIN_MANUAL_SIZE) {
      onAddRegion(draft);
    }
    dragStart.current = null;
    setDraft(null);
  }

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`block h-auto w-full rounded-xl bg-slate-200 shadow-inner ${
        manualMode ? 'cursor-crosshair touch-none' : ''
      }`}
      aria-label="Pratinjau foto yang sudah disensor"
    />
  );
}
