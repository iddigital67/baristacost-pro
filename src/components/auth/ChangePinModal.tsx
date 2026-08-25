import React, { useState, useEffect } from 'react';
import { 
  X, 
  KeyRound, 
  ShieldCheck, 
  User, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Lock, 
  Sparkles 
} from 'lucide-react';
import { UserRole } from '../../types';
import confetti from 'canvas-confetti';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  userName: string;
  currentPin: string;
  onSaveNewPin: (newPin: string, role: UserRole, targetUserName?: string) => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({
  isOpen,
  onClose,
  userRole,
  userName,
  currentPin,
  onSaveNewPin,
}) => {
  const isOwner = userRole === 'owner';

  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setError('');
      setSuccessMessage('');
      setShowPins(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Verify old PIN
    if (oldPin.trim() !== currentPin.trim()) {
      setError('PIN saat ini / lama tidak cocok!');
      return;
    }

    // 2. Validate new PIN length (4-6 digits)
    const cleanNewPin = newPin.trim();
    if (cleanNewPin.length < 4 || cleanNewPin.length > 6) {
      setError('PIN baru harus terdiri dari 4 sampai 6 digit angka!');
      return;
    }

    if (!/^\d+$/.test(cleanNewPin)) {
      setError('PIN hanya boleh berupa angka!');
      return;
    }

    // 3. Check confirmation
    if (cleanNewPin !== confirmPin.trim()) {
      setError('Konfirmasi PIN baru tidak sesuai!');
      return;
    }

    // 4. Save
    onSaveNewPin(cleanNewPin, userRole, isOwner ? undefined : userName);
    setSuccessMessage('PIN Anda berhasil diubah!');

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col my-4">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isOwner 
                ? 'bg-zinc-800 text-amber-400 border-zinc-700/80'
                : 'bg-zinc-800 text-blue-400 border-zinc-700/80'
            }`}>
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <span>Ganti PIN Pengguna</span>
              </h3>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span>Akun:</span>
                <strong className={`font-semibold ${isOwner ? 'text-amber-400' : 'text-blue-400'}`}>
                  {isOwner ? '👑 Owner / Management' : `☕ ${userName}`}
                </strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs text-zinc-200">
          
          {successMessage ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex flex-col items-center justify-center gap-2 text-center py-6 animate-in zoom-in-95">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h4 className="font-semibold text-sm text-white">{successMessage}</h4>
              <p className="text-[11px] text-emerald-400/80">
                Gunakan PIN baru ini pada login berikutnya.
              </p>
            </div>
          ) : (
            <>
              {/* Info banner */}
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start gap-2">
                <ShieldCheck className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isOwner ? 'text-amber-400' : 'text-blue-400'}`} />
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Setiap akun ({isOwner ? 'Owner' : 'Barista'}) memiliki PIN masing-masing untuk menjaga privasi & wewenang operasional.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Input 1: Old PIN */}
              <div className="space-y-1">
                <label className="block text-zinc-300 font-medium text-[11px]">
                  PIN Lama / Saat Ini:
                </label>
                <div className="relative">
                  <input
                    type={showPins ? 'text' : 'password'}
                    maxLength={6}
                    required
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Masukkan PIN saat ini..."
                    autoFocus
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 font-mono tracking-widest text-xs focus:outline-none focus:border-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPins(!showPins)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                  >
                    {showPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Input 2: New PIN */}
              <div className="space-y-1">
                <label className="block text-zinc-300 font-medium text-[11px]">
                  PIN Baru (4 - 6 Angka):
                </label>
                <input
                  type={showPins ? 'text' : 'password'}
                  maxLength={6}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Contoh: 5678"
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 font-mono tracking-widest text-xs focus:outline-none focus:border-zinc-700"
                />
              </div>

              {/* Input 3: Confirm New PIN */}
              <div className="space-y-1">
                <label className="block text-zinc-300 font-medium text-[11px]">
                  Konfirmasi PIN Baru:
                </label>
                <input
                  type={showPins ? 'text' : 'password'}
                  maxLength={6}
                  required
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ulangi PIN baru..."
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 font-mono tracking-widest text-xs focus:outline-none focus:border-zinc-700"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-medium text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Simpan PIN Baru</span>
                </button>
              </div>
            </>
          )}

        </form>

      </div>
    </div>
  );
};
