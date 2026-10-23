import React, { useState } from 'react';
import { X, Smartphone, Monitor, Share, PlusSquare, MoreVertical, Download, CheckCircle2 } from 'lucide-react';
import { DeviceType } from '../hooks/usePWA';

interface PWAManualGuideModalProps {
  deviceType: DeviceType;
  isIOS: boolean;
  onClose: () => void;
}

export const PWAManualGuideModal: React.FC<PWAManualGuideModalProps> = ({
  deviceType,
  isIOS,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>(() => {
    if (isIOS) return 'ios';
    if (deviceType === 'android') return 'android';
    return 'desktop';
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-guide-title"
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col text-slate-200 max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 id="pwa-guide-title" className="font-game text-xl text-white">
                Panduan Instal Game
              </h2>
              <p className="text-[11px] text-slate-400">
                Mainkan langsung dari layar utama tanpa browser bar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup panduan"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-xl mt-4 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone / iPad</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition cursor-pointer ${
              activeTab === 'android'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>

          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition cursor-pointer ${
              activeTab === 'desktop'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>PC / Mac</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto py-4 space-y-3.5 text-xs text-slate-300">
          {activeTab === 'ios' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <p className="font-semibold text-white">
                    Buka website ini di browser <strong>Safari</strong>.
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Ketuk tombol <strong>Bagikan (Share)</strong> <Share className="inline w-3.5 h-3.5 text-sky-400 align-text-bottom mx-1" /> di bilah bawah peramban.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <p className="font-semibold text-white">
                    Pilih <strong>Tambahkan ke Layar Utama</strong>.
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Gulir ke bawah pada menu bagikan, lalu ketuk opsi <PlusSquare className="inline w-3.5 h-3.5 text-amber-400 align-text-bottom mx-1" /> <em>Add to Home Screen</em>.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <p className="font-semibold text-white">
                    Konfirmasi dengan mengetuk <strong>Tambah (Add)</strong>.
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Ikon game akan langsung muncul di layar utama perangkat Anda.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <p className="font-semibold text-white">
                    Buka menu opsi browser <strong>Chrome</strong>.
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Ketuk ikon tiga titik <MoreVertical className="inline w-3.5 h-3.5 text-slate-300 align-text-bottom" /> di pojok kanan atas browser.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <p className="font-semibold text-white">
                    Pilih <strong>Instal Aplikasi</strong> atau <strong>Tambahkan ke Layar Utama</strong>.
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Tunggu beberapa detik dan jendela konfirmasi sistem akan muncul.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <p className="font-semibold text-white">
                    Selesai! Buka game dari aplikasi.
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Game dapat dimainkan dengan layar penuh dan performa lebih cepat.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'desktop' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <p className="font-semibold text-white">
                    Periksa bilah alamat (URL bar) browser Chrome atau Edge.
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Klik ikon komputer/download <Download className="inline w-3.5 h-3.5 text-amber-400 align-text-bottom mx-1" /> di sebelah kanan bilah URL.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <p className="font-semibold text-white">
                    Atau gunakan menu browser (⋮).
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Klik menu tiga titik $\to$ pilih <strong>Instal "JUMPING: THE GAME"</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <p className="font-semibold text-white">
                    Game akan terbuka di jendela tersendiri.
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Bisa diakses langsung dari desktop dan start menu seperti aplikasi native.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Benefits reminder */}
        <div className="pt-3 pb-1 border-t border-slate-800/90 flex items-center justify-around text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Akses Cepat
          </span>
          <span className="flex items-center gap-1 text-sky-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Layar Penuh
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Support Offline
          </span>
        </div>

        {/* Close Button */}
        <div className="pt-3">
          <button
            onClick={onClose}
            className="w-full py-2.5 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export const PWAInstallGuide = PWAManualGuideModal;

