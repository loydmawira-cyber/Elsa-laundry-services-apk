import React, { useState } from 'react';
import {
  Mail,
  Phone,
  Lock,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { ElsaLogo } from './ElsaLogo';
import { store } from '../services/store';
import { User } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your phone number (+254) or email address');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const user = await store.loginWithCredentials(identifier.trim(), password.trim());
      onLoginSuccess(user);
    } catch (err: any) {
      console.error('Sign in error:', err);
      setErrorMsg(err?.message || 'Invalid email/phone or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setErrorMsg('Please provide a Kenyan phone number (+254) or email address');
      return;
    }
    if (!password.trim() || password.trim().length < 6) {
      setErrorMsg('Please create a password of at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const user = await store.registerUser({
        name: name.trim(),
        phone: phone.trim() || '+254 700 000 000',
        email: email.trim(),
        password: password.trim(),
        role: 'customer',
      });
      onLoginSuccess(user);
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMsg(err?.message || 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-900 text-white min-h-full p-4 sm:p-6 overflow-y-auto">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center pt-3 pb-4">
        <div className="mb-3 transform hover:scale-105 transition-transform">
          <ElsaLogo size="xl" withGlow />
        </div>
        <h1 className="text-xl font-black tracking-tight text-white">Elsa Laundry Services</h1>
        <p className="text-xs text-blue-300 font-medium mt-0.5">
          For a spotless clean • Pickup & Delivery in Nairobi
        </p>
        <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Open 7 Days • Kilimani, Westlands, Lavington</span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-sm mx-auto bg-white text-slate-900 rounded-3xl shadow-2xl p-5 border border-slate-100">
        {/* Sign In vs Register Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-4 text-xs font-bold">
          <button
            type="button"
            id="tab-signin"
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            id="tab-register"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number (+254) or Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  id="login-identifier-input"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. +254 712 345 678 or sarah@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  id="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  id="reg-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. David Ochieng"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kenyan Phone (+254)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  id="reg-phone-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 712 345 678"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  id="reg-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="david.ochieng@gmail.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  id="reg-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              id="register-submit-btn"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Customer Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Informational Subtext */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Safe & Secure Access</span>
          <span className="text-blue-600 font-semibold">Nairobi, Kenya</span>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center py-2 space-y-1">
        <p className="text-[11px] text-slate-400">
          Customer Service (Elsie Kaburu):{' '}
          <a
            href="tel:+254796896239"
            className="text-blue-300 font-bold hover:underline"
          >
            +254 796 896 239
          </a>
        </p>
        <p className="text-[10px] text-slate-500">
          <a
            href="mailto:Elsierichard76@gmail.com"
            className="text-slate-400 hover:text-blue-300 transition-colors"
          >
            Elsierichard76@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};
