import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  ExternalLink,
  Sparkles,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Order, User, OrderStatus } from '../../types';
import { DriverStopDetailModal } from './DriverStopDetailModal';

interface DriverRouteViewProps {
  currentUser: User;
  orders: Order[];
}

export const DriverRouteView: React.FC<DriverRouteViewProps> = ({
  currentUser,
  orders,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'pickups' | 'deliveries'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedStopType, setSelectedStopType] = useState<'pickup' | 'delivery'>('pickup');
  const [selectedStopNumber, setSelectedStopNumber] = useState<number>(1);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter orders assigned to this driver or active orders
  const driverOrders = orders.filter(
    (o) => o.driver_id === currentUser.id || !o.driver_id
  );

  // Map orders into stops
  // Scheduled orders are pickups; ready or out_for_delivery are deliveries; picked_up/washing are in-facility
  interface StopItem {
    stopNumber: number;
    order: Order;
    type: 'pickup' | 'delivery';
    completed: boolean;
    address: string;
    window: string;
  }

  const allStops: StopItem[] = [];
  let stopCounter = 1;

  driverOrders.forEach((order) => {
    // If order needs pickup or was picked up
    if (order.status === 'scheduled') {
      allStops.push({
        stopNumber: stopCounter++,
        order,
        type: 'pickup',
        completed: false,
        address: order.pickup_address,
        window: order.pickup_window,
      });
    } else if (order.status === 'picked_up' || order.status === 'washing') {
      allStops.push({
        stopNumber: stopCounter++,
        order,
        type: 'pickup',
        completed: true,
        address: order.pickup_address,
        window: order.pickup_window,
      });
    }

    // If order needs delivery or was delivered
    if (order.status === 'ready' || order.status === 'out_for_delivery') {
      allStops.push({
        stopNumber: stopCounter++,
        order,
        type: 'delivery',
        completed: false,
        address: order.dropoff_address,
        window: order.dropoff_window,
      });
    } else if (order.status === 'delivered') {
      allStops.push({
        stopNumber: stopCounter++,
        order,
        type: 'delivery',
        completed: true,
        address: order.dropoff_address,
        window: order.dropoff_window,
      });
    }
  });

  const filteredStops = allStops.filter((s) => {
    if (filterMode === 'pickups') return s.type === 'pickup';
    if (filterMode === 'deliveries') return s.type === 'delivery';
    return true;
  });

  const openStopDetail = (stop: StopItem) => {
    setSelectedOrder(stop.order);
    setSelectedStopType(stop.type);
    setSelectedStopNumber(stop.stopNumber);
    setIsDetailOpen(true);
  };

  const handleOpenMapsIntent = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    const query = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const completedCount = allStops.filter((s) => s.completed).length;
  const remainingCount = allStops.length - completedCount;

  return (
    <div className="flex-1 p-4 space-y-4 pb-20 overflow-y-auto">
      {/* Route Header Banner (Field-optimized high-contrast) */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-sm">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Driver Active Shift
              </span>
              <h2 className="text-base font-extrabold text-white">Today's Route Schedule</h2>
            </div>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2.5 py-1 rounded-xl border border-slate-700">
            Van #4
          </span>
        </div>

        {/* Progress Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center">
          <div className="p-2 bg-slate-800/60 rounded-xl">
            <span className="text-lg font-extrabold text-white">{allStops.length}</span>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Stops</p>
          </div>
          <div className="p-2 bg-slate-800/60 rounded-xl">
            <span className="text-lg font-extrabold text-amber-400">{remainingCount}</span>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Pending</p>
          </div>
          <div className="p-2 bg-slate-800/60 rounded-xl">
            <span className="text-lg font-extrabold text-emerald-400">{completedCount}</span>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Completed</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs (Grouped by Pickup vs Delivery) */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setFilterMode('all')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          All Stops ({allStops.length})
        </button>
        <button
          onClick={() => setFilterMode('pickups')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            filterMode === 'pickups' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          Pickups ({allStops.filter((s) => s.type === 'pickup').length})
        </button>
        <button
          onClick={() => setFilterMode('deliveries')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            filterMode === 'deliveries' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          Deliveries ({allStops.filter((s) => s.type === 'delivery').length})
        </button>
      </div>

      {/* Ordered Stops List */}
      <div className="space-y-3">
        {filteredStops.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
            No stops in this category.
          </div>
        ) : (
          filteredStops.map((stop) => {
            const isPickup = stop.type === 'pickup';

            return (
              <div
                key={`${stop.order.id}-${stop.type}`}
                onClick={() => openStopDetail(stop)}
                className={`rounded-3xl p-4 border transition-all cursor-pointer shadow-xs active:scale-99 ${
                  stop.completed
                    ? 'bg-slate-50 border-slate-200 opacity-75'
                    : isPickup
                    ? 'bg-white border-blue-200 hover:border-blue-400 ring-1 ring-blue-50'
                    : 'bg-white border-emerald-200 hover:border-emerald-400 ring-1 ring-emerald-50'
                }`}
              >
                {/* Stop Card Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-xl font-extrabold text-xs flex items-center justify-center text-white ${
                        stop.completed
                          ? 'bg-slate-400'
                          : isPickup
                          ? 'bg-blue-600'
                          : 'bg-emerald-600'
                      }`}
                    >
                      #{stop.stopNumber}
                    </span>

                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isPickup
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isPickup ? 'Pickup Stop' : 'Delivery Stop'}
                    </span>

                    <span className="text-xs font-bold text-slate-800">
                      Order #{stop.order.id}
                    </span>
                  </div>

                  {stop.completed ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      Next in Queue
                    </span>
                  )}
                </div>

                {/* Customer & Address Details */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {stop.order.customer_name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">{stop.window}</span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium line-clamp-1">
                    {stop.address}
                  </p>
                </div>

                {/* Item Notes Teaser if any */}
                {stop.order.items.some((i) => i.care_notes) && (
                  <div className="mt-2 text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-xl border border-amber-200/50 truncate">
                    ⚠️ Care: {stop.order.items.find((i) => i.care_notes)?.care_notes}
                  </div>
                )}

                {/* Large Action Buttons (Field touch targets) */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleOpenMapsIntent(e, stop.address)}
                    className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span>Navigate (Maps)</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openStopDetail(stop);
                    }}
                    className={`flex-1 h-11 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 shadow-xs transition-all ${
                      stop.completed
                        ? 'bg-slate-600 hover:bg-slate-700'
                        : isPickup
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    <span>{stop.completed ? 'View Proof' : 'Open Stop'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stop Detail & Completion Modal */}
      <DriverStopDetailModal
        order={selectedOrder}
        stopType={selectedStopType}
        stopNumber={selectedStopNumber}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onStopCompleted={() => {
          // Handled via store update
        }}
      />
    </div>
  );
};
