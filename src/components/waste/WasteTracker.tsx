import React, { useState } from 'react';
import { 
  Trash2, 
  Plus, 
  Search, 
  Download, 
  Sparkles, 
  Clock, 
  User, 
  CheckCircle2, 
  Filter
} from 'lucide-react';
import { WasteLog, Ingredient, WasteReason, IngredientCategory } from '../../types';
import { formatRupiah, formatPercent, formatDateIndo } from '../../utils/formatters';
import { WasteInsights } from './WasteInsights';
import { storageService } from '../../services/storageService';

interface WasteTrackerProps {
  wasteLogs: WasteLog[];
  ingredients: Ingredient[];
  onAddWaste: (log: WasteLog) => void;
  onDeleteWaste: (logId: string) => void;
  onOpenQuickWaste: () => void;
}

export const WasteTracker: React.FC<WasteTrackerProps> = ({
  wasteLogs,
  ingredients,
  onAddWaste,
  onDeleteWaste,
  onOpenQuickWaste,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'logs' | 'analytics' | 'insights'>('logs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReason, setSelectedReason] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | 'thisMonth'>('thisMonth');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Filter logs
  const filteredLogs = wasteLogs.filter(w => {
    if (dateFilter === 'today' && w.date !== todayStr) return false;
    if (dateFilter === 'thisMonth' && (!w.date || !w.date.startsWith(currentMonthStr))) return false;
    if (dateFilter === '7days') {
      const logDate = new Date(w.date).getTime();
      const sevenDaysAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
      if (logDate < sevenDaysAgo) return false;
    }

    if (selectedReason !== 'All' && w.reason !== selectedReason) return false;
    if (selectedCategory !== 'All' && w.category !== selectedCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        w.ingredientName.toLowerCase().includes(q) ||
        w.responsiblePerson.toLowerCase().includes(q) ||
        w.reason.toLowerCase().includes(q) ||
        (w.notes || '').toLowerCase().includes(q)
      );
    }

    return true;
  }).sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime());

  const totalFilteredCost = filteredLogs.reduce((sum, w) => sum + (w.costLost || 0), 0);
  const totalFilteredItems = filteredLogs.length;

  const handleExportCsv = () => {
    const csvContent = storageService.exportWasteCsv(filteredLogs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Waste_Log_Cafe_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-400" />
            <span>Pencatatan & Analisa Waste</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Lacak kerugian bahan basi, tumpah, overprep, dan sisa racikan barista harian.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={onOpenQuickWaste}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Catat Waste</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2.5">
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeSubTab === 'logs'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Riwayat Log ({wasteLogs.length})
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeSubTab === 'analytics'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Analisa & Pareto
        </button>

        <button
          onClick={() => setActiveSubTab('insights')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'insights'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>SOP & Rekomendasi</span>
        </button>
      </div>

      {/* Content */}
      {activeSubTab === 'insights' ? (
        <WasteInsights wasteLogs={wasteLogs} ingredients={ingredients} />
      ) : activeSubTab === 'analytics' ? (
        <div className="space-y-4">
          <WasteInsights wasteLogs={wasteLogs} ingredients={ingredients} />
        </div>
      ) : (
        /* Logs Tab */
        <div className="space-y-3">
          
          {/* Filters Bar */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl space-y-2.5">
            
            <div className="flex flex-col md:flex-row gap-2.5 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-72">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari bahan, barista, catatan..."
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                />
              </div>

              {/* Date Filter Buttons */}
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 w-full md:w-auto overflow-x-auto">
                <button
                  onClick={() => setDateFilter('today')}
                  className={`px-2.5 py-0.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                    dateFilter === 'today' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Hari Ini
                </button>
                <button
                  onClick={() => setDateFilter('7days')}
                  className={`px-2.5 py-0.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                    dateFilter === '7days' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  7 Hari
                </button>
                <button
                  onClick={() => setDateFilter('thisMonth')}
                  className={`px-2.5 py-0.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                    dateFilter === 'thisMonth' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Bulan Ini
                </button>
                <button
                  onClick={() => setDateFilter('all')}
                  className={`px-2.5 py-0.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                    dateFilter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Semua
                </button>
              </div>
            </div>

            {/* Sub Filter: Category and Reason */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/80 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-400 text-[11px]">Alasan:</span>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-300 text-xs focus:outline-none"
                >
                  <option value="All">Semua Alasan</option>
                  <option value="Kadaluarsa / Basi">Kadaluarsa / Basi</option>
                  <option value="Tumpah / Rusak di Bar">Tumpah / Rusak</option>
                  <option value="Salah Resep / Barista Error">Salah Resep</option>
                  <option value="Over-extraction / Dial-in Kopi">Dial-in Kopi</option>
                  <option value="Sisa Prep / Overprep Harian">Sisa Overprep</option>
                  <option value="Kualitas Bahan Buruk / Reject Supplier">Reject Supplier</option>
                  <option value="Uji Coba Resep / QC Training">Uji Coba / QC</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-zinc-400 text-[11px]">Kategori:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-300 text-xs focus:outline-none"
                >
                  <option value="All">Semua Kategori</option>
                  <option value="Kopi & Espresso">Kopi & Espresso</option>
                  <option value="Susu & Dairy">Susu & Dairy</option>
                  <option value="Syrup & Sauce">Syrup & Sauce</option>
                  <option value="Powder & Teh">Powder & Teh</option>
                  <option value="Bakery & Pastry">Bakery & Pastry</option>
                  <option value="Kitchen & Protein">Kitchen & Protein</option>
                  <option value="Packaging & Cup">Packaging & Cup</option>
                </select>
              </div>

              <div className="ml-auto text-zinc-300 text-xs">
                Total Terfilter: <strong className="text-rose-400 font-semibold">{formatRupiah(totalFilteredCost)}</strong> ({totalFilteredItems} catatan)
              </div>
            </div>

          </div>

          {/* Waste Logs List */}
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/40 border border-dashed border-zinc-800 rounded-xl text-zinc-400">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400/60 mb-2" />
              <p className="text-sm font-semibold text-zinc-200">Tidak ada catatan waste yang cocok.</p>
              <p className="text-xs text-zinc-400 mt-0.5">Ubah filter atau catat waste baru bila ada bahan terbuang.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700/80 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5"
                >
                  {/* Left: Info */}
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-zinc-100 text-xs">{log.ingredientName}</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                        {log.category}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        {log.reason}
                      </span>
                      {log.isPreventable ? (
                        <span className="text-[10px] text-amber-400 font-medium">
                          (Dapat dicegah)
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {formatDateIndo(log.date)} • {log.time || '12:00'} ({log.shift})
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-zinc-500" />
                        {log.responsiblePerson}
                      </span>
                    </div>

                    {log.notes && (
                      <p className="text-[11px] text-zinc-400 italic mt-0.5">
                        "{log.notes}" {log.actionTaken ? `• Tindakan: ${log.actionTaken}` : ''}
                      </p>
                    )}
                  </div>

                  {/* Right: Quantity & Loss Nominal */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-semibold text-zinc-200">
                        {log.amount} {log.unit}
                      </p>
                      <p className="text-xs font-bold text-rose-400">
                        - {formatRupiah(log.costLost)}
                      </p>
                    </div>

                    <button
                      onClick={() => onDeleteWaste(log.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
