import { useEffect, useState, type DragEvent } from 'react';
import { ImagePlus, ShieldCheck } from 'lucide-react';
import { loadImageToCanvas } from '@/lib/loadImageToCanvas';

const MAX_PURPOSE_LENGTH = 80;

interface UploadStepProps {
  onContinue: (source: HTMLCanvasElement, purpose: string) => void;
}

export default function UploadStep({ onContinue }: UploadStepProps) {
  const [purpose, setPurpose] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [source, setSource] = useState<HTMLCanvasElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa foto (JPG, PNG, atau WEBP).');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const canvas = await loadImageToCanvas(file);
      setSource(canvas);
      setPreviewUrl(URL.createObjectURL(file));
    } catch {
      setError('Foto tidak bisa dibuka. Coba gunakan foto lain.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    void handleFile(event.dataTransfer.files[0]);
  }

  const canContinue = source !== null && purpose.trim().length > 0 && !isLoading;

  return (
    <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
      <section className="space-y-4">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 md:text-4xl">
            Sensor KTP sebelum Anda kirim.
          </h1>
          <p className="text-base leading-relaxed text-slate-600">
            NIK, alamat, dan wajah disamarkan otomatis. Foto diberi watermark tujuan dan tanggal, sehingga sulit dipakai untuk keperluan lain.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-slate-700">
          <li className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden />
            Semua proses berjalan di perangkat Anda. Foto tidak pernah dikirim ke server mana pun.
          </li>
          <li className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden />
            Anda tetap bisa memeriksa hasilnya dan menambah area sensor secara manual.
          </li>
        </ul>
      </section>

      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <label htmlFor="purpose" className="text-sm font-medium text-slate-800">
            Untuk keperluan apa foto ini dikirim?
          </label>
          <input
            id="purpose"
            type="text"
            value={purpose}
            maxLength={MAX_PURPOSE_LENGTH}
            onChange={(event) => setPurpose(event.target.value)}
            placeholder="Contoh: pengajuan KPR Bank ABC"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 transition focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/15"
          />
        </div>

        <label
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
            isDragging
              ? 'border-teal-600 bg-teal-50'
              : 'border-slate-300 bg-slate-50 hover:border-teal-500 hover:bg-teal-50/50'
          }`}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Pratinjau foto KTP" className="max-h-48 rounded-lg object-contain shadow-sm" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-teal-600 shadow-sm">
              <ImagePlus className="h-6 w-6" aria-hidden />
            </span>
          )}
          <span className="text-sm font-medium text-slate-800">
            {isLoading ? 'Membuka foto...' : previewUrl ? 'Ganti foto' : 'Seret foto KTP ke sini, atau klik untuk memilih'}
          </span>
          <span className="text-xs text-slate-500">JPG, PNG, atau WEBP</span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              void handleFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="button"
          disabled={!canContinue}
          onClick={() => source && onContinue(source, purpose.trim())}
          className="w-full rounded-xl bg-teal-700 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-600/30 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          Lanjut ke sensor
        </button>
      </section>
    </div>
  );
}
