import React from 'react';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Trash2, 
  Package, 
  FileSpreadsheet, 
  FileText,
  BookOpen
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { UserRole } from '../../types';

interface MobileBottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  wasteCountToday: number;
  userRole: UserRole;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  wasteCountToday,
  userRole,
}) => {
  const isOwner = userRole === 'owner';

  const items = isOwner ? [
    { id: 'dashboard' as NavTab, label: 'Ikhtisar', icon: LayoutDashboard },
    { id: 'hpp' as NavTab, label: 'HPP', icon: UtensilsCrossed },
    { id: 'waste' as NavTab, label: 'Waste', icon: Trash2, badge: wasteCountToday },
    { id: 'ingredients' as NavTab, label: 'Bahan', icon: Package },
    { id: 'sheets' as NavTab, label: 'Sheets', icon: FileSpreadsheet },
    { id: 'reports' as NavTab, label: 'Laporan', icon: FileText },
  ] : [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hpp' as NavTab, label: 'SOP Resep', icon: BookOpen },
    { id: 'waste' as NavTab, label: 'Waste', icon: Trash2, badge: wasteCountToday },
    { id: 'ingredients' as NavTab, label: 'Stok', icon: Package },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/80 px-2 py-1.5 shadow-lg safe-area-bottom">
      <div className={`grid gap-1 ${isOwner ? 'grid-cols-6' : 'grid-cols-4'}`}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-lg transition-colors relative ${
                isActive
                  ? isOwner
                    ? 'text-amber-400 font-semibold'
                    : 'text-blue-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
