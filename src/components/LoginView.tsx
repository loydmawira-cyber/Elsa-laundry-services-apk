import React, { useState } from 'react';
import {
  Mail,
  Phone,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { ElsaLogo } from './ElsaLogo';
import { store, DEFAULT_BUSINESS_SETTINGS } from '../services/store';
import { User } from '../types';
import laundryHeroArt from '../assets/images/laundry_hero_art_1789521647694.jpg';
import laundryPickupVan from '../assets/images/laundry_pickup_van_1789521662496.jpg';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  businessSettings?: typeof DEFAULT_BUSINESS_SETTINGS;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, businessSettings = DEFAULT_BUSINESS_SETTINGS }) => {
  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResetSuccessMsg('');

    if (!resetIdentifier.trim()) {
      setErrorMsg('Please enter your phone number (+254) or email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await store.resetPassword(resetIdentifier.trim());
      setResetSuccessMsg(res.message);
    } catch (err: any) {
      console.error('Password reset request error:', err);
      setErrorMsg(err?.message || 'Unable to send password reset link. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-gradient-to-b from-blue-950 via-blue-900 to-sky-950 text-white min-h-full p-4 sm:p-6 overflow-y-auto">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center pt-3 pb-4">
        <div className="mb-3 transform hover:scale-105 transition-transform">
          <ElsaLogo size="xl" withGlow />
        </div>
        <h1 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-200">
          Elsa Laundry Services
        </h1>
        <p className="text-xs text-cyan-200 font-medium mt-0.5">
          For a spotless clean • Pickup & Delivery
        </p>
        <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/60 border border-cyan-400/30 text-[11px] text-cyan-200 backdrop-blur-sm shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Open • {businessSettings.facilityAddress}</span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-sm mx-auto bg-blue-950/85 backdrop-blur-xl text-white rounded-3xl shadow-2xl shadow-blue-950/80 p-5 border border-blue-400/30 ring-1 ring-white/10">
        {/* Sign In vs Register Tabs */}
        {mode !== 'forgot' ? (
          <div className="flex bg-blue-900/80 p-1 rounded-2xl mb-4 text-xs font-bold border border-blue-700/50">
            <button
              type="button"
              id="tab-signin"
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                mode === 'signin'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25'
                  : 'text-blue-200 hover:text-white'
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
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-blue-800/80">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
                setResetSuccessMsg('');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </button>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Password Reset
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-1">
                Phone Number (+254) or Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-blue-300 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  id="login-identifier-input"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. +254 712 345 678 or sarah@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-blue-900/60 border border-blue-700/60 rounded-xl text-xs font-medium text-white placeholder-blue-300/60 focus:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-blue-200 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  id="forgot-password-link"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg('');
                    setResetSuccessMsg('');
                    setResetIdentifier(identifier);
                  }}
                  className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-100 hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-blue-300 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  id="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2.5 bg-blue-900/60 border border-blue-700/60 rounded-xl text-xs font-medium text-white placeholder-blue-300/60 focus:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-blue-300 hover:text-white p-0.5 rounded transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.99] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 mt-2"
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
              <label className="block text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-blue-300 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  id="reg-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. David Ochieng"
                  className="w-full pl-9 pr-3 py-2 bg-blue-900/60 border border-blue-700/60 rounded-xl text-xs font-medium text-white placeholder-blue-300/60 focus:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-1">
                Kenyan Phone (+254)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-blue-300 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  id="reg-phone-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 712 345 678"
                  className="w-full pl-9 pr-3 py-2 bg-blue-900/60 border border-blue-700/60 rounded-xl text-xs font-medium text-white placeholder-blue-300/60 focus:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-blue-300 absolute left-3 top-3" />
                <input
                  type="email"
                  id="reg-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="david.ochieng@gmail.com"
                  className="w-full pl-9 pr-3 py-2 bg-blue-900/60 border border-blue-700/60 rounded-xl text-xs font-medium text-white placeholder-blue-300/60 focus:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-1">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-blue-300 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  id="reg-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-blue-900/60 border border-blue-700/60 rounded-xl text-xs font-medium text-white placeholder-blue-300/60 focus:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              id="register-submit-btn"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.99] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 mt-2"
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

        {/* 3. FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <div className="space-y-3.5">
            <div className="text-center mb-1">
              <h2 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                <KeyRound className="w-4 h-4 text-cyan-300" />
                <span>Reset Your Password</span>
              </h2>
              <p className="text-[11px] text-blue-200 mt-1 leading-relaxed">
                Enter your registered email address or Kenyan phone number (+254). We will send you password reset instructions.
              </p>
            </div>

            {resetSuccessMsg ? (
              <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs space-y-2.5">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{resetSuccessMsg}</span>
                </div>
                <button
                  type="button"
                  id="reset-success-back-btn"
                  onClick={() => {
                    setMode('signin');
                    setResetSuccessMsg('');
                    setErrorMsg('');
                  }}
                  className="w-full mt-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-1">
                    Email Address or Phone (+254)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-blue-300 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      id="reset-identifier-input"
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      placeholder="e.g. sarah@gmail.com or +254 712 345 678"
                      className="w-full pl-9 pr-3 py-2.5 bg-blue-900/60 border border-blue-700/60 rounded-xl text-xs font-medium text-white placeholder-blue-300/60 focus:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="reset-submit-btn"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.99] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Send Password Reset Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="reset-cancel-btn"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg('');
                  }}
                  className="w-full py-2 text-center text-xs font-semibold text-blue-200 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Informational Subtext */}
        <div className="mt-4 pt-3 border-t border-blue-900/80 flex items-center justify-between text-[11px] text-blue-200/80">
          <span className="font-medium text-blue-200">Safe & Secure Access</span>
          <span className="text-cyan-300 font-bold bg-blue-900/80 px-2 py-0.5 rounded-md border border-cyan-400/30">
            Nairobi, Kenya
          </span>
        </div>
      </div>

      {/* Auto-Generated Laundry Graphics & Service Highlights */}
      <div className="w-full max-w-sm mx-auto my-4 space-y-3">
        {/* Graphic Banner 1: Fresh Laundry Art */}
        <div className="relative rounded-2xl overflow-hidden border border-cyan-400/30 shadow-lg shadow-blue-950/60 group">
          <img
            src={laundryHeroArt}
            alt="Sparkling Clean Laundry & Fabric Care"
            referrerPolicy="no-referrer"
            className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/60 to-transparent flex flex-col justify-end p-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] uppercase font-extrabold bg-cyan-400 text-blue-950 px-1.5 py-0.5 rounded tracking-wider">
                Premium Laundry
              </span>
              <span className="text-xs text-cyan-200 font-medium">Doorstep Service</span>
            </div>
            <p className="text-xs font-bold text-white leading-tight">
              Sparkling Freshness & Delicate Garment Care
            </p>
          </div>
        </div>

        {/* Graphic Banner 2: Express Delivery Van */}
        <div className="relative rounded-2xl overflow-hidden border border-blue-500/30 shadow-lg shadow-blue-950/60 group">
          <img
            src={laundryPickupVan}
            alt="Doorstep Pickup & Delivery Van"
            referrerPolicy="no-referrer"
            className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/70 to-transparent flex flex-col justify-end p-3">
            <p className="text-xs font-bold text-cyan-300">
              ⚡ Free Pickup & Delivery across Nairobi
            </p>
            <p className="text-[11px] text-blue-100/90 mt-0.5">
              Schedule your pickup in under 60 seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center py-2 space-y-1">
        <p className="text-[11px] text-blue-200">
          Customer Service (Elsie Kaburu):{' '}
          <a
            href="tel:+254796896239"
            className="text-cyan-300 font-bold hover:underline ml-1"
          >
            +254 796 896 239
          </a>
        </p>
        <p className="text-[10px] text-blue-300/80">
          <a
            href="mailto:Elsierichard76@gmail.com"
            className="text-cyan-200/80 hover:text-cyan-200 transition-colors"
          >
            Elsierichard76@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

