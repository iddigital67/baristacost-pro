import React from 'react';
import { X, Printer, Coffee, UtensilsCrossed, CheckCircle } from 'lucide-react';
import { Recipe, Ingredient } from '../../types';
import { formatRupiah, formatPercent, formatDateIndo } from '../../utils/formatters';

interface RecipePrintCardProps {
  recipe: Recipe | null;
  onClose: () => void;
  cafeName: string;
}

export const RecipePrintCard: React.FC<RecipePrintCardProps> = ({
  recipe,
  onClose,
  cafeName,
}) => {
  if (!recipe) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-stone-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Top bar (Hidden when printing) */}
        <div className="p-4 bg-stone-100 border-b border-stone-200 flex items-center justify-between print:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
            Preview Kartu SOP Resep & Standar HPP
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="p-8 space-y-6 font-sans">
          
          {/* Cafe Header */}
          <div className="border-b-2 border-stone-900 pb-4 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-stone-900">
                {cafeName}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Standard Recipe Card & Costing Sheet (SOP Bar & Kitchen)
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold px-2 py-1 bg-stone-100 rounded text-stone-700 border border-stone-300">
                {recipe.category}
              </span>
              <p className="text-[10px] text-stone-400 mt-1">
                Updated: {formatDateIndo(recipe.lastUpdated)}
              </p>
            </div>
          </div>

          {/* Menu Title & Overview */}
          <div className="grid grid-cols-3 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="col-span-2">
              <h3 className="text-lg font-bold text-stone-900">{recipe.name}</h3>
              <p className="text-xs text-stone-600 mt-0.5">{recipe.description || 'Standar racikan SOP resmi.'}</p>
              <div className="flex gap-4 mt-2 text-xs text-stone-500">
                <span>Porsi: <strong>{recipe.servingSize || '1 Porsi'}</strong></span>
                <span>Waktu Prep: <strong>{recipe.preparationTimeMinutes || 3} Menit</strong></span>
              </div>
            </div>

            <div className="text-right border-l border-stone-200 pl-4 space-y-1">
              <p className="text-[10px] uppercase font-bold text-stone-400">Harga Jual</p>
              <p className="text-xl font-black text-amber-700">{formatRupiah(recipe.sellingPrice)}</p>
              <p className="text-xs font-semibold text-emerald-700">
                Margin: {formatPercent(recipe.actualMarginPercent, 1)}
              </p>
            </div>
          </div>

          {/* Ingredients Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Komposisi Bahan Baku (Gramasi / Porsi)
            </h4>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-stone-200 text-stone-500 uppercase">
                  <th className="py-2 font-bold">Nama Bahan / Packaging</th>
                  <th className="py-2 text-center font-bold">Takaran / Qty</th>
                  <th className="py-2 text-right font-bold">Biaya (HPP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recipe.ingredients.map((item, idx) => (
                  <tr key={idx} className={item.isPackaging ? 'bg-stone-50/60' : ''}>
                    <td className="py-2 text-stone-800 font-medium">
                      {item.isPackaging ? '📦 ' : '• '} {item.ingredientName}
                    </td>
                    <td className="py-2 text-center font-semibold text-stone-700">
                      {item.amount} {item.unit}
                    </td>
                    <td className="py-2 text-right font-semibold text-stone-900">
                      {formatRupiah(item.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-stone-300 font-bold">
                  <td className="py-2">Total Biaya Bahan Baku</td>
                  <td></td>
                  <td className="py-2 text-right">{formatRupiah(recipe.totalIngredientsCost)}</td>
                </tr>
                <tr className="font-bold text-stone-600">
                  <td className="py-1">Biaya Kemasan (Packaging)</td>
                  <td></td>
                  <td className="py-1 text-right">{formatRupiah(recipe.packagingCost)}</td>
                </tr>
                <tr className="border-t border-b-2 border-stone-900 text-sm font-black text-stone-950 bg-amber-50">
                  <td className="py-2">TOTAL HPP PER PORSI</td>
                  <td></td>
                  <td className="py-2 text-right text-amber-900">{formatRupiah(recipe.totalHpp)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Barista Instructions / Sign-off */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-stone-200 text-xs">
            <div className="space-y-1">
              <p className="font-bold text-stone-800">Catatan Kualitas & SOP Bar:</p>
              <ul className="list-disc list-inside text-stone-600 space-y-0.5 text-[11px]">
                <li>Gunakan timbangan digital untuk akurasi gramasi.</li>
                <li>Periksa tanggal kadaluarsa susu dan bahan dairy.</li>
                <li>Laporkan sisa bahan ke form log waste harian.</li>
              </ul>
            </div>

            <div className="flex justify-around items-end text-center text-stone-500 text-[11px]">
              <div>
                <div className="w-24 border-b border-stone-400 mb-1"></div>
                <span>Head Barista</span>
              </div>
              <div>
                <div className="w-24 border-b border-stone-400 mb-1"></div>
                <span>Owner / Manager</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
