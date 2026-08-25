import { Ingredient, Recipe, WasteLog, CafeSettings, GoogleSheetsConfig, UserSession } from '../types';
import { INITIAL_INGREDIENTS, INITIAL_RECIPES, INITIAL_WASTE_LOGS, INITIAL_SETTINGS } from '../data/initialData';

const KEYS = {
  INGREDIENTS: 'baristacost_ingredients_v1',
  RECIPES: 'baristacost_recipes_v1',
  WASTE_LOGS: 'baristacost_waste_logs_v1',
  SETTINGS: 'baristacost_settings_v1',
  SHEETS_CONFIG: 'baristacost_sheets_config_v1',
  USER_SESSION: 'baristacost_user_session_v1'
};

export const storageService = {
  // --- USER SESSION & ROLE ---
  getUserSession(): UserSession {
    try {
      const data = localStorage.getItem(KEYS.USER_SESSION);
      if (data) {
        const parsed = JSON.parse(data);
        if (typeof parsed.isLoggedIn === 'boolean') {
          return parsed;
        }
        return {
          isLoggedIn: true,
          role: parsed.role || 'owner',
          currentBaristaName: parsed.currentBaristaName || 'Rian (Head Barista)',
          shift: parsed.shift || 'Shift Pagi (Opening)'
        };
      }
    } catch {}
    // Default initial state: prompt login screen on first load
    return { 
      isLoggedIn: false, 
      role: 'owner', 
      currentBaristaName: 'Rian (Head Barista)',
      shift: 'Shift Pagi (Opening)'
    };
  },

  saveUserSession(session: UserSession): void {
    localStorage.setItem(KEYS.USER_SESSION, JSON.stringify(session));
  },

  clearUserSession(): void {
    const current = this.getUserSession();
    localStorage.setItem(KEYS.USER_SESSION, JSON.stringify({
      ...current,
      isLoggedIn: false,
    }));
  },

  // --- INGREDIENTS ---
  getIngredients(): Ingredient[] {
    try {
      const data = localStorage.getItem(KEYS.INGREDIENTS);
      return data ? JSON.parse(data) : INITIAL_INGREDIENTS;
    } catch {
      return INITIAL_INGREDIENTS;
    }
  },

  saveIngredients(ingredients: Ingredient[]): void {
    localStorage.setItem(KEYS.INGREDIENTS, JSON.stringify(ingredients));
  },

  // --- RECIPES ---
  getRecipes(): Recipe[] {
    try {
      const data = localStorage.getItem(KEYS.RECIPES);
      return data ? JSON.parse(data) : INITIAL_RECIPES;
    } catch {
      return INITIAL_RECIPES;
    }
  },

  saveRecipes(recipes: Recipe[]): void {
    localStorage.setItem(KEYS.RECIPES, JSON.stringify(recipes));
  },

  // --- WASTE LOGS ---
  getWasteLogs(): WasteLog[] {
    try {
      const data = localStorage.getItem(KEYS.WASTE_LOGS);
      return data ? JSON.parse(data) : INITIAL_WASTE_LOGS;
    } catch {
      return INITIAL_WASTE_LOGS;
    }
  },

  saveWasteLogs(logs: WasteLog[]): void {
    localStorage.setItem(KEYS.WASTE_LOGS, JSON.stringify(logs));
  },

  // --- SETTINGS ---
  getSettings(): CafeSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (!parsed.ownerPin) {
          parsed.ownerPin = '1234';
        }
        return parsed;
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings: CafeSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  // --- GOOGLE SHEETS CONFIG ---
  getSheetsConfig(): GoogleSheetsConfig {
    const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbwHNObTSnaGTvNaRdVvhK6cAro-ZZHGvooi2tiWtGHtA2LBZjWrsWDj_A33UhxzWcJGkw/exec';
    try {
      const data = localStorage.getItem(KEYS.SHEETS_CONFIG);
      if (data) {
        const parsed = JSON.parse(data);
        if (!parsed.webAppUrl || parsed.webAppUrl.includes('AKfycbwAEsTDXx_TCA53nH4R6pFqE-fKny75037At8aGLA4mV5piJPtTIfI4gKXIcTgiwBB_')) {
          parsed.webAppUrl = DEFAULT_URL;
          parsed.status = 'connected';
          localStorage.setItem(KEYS.SHEETS_CONFIG, JSON.stringify(parsed));
        }
        return parsed;
      }
      const initialConfig: GoogleSheetsConfig = {
        sheetUrl: '',
        webAppUrl: DEFAULT_URL,
        autoSync: true,
        status: 'connected',
        lastSyncTime: new Date().toISOString()
      };
      localStorage.setItem(KEYS.SHEETS_CONFIG, JSON.stringify(initialConfig));
      return initialConfig;
    } catch {
      return {
        sheetUrl: '',
        webAppUrl: DEFAULT_URL,
        autoSync: true,
        status: 'connected',
        lastSyncTime: new Date().toISOString()
      };
    }
  },

  saveSheetsConfig(config: GoogleSheetsConfig): void {
    localStorage.setItem(KEYS.SHEETS_CONFIG, JSON.stringify(config));
  },

  // --- RESET TO DEMO DATA ---
  resetToDefault(): { ingredients: Ingredient[]; recipes: Recipe[]; wasteLogs: WasteLog[]; settings: CafeSettings } {
    localStorage.setItem(KEYS.INGREDIENTS, JSON.stringify(INITIAL_INGREDIENTS));
    localStorage.setItem(KEYS.RECIPES, JSON.stringify(INITIAL_RECIPES));
    localStorage.setItem(KEYS.WASTE_LOGS, JSON.stringify(INITIAL_WASTE_LOGS));
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    return {
      ingredients: INITIAL_INGREDIENTS,
      recipes: INITIAL_RECIPES,
      wasteLogs: INITIAL_WASTE_LOGS,
      settings: INITIAL_SETTINGS
    };
  },

  resetToDefaults(): { ingredients: Ingredient[]; recipes: Recipe[]; wasteLogs: WasteLog[]; settings: CafeSettings } {
    return this.resetToDefault();
  },

  // --- GOOGLE APPS SCRIPT LIVE SYNC ---
  async syncToGoogleSheets(webAppUrl: string, payload: {
    ingredients: Ingredient[];
    recipes: Recipe[];
    wasteLogs: WasteLog[];
    settings: CafeSettings;
  }): Promise<{ success: boolean; message: string }> {
    if (!webAppUrl || !webAppUrl.startsWith('https://script.google.com/')) {
      throw new Error('URL Google Apps Script tidak valid. Pastikan diawali dengan https://script.google.com/macros/s/.../exec');
    }

    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Needed for Google Apps Script CORS
        },
        body: JSON.stringify({
          action: 'SYNC_ALL',
          payload
        }),
      });

      const json = await response.json();
      if (json.status === 'success') {
        return { success: true, message: json.result?.message || 'Data berhasil disinkronkan ke Google Sheet!' };
      } else {
        throw new Error(json.message || 'Gagal sinkronisasi Google Sheet');
      }
    } catch (err: any) {
      // Fallback for CORS mode if standard fetch fails due to redirect in some browser contexts
      return {
        success: false,
        message: err.message || 'Gagal menghubungi Google Apps Script. Pastikan Web App diset "Who has access: Anyone".'
      };
    }
  },

  async fetchFromGoogleSheets(webAppUrl: string): Promise<{
    success: boolean;
    data?: {
      ingredients?: Ingredient[];
      recipes?: Recipe[];
      wasteLogs?: WasteLog[];
      settings?: CafeSettings;
    };
    message?: string;
  }> {
    if (!webAppUrl || !webAppUrl.startsWith('https://script.google.com/')) {
      throw new Error('URL Google Apps Script tidak valid.');
    }

    const apiUrl = webAppUrl.includes('?') ? `${webAppUrl}&api=get` : `${webAppUrl}?api=get`;
    const response = await fetch(apiUrl, {
      method: 'GET',
    });

    const json = await response.json();
    if (json.status === 'success' && json.data) {
      return { success: true, data: json.data };
    } else {
      return { success: false, message: json.message || 'Gagal mengambil data dari Google Sheet' };
    }
  },

  // Quick single waste log to Google Sheet
  async logWasteToGoogleSheets(webAppUrl: string, wasteLog: WasteLog): Promise<boolean> {
    if (!webAppUrl) return false;
    try {
      await fetch(webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'LOG_WASTE',
          payload: wasteLog
        })
      });
      return true;
    } catch {
      return false;
    }
  },

  // --- EXPORT TO CSV / JSON ---
  exportFullBackupJson(data?: {
    ingredients?: Ingredient[];
    recipes?: Recipe[];
    wasteLogs?: WasteLog[];
    settings?: CafeSettings;
  }): string {
    const exportData = {
      app: 'BaristaCost PRO',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      ingredients: data?.ingredients || this.getIngredients(),
      recipes: data?.recipes || this.getRecipes(),
      wasteLogs: data?.wasteLogs || this.getWasteLogs(),
      settings: data?.settings || this.getSettings()
    };
    return JSON.stringify(exportData, null, 2);
  },

  exportToJson(): string {
    return this.exportFullBackupJson();
  },

  exportWasteCsv(logs: WasteLog[]): string {
    const headers = ['ID', 'Tanggal', 'Jam', 'Nama Bahan', 'Kategori', 'Jumlah', 'Satuan', 'Nominal Rugi (Rp)', 'Alasan Waste', 'Petugas/Barista', 'Shift', 'Bisa Dicegah', 'Catatan', 'Tindakan Korektif'];
    const rows = logs.map(l => [
      `"${l.id}"`,
      `"${l.date}"`,
      `"${l.time}"`,
      `"${l.ingredientName.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      l.amount,
      `"${l.unit}"`,
      l.costLost,
      `"${l.reason}"`,
      `"${l.responsiblePerson}"`,
      `"${l.shift}"`,
      l.isPreventable ? '"Ya"' : '"Tidak"',
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      `"${(l.actionTaken || '').replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  exportHppCsv(recipes: Recipe[]): string {
    const headers = ['ID Resep', 'Nama Menu', 'Kategori', 'Biaya Bahan (Rp)', 'Packaging (Rp)', 'Total HPP (Rp)', 'Harga Jual (Rp)', 'Margin (%)', 'Laba Kotor (Rp)', 'Est Jual/Bln'];
    const rows = recipes.map(r => [
      `"${r.id}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      r.totalIngredientsCost,
      r.packagingCost,
      r.totalHpp,
      r.sellingPrice,
      r.actualMarginPercent.toFixed(2),
      r.profitNominal,
      r.estimatedSalesPerMonth || 0
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
};
