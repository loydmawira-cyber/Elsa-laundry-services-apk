import React, { useState } from 'react';
import {
  Package,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { Order } from '../../types';

interface OrderHistoryViewProps {
  orders: Order[];
  onReorder: (order: Order) => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  onReorder,
  onTrackOrder,
}) => {
  const [filter, setFilter] = useState<'all' | 'delivered' | 'in_progress'>('all');

  const filteredOrders = orders.filter((o) => {
    if (filter === 'delivered') return o.status === 'delivered';
    if (filter === 'in_progress') return o.status !== 'delivered' && o.status !== 'cancelled';
    return true;
  });

  return (
    <div className="flex-1 p-4 space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Order History</h2>
          <p className="text-xs text-slate-500">Past laundry pickups, invoices, & quick reorders</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-200/70 p-1 rounded-2xl text-xs font-semibold">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-xl transition-all ${
            filter === 'all' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          All ({orders.length})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`flex-1 py-1.5 rounded-xl transition-all ${
            filter === 'in_progress' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Active ({orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length})
        </button>
        <button
          onClick={() => setFilter('delivered')}
          className={`flex-1 py-1.5 rounded-xl transition-all ${
            filter === 'delivered' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Delivered ({orders.filter((o) => o.status === 'delivered').length})
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
            No orders found in this category.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isDelivered = order.status === 'delivered';
            const totalItemsCount = order.items.reduce((s, i) => s + i.quantity, 0);

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{order.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'washing'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'out_for_delivery'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="font-bold text-xs text-slate-900">
                    KSh {Math.round(order.total_amount).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{totalItemsCount} total items</span>
                  </div>

                  <p className="text-[11px] text-slate-600 truncate">
                    {order.items.map((it) => `${it.quantity}x ${it.item_type}`).join(', ')}
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onTrackOrder(order.id)}
                    className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onReorder(order)}
                    className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-blue-200/80"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reorder Items</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
