import React, { useState } from 'react';
import {
  Sparkles,
  Truck,
  Package,
  Calendar,
  Clock,
  ArrowRight,
  Shirt,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Star,
  MapPin,
  Phone,
} from 'lucide-react';
import { ElsaLogo } from '../ElsaLogo';
import { User, Order, LaundryCatalogItem } from '../../types';

interface CustomerHomeProps {
  currentUser: User;
  orders: Order[];
  catalog: LaundryCatalogItem[];
  onOpenSchedule: () => void;
  onNavigateToTrack: (orderId?: string) => void;
  onReorder: (order: Order) => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  currentUser,
  orders,
  catalog,
  onOpenSchedule,
  onNavigateToTrack,
  onReorder,
}) => {
  // Find currently active order (not delivered or cancelled)
  const activeOrder = orders.find(
    (o) => o.customer_id === currentUser.id && o.status !== 'delivered' && o.status !== 'cancelled'
  );

  const pastOrder = orders.find(
    (o) => o.customer_id === currentUser.id && o.status === 'delivered'
  );

  return (
    <div className="flex-1 p-4 space-y-4 pb-20 overflow-y-auto">
      {/* Top Greeting Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <ElsaLogo size="md" withGlow />
          <div>
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
              Elsa Laundry Services
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Hi, {currentUser.name.split(' ')[0]} 👋
            </h2>
            <p className="text-xs text-slate-500">For a spotless clean • 24h turnaround</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/20">
          {currentUser.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </div>
      </div>

      {/* Active Order Spotlight Card (if in progress) */}
      {activeOrder && (
        <div
          id="active-order-banner"
          onClick={() => onNavigateToTrack(activeOrder.id)}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-5 shadow-lg shadow-blue-600/20 cursor-pointer relative overflow-hidden group transition-all"
        >
          {/* Subtle background glow */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                Active Order #{activeOrder.id}
              </span>
            </div>
            <span className="text-xs font-extrabold capitalize bg-emerald-400 text-emerald-950 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-900 animate-ping"></span>
              {activeOrder.status.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold">
              {activeOrder.status === 'scheduled' && 'Pickup Scheduled'}
              {activeOrder.status === 'picked_up' && 'In Courier Transit to Hub'}
              {activeOrder.status === 'at_facility' && 'Arrived at Facility & Queued'}
              {activeOrder.status === 'washing' && 'Eco-Wash Cycle in Progress'}
              {activeOrder.status === 'ready' && 'Ready for Delivery Route'}
              {activeOrder.status === 'out_for_delivery' && 'Driver is Heading to You!'}
            </h3>
            <p className="text-xs text-blue-100 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Window: {activeOrder.pickup_window.split('(')[0]}</span>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-semibold">
            <span className="text-blue-200">Tap to see visual step tracker & courier</span>
            <div className="flex items-center gap-1 text-white group-hover:translate-x-1 transition-transform">
              <span>Track Live</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Main Schedule Action Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 max-w-[240px]">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
              On-Demand Service
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              Need clean laundry this week?
            </h3>
            <p className="text-xs text-slate-500">
              We pick up from your doorstep, wash with your preferred detergent, and return it crisp.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <button
          id="home-schedule-pickup-btn"
          onClick={onOpenSchedule}
          className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
        >
          <Calendar className="w-4 h-4" />
          <span>Schedule a Pickup</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Services Menu Showcase */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Services & Pricing</span>
          <button onClick={onOpenSchedule} className="text-xs text-blue-600 font-semibold hover:underline">
            View all
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {catalog.slice(0, 4).map((item) => (
            <div
              key={item.id}
              onClick={onOpenSchedule}
              className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition-all space-y-1.5"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Shirt className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</h4>
              <p className="text-[11px] font-semibold text-blue-700">
                KSh {item.unit_price.toLocaleString()}{' '}
                <span className="text-[10px] text-slate-400 font-normal">{item.unit_label}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Reorder Card from Past Order */}
      {pastOrder && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">1-Tap Quick Reorder</span>
            </div>
            <span className="text-[10px] text-slate-400">Order #{pastOrder.id}</span>
          </div>

          <p className="text-xs text-slate-600 truncate">
            {pastOrder.items.map((i) => `${i.quantity}x ${i.item_type}`).join(', ')}
          </p>

          <button
            onClick={() => onReorder(pastOrder)}
            className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            <span>Reorder This Exact Laundry Load (KSh {Math.round(pastOrder.total_amount).toLocaleString()})</span>
          </button>
        </div>
      )}

      {/* Quality Guarantees */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-around text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Garment Protection</span>
        </div>
        <div className="h-4 w-px bg-slate-200"></div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Eco-Friendly Detergents</span>
        </div>
      </div>

      {/* Customer Service & Owner Helpline */}
      <div className="p-3.5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl flex items-center justify-between shadow-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300">Customer Helpline</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>
          <p className="text-xs font-bold text-white">Elsie Kaburu (Owner)</p>
          <p className="text-[11px] text-blue-200">+254 796 896 239</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="tel:+254796896239"
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-sm flex items-center gap-1 text-xs font-bold transition-all"
            title="Call Customer Service"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Call</span>
          </a>
        </div>
      </div>
    </div>
  );
};
