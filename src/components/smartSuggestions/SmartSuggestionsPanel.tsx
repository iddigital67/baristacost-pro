import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Coffee 
} from 'lucide-react';
import { Ingredient, Recipe, WasteLog, CafeSettings } from '../../types';
import { formatRupiah, formatPercent, getDaysUntilExpiry } from '../../utils/formatters';

export interface SmartSuggestionItem {
  id: string;
  type: 'stock_depletion' | 'expiry_push' | 'waste_reduction' | 'margin_boost' | 'dial_in';
  priority: 'high' | 'medium' | 'low';
  title: string;
  subtitle: string;
  description: string;
  actionText?: string;
  actionType?: 'view_ingredient' | 'view_recipe' | 'view_waste' | 'reorder';
  targetId?: string;
  highlightNumber?: string;
  highlightLabel?: string;
  badge: string;
}

interface SmartSuggestionsPanelProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
  wasteLogs: WasteLog[];
  settings: CafeSettings;
  onNavigate?: (tab: any) => void;
  compact?: boolean;
}

export const SmartSuggestionsPanel: React.FC<SmartSuggestionsPanelProps> = ({
  ingredients,
  recipes,
  wasteLogs,
  settings,
  onNavigate,
  compact = false,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'stock' | 'expiry' | 'waste' | 'margin'>('all');

  const suggestions: SmartSuggestionItem[] = [];

  // 1. ANALISIS STOK MENIPIS & SISA GELAS / PORSI
  ingredients.forEach(ing => {
    const relatedRecipes = recipes.filter(r => 
      r.ingredients.some(ri => ri.ingredientId === ing.id)
    );

    if (relatedRecipes.length > 0) {
      const mainRecipe = relatedRecipes.find(r => r.isPopular) || relatedRecipes[0];
      const recipeItem = mainRecipe.ingredients.find(ri => ri.ingredientId === ing.id);
      
      if (recipeItem && recipeItem.amount > 0) {
        const remainingPortions = Math.floor(ing.currentStock / recipeItem.amount);
        const isCriticalStock = ing.currentStock <= ing.minStockAlert;
        const isLowPortion = remainingPortions <= 25;

        if (isCriticalStock || isLowPortion) {
          suggestions.push({
            id: `sug-stock-${ing.id}`,
            type: 'stock_depletion',
            priority: remainingPortions <= 10 ? 'high' : 'medium',
            title: `Stok ${ing.name} Sisa ${ing.currentStock} ${ing.usageUnit}`,
            subtitle: `Cukup untuk ~${remainingPortions} porsi "${mainRecipe.name}"`,
            description: `Berdasarkan takaran baku (${recipeItem.amount} ${recipeItem.unit}/porsi), stok ini diperkirakan segera habis. Hubungi supplier ${ing.supplier ? `(${ing.supplier})` : ''} untuk pemesanan ulang.`,
            actionText: 'Lihat Stok Bahan',
            actionType: 'view_ingredient',
            targetId: ing.id,
            highlightNumber: `~${remainingPortions}`,
            highlightLabel: 'Sisa Porsi',
            badge: remainingPortions <= 10 ? 'Stok Kritis' : 'Menipis'
          });
        }
      }
    }
  });

  // 2. ANALISIS KADALUARSA MENDEKATI
  ingredients.forEach(ing => {
    const days = getDaysUntilExpiry(ing.expiryDate);
    if (days !== null && days >= 0 && days <= 14) {
      const relatedRecipes = recipes.filter(r => 
        r.ingredients.some(ri => ri.ingredientId === ing.id)
      );
      const menuNames = relatedRecipes.map(r => `"${r.name}"`).join(', ');

      suggestions.push({
        id: `sug-exp-${ing.id}`,
        type: 'expiry_push',
        priority: days <= 4 ? 'high' : 'medium',
        title: `${ing.name} Expired ${days === 0 ? 'Hari Ini' : `${days} Hari Lagi`}`,
        subtitle: `Rekomendasi Flash Sale / Upsell Menu: ${menuNames || 'Terkait'}`,
        description: `Tersisa ${ing.currentStock} ${ing.usageUnit} (${formatRupiah(ing.currentStock * ing.costPerUsageUnit)}) yang berisiko terbuang bila tidak segera diolah. Dorong penjualan menu terkait di kasir.`,
        actionText: 'Lihat Resep Menu',
        actionType: 'view_recipe',
        targetId: ing.id,
        highlightNumber: days === 0 ? '0 Hari' : `${days} Hari`,
        highlightLabel: 'Sisa Waktu',
        badge: days <= 3 ? 'Segera Expired' : 'Perhatian'
      });
    }
  });

  // 3. ANALISIS RESEP DENGAN MARGIN RENDAH
  recipes.forEach(rec => {
    const target = rec.targetMarginPercent || settings.defaultTargetMargin || 65;
    if (rec.actualMarginPercent < 50 && rec.actualMarginPercent > 0) {
      const idealPrice = rec.recommendedSellingPrice || Math.ceil((rec.totalHpp / (1 - target / 100)) / 1000) * 1000;
      suggestions.push({
        id: `sug-margin-${rec.id}`,
        type: 'margin_boost',
        priority: 'high',
        title: `Margin Menu "${rec.name}" Rendah (${formatPercent(rec.actualMarginPercent, 1)})`,
        subtitle: `Target Laba: ${target}% | HPP: ${formatRupiah(rec.totalHpp)}`,
        description: `Harga jual saat ini (${formatRupiah(rec.sellingPrice)}) memberikan margin tipis. Rekomendasi naikkan harga ke ${formatRupiah(idealPrice)} atau negosiasi ulang harga bahan baku.`,
        actionText: 'Sesuaikan Harga',
        actionType: 'view_recipe',
        targetId: rec.id,
        highlightNumber: formatPercent(rec.actualMarginPercent, 1),
        highlightLabel: 'Margin Laba',
        badge: 'Margin Rendah'
      });
    }
  });

  // 4. Default SOP hint
  if (suggestions.length === 0) {
    suggestions.push({
      id: 'sug-default-dialin',
      type: 'dial_in',
      priority: 'low',
      title: 'Standar Kalibrasi Grinder & Dial-in Pagi',
      subtitle: 'Maksimal 3-4 shot per opening untuk efisiensi biji kopi',
      description: 'Catat waktu ekstraksi (25-30 detik) dan rasio brew di stasiun espresso agar pergantian shift barista berjalan konsisten tanpa pemborosan biji kopi.',
      actionText: 'Lihat SOP Bar',
      actionType: 'view_recipe',
      highlightNumber: '25-30s',
      highlightLabel: 'Ekstraksi',
      badge: 'SOP Barista'
    });
  }

  const filteredSuggestions = suggestions.filter(s => {
    if (filterType === 'stock') return s.type === 'stock_depletion';
    if (filterType === 'expiry') return s.type === 'expiry_push';
    if (filterType === 'waste') return s.type === 'waste_reduction';
    if (filterType === 'margin') return s.type === 'margin_boost';
    return true;
  });

  const handleActionClick = (sug: SmartSuggestionItem) => {
    if (!onNavigate) return;
    if (sug.actionType === 'view_ingredient') onNavigate('ingredients');
    else if (sug.actionType === 'view_recipe') onNavigate('hpp');
    else if (sug.actionType === 'view_waste') onNavigate('waste');
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3.5">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 text-amber-400 flex items-center justify-center border border-zinc-700/80">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-zinc-100">
                Saran Cerdas & Sisa Porsi
              </h3>
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {suggestions.length} Aktif
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Analisis otomatis stok bahan, estimasi sisa porsi saji, dan evaluasi margin.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        {!compact && (
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === 'all'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Semua ({suggestions.length})
            </button>
            <button
              onClick={() => setFilterType('stock')}
              className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === 'stock'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sisa Porsi
            </button>
            <button
              onClick={() => setFilterType('expiry')}
              className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === 'expiry'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Kadaluarsa
            </button>
            <button
              onClick={() => setFilterType('margin')}
              className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === 'margin'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Margin
            </button>
          </div>
        )}
      </div>

      {/* Suggestion Cards Grid */}
      {filteredSuggestions.length === 0 ? (
        <div className="p-6 text-center bg-zinc-950/40 border border-dashed border-zinc-800 rounded-xl text-zinc-400">
          <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400/60 mb-1.5" />
          <p className="text-xs font-semibold text-zinc-200">Kondisi Operasional Prima</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Seluruh stok bahan aman dan margin resep optimal.</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${compact ? 'gap-2.5' : 'md:grid-cols-2 gap-3'}`}>
          {filteredSuggestions.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-zinc-700/80 transition-colors flex flex-col justify-between space-y-2.5"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    {item.badge}
                  </span>

                  {item.highlightNumber && (
                    <div className="text-right">
                      <span className="text-xs font-bold text-zinc-100 block leading-tight">
                        {item.highlightNumber}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {item.highlightLabel}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-zinc-100">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {item.subtitle}
                  </p>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed pt-0.5">
                  {item.description}
                </p>
              </div>

              {item.actionText && (
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-end">
                  <button
                    onClick={() => handleActionClick(item)}
                    className="text-xs font-medium text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 transition-colors"
                  >
                    <span>{item.actionText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
