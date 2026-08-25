import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  UtensilsCrossed, 
  Trash2, 
  Edit3, 
  Copy, 
  Printer, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpDown, 
  Sparkles, 
  Sliders, 
  DollarSign,
  Layers,
  BookOpen
} from 'lucide-react';
import { Recipe, Ingredient, MenuCategory, UserRole } from '../../types';
import { formatRupiah, formatPercent, formatNumber } from '../../utils/formatters';
import { RecipeModal } from './RecipeModal';
import { RecipePrintCard } from './RecipePrintCard';

interface HppCalculatorProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onSaveRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (recipeId: string) => void;
  defaultTargetMargin: number;
  cafeName: string;
  userRole?: UserRole;
  onOpenOwnerAuth?: () => void;
}

const CATEGORIES: ('All' | MenuCategory)[] = [
  'All',
  'Coffee (Hot/Iced)',
  'Non-Coffee & Milk Based',
  'Manual Brew & Tea',
  'Mocktail & Refreshment',
  'Pastry & Bakery',
  'Main Course & Meals',
  'Snacks & Finger Food',
];

export const HppCalculator: React.FC<HppCalculatorProps> = ({
  recipes,
  ingredients,
  onSaveRecipe,
  onDeleteRecipe,
  defaultTargetMargin,
  cafeName,
  userRole = 'owner',
  onOpenOwnerAuth,
}) => {
  const isOwner = userRole === 'owner';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | MenuCategory>('All');
  const [sortBy, setSortBy] = useState<'margin' | 'hpp' | 'price' | 'sales'>('margin');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [printingRecipe, setPrintingRecipe] = useState<Recipe | null>(null);

  // Price simulator state (What-if scenario)
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simulatedIngredientId, setSimulatedIngredientId] = useState(ingredients[0]?.id || '');
  const [priceChangePercent, setPriceChangePercent] = useState(15); // e.g. +15%

  // Filter & Sort recipes
  const filteredRecipes = recipes
    .filter(r => {
      const matchCat = selectedCategory === 'All' || r.category === selectedCategory;
      const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'margin') return b.actualMarginPercent - a.actualMarginPercent;
      if (sortBy === 'hpp') return b.totalHpp - a.totalHpp;
      if (sortBy === 'price') return b.sellingPrice - a.sellingPrice;
      if (sortBy === 'sales') return (b.estimatedSalesPerMonth || 0) - (a.estimatedSalesPerMonth || 0);
      return 0;
    });

  const handleDuplicate = (recipe: Recipe) => {
    const dup: Recipe = {
      ...recipe,
      id: `rec-${Date.now()}`,
      name: `${recipe.name} (Salinan)`,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    onSaveRecipe(dup);
  };

  const handleOpenAdd = () => {
    if (!isOwner && onOpenOwnerAuth) {
      onOpenOwnerAuth();
      return;
    }
    setEditingRecipe(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (recipe: Recipe) => {
    if (!isOwner && onOpenOwnerAuth) {
      onOpenOwnerAuth();
      return;
    }
    setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  // Simulator calculations
  const simIngredient = ingredients.find(i => i.id === simulatedIngredientId);

  return (
    <div className="space-y-4 pb-10">
      
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-400" />
            <span>{isOwner ? 'Kalkulator HPP & Resep Menu' : 'SOP Resep & Takaran Barista'}</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isOwner 
              ? 'Standarisasi resep (BOM), kalkulasi modal per porsi, dan monitoring margin laba kotor.'
              : 'Panduan takaran gramatur baku, langkah peracikan SOP, dan ukuran sajian bar.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={() => setSimulatorOpen(!simulatorOpen)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                simulatorOpen
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulator Harga</span>
            </button>
          )}

          {isOwner ? (
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Tambah Menu</span>
            </button>
          ) : (
            <button
              onClick={onOpenOwnerAuth}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium rounded-lg border border-zinc-800 flex items-center gap-1.5 transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Buka Akses HPP</span>
            </button>
          )}
        </div>
      </div>

      {/* Simulator Panel (Minimalist Clean) */}
      {simulatorOpen && (
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulasi Dampak Kenaikan Harga Bahan Baku</span>
            </div>
            <span className="text-[11px] text-zinc-400">
              Analisa ketahanan margin menu terhadap fluktuasi harga supplier
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-400 text-[11px] font-medium">Bahan Baku:</label>
              <select
                value={simulatedIngredientId}
                onChange={(e) => setSimulatedIngredientId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-zinc-700"
              >
                {ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} ({formatRupiah(ing.purchasePrice)}/{ing.purchaseQuantity}{ing.purchaseUnit})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400 font-medium">Perubahan Harga:</span>
                <span className="font-semibold text-amber-400">{priceChangePercent > 0 ? `+${priceChangePercent}%` : `${priceChangePercent}%`}</span>
              </div>
              <input
                type="range"
                min="-20"
                max="50"
                step="5"
                value={priceChangePercent}
                onChange={(e) => setPriceChangePercent(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>

            <div className="p-2.5 bg-zinc-950/70 rounded-lg border border-zinc-800 flex flex-col justify-center">
              <span className="text-zinc-400 text-[10px]">Estimasi Harga Baru ({simIngredient?.name}):</span>
              <span className="text-zinc-100 font-semibold text-xs mt-0.5">
                {formatRupiah((simIngredient?.costPerUsageUnit || 0) * (1 + priceChangePercent / 100))}/{simIngredient?.usageUnit}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-2.5 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari resep menu..."
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
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

        {/* Sort dropdown */}
        <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 focus:outline-none focus:border-zinc-700"
          >
            <option value="margin">Margin Tertinggi</option>
            <option value="hpp">HPP Tertinggi</option>
            <option value="price">Harga Jual Tertinggi</option>
            <option value="sales">Estimasi Penjualan</option>
          </select>
        </div>

      </div>

      {/* Recipe Cards Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="p-10 text-center bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl text-zinc-400">
          <UtensilsCrossed className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
          <p className="text-sm font-semibold text-zinc-300">Tidak ada resep ditemukan.</p>
          <p className="text-xs text-zinc-400 mt-0.5">Ubah filter kategori atau buat racikan menu baru.</p>
          {isOwner && (
            <button
              onClick={handleOpenAdd}
              className="mt-3 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
            >
              + Buat Resep Baru
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-3.5">
          {filteredRecipes.map((recipe) => {
            const margin = recipe.actualMarginPercent;
            const isGoodMargin = margin >= (recipe.targetMarginPercent || defaultTargetMargin);
            const isLowMargin = margin < 50;

            // Simulated HPP if simulator is active
            let simulatedHpp = recipe.totalHpp;
            if (simulatorOpen && simIngredient) {
              recipe.ingredients.forEach(item => {
                if (item.ingredientId === simIngredient.id) {
                  const newCost = item.amount * (simIngredient.costPerUsageUnit * (1 + priceChangePercent / 100));
                  simulatedHpp = simulatedHpp - item.cost + newCost;
                }
              });
            }
            const simMargin = recipe.sellingPrice > 0 ? ((recipe.sellingPrice - simulatedHpp) / recipe.sellingPrice) * 100 : 0;

            return (
              <div
                key={recipe.id}
                className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700/90 rounded-xl p-4 shadow-xs transition-colors flex flex-col justify-between"
              >
                <div>
                  
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {recipe.category}
                    </span>

                    {isOwner ? (
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                        isLowMargin
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : isGoodMargin
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        Margin {formatPercent(margin, 1)}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {recipe.servingSize || '1 Porsi'}
                      </span>
                    )}
                  </div>

                  {/* Menu Name & Description */}
                  <h3 className="text-sm font-semibold text-zinc-100">
                    {recipe.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-normal">
                    {recipe.description || `${recipe.ingredients.length} komposisi takaran baku.`}
                  </p>

                  {/* Owner View: Key Pricing & Margin Box */}
                  {isOwner ? (
                    <div className="mt-3 p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Total HPP:</span>
                        <span className="font-semibold text-amber-400">{formatRupiah(recipe.totalHpp)}</span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Harga Jual:</span>
                        <span className="font-semibold text-zinc-100">{formatRupiah(recipe.sellingPrice)}</span>
                      </div>

                      <div className="flex justify-between items-center text-xs border-t border-zinc-800 pt-1.5">
                        <span className="text-zinc-400">Laba Kotor:</span>
                        <span className="font-semibold text-emerald-400">{formatRupiah(recipe.profitNominal)}</span>
                      </div>

                      {/* Simulator info if active */}
                      {simulatorOpen && simulatedHpp !== recipe.totalHpp && (
                        <div className="pt-1.5 border-t border-dashed border-zinc-700 text-[11px] text-amber-300 flex justify-between">
                          <span>Simulasi HPP: <strong>{formatRupiah(simulatedHpp)}</strong></span>
                          <span>Margin: <strong>{formatPercent(simMargin, 1)}</strong></span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Barista View: SOP Takaran Bahan Box */
                    <div className="mt-3 p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 space-y-2">
                      <div className="flex justify-between items-center text-xs pb-1.5 border-b border-zinc-800">
                        <span className="text-zinc-400">Harga POS:</span>
                        <span className="font-semibold text-zinc-200">{formatRupiah(recipe.sellingPrice)}</span>
                      </div>
                      
                      <div>
                        <p className="text-[11px] font-medium text-blue-400 mb-1">
                          Takaran SOP Baku:
                        </p>
                        <div className="space-y-1">
                          {recipe.ingredients.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800/60">
                              <span className="text-zinc-300 truncate">{item.ingredientName}</span>
                              <span className="font-medium text-amber-400 shrink-0 ml-2">
                                {item.amount} {item.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ingredients Preview (Owner Mode) */}
                  {isOwner && (
                    <div className="mt-2.5 text-[11px] text-zinc-400">
                      <span className="text-zinc-300 font-medium">Bahan: </span>
                      {recipe.ingredients.map(i => `${i.ingredientName} (${i.amount}${i.unit})`).join(', ')}
                    </div>
                  )}

                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
                  <button
                    onClick={() => setPrintingRecipe(recipe)}
                    className="px-2.5 py-1 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-750 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3 h-3 text-amber-400" />
                    <span>{isOwner ? 'SOP' : 'SOP Detail'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {isOwner ? (
                      <>
                        <button
                          onClick={() => handleDuplicate(recipe)}
                          className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
                          title="Duplikat Menu"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteRecipe(recipe.id)}
                          className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
                          title="Hapus Menu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(recipe)}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3 h-3 text-amber-400" />
                          <span>Edit</span>
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Recipe Modal */}
      <RecipeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveRecipe}
        editingRecipe={editingRecipe}
        ingredients={ingredients}
        defaultTargetMargin={defaultTargetMargin}
      />

      {/* Print SOP Card Modal */}
      <RecipePrintCard
        recipe={printingRecipe}
        onClose={() => setPrintingRecipe(null)}
        cafeName={cafeName}
      />

    </div>
  );
};
