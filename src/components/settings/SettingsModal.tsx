import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Check, 
  Trash2, 
  Store, 
  DollarSign, 
  KeyRound, 
  ShieldCheck 
} from 'lucide-react';
import { CafeSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CafeSettings;
  onSaveSettings: (settings: CafeSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [cafeName, setCafeName] = useState(settings.cafeName);
  const [tagline, setTagline] = useState(settings.tagline || '');
  const [defaultTargetMargin, setDefaultTargetMargin] = useState(settings.defaultTargetMargin || 65);
  const [maxWasteTolerancePercent, setMaxWasteTolerancePercent] = useState(settings.maxWasteTolerancePercent || 3);
  const [monthlyRevenueTarget, setMonthlyRevenueTarget] = useState(settings.monthlyRevenueTarget || 50000000);
  const [monthlyFixedCost, setMonthlyFixedCost] = useState(settings.monthlyFixedCost || 15000000);
  const [baristas, setBaristas] = useState<string[]>(settings.baristas || []);
  const [ownerPin, setOwnerPin] = useState(settings.ownerPin || '1234');
  const [baristaPins, setBaristaPins] = useState<Record<string, string>>(settings.baristaPins || {});
  
  const [newBaristaName, setNewBaristaName] = useState('');
  const [newBaristaPin, setNewBaristaPin] = useState('');

  if (!isOpen) return null;

  const handleAddBarista = () => {
    if (!newBaristaName.trim()) return;
    const name = newBaristaName.trim();
    if (!baristas.includes(name)) {
      setBaristas([...baristas, name]);
      setBaristaPins(prev => ({
        ...prev,
        [name]: newBaristaPin.trim() || '1234'
      }));
    }
    setNewBaristaName('');
    setNewBaristaPin('');
  };

  const handleRemoveBarista = (nameToRemove: string) => {
    setBaristas(baristas.filter((b) => b !== nameToRemove));
    setBaristaPins(prev => {
      const updated = { ...prev };
      delete updated[nameToRemove];
      return updated;
    });
  };

  const handleUpdateBaristaPin = (name: string, pin: string) => {
    setBaristaPins(prev => ({
      ...prev,
      [name]: pin.replace(/\D/g, '').slice(0, 6)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      cafeName: cafeName.trim() || 'Cafe Kita',
      tagline: tagline.trim(),
      currency: 'IDR',
      defaultTargetMargin: Number(defaultTargetMargin) || 65,
      maxWasteTolerancePercent: Number(maxWasteTolerancePercent) || 3,
      monthlyRevenueTarget: Number(monthlyRevenueTarget) || 0,
      monthlyFixedCost: Number(monthlyFixedCost) || 0,
      baristas: baristas.length > 0 ? baristas : ['Barista 1'],
      ownerPin: ownerPin.trim() || '1234',
      baristaPins: baristaPins
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/80 text-amber-400 flex items-center justify-center">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Pengaturan Outlet & Keamanan PIN
              </h3>
              <p className="text-[11px] text-zinc-400">
                Profil bisnis, target margin laba, PIN Owner, dan PIN Barista.
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

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 text-zinc-200 text-xs">
          
          {/* Cafe Profile */}
          <div className="space-y-2">
            <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5 text-xs">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>Profil Outlet Cafe</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-zinc-400 font-medium text-[11px]">Nama Coffee Shop</label>
                <input
                  type="text"
                  required
                  value={cafeName}
                  onChange={(e) => setCafeName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-medium text-[11px]">Tagline / Slogan</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>
          </div>

          {/* Security & PIN Settings */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5 text-xs">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Keamanan & PIN Masing-Masing User</span>
              </h4>
              <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                4-6 Digit
              </span>
            </div>

            {/* Owner PIN Setting */}
            <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-zinc-200">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-xs">PIN Owner / Manajemen</span>
                </div>
                <span className="text-[10px] text-amber-400 font-medium">Proteksi HPP</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={ownerPin}
                  onChange={(e) => setOwnerPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="w-24 px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-amber-400 font-mono tracking-widest text-xs focus:outline-none text-center font-bold"
                />
                <span className="text-[11px] text-zinc-400">
                  PIN untuk membuka data HPP, laporan finansial, dan setting.
                </span>
              </div>
            </div>

            {/* Individual Barista PINs */}
            <div className="space-y-1.5 pt-1">
              <label className="text-zinc-300 font-medium text-[11px] block">
                Daftar Barista & PIN Mandiri:
              </label>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {baristas.map((name, idx) => {
                  const currentBaristaPin = baristaPins[name] || '1234';
                  return (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-semibold flex items-center justify-center shrink-0">
                          {name.charAt(0)}
                        </div>
                        <span className="font-medium text-zinc-200 text-xs truncate">{name}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-zinc-400">PIN:</span>
                        <input
                          type="text"
                          maxLength={6}
                          value={currentBaristaPin}
                          onChange={(e) => handleUpdateBaristaPin(name, e.target.value)}
                          placeholder="PIN"
                          className="w-16 px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-center text-zinc-100 font-mono text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveBarista(name)}
                          className="p-1 text-zinc-500 hover:text-rose-400 rounded transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Barista Form with PIN */}
              <div className="pt-1 flex gap-1.5">
                <input
                  type="text"
                  value={newBaristaName}
                  onChange={(e) => setNewBaristaName(e.target.value)}
                  placeholder="Nama barista baru..."
                  className="flex-1 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:outline-none"
                />
                <input
                  type="text"
                  maxLength={6}
                  value={newBaristaPin}
                  onChange={(e) => setNewBaristaPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="PIN"
                  className="w-20 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-center text-zinc-100 font-mono text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddBarista}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-lg text-xs transition-colors"
                >
                  + Tambah
                </button>
              </div>

            </div>
          </div>

          {/* Financial Targets */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5 text-xs">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Finansial & Toleransi Waste</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-zinc-400 font-medium text-[11px]">Default Target Margin (% Laba)</label>
                <input
                  type="number"
                  min="20"
                  max="90"
                  value={defaultTargetMargin}
                  onChange={(e) => setDefaultTargetMargin(Number(e.target.value))}
                  className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-medium text-[11px]">Toleransi Waste (% HPP)</label>
                <input
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.1"
                  value={maxWasteTolerancePercent}
                  onChange={(e) => setMaxWasteTolerancePercent(Number(e.target.value))}
                  className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-medium text-[11px]">Target Omset Bulanan (Rp)</label>
                <input
                  type="number"
                  value={monthlyRevenueTarget}
                  onChange={(e) => setMonthlyRevenueTarget(Number(e.target.value))}
                  className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-medium text-[11px]">Biaya Operasional Tetap (Rp)</label>
                <input
                  type="number"
                  value={monthlyFixedCost}
                  onChange={(e) => setMonthlyFixedCost(Number(e.target.value))}
                  className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2 sticky bottom-0 bg-zinc-900 py-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-medium text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Simpan</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
