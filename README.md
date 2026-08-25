# ☕ BaristaCost PRO — Analisa Waste & Kalkulator HPP Cafe

Aplikasi modern berbasis Web untuk operasional coffee shop, restoran, dan bisnis F&B. Dirancang untuk menghitung **Harga Pokok Penjualan (HPP)** secara presisi per gram/ml, melacak **food waste & kerugian bahan baku**, menganalisis **matriks menu engineering (BCG Matrix)**, serta mendukung **sinkronisasi cloud database gratis menggunakan Google Spreadsheet & Google Apps Script**.

---

## 🌟 Fitur Utama

### 1. 📊 Executive Dashboard
- Ringkasan indikator performa: Rata-rata margin laba resep, estimasi valuasi stok bahan baku, total nominal kerugian waste bulanan, dan jumlah menu aktif.
- **Smart Suggestions & Sisa Porsi**: Peringatan otomatis stok bahan baku menipis beserta estimasi sisa porsi saji yang bisa dibuat (contoh: *Stok Espresso Blend sisa ~18 porsi*), alert bahan mendekati kadaluarsa, dan resep dengan margin di bawah target.
- **Aksi Cepat Log Waste**: Input pencatatan sisa bahan baku atau gagal racik hanya dalam hitungan detik.

### 2. 🧮 Kalkulator HPP & Resep Menu (BOM Breakdown)
- Perhitungan HPP multi-bahan baku otomatis berdasarkan takaran baku (Bill of Materials).
- Biaya packaging & cup terpisah.
- Rekomendasi harga jual ideal berdasarkan target persentase margin kotor.
- Kartu resep standar (SOP Barista) yang dapat langsung dicetak (*Print SOP Sheet*).

### 3. 📦 Master Bahan Baku & Inventori
- Konversi otomatis harga pembelian (misal: per Kg / Liter / Pack) menjadi modal per unit pemakaian (per gr / ml / pcs).
- Pelacakan stok real-time, status kadaluarsa (*expired date*), supplier, dan batas minimal *stock alert*.

### 4. 🗑️ Pencatatan & Analisa Waste Bahan Baku
- Log pencatatan waste dengan nominal kerugian rupiah dihitung otomatis.
- Klasifikasi penyebab: *Expired / Basi, Gagal Racik / Dial-in, Tumpah / Jatuh, Overprep Susu, Suhu Chiller Rusak*, dll.
- Filter per shift (Pagi / Siang / Malam) dan identifikasi penanggung jawab barista.
- Form cetak fisik (*Physical Waste Log Sheet*) untuk ditempel di bar station.

### 5. 📈 Laporan & Menu Engineering
- **Matriks BCG Menu Engineering**: Pengelompokan menu ke dalam 4 kuadran strategis:
  - ⭐ **Stars**: Margin tinggi & penjualan laris (Pertahankan konsistensi).
  - 🐎 **Plowhorses**: Margin rendah & volume tinggi (Rekomendasi penyesuaian harga).
  - 🧩 **Puzzles**: Margin tinggi & volume rendah (Rekomendasi promo bundling).
  - 🐕 **Dogs**: Margin rendah & volume rendah (Evaluasi eliminasi menu).
- Ekspor data HPP dan Log Waste ke format **CSV** dan **JSON**.

### 6. 🔒 Keamanan Role-Based & PIN Mandiri
- Proteksi akses data finansial:
  - **Owner / Manajemen**: Akses penuh ke seluruh menu, margin laba, kalkulasi HPP, laporan finansial, dan pengaturan.
  - **Barista / Staff Bar**: Antarmuka fokus operasional bar (Log waste cepat, cek SOP takaran menu, pantau stok bahan).
- Setiap barista memiliki **PIN mandiri** yang dapat diatur di menu Pengaturan.

### 7. ☁️ Sinkronisasi Cloud Google Spreadsheet (Gratis & Tanpa Server)
- Menggunakan **Google Apps Script** sebagai backend serverless API.
- Data tersimpan aman di Google Drive/Spreadsheet milik Anda sendiri.
- Dukungan backup & restore file JSON offline.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Effects**: Canvas Confetti
- **Storage**: LocalStorage + Google Sheets API via Google Apps Script (Serverless)

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 18 ke atas)
- NPM, Yarn, pnpm, atau Bun

### Langkah-langkah

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/username/baristacost-pro.git
   cd baristacost-pro
   ```

2. **Install dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan development server:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000` (atau port yang ditentukan Vite).

4. **Build untuk Production:**
   ```bash
   npm run build
   ```
   Hasil build siap deploy akan berada di folder `dist/`.

---

## 📑 Konfigurasi Google Sheets (Database Cloud Gratis)

1. Buka [Google Sheets](https://sheets.new) dan buat Spreadsheet baru.
2. Di menu atas Spreadsheet, klik **Extensions > Apps Script** (Ekstensi > Apps Script).
3. Hapus seluruh kode default di editor, lalu salin (*paste*) kode yang tersedia di tab **Google Sheets > Kode Apps Script** dalam aplikasi (atau dari file `src/services/appsScriptTemplate.ts`).
4. Klik tombol **Deploy > New deployment**.
5. Pilih type **Web App**:
   - **Execute as**: `Me (email anda)`
   - **Who has access**: `Anyone` (Siapa saja)
6. Klik **Deploy**, lalu salin **Web App URL** yang dihasilkan.
7. Buka menu **Sinkronisasi Google Spreadsheet** di aplikasi BaristaCost, tempel Web App URL, dan klik **Simpan Konfigurasi**.
8. Klik **Kirim ke Sheet** untuk menyinkronkan seluruh database awal ke Google Sheet!

---

## 📁 Struktur Direktori

```text
├── src/
│   ├── components/
│   │   ├── auth/              # Komponen Login & PIN Security
│   │   ├── dashboard/         # Executive Dashboard & KPI Metrics
│   │   ├── googleSheets/      # Google Sheets Sync & Apps Script Guide
│   │   ├── hpp/               # Kalkulator HPP, BOM Recipe & Print Card
│   │   ├── ingredients/       # Master Bahan Baku & Stock Management
│   │   ├── layout/            # Navbar & Header Applet
│   │   ├── reports/           # Menu Engineering Matrix & Financial P&L
│   │   ├── settings/          # Pengaturan Outlet & PIN Barista
│   │   ├── smartSuggestions/  # Sistem Rekomendasi Sisa Porsi & Expiry
│   │   └── waste/             # Tracker Waste & Form Pencatatan
│   ├── data/
│   │   └── initialData.ts     # Data awal (Coffee Shop presets)
│   ├── services/
│   │   ├── appsScriptTemplate.ts # Template backend Apps Script
│   │   └── storageService.ts     # Storage manager & API integration
│   ├── types/
│   │   └── index.ts           # Definisi TypeScript Interfaces
│   ├── utils/
│   │   └── formatters.ts      # Helper Rupiah, persentase & tanggal
│   ├── App.tsx                # Komponen Root & State Management
│   ├── main.tsx               # Entry point React
│   └── index.css              # Global styling (Tailwind CSS v4)
├── .env.example               # Contoh konfigurasi environment
├── .gitignore                 # Aturan ignore file git
├── index.html                 # Entry HTML
├── package.json               # Konfigurasi dependensi & scripts
├── tsconfig.json              # Konfigurasi TypeScript
└── vite.config.ts             # Konfigurasi bundler Vite
```

---

## 🔒 Catatan Keamanan

- **Tidak ada API Key atau Password sensitif yang di-hardcode** dalam repository.
- File `.env` dan build artifacts sudah otomatis diabaikan oleh `.gitignore`.
- PIN default awal untuk demo adalah `1234` (dapat diubah kapan saja di menu Pengaturan oleh Owner).

---

## 📄 Lisensi

Distributed under the **MIT License**. Silakan gunakan dan modifikasi secara bebas untuk kebutuhan operasional bisnis Anda.
