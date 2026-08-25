import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Coffee, Package, Check, Sparkles } from 'lucide-react';
import { Recipe, RecipeIngredient, Ingredient, MenuCategory } from '../../types';
import { formatRupiah, formatPercent } from '../../utils/formatters';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  editingRecipe?: Recipe | null;
  ingredients: Ingredient[];
  defaultTargetMargin: number;
}

const MENU_CATEGORIES: MenuCategory[] = [
  'Coffee (Hot/Iced)',
  'Non-Coffee & Milk Based',
  'Manual Brew & Tea',
  'Mocktail & Refreshment',
  'Pastry & Bakery',
  'Main Course & Meals',
  'Snacks & Finger Food',
];

export const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRecipe,
  ingredients,
  defaultTargetMargin,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MenuCategory>('Coffee (Hot/Iced)');
  const [description, setDescription] = useState('');
  const [servingSize, setServingSize] = useState('1 Porsi / Cup');
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState(3);
  const [targetMarginPercent, setTargetMarginPercent] = useState(defaultTargetMargin || 65);
  const [sellingPrice, setSellingPrice] = useState(25000);
  const [estimatedSalesPerMonth, setEstimatedSalesPerMonth] = useState(300);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);

  // Init form
  useEffect(() => {
    if (editingRecipe) {
      setName(editingRecipe.name);
      setCategory(editingRecipe.category);
      setDescription(editingRecipe.description || '');
      setServingSize(editingRecipe.servingSize || '1 Porsi / Cup');
      setPreparationTimeMinutes(editingRecipe.preparationTimeMinutes || 3);
      setTargetMarginPercent(editingRecipe.targetMarginPercent || defaultTargetMargin || 65);
      setSellingPrice(editingRecipe.sellingPrice || 0);
      setEstimatedSalesPerMonth(editingRecipe.estimatedSalesPerMonth || 200);
      setRecipeIngredients(editingRecipe.ingredients || []);
    } else {
      setName('');
      setCategory('Coffee (Hot/Iced)');
      setDescription('');
      setServingSize('1 Porsi (16 oz)');
      setPreparationTimeMinutes(3);
      setTargetMarginPercent(defaultTargetMargin || 65);
      setSellingPrice(28000);
      setEstimatedSalesPerMonth(300);
      
      const defaultCup = ingredients.find(i => i.category === 'Packaging & Cup');
      const defaultCoffee = ingredients.find(i => i.category === 'Kopi & Espresso');
      const initList: RecipeIngredient[] = [];
      if (defaultCoffee) {
        initList.push({
          ingredientId: defaultCoffee.id,
          ingredientName: defaultCoffee.name,
          amount: 18,
          unit: defaultCoffee.usageUnit,
          cost: 18 * defaultCoffee.costPerUsageUnit,
          isPackaging: false
        });
      }
      if (defaultCup) {
        initList.push({
          ingredientId: defaultCup.id,
          ingredientName: defaultCup.name,
          amount: 1,
          unit: defaultCup.usageUnit,
          cost: 1 * defaultCup.costPerUsageUnit,
          isPackaging: true
        });
      }
      setRecipeIngredients(initList);
    }
  }, [editingRecipe, isOpen, defaultTargetMargin, ingredients]);

  if (!isOpen) return null;

  const totalIngredientsCost = recipeIngredients
    .filter(i => !i.isPackaging)
    .reduce((sum, i) => sum + i.cost, 0);

  const packagingCost = recipeIngredients
    .filter(i => i.isPackaging)
    .reduce((sum, i) => sum + i.cost, 0);

  const totalHpp = totalIngredientsCost + packagingCost;

  const recommendedSellingPrice = totalHpp > 0 && targetMarginPercent < 100
    ? Math.ceil((totalHpp / (1 - (targetMarginPercent / 100))) / 1000) * 1000
    : 0;

  const actualMarginPercent = sellingPrice > 0
    ? ((sellingPrice - totalHpp) / sellingPrice) * 100
    : 0;

  const profitNominal = sellingPrice - totalHpp;

  const handleAddIngredientRow = () => {
    const available = ingredients[0];
    if (!available) return;

    setRecipeIngredients([
      ...recipeIngredients,
      {
        ingredientId: available.id,
        ingredientName: available.name,
        amount: available.category === 'Packaging & Cup' ? 1 : 10,
        unit: available.usageUnit,
        cost: (available.category === 'Packaging & Cup' ? 1 : 10) * available.costPerUsageUnit,
        isPackaging: available.category === 'Packaging & Cup'
      }
    ]);
  };

  const handleIngredientChange = (index: number, ingredientId: string) => {
    const found = ingredients.find(i => i.id === ingredientId);
    if (!found) return;

    const updated = [...recipeIngredients];
    const curr = updated[index];
    const isPack = found.category === 'Packaging & Cup';
    const amount = curr.amount || (isPack ? 1 : 10);

    updated[index] = {
      ...curr,
      ingredientId: found.id,
      ingredientName: found.name,
      unit: found.usageUnit,
      cost: amount * found.costPerUsageUnit,
      isPackaging: isPack
    };
    setRecipeIngredients(updated);
  };

  const handleAmountChange = (index: number, amountVal: number) => {
    const updated = [...recipeIngredients];
    const curr = updated[index];
    const found = ingredients.find(i => i.id === curr.ingredientId);
    const costPerUnit = found ? found.costPerUsageUnit : 0;

    updated[index] = {
      ...curr,
      amount: amountVal,
      cost: amountVal * costPerUnit
    };
    setRecipeIngredients(updated);
  };

  const handleRemoveIngredient = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRecipe: Recipe = {
      id: editingRecipe ? editingRecipe.id : `rec-${Date.now()}`,
      name: name.trim(),
      category,
      description: description.trim(),
      ingredients: recipeIngredients,
      totalIngredientsCost,
      packagingCost,
      totalHpp,
      sellingPrice: Number(sellingPrice) || 0,
      recommendedSellingPrice,
      targetMarginPercent,
      actualMarginPercent,
      profitNominal,
      estimatedSalesPerMonth: Number(estimatedSalesPerMonth) || 0,
      status: 'Active',
      preparationTimeMinutes: Number(preparationTimeMinutes) || 3,
      servingSize: servingSize.trim() || '1 Porsi',
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    onSave(newRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-4 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/80 text-amber-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                {editingRecipe ? 'Edit Resep Menu' : 'Tambah Resep Menu Baru'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Kalkulasi bahan baku (BOM), biaya kemasan, dan margin profit.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-zinc-200">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] font-medium text-zinc-300">
                Nama Menu <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Iced Hazelnut Oat Latte"
                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-300">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MenuCategory)}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-600 text-xs"
              >
                {MENU_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-300">
                Porsi / Serving Size
              </label>
              <input
                type="text"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                placeholder="Contoh: 16 oz (Cup)"
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-300">
                Waktu Prep (Menit)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={preparationTimeMinutes}
                onChange={(e) => setPreparationTimeMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 text-xs"
              />
            </div>

            <div className="space-y-1 sm:col-span-2 lg:col-span-1">
              <label className="text-[11px] font-medium text-zinc-300">
                Est. Penjualan / Bulan
              </label>
              <input
                type="number"
                min="0"
                value={estimatedSalesPerMonth}
                onChange={(e) => setEstimatedSalesPerMonth(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 text-xs"
              />
            </div>

          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-300">
              Deskripsi Singkat / Catatan SOP
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Double espresso + 120ml susu oat dingin + 20ml syrup..."
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 text-xs resize-none"
            />
          </div>

          {/* Bill of Materials (BOM) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-zinc-200">
                  Komposisi Takaran Baku (BOM)
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Biaya bahan terhitung otomatis dari harga master bahan baku.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddIngredientRow}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Bahan</span>
              </button>
            </div>

            {recipeIngredients.length === 0 ? (
              <div className="p-4 text-center bg-zinc-950/40 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-xs text-zinc-400">Belum ada bahan baku ditambahkan.</p>
                <button
                  type="button"
                  onClick={handleAddIngredientRow}
                  className="mt-1 text-xs text-amber-400 hover:underline"
                >
                  + Tambah bahan pertama
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {recipeIngredients.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                      item.isPackaging
                        ? 'bg-zinc-950/70 border-zinc-800'
                        : 'bg-zinc-950/40 border-zinc-800/80'
                    }`}
                  >
                    <div className="flex-1 min-w-[180px] w-full sm:w-auto">
                      <select
                        value={item.ingredientId}
                        onChange={(e) => handleIngredientChange(idx, e.target.value)}
                        className="w-full px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none"
                      >
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.category === 'Packaging & Cup' ? '📦 ' : '☕ '}
                            {ing.name} ({formatRupiah(ing.costPerUsageUnit)}/{ing.usageUnit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          value={item.amount}
                          onChange={(e) => handleAmountChange(idx, Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-100 text-xs text-center font-medium"
                        />
                        <span className="text-xs text-zinc-400 w-7">
                          {item.unit}
                        </span>
                      </div>

                      <div className="w-20 text-right">
                        <p className="text-xs font-semibold text-amber-400">
                          {formatRupiah(item.cost)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick summary of BOM */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-zinc-950/60 rounded-lg text-xs text-zinc-300 border border-zinc-800">
              <div className="flex gap-3 text-[11px] text-zinc-400">
                <span>Bahan: <strong className="text-zinc-200">{formatRupiah(totalIngredientsCost)}</strong></span>
                <span>Kemasan: <strong className="text-zinc-200">{formatRupiah(packagingCost)}</strong></span>
              </div>
              <div className="text-xs font-semibold text-amber-400">
                Total HPP: {formatRupiah(totalHpp)}
              </div>
            </div>
          </div>

          {/* Pricing & Profit Margin Calculation Box */}
          <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-zinc-200 text-xs font-semibold">
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span>Kalkulasi Margin & Penetapan Harga</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Target Margin:</span>
                  <span className="font-semibold text-amber-400">{targetMarginPercent}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="85"
                  step="1"
                  value={targetMarginPercent}
                  onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-0.5">
                <p className="text-[10px] text-zinc-400 font-medium">Harga Rekomendasi</p>
                <p className="text-sm font-semibold text-zinc-100">{formatRupiah(recommendedSellingPrice)}</p>
                <button
                  type="button"
                  onClick={() => setSellingPrice(recommendedSellingPrice)}
                  className="text-[10px] text-amber-400 hover:underline"
                >
                  Gunakan harga ini
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-0.5">
                <label className="text-[10px] text-zinc-400 font-medium block">
                  Harga Jual (Rp)
                </label>
                <input
                  type="number"
                  step="500"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-100 font-semibold text-sm focus:outline-none"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-0.5">
                <p className="text-[10px] text-zinc-400 font-medium">Margin Aktual</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-sm font-semibold ${
                    actualMarginPercent >= targetMarginPercent ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {formatPercent(actualMarginPercent, 1)}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    ({formatRupiah(profitNominal)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Simpan Resep</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
