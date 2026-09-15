import React, { useState } from 'react';
import {
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Plus,
  Trash2,
  Check,
  CreditCard,
  LogOut,
  ShieldCheck,
  Building,
  Home,
} from 'lucide-react';
import { User, Address } from '../../types';
import { store, DETERGENT_OPTIONS } from '../../services/store';

interface CustomerProfileViewProps {
  currentUser: User;
  onLogout?: () => void;
}

export const CustomerProfileView: React.FC<CustomerProfileViewProps> = ({
  currentUser,
  onLogout,
}) => {
  const [addresses, setAddresses] = useState<Address[]>(
    store.getAddresses(currentUser.id)
  );
  const [detergentChoice, setDetergentChoice] = useState(
    currentUser.default_detergent || DETERGENT_OPTIONS[0].name
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New address form state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('Nairobi, Kenya');

  const handleUpdateDetergent = (name: string) => {
    setDetergentChoice(name);
    store.updateProfile(currentUser.id, { default_detergent: name });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim()) return;

    store.addAddress({
      customer_id: currentUser.id,
      label: newLabel,
      street: newStreet.trim(),
      city: newCity.trim(),
      lat: -1.2921,
      lng: 36.8219,
      is_default: addresses.length === 0,
    });

    setAddresses(store.getAddresses(currentUser.id));
    setNewStreet('');
    setShowAddAddress(false);
  };

  const handleDeleteAddress = (id: string) => {
    store.deleteAddress(id);
    setAddresses(store.getAddresses(currentUser.id));
  };

  return (
    <div className="flex-1 p-4 space-y-4 pb-20">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">My Account</h2>
        <p className="text-xs text-slate-500">Preferences, default Nairobi addresses, & laundry settings</p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">{currentUser.name}</h3>
            <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
              Elsa Laundry VIP
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentUser.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentUser.phone}</span>
          </div>
        </div>
      </div>

      {/* Default Detergent Preference */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-xs text-slate-900">Default Detergent Preference</h3>
          </div>
          {savedSuccess && (
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500">
          This will automatically be selected whenever you schedule a new pickup:
        </p>

        <div className="space-y-2">
          {DETERGENT_OPTIONS.map((det) => (
            <div
              key={det.id}
              onClick={() => handleUpdateDetergent(det.name)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                detergentChoice === det.name
                  ? 'border-blue-600 bg-blue-50/70'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{det.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{det.description}</p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    detergentChoice === det.name
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {detergentChoice === det.name && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Addresses Manager */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-xs text-slate-900">Saved Addresses</h3>
          </div>
          <button
            onClick={() => setShowAddAddress(!showAddAddress)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>

        {/* Add Address Form */}
        {showAddAddress && (
          <form
            onSubmit={handleSaveAddress}
            className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-xs animate-in fade-in"
          >
            <div className="flex gap-2">
              {['Home', 'Office', 'Apartment'].map((lbl) => (
                <button
                  type="button"
                  key={lbl}
                  onClick={() => setNewLabel(lbl)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium border ${
                    newLabel === lbl ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>

            <input
              type="text"
              required
              placeholder="Street Address, Apt / Suite..."
              value={newStreet}
              onChange={(e) => setNewStreet(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
            />
            <input
              type="text"
              required
              placeholder="City, State, ZIP..."
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
            />

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddAddress(false)}
                className="px-3 py-1.5 text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 text-white rounded-xl font-bold"
              >
                Save Address
              </button>
            </div>
          </form>
        )}

        {/* Address Cards */}
        <div className="space-y-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{addr.label}</span>
                  {addr.is_default && (
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.2 rounded-md">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-slate-600">{addr.street}</p>
                <p className="text-slate-400 text-[11px]">{addr.city}</p>
              </div>

              {addresses.length > 1 && (
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Customer Support & Owner Contact */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-xs text-slate-900">Customer Service & Owner</h3>
        </div>

        <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Elsie Kaburu</h4>
              <p className="text-[11px] text-blue-700 font-medium">Owner & Customer Support Lead</p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Available 7 Days
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <a
              href="tel:+254796896239"
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Helpline</span>
            </a>
            <a
              href="mailto:Elsierichard76@gmail.com"
              className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>Email Elsie</span>
            </a>
          </div>

          <div className="pt-2 border-t border-blue-100/80 flex flex-col gap-1 text-[11px] text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Direct Phone:</span>
              <span className="font-bold text-slate-900">+254 796 896 239</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Official Email:</span>
              <span className="font-bold text-slate-900 truncate">Elsierichard76@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <button
        onClick={onLogout}
        className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-rose-200 shadow-xs"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out of Account</span>
      </button>
    </div>
  );
};
