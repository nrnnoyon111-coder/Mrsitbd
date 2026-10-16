import React, { useState } from 'react';
import { X, Lock, Key, ArrowRight, ShieldCheck } from 'lucide-react';
import { MrsLogo } from '../MrsLogo';
import { User } from '../../types';
import { useToast } from '../Toast';

interface AdminLoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  onClose,
  onLoginSuccess,
}) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('rakibulislamsarker24@gmail.com');
  const [password, setPassword] = useState('Noyonnrn');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      showToast(`Welcome back, ${data.user.name}!`, 'success');
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Login error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (profile: 'rakibul' | 'office' | 'ahadul') => {
    if (profile === 'rakibul') {
      setEmail('rakibulislamsarker24@gmail.com');
      setPassword('Noyonnrn');
    } else if (profile === 'office') {
      setEmail('mrsfastsolutions@gmail.com');
      setPassword('office123');
    } else if (profile === 'ahadul') {
      setEmail('ahadulislam0494@gmail.com');
      setPassword('tech123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white text-center relative border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-block mb-2">
            <MrsLogo variant="mark" size="md" />
          </div>
          <h3 className="font-extrabold text-lg text-white">
            Staff & Engineering Portal
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            MRS Fast Solution Secure Management System
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-5 text-xs">
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Staff Email or Registered Phone
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nrnnoyon111@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Staff Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-blue-200" />
                  <span>Authenticate & Enter Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Staff Credentials shortcut buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-mono text-slate-400 block text-center">
              Quick One-Click Staff Accounts:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('rakibul')}
                className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-[10px] transition-colors cursor-pointer text-center"
              >
                MD Rakibul Islam
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('office')}
                className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-[10px] transition-colors cursor-pointer text-center"
              >
                MRS Office
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('ahadul')}
                className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-[10px] transition-colors cursor-pointer text-center"
              >
                MD. Ahadul Islam
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
