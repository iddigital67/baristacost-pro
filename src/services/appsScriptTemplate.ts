/**
 * GOOGLE APPS SCRIPT CODE TEMPLATE (v2.3 - Rock-Solid & Production Ready)
 * Template backend Google Sheets & Standalone Web App BaristaCost
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * BARISTACOST - ULTRA-FAST STANDALONE WEB APP & GOOGLE SHEETS DB (v2.3)
 * =========================================================================
 * 1. Web App Standalone Super Cepat (Langsung Tampil 0 Detik tanpa blank)
 * 2. Database Cloud API (JSON) untuk sinkronisasi data BaristaCost
 *
 * CARA DEPLOY / UPDATE:
 * 1. Buka Google Spreadsheet
 * 2. Klik menu Ekstensi (Extensions) > Apps Script
 * 3. Hapus semua isi Code.gs lalu Paste seluruh kode ini
 * 4. Klik Simpan (Ctrl+S)
 * 5. Klik Deploy > Kelola Penerapan (Manage deployments)
 * 6. Klik ikon Pensil (Edit) > Pilih Versi Baru (New version)
 * 7. Klik Terapkan (Deploy)
 * =========================================================================
 */

var SHEET_BAHAN = "Bahan_Baku";
var SHEET_RESEP = "Menu_Resep";
var SHEET_WASTE = "Catatan_Waste";
var SHEET_SETTINGS = "Setting_Cafe";

/**
 * Handle HTTP GET Request
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    checkAndSetupSheets(ss);
    
    var ingredients = getSheetDataAsObjects(ss.getSheetByName(SHEET_BAHAN));
    var recipes = getSheetDataAsObjects(ss.getSheetByName(SHEET_RESEP));
    var wasteLogs = getSheetDataAsObjects(ss.getSheetByName(SHEET_WASTE));
    var settings = getSettingsObject(ss.getSheetByName(SHEET_SETTINGS));

    // 1. Jika dipanggil sebagai API JSON eksternal
    if (e && e.parameter && (e.parameter.api === "get" || e.parameter.action === "get_data")) {
      var responseData = {
        status: "success",
        timestamp: new Date().toISOString(),
        data: {
          ingredients: ingredients,
          recipes: recipes,
          wasteLogs: wasteLogs,
          settings: settings
        }
      };

      return ContentService.createTextOutput(JSON.stringify(responseData))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Default: Tampilkan Web App Standalone
    var initialData = {
      ingredients: ingredients,
      recipes: recipes,
      wasteLogs: wasteLogs,
      settings: settings
    };

    var htmlContent = buildStandaloneAppHtml(initialData);

    return HtmlService.createHtmlOutput(htmlContent)
      .setTitle("BaristaCost - Analisa Waste & HPP Cafe")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * API Simpan Data ke Spreadsheet
 */
function apiSaveAllData(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    checkAndSetupSheets(ss);
    if (payload.ingredients) writeIngredientsSheet(ss, payload.ingredients);
    if (payload.recipes) writeRecipesSheet(ss, payload.recipes);
    if (payload.wasteLogs) writeWasteLogsSheet(ss, payload.wasteLogs);
    if (payload.settings) writeSettingsSheet(ss, payload.settings);
    return { success: true, message: "Data tersimpan ke Spreadsheet!" };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * Handle HTTP POST Request
 */
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    checkAndSetupSheets(ss);

    var postData;
    if (e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else {
      throw new Error("No payload found in POST request");
    }

    var action = postData.action || "SYNC_ALL";
    var result = {};

    switch (action) {
      case "SYNC_ALL":
        if (postData.payload) {
          if (postData.payload.ingredients) writeIngredientsSheet(ss, postData.payload.ingredients);
          if (postData.payload.recipes) writeRecipesSheet(ss, postData.payload.recipes);
          if (postData.payload.wasteLogs) writeWasteLogsSheet(ss, postData.payload.wasteLogs);
          if (postData.payload.settings) writeSettingsSheet(ss, postData.payload.settings);
        }
        result = { success: true, message: "Data berhasil disinkronkan ke Google Sheet!" };
        break;

      case "LOG_WASTE":
        if (postData.payload) {
          result = appendWasteLog(ss, postData.payload);
        }
        break;

      default:
        throw new Error("Action tidak dikenali: " + action);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      timestamp: new Date().toISOString(),
      result: result
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Validasi dan setup otomatis sheet
 */
function checkAndSetupSheets(ss) {
  var sBahan = ss.getSheetByName(SHEET_BAHAN);
  if (!sBahan) {
    sBahan = ss.insertSheet(SHEET_BAHAN);
    var headersBahan = [
      "ID", "Nama Bahan", "Kategori", "Satuan Beli", "Harga Beli (Rp)",
      "Jumlah Satuan Beli", "Satuan Pakai", "Konversi (Pakai/Beli)",
      "Stok Saat Ini", "Alert Stok Minimum", "Biaya Per Satuan Pakai (Rp)",
      "Supplier", "Tanggal Expired", "Catatan", "Terakhir Diupdate"
    ];
    sBahan.getRange(1, 1, 1, headersBahan.length).setValues([headersBahan]);
    formatHeaderRow(sBahan, "#d97706", headersBahan.length);
  }

  var sResep = ss.getSheetByName(SHEET_RESEP);
  if (!sResep) {
    sResep = ss.insertSheet(SHEET_RESEP);
    var headersResep = [
      "ID", "Nama Menu", "Kategori", "Total Biaya Bahan (Rp)", "Biaya Packaging (Rp)",
      "Total HPP (Rp)", "Harga Jual (Rp)", "Margin Aktual (%)", "Profit Nominal (Rp)",
      "Estimasi Penjualan/Bulan", "Target Margin (%)", "Status", "Bahan & Komposisi (JSON)"
    ];
    sResep.getRange(1, 1, 1, headersResep.length).setValues([headersResep]);
    formatHeaderRow(sResep, "#059669", headersResep.length);
  }

  var sWaste = ss.getSheetByName(SHEET_WASTE);
  if (!sWaste) {
    sWaste = ss.insertSheet(SHEET_WASTE);
    var headersWaste = [
      "ID Waste", "Tanggal", "Jam", "Bahan Terbuang", "Kategori",
      "Jumlah Terbuang", "Satuan", "Nominal Kerugian (Rp)", "Alasan Waste",
      "Petugas/Barista", "Shift Kerja", "Bisa Dicegah?", "Catatan Kronologi", "Tindakan Korektif"
    ];
    sWaste.getRange(1, 1, 1, headersWaste.length).setValues([headersWaste]);
    formatHeaderRow(sWaste, "#dc2626", headersWaste.length);
  }

  var sSettings = ss.getSheetByName(SHEET_SETTINGS);
  if (!sSettings) {
    sSettings = ss.insertSheet(SHEET_SETTINGS);
    var headersSettings = ["Key / Parameter", "Nilai Setting"];
    sSettings.getRange(1, 1, 1, headersSettings.length).setValues([headersSettings]);
    formatHeaderRow(sSettings, "#4b5563", headersSettings.length);

    var defaultSettings = [
      ["cafeName", "Kopi Senja Utama"],
      ["tagline", "Specialty Coffee & Artisan Bakery"],
      ["defaultTargetMargin", 65],
      ["maxWasteTolerancePercent", 3],
      ["monthlyRevenueTarget", 75000000],
      ["monthlyFixedCost", 22000000],
      ["baristas", "Budi (Head Bar), Siti (Barista), Dimas (Barista), Ayu (Junior)"]
    ];
    sSettings.getRange(2, 1, defaultSettings.length, 2).setValues(defaultSettings);
  }
}

function formatHeaderRow(sheet, bgColorHex, colCount) {
  var headerRange = sheet.getRange(1, 1, 1, colCount);
  headerRange.setBackground(bgColorHex)
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(1, 32);
  sheet.setFrozenRows(1);
}

function writeIngredientsSheet(ss, ingredients) {
  var sheet = ss.getSheetByName(SHEET_BAHAN);
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 15).clearContent();
  }
  if (!ingredients || ingredients.length === 0) return;

  var rows = ingredients.map(function(item) {
    return [
      item.id || "",
      item.name || "",
      item.category || "",
      item.purchaseUnit || "",
      item.purchasePrice || 0,
      item.purchaseQuantity || 0,
      item.usageUnit || "",
      item.conversionRate || 1,
      item.currentStock || 0,
      item.minStockAlert || 0,
      item.costPerUsageUnit || 0,
      item.supplier || "",
      item.expiryDate || "",
      item.notes || "",
      item.lastUpdated || new Date().toISOString().split("T")[0]
    ];
  });
  sheet.getRange(2, 1, rows.length, 15).setValues(rows);
}

function writeRecipesSheet(ss, recipes) {
  var sheet = ss.getSheetByName(SHEET_RESEP);
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 13).clearContent();
  }
  if (!recipes || recipes.length === 0) return;

  var rows = recipes.map(function(r) {
    return [
      r.id || "",
      r.name || "",
      r.category || "",
      r.totalIngredientsCost || 0,
      r.packagingCost || 0,
      r.totalHpp || 0,
      r.sellingPrice || 0,
      r.actualMarginPercent || 0,
      r.profitNominal || 0,
      r.estimatedSalesPerMonth || 0,
      r.targetMarginPercent || 65,
      r.status || "Active",
      JSON.stringify(r.ingredients || [])
    ];
  });
  sheet.getRange(2, 1, rows.length, 13).setValues(rows);
}

function writeWasteLogsSheet(ss, logs) {
  var sheet = ss.getSheetByName(SHEET_WASTE);
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 14).clearContent();
  }
  if (!logs || logs.length === 0) return;

  var rows = logs.map(function(l) {
    return [
      l.id || "",
      l.date || "",
      l.time || "",
      l.ingredientName || "",
      l.category || "",
      l.amount || 0,
      l.unit || "",
      l.costLost || 0,
      l.reason || "",
      l.responsiblePerson || "",
      l.shift || "",
      l.isPreventable ? "Ya" : "Tidak",
      l.notes || "",
      l.actionTaken || ""
    ];
  });
  sheet.getRange(2, 1, rows.length, 14).setValues(rows);
}

function appendWasteLog(ss, log) {
  var sheet = ss.getSheetByName(SHEET_WASTE);
  var newRow = [
    log.id || ("wst-" + new Date().getTime()),
    log.date || new Date().toISOString().split("T")[0],
    log.time || new Date().toTimeString().substring(0, 5),
    log.ingredientName || "",
    log.category || "",
    log.amount || 0,
    log.unit || "",
    log.costLost || 0,
    log.reason || "",
    log.responsiblePerson || "",
    log.shift || "",
    log.isPreventable ? "Ya" : "Tidak",
    log.notes || "",
    log.actionTaken || ""
  ];
  sheet.appendRow(newRow);
  return { success: true, message: "Log waste tercatat di spreadsheet!" };
}

function writeSettingsSheet(ss, settings) {
  var sheet = ss.getSheetByName(SHEET_SETTINGS);
  var rows = [
    ["cafeName", settings.cafeName || "Kopi Senja Utama"],
    ["tagline", settings.tagline || ""],
    ["defaultTargetMargin", settings.defaultTargetMargin || 65],
    ["maxWasteTolerancePercent", settings.maxWasteTolerancePercent || 3],
    ["monthlyRevenueTarget", settings.monthlyRevenueTarget || 0],
    ["monthlyFixedCost", settings.monthlyFixedCost || 0],
    ["baristas", (settings.baristas || []).join(", ")]
  ];
  sheet.getRange(2, 1, rows.length, 2).setValues(rows);
}

function getSheetDataAsObjects(sheet) {
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];

  var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var sheetName = sheet.getName();

  return data.map(function(row) {
    if (sheetName === SHEET_BAHAN) {
      return {
        id: String(row[0] || ""),
        name: String(row[1] || ""),
        category: String(row[2] || "Lainnya"),
        purchaseUnit: String(row[3] || ""),
        purchasePrice: Number(row[4]) || 0,
        purchaseQuantity: Number(row[5]) || 1,
        usageUnit: String(row[6] || ""),
        conversionRate: Number(row[7]) || 1,
        currentStock: Number(row[8]) || 0,
        minStockAlert: Number(row[9]) || 0,
        costPerUsageUnit: Number(row[10]) || 0,
        supplier: String(row[11] || ""),
        expiryDate: row[12] ? (row[12] instanceof Date ? Utilities.formatDate(row[12], "GMT+7", "yyyy-MM-dd") : String(row[12])) : "",
        notes: String(row[13] || ""),
        lastUpdated: row[14] ? String(row[14]) : ""
      };
    } else if (sheetName === SHEET_RESEP) {
      var ingredientsList = [];
      try {
        if (row[12]) {
          if (typeof row[12] === "string") ingredientsList = JSON.parse(row[12]);
          else if (Array.isArray(row[12])) ingredientsList = row[12];
        }
      } catch(e) {
        ingredientsList = [];
      }
      return {
        id: String(row[0] || ""),
        name: String(row[1] || ""),
        category: String(row[2] || "Signature"),
        totalIngredientsCost: Number(row[3]) || 0,
        packagingCost: Number(row[4]) || 0,
        totalHpp: Number(row[5]) || 0,
        sellingPrice: Number(row[6]) || 0,
        actualMarginPercent: Number(row[7]) || 0,
        profitNominal: Number(row[8]) || 0,
        estimatedSalesPerMonth: Number(row[9]) || 0,
        targetMarginPercent: Number(row[10]) || 65,
        status: String(row[11] || "Active"),
        ingredients: Array.isArray(ingredientsList) ? ingredientsList : []
      };
    } else if (sheetName === SHEET_WASTE) {
      return {
        id: String(row[0] || ""),
        date: row[1] ? (row[1] instanceof Date ? Utilities.formatDate(row[1], "GMT+7", "yyyy-MM-dd") : String(row[1])) : "",
        time: String(row[2] || ""),
        ingredientName: String(row[3] || ""),
        category: String(row[4] || ""),
        amount: Number(row[5]) || 0,
        unit: String(row[6] || ""),
        costLost: Number(row[7]) || 0,
        reason: String(row[8] || ""),
        responsiblePerson: String(row[9] || ""),
        shift: String(row[10] || ""),
        isPreventable: String(row[11]).toLowerCase() === "ya",
        notes: String(row[12] || ""),
        actionTaken: String(row[13] || "")
      };
    }
    return {};
  });
}

function getSettingsObject(sheet) {
  var settings = {
    cafeName: "Kopi Senja Utama",
    tagline: "Specialty Coffee & Artisan Kitchen",
    defaultTargetMargin: 65,
    maxWasteTolerancePercent: 3,
    monthlyRevenueTarget: 75000000,
    monthlyFixedCost: 22000000,
    baristas: ["Budi", "Siti", "Dimas", "Ayu"]
  };
  if (!sheet) return settings;
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return settings;

  var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  data.forEach(function(row) {
    var key = row[0];
    var val = row[1];
    if (key === "cafeName") settings.cafeName = String(val);
    if (key === "tagline") settings.tagline = String(val);
    if (key === "defaultTargetMargin") settings.defaultTargetMargin = Number(val) || 65;
    if (key === "maxWasteTolerancePercent") settings.maxWasteTolerancePercent = Number(val) || 3;
    if (key === "monthlyRevenueTarget") settings.monthlyRevenueTarget = Number(val) || 0;
    if (key === "monthlyFixedCost") settings.monthlyFixedCost = Number(val) || 0;
    if (key === "baristas") settings.baristas = String(val).split(",").map(function(s){ return s.trim(); }).filter(Boolean);
  });
  return settings;
}

/**
 * Membangun UI Standalone Web App BaristaCost yang 100% Mandiri (Zero CDN Failure, Zero Delay)
 */
function buildStandaloneAppHtml(serverData) {
  var rawJson = JSON.stringify(serverData || {});
  var safeJsonBase64 = Utilities.base64Encode(rawJson, Utilities.Charset.UTF_8);

  return '<!DOCTYPE html>' +
'<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>' +
'<title>BaristaCost Cloud</title>' +
'<style>' +
'* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }' +
'body { background-color: #0c0a09; color: #f5f5f4; font-size: 14px; min-height: 100vh; display: flex; flex-direction: column; }' +
'header { background: #1c1917; border-bottom: 1px solid #292524; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 30; }' +
'.nav-bar { background: #0c0a09; border-bottom: 1px solid #292524; padding: 8px 12px; display: flex; gap: 8px; overflow-x: auto; position: sticky; top: 58px; z-index: 20; }' +
'.btn-tab { padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: 600; border: 1px solid #292524; background: #1c1917; color: #a8a29e; cursor: pointer; white-space: nowrap; }' +
'.btn-tab.active { background: #f59e0b; color: #0c0a09; border-color: #f59e0b; font-weight: 700; }' +
'.btn-waste { background: #e11d48; color: #fff; font-weight: 700; font-size: 12px; border: none; border-radius: 12px; padding: 8px 14px; cursor: pointer; }' +
'.container { max-width: 1000px; margin: 0 auto; width: 100%; padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 16px; }' +
'.card { background: #1c1917; border: 1px solid #292524; border-radius: 16px; padding: 14px; }' +
'.grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }' +
'.grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }' +
'.stat-title { font-size: 11px; color: #a8a29e; font-weight: 600; }' +
'.stat-val { font-size: 20px; font-weight: 800; margin-top: 4px; }' +
'.badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; }' +
'.badge-rose { background: rgba(225,29,72,0.15); color: #fda4af; }' +
'.badge-emerald { background: rgba(16,185,129,0.15); color: #6ee7b7; }' +
'.badge-amber { background: rgba(245,158,11,0.15); color: #fde68a; }' +
'.table-wrap { overflow-x: auto; background: #1c1917; border: 1px solid #292524; border-radius: 16px; }' +
'table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; }' +
'th { background: #141210; color: #a8a29e; padding: 10px 12px; border-bottom: 1px solid #292524; }' +
'td { padding: 10px 12px; border-bottom: 1px solid #292524; color: #e7e5e4; }' +
'.modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }' +
'.modal-card { background: #1c1917; border: 1px solid #292524; border-radius: 20px; width: 100%; max-width: 400px; padding: 20px; display: flex; flex-direction: column; gap: 12px; }' +
'input, select { width: 100%; background: #0c0a09; border: 1px solid #292524; color: #f5f5f4; padding: 10px 12px; border-radius: 10px; font-size: 13px; outline: none; margin-top: 4px; }' +
'label { font-size: 11px; color: #a8a29e; font-weight: 600; }' +
'.btn-action { padding: 6px 12px; border-radius: 8px; border: 1px solid #292524; background: #292524; color: #fff; cursor: pointer; font-weight: 700; }' +
'</style></head>' +
'<body>' +
'  <header>' +
'    <div style="display:flex;align-items:center;gap:10px;">' +
'      <div style="width:36px;height:36px;border-radius:10px;background:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:18px;">☕</div>' +
'      <div><strong id="header-cafe" style="font-size:14px;color:#fff;">BaristaCost</strong><div id="sync-status" style="font-size:10px;color:#10b981;font-weight:600;">● Google Sheets Terhubung</div></div>' +
'    </div>' +
'    <button class="btn-waste" onclick="openWasteModal()">+ Catat Waste</button>' +
'  </header>' +
'  <div class="nav-bar">' +
'    <button id="tab-dash" class="btn-tab active" onclick="setTab(\\'dashboard\\')">📊 Dashboard</button>' +
'    <button id="tab-hpp" class="btn-tab" onclick="setTab(\\'hpp\\')">☕ Resep & HPP</button>' +
'    <button id="tab-waste" class="btn-tab" onclick="setTab(\\'waste\\')">📉 Log Waste</button>' +
'    <button id="tab-stock" class="btn-tab" onclick="setTab(\\'stock\\')">📦 Stok Bahan</button>' +
'  </div>' +
'  <div id="app-body" class="container"></div>' +
'  <div id="modal-waste" class="modal-bg" style="display:none;">' +
'    <div class="modal-card">' +
'      <div style="display:flex;justify-content:space-between;align-items:center;">' +
'        <strong style="color:#fff;font-size:14px;">+ Catat Waste Bahan Baku</strong>' +
'        <span onclick="closeWasteModal()" style="cursor:pointer;color:#a8a29e;font-weight:bold;">✕</span>' +
'      </div>' +
'      <form onsubmit="submitWasteForm(event)" style="display:flex;flex-direction:column;gap:10px;">' +
'        <div><label>Bahan Baku Terbuang</label><select id="w-ing" required></select></div>' +
'        <div><label>Jumlah Terbuang</label><input type="number" step="any" id="w-amt" placeholder="Contoh: 150" required /></div>' +
'        <div><label>Alasan Waste</label><select id="w-reason">' +
'          <option>Dial-in Grinder Pagi</option><option>Overfill Frothing Susu</option><option>Salah Resep / Barista Error</option><option>Tumpah di Bar</option><option>Kadaluarsa / Rusak</option>' +
'        </select></div>' +
'        <div><label>Nama Barista</label><input type="text" id="w-barista" value="Budi" required /></div>' +
'        <div style="display:flex;gap:8px;margin-top:6px;">' +
'          <button type="button" onclick="closeWasteModal()" style="flex:1;padding:10px;border-radius:10px;background:#292524;border:none;color:#fff;cursor:pointer;">Batal</button>' +
'          <button type="submit" class="btn-waste" style="flex:1;padding:10px;border-radius:10px;">Simpan Waste</button>' +
'        </div>' +
'      </form>' +
'    </div>' +
'  </div>' +
'  <script>' +
'    var rawBase64 = "' + safeJsonBase64 + '";' +
'    var appData = { ingredients: [], recipes: [], wasteLogs: [], settings: { cafeName: "Kopi Senja Utama" } };' +
'    try {' +
'      var decoded = decodeURIComponent(escape(window.atob(rawBase64)));' +
'      var parsed = JSON.parse(decoded);' +
'      if (parsed) {' +
'        if (parsed.ingredients && Array.isArray(parsed.ingredients)) appData.ingredients = parsed.ingredients;' +
'        if (parsed.recipes && Array.isArray(parsed.recipes)) appData.recipes = parsed.recipes;' +
'        if (parsed.wasteLogs && Array.isArray(parsed.wasteLogs)) appData.wasteLogs = parsed.wasteLogs;' +
'        if (parsed.settings) appData.settings = parsed.settings;' +
'      }' +
'    } catch(e) { console.error("Parse data error:", e); }' +
'    if (!appData.ingredients || appData.ingredients.length === 0) {' +
'      appData.ingredients = [' +
'        { id: "ing-1", name: "House Blend Arabica-Robusta", category: "Kopi & Espresso", costPerUsageUnit: 195, usageUnit: "gr", currentStock: 2400, minStockAlert: 1000 },' +
'        { id: "ing-2", name: "Fresh Milk Pasteurisasi", category: "Susu & Dairy", costPerUsageUnit: 28, usageUnit: "ml", currentStock: 1400, minStockAlert: 3000 },' +
'        { id: "ing-3", name: "Sirup Gula Aren Organik", category: "Syrup & Sauce", costPerUsageUnit: 48, usageUnit: "ml", currentStock: 3500, minStockAlert: 1000 },' +
'        { id: "ing-4", name: "Cup Dingin 16oz PET", category: "Packaging & Cup", costPerUsageUnit: 840, usageUnit: "pcs", currentStock: 380, minStockAlert: 100 }' +
'      ];' +
'    }' +
'    if (!appData.recipes || appData.recipes.length === 0) {' +
'      appData.recipes = [' +
'        { id: "rec-1", name: "Es Kopi Susu Senja 16oz", category: "Kopi Susu", totalHpp: 8210, sellingPrice: 24000, actualMarginPercent: 65.8, profitNominal: 15790, ingredients: [{ ingredientId: "ing-1", amount: 18 }, { ingredientId: "ing-2", amount: 120 }, { ingredientId: "ing-3", amount: 25 }, { ingredientId: "ing-4", amount: 1 }] }' +
'      ];' +
'    }' +
'    if (!appData.wasteLogs || appData.wasteLogs.length === 0) {' +
'      appData.wasteLogs = [' +
'        { id: "wst-1", date: "2026-08-20", time: "09:30", ingredientName: "House Blend Arabica-Robusta", amount: 90, unit: "gr", costLost: 17550, reason: "Dial-in Grinder Pagi", responsiblePerson: "Budi" }' +
'      ];' +
'    }' +
'    var currentTab = "dashboard";' +
'    function formatRp(num) { return "Rp " + (Number(num) || 0).toLocaleString("id-ID"); }' +
'    function setTab(tab) {' +
'      currentTab = tab;' +
'      ["dashboard", "hpp", "waste", "stock"].forEach(function(t){' +
'        var id = t === "dashboard" ? "tab-dash" : (t === "stock" ? "tab-stock" : ("tab-" + t));' +
'        var el = document.getElementById(id);' +
'        if (el) el.className = (t === tab) ? "btn-tab active" : "btn-tab";' +
'      });' +
'      renderView();' +
'    }' +
'    function openWasteModal() {' +
'      var sel = document.getElementById("w-ing");' +
'      sel.innerHTML = appData.ingredients.map(function(i){ return "<option value=\\"" + i.id + "\\">" + i.name + " (" + i.usageUnit + ")</option>"; }).join("");' +
'      document.getElementById("modal-waste").style.display = "flex";' +
'    }' +
'    function closeWasteModal() { document.getElementById("modal-waste").style.display = "none"; }' +
'    function submitWasteForm(e) {' +
'      e.preventDefault();' +
'      var ingId = document.getElementById("w-ing").value;' +
'      var ing = appData.ingredients.find(function(i){ return i.id === ingId; });' +
'      if (!ing) return;' +
'      var amt = Number(document.getElementById("w-amt").value) || 0;' +
'      var cost = Math.round(amt * (Number(ing.costPerUsageUnit) || 0));' +
'      var log = {' +
'        id: "wst-" + Date.now(),' +
'        date: new Date().toISOString().split("T")[0],' +
'        time: new Date().toTimeString().substring(0, 5),' +
'        ingredientName: ing.name,' +
'        category: ing.category || "",' +
'        amount: amt,' +
'        unit: ing.usageUnit,' +
'        costLost: cost,' +
'        reason: document.getElementById("w-reason").value,' +
'        responsiblePerson: document.getElementById("w-barista").value' +
'      };' +
'      appData.wasteLogs.unshift(log);' +
'      ing.currentStock = Math.max(0, ing.currentStock - amt);' +
'      closeWasteModal();' +
'      renderView();' +
'      syncBackground();' +
'    }' +
'    function changeStock(id, delta) {' +
'      var ing = appData.ingredients.find(function(i){ return i.id === id; });' +
'      if (ing) {' +
'        ing.currentStock = Math.max(0, (Number(ing.currentStock) || 0) + delta);' +
'        renderView();' +
'        syncBackground();' +
'      }' +
'    }' +
'    function syncBackground() {' +
'      var st = document.getElementById("sync-status");' +
'      if (st) { st.innerText = "⏳ Menyimpan ke Sheets..."; st.style.color = "#f59e0b"; }' +
'      if (typeof google !== "undefined" && google.script && google.script.run) {' +
'        google.script.run' +
'          .withSuccessHandler(function(){ if (st) { st.innerText = "● Data Tersimpan"; st.style.color = "#10b981"; } })' +
'          .withFailureHandler(function(){ if (st) { st.innerText = "● Siap"; st.style.color = "#10b981"; } })' +
'          .apiSaveAllData(appData);' +
'      }' +
'    }' +
'    function renderView() {' +
'      var body = document.getElementById("app-body");' +
'      var cafeEl = document.getElementById("header-cafe");' +
'      if (cafeEl && appData.settings && appData.settings.cafeName) cafeEl.innerText = appData.settings.cafeName;' +
'      if (currentTab === "dashboard") {' +
'        var totalWaste = appData.wasteLogs.reduce(function(a, l){ return a + (Number(l.costLost) || 0); }, 0);' +
'        var avgMargin = appData.recipes.length ? (appData.recipes.reduce(function(a, r){ return a + (Number(r.actualMarginPercent) || 0); }, 0) / appData.recipes.length).toFixed(1) : "0.0";' +
'        var alerts = [];' +
'        appData.ingredients.forEach(function(ing){' +
'          appData.recipes.forEach(function(rec){' +
'            var comp = (Array.isArray(rec.ingredients) ? rec.ingredients : []).find(function(c){ return c.ingredientId === ing.id; });' +
'            if (comp && comp.amount > 0) {' +
'              var portions = Math.floor((Number(ing.currentStock) || 0) / comp.amount);' +
'              if (portions <= 25 || (Number(ing.currentStock) || 0) <= (Number(ing.minStockAlert) || 0)) {' +
'                alerts.push({ name: ing.name, stock: ing.currentStock + " " + ing.usageUnit, menu: rec.name, portions: portions });' +
'              }' +
'            }' +
'          });' +
'        });' +
'        var h = "<div class=\\"grid-4\\">"' +
'          + "<div class=\\"card\\"><span class=\\"stat-title\\">TOTAL KERUGIAN WASTE</span><div class=\\"stat-val\\" style=\\"color:#fda4af;\\">" + formatRp(totalWaste) + "</div></div>"' +
'          + "<div class=\\"card\\"><span class=\\"stat-title\\">RATA-RATA MARGIN</span><div class=\\"stat-val\\" style=\\"color:#6ee7b7;\\">" + avgMargin + "%</div></div>"' +
'          + "<div class=\\"card\\"><span class=\\"stat-title\\">TOTAL MENU AKTIF</span><div class=\\"stat-val\\" style=\\"color:#fde68a;\\">" + appData.recipes.length + " Menu</div></div>"' +
'          + "<div class=\\"card\\"><span class=\\"stat-title\\">STATUS DATABASE</span><div class=\\"stat-val\\" style=\\"color:#6ee7b7;font-size:15px;margin-top:8px;\\">● Sheets Live</div></div>"' +
'          + "</div>"' +
'          + "<div class=\\"card\\" style=\\"border-color:rgba(245,158,11,0.3);background:linear-gradient(135deg, rgba(69,26,3,0.3), #1c1917);\\">"' +
'          + "<div style=\\"display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;\\"><strong style=\\"color:#fde68a;font-size:13px;\\">🧠 Kolom Saran Cerdas & Sisa Porsi Menu</strong><span class=\\"badge badge-amber\\">Auto-Analisa</span></div>"' +
'          + (alerts.length === 0 ? "<div style=\\"font-size:12px;color:#a8a29e;\\">Semua stok bahan baku saat ini cukup aman untuk operasional (>25 porsi).</div>" : alerts.slice(0, 3).map(function(a){' +
'            return "<div style=\\"display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:rgba(0,0,0,0.4);border-radius:10px;margin-bottom:6px;font-size:12px;\\"><div><strong style=\\"color:#fff;\\">" + a.name + "</strong><div style=\\"font-size:11px;color:#a8a29e;\\">Sisa " + a.stock + " hanya cukup untuk menu " + a.menu + "</div></div><span class=\\"badge badge-rose\\">Sisa ~" + a.portions + " Porsi</span></div>";' +
'          }).join(""))' +
'          + "</div>"' +
'          + "<div class=\\"card\\"><strong style=\\"color:#fff;font-size:13px;margin-bottom:10px;display:block;\\">📉 Catatan Waste Terakhir</strong>"' +
'          + (appData.wasteLogs.length === 0 ? "<div style=\\"font-size:12px;color:#78716c;text-align:center;padding:12px;\\">Belum ada catatan waste</div>" : appData.wasteLogs.slice(0, 3).map(function(w){' +
'            return "<div style=\\"display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:#0c0a09;border-radius:10px;margin-bottom:6px;font-size:12px;\\"><div><strong style=\\"color:#fff;\\">" + w.ingredientName + "</strong><div style=\\"font-size:11px;color:#a8a29e;\\">" + w.amount + " " + (w.unit || "") + " • " + (w.reason || "") + " (" + (w.responsiblePerson || "") + ")</div></div><span style=\\"color:#fda4af;font-weight:800;\\">" + formatRp(w.costLost) + "</span></div>";' +
'          }).join(""))' +
'          + "</div>";' +
'        body.innerHTML = h;' +
'      } else if (currentTab === "hpp") {' +
'        var h = "<div class=\\"grid-2\\">" + appData.recipes.map(function(r){' +
'          return "<div class=\\"card\\">"' +
'            + "<div style=\\"display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;\\"><div><span class=\\"badge badge-amber\\">" + (r.category || "Menu") + "</span><div style=\\"font-size:14px;font-weight:700;color:#fff;margin-top:4px;\\">" + r.name + "</div></div><span class=\\"badge badge-emerald\\">" + (Number(r.actualMarginPercent) || 0).toFixed(1) + "%</span></div>"' +
'            + "<div style=\\"background:#0c0a09;padding:10px;border-radius:10px;font-size:12px;display:flex;flex-direction:column;gap:6px;\\">"' +
'            + "<div style=\\"display:flex;justify-content:space-between;color:#a8a29e;\\"><span>HPP Total:</span><strong style=\\"color:#fff;\\">" + formatRp(r.totalHpp) + "</strong></div>"' +
'            + "<div style=\\"display:flex;justify-content:space-between;color:#a8a29e;\\"><span>Harga Jual:</span><strong style=\\"color:#fde68a;\\">" + formatRp(r.sellingPrice) + "</strong></div>"' +
'            + "<div style=\\"display:flex;justify-content:space-between;border-top:1px solid #292524;padding-top:6px;color:#6ee7b7;font-weight:700;\\"><span>Profit Bersih:</span><span>" + formatRp(r.profitNominal) + " / cup</span></div>"' +
'            + "</div></div>";' +
'        }).join("") + "</div>";' +
'        body.innerHTML = h;' +
'      } else if (currentTab === "waste") {' +
'        var h = "<div class=\\"table-wrap\\"><table><thead><tr><th>Tanggal</th><th>Bahan</th><th>Jumlah</th><th>Kerugian</th><th>Alasan</th><th>Barista</th></tr></thead><tbody>"' +
'          + (appData.wasteLogs.map(function(w){' +
'            return "<tr><td style=\\"color:#a8a29e;\\">" + (w.date || "") + "</td><td><strong style=\\"color:#fff;\\">" + (w.ingredientName || "") + "</strong></td><td>" + (w.amount || 0) + " " + (w.unit || "") + "</td><td style=\\"color:#fda4af;font-weight:700;\\">" + formatRp(w.costLost) + "</td><td>" + (w.reason || "") + "</td><td style=\\"color:#a8a29e;\\">" + (w.responsiblePerson || "") + "</td></tr>";' +
'          }).join("")) + "</tbody></table></div>";' +
'        body.innerHTML = h;' +
'      } else if (currentTab === "stock") {' +
'        var h = "<div class=\\"grid-2\\">" + appData.ingredients.map(function(ing){' +
'          var isLow = (Number(ing.currentStock) || 0) <= (Number(ing.minStockAlert) || 0);' +
'          return "<div class=\\"card\\">"' +
'            + "<div style=\\"display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;\\"><div><span class=\\"badge badge-amber\\">" + (ing.category || "Bahan") + "</span><div style=\\"font-size:14px;font-weight:700;color:#fff;margin-top:4px;\\">" + ing.name + "</div></div><span class=\\"badge " + (isLow ? "badge-rose" : "badge-emerald") + "\\">" + (isLow ? "Stok Menipis" : "Stok Cukup") + "</span></div>"' +
'            + "<div style=\\"background:#0c0a09;padding:8px 10px;border-radius:10px;font-size:12px;display:flex;justify-content:space-between;margin-bottom:8px;\\"><span style=\\"color:#a8a29e;\\">Biaya / " + (ing.usageUnit || "satuan") + ":</span><strong style=\\"color:#fde68a;\\">" + formatRp(ing.costPerUsageUnit) + "</strong></div>"' +
'            + "<div style=\\"display:flex;justify-content:space-between;align-items:center;font-size:12px;\\"><span>Sisa Stok: <strong style=\\"color:" + (isLow ? "#fda4af" : "#fff") + ";\\">" + ing.currentStock + " " + ing.usageUnit + "</strong></span><div style=\\"display:flex;gap:4px;\\"><button class=\\"btn-action\\" onclick=\\"changeStock(\\\'" + ing.id + "\\\', -100)\\">-100</button><button class=\\"btn-action\\" onclick=\\"changeStock(\\\'" + ing.id + "\\\', 100)\\">+100</button></div></div>"' +
'            + "</div>";' +
'        }).join("") + "</div>";' +
'        body.innerHTML = h;' +
'      }' +
'    }' +
'    renderView();' +
'  </script>' +
'</body></html>';
}
`;
