import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { HppCalculator } from './components/hpp/HppCalculator';
import { WasteTracker } from './components/waste/WasteTracker';
import { IngredientList } from './components/ingredients/IngredientList';
import { GoogleSheetsSync } from './components/googleSheets/GoogleSheetsSync';
import { ReportsView } from './components/reports/ReportsView';
import { QuickWasteModal } from './components/waste/QuickWasteModal';
import { RecipeModal } from './components/hpp/RecipeModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { OwnerPinModal } from './components/auth/OwnerPinModal';
import { ChangePinModal } from './components/auth/ChangePinModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { storageService } from './services/storageService';
import { Ingredient, Recipe, WasteLog, CafeSettings, GoogleSheetsConfig, UserRole, UserSession } from './types';
import confetti from 'canvas-confetti';
import { ShieldAlert, Lock } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => storageService.getIngredients());
  const [recipes, setRecipes] = useState<Recipe[]>(() => storageService.getRecipes());
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>(() => storageService.getWasteLogs());
  const [settings, setSettings] = useState<CafeSettings>(() => storageService.getSettings());
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(() => storageService.getSheetsConfig());

  // User Role & Session
  const [userSession, setUserSession] = useState<UserSession>(() => storageService.getUserSession());
  const userRole = userSession.role;
  const currentBaristaName = userSession.currentBaristaName || settings.baristas[0] || 'Barista';

  // Modals state
  const [isQuickWasteOpen, setIsQuickWasteOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOwnerPinModalOpen, setIsOwnerPinModalOpen] = useState(false);
  const [pendingOwnerAction, setPendingOwnerAction] = useState<(() => void) | null>(null);

  // Change PIN modal state
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);
  const [changePinData, setChangePinData] = useState<{
    role: UserRole;
    userName: string;
    currentPin: string;
  }>({
    role: 'barista',
    userName: '',
    currentPin: '1234'
  });

  // Save changes to localStorage
  useEffect(() => {
    storageService.saveIngredients(ingredients);
  }, [ingredients]);

  useEffect(() => {
    storageService.saveRecipes(recipes);
  }, [recipes]);

  useEffect(() => {
    storageService.saveWasteLogs(wasteLogs);
  }, [wasteLogs]);

  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    storageService.saveSheetsConfig(sheetsConfig);
  }, [sheetsConfig]);

  useEffect(() => {
    storageService.saveUserSession(userSession);
  }, [userSession]);

  // Login Handlers
  const handleLoginOwner = useCallback(() => {
    const session: UserSession = {
      isLoggedIn: true,
      role: 'owner',
      currentBaristaName: userSession.currentBaristaName || settings.baristas[0] || 'Rian (Head Barista)',
      lastLogin: new Date().toISOString(),
    };
    setUserSession(session);
    storageService.saveUserSession(session);
    setActiveTab('dashboard');
  }, [userSession.currentBaristaName, settings.baristas]);

  const handleLoginBarista = useCallback((baristaName: string, shift: string) => {
    const session: UserSession = {
      isLoggedIn: true,
      role: 'barista',
      currentBaristaName: baristaName,
      shift: shift,
      lastLogin: new Date().toISOString(),
    };
    setUserSession(session);
    storageService.saveUserSession(session);
    setActiveTab('dashboard');
  }, []);

  const handleLogout = useCallback(() => {
    const loggedOutSession: UserSession = {
      ...userSession,
      isLoggedIn: false,
    };
    setUserSession(loggedOutSession);
    storageService.clearUserSession();
  }, [userSession]);

  // Handle Role Switching while in app
  const handleSelectRole = useCallback((newRole: UserRole, baristaName?: string) => {
    if (newRole === 'barista') {
      const updatedSession: UserSession = {
        isLoggedIn: true,
        role: 'barista',
        currentBaristaName: baristaName || userSession.currentBaristaName || settings.baristas[0] || 'Barista Shift',
        shift: userSession.shift || 'Shift Pagi (Opening)',
        lastLogin: new Date().toISOString(),
      };
      setUserSession(updatedSession);
      // If currently on owner-only tabs, redirect to dashboard
      if (activeTab === 'reports' || activeTab === 'sheets') {
        setActiveTab('dashboard');
      }
    } else {
      // Trying to switch to Owner: prompt for PIN
      setPendingOwnerAction(null);
      setIsOwnerPinModalOpen(true);
    }
  }, [activeTab, userSession.currentBaristaName, userSession.shift, settings.baristas]);

  const handleOpenOwnerAuth = useCallback((onSuccess?: () => void) => {
    if (userRole === 'owner') {
      onSuccess?.();
      return;
    }
    setPendingOwnerAction(() => onSuccess || null);
    setIsOwnerPinModalOpen(true);
  }, [userRole]);

  const handleOwnerPinSuccess = useCallback(() => {
    const updatedSession: UserSession = {
      isLoggedIn: true,
      role: 'owner',
      currentBaristaName: userSession.currentBaristaName,
      shift: userSession.shift,
      lastLogin: new Date().toISOString(),
    };
    setUserSession(updatedSession);
    setIsOwnerPinModalOpen(false);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 }
    });

    if (pendingOwnerAction) {
      pendingOwnerAction();
      setPendingOwnerAction(null);
    }
  }, [pendingOwnerAction, userSession.currentBaristaName, userSession.shift]);

  // Open Change PIN Modal for a specific user
  const handleOpenChangePinForUser = useCallback((role?: UserRole, targetName?: string, pin?: string) => {
    const effectiveRole = role || userRole;
    const effectiveName = targetName || (effectiveRole === 'owner' ? 'Owner / Management' : currentBaristaName);
    let effectivePin = pin;
    if (!effectivePin) {
      if (effectiveRole === 'owner') {
        effectivePin = settings.ownerPin || '1234';
      } else {
        effectivePin = settings.baristaPins?.[effectiveName] || '1234';
      }
    }

    setChangePinData({
      role: effectiveRole,
      userName: effectiveName,
      currentPin: effectivePin
    });
    setIsChangePinModalOpen(true);
  }, [userRole, currentBaristaName, settings.ownerPin, settings.baristaPins]);

  // Save New PIN Handler
  const handleSaveNewPin = useCallback((newPin: string, role: UserRole, targetUserName?: string) => {
    setSettings(prev => {
      if (role === 'owner') {
        return {
          ...prev,
          ownerPin: newPin
        };
      } else {
        const baristaName = targetUserName || currentBaristaName;
        return {
          ...prev,
          baristaPins: {
            ...(prev.baristaPins || {}),
            [baristaName]: newPin
          }
        };
      }
    });
  }, [currentBaristaName]);

  // Handler: Add / Update Ingredient
  const handleSaveIngredient = useCallback((ing: Ingredient) => {
    setIngredients(prev => {
      const exists = prev.some(item => item.id === ing.id);
      if (exists) {
        return prev.map(item => item.id === ing.id ? ing : item);
      }
      return [ing, ...prev];
    });

    // Also update any recipes using this ingredient
    setRecipes(prevRecipes => {
      return prevRecipes.map(recipe => {
        let updated = false;
        const newIngredients = recipe.ingredients.map(rIng => {
          if (rIng.ingredientId === ing.id) {
            updated = true;
            return {
              ...rIng,
              ingredientName: ing.name,
              costPerUsageUnit: ing.costPerUsageUnit,
              subtotalCost: rIng.amount * ing.costPerUsageUnit,
            };
          }
          return rIng;
        });

        if (updated) {
          const totalCost = newIngredients.reduce((sum, i) => sum + i.subtotalCost, 0) + (recipe.packagingCost || 0);
          const suggestedPrice = recipe.targetMarginPercent < 100 
            ? totalCost / (1 - (recipe.targetMarginPercent / 100))
            : totalCost;
          const actualMarginPercent = recipe.sellingPrice > 0 
            ? ((recipe.sellingPrice - totalCost) / recipe.sellingPrice) * 100
            : 0;

          return {
            ...recipe,
            ingredients: newIngredients,
            totalCost,
            suggestedPrice,
            actualMarginPercent,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return recipe;
      });
    });
  }, []);

  // Handler: Delete Ingredient
  const handleDeleteIngredient = useCallback((ingredientId: string) => {
    if (confirm('Yakin ingin menghapus bahan baku ini? Resep yang memakai bahan ini tidak akan terhapus namun biayanya perlu diperiksa.')) {
      setIngredients(prev => prev.filter(i => i.id !== ingredientId));
    }
  }, []);

  // Handler: Add / Update Recipe
  const handleSaveRecipe = useCallback((recipe: Recipe) => {
    setRecipes(prev => {
      const exists = prev.some(r => r.id === recipe.id);
      if (exists) {
        return prev.map(r => r.id === recipe.id ? recipe : r);
      }
      return [recipe, ...prev];
    });
  }, []);

  // Handler: Delete Recipe
  const handleDeleteRecipe = useCallback((recipeId: string) => {
    if (confirm('Yakin ingin menghapus resep menu ini?')) {
      setRecipes(prev => prev.filter(r => r.id !== recipeId));
    }
  }, []);

  // Handler: Add Waste Log
  const handleAddWasteLog = useCallback((waste: WasteLog) => {
    setWasteLogs(prev => [waste, ...prev]);

    // Automatically deduct inventory stock
    setIngredients(prevIngredients => {
      return prevIngredients.map(ing => {
        if (ing.id === waste.ingredientId) {
          const newStock = Math.max(0, ing.currentStock - waste.amount);
          return {
            ...ing,
            currentStock: newStock
          };
        }
        return ing;
      });
    });

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.9 }
    });
  }, []);

  // Handler: Delete Waste Log
  const handleDeleteWasteLog = useCallback((wasteId: string) => {
    if (confirm('Hapus pencatatan waste ini?')) {
      setWasteLogs(prev => prev.filter(w => w.id !== wasteId));
    }
  }, []);

  // Handler: Data Imported from Sheets
  const handleDataImported = useCallback((imported: {
    ingredients?: Ingredient[];
    recipes?: Recipe[];
    wasteLogs?: WasteLog[];
    settings?: CafeSettings;
  }) => {
    if (imported.ingredients) setIngredients(imported.ingredients);
    if (imported.recipes) setRecipes(imported.recipes);
    if (imported.wasteLogs) setWasteLogs(imported.wasteLogs);
    if (imported.settings) setSettings(imported.settings);

    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 }
    });
  }, []);

  // Handler: Reset Default Data
  const handleResetData = useCallback(() => {
    if (confirm('PERINGATAN: Semua data akan direset ke setelan awal default demo. Lanjutkan?')) {
      storageService.resetToDefaults();
      setIngredients(storageService.getIngredients());
      setRecipes(storageService.getRecipes());
      setWasteLogs(storageService.getWasteLogs());
      setSettings(storageService.getSettings());
      setSheetsConfig(storageService.getSheetsConfig());
      setUserSession(storageService.getUserSession());
      alert('Data berhasil direset ke demo default.');
    }
  }, []);

  // Compute live badge counts
  const todayStr = new Date().toISOString().split('T')[0];
  const wasteCountToday = wasteLogs.filter(w => w.date === todayStr).length;
  const lowStockCount = ingredients.filter(i => i.currentStock <= i.minStockAlert).length;
  const todayWasteCost = wasteLogs.filter(w => w.date === todayStr).reduce((s, w) => s + (w.costLost || 0), 0);

  // If user is not logged in, show the Login Screen
  if (!userSession.isLoggedIn) {
    return (
      <>
        <LoginScreen
          settings={settings}
          recipesCount={recipes.length}
          ingredientsCount={ingredients.length}
          onLoginOwner={handleLoginOwner}
          onLoginBarista={handleLoginBarista}
          onOpenChangePinModal={handleOpenChangePinForUser}
        />

        <ChangePinModal
          isOpen={isChangePinModalOpen}
          onClose={() => setIsChangePinModalOpen(false)}
          userRole={changePinData.role}
          userName={changePinData.userName}
          currentPin={changePinData.currentPin}
          onSaveNewPin={handleSaveNewPin}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950 antialiased">
      
      {/* Top Navbar */}
      <Navbar
        cafeName={settings.cafeName}
        sheetsConfig={sheetsConfig}
        userRole={userRole}
        currentBaristaName={currentBaristaName}
        baristas={settings.baristas}
        onChangeBarista={(name) => setUserSession(prev => ({ ...prev, currentBaristaName: name }))}
        onOpenOwnerAuth={() => handleOpenOwnerAuth()}
        onSwitchToBarista={() => handleSelectRole('barista')}
        onOpenQuickWaste={() => setIsQuickWasteOpen(true)}
        onOpenSheetsModal={() => {
          if (userRole === 'barista') {
            handleOpenOwnerAuth(() => setActiveTab('sheets'));
          } else {
            setActiveTab('sheets');
          }
        }}
        onOpenSettings={() => {
          if (userRole === 'barista') {
            handleOpenOwnerAuth(() => setIsSettingsOpen(true));
          } else {
            setIsSettingsOpen(true);
          }
        }}
        onOpenChangePin={() => handleOpenChangePinForUser()}
        onLogout={handleLogout}
        todayWasteCost={todayWasteCost}
      />

      {/* Main Layout Container - Full Width fluid layout without restrictive side gaps */}
      <div className="flex-1 flex w-full">
        
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          wasteCountToday={wasteCountToday}
          lowStockCount={lowStockCount}
          userRole={userRole}
          currentBaristaName={currentBaristaName}
          onOpenOwnerAuth={() => handleOpenOwnerAuth()}
          onSwitchToBarista={() => handleSelectRole('barista')}
          onOpenChangePin={() => handleOpenChangePinForUser()}
          onLogout={handleLogout}
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 w-full max-w-full overflow-x-hidden pb-24 lg:pb-8 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              ingredients={ingredients}
              recipes={recipes}
              wasteLogs={wasteLogs}
              settings={settings}
              sheetsConfig={sheetsConfig}
              userRole={userRole}
              currentBaristaName={currentBaristaName}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenQuickWaste={() => setIsQuickWasteOpen(true)}
              onOpenRecipeModal={() => {
                if (userRole === 'barista') {
                  handleOpenOwnerAuth(() => setIsRecipeModalOpen(true));
                } else {
                  setIsRecipeModalOpen(true);
                }
              }}
              onOpenSheetsModal={() => {
                if (userRole === 'barista') {
                  handleOpenOwnerAuth(() => setActiveTab('sheets'));
                } else {
                  setActiveTab('sheets');
                }
              }}
              onOpenOwnerAuth={() => handleOpenOwnerAuth()}
            />
          )}

          {activeTab === 'hpp' && (
            <HppCalculator
              recipes={recipes}
              ingredients={ingredients}
              onSaveRecipe={handleSaveRecipe}
              onDeleteRecipe={handleDeleteRecipe}
              defaultTargetMargin={settings.defaultTargetMargin}
              cafeName={settings.cafeName}
              userRole={userRole}
              onOpenOwnerAuth={() => handleOpenOwnerAuth()}
            />
          )}

          {activeTab === 'waste' && (
            <WasteTracker
              wasteLogs={wasteLogs}
              ingredients={ingredients}
              onAddWaste={handleAddWasteLog}
              onDeleteWaste={handleDeleteWasteLog}
              onOpenQuickWaste={() => setIsQuickWasteOpen(true)}
            />
          )}

          {activeTab === 'ingredients' && (
            <IngredientList
              ingredients={ingredients}
              recipes={recipes}
              userRole={userRole}
              onOpenOwnerAuth={() => handleOpenOwnerAuth()}
              onSaveIngredient={handleSaveIngredient}
              onDeleteIngredient={handleDeleteIngredient}
            />
          )}

          {activeTab === 'sheets' && (
            userRole === 'owner' ? (
              <GoogleSheetsSync
                sheetsConfig={sheetsConfig}
                onSaveConfig={setSheetsConfig}
                ingredients={ingredients}
                recipes={recipes}
                wasteLogs={wasteLogs}
                settings={settings}
                onDataImported={handleDataImported}
                onResetData={handleResetData}
              />
            ) : (
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto mt-8">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-stone-100">Akses Terkunci (Mode Owner)</h3>
                <p className="text-sm text-stone-400 mt-2 leading-relaxed">
                  Fitur Sinkronisasi Google Sheets dan Integrasi Database hanya dapat diakses oleh Owner / Manajemen Cafe.
                </p>
                <button
                  onClick={() => handleOpenOwnerAuth()}
                  className="mt-6 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-900/30"
                >
                  Masukkan PIN Owner
                </button>
              </div>
            )
          )}

          {activeTab === 'reports' && (
            userRole === 'owner' ? (
              <ReportsView
                recipes={recipes}
                ingredients={ingredients}
                wasteLogs={wasteLogs}
                settings={settings}
              />
            ) : (
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto mt-8">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-stone-100">Laporan Finansial Terkunci</h3>
                <p className="text-sm text-stone-400 mt-2 leading-relaxed">
                  Laporan laba rugi, margin finansial, dan audit food cost dilindungi dengan PIN Owner.
                </p>
                <button
                  onClick={() => handleOpenOwnerAuth()}
                  className="mt-6 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-900/30"
                >
                  Masukkan PIN Owner
                </button>
              </div>
            )
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wasteCountToday={wasteCountToday}
        userRole={userRole}
      />

      {/* Global Modals */}
      <QuickWasteModal
        isOpen={isQuickWasteOpen}
        onClose={() => setIsQuickWasteOpen(false)}
        onSave={handleAddWasteLog}
        ingredients={ingredients}
        baristas={settings.baristas}
      />

      <RecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        onSave={handleSaveRecipe}
        ingredients={ingredients}
        defaultTargetMargin={settings.defaultTargetMargin}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
      />

      {/* Owner PIN Authentication Modal */}
      <OwnerPinModal
        isOpen={isOwnerPinModalOpen}
        onClose={() => {
          setIsOwnerPinModalOpen(false);
          setPendingOwnerAction(null);
        }}
        onSuccess={handleOwnerPinSuccess}
        correctPin={settings.ownerPin || '1234'}
      />

      {/* User Self-Serve Change PIN Modal */}
      <ChangePinModal
        isOpen={isChangePinModalOpen}
        onClose={() => setIsChangePinModalOpen(false)}
        userRole={changePinData.role}
        userName={changePinData.userName}
        currentPin={changePinData.currentPin}
        onSaveNewPin={handleSaveNewPin}
      />

    </div>
  );
}
