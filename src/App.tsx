import { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import UploadStep from '@/components/UploadStep';
import ReviewStep from '@/components/ReviewStep';

interface Session {
  source: HTMLCanvasElement;
  watermarkText: string;
}

function buildWatermark(purpose: string): string {
  const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  return `Khusus untuk ${purpose}, ${date}`;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-lg font-semibold tracking-tight">SensorKTP</span>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-800 sm:inline-flex">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Tanpa unggah ke server
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 md:py-16">
        {session ? (
          <ReviewStep
            source={session.source}
            watermarkText={session.watermarkText}
            onReset={() => setSession(null)}
          />
        ) : (
          <UploadStep
            onContinue={(source, purpose) => setSession({ source, watermarkText: buildWatermark(purpose) })}
          />
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-10 text-center text-xs text-slate-500">
        Pemrosesan dilakukan sepenuhnya di browser Anda. Tutup halaman, dan semua foto ikut hilang.
      </footer>
    </div>
  );
}

export default App;
