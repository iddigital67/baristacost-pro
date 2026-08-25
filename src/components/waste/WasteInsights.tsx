import React from 'react';
import { Sparkles, Lightbulb, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { WasteLog, Ingredient } from '../../types';
import { formatRupiah, formatPercent } from '../../utils/formatters';

interface WasteInsightsProps {
  wasteLogs: WasteLog[];
  ingredients: Ingredient[];
}

export const WasteInsights: React.FC<WasteInsightsProps> = ({
  wasteLogs,
  ingredients,
}) => {
  // Compute key patterns
  const totalCost = wasteLogs.reduce((sum, w) => sum + (w.costLost || 0), 0);
  const preventableLogs = wasteLogs.filter(w => w.isPreventable);
  const preventableCost = preventableLogs.reduce((sum, w) => sum + (w.costLost || 0), 0);
  const preventablePercent = totalCost > 0 ? (preventableCost / totalCost) * 100 : 0;

  // Group by category
  const catCost: { [cat: string]: number } = {};
  wasteLogs.forEach(w => {
    catCost[w.category] = (catCost[w.category] || 0) + (w.costLost || 0);
  });
  const topCat = Object.entries(catCost).sort((a, b) => b[1] - a[1])[0];

  // Group by reason
  const reasonCost: { [r: string]: number } = {};
  wasteLogs.forEach(w => {
    reasonCost[w.reason] = (reasonCost[w.reason] || 0) + (w.costLost || 0);
  });
  const topReason = Object.entries(reasonCost).sort((a, b) => b[1] - a[1])[0];

  // Shift with most waste
  const shiftCost: { [s: string]: number } = {};
  wasteLogs.forEach(w => {
    shiftCost[w.shift] = (shiftCost[w.shift] || 0) + (w.costLost || 0);
  });
  const topShift = Object.entries(shiftCost).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <span>Insight Pintar & SOP Reduksi Waste Cafe</span>
      </div>

      {/* Main Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Card 1: Preventable waste potential savings */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-medium uppercase">Potensi Hemat</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-emerald-400">{formatRupiah(preventableCost)}</p>
          <p className="text-xs text-zinc-300">
            <strong className="text-amber-300">{formatPercent(preventablePercent, 0)}</strong> dari total waste diklasifikasikan sebagai <span className="underline">bisa dicegah</span> melalui disiplin SOP.
          </p>
        </div>

        {/* Card 2: Highest Waste Category */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-medium uppercase">Kategori Kritis</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-lg font-bold text-zinc-100">{topCat ? topCat[0] : '-'}</p>
          <p className="text-xs text-zinc-300">
            Menyumbang kerugian <strong className="text-rose-400">{formatRupiah(topCat ? topCat[1] : 0)}</strong>.
          </p>
        </div>

        {/* Card 3: Shift Evaluasi */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-medium uppercase">Shift Paling Rawan</span>
            <Lightbulb className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-lg font-bold text-zinc-100">{topShift ? topShift[0] : '-'}</p>
          <p className="text-xs text-zinc-300">
            Fokuskan evaluasi closing dan handover bahan baku di shift ini.
          </p>
        </div>

      </div>

      {/* Actionable Best Practice Tips */}
      <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
        <h4 className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Langkah Taktis Penurunan Food Waste di Coffee Shop:</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-zinc-300">
          <div className="p-3 bg-zinc-950/70 rounded-lg border border-zinc-800 space-y-1">
            <p className="font-medium text-zinc-200">1. Aturan Pitcher Susu (Milk Jug Size)</p>
            <p className="text-zinc-400 text-[11px]">
              Jangan steam 150ml susu di pitcher 600ml. Wajib gunakan pitcher 350ml untuk single cup agar sisa susu steam tidak terbuang sia-sia.
            </p>
          </div>

          <div className="p-3 bg-zinc-950/70 rounded-lg border border-zinc-800 space-y-1">
            <p className="font-medium text-zinc-200">2. Kalibrasi Grinder / Dial-in Terjadwal</p>
            <p className="text-zinc-400 text-[11px]">
              Batasi dial-in opening maksimal 3-4 shot. Catat click grinder & dose di papan barista setiap pergantian batch beans.
            </p>
          </div>

          <div className="p-3 bg-zinc-950/70 rounded-lg border border-zinc-800 space-y-1">
            <p className="font-medium text-zinc-200">3. Label FIFO & Rotasi Chiller</p>
            <p className="text-zinc-400 text-[11px]">
              Semua susu dan syrup botol yang sudah dibuka wajib ditempel stiker tanggal buka (Discard after 3 days for fresh milk).
            </p>
          </div>

          <div className="p-3 bg-zinc-950/70 rounded-lg border border-zinc-800 space-y-1">
            <p className="font-medium text-zinc-200">4. Batch Baking Pastry Bertahap</p>
            <p className="text-zinc-400 text-[11px]">
              Bake croissant di pagi hari 60% dari kuota. Sisa 40% di-bake jam 14.00 siang saat stok display mulai menipis.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
