import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  MapPin,
  Calendar,
  Clock,
  Shirt,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Scissors,
  Layers,
  HeartHandshake,
  Shield,
  Feather,
  ArrowRight,
  Info,
} from 'lucide-react';
import { store, SOFTENER_OPTIONS, calculateLaundryPrice, SPECIAL_ITEM_LABELS } from '../../services/store';
import { User, OrderItem, LaundryCatalogItem } from '../../types';

interface ScheduleOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  catalog: LaundryCatalogItem[];
  onOrderCreated: (orderId: string) => void;
  initialItems?: { item_type: string; quantity: number; care_notes: string; price: number }[];
}

export const ScheduleOrderModal: React.FC<ScheduleOrderModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  catalog,
  onOrderCreated,
  initialItems,
}) => {
  const [step, setStep] = useState<'items' | 'schedule' | 'softener' | 'payment' | 'success'>('items');

  // Address & Timing
  const savedAddresses = store.getAddresses(currentUser.id);
  const activeLocation = store.getLocation();
  const defaultAddr = savedAddresses.find((a) => a.is_default) || savedAddresses[0];
  const initialAddress = activeLocation.street
    ? `${activeLocation.street}, ${activeLocation.city}`
    : defaultAddr
    ? `${defaultAddr.street}, ${defaultAddr.city}`
    : 'Dennis Pritt Road, Kilimani, Nairobi, Kenya';

  const [pickupAddress, setPickupAddress] = useState(initialAddress);
  const [dropoffAddress, setDropoffAddress] = useState(initialAddress);
  const [sameAsPickup, setSameAsPickup] = useState(true);

  // Windows
  const [pickupWindow, setPickupWindow] = useState('Tomorrow, 8:00 AM - 10:00 AM');
  const [dropoffWindow, setDropoffWindow] = useState('Day After Tomorrow, 4:00 PM - 6:00 PM');

  // Softener preference (default saved on profile, editable per order)
  const [softenerChoice, setSoftenerChoice] = useState(
    currentUser.default_softener || SOFTENER_OPTIONS[0].name
  );

  // Garment breakdown with per-item care notes
  type GarmentLine = { key: string; item_type: string; quantity: number; care_notes: string };
  const [garments, setGarments] = useState<GarmentLine[]>(() =>
    (initialItems || [])
      .filter((it) => it.item_type !== 'Laundry pricing request')
      .map((it, i) => ({ key: `init-${i}`, item_type: it.item_type, quantity: it.quantity, care_notes: it.care_notes || '' }))
  );
  const [customGarment, setCustomGarment] = useState('');

  const addGarment = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setGarments((prev) => {
      const existing = prev.find((g) => g.item_type.toLowerCase() === clean.toLowerCase());
      if (existing) {
        return prev.map((g) => (g.key === existing.key ? { ...g, quantity: g.quantity + 1 } : g));
      }
      return [...prev, { key: `g-${Date.now()}-${prev.length}`, item_type: clean, quantity: 1, care_notes: '' }];
    });
  };
  const updateGarment = (key: string, patch: Partial<GarmentLine>) =>
    setGarments((prev) => prev.map((g) => (g.key === key ? { ...g, ...patch } : g)));
  const removeGarment = (key: string) => setGarments((prev) => prev.filter((g) => g.key !== key));
  const totalPieces = garments.reduce((n, g) => n + g.quantity, 0);

  // Payment
  const [mpesaConfirmationCode, setMpesaConfirmationCode] = useState('');
  const [generalKg, setGeneralKg] = useState<number | ''>('');
  const [ironingRequested, setIroningRequested] = useState(false);
  const [specialItems, setSpecialItems] = useState<Record<string, number>>({});
  const [createdOrderId, setCreatedOrderId] = useState<string>('');
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  // Price calculations in KES
  const liveBusinessSettings = store.getBusinessSettings();
  const generalKgValue = generalKg === '' ? 0 : generalKg;
  const subtotal = calculateLaundryPrice({ generalKg: generalKgValue, ironing: ironingRequested, specialItems, settings: liveBusinessSettings });
  const deliveryFee = liveBusinessSettings.deliveryFee;
  const totalAmount = Math.round(subtotal + deliveryFee);

  const handleSubmitOrder = async () => {
    if (generalKgValue <= 0 && Object.values(specialItems).every((quantity) => Number(quantity) <= 0)) return;

    setSubmitError('');
    try {
      const order = await store.createOrder({
        customer: currentUser,
        pickup_address: pickupAddress,
        dropoff_address: sameAsPickup ? pickupAddress : dropoffAddress,
        pickup_window: pickupWindow,
        dropoff_window: dropoffWindow,
        items:
          garments.length > 0
            ? garments.map((g) => ({ item_type: g.item_type, quantity: g.quantity, care_notes: g.care_notes.trim(), price: 0 } as OrderItem))
            : [{ item_type: 'Laundry pricing request', quantity: 1, care_notes: 'Final sorting and pricing at facility', price: 0 } as OrderItem],
        softener_choice: softenerChoice,
        payment_method: 'mpesa',
        estimated_general_kg: generalKgValue,
        ironing_requested: ironingRequested,
        special_item_quantities: specialItems,
      });

      setCreatedOrderId(order.id);
      setStep('success');
    } catch (error) {
      console.error('Order submission failed:', error);
      setSubmitError('The order could not be saved. Please check your connection and try again.');
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="schedule-order-sheet"
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Schedule Laundry Pickup</h3>
              <p className="text-[11px] text-slate-300">
                {step === 'items' && 'Step 1 of 4: Select Garments & Care'}
                {step === 'schedule' && 'Step 2 of 4: Pick Windows & Address'}
                {step === 'softener' && 'Step 3 of 4: Softener Preference'}
                {step === 'payment' && 'Step 4 of 4: Review Estimate'}
                {step === 'success' && 'Order Confirmed!'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Running Price Tracker Header Bar */}
        {step !== 'success' && (
          <div className="bg-blue-50/80 px-5 py-2.5 border-b border-blue-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
              <span>New pricing model</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Running Total:</span>
              <span className="font-extrabold text-blue-700 text-sm">
                KSh {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* STEP 1: ITEMS SELECTION */}
          {step === 'items' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Laundry Estimate
                </span>
                <span className="text-[11px] text-blue-600 font-medium">Final price is set after sorting</span>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-3">
                <div>
                  <label className="text-xs font-bold text-blue-950">Estimated general laundry weight (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={generalKg}
                    onChange={(e) => setGeneralKg(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="mt-1 w-full p-2.5 bg-white border border-blue-200 rounded-xl text-xs font-bold"
                  />
                  <p className="text-[10px] text-blue-700 mt-1">Below 5 kg, general laundry is charged at the KSh 500 minimum.</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-blue-950">
                  <input type="checkbox" checked={ironingRequested} onChange={(e) => setIroningRequested(e.target.checked)} className="rounded text-blue-600" />
                  Include ironing (KSh 130 per kg)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(liveBusinessSettings.specialItemLabels || SPECIAL_ITEM_LABELS).map(([key, label]) => (
                    <label key={key} className="text-[10px] font-bold text-blue-950">
                      {label}
                      <input
                        type="number"
                        min="0"
                        value={specialItems[key] ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSpecialItems((prev) => {
                            const next = { ...prev };
                            if (value === '') delete next[key];
                            else next[key] = Math.max(0, Number(value));
                            return next;
                          });
                        }}
                        placeholder="0"
                        className="mt-1 w-full p-2 bg-white border border-blue-200 rounded-lg text-xs"
                      />
                    </label>
                  ))}
                </div>
                <div className="pt-2 border-t border-blue-200 flex justify-between text-sm font-extrabold text-blue-950">
                  <span>Estimated total including delivery</span>
                  <span>KSh {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Garments & care notes */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900">Your garments &amp; care notes</label>
                  <span className="text-[10px] font-bold text-slate-500">{totalPieces} pieces</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  List what you are sending so you can see every item on your order. Tap to add, then include any care note.
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {catalog.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => addGarment(c.name)}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-full text-[11px] font-semibold text-slate-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      {c.name}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customGarment}
                    onChange={(e) => setCustomGarment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addGarment(customGarment);
                        setCustomGarment('');
                      }
                    }}
                    placeholder="Other item (e.g. School uniform)"
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addGarment(customGarment);
                      setCustomGarment('');
                    }}
                    className="px-3 bg-slate-900 text-white rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>

                {garments.length > 0 && (
                  <div className="space-y-2">
                    {garments.map((g) => (
                      <div key={g.key} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-800 flex-1">{g.item_type}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              aria-label={`Decrease ${g.item_type}`}
                              onClick={() => (g.quantity <= 1 ? removeGarment(g.key) : updateGarment(g.key, { quantity: g.quantity - 1 }))}
                              className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-extrabold w-5 text-center">{g.quantity}</span>
                            <button
                              type="button"
                              aria-label={`Increase ${g.item_type}`}
                              onClick={() => updateGarment(g.key, { quantity: g.quantity + 1 })}
                              className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              aria-label={`Remove ${g.item_type}`}
                              onClick={() => removeGarment(g.key)}
                              className="w-6 h-6 rounded-full text-slate-400 hover:text-red-600 flex items-center justify-center"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={g.care_notes}
                          onChange={(e) => updateGarment(g.key, { care_notes: e.target.value })}
                          placeholder="Care note (e.g. cold wash, no bleach, stain on collar)"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-[11px]"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* STEP 2: ADDRESS & WINDOWS */}
          {step === 'schedule' && (
            <div className="space-y-4">
              {/* Pickup Address */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    Pickup Address
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const loc = store.getLocation();
                      if (loc.street) {
                        const fullAddr = `${loc.street}, ${loc.area}, ${loc.city}`;
                        setPickupAddress(fullAddr);
                        if (sameAsPickup) setDropoffAddress(fullAddr);
                      }
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Use Current Exact GPS</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Street Address, Apt / Unit, City, Zip"
                />
              </div>

              {/* Dropoff Address */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Delivery / Dropoff Address
                  </label>
                  <label className="flex items-center gap-1 text-[11px] text-blue-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsPickup}
                      onChange={(e) => setSameAsPickup(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Same as pickup</span>
                  </label>
                </div>
                {!sameAsPickup && (
                  <input
                    type="text"
                    value={dropoffAddress}
                    onChange={(e) => setDropoffAddress(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dropoff street address..."
                  />
                )}
              </div>

              {/* Pickup Time Window */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Pickup Date & Time Window
                </label>
                <select
                  value={pickupWindow}
                  onChange={(e) => setPickupWindow(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Tomorrow, 8:00 AM - 10:00 AM (Early Morning)</option>
                  <option>Tomorrow, 11:00 AM - 1:00 PM (Midday)</option>
                  <option>Tomorrow, 4:00 PM - 6:00 PM (Evening)</option>
                  <option>Day After Tomorrow, 9:00 AM - 11:00 AM</option>
                  <option>Day After Tomorrow, 2:00 PM - 4:00 PM</option>
                </select>
              </div>

              {/* Delivery Window */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Delivery Date & Time Window (Turnaround)
                </label>
                <select
                  value={dropoffWindow}
                  onChange={(e) => setDropoffWindow(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Day After Tomorrow, 4:00 PM - 6:00 PM (Standard 24h)</option>
                  <option>Day After Tomorrow, 6:00 PM - 8:00 PM</option>
                  <option>In 3 Days, 10:00 AM - 12:00 PM</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: SOFTENER PREFERENCE */}
          {step === 'softener' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">
                  Would you like fabric softener?
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Loaded from your profile preference. You can change it for this order:
              </p>

              <div className="space-y-2.5">
                {SOFTENER_OPTIONS.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setSoftenerChoice(opt.name)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      softenerChoice === opt.name
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{opt.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{opt.description}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          softenerChoice === opt.name
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {softenerChoice === opt.name && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT & REVIEW */}
          {step === 'payment' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900">Estimated Order Summary</h4>
                <div className="flex justify-between text-slate-600">
                  <span>General laundry estimate</span>
                  <span className="font-medium">{generalKgValue} kg {ironingRequested ? '(with ironing)' : ''}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Special items</span>
                  <span className="font-medium">{Object.values(specialItems).reduce((sum, quantity) => Number(sum) + Number(quantity), 0)} units/kg</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Softener</span>
                  <span className="font-medium">{softenerChoice}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-slate-500">
                  <span>Delivery & Pickup Fee (Nairobi)</span>
                  <span>KSh {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-sm text-blue-700">
                  <span>Total Due</span>
                  <span>KSh {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">Garments &amp; Care Notes</h4>
                  <span className="text-[10px] font-bold text-slate-500">{totalPieces} pieces</span>
                </div>
                {garments.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No individual garments listed. Items will be counted at sorting.</p>
                ) : (
                  garments.map((g) => (
                    <div key={g.key} className="p-2 bg-white border border-slate-200 rounded-xl">
                      <span className="font-bold text-slate-800">{g.quantity}x {g.item_type}</span>
                      <p className={`text-[11px] mt-0.5 ${g.care_notes ? 'text-amber-700' : 'text-slate-400 italic'}`}>
                        {g.care_notes ? `Care note: ${g.care_notes}` : 'Standard wash'}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>Do not pay yet.</strong> This is an estimate. Elsa Laundry will sort and weigh your laundry, then send the final amount for your approval before M-Pesa payment.
              </div>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {step === 'success' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Order #{createdOrderId} Placed!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Your order request was received. Elsa Laundry will sort and weigh the laundry, then send you the final price for approval. Pickup window:{' '}
                  <span className="font-semibold text-slate-700">{pickupWindow}</span>
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-left text-xs max-w-xs mx-auto space-y-1">
                <div className="flex justify-between font-semibold text-blue-900">
                  <span>Pickup Window:</span>
                  <span>{pickupWindow.split('(')[0]}</span>
                </div>
                <div className="flex justify-between text-blue-800">
                  <span>Softener:</span>
                  <span className="truncate max-w-[150px]">{softenerChoice}</span>
                </div>
                <div className="flex justify-between text-blue-800">
                  <span>Garments:</span>
                  <span>{totalPieces > 0 ? `${totalPieces} pieces` : 'Counted at sorting'}</span>
                </div>
                <div className="flex justify-between font-bold text-blue-950 border-t border-blue-200 pt-1">
                  <span>Estimated total:</span>
                  <span>KSh {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-800 font-bold border-t border-blue-200 pt-1">
                  <span>Next step:</span>
                  <span>Awaiting sorting</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onOrderCreated(createdOrderId);
                  onClose();
                }}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
              >
                Track Live Order Status
              </button>
            </div>
          )}
        </div>

        {/* Bottom Navigation Buttons */}
        {step !== 'success' && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            {step !== 'items' ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 'schedule') setStep('items');
                  if (step === 'softener') setStep('schedule');
                  if (step === 'payment') setStep('softener');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Back
              </button>
            ) : (
              <span />
            )}

            {step === 'items' && (
              <button
                type="button"
                disabled={generalKgValue <= 0 && Object.values(specialItems).every((quantity) => Number(quantity) <= 0)}
                onClick={() => setStep('schedule')}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <span>Continue to Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 'schedule' && (
              <button
                type="button"
                onClick={() => setStep('softener')}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <span>Choose Softener</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 'softener' && (
              <button
                type="button"
                onClick={() => setStep('payment')}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <span>Review Estimate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 'payment' && (
              <div className="flex flex-col items-end gap-2">
                {submitError && <p className="text-[10px] text-red-600 font-semibold max-w-[190px] text-right">{submitError}</p>}
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <span>Submit Order Request</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
