import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  TrendingUp, 
  DollarSign, 
  BarChart3
} from 'lucide-react';
import { Recipe, Ingredient, WasteLog, CafeSettings } from '../../types';
import { formatRupiah, formatPercent } from '../../utils/formatters';
import { storageService } from '../../services/storageService';

interface ReportsViewProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  wasteLogs: WasteLog[];
  settings: CafeSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  recipes,
  ingredients,
  wasteLogs,
  settings,
}) => {
  const [reportType, setReportType] = useState<'matrix' | 'financial' | 'printableForm'>('matrix');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);
  const monthLogs = wasteLogs.filter(w => w.date && w.date.startsWith(currentMonthStr));
  const monthWasteCost = monthLogs.reduce((sum, w) => sum + (w.costLost || 0), 0);

  // Financial calculations
  const totalMonthlyEstRevenue = recipes.reduce((sum, r) => sum + (r.sellingPrice * (r.estimatedSalesPerMonth || 0)), 0);
  const totalMonthlyEstHpp = recipes.reduce((sum, r) => sum + (r.totalHpp * (r.estimatedSalesPerMonth || 0)), 0);
  const grossProfit = totalMonthlyEstRevenue - totalMonthlyEstHpp;
  const netEstimatedProfit = grossProfit - settings.monthlyFixedCost - monthWasteCost;

  // Menu Engineering Matrix Classification
  const activeRecipes = recipes.filter(r => r.status === 'Active');
  const avgMargin = activeRecipes.length > 0
    ? activeRecipes.reduce((sum, r) => sum + r.actualMarginPercent, 0) / activeRecipes.length
    : 65;
  const avgSales = activeRecipes.length > 0
    ? activeRecipes.reduce((sum, r) => sum + (r.estimatedSalesPerMonth || 0), 0) / activeRecipes.length
    : 200;

  const stars = activeRecipes.filter(r => r.actualMarginPercent >= avgMargin && (r.estimatedSalesPerMonth || 0) >= avgSales);
  const workhorses = activeRecipes.filter(r => r.actualMarginPercent < avgMargin && (r.estimatedSalesPerMonth || 0) >= avgSales);
  const puzzles = activeRecipes.filter(r => r.actualMarginPercent >= avgMargin && (r.estimatedSalesPerMonth || 0) < avgSales);
  const dogs = activeRecipes.filter(r => r.actualMarginPercent < avgMargin && (r.estimatedSalesPerMonth || 0) < avgSales);

  const handlePrint = () => {
    window.print();
  };

  const handleExportHppCsv = () => {
    const csvContent = storageService.exportHppCsv(recipes);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Menu_HPP_Summary_${todayStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Laporan & Menu Engineering</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Analisis matriks profitabilitas menu, estimasi P&L, dan cetak form log waste fisik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportHppCsv}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor HPP</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2.5 print:hidden">
        <button
          onClick={() => setReportType('matrix')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            reportType === 'matrix'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Matriks Menu Engineering
        </button>

        <button
          onClick={() => setReportType('financial')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            reportType === 'financial'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Ringkasan Finansial P&L
        </button>

        <button
          onClick={() => setReportType('printableForm')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            reportType === 'printableForm'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Form Cetak Fisik Bar
        </button>
      </div>

      {/* TAB 1: MENU ENGINEERING MATRIX */}
      {reportType === 'matrix' && (
        <div className="space-y-4">
          
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-300">
            <div>
              <p className="font-semibold text-zinc-100">Klasifikasi BCG Menu Engineering Cafe</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Benchmark: Margin Rata-rata <strong>{formatPercent(avgMargin, 1)}</strong> | Penjualan Rata-rata <strong>{Math.round(avgSales)} cup/bln</strong>
              </p>
            </div>
            <span className="text-[11px] text-zinc-400 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
              Total {activeRecipes.length} Menu Aktif
            </span>
          </div>

          {/* 4 Quadrants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* STARS */}
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">⭐</span>
                  <div>
                    <h3 className="font-semibold text-emerald-400 text-xs">STARS (Menu Bintang)</h3>
                    <p className="text-[10px] text-zinc-400">Margin Tinggi • Penjualan Laris</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {stars.length} Menu
                </span>
              </div>

              <p className="text-[11px] text-zinc-400">
                <strong>Strategi:</strong> Pertahankan konsistensi rasa dan ketersediaan stok bahan baku di bar.
              </p>

              <div className="space-y-1 pt-1.5 border-t border-zinc-800">
                {stars.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">Belum ada menu di kategori ini.</p>
                ) : (
                  stars.map(m => (
                    <div key={m.id} className="p-2 rounded-lg bg-zinc-950/70 border border-zinc-800 flex justify-between text-xs">
                      <span className="font-medium text-zinc-200">{m.name}</span>
                      <div className="text-right">
                        <span className="text-emerald-400 font-semibold">{formatPercent(m.actualMarginPercent, 1)}</span>
                        <span className="text-zinc-400 ml-2">({m.estimatedSalesPerMonth} cup)</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* PLOWHORSES */}
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-blue-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🐎</span>
                  <div>
                    <h3 className="font-semibold text-blue-400 text-xs">PLOWHORSES (Kuda Penarik)</h3>
                    <p className="text-[10px] text-zinc-400">Margin Rendah • Penjualan Ramai</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {workhorses.length} Menu
                </span>
              </div>

              <p className="text-[11px] text-zinc-400">
                <strong>Strategi:</strong> Naikkan harga jual bertahap (Rp 1.000 - 2.000) atau renegosiasi supplier.
              </p>

              <div className="space-y-1 pt-1.5 border-t border-zinc-800">
                {workhorses.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">Tidak ada menu di kategori ini.</p>
                ) : (
                  workhorses.map(m => (
                    <div key={m.id} className="p-2 rounded-lg bg-zinc-950/70 border border-zinc-800 flex justify-between text-xs">
                      <span className="font-medium text-zinc-200">{m.name}</span>
                      <div className="text-right">
                        <span className="text-blue-400 font-semibold">{formatPercent(m.actualMarginPercent, 1)}</span>
                        <span className="text-zinc-400 ml-2">({m.estimatedSalesPerMonth} cup)</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* PUZZLES */}
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-purple-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🧩</span>
                  <div>
                    <h3 className="font-semibold text-purple-400 text-xs">PUZZLES (Margin Tinggi)</h3>
                    <p className="text-[10px] text-zinc-400">Margin Tinggi • Penjualan Sedikit</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {puzzles.length} Menu
                </span>
              </div>

              <p className="text-[11px] text-zinc-400">
                <strong>Strategi:</strong> Buat promo bundling (combo) atau beri highlight khusus di daftar menu.
              </p>

              <div className="space-y-1 pt-1.5 border-t border-zinc-800">
                {puzzles.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">Tidak ada menu di kategori ini.</p>
                ) : (
                  puzzles.map(m => (
                    <div key={m.id} className="p-2 rounded-lg bg-zinc-950/70 border border-zinc-800 flex justify-between text-xs">
                      <span className="font-medium text-zinc-200">{m.name}</span>
                      <div className="text-right">
                        <span className="text-purple-400 font-semibold">{formatPercent(m.actualMarginPercent, 1)}</span>
                        <span className="text-zinc-400 ml-2">({m.estimatedSalesPerMonth} cup)</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* DOGS */}
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-rose-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🐕</span>
                  <div>
                    <h3 className="font-semibold text-rose-400 text-xs">DOGS (Kurang Produktif)</h3>
                    <p className="text-[10px] text-zinc-400">Margin Rendah • Penjualan Rendah</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {dogs.length} Menu
                </span>
              </div>

              <p className="text-[11px] text-zinc-400">
                <strong>Strategi:</strong> Evaluasi hapus dari menu untuk mengurangi kompleksitas stok bahan baku.
              </p>

              <div className="space-y-1 pt-1.5 border-t border-zinc-800">
                {dogs.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">Hebat! Tidak ada menu yang masuk kategori Dogs.</p>
                ) : (
                  dogs.map(m => (
                    <div key={m.id} className="p-2 rounded-lg bg-zinc-950/70 border border-zinc-800 flex justify-between text-xs">
                      <span className="font-medium text-zinc-200">{m.name}</span>
                      <div className="text-right">
                        <span className="text-rose-400 font-semibold">{formatPercent(m.actualMarginPercent, 1)}</span>
                        <span className="text-zinc-400 ml-2">({m.estimatedSalesPerMonth} cup)</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: FINANCIAL SUMMARY */}
      {reportType === 'financial' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <p className="text-[11px] font-medium text-zinc-400">Potensi Omset Bulanan</p>
              <p className="text-lg font-bold text-zinc-100">{formatRupiah(totalMonthlyEstRevenue)}</p>
              <p className="text-[10px] text-zinc-400">Berdasarkan estimasi penjualan</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <p className="text-[11px] font-medium text-zinc-400">Total Estimasi HPP</p>
              <p className="text-lg font-bold text-amber-400">{formatRupiah(totalMonthlyEstHpp)}</p>
              <p className="text-[10px] text-zinc-400">
                {totalMonthlyEstRevenue > 0 ? formatPercent((totalMonthlyEstHpp / totalMonthlyEstRevenue) * 100, 1) : '0%'} dari omset
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <p className="text-[11px] font-medium text-zinc-400">Kerugian Waste Bulan Ini</p>
              <p className="text-lg font-bold text-rose-400">- {formatRupiah(monthWasteCost)}</p>
              <p className="text-[10px] text-zinc-400">{monthLogs.length} catatan log waste</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <p className="text-[11px] font-medium text-zinc-400">Est. Laba Bersih Operasional</p>
              <p className="text-lg font-bold text-emerald-400">{formatRupiah(netEstimatedProfit)}</p>
              <p className="text-[10px] text-zinc-400">Setelah Fixed Cost ({formatRupiah(settings.monthlyFixedCost)})</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRINTABLE PHYSICAL LOG WASTE FORM */}
      {reportType === 'printableForm' && (
        <div className="bg-white text-zinc-900 p-6 rounded-2xl shadow-sm max-w-4xl mx-auto font-sans">
          <div className="border-b-2 border-zinc-900 pb-3 mb-3 flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold uppercase text-zinc-900">
                FORMULIR PENCATATAN WASTE & SISA BAHAN
              </h2>
              <p className="text-xs text-zinc-600 font-medium">{settings.cafeName} • Bar Station</p>
            </div>
            <div className="text-right text-xs">
              <p>Tanggal: ___________________</p>
              <p className="mt-0.5">Shift: [ ] Pagi [ ] Siang [ ] Malam</p>
            </div>
          </div>

          <p className="text-[11px] text-zinc-600 mb-2 italic">
            *Catat semua bahan basi, tumpah, overprep susu, atau gagal dial-in kopi sebelum dibuang.
          </p>

          <table className="w-full text-xs border-collapse border border-zinc-400 text-left">
            <thead>
              <tr className="bg-zinc-100 text-zinc-800">
                <th className="border border-zinc-400 p-1.5 text-center w-8">No</th>
                <th className="border border-zinc-400 p-1.5">Jam</th>
                <th className="border border-zinc-400 p-1.5">Nama Bahan Baku</th>
                <th className="border border-zinc-400 p-1.5 text-center">Jumlah (gr/ml/pcs)</th>
                <th className="border border-zinc-400 p-1.5">Penyebab Waste</th>
                <th className="border border-zinc-400 p-1.5">Barista</th>
                <th className="border border-zinc-400 p-1.5 text-center">Paraf</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, i) => (
                <tr key={i} className="h-8">
                  <td className="border border-zinc-400 text-center font-medium">{i + 1}</td>
                  <td className="border border-zinc-400"></td>
                  <td className="border border-zinc-400"></td>
                  <td className="border border-zinc-400"></td>
                  <td className="border border-zinc-400"></td>
                  <td className="border border-zinc-400"></td>
                  <td className="border border-zinc-400"></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-6 mt-6 text-xs text-center">
            <div>
              <p className="font-semibold">Closing Barista:</p>
              <div className="h-12"></div>
              <p>( _______________________ )</p>
            </div>
            <div>
              <p className="font-semibold">Diperiksa oleh (Supervisor/Owner):</p>
              <div className="h-12"></div>
              <p>( _______________________ )</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
