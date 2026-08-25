import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, AlertCircle, Coffee, User, Clock, AlertTriangle } from 'lucide-react';
import { WasteLog, Ingredient, WasteReason } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface QuickWasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wasteLog: WasteLog) => void;
  ingredients: Ingredient[];
  baristas: string[];
}

const WASTE_REASONS: { label: WasteReason; icon: string; desc: string }[] = [
  { label: 'Kadaluarsa / Basi', icon: '⏱️', desc: 'Bahan melewati tanggal exp / bau asam' },
  { label: 'Tumpah / Rusak di Bar', icon: '💥', desc: 'Tersenggol, jatuh, pecah, bocor' },
  { label: 'Salah Resep / Barista Error', icon: '❌', desc: 'Salah takaran, salah sirup, salah order' },
  { label: 'Over-extraction / Dial-in Kopi', icon: '☕', desc: 'Shot espresso under/over saat kalibrasi' },
  { label: 'Sisa Prep / Overprep Harian', icon: '🥣', desc: 'Sisa susu steam di pitcher / adonan sisa' },
  { label: 'Kualitas Bahan Buruk / Reject Supplier', icon: '📦', desc: 'Bahan rusak dari distributor' },
  { label: 'Uji Coba Resep / QC Training', icon: '🧪', desc: 'Latihan barista / inovasi menu' },
  { label: 'Lainnya', icon: '📝', desc: 'Alasan operasional lainnya' },
];

export const QuickWasteModal: React.FC<QuickWasteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  ingredients,
  baristas,
}) => {
  const [selectedIngredientId, setSelectedIngredientId] = useState(ingredients[0]?.id || '');
  const [amount, setAmount] = useState<number>(100);
  const [reason, setReason] = useState<WasteReason>('Sisa Prep / Overprep Harian');
  const [responsiblePerson, setResponsiblePerson] = useState(baristas[0] || 'Barista');
  const [shift, setShift] = useState<'Shift Pagi (Opening)' | 'Shift Siang (Peak)' | 'Shift Malam (Closing)'>('Shift Siang (Peak)');
  const [isPreventable, setIsPreventable] = useState(true);
  const [notes, setNotes] = useState('');
  const [actionTaken, setActionTaken] = useState('');

  useEffect(() => {
    if (isOpen && ingredients.length > 0) {
      if (!selectedIngredientId) {
        setSelectedIngredientId(ingredients[0].id);
      }
    }
  }, [isOpen, ingredients, selectedIngredientId]);

  if (!isOpen) return null;

  const currentIngredient = ingredients.find(i => i.id === selectedIngredientId) || ingredients[0];
  const unit = currentIngredient?.usageUnit || 'gr';
  const costLost = (amount || 0) * (currentIngredient?.costPerUsageUnit || 0);

  const quickIncrements = unit === 'gr' 
    ? [10, 20, 50, 100, 250, 500] 
    : unit === 'ml'
    ? [50, 100, 200, 500, 1000]
    : [1, 2, 3, 5, 10];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentIngredient || amount <= 0) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newLog: WasteLog = {
      id: `wst-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      ingredientId: currentIngredient.id,
      ingredientName: currentIngredient.name,
      category: currentIngredient.category,
      amount: Number(amount),
      unit: currentIngredient.usageUnit,
      costLost,
      reason,
      responsiblePerson,
      shift,
      isPreventable,
      notes: notes.trim(),
      actionTaken: actionTaken.trim()
    };

    onSave(newLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 text-rose-400 flex items-center justify-center border border-zinc-700/80">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Catat Waste Bahan Baku
              </h3>
              <p className="text-[11px] text-zinc-400">
                Catatan bahan tumpah, basi, sisa prep, atau kalibrasi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1 text-zinc-200">
          
          {/* Ingredient Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-300">
              Pilih Bahan Baku
            </label>
            <select
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-zinc-700"
            >
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({ing.category}) - {formatRupiah(ing.costPerUsageUnit)}/{ing.usageUnit}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Quick Buttons */}
          <div className="space-y-2 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">
                Jumlah Terbuang:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 font-semibold text-sm text-center focus:outline-none focus:border-zinc-500"
                />
                <span className="text-xs font-medium text-zinc-400 w-7">{unit}</span>
              </div>
            </div>

            {/* Quick chips */}
            <div className="flex items-center gap-1 flex-wrap pt-0.5">
              <span className="text-[10px] text-zinc-400 mr-1">Cepat:</span>
              {quickIncrements.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                    amount === val
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                  }`}
                >
                  {val} {unit}
                </button>
              ))}
            </div>

            {/* Estimated Loss Indicator */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Estimasi Kerugian Biaya:</span>
              <span className="text-sm font-bold text-rose-400">
                {formatRupiah(costLost)}
              </span>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-300">
              Penyebab Waste
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {WASTE_REASONS.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setReason(r.label)}
                  className={`p-2 rounded-lg border text-left transition-colors flex items-start gap-1.5 ${
                    reason === r.label
                      ? 'bg-rose-500/10 border-rose-500/40 text-white'
                      : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <span className="text-sm">{r.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{r.label}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Shift & Responsible Barista */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-medium">
                Shift
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200"
              >
                <option value="Shift Pagi (Opening)">Shift Pagi</option>
                <option value="Shift Siang (Peak)">Shift Siang</option>
                <option value="Shift Malam (Closing)">Shift Malam</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-medium">
                Barista
              </label>
              <select
                value={responsiblePerson}
                onChange={(e) => setResponsiblePerson(e.target.value)}
                className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200"
              >
                {baristas.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400 font-medium">
              Catatan Singkat (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Kalibrasi grinder shot ke-4"
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Simpan ({formatRupiah(costLost)})</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
