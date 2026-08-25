import React from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  PieChart as PieIcon, 
  Coffee, 
  UtensilsCrossed, 
  Trash2, 
  Package, 
  FileSpreadsheet, 
  Plus, 
  Sparkles, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock,
  User,
  BookOpen,
  Lock
} from 'lucide-react';
import { Ingredient, Recipe, WasteLog, CafeSettings, GoogleSheetsConfig, UserRole } from '../../types';
import { formatRupiah, formatPercent, formatDateIndo, getDaysUntilExpiry } from '../../utils/formatters';
import { SmartSuggestionsPanel } from '../smartSuggestions/SmartSuggestionsPanel';

interface DashboardOverviewProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
  wasteLogs: WasteLog[];
  settings: CafeSettings;
  sheetsConfig: GoogleSheetsConfig;
  userRole?: UserRole;
  currentBaristaName?: string;
  onNavigate: (tab: any) => void;
  onOpenQuickWaste: () => void;
  onOpenRecipeModal: () => void;
  onOpenSheetsModal: () => void;
  onOpenOwnerAuth?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  ingredients,
  recipes,
  wasteLogs,
  settings,
  sheetsConfig,
  userRole = 'owner',
  currentBaristaName = 'Barista Shift',
  onNavigate,
  onOpenQuickWaste,
  onOpenRecipeModal,
  onOpenSheetsModal,
  onOpenOwnerAuth,
}) => {
  const isOwner = userRole === 'owner';
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Filter waste
  const todayWasteLogs = wasteLogs.filter(w => w.date === todayStr);
  const monthWasteLogs = wasteLogs.filter(w => w.date && w.date.startsWith(currentMonthStr));

  const todayWasteCost = todayWasteLogs.reduce((sum, w) => sum + (w.costLost || 0), 0);
  const monthWasteCost = monthWasteLogs.reduce((sum, w) => sum + (w.costLost || 0), 0);

  // Compute average HPP & Margin
  const activeRecipes = recipes.filter(r => r.status === 'Active');
  const avgMargin = activeRecipes.length > 0
    ? activeRecipes.reduce((sum, r) => sum + (r.actualMarginPercent || 0), 0) / activeRecipes.length
    : 65;
  const avgHppPercent = 100 - avgMargin;

  // Monthly potential
  const estMonthlyRevenue = activeRecipes.reduce((sum, r) => sum + ((r.sellingPrice || 0) * (r.estimatedSalesPerMonth || 0)), 0) || settings.monthlyRevenueTarget;
  const estMonthlyHppCost = activeRecipes.reduce((sum, r) => sum + ((r.totalHpp || 0) * (r.estimatedSalesPerMonth || 0)), 0);
  const estMonthlyGrossProfit = estMonthlyRevenue - estMonthlyHppCost;

  const wastePercentOfHpp = estMonthlyHppCost > 0 ? (monthWasteCost / estMonthlyHppCost) * 100 : 0;
  const isWasteOverTolerance = wastePercentOfHpp > settings.maxWasteTolerancePercent;

  // Low stock & Expiry items
  const lowStockItems = ingredients.filter(i => i.currentStock <= i.minStockAlert);
  const nearExpiryItems = ingredients.filter(i => {
    const days = getDaysUntilExpiry(i.expiryDate);
    return days !== null && days >= 0 && days <= 14;
  });

  // Pareto waste: Top 5 materials by cost lost
  const wasteByIngredient: { [name: string]: { cost: number; amount: number; unit: string; category: string } } = {};
  wasteLogs.forEach(w => {
    if (!wasteByIngredient[w.ingredientName]) {
      wasteByIngredient[w.ingredientName] = { cost: 0, amount: 0, unit: w.unit, category: w.category };
    }
    wasteByIngredient[w.ingredientName].cost += w.costLost || 0;
    wasteByIngredient[w.ingredientName].amount += w.amount || 0;
  });

  const sortedWasteIngredients = Object.entries(wasteByIngredient)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.cost - a.cost);

  const totalAllWasteCost = wasteLogs.reduce((sum, w) => sum + (w.costLost || 0), 0) || 1;

  return (
    <div className="space-y-5 pb-10">
      
      {/* Minimal Header Banner */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-6 text-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
              isOwner
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
            }`}>
              {isOwner ? 'Dashboard Finansial' : `Shift Barista: ${currentBaristaName}`}
            </span>
            <span className="text-xs text-zinc-400">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {settings.cafeName}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 max-w-xl leading-relaxed">
            {isOwner
              ? 'Monitoring real-time COGS, rasio margin laba kotor, dan audit kebocoran bahan baku.'
              : 'Standarisasi takaran gramatur, pantau stok bahan di bar, dan catat sisa/waste shift.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQuickWaste}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Catat Waste</span>
          </button>

          {isOwner ? (
            <button
              onClick={() => onNavigate('hpp')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition-colors"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
              <span>Kelola Resep</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('hpp')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>SOP Resep</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Waste Tracker */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-4.5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
              {isOwner ? 'Waste Bulan Ini' : 'Waste Hari Ini'}
            </span>
            <div className={`p-1.5 rounded-lg ${isWasteOverTolerance ? 'bg-rose-500/10 text-rose-400' : 'bg-zinc-800 text-zinc-400'}`}>
              <Trash2 className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-xl font-bold text-zinc-100">
              {isOwner ? formatRupiah(monthWasteCost) : `${todayWasteLogs.length} Catatan Waste`}
            </div>
            <div className="mt-1.5 text-xs">
              {isOwner ? (
                <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${
                  isWasteOverTolerance 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {formatPercent(wastePercentOfHpp, 1)} dari HPP
                </span>
              ) : (
                <span className="text-zinc-400 text-xs">
                  Biaya terbuang: <strong className="text-zinc-200">{formatRupiah(todayWasteCost)}</strong>
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span>{isOwner ? `Hari ini: ${formatRupiah(todayWasteCost)}` : 'Shift Aktif'}</span>
            <button onClick={() => onNavigate('waste')} className="text-amber-400 hover:underline flex items-center gap-0.5 text-xs">
              Detail <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Food Cost (Owner) vs Menu Aktif (Barista) */}
        {isOwner ? (
          <div className="bg-zinc-900/90 border border-zinc-800 p-4.5 rounded-xl shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
                Rata-Rata Food Cost
              </span>
              <div className="p-1.5 rounded-lg bg-zinc-800 text-blue-400">
                <PieIcon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5">
              <div className="text-xl font-bold text-zinc-100">
                {formatPercent(avgHppPercent, 1)}
              </div>
              <div className="mt-1.5 text-xs text-zinc-400">
                <span className="font-medium text-emerald-400">
                  Margin {formatPercent(avgMargin, 1)}
                </span>
                <span className="ml-1 text-zinc-400">• {activeRecipes.length} menu</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span>Target: {settings.defaultTargetMargin}%</span>
              <button onClick={() => onNavigate('hpp')} className="text-amber-400 hover:underline flex items-center gap-0.5 text-xs">
                Menu <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/90 border border-zinc-800 p-4.5 rounded-xl shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
                Resep Siap Saji
              </span>
              <div className="p-1.5 rounded-lg bg-zinc-800 text-blue-400">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5">
              <div className="text-xl font-bold text-zinc-100">
                {activeRecipes.length} SOP Aktif
              </div>
              <div className="mt-1.5 text-xs text-emerald-400 font-medium">
                Takaran gramatur baku tersedia
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span>Standar Porsi</span>
              <button onClick={() => onNavigate('hpp')} className="text-blue-400 hover:underline flex items-center gap-0.5 text-xs">
                Lihat Resep <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Card 3: Est Laba Kotor (Owner) vs Barista Shift (Barista) */}
        {isOwner ? (
          <div className="bg-zinc-900/90 border border-zinc-800 p-4.5 rounded-xl shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
                Est. Laba Kotor / Bln
              </span>
              <div className="p-1.5 rounded-lg bg-zinc-800 text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5">
              <div className="text-xl font-bold text-emerald-400">
                {formatRupiah(estMonthlyGrossProfit)}
              </div>
              <div className="mt-1.5 text-xs text-zinc-400 truncate">
                Dari Omset: {formatRupiah(estMonthlyRevenue)}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span>Fixed: {formatRupiah(settings.monthlyFixedCost)}</span>
              <button onClick={() => onNavigate('reports')} className="text-amber-400 hover:underline flex items-center gap-0.5 text-xs">
                Laporan <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/90 border border-zinc-800 p-4.5 rounded-xl shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
                Barista Bertugas
              </span>
              <div className="p-1.5 rounded-lg bg-zinc-800 text-purple-400">
                <User className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5">
              <div className="text-xl font-bold text-zinc-100 truncate">
                {currentBaristaName}
              </div>
              <div className="mt-1.5 text-xs text-zinc-400">
                Tanggung Jawab Bar Shift
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span>{settings.baristas.length} Anggota Tim</span>
              <button onClick={onOpenOwnerAuth} className="text-amber-400 hover:underline flex items-center gap-0.5 text-xs">
                Mode Owner <Lock className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Card 4: Status Bahan & Restock Alert */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-4.5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
              Peringatan Stok & Exp
            </span>
            <div className={`p-1.5 rounded-lg ${
              lowStockItems.length > 0 || nearExpiryItems.length > 0
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              <Package className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-xl font-bold text-zinc-100">
              {lowStockItems.length + nearExpiryItems.length} Item
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                lowStockItems.length > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {lowStockItems.length} Menipis
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                nearExpiryItems.length > 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {nearExpiryItems.length} Exp
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span>Inventori Fisik</span>
            <button onClick={() => onNavigate('ingredients')} className="text-amber-400 hover:underline flex items-center gap-0.5 text-xs">
              Cek Gudang <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Smart Suggestions Panel (Owner only) */}
      {isOwner && (
        <SmartSuggestionsPanel
          ingredients={ingredients}
          recipes={recipes}
          wasteLogs={wasteLogs}
          settings={settings}
          onNavigate={onNavigate}
        />
      )}

      {/* Middle Minimalist 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Urgent Stock & Expiry Table */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Bahan Baku Perlu Restock & Cek Expired</span>
            </div>
            <button
              onClick={() => onNavigate('ingredients')}
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              Lihat Semua ({ingredients.length})
            </button>
          </div>

          {lowStockItems.length === 0 && nearExpiryItems.length === 0 ? (
            <div className="p-6 text-center bg-zinc-950/40 rounded-xl border border-zinc-800/60 text-zinc-400">
              <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400 mb-1.5" />
              <p className="text-xs font-semibold text-zinc-200">Semua Stok Bahan Aman</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Tidak ada bahan di bawah batas minimum.</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs"
                >
                  <div>
                    <span className="font-medium text-zinc-200 block">{item.name}</span>
                    <span className="text-[11px] text-zinc-400">
                      Sisa: <strong className="text-amber-400">{item.currentStock} {item.usageUnit}</strong> (Min: {item.minStockAlert} {item.usageUnit})
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[11px] font-medium border border-amber-500/20">
                    Menipis
                  </span>
                </div>
              ))}

              {nearExpiryItems.map((item) => {
                const days = getDaysUntilExpiry(item.expiryDate);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs"
                  >
                    <div>
                      <span className="font-medium text-zinc-200 block">{item.name}</span>
                      <span className="text-[11px] text-zinc-400">
                        Exp: {item.expiryDate ? formatDateIndo(item.expiryDate) : '-'} ({days} hari lagi)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[11px] font-medium border border-rose-500/20">
                      Expired
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pareto: Top Waste Materials */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Bahan Terbanyak Terbuang (Pareto Waste)</span>
            </div>
            <button
              onClick={() => onNavigate('waste')}
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              Semua Waste ({wasteLogs.length})
            </button>
          </div>

          {sortedWasteIngredients.length === 0 ? (
            <div className="p-6 text-center bg-zinc-950/40 rounded-xl border border-zinc-800/60 text-zinc-400">
              <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400 mb-1.5" />
              <p className="text-xs font-semibold text-zinc-200">Belum Ada Catatan Waste</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Semua bahan baku tercatat aman dan terkendali.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sortedWasteIngredients.slice(0, 4).map((item, idx) => {
                const percentOfTotal = totalAllWasteCost > 0 ? (item.cost / totalAllWasteCost) * 100 : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-zinc-800 text-zinc-400 flex items-center justify-center text-[10px] font-semibold">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-zinc-200">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-rose-400">{formatRupiah(item.cost)}</span>
                        <span className="text-[11px] text-zinc-400 ml-1">({item.amount} {item.unit})</span>
                      </div>
                    </div>

                    <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(6, percentOfTotal))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
