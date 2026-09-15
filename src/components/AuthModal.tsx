import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  Lock,
  User,
  Shield,
  Truck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ElsaLogo } from './ElsaLogo';
import { store } from '../services/store';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [identifier, setIdentifier] = useState('sarah.wanjiku@gmail.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (!identifier.trim()) {
        setErrorMsg('Please enter your Kenyan phone number or email address');
        return;
      }

      if (authMode === 'signin') {
        const user = store.loginWithCredentials(identifier, selectedRole);
        onLoginSuccess(user.role);
        onClose();
      } else {
        const user = store.loginWithCredentials(identifier, selectedRole);
        if (name.trim()) {
          store.updateProfile(user.id, { name: name.trim() });
        }
        onLoginSuccess(selectedRole);
        onClose();
      }
    }, 400);
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    const user = store.loginAs(role);
    onLoginSuccess(user.role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="auth-modal-card"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ElsaLogo size="sm" withGlow />
            <div>
              <h3 className="font-bold text-base">Elsa Laundry Services</h3>
              <p className="text-xs text-cyan-200">Account Access & Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Quick Demo Switcher */}
          <div className="mb-5 p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                1-Tap Demo Role Sign In
              </span>
              <span className="text-[10px] bg-blue-200/70 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                Nairobi
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('customer')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-blue-200 hover:border-blue-500 hover:shadow-sm text-xs font-medium text-slate-800 transition-all"
              >
                <User className="w-4 h-4 text-blue-600 mb-1" />
                <span>Customer</span>
                <span className="text-[10px] text-slate-400">Sarah</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('driver')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-amber-200 hover:border-amber-500 hover:shadow-sm text-xs font-medium text-slate-800 transition-all"
              >
                <Truck className="w-4 h-4 text-amber-600 mb-1" />
                <span>Driver</span>
                <span className="text-[10px] text-slate-400">Brian</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 hover:shadow-sm text-xs font-medium text-slate-800 transition-all"
              >
                <Shield className="w-4 h-4 text-emerald-600 mb-1" />
                <span>Admin</span>
                <span className="text-[10px] text-slate-400">Elsa</span>
              </button>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                authMode === 'signin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                authMode === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. David Ochieng"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number (+254) or Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. +254 712 345 678 or sarah.wanjiku@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['customer', 'driver', 'admin'] as UserRole[]).map((role) => (
                    <button
                      type="button"
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`py-2 px-2 rounded-xl text-xs capitalize font-medium border text-center transition-all ${
                        selectedRole === role
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errorMsg && (
              <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
                {errorMsg}
              </p>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{authMode === 'signin' ? 'Sign In' : 'Create & Access Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
