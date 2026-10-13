import React, { useState } from 'react';
import {
  Package,
  Truck,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  AlertCircle,
  RotateCcw,
  Navigation,
  Shirt,
  ShieldCheck,
  ChevronRight,
  Camera,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { store, DEFAULT_BUSINESS_SETTINGS, SPECIAL_ITEM_LABELS } from '../../services/store';

interface TrackOrderViewProps {
  orders: Order[];
  businessSettings: typeof DEFAULT_BUSINESS_SETTINGS;
  selectedOrderId?: string;
  onSelectOrder: (orderId: string) => void;
  onOpenSchedule: () => void;
}

const STEP_DEFINITIONS: {
  status: OrderStatus;
  label: string;
  subtext: string;
  icon: string;
}[] = [
  { status: 'scheduled', label: 'Scheduled', subtext: 'Order placed & courier queued', icon: 'Clock' },
  { status: 'picked_up', label: 'Picked Up', subtext: 'Driver collected laundry bags', icon: 'Truck' },
  { status: 'at_facility', label: 'At Facility', subtext: 'Arrived at hub & queued for washing', icon: 'MapPin' },
  { status: 'washing', label: 'Washing Cycle', subtext: 'Eco-wash & care active', icon: 'Sparkles' },
  { status: 'ready', label: 'Ready & Packed', subtext: 'Pressed, folded & inspected', icon: 'Package' },
  { status: 'out_for_delivery', label: 'Out for Delivery', subtext: 'Van en route to your address', icon: 'Navigation' },
  { status: 'delivered', label: 'Delivered', subtext: 'Safely dropped at your door', icon: 'CheckCircle2' },
];

export const TrackOrderView: React.FC<TrackOrderViewProps> = ({
  orders,
  businessSettings,
  selectedOrderId,
  onSelectOrder,
  onOpenSchedule,
}) => {
  const [mpesaCode, setMpesaCode] = useState('');
  // Find currently displayed order or default to the most active
  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const targetOrder =
    orders.find((o) => o.id === selectedOrderId) ||
    activeOrders[0] ||
    orders[0];

  if (!targetOrder) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Active Orders</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1 mb-6">
          You don't have any laundry orders in progress. Schedule a pickup in under 60 seconds!
        </p>
        <button
          onClick={onOpenSchedule}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
        >
          Schedule Pickup Now
        </button>
      </div>
    );
  }

  const getStepIndex = (status: OrderStatus) => {
    return STEP_DEFINITIONS.findIndex((s) => s.status === status);
  };

  const currentStepIndex = getStepIndex(targetOrder.status);

  return (
    <div className="flex-1 p-4 space-y-4 pb-20">
      {/* Order Selector Tab if customer has multiple active orders */}
      {orders.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {orders.slice(0, 4).map((o) => (
            <button
              key={o.id}
              onClick={() => onSelectOrder(o.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                targetOrder.id === o.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{o.id}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  o.status === 'delivered' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Status Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Order #{targetOrder.id}
              </h2>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                  targetOrder.status === 'delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : targetOrder.status === 'out_for_delivery'
                    ? 'bg-purple-100 text-purple-800 animate-pulse'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {targetOrder.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled pickup: {targetOrder.pickup_window}
            </p>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Live Visual Step Tracker */}
        <div className="pt-2 pb-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Live Laundry Progress
          </div>

          <div className="relative pl-6 space-y-6">
            {/* Connecting Vertical Track Line */}
            <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-slate-200 -z-0"></div>

            {STEP_DEFINITIONS.map((stepDef, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isFuture = idx > currentStepIndex;

              return (
                <div key={stepDef.status} className="relative flex items-start gap-3">
                  {/* Step Node Pin */}
                  <div
                    className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center z-10 transition-all ${
                      isPast
                        ? 'bg-emerald-500 text-white ring-2 ring-emerald-100'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-bounce'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Step Text Information */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs font-bold ${
                          isCurrent
                            ? 'text-blue-700'
                            : isPast
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {stepDef.label}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full animate-pulse">
                          Current Stage
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{stepDef.subtext}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment confirmation status */}
      {(targetOrder.pricing_status === 'awaiting_customer_approval' || targetOrder.pricing_status === 'approved') && (
        <div className={`rounded-3xl p-4 border shadow-xs space-y-3 ${targetOrder.pricing_status === 'approved' ? 'border-emerald-200 bg-emerald-50' : 'border-indigo-200 bg-indigo-50'}`}>
          <div>
            <h3 className={`text-xs font-extrabold ${targetOrder.pricing_status === 'approved' ? 'text-emerald-900' : 'text-indigo-950'}`}>
              {targetOrder.pricing_status === 'approved' ? 'Final price confirmed' : 'Final price ready for your approval'}
            </h3>
            <p className={`text-[11px] mt-1 ${targetOrder.pricing_status === 'approved' ? 'text-emerald-800' : 'text-indigo-800'}`}>
              {targetOrder.pricing_status === 'approved' ? 'You approved this final sorted price. You can now submit your M-Pesa payment confirmation below.' : 'The laundry has been sorted. Review the actual quantities below, then approve before paying.'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-indigo-950">
            <span>General laundry: <strong>{targetOrder.final_general_kg || 0} kg</strong></span>
            <span>Ironing: <strong>{targetOrder.final_ironing ? 'Yes' : 'No'}</strong></span>
          </div>
          {targetOrder.sorting_notes && <p className="text-[11px] text-indigo-800">Notes: {targetOrder.sorting_notes}</p>}
          <div className="flex items-center justify-between border-t border-indigo-200 pt-2 font-extrabold text-indigo-950">
            <span>Final total</span><span>KSh {Math.round(targetOrder.total_amount).toLocaleString()}</span>
          </div>
          {targetOrder.pricing_status === 'awaiting_customer_approval' ? (
            <button type="button" onClick={() => store.approveFinalPrice(targetOrder.id)} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold">Approve Final Price</button>
          ) : (
            <div className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Final Price Confirmed
            </div>
          )}
        </div>
      )}

      <div className={`rounded-3xl p-4 border shadow-xs ${targetOrder.payment_status === 'paid' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-start gap-3">
          {targetOrder.payment_status === 'paid' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className={`text-xs font-extrabold ${targetOrder.payment_status === 'paid' ? 'text-emerald-900' : 'text-amber-900'}`}>
                Payment {targetOrder.payment_status === 'paid' ? 'confirmed' : 'awaiting confirmation'}
              </h3>
              <span className="text-xs font-extrabold text-slate-900">KSh {Math.round(targetOrder.total_amount).toLocaleString()}</span>
            </div>
            <p className={`text-[11px] mt-1 ${targetOrder.payment_status === 'paid' ? 'text-emerald-800' : 'text-amber-800'}`}>
              {targetOrder.payment_status === 'paid'
                ? 'Your payment was successfully confirmed by Elsa Laundry Services.'
                : targetOrder.pricing_status !== 'approved'
                ? 'Payment opens after Elsa Laundry sends and you approve the final sorted price.'
                : 'Pay the approved amount to Paybill 522533, Account 7986811, then enter your M-Pesa code below.'}
            </p>
            {targetOrder.pricing_status === 'approved' && targetOrder.payment_status !== 'paid' && !targetOrder.mpesa_confirmation_code && (
              <div className="mt-3 space-y-2">
                <input value={mpesaCode} onChange={(e) => setMpesaCode(e.target.value.toUpperCase())} placeholder="M-Pesa confirmation code" className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs" />
                <button type="button" disabled={!mpesaCode.trim()} onClick={() => { store.submitPaymentCode(targetOrder.id, mpesaCode); setMpesaCode(''); }} className="w-full py-2 bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold">Submit Payment Confirmation</button>
              </div>
            )}
            {targetOrder.mpesa_confirmation_code && (
              <p className="text-[10px] text-slate-600 mt-1 font-semibold">M-Pesa code: {targetOrder.mpesa_confirmation_code}</p>
            )}
          </div>
        </div>
      </div>

      {/* Driver Information Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
            {targetOrder.driver_name
              ? targetOrder.driver_name.split(' ').map((n) => n[0]).join('')
              : 'EL'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">
                {targetOrder.driver_name || 'Driver Brian Mwangi'}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-[11px] text-slate-500">
              Dedicated Elsa Laundry Courier • Nairobi Van #4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href="tel:+254712345678"
            title="Call Driver"
            className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
          >
            <Phone className="w-4 h-4" />
          </a>
          <a
            href="sms:+254712345678"
            title="SMS Driver"
            className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Simulated Live Route Map */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>Route Visualizer</span>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            GPS Signal Active
          </span>
        </div>

        {/* Map graphic simulation */}
        <div className="h-32 w-full bg-slate-100 rounded-2xl relative overflow-hidden border border-slate-200 flex items-center justify-center">
          {/* Street grid background */}
          <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px]"></div>

          {/* Animated Route Line */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 40 80 Q 150 20 220 70 T 360 50"
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeDasharray="6 4"
            />
          </svg>

          {/* Location Pins */}
          <div className="absolute left-8 top-16 flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-bold text-slate-700 mt-1 bg-white/90 px-1 rounded shadow-xs">
              Pickup
            </span>
          </div>

          <div className="absolute left-[50%] top-6 -translate-x-1/2 flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md animate-pulse">
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-bold text-amber-800 mt-1 bg-white/90 px-1 rounded shadow-xs">
              Van En Route
            </span>
          </div>

          <div className="absolute right-8 top-10 flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-bold text-slate-700 mt-1 bg-white/90 px-1 rounded shadow-xs">
              Facility
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-1.5 text-xs">
          <div className="flex items-start gap-2 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{targetOrder.pickup_address}</span>
          </div>
        </div>
      </div>

      {/* Proof of Delivery / Pickup Photo if attached */}
      {targetOrder.proof_photo && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            <span>Driver Verification Photo</span>
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-48">
            <img
              src={targetOrder.proof_photo}
              alt="Proof of stop"
              className="w-full h-44 object-cover"
            />
          </div>
          {targetOrder.driver_notes && (
            <p className="text-xs text-slate-600 italic">
              Note from driver: "{targetOrder.driver_notes}"
            </p>
          )}
        </div>
      )}

      {/* Final list from the laundry, shown once sorting is done */}
      {targetOrder.pricing_status && targetOrder.pricing_status !== 'estimated' && (() => {
        const labels = (businessSettings as any).specialItemLabels || SPECIAL_ITEM_LABELS;
        const sortedLines: string[] = [];
        if ((targetOrder.final_general_kg || 0) > 0) {
          sortedLines.push(`${targetOrder.final_general_kg} kg General laundry${targetOrder.final_ironing ? ' (with ironing)' : ''}`);
        }
        Object.entries(targetOrder.special_item_quantities || {}).forEach(([key, qty]) => {
          if (Number(qty) > 0) {
            const label = String(labels[key] || key);
            sortedLines.push(label.endsWith('(kg)') ? `${qty} kg ${label.replace(/\s*\(kg\)$/, '')}` : `${qty} x ${label}`);
          }
        });
        if (sortedLines.length === 0 && !targetOrder.sorting_notes) return null;
        return (
          <div className="bg-emerald-50 rounded-3xl p-4 border border-emerald-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-950">Updated list from the laundry</h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">After sorting</span>
            </div>
            <div className="space-y-1.5">
              {sortedLines.map((line, i) => (
                <div key={i} className="p-2.5 bg-white rounded-xl text-xs font-bold text-slate-800 border border-emerald-100">
                  {line}
                </div>
              ))}
            </div>
            {targetOrder.sorting_notes && (
              <p className="text-[11px] text-amber-700 italic">Care note: {targetOrder.sorting_notes}</p>
            )}
          </div>
        );
      })()}

      {/* Item Details Accordion / Summary */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900">
            {targetOrder.pricing_status && targetOrder.pricing_status !== 'estimated' ? 'As you listed them' : 'Garments & Care Notes'}
          </h3>
          <span className="text-[10px] font-bold text-slate-500">
            {targetOrder.items.filter((it) => it.item_type !== 'Laundry pricing request').reduce((n, it) => n + it.quantity, 0)} pieces
          </span>
        </div>
        <div className="space-y-2">
          {targetOrder.items.map((it, idx) => (
            <div key={idx} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800">
                  {it.quantity}x {it.item_type}
                </span>
                {it.care_notes && (
                  <p className="text-[11px] text-amber-700 italic mt-0.5">
                    Care note: {it.care_notes}
                  </p>
                )}
              </div>
              {it.price > 0 && (
                <span className="font-semibold text-slate-700">
                  KSh {(it.price * it.quantity).toLocaleString()}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-900">
          <span>Softener</span>
          <span className="text-blue-600 font-medium truncate max-w-[180px]">
            {targetOrder.softener_choice || targetOrder.detergent_choice || 'Not specified'}
          </span>
        </div>
      </div>

      {/* Order Support & Customer Service */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Order Questions?</span>
          <h4 className="font-bold text-slate-800">{businessSettings.businessName} Customer Care</h4>
          <p className="text-[11px] text-blue-600 font-medium">{businessSettings.phone}</p>
        </div>
        <a
          href={`tel:${businessSettings.phone.replace(/[^+\d]/g, '')}`}
          className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Support</span>
        </a>
      </div>
    </div>
  );
};
