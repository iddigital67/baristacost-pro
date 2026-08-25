export type UnitType = 'gr' | 'kg' | 'ml' | 'liter' | 'pcs' | 'pack' | 'slice' | 'can' | 'portion';

export type IngredientCategory = 'Kopi & Espresso' | 'Susu & Dairy' | 'Syrup & Sauce' | 'Powder & Teh' | 'Buah & Minuman' | 'Kitchen & Protein' | 'Bakery & Pastry' | 'Bumbu & Saus' | 'Packaging & Cup';

export type MenuCategory = 'Coffee (Hot/Iced)' | 'Non-Coffee & Milk Based' | 'Manual Brew & Tea' | 'Mocktail & Refreshment' | 'Pastry & Bakery' | 'Main Course & Meals' | 'Snacks & Finger Food';

export type WasteReason = 
  | 'Kadaluarsa / Basi'
  | 'Tumpah / Rusak di Bar'
  | 'Salah Resep / Barista Error'
  | 'Over-extraction / Dial-in Kopi'
  | 'Sisa Prep / Overprep Harian'
  | 'Kualitas Bahan Buruk / Reject Supplier'
  | 'Uji Coba Resep / QC Training'
  | 'Lainnya';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  purchaseUnit: UnitType; // e.g. 'kg' or 'pack'
  purchasePrice: number; // e.g. 150000 per 1kg
  purchaseQuantity: number; // e.g. 1 kg
  usageUnit: UnitType; // e.g. 'gr'
  conversionRate: number; // 1 purchaseUnit = how many usageUnit (e.g. 1 kg = 1000 gr -> rate = 1000)
  currentStock: number; // in usageUnit
  minStockAlert: number; // in usageUnit
  costPerUsageUnit: number; // calculated: purchasePrice / (purchaseQuantity * conversionRate)
  supplier?: string;
  expiryDate?: string;
  notes?: string;
  lastUpdated: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  amount: number; // in ingredient's usageUnit
  unit: UnitType;
  cost: number; // calculated: amount * ingredient.costPerUsageUnit
  isPackaging?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  ingredients: RecipeIngredient[];
  totalIngredientsCost: number;
  packagingCost: number;
  totalHpp: number; // Total cost per portion
  sellingPrice: number; // Actual selling price in cafe
  recommendedSellingPrice: number; // Suggested based on target margin
  targetMarginPercent: number; // e.g., 65%
  actualMarginPercent: number; // ((sellingPrice - totalHpp) / sellingPrice) * 100
  profitNominal: number; // sellingPrice - totalHpp
  estimatedSalesPerMonth: number;
  isPopular?: boolean;
  status: 'Active' | 'Draft' | 'Archived';
  preparationTimeMinutes?: number;
  servingSize?: string;
  lastUpdated: string;
}

export interface WasteLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  ingredientId: string;
  ingredientName: string;
  category: IngredientCategory;
  amount: number; // in usageUnit
  unit: UnitType;
  costLost: number; // amount * costPerUsageUnit
  reason: WasteReason;
  responsiblePerson: string; // Barista / Chef / Staff name
  shift: 'Shift Pagi (Opening)' | 'Shift Siang (Peak)' | 'Shift Malam (Closing)';
  notes?: string;
  isPreventable: boolean;
  actionTaken?: string;
}

export type UserRole = 'owner' | 'barista';

export interface UserSession {
  isLoggedIn: boolean;
  role: UserRole;
  currentBaristaName: string;
  shift?: string;
  lastLogin?: string;
}

export interface GoogleSheetsConfig {
  sheetUrl: string;
  webAppUrl: string; // Apps script deployed URL
  autoSync: boolean;
  lastSyncTime?: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  errorMessage?: string;
}

export interface CafeSettings {
  cafeName: string;
  tagline: string;
  currency: string;
  defaultTargetMargin: number; // e.g. 65%
  maxWasteTolerancePercent: number; // e.g. 2.5% of total HPP
  monthlyRevenueTarget: number;
  monthlyFixedCost: number; // Sewa + Listrik + Gaji
  baristas: string[];
  ownerPin: string; // Default '1234'
  baristaPins?: Record<string, string>; // Map baristaName -> PIN
}
