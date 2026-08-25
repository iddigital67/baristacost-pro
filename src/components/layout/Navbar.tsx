import React, { useState } from 'react';
import { 
  Coffee, 
  Trash2, 
  Settings as SettingsIcon,
  Plus, 
  ShieldCheck, 
  User, 
  ChevronDown, 
  Lock, 
  LogOut, 
  KeyRound,
  FileSpreadsheet
} from 'lucide-react';
import { GoogleSheetsConfig, UserRole } from '../../types';

interface NavbarProps {
  cafeName: string;
  sheetsConfig: GoogleSheetsConfig;
  userRole: UserRole;
  currentBaristaName: string;
  baristas: string[];
  onChangeBarista: (name: string) => void;
  onOpenOwnerAuth: () => void;
  onSwitchToBarista: () => void;
  onOpenQuickWaste: () => void;
  onOpenSheetsModal: () => void;
  onOpenSettings: () => void;
  onOpenChangePin: () => void;
  onLogout: () => void;
  todayWasteCost: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  cafeName,
  sheetsConfig,
  userRole,
  currentBaristaName,
  baristas,
  onChangeBarista,
  onOpenOwnerAuth,
  onSwitchToBarista,
  onOpenQuickWaste,
  onOpenSheetsModal,
  onOpenSettings,
  onOpenChangePin,
  onLogout,
  todayWasteCost,
}) => {
  const [isBaristaMenuOpen, setIsBaristaMenuOpen] = useState(false);
  const isOwner = userRole === 'owner';

  return (
    <header className="bg-zinc-950/90 backdrop-blur-md text-zinc-100 border-b border-zinc-800/80 sticky top-0 z-30 w-full">
      <div className="w-full px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-14 sm:h-15 gap-2 sm:gap-3">
          
          {/* Brand Logo & Cafe Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-amber-400 shadow-sm">
              <Coffee className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-white">
                  BaristaCost
                </span>
                <span className={`text-[10px] font-medium tracking-wide px-1.5 py-0.2 rounded-md border ${
                  isOwner
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                }`}>
                  {isOwner ? 'OWNER' : 'BARISTA'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-normal truncate max-w-[130px] sm:max-w-xs leading-none mt-0.5">
                {cafeName}
              </p>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            
            {/* Quick Waste Logging Button */}
            <button
              onClick={onOpenQuickWaste}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Catat Waste</span>
            </button>

            {/* Sheets Status Indicator (for Owner) */}
            {isOwner && (
              <button
                onClick={onOpenSheetsModal}
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  sheetsConfig.webAppUrl
                    ? 'bg-zinc-900 hover:bg-zinc-800/80 text-emerald-400 border-emerald-500/30'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
                }`}
                title="Status Sinkronisasi Google Sheets"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{sheetsConfig.webAppUrl ? 'Sheets Aktif' : 'Sambungkan Sheet'}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${sheetsConfig.webAppUrl ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
              </button>
            )}

            {/* User Account / Role Selector */}
            {isOwner ? (
              <button
                onClick={onSwitchToBarista}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors"
                title="Beralih ke Tampilan Barista"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Mode Owner</span>
                <span className="text-[10px] text-zinc-400 hover:text-zinc-200">Ganti</span>
              </button>
            ) : (
              <div className="relative">
                <div className="inline-flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setIsBaristaMenuOpen(!isBaristaMenuOpen)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:text-white"
                  >
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span className="truncate max-w-[90px] sm:max-w-[120px]">
                      {currentBaristaName || 'Barista'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                  </button>

                  <button
                    onClick={onOpenOwnerAuth}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-md text-xs font-medium transition-colors border border-amber-500/20"
                    title="Buka akses Owner dengan PIN"
                  >
                    <Lock className="w-3 h-3" />
                    <span className="hidden sm:inline">Owner</span>
                  </button>
                </div>

                {isBaristaMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in duration-100">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-2 py-1">
                      Pilih Barista Bertugas
                    </p>
                    <div className="space-y-0.5 max-h-40 overflow-y-auto">
                      {baristas.map((name, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            onChangeBarista(name);
                            setIsBaristaMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                            currentBaristaName === name
                              ? 'bg-zinc-800 text-white font-semibold'
                              : 'text-zinc-300 hover:bg-zinc-800/60'
                          }`}
                        >
                          <span className="truncate">{name}</span>
                          {currentBaristaName === name && <span className="text-blue-400 text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                    <div className="mt-1.5 pt-1.5 border-t border-zinc-800 space-y-0.5">
                      <button
                        onClick={() => {
                          setIsBaristaMenuOpen(false);
                          onOpenChangePin();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2 font-medium"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Ganti PIN Saya</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsBaristaMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar Sesi</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick PIN Change Action */}
            <button
              onClick={onOpenChangePin}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
              title="Ganti PIN Akun"
            >
              <KeyRound className="w-3.5 h-3.5" />
            </button>

            {/* Settings (Owner only or triggers auth) */}
            <button
              onClick={isOwner ? onOpenSettings : onOpenOwnerAuth}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
              title={isOwner ? 'Pengaturan Cafe' : 'Buka Pengaturan (PIN Owner)'}
            >
              <SettingsIcon className="w-3.5 h-3.5" />
            </button>

            {/* Logout Session */}
            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors"
              title="Keluar / Ganti Akun"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
