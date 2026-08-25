import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Copy, 
  Check, 
  ExternalLink, 
  UploadCloud, 
  DownloadCloud, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Code2, 
  Download, 
  FileJson, 
  RotateCcw 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoogleSheetsConfig, Ingredient, Recipe, WasteLog, CafeSettings } from '../../types';
import { GOOGLE_APPS_SCRIPT_CODE } from '../../services/appsScriptTemplate';
import { storageService } from '../../services/storageService';

interface GoogleSheetsSyncProps {
  sheetsConfig: GoogleSheetsConfig;
  onSaveConfig: (config: GoogleSheetsConfig) => void;
  ingredients: Ingredient[];
  recipes: Recipe[];
  wasteLogs: WasteLog[];
  settings: CafeSettings;
  onDataImported: (data: {
    ingredients?: Ingredient[];
    recipes?: Recipe[];
    wasteLogs?: WasteLog[];
    settings?: CafeSettings;
  }) => void;
  onResetData: () => void;
}

export const GoogleSheetsSync: React.FC<GoogleSheetsSyncProps> = ({
  sheetsConfig,
  onSaveConfig,
  ingredients,
  recipes,
  wasteLogs,
  settings,
  onDataImported,
  onResetData,
}) => {
  const [webAppUrl, setWebAppUrl] = useState(sheetsConfig.webAppUrl || '');
  const [sheetUrl, setSheetUrl] = useState(sheetsConfig.sheetUrl || '');
  const [autoSync, setAutoSync] = useState(sheetsConfig.autoSync || false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showCode, setShowCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleSaveConfig = () => {
    const updated: GoogleSheetsConfig = {
      sheetUrl: sheetUrl.trim(),
      webAppUrl: webAppUrl.trim(),
      autoSync,
      status: webAppUrl.trim() ? 'connected' : 'disconnected',
      lastSyncTime: new Date().toISOString()
    };
    onSaveConfig(updated);
    setStatusMessage({ type: 'success', text: 'Konfigurasi Google Sheets berhasil disimpan!' });
  };

  const handlePushToSheets = async () => {
    if (!webAppUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Silakan isi Web App URL terlebih dahulu.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Mengirim seluruh data ke Google Sheet...' });

    try {
      const res = await storageService.syncToGoogleSheets(webAppUrl.trim(), {
        ingredients,
        recipes,
        wasteLogs,
        settings
      });

      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        confetti({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.6 }
        });
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal sinkronisasi.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchFromSheets = async () => {
    if (!webAppUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Silakan isi Web App URL terlebih dahulu.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Mengambil data dari Google Sheet...' });

    try {
      const res = await storageService.fetchFromGoogleSheets(webAppUrl.trim());
      if (res.success && res.data) {
        onDataImported(res.data);
        setStatusMessage({ type: 'success', text: 'Data dari Google Sheet berhasil diimpor ke aplikasi!' });
        confetti({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.6 }
        });
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Gagal mengambil data.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mengambil data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadBackup = () => {
    const jsonStr = storageService.exportFullBackupJson({
      ingredients,
      recipes,
      wasteLogs,
      settings
    });
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BaristaCost_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.ingredients || parsed.recipes) {
          onDataImported(parsed);
          setStatusMessage({ type: 'success', text: 'File backup JSON berhasil dipulihkan!' });
        } else {
          setStatusMessage({ type: 'error', text: 'Format file JSON tidak valid.' });
        }
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Gagal membaca file JSON.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <span>Sinkronisasi Google Spreadsheet</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Database cloud gratis & permanen tanpa sewa server database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePushToSheets}
            disabled={isLoading}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
            <span>Kirim ke Sheet</span>
          </button>
        </div>
      </div>

      {/* Status message */}
      {statusMessage && (
        <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-medium ${
          statusMessage.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            : statusMessage.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            : 'bg-zinc-800 border-zinc-700 text-zinc-300'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {statusMessage.type === 'info' && <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-zinc-400 hover:text-zinc-200 text-xs">✕</button>
        </div>
      )}

      {/* Grid: Config & Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Setup & Actions */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <h3 className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-amber-400" />
                <span>Konfigurasi Web App URL</span>
              </h3>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                sheetsConfig.webAppUrl 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}>
                {sheetsConfig.webAppUrl ? '● Terhubung' : '○ Belum Terhubung'}
              </span>
            </div>

            {/* Form URL */}
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-medium text-[11px] block">
                  Google Apps Script Web App URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  value={webAppUrl}
                  onChange={(e) => setWebAppUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-zinc-700 placeholder-zinc-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-medium text-[11px] block">
                  Link Google Spreadsheet (Bookmark)
                </label>
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1abc.../edit"
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-zinc-700 placeholder-zinc-600"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {sheetUrl ? (
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-1 text-xs"
                  >
                    <span>Buka Spreadsheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : <span />}

                <button
                  onClick={handleSaveConfig}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            </div>

            {/* Action Buttons for Sync */}
            <div className="pt-3 border-t border-zinc-800 grid grid-cols-2 gap-2">
              <button
                onClick={handlePushToSheets}
                disabled={isLoading}
                className="p-2.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-100 border border-zinc-700/80 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kirim ke Sheet</span>
              </button>

              <button
                onClick={handleFetchFromSheets}
                disabled={isLoading}
                className="p-2.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-100 border border-zinc-700/80 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-blue-400" />
                <span>Tarik dari Sheet</span>
              </button>
            </div>

          </div>

          {/* Backup, Restore & Reset Box */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <FileJson className="w-3.5 h-3.5 text-amber-400" />
              <span>Backup Lokal File JSON</span>
            </h3>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={handleDownloadBackup}
                className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-800 flex items-center gap-1.5 text-xs font-medium"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Unduh JSON</span>
              </button>

              <label className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-800 flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
                <span>Restore JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleJsonUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={onResetData}
                className="ml-auto px-3 py-1.5 bg-zinc-950 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 rounded-lg border border-zinc-800 flex items-center gap-1.5 text-xs font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right 5 Cols: Script Code */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <h3 className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span>Kode Apps Script (Code.gs)</span>
              </h3>
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium rounded-md flex items-center gap-1 transition-colors"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Tersalin' : 'Salin Kode'}</span>
              </button>
            </div>

            <ol className="text-xs text-zinc-400 space-y-1.5 list-decimal list-inside leading-normal">
              <li>Buat <strong>Google Spreadsheet baru</strong> di Google Drive.</li>
              <li>Klik menu <strong>Extensions &gt; Apps Script</strong>.</li>
              <li>Hapus isi default, lalu <strong>Paste kode ini</strong>.</li>
              <li>Klik <strong>Deploy &gt; New deployment</strong>.</li>
              <li>Pilih tipe: <strong>Web App</strong>.</li>
              <li>Set <em>Execute as: Me</em> dan <em>Who has access: Anyone</em>.</li>
              <li>Salin URL Web App dan tempel di formulir sebelah kiri.</li>
            </ol>

            <div className="pt-2">
              <button
                onClick={() => setShowCode(!showCode)}
                className="text-xs text-amber-400 hover:underline font-medium"
              >
                {showCode ? 'Sembunyikan Source Code' : 'Lihat Source Code Code.gs'}
              </button>

              {showCode && (
                <pre className="mt-2 p-2.5 bg-zinc-950 rounded-lg text-[10px] text-zinc-300 font-mono overflow-x-auto max-h-56 border border-zinc-800">
                  {GOOGLE_APPS_SCRIPT_CODE}
                </pre>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
