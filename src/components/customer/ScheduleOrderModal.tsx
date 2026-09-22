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
  CreditCard,
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
import { store, DETERGENT_OPTIONS } from '../../services/store';
import { User, OrderItem, PaymentMethod, LaundryCatalogItem } from '../../types';

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
  const [step, setStep] = useState<'items' | 'schedule' | 'detergent' | 'payment' | 'success'>('items');

  // Order Items State
  const [selectedItems, setSelectedItems] = useState<
    { item_type: string; quantity: number; care_notes: string; price: number }[]
  >(
    initialItems || [
      { item_type: 'Wash & Fold (Bag)', quantity: 1, care_notes: 'Standard cold wash', price: 650 },
      { item_type: 'Dress Shirt (Launder & Press)', quantity: 2, care_notes: 'Hang dry, light starch', price: 150 },
    ]
  );

  const [activeCareNotesIndex, setActiveCareNotesIndex] = useState<number | null>(null);

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

  // Detergent preference (default saved on profile, editable per order)
  const [detergentChoice, setDetergentChoice] = useState(
    currentUser.default_detergent || DETERGENT_OPTIONS[0].name
  );

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [mpesaConfirmationCode, setMpesaConfirmationCode] = useState('');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [createdOrderId, setCreatedOrderId] = useState<string>('');

  if (!isOpen) return null;

  // Price calculations in KES
  const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 200 : 0;
  const totalAmount = Math.round(subtotal + deliveryFee);

  const handleUpdateItemQuantity = (catalogName: string, price: number, delta: number) => {
    setSelectedItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.item_type === catalogName);
      if (existingIndex > -1) {
        const newQty = prev[existingIndex].quantity + delta;
        if (newQty <= 0) {
          return prev.filter((_, idx) => idx !== existingIndex);
        }
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      } else if (delta > 0) {
        return [...prev, { item_type: catalogName, quantity: 1, care_notes: '', price }];
      }
      return prev;
    });
  };

  const handleUpdateCareNote = (index: number, note: string) => {
    setSelectedItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], care_notes: note };
      return updated;
    });
  };

  const handleSubmitOrder = async () => {
    if (selectedItems.length === 0) return;
    if (paymentMethod === 'mpesa' && !mpesaConfirmationCode.trim()) return;

    const order = await store.createOrder({
      customer: currentUser,
      pickup_address: pickupAddress,
      dropoff_address: sameAsPickup ? pickupAddress : dropoffAddress,
      pickup_window: pickupWindow,
      dropoff_window: dropoffWindow,
      items: selectedItems as OrderItem[],
      detergent_choice: detergentChoice,
      payment_method: paymentMethod,
      mpesa_confirmation_code: paymentMethod === 'mpesa' ? mpesaConfirmationCode.trim() : undefined,
    });

    setCreatedOrderId(order.id);
    setStep('success');
  };

  const getItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shirt':
        return <Shirt className="w-5 h-5 text-blue-600" />;
      case 'Scissors':
        return <Scissors className="w-5 h-5 text-indigo-600" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-purple-600" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-teal-600" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5 text-rose-500" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-amber-600" />;
      case 'Feather':
        return <Feather className="w-5 h-5 text-emerald-600" />;
      default:
        return <Shirt className="w-5 h-5 text-blue-600" />;
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
                {step === 'detergent' && 'Step 3 of 4: Detergent Preferences'}
                {step === 'payment' && 'Step 4 of 4: Pay & Submit Confirmation'}
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
              <span>{selectedItems.reduce((s, i) => s + i.quantity, 0)} Items Added</span>
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
                  Laundry Menu & Unit Pricing (KES)
                </span>
                <span className="text-[11px] text-blue-600 font-medium">Add special care notes below</span>
              </div>

              <div className="space-y-2.5">
                {catalog.map((item) => {
                  const currentSelected = selectedItems.find((i) => i.item_type === item.name);
                  const qty = currentSelected ? currentSelected.quantity : 0;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        qty > 0
                          ? 'border-blue-500/80 bg-blue-50/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                            {getItemIcon(item.icon)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                              {item.popular && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.2 rounded-full">
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">
                              KSh {item.unit_price.toLocaleString()} {item.unit_label}
                            </p>
                          </div>
                        </div>

                        {/* Stepper Buttons */}
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(item.name, item.unit_price, -1)}
                            disabled={qty === 0}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${
                              qty > 0 ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'text-slate-300'
                            }`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-900">{qty}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(item.name, item.unit_price, 1)}
                            className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center text-xs transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Care note preview / expander if item selected */}
                      {qty > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-blue-100/80">
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={currentSelected?.care_notes || ''}
                              onChange={(e) => {
                                const idx = selectedItems.findIndex((i) => i.item_type === item.name);
                                if (idx > -1) handleUpdateCareNote(idx, e.target.value);
                              }}
                              placeholder="Special care notes: e.g. delicate spin, cold water, no dryer..."
                              className="w-full text-[11px] bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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

          {/* STEP 3: DETERGENT PREFERENCE */}
          {step === 'detergent' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">
                  Select Wash Formula & Detergent
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Default loaded from your profile preferences. You can customize this order's cycle:
              </p>

              <div className="space-y-2.5">
                {DETERGENT_OPTIONS.map((det) => (
                  <div
                    key={det.id}
                    onClick={() => setDetergentChoice(det.name)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      detergentChoice === det.name
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
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
          )}

          {/* STEP 4: PAYMENT & REVIEW */}
          {step === 'payment' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900">Order Summary</h4>
                {selectedItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600">
                    <span>
                      {item.quantity}x {item.item_type}
                    </span>
                    <span className="font-medium">KSh {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-2 flex justify-between text-slate-500">
                  <span>Delivery & Pickup Fee (Nairobi)</span>
                  <span>KSh {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-sm text-blue-700">
                  <span>Total Due</span>
                  <span>KSh {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Methods (M-Pesa, Card, Cash) */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">Select Payment Method</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mpesa')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'mpesa'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                      M
                    </div>
                    <span>M-Pesa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>Pay at Pickup</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'mpesa' && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center text-emerald-900 font-semibold">
                    <span>Pay with M-Pesa</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      Manual confirmation
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-semibold">
                    Send <span className="font-extrabold">KSh {totalAmount.toLocaleString()}</span> to:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white border border-emerald-200 rounded-lg p-2">
                      <span className="block text-[10px] text-emerald-700 uppercase font-bold">Paybill</span>
                      <span className="text-base font-extrabold text-emerald-950">522533</span>
                    </div>
                    <div className="bg-white border border-emerald-200 rounded-lg p-2">
                      <span className="block text-[10px] text-emerald-700 uppercase font-bold">Account</span>
                      <span className="text-base font-extrabold text-emerald-950">7986811</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    After paying, enter the M-Pesa confirmation code from the SMS below. Your order will stay awaiting confirmation until an admin verifies the payment.
                  </p>
                  <input
                    type="text"
                    value={mpesaConfirmationCode}
                    onChange={(e) => setMpesaConfirmationCode(e.target.value.toUpperCase())}
                    placeholder="e.g. QHX7ABC123"
                    className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-700 font-semibold">
                    <span>Card Number</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Stub Payment
                    </span>
                  </div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              )}
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
                  Payment received for review. Your order is awaiting confirmation while our admin verifies the M-Pesa payment. Pickup window:{' '}
                  <span className="font-semibold text-slate-700">{pickupWindow}</span>
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-left text-xs max-w-xs mx-auto space-y-1">
                <div className="flex justify-between font-semibold text-blue-900">
                  <span>Pickup Window:</span>
                  <span>{pickupWindow.split('(')[0]}</span>
                </div>
                <div className="flex justify-between text-blue-800">
                  <span>Detergent Choice:</span>
                  <span className="truncate max-w-[150px]">{detergentChoice}</span>
                </div>
                <div className="flex justify-between font-bold text-blue-950 border-t border-blue-200 pt-1">
                  <span>Total:</span>
                  <span>KSh {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-800 font-bold border-t border-blue-200 pt-1">
                  <span>Payment:</span>
                  <span>Awaiting confirmation</span>
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
                  if (step === 'detergent') setStep('schedule');
                  if (step === 'payment') setStep('detergent');
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
                disabled={selectedItems.length === 0}
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
                onClick={() => setStep('detergent')}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <span>Choose Detergent</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 'detergent' && (
              <button
                type="button"
                onClick={() => setStep('payment')}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 'payment' && (
              <button
                type="button"
                disabled={paymentMethod === 'mpesa' && !mpesaConfirmationCode.trim()}
                onClick={handleSubmitOrder}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                  <span>Submit Payment KSh {totalAmount.toLocaleString()}</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
