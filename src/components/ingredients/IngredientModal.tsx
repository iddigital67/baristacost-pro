import React, { useState, useEffect } from 'react';
import { X, Package, Check, Calculator } from 'lucide-react';
import { Ingredient, IngredientCategory, UnitType } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ingredient: Ingredient) => void;
  editingIngredient?: Ingredient | null;
}

const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  'Kopi & Espresso',
  'Susu & Dairy',
  'Syrup & Sauce',
  'Powder & Teh',
  'Buah & Minuman',
  'Bakery & Pastry',
  'Kitchen & Protein',
  'Bumbu & Saus',
  'Packaging & Cup',
];

const UNIT_OPTIONS: UnitType[] = ['gr', 'kg', 'ml', 'liter', 'pcs', 'pack', 'slice', 'can', 'portion'];

export const IngredientModal: React.FC<IngredientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingIngredient,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<IngredientCategory>('Kopi & Espresso');
  const [purchaseUnit, setPurchaseUnit] = useState<UnitType>('kg');
  const [purchasePrice, setPurchasePrice] = useState<number>(150000);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);
  const [usageUnit, setUsageUnit] = useState<UnitType>('gr');
  const [conversionRate, setConversionRate] = useState<number>(1000);
  const [currentStock, setCurrentStock] = useState<number>(2000);
  const [minStockAlert, setMinStockAlert] = useState<number>(500);
  const [supplier, setSupplier] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingIngredient) {
      setName(editingIngredient.name);
      setCategory(editingIngredient.category);
      setPurchaseUnit(editingIngredient.purchaseUnit);
      setPurchasePrice(editingIngredient.purchasePrice);
      setPurchaseQuantity(editingIngredient.purchaseQuantity || 1);
      setUsageUnit(editingIngredient.usageUnit);
      setConversionRate(editingIngredient.conversionRate || 1000);
      setCurrentStock(editingIngredient.currentStock);
      setMinStockAlert(editingIngredient.minStockAlert);
      setSupplier(editingIngredient.supplier || '');
      setExpiryDate(editingIngredient.expiryDate || '');
      setNotes(editingIngredient.notes || '');
    } else {
      setName('');
      setCategory('Kopi & Espresso');
      setPurchaseUnit('kg');
      setPurchasePrice(180000);
      setPurchaseQuantity(1);
      setUsageUnit('gr');
      setConversionRate(1000);
      setCurrentStock(2000);
      setMinStockAlert(500);
      setSupplier('');
      setExpiryDate('');
      setNotes('');
    }
  }, [editingIngredient, isOpen]);

  if (!isOpen) return null;

  const handlePurchaseUnitChange = (pUnit: UnitType) => {
    setPurchaseUnit(pUnit);
    if (pUnit === 'kg' && usageUnit !== 'gr') {
      setUsageUnit('gr');
      setConversionRate(1000);
    } else if (pUnit === 'liter' && usageUnit !== 'ml') {
      setUsageUnit('ml');
      setConversionRate(1000);
    } else if (pUnit === 'pack') {
      setUsageUnit('pcs');
      setConversionRate(1);
    }
  };

  const costPerUsageUnit = (purchaseQuantity * conversionRate) > 0
    ? purchasePrice / (purchaseQuantity * conversionRate)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newIng: Ingredient = {
      id: editingIngredient ? editingIngredient.id : `ing-${Date.now()}`,
      name: name.trim(),
      category,
      purchaseUnit,
      purchasePrice: Number(purchasePrice),
      purchaseQuantity: Number(purchaseQuantity) || 1,
      usageUnit,
      conversionRate: Number(conversionRate) || 1,
      currentStock: Number(currentStock) || 0,
      minStockAlert: Number(minStockAlert) || 0,
      costPerUsageUnit,
      supplier: supplier.trim(),
      expiryDate: expiryDate || '',
      notes: notes.trim(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    onSave(newIng);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/80 text-amber-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                {editingIngredient ? 'Edit Data Bahan Baku' : 'Tambah Master Bahan Baku'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Konversi otomatis harga pembelian ke modal per gram/ml.
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
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1 text-zinc-200">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] font-medium text-zinc-300">
                Nama Bahan Baku <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Fresh Milk Pasteurisasi"
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-300">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IngredientCategory)}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 text-xs focus:outline-none"
              >
                {INGREDIENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-300">
                Supplier / Toko
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Contoh: Distributor Dairy"
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Pricing & Unit Conversion Section */}
          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2.5">
            <div className="flex items-center gap-1.5 text-zinc-200 text-xs font-semibold">
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span>Kalkulasi Satuan Pembelian & Pemakaian</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 font-medium">Harga Beli Total (Rp)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-white font-semibold text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 font-medium">Qty & Satuan Beli</label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={purchaseQuantity}
                    onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
                    className="w-14 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-white font-semibold text-center text-xs"
                  />
                  <select
                    value={purchaseUnit}
                    onChange={(e) => handlePurchaseUnitChange(e.target.value as UnitType)}
                    className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 text-xs"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 font-medium">Satuan Pemakaian</label>
                <select
                  value={usageUnit}
                  onChange={(e) => setUsageUnit(e.target.value as UnitType)}
                  className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 text-xs"
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Conversion explanation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2 bg-zinc-900 rounded-lg text-xs border border-zinc-800">
              <div className="text-zinc-300 text-[11px]">
                1 {purchaseUnit} = 
                <input
                  type="number"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(Number(e.target.value))}
                  className="w-14 mx-1 px-1.5 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-center text-amber-400 font-semibold"
                />
                {usageUnit}
              </div>

              <div className="text-right text-[11px]">
                <span className="text-zinc-400">Modal per {usageUnit}: </span>
                <strong className="text-amber-400 font-semibold">
                  {formatRupiah(costPerUsageUnit)} / {usageUnit}
                </strong>
              </div>
            </div>

          </div>

          {/* Stock & Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-300 font-medium">
                Stok Saat Ini ({usageUnit})
              </label>
              <input
                type="number"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(Number(e.target.value))}
                className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-300 font-medium">
                Min. Alert ({usageUnit})
              </label>
              <input
                type="number"
                min="0"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(Number(e.target.value))}
                className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-300 font-medium">
                Tanggal Expired
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 text-xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400 font-medium">Catatan / Suhu Penyimpanan (Opsional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Chiller 2-4°C, tutup rapat setelah dibuka"
              className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Simpan Bahan</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
