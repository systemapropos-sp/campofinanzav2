import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = useCallback(async (currentPin: string[]) => {
    const pinStr = currentPin.join('');
    if (pinStr.length !== 4) return;

    setLoading(true);
    setError('');

    const success = await login(pinStr);

    if (success) {
      navigate('/dashboard');
    } else {
      setShake(true);
      setError('PIN incorrecto');
      setPin(['', '', '', '']);
      setTimeout(() => {
        setShake(false);
        inputRefs.current[0]?.focus();
      }, 400);
    }

    setLoading(false);
  }, [login, navigate]);

  const handleChange = useCallback((index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 3 && value) {
      handleSubmit(newPin);
    }
  }, [pin, handleSubmit]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && index === 3) {
      handleSubmit(pin);
    }
  }, [pin, handleSubmit]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0D2818 0%, #1B4332 100%)' }}>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 25 L55 30 L35 35 L30 55 L25 35 L5 30 L25 25 Z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className={`relative z-10 w-full max-w-[380px] mx-4 transition-transform duration-300 ${shake ? 'animate-shake' : ''}`}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Sprout className="w-10 h-10 text-[#C9A84C] mb-3" />
          <h1 className="text-white text-2xl font-bold tracking-[3px]">
            CAMPOFINANZAS
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] px-8 py-10">
          <h2 className="text-2xl font-semibold text-[#2C2C2C] text-center mb-1">
            Ingresar PIN
          </h2>
          <p className="text-sm text-[#9B9B9B] text-center mb-8">
            Ingrese su codigo de acceso
          </p>

          {/* PIN Inputs */}
          <div className="flex justify-center gap-3 mb-6">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                disabled={loading}
                className={`w-14 h-14 text-center text-2xl font-semibold font-mono rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                  error
                    ? 'border-[#C97B7B] bg-[#C97B7B]/5'
                    : digit
                      ? 'border-[#1B4332] bg-[#1B4332]/5'
                      : 'border-[#E8E0D4] bg-white focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.15)]'
                }`}
                style={{ caretColor: '#1B4332' }}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-[#C97B7B] text-center mb-4 animate-fadeIn">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            onClick={() => handleSubmit(pin)}
            disabled={pin.some(d => !d) || loading}
            className={`w-full h-12 rounded-xl font-medium text-base transition-all duration-200 flex items-center justify-center gap-2 ${
              pin.some(d => !d) || loading
                ? 'bg-[#E8E0D4] text-[#9B9B9B] cursor-not-allowed'
                : 'bg-[#1B4332] text-white hover:bg-[#2D6A4F] active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Acceder'
            )}
          </button>

          {/* Demo PINs */}
          <div className="mt-6 pt-4 border-t border-[#E8E0D4]">
            <p className="text-[10px] text-[#9B9B9B] text-center uppercase tracking-wider mb-2">PINs de demostracion</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => { setPin(['1','2','3','4']); setTimeout(() => handleSubmit(['1','2','3','4']), 100); }}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#F5F0E8] text-[#6B6B6B] hover:bg-[#E8E0D4] transition-colors"
              >
                Admin: 1234
              </button>
              <button
                onClick={() => { setPin(['5','6','7','8']); setTimeout(() => handleSubmit(['5','6','7','8']), 100); }}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#F5F0E8] text-[#6B6B6B] hover:bg-[#E8E0D4] transition-colors"
              >
                Oper: 5678
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6">
          Sistema de Gestion Financiera
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 50%, 90% { transform: translateX(-8px); }
          30%, 70% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
