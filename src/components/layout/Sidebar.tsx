import React from 'react';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Trash2, 
  Package, 
  FileSpreadsheet, 
  FileText, 
  ShieldCheck, 
  Lock, 
  BookOpen,
  LogOut,
  KeyRound
} from 'lucide-react';
import { UserRole } from '../../types';

export type NavTab = 'dashboard' | 'hpp' | 'waste' | 'ingredients' | 'sheets' | 'reports';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  wasteCountToday: number;
  lowStockCount: number;
  userRole: UserRole;
  currentBaristaName: string;
  onOpenOwnerAuth: () => void;
  onSwitchToBarista: () => void;
  onOpenChangePin: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  wasteCountToday,
  lowStockCount,
  userRole,
  currentBaristaName,
  onOpenOwnerAuth,
  onSwitchToBarista,
  onOpenChangePin,
  onLogout,
}) => {
  const isOwner = userRole === 'owner';

  const navItems = isOwner ? [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard Finansial',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'hpp' as NavTab,
      label: 'HPP & Resep Menu',
      icon: UtensilsCrossed,
      badge: null,
    },
    {
      id: 'waste' as NavTab,
      label: 'Analisa & Log Waste',
      icon: Trash2,
      badge: wasteCountToday > 0 ? `${wasteCountToday}` : null,
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    {
      id: 'ingredients' as NavTab,
      label: 'Bahan Baku & Biaya',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      id: 'sheets' as NavTab,
      label: 'Google Sheets Live',
      icon: FileSpreadsheet,
      badge: 'Sync',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'reports' as NavTab,
      label: 'Laporan & SOP Print',
      icon: FileText,
      badge: null,
    },
  ] : [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard Barista',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'hpp' as NavTab,
      label: 'SOP Resep Barista',
      icon: BookOpen,
      badge: 'SOP',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      id: 'waste' as NavTab,
      label: 'Catatan Waste Shift',
      icon: Trash2,
      badge: wasteCountToday > 0 ? `${wasteCountToday}` : null,
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    {
      id: 'ingredients' as NavTab,
      label: 'Sisa Stok & Porsi',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-zinc-950/60 border-r border-zinc-800/80 p-3.5 shrink-0 min-h-[calc(100vh-3.75rem)]">
      
      {/* Role Profile Compact Card */}
      <div className="mb-4 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
            Akses Aktif
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${
            isOwner
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
          }`}>
            {isOwner ? '👑 Owner' : '☕ Barista'}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-xs font-semibold text-zinc-200">
            {isOwner ? 'O' : (currentBaristaName.charAt(0) || 'B')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-zinc-100 truncate">
              {isOwner ? 'Management' : currentBaristaName || 'Barista Shift'}
            </p>
            <p className="text-[11px] text-zinc-400 truncate">
              {isOwner ? 'Akses Penuh Finansial' : 'Operasional Bar'}
            </p>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-zinc-800 space-y-1">
          {isOwner ? (
            <button
              onClick={onSwitchToBarista}
              className="w-full py-1.5 px-2 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-medium transition-colors text-center"
            >
              Beralih ke Barista
            </button>
          ) : (
            <button
              onClick={onOpenOwnerAuth}
              className="w-full py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3 h-3" />
              <span>Masuk Mode Owner</span>
            </button>
          )}
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-2 py-1 mb-1">
          Navigasi Utama
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? (isOwner ? 'text-amber-400' : 'text-blue-400') : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${
                    item.badgeColor || 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Clean compact bottom actions */}
      <div className="pt-3 border-t border-zinc-800/80 space-y-1">
        <button
          onClick={onOpenChangePin}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors font-medium"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Ganti PIN Saya</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Sesi</span>
        </button>
      </div>

    </aside>
  );
};
