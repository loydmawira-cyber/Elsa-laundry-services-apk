import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  Navigation,
  MapPin,
  Camera,
  CheckCircle2,
  Package,
  Truck,
  ExternalLink,
  Upload,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { store } from '../../services/store';

interface DriverStopDetailModalProps {
  order: Order | null;
  stopType: 'pickup' | 'delivery';
  stopNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onStopCompleted: () => void;
}

export const DriverStopDetailModal: React.FC<DriverStopDetailModalProps> = ({
  order,
  stopType,
  stopNumber,
  isOpen,
  onClose,
  onStopCompleted,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(order?.proof_photo || null);
  const [driverNotes, setDriverNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhotoPresets, setShowPhotoPresets] = useState(false);

  if (!isOpen || !order) return null;

  const targetAddress = stopType === 'pickup' ? order.pickup_address : order.dropoff_address;
  const isPickup = stopType === 'pickup';

  // Sample quick photos for rapid mobile testing in field
  const SAMPLE_PHOTOS = [
    {
      label: 'Porch / Doorstep Delivery Proof',
      url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=60',
    },
    {
      label: 'Laundry Bag Collected at Porch',
      url: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop&q=60',
    },
    {
      label: 'Concierge / Reception Desk',
      url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop&q=60',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteStop = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const nextStatus: OrderStatus = isPickup ? 'picked_up' : 'delivered';
      store.updateOrderStatus(order.id, nextStatus, driverNotes, photoUrl || undefined);
      setIsSubmitting(false);
      onStopCompleted();
      onClose();
    }, 400);
  };

  const handleOpenGoogleMaps = () => {
    const query = encodeURIComponent(targetAddress);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="driver-stop-detail-card"
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
      >
        {/* Top Header - High contrast for outdoor sunlight */}
        <div
          className={`px-5 py-4 text-white flex items-center justify-between shrink-0 ${
            isPickup ? 'bg-blue-600' : 'bg-emerald-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-white/20 font-extrabold text-sm flex items-center justify-center">
              #{stopNumber}
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                {isPickup ? 'Pickup Stop' : 'Delivery Stop'}
              </span>
              <h3 className="font-extrabold text-base tracking-tight">Order #{order.id}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Stop Details */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Customer Contact & Quick Action Bar (Large 48px Targets) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Customer
                </span>
                <h4 className="font-extrabold text-base text-slate-900">{order.customer_name}</h4>
                <p className="text-xs text-slate-500">{order.customer_phone}</p>
              </div>

              {/* One-touch Call & Text Intent */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${order.customer_phone}`}
                  className="w-12 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                  title="Call Customer Directly"
                >
                  <Phone className="w-5 h-5" />
                </a>
                <a
                  href={`sms:${order.customer_phone}`}
                  className="w-12 h-12 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 flex items-center justify-center active:scale-95 transition-all"
                  title="SMS Text Customer"
                >
                  <MessageSquare className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Intent Block */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Destination Address
                </span>
                <p className="text-xs font-bold text-slate-900 leading-snug">{targetAddress}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Window: {isPickup ? order.pickup_window : order.dropoff_window}
                </p>
              </div>
            </div>

            {/* Tap stop to open navigation (Google Maps intent) */}
            <button
              id="google-maps-intent-btn"
              type="button"
              onClick={handleOpenGoogleMaps}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>Open Google Maps Directions</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
            </button>
          </div>

          {/* Special Care Notes & Garment Manifest */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Item Notes & Care Instructions ({order.items.length} garment types)
            </span>

            <div className="space-y-1.5">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>
                      {item.quantity}x {item.item_type}
                    </span>
                  </div>
                  {item.care_notes ? (
                    <p className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-md mt-1 border border-amber-200/60">
                      ⚠️ Care Note: {item.care_notes}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic mt-0.5">Standard wash & fold</p>
                  )}
                </div>
              ))}
            </div>

            <div className="text-[11px] text-blue-700 bg-blue-50 p-2 rounded-xl font-medium border border-blue-100">
              Detergent Formula: <span className="font-bold">{order.detergent_choice}</span>
            </div>
          </div>

          {/* Optional Proof Photo Capture */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Optional Proof of {isPickup ? 'Pickup' : 'Delivery'} Photo
              </span>
              <button
                type="button"
                onClick={() => setShowPhotoPresets(!showPhotoPresets)}
                className="text-[11px] text-blue-600 font-bold hover:underline"
              >
                Sample Presets
              </button>
            </div>

            {/* Preset selector for easy evaluation */}
            {showPhotoPresets && (
              <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-100 rounded-xl">
                {SAMPLE_PHOTOS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPhotoUrl(p.url);
                      setShowPhotoPresets(false);
                    }}
                    className="p-1.5 bg-white border border-slate-300 rounded-lg text-[10px] text-slate-700 hover:border-blue-500 text-center font-medium"
                  >
                    {p.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            )}

            {photoUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-300 max-h-48">
                <img src={photoUrl} alt="Proof" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-full hover:bg-slate-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <label className="flex-1 py-3 px-3 bg-white hover:bg-slate-100 text-slate-700 border-2 border-dashed border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>Attach / Take Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            <input
              type="text"
              placeholder="Add optional driver dropoff note (e.g. left inside foyer)..."
              value={driverNotes}
              onChange={(e) => setDriverNotes(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl"
            />
          </div>
        </div>

        {/* Large One-Handed Action Completion Button (56px tall for field use) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            id="driver-complete-stop-btn"
            type="button"
            disabled={isSubmitting}
            onClick={handleCompleteStop}
            className={`w-full h-14 rounded-2xl text-sm font-extrabold text-white flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all ${
              isPickup
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
            }`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  {isPickup ? 'Mark Stop as Picked Up' : 'Mark Stop as Delivered'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
