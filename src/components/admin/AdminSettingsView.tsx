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

  // Editing state for pricing
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  // Adding new item state
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'Everyday' | 'Apparel' | 'Bedding' | 'Delicates'>('Apparel');
  const [newPrice, setNewPrice] = useState<number>(300);
  const [newUnitLabel, setNewUnitLabel] = useState('each');

  // Business Location form state
  const [facilityAddress, setFacilityAddress] = useState(business.facilityAddress);
  const [businessPhone, setBusinessPhone] = useState(business.phone);
  const [businessEmail, setBusinessEmail] = useState(business.email);
  const [operatingHours, setOperatingHours] = useState(business.hours);
  const [deliveryFee, setDeliveryFee] = useState(business.deliveryFee);
  const [generalLaundryRate, setGeneralLaundryRate] = useState(business.generalLaundryRate);
  const [ironingRate, setIroningRate] = useState(business.ironingRate);
  const [minimumLaundryCharge, setMinimumLaundryCharge] = useState(business.minimumLaundryCharge);
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
  }, [business]);

  const handleStartEditPrice = (item: LaundryCatalogItem) => {
    setEditingPriceId(item.id);
    setTempPrice(item.unit_price);
  };

  const handleSavePrice = (id: string) => {
    store.updateCatalogItemPrice(id, tempPrice);
    setEditingPriceId(null);
  };

  const handleAddNewServiceItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    store.addCatalogItem({
      name: newName.trim(),
      category: newCategory,
      unit_price: Number(newPrice),
      unit_label: newUnitLabel,
      icon: 'Shirt',
      popular: false,
    });

    setNewName('');
    setShowAddItemModal(false);
  };

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
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
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

      {/* 1. SERVICE PRICING MANAGEMENT */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Laundry Service Pricing</h3>
              <p className="text-[11px] text-slate-500">
                Set customer rates per item or weight category
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddItemModal(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Service</span>
          </button>
        </div>

        {/* Catalog Items List */}
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
          {catalog.map((item) => (
            <div
              key={item.id}
              className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50/80 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900">{item.name}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">{item.unit_label}</p>
              </div>

              {/* Price Modifier */}
              <div className="flex items-center gap-2">
                {editingPriceId === item.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-500">KSh</span>
                    <input
                      type="number"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-xs font-bold border-2 border-blue-500 rounded-lg outline-none text-slate-900"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSavePrice(item.id)}
                      className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:scale-95 transition-all"
                      title="Save Price"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                      KSh {item.unit_price.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStartEditPrice(item)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Adjust Price"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
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

      {/* Modal for Adding New Laundry Service Item */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Add New Laundry Service Item</h3>
              <button
                type="button"
                onClick={() => setShowAddItemModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewServiceItem} className="space-y-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Leather Jacket / Curtains"
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Everyday">Everyday</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Bedding">Bedding</option>
                  <option value="Delicates">Delicates</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
                    Price (KSh)
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
                    Unit Label
                  </label>
                  <input
                    type="text"
                    value={newUnitLabel}
                    onChange={(e) => setNewUnitLabel(e.target.value)}
                    placeholder="e.g. each / per set"
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
