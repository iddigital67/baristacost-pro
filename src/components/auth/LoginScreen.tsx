import React, { useState } from 'react';
import { 
  Coffee, 
  ShieldCheck, 
  Lock, 
  User, 
  KeyRound, 
  ArrowRight, 
  Plus, 
  AlertCircle, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { CafeSettings, UserRole } from '../../types';
import confetti from 'canvas-confetti';

interface LoginScreenProps {
  settings: CafeSettings;
  recipesCount: number;
  ingredientsCount: number;
  onLoginOwner: () => void;
  onLoginBarista: (baristaName: string, shift: string) => void;
  onOpenChangePinModal: (role: UserRole, targetUserName: string, currentPin: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  settings,
  recipesCount,
  ingredientsCount,
  onLoginOwner,
  onLoginBarista,
  onOpenChangePinModal,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('barista');
  
  // Owner PIN State
  const [ownerPinInput, setOwnerPinInput] = useState('');
  const [showOwnerPin, setShowOwnerPin] = useState(false);
  const [ownerPinError, setOwnerPinError] = useState('');

  // Barista State
  const [selectedBarista, setSelectedBarista] = useState(settings.baristas[0] || 'Rian (Head Barista)');
  const [isCustomBarista, setIsCustomBarista] = useState(false);
  const [customBaristaName, setCustomBaristaName] = useState('');
  const [selectedShift, setSelectedShift] = useState<string>('Shift Pagi (Opening)');
  
  // Barista PIN State
  const [baristaPinInput, setBaristaPinInput] = useState('');
  const [showBaristaPin, setShowBaristaPin] = useState(false);
  const [baristaPinError, setBaristaPinError] = useState('');

  const shifts = [
    { id: 'Shift Pagi (Opening)', label: 'Shift Pagi', time: '07:00 - 15:00' },
    { id: 'Shift Siang (Peak)', label: 'Shift Siang', time: '12:00 - 20:00' },
    { id: 'Shift Malam (Closing)', label: 'Shift Malam', time: '15:00 - 23:00' },
  ];

  const currentBaristaTargetName = isCustomBarista ? customBaristaName.trim() : selectedBarista;
  const currentExpectedBaristaPin = settings.baristaPins?.[currentBaristaTargetName] || '1234';

  const handleOwnerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const correctPin = settings.ownerPin || '1234';
    
    if (ownerPinInput.trim() === correctPin) {
      setOwnerPinError('');
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
      onLoginOwner();
    } else {
      setOwnerPinError('PIN Owner salah. Coba lagi.');
      setOwnerPinInput('');
    }
  };

  const handleOwnerNumpadClick = (num: string) => {
    if (ownerPinInput.length < 6) {
      const newPin = ownerPinInput + num;
      setOwnerPinInput(newPin);
      setOwnerPinError('');
      const correctPin = settings.ownerPin || '1234';
      if (newPin === correctPin) {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
        onLoginOwner();
      }
    }
  };

  const handleBaristaSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentBaristaTargetName) return;

    const requiredPin = currentExpectedBaristaPin;
    if (baristaPinInput.trim() === requiredPin) {
      setBaristaPinError('');
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
      onLoginBarista(currentBaristaTargetName, selectedShift);
    } else {
      setBaristaPinError(`PIN untuk ${currentBaristaTargetName} salah.`);
      setBaristaPinInput('');
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0d] text-zinc-100 flex flex-col justify-between selection:bg-amber-500 selection:text-zinc-950 font-sans">
      
      {/* Top Simple Header */}
      <header className="max-w-5xl mx-auto w-full px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
            <Coffee className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-semibold text-base tracking-tight text-white block">
              BaristaCost PRO
            </span>
            <span className="text-xs text-zinc-400 font-normal">
              {settings.cafeName}
            </span>
          </div>
        </div>

        <div className="text-xs text-zinc-400 font-medium">
          Sistem HPP & Kontrol Waste
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="max-w-md mx-auto w-full px-4 py-8 flex flex-col items-center">
        
        {/* Segmented Role Selector */}
        <div className="w-full bg-zinc-900/90 border border-zinc-800/90 p-1 rounded-xl grid grid-cols-2 gap-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('barista');
              setBaristaPinError('');
              setBaristaPinInput('');
            }}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
              selectedRole === 'barista'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>Tim Barista</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('owner');
              setOwnerPinError('');
              setOwnerPinInput('');
            }}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
              selectedRole === 'owner'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Owner / Manager</span>
          </button>
        </div>

        {/* Card Body */}
        <div className="w-full bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-xl backdrop-blur-sm">
          
          {/* BARISTA VIEW */}
          {selectedRole === 'barista' && (
            <form onSubmit={handleBaristaSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Pilih Barista Bertugas
                </label>

                {!isCustomBarista ? (
                  <div className="grid grid-cols-2 gap-2">
                    {settings.baristas.map((name, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedBarista(name);
                          setBaristaPinInput('');
                          setBaristaPinError('');
                        }}
                        className={`p-2 rounded-lg text-xs font-medium border text-left truncate transition-colors ${
                          selectedBarista === name
                            ? 'bg-blue-600/10 border-blue-500/40 text-blue-300'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsCustomBarista(true)}
                      className="p-2 rounded-lg text-xs font-medium border border-dashed border-zinc-700 text-zinc-400 hover:text-zinc-200 text-center flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Nama Lain</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customBaristaName}
                      onChange={(e) => setCustomBaristaName(e.target.value)}
                      placeholder="Nama barista..."
                      className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomBarista(false)}
                      className="px-3 py-2 text-xs text-zinc-400 bg-zinc-800 rounded-lg hover:text-zinc-200"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>

              {/* Shift Selection */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Shift Kerja
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {shifts.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedShift(s.id)}
                      className={`p-2 rounded-lg text-center border text-xs transition-colors ${
                        selectedShift === s.id
                          ? 'bg-zinc-800 border-zinc-600 text-white font-medium'
                          : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <p className="font-medium truncate">{s.label}</p>
                      <p className="text-[10px] text-zinc-400">{s.time}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Barista PIN Input */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-300">
                    PIN Barista ({currentBaristaTargetName})
                  </label>
                  <button
                    type="button"
                    onClick={() => onOpenChangePinModal('barista', currentBaristaTargetName, currentExpectedBaristaPin)}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    Ganti PIN
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showBaristaPin ? 'text' : 'password'}
                    maxLength={6}
                    value={baristaPinInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setBaristaPinInput(val);
                      setBaristaPinError('');
                      if (val === currentExpectedBaristaPin) {
                        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
                        onLoginBarista(currentBaristaTargetName, selectedShift);
                      }
                    }}
                    placeholder="Masukkan PIN"
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-center text-base tracking-[0.3em] font-mono text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBaristaPin(!showBaristaPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                  >
                    {showBaristaPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {baristaPinError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1.5 font-normal">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{baristaPinError}</span>
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Default PIN: {currentExpectedBaristaPin}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setBaristaPinInput(currentExpectedBaristaPin);
                      confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
                      onLoginBarista(currentBaristaTargetName, selectedShift);
                    }}
                    className="text-blue-400 hover:underline"
                  >
                    Auto-Fill PIN
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={baristaPinInput.length === 0}
                className="w-full mt-2 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <span>Masuk Sesi Shift</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </form>
          )}

          {/* OWNER VIEW */}
          {selectedRole === 'owner' && (
            <form onSubmit={handleOwnerSubmit} className="space-y-4">
              
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">
                  PIN Keamanan Owner
                </label>
                <button
                  type="button"
                  onClick={() => onOpenChangePinModal('owner', 'Owner / Management', settings.ownerPin || '1234')}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Ganti PIN
                </button>
              </div>

              <div className="relative">
                <input
                  type={showOwnerPin ? 'text' : 'password'}
                  maxLength={6}
                  value={ownerPinInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setOwnerPinInput(val);
                    setOwnerPinError('');
                    if (val === (settings.ownerPin || '1234')) {
                      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
                      onLoginOwner();
                    }
                  }}
                  placeholder="••••"
                  autoFocus
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-center text-xl tracking-[0.4em] font-mono text-amber-400 focus:outline-none focus:border-amber-500/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowOwnerPin(!showOwnerPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                >
                  {showOwnerPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {ownerPinError && (
                <p className="text-xs text-rose-400 flex items-center justify-center gap-1 font-normal">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{ownerPinError}</span>
                </p>
              )}

              {/* Clean Minimal Numpad */}
              <div className="grid grid-cols-3 gap-1.5 max-w-[240px] mx-auto pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleOwnerNumpadClick(digit)}
                    className="h-10 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-sm transition-colors active:scale-95"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setOwnerPinInput('');
                    setOwnerPinError('');
                  }}
                  className="h-10 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-xs transition-colors"
                >
                  C
                </button>
                <button
                  type="button"
                  onClick={() => handleOwnerNumpadClick('0')}
                  className="h-10 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-sm transition-colors active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOwnerPinInput(prev => prev.slice(0, -1));
                    setOwnerPinError('');
                  }}
                  className="h-10 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-sm transition-colors"
                >
                  ⌫
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <span>Default: {settings.ownerPin || '1234'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setOwnerPinInput(settings.ownerPin || '1234');
                    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                    onLoginOwner();
                  }}
                  className="text-amber-400 hover:underline"
                >
                  Auto-Fill
                </button>
              </div>

              <button
                type="submit"
                disabled={ownerPinInput.length === 0}
                className="w-full mt-2 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Buka Dashboard Owner</span>
              </button>

            </form>
          )}

        </div>

        {/* Minimal metrics footer */}
        <div className="mt-8 flex items-center gap-6 text-xs text-zinc-400">
          <span>{recipesCount} Resep Aktif</span>
          <span>•</span>
          <span>{ingredientsCount} Bahan Baku</span>
          <span>•</span>
          <span>Audit Food Cost</span>
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full px-6 py-4 text-center text-xs text-zinc-400 border-t border-zinc-800/60">
        BaristaCost PRO • Standarisasi Resep & Pengendalian Waste Kafe
      </footer>

    </div>
  );
};
