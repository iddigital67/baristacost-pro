import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  Coffee,
  Lock
} from 'lucide-react';
import { Ingredient, IngredientCategory, Recipe, UserRole } from '../../types';
import { formatRupiah, formatDateIndo, getDaysUntilExpiry } from '../../utils/formatters';
import { IngredientModal } from './IngredientModal';

interface IngredientListProps {
  ingredients: Ingredient[];
  recipes?: Recipe[];
  userRole?: UserRole;
  onOpenOwnerAuth?: () => void;
  onSaveIngredient: (ingredient: Ingredient) => void;
  onDeleteIngredient: (ingredientId: string) => void;
}

const CATEGORIES: ('All' | IngredientCategory)[] = [
  'All',
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

export const IngredientList: React.FC<IngredientListProps> = ({
  ingredients,
  recipes = [],
  userRole = 'owner',
  onOpenOwnerAuth,
  onSaveIngredient,
  onDeleteIngredient,
}) => {
  const isOwner = userRole === 'owner';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | IngredientCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lowStock' | 'nearExpiry'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  const filtered = ingredients.filter((ing) => {
    if (selectedCategory !== 'All' && ing.category !== selectedCategory) return false;
    
    if (statusFilter === 'lowStock' && ing.currentStock > ing.minStockAlert) return false;
    
    if (statusFilter === 'nearExpiry') {
      const days = getDaysUntilExpiry(ing.expiryDate);
      if (days === null || days > 14 || days < 0) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ing.name.toLowerCase().includes(q) ||
        (ing.supplier || '').toLowerCase().includes(q) ||
        (ing.notes || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    if (!isOwner && onOpenOwnerAuth) {
      onOpenOwnerAuth();
      return;
    }
    setEditingIngredient(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ing: Ingredient) => {
    if (!isOwner && onOpenOwnerAuth) {
      onOpenOwnerAuth();
      return;
    }
    setEditingIngredient(ing);
    setIsModalOpen(true);
  };

  const handleQuickAdjust = (ing: Ingredient, delta: number) => {
    const newStock = Math.max(0, ing.currentStock + delta);
    onSaveIngredient({
      ...ing,
      currentStock: newStock,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  const getPortionAdvice = (ing: Ingredient) => {
    const usingRecipes = recipes.filter(r => 
      r.ingredients.some(ri => ri.ingredientId === ing.id)
    );

    if (usingRecipes.length === 0) return null;

    const mainRecipe = usingRecipes.find(r => r.isPopular) || usingRecipes[0];
    const itemInRecipe = mainRecipe.ingredients.find(ri => ri.ingredientId === ing.id);

    if (!itemInRecipe || itemInRecipe.amount <= 0) return null;

    const remainingCups = Math.floor(ing.currentStock / itemInRecipe.amount);
    return {
      recipeName: mainRecipe.name,
      amountPerCup: itemInRecipe.amount,
      unit: itemInRecipe.unit,
      remainingCups,
      isLow: remainingCups <= 25 || ing.currentStock <= ing.minStockAlert
    };
  };

  return (
    <div className="space-y-4 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <span>{isOwner ? 'Katalog Bahan Baku & Master Harga' : 'Inventori & Sisa Stok Barista'}</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isOwner 
              ? 'Kelola harga beli dari supplier, konversi satuan gramasi, dan pantau estimasi sisa porsi/gelas.'
              : 'Pantau sisa stok fisik di bar, estimasi porsi saji menu, dan lakukan update stok berkala.'}
          </p>
        </div>

        {isOwner ? (
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Tambah Bahan</span>
          </button>
        ) : (
          <button
            onClick={onOpenOwnerAuth}
            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium rounded-lg border border-zinc-800 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Akses Edit Bahan</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-2.5 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari bahan baku, supplier..."
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {cat === 'All' ? 'Semua' : cat}
            </button>
          ))}
        </div>

      </div>

      {/* Grid of Ingredients */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center bg-zinc-900/40 border border-dashed border-zinc-800 rounded-xl text-zinc-400">
          <Package className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
          <p className="text-sm font-semibold text-zinc-200">Tidak ada bahan baku yang cocok.</p>
          <p className="text-xs text-zinc-400 mt-0.5">Ubah pencarian atau tambahkan master bahan baku baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {filtered.map((ing) => {
            const isLowStock = ing.currentStock <= ing.minStockAlert;
            const daysToExpiry = getDaysUntilExpiry(ing.expiryDate);
            const isExpiringSoon = daysToExpiry !== null && daysToExpiry >= 0 && daysToExpiry <= 7;
            const isExpired = daysToExpiry !== null && daysToExpiry < 0;
            const portionAdvice = getPortionAdvice(ing);

            return (
              <div
                key={ing.id}
                className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700/80 p-3.5 rounded-xl shadow-xs transition-colors flex flex-col justify-between"
              >
                <div>
                  
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {ing.category}
                    </span>

                    {/* Stock Alert Badge */}
                    {isLowStock ? (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Menipis
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Aman
                      </span>
                    )}
                  </div>

                  {/* Name & Supplier */}
                  <h3 className="text-xs font-semibold text-zinc-100">
                    {ing.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {ing.supplier ? `Supplier: ${ing.supplier}` : 'Grosir / Distributor'}
                  </p>

                  {/* Sisa Gelas / Porsi Card */}
                  {portionAdvice && (
                    <div className={`mt-2 p-2 rounded-lg border flex items-center justify-between text-xs ${
                      portionAdvice.isLow
                        ? 'bg-amber-500/5 border-amber-500/20 text-amber-300'
                        : 'bg-zinc-950/50 border-zinc-800 text-zinc-300'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <Coffee className={`w-3.5 h-3.5 shrink-0 ${portionAdvice.isLow ? 'text-amber-400' : 'text-zinc-400'}`} />
                        <div className="leading-tight">
                          <span className="text-[11px] block">
                            Estimasi: <strong className="font-semibold text-zinc-100">~{portionAdvice.remainingCups} porsi</strong>
                          </span>
                          <span className="text-[10px] text-zinc-400 truncate max-w-[130px] block">
                            Menu: {portionAdvice.recipeName}
                          </span>
                        </div>
                      </div>

                      {portionAdvice.isLow && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                          Reorder
                        </span>
                      )}
                    </div>
                  )}

                  {/* Pricing and Unit Rate Card */}
                  {isOwner ? (
                    <div className="mt-2 p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 space-y-1 text-xs">
                      <div className="flex justify-between text-zinc-400 text-[11px]">
                        <span>Beli:</span>
                        <span className="text-zinc-200 font-medium">
                          {formatRupiah(ing.purchasePrice)} / {ing.purchaseQuantity} {ing.purchaseUnit}
                        </span>
                      </div>

                      <div className="flex justify-between text-amber-400 font-medium border-t border-zinc-800/80 pt-1 text-[11px]">
                        <span>Modal / {ing.usageUnit}:</span>
                        <span>{formatRupiah(ing.costPerUsageUnit)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 p-2 rounded-lg bg-zinc-950/70 border border-zinc-800 text-xs flex items-center justify-between">
                      <span className="text-zinc-400 text-[11px]">Satuan Bar:</span>
                      <span className="font-medium text-amber-300">
                        {ing.usageUnit}
                      </span>
                    </div>
                  )}

                  {/* Stock Level Bar & Expiry */}
                  <div className="mt-2.5 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400 text-[11px]">Sisa Stok:</span>
                      <span className={`font-semibold text-[11px] ${isLowStock ? 'text-rose-400' : 'text-zinc-200'}`}>
                        {ing.currentStock} {ing.usageUnit}
                        <span className="text-[10px] text-zinc-400 font-normal ml-1">
                          (Min: {ing.minStockAlert})
                        </span>
                      </span>
                    </div>

                    <div className="w-full bg-zinc-800 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full transition-all ${
                          isLowStock ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(5, (ing.currentStock / (ing.minStockAlert * 3 || 1)) * 100))}%`
                        }}
                      />
                    </div>

                    {ing.expiryDate && (
                      <div className="flex items-center justify-between text-[10px] pt-0.5">
                        <span className="text-zinc-400">Exp:</span>
                        <span className={`font-medium ${
                          isExpired 
                            ? 'text-rose-400' 
                            : isExpiringSoon 
                            ? 'text-amber-400' 
                            : 'text-zinc-300'
                        }`}>
                          {formatDateIndo(ing.expiryDate)} {isExpired ? '(EXP)' : isExpiringSoon ? `(${daysToExpiry}h)` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                </div>

                {/* Card Actions */}
                <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-zinc-400 font-medium mr-0.5">Stok:</span>
                    <button
                      onClick={() => handleQuickAdjust(ing, -(ing.usageUnit === 'gr' || ing.usageUnit === 'ml' ? 100 : 1))}
                      className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                      title="Kurangi stok"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleQuickAdjust(ing, (ing.usageUnit === 'gr' || ing.usageUnit === 'ml' ? 100 : 1))}
                      className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                      title="Tambah stok"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {isOwner ? (
                      <>
                        <button
                          onClick={() => onDeleteIngredient(ing.id)}
                          className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
                          title="Hapus Bahan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(ing)}
                          className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3 h-3 text-amber-400" />
                          <span>Edit</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-zinc-400">Shift Stok</span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Ingredient Modal */}
      <IngredientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveIngredient}
        editingIngredient={editingIngredient}
      />

    </div>
  );
};
