import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, KeyRound, X, AlertCircle, Sparkles } from 'lucide-react';

interface OwnerPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin: string;
}

export const OwnerPinModal: React.FC<OwnerPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
      setErrorMessage('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);
      
      // Auto submit if length matches correctPin length
      if (newPin.length === correctPin.length) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const verifyPin = (pinToVerify: string) => {
    if (pinToVerify === correctPin) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setErrorMessage('PIN Salah! Silakan coba lagi.');
      setPin('');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPin(pin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 flex flex-col items-center animate-in fade-in zoom-in duration-200">
        
        {/* Close button */}
        <div className="w-full flex justify-end">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Icon & Title */}
        <div className="w-12 h-12 rounded-xl bg-zinc-800 text-amber-400 flex items-center justify-center border border-zinc-700/80 mb-3">
          <Lock className="w-5 h-5 stroke-[2.2]" />
        </div>

        <h3 className="text-sm font-semibold text-zinc-100 text-center">
          Akses Owner / Manajemen
        </h3>
        <p className="text-xs text-zinc-400 text-center mt-1 mb-5">
          Masukkan PIN Keamanan untuk membuka data HPP, margin keuntungan, dan database.
        </p>

        {/* PIN Dots display */}
        <form onSubmit={handleFormSubmit} className="w-full flex flex-col items-center">
          <input
            ref={inputRef}
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setPin(val);
              if (val.length === correctPin.length) {
                verifyPin(val);
              }
            }}
            className="opacity-0 absolute -z-10"
            autoFocus
          />

          <div className="flex gap-2.5 mb-4 cursor-pointer" onClick={() => inputRef.current?.focus()}>
            {Array.from({ length: correctPin.length || 4 }).map((_, idx) => {
              const isFilled = idx < pin.length;
              return (
                <div
                  key={idx}
                  className={`w-10 h-11 rounded-lg border flex items-center justify-center text-lg font-bold transition-all ${
                    error
                      ? 'border-rose-500 bg-rose-950/30 text-rose-300 animate-pulse'
                      : isFilled
                      ? 'border-amber-500/80 bg-zinc-800 text-amber-300'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-600'
                  }`}
                >
                  {isFilled ? '●' : ''}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-medium mb-3">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Numeric Keypad for Touch / Mobile */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] my-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => {
              const isAction = key === 'C' || key === '⌫';
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === 'C') setPin('');
                    else if (key === '⌫') handleDelete();
                    else handleKeypadPress(key);
                  }}
                  className={`h-11 rounded-lg font-semibold text-sm flex items-center justify-center transition-all active:scale-95 ${
                    isAction
                      ? 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
                      : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-100 border border-zinc-700/80 shadow-xs'
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-zinc-800 w-full text-center">
            <p className="text-[11px] text-zinc-500">
              Default PIN: <strong className="text-zinc-300">1234</strong> (Dapat diubah di Setting)
            </p>
          </div>
        </form>

      </div>
    </div>
  );
};
