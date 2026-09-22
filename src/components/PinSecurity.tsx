import React, { useState } from 'react';
import { LockKeyhole, CheckCircle2, ShieldCheck, LogOut } from 'lucide-react';
import { User } from '../types';
import { store } from '../services/store';

export const PinSettings: React.FC<{ user: User }> = ({ user }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const savePin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!/^\d{4}$/.test(pin)) return setError('PIN must contain exactly 4 digits.');
    if (pin !== confirmPin) return setError('The PINs do not match.');
    try {
      await store.setUserPin(user.id, pin);
      setPin('');
      setConfirmPin('');
      setMessage('PIN saved. You can use it next time you open the app.');
    } catch (err: any) {
      setError(err?.message || 'Could not save PIN.');
    }
  };

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
      <div className="flex items-center gap-2">
        <LockKeyhole className="w-4 h-4 text-blue-600" />
        <div>
          <h3 className="text-xs font-extrabold text-slate-900">4-Digit App PIN</h3>
          <p className="text-[10px] text-slate-500">Use a PIN instead of entering email and password each time.</p>
        </div>
      </div>
      <form onSubmit={savePin} className="grid grid-cols-2 gap-2">
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          pattern="[0-9]{4}"
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="New PIN"
          className="p-2.5 bg-white border border-slate-300 rounded-xl text-xs tracking-[0.35em]"
          aria-label="New four digit PIN"
        />
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          pattern="[0-9]{4}"
          value={confirmPin}
          onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="Confirm PIN"
          className="p-2.5 bg-white border border-slate-300 rounded-xl text-xs tracking-[0.35em]"
          aria-label="Confirm four digit PIN"
        />
        <button type="submit" className="col-span-2 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold">
          {store.hasPin(user) ? 'Change PIN' : 'Save PIN'}
        </button>
      </form>
      {message && <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{message}</p>}
      {error && <p className="text-[10px] text-rose-600 font-semibold">{error}</p>}
    </div>
  );
};

export const PinUnlockView: React.FC<{ user: User; onUnlocked: () => void; onUsePassword: () => void }> = ({ user, onUnlocked, onUsePassword }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const unlock = async (event: React.FormEvent) => {
    event.preventDefault();
    const valid = await store.verifyUserPin(user, pin);
    if (valid) {
      onUnlocked();
      return;
    }
    setPin('');
    setError('Incorrect PIN. Try again or use email and password.');
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-blue-950 via-blue-900 to-sky-950 p-5 text-white">
      <div className="w-full max-w-sm bg-blue-950/85 rounded-3xl p-6 border border-blue-400/30 shadow-2xl text-center space-y-5">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold">Welcome back, {user.name.split(' ')[0]}</h2>
          <p className="text-xs text-blue-200 mt-1">Enter your 4-digit PIN to unlock Elsa Laundry.</p>
        </div>
        <form onSubmit={unlock} className="space-y-3">
          <input
            autoFocus
            type="password"
            inputMode="numeric"
            maxLength={4}
            pattern="[0-9]{4}"
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full p-3 bg-blue-900/70 border border-blue-700 rounded-xl text-center text-lg tracking-[0.6em] text-white"
            placeholder="••••"
            aria-label="Four digit PIN"
          />
          {error && <p className="text-[11px] text-rose-300 font-semibold">{error}</p>}
          <button type="submit" disabled={pin.length !== 4} className="w-full py-3 bg-cyan-500 disabled:opacity-50 text-blue-950 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2">
            <LockKeyhole className="w-4 h-4" /> Unlock app
          </button>
        </form>
        <button type="button" onClick={onUsePassword} className="text-xs text-cyan-200 hover:text-white font-semibold flex items-center justify-center gap-1.5 mx-auto">
          <LogOut className="w-3.5 h-3.5" /> Use email and password instead
        </button>
      </div>
    </div>
  );
};
