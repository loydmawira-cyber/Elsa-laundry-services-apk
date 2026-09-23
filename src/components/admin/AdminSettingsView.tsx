import React, { useState, useEffect } from 'react';
import {
  Tag,
  MapPin,
  Clock,
  Phone,
  Mail,
  Truck,
  Plus,
  Edit2,
  Check,
  Save,
  DollarSign,
  Sparkles,
  Building,
} from 'lucide-react';
import { store, DEFAULT_BUSINESS_SETTINGS } from '../../services/store';
import { LaundryCatalogItem } from '../../types';
import { User } from '../../types';
import { PinSettings } from '../PinSecurity';

interface AdminSettingsViewProps {
  catalog: LaundryCatalogItem[];
  businessSettings: typeof DEFAULT_BUSINESS_SETTINGS;
  currentUser: User;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({ catalog, businessSettings: business, currentUser }) => {

  // Business Location form state
  const [facilityAddress, setFacilityAddress] = useState(business.facilityAddress);
  const [businessPhone, setBusinessPhone] = useState(business.phone);
  const [businessEmail, setBusinessEmail] = useState(business.email);
  const [operatingHours, setOperatingHours] = useState(business.hours);
  const [deliveryFee, setDeliveryFee] = useState(business.deliveryFee);
  const [generalLaundryRate, setGeneralLaundryRate] = useState(business.generalLaundryRate);
  const [ironingRate, setIroningRate] = useState(business.ironingRate);
  const [minimumLaundryCharge, setMinimumLaundryCharge] = useState(business.minimumLaundryCharge);
  const [specialRates, setSpecialRates] = useState<Record<string, number>>(business.specialItemRates || {});
  const [specialLabels, setSpecialLabels] = useState<Record<string, string>>(business.specialItemLabels || {});
  const [newSpecialLabel, setNewSpecialLabel] = useState('');
  const [newSpecialRate, setNewSpecialRate] = useState(0);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Keep the location/contact form in sync if business settings change
  // elsewhere (e.g. another admin session, or the initial Firestore load
  // arriving after the local defaults were used for the first render).
  useEffect(() => {
    setFacilityAddress(business.facilityAddress);
    setBusinessPhone(business.phone);
    setBusinessEmail(business.email);
    setOperatingHours(business.hours);
    setDeliveryFee(business.deliveryFee);
    setGeneralLaundryRate(business.generalLaundryRate);
    setIroningRate(business.ironingRate);
    setMinimumLaundryCharge(business.minimumLaundryCharge);
    setSpecialRates(business.specialItemRates || {});
    setSpecialLabels(business.specialItemLabels || {});
  }, [business]);

  const handleSaveBusinessSettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateBusinessSettings({
      facilityAddress,
      phone: businessPhone,
      email: businessEmail,
      hours: operatingHours,
      deliveryFee: Number(deliveryFee),
      generalLaundryRate: Number(generalLaundryRate),
      ironingRate: Number(ironingRate),
      minimumLaundryCharge: Number(minimumLaundryCharge),
      specialItemRates: specialRates,
      specialItemLabels: specialLabels,
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleSavePricing = () => {
    store.updateBusinessSettings({
      generalLaundryRate: Number(generalLaundryRate),
      ironingRate: Number(ironingRate),
      minimumLaundryCharge: Number(minimumLaundryCharge),
      specialItemRates: specialRates,
      specialItemLabels: specialLabels,
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleDeleteSpecialService = (key: string) => {
    const nextRates = { ...specialRates };
    const nextLabels = { ...specialLabels };
    delete nextRates[key];
    delete nextLabels[key];
    setSpecialRates(nextRates);
    setSpecialLabels(nextLabels);
  };

  const handleAddSpecialService = () => {
    const label = newSpecialLabel.trim();
    if (!label || newSpecialRate <= 0) return;
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || `special_${Date.now()}`;
    setSpecialLabels((prev) => ({ ...prev, [key]: label }));
    setSpecialRates((prev) => ({ ...prev, [key]: Number(newSpecialRate) }));
    setNewSpecialLabel('');
    setNewSpecialRate(0);
  };

  return (
    <div className="flex-1 p-4 space-y-5 pb-24 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            Admin Configuration
          </span>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Service Pricing & Business Location
          </h2>
          <p className="text-xs text-slate-500">
            Adjust service rates, facility location address, contact info & operating hours
          </p>
        </div>
      </div>

      {/* 1. CURRENT PRICING MODEL */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Current Laundry Pricing</h3>
            <p className="text-[11px] text-slate-500">Prices are based on weight and actual sorting, not old catalog items.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700">
          <span>General: KSh 100/kg</span>
          <span>Ironing: KSh 130/kg</span>
          <span>Minimum: KSh 500</span>
          <span>Special items: sorted separately</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Weight-Based Laundry Rates</h3>
          <p className="text-[11px] text-slate-500">These rates calculate estimates and final sorted prices.</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <label className="text-[10px] font-bold text-slate-700">General / kg<input type="number" value={generalLaundryRate} onChange={(e) => setGeneralLaundryRate(Number(e.target.value))} className="mt-1 w-full p-2 border border-slate-200 rounded-lg text-xs" /></label>
          <label className="text-[10px] font-bold text-slate-700">Ironing / kg<input type="number" value={ironingRate} onChange={(e) => setIroningRate(Number(e.target.value))} className="mt-1 w-full p-2 border border-slate-200 rounded-lg text-xs" /></label>
          <label className="text-[10px] font-bold text-slate-700">Minimum<input type="number" value={minimumLaundryCharge} onChange={(e) => setMinimumLaundryCharge(Number(e.target.value))} className="mt-1 w-full p-2 border border-slate-200 rounded-lg text-xs" /></label>
        </div>
        <p className="text-[10px] text-slate-500">Special-item rates are applied separately during sorting: shoes, duvets, suits, gowns, curtains, and jackets.</p>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Special Services & Prices</h3>
            <p className="text-[11px] text-slate-500">These prices appear on Customer Home and are used after sorting.</p>
          </div>
          <button type="button" onClick={handleSavePricing} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold">Save Prices</button>
        </div>
        <div className="space-y-2">
          {Object.entries(specialLabels).map(([key, label]) => (
            <div key={key} className="grid grid-cols-[1fr_90px_32px] gap-2 items-center">
              <input value={label} onChange={(e) => setSpecialLabels((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" />
              <input type="number" min="0" value={specialRates[key] ?? ''} onChange={(e) => setSpecialRates((prev) => ({ ...prev, [key]: Math.max(0, Number(e.target.value)) }))} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold" />
              <button type="button" onClick={() => handleDeleteSpecialService(key)} title="Delete service" className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"><span aria-hidden="true">×</span></button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[1fr_90px_auto] gap-2 pt-2 border-t border-slate-100">
          <input value={newSpecialLabel} onChange={(e) => setNewSpecialLabel(e.target.value)} placeholder="New service name" className="p-2 border border-slate-200 rounded-lg text-xs" />
          <input type="number" min="1" value={newSpecialRate || ''} onChange={(e) => setNewSpecialRate(Number(e.target.value))} placeholder="Price" className="p-2 border border-slate-200 rounded-lg text-xs" />
          <button type="button" onClick={handleAddSpecialService} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold">Add</button>
        </div>
        {isSavedNotice && <p className="text-[11px] text-emerald-700 font-bold">Pricing saved and customer display updated.</p>}
      </div>

      {/* 2. BUSINESS LOCATION & FACILITY SETTINGS */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 font-extrabold flex items-center justify-center">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Business Location & Contact Info</h3>
            <p className="text-[11px] text-slate-500">
              Facility HQ, operating hours & customer contact settings
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBusinessSettings} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Main Facility Address (Hub)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={facilityAddress}
                onChange={(e) => setFacilityAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Facility address in Nairobi"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Support Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Support Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Facility Operating Hours
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Standard Delivery Fee (KSh)
              </label>
              <div className="relative">
                <Truck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {isSavedNotice ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> Business settings saved successfully!
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                All changes immediately update client schedules and invoices
              </span>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Location & Info</span>
            </button>
          </div>
        </form>
      </div>

      <PinSettings user={currentUser} />

    </div>
  );
};
