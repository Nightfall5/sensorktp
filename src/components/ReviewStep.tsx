import { useEffect, useState } from 'react';
import { BoxSelect, Download, IdCard, LoaderCircle, MapPin, MousePointer2, RotateCcw, ScanFace, Trash2, TriangleAlert, type LucideIcon } from 'lucide-react';
import RedactionCanvas from '@/components/RedactionCanvas';
import { detectSensitiveRegions } from '@/lib/detectSensitiveRegions';
import { exportSanitized, SENSOR_STYLE_LABELS, type SensorStyle } from '@/lib/renderSanitized';
import { REGION_LABELS, type Region, type RegionKind } from '@/lib/regions';

const REGION_ICONS: Record<RegionKind, LucideIcon> = {
  nik: IdCard,
  alamat: MapPin,
  wajah: ScanFace,
  manual: BoxSelect,
};

interface ReviewStepProps {
  source: HTMLCanvasElement;
  watermarkText: string;
  onReset: () => void;
}

export default function ReviewStep({ source, watermarkText, onReset }: ReviewStepProps) {
  const [status, setStatus] = useState<'detecting' | 'ready'>('detecting');
  const [progress, setProgress] = useState(0);
  const [regions, setRegions] = useState<Region[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [style, setStyle] = useState<SensorStyle>('solid');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    detectSensitiveRegions(source, (value) => {
      if (!cancelled) setProgress(value);
    })
      .then(({ regions: detected, faceDetectionSupported }) => {
        if (cancelled) return;
        setRegions(detected);
        if (!faceDetectionSupported) {
          setNotice('Browser ini belum bisa mendeteksi wajah otomatis. Gunakan "Sensor manual" untuk menutup wajah.');
        }
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setNotice('Pembacaan otomatis gagal. Periksa pratinjau dan sensor area yang perlu ditutup secara manual.');
        setStatus('ready');
      });
    return () => {
      cancelled = true;
    };
  }, [source]);

  function toggleRegion(id: string) {
    setRegions((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  }

  function removeRegion(id: string) {
    setRegions((prev) => prev.filter((r) => r.id !== id));
  }

  function addManualRegion(rect: { x: number; y: number; width: number; height: number }) {
    setRegions((prev) => [...prev, { id: crypto.randomUUID(), kind: 'manual', ...rect, enabled: true }]);
  }

  async function handleDownload() {
    setIsExporting(true);
    setExportError(null);
    try {
      const blob = await exportSanitized(source, regions, watermarkText, style);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sensorktp-${Date.now()}.jpg`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError('Gagal menyimpan foto. Coba lagi.');
    } finally {
      setIsExporting(false);
    }
  }

  if (status === 'detecting') {
    return (
      <div className="mx-auto max-w-xl space-y-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-teal-600" aria-hidden />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Membaca dan mencari data sensitif</h2>
          <p className="text-sm text-slate-600">Proses ini berjalan di perangkat Anda dan bisa memakan waktu sebentar.</p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-600 transition-all duration-300"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <p className="text-xs tabular-nums text-slate-500">{Math.round(progress * 100)}%</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">Pratinjau hasil</h2>
          <button
            type="button"
            onClick={() => setManualMode((value) => !value)}
            aria-pressed={manualMode}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              manualMode
                ? 'bg-teal-700 text-white shadow-sm'
                : 'border border-slate-300 bg-white text-slate-700 hover:border-teal-500 hover:text-teal-700'
            }`}
          >
            {manualMode ? <MousePointer2 className="h-4 w-4" aria-hidden /> : <BoxSelect className="h-4 w-4" aria-hidden />}
            {manualMode ? 'Selesai sensor manual' : 'Sensor manual'}
          </button>
        </div>

        {manualMode && (
          <p className="text-sm text-teal-800">Seret area di foto untuk menutupnya dengan warna hitam.</p>
        )}

        <RedactionCanvas
          source={source}
          regions={regions}
          watermarkText={watermarkText}
          style={style}
          manualMode={manualMode}
          onAddRegion={addManualRegion}
        />
      </section>

      <aside className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900">Area yang disensor</h3>
          <p className="text-xs text-slate-500">Matikan area yang tidak perlu ditutup.</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-700">Gaya sensor</p>
          <div role="radiogroup" aria-label="Gaya sensor" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            {(Object.keys(SENSOR_STYLE_LABELS) as SensorStyle[]).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={style === option}
                onClick={() => setStyle(option)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  style === option ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {SENSOR_STYLE_LABELS[option]}
              </button>
            ))}
          </div>
        </div>

        {notice && (
          <div className="flex gap-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>{notice}</p>
          </div>
        )}

        {regions.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            Tidak ada data sensitif yang terdeteksi. Periksa pratinjau dan tambahkan area manual jika perlu.
          </p>
        ) : (
          <ul className="space-y-2">
            {regions.map((region) => {
              const Icon = REGION_ICONS[region.kind];
              return (
                <li
                  key={region.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5"
                >
                  <Icon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  <span className="flex-1 text-sm font-medium text-slate-800">{REGION_LABELS[region.kind]}</span>
                  {region.kind === 'manual' && (
                    <button
                      type="button"
                      onClick={() => removeRegion(region.id)}
                      aria-label="Hapus area manual"
                      className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={region.enabled}
                    aria-label={`Sensor ${REGION_LABELS[region.kind]}`}
                    onClick={() => toggleRegion(region.id)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      region.enabled ? 'bg-teal-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        region.enabled ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="space-y-3 border-t border-slate-200 pt-5">
          {exportError && <p className="text-sm text-red-600">{exportError}</p>}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-600/30 disabled:cursor-wait disabled:opacity-70"
          >
            <Download className="h-4 w-4" aria-hidden />
            {isExporting ? 'Menyiapkan...' : 'Unduh foto tersensor'}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Mulai dengan foto lain
          </button>
        </div>
      </aside>
    </div>
  );
}
