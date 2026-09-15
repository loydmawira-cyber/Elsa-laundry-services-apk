import React from 'react';
import {
  DollarSign,
  Package,
  Truck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Layers,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { Order, InventoryItem, User } from '../../types';

interface AdminDashboardViewProps {
  orders: Order[];
  inventory: InventoryItem[];
  users: User[];
  onNavigateTab: (tab: 'orders' | 'inventory' | 'staff' | 'customers') => void;
  onSelectOrder: (orderId: string) => void;
  onLogout?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  orders,
  inventory,
  users,
  onNavigateTab,
  onSelectOrder,
  onLogout,
}) => {
  // Key Metrics
  const todayOrders = orders; // All current cycle orders
  const dailyRevenueTotal = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const statusCounts = {
    scheduled: orders.filter((o) => o.status === 'scheduled').length,
    picked_up: orders.filter((o) => o.status === 'picked_up').length,
    at_facility: orders.filter((o) => o.status === 'at_facility').length,
    washing: orders.filter((o) => o.status === 'washing').length,
    ready: orders.filter((o) => o.status === 'ready').length,
    out_for_delivery: orders.filter((o) => o.status === 'out_for_delivery').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  const unassignedOrders = orders.filter(
    (o) => !o.driver_id && o.status !== 'delivered' && o.status !== 'cancelled'
  );

  const lowStockItems = inventory.filter((i) => i.quantity <= i.low_stock_threshold);

  return (
    <div className="flex-1 p-4 space-y-4 pb-20 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
            Operations & Logistics Control
          </span>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h2>
          <p className="text-[11px] text-slate-500">
            Owner: <span className="font-bold text-slate-800">Elsie Kaburu</span> • Elsierichard76@gmail.com
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 3 Metric Summary Cards (Compact) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Orders Today
          </span>
          <span className="text-lg font-black text-slate-900">{orders.length}</span>
          <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Active Flow</p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Daily Revenue
          </span>
          <span className="text-lg font-black text-emerald-600">
            KSh {Math.round(dailyRevenueTotal).toLocaleString()}
          </span>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Gross Total</p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            In Transit
          </span>
          <span className="text-lg font-black text-amber-600">
            {statusCounts.picked_up + statusCounts.out_for_delivery}
          </span>
          <p className="text-[10px] text-amber-700 font-semibold mt-0.5">On Vans</p>
        </div>
      </div>

      {/* Urgent Operational Alerts */}
      {unassignedOrders.length > 0 && (
        <div
          onClick={() => onNavigateTab('orders')}
          className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                {unassignedOrders.length} Unassigned Order{unassignedOrders.length > 1 ? 's' : ''}
              </h4>
              <p className="text-[11px] text-amber-700">
                Tap to assign a driver (Brian or Leo) to ensure timely pickup.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-600" />
        </div>
      )}

      {lowStockItems.length > 0 && (
        <div
          onClick={() => onNavigateTab('inventory')}
          className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-rose-100/70 transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-rose-900">
                {lowStockItems.length} Low Stock Laundry Suppli{lowStockItems.length > 1 ? 'es' : 'y'}
              </h4>
              <p className="text-[11px] text-rose-700">
                {lowStockItems.map((i) => i.item_name.split(' ')[0]).join(', ')} below threshold.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-600" />
        </div>
      )}

      {/* Orders by Status Pipeline (Compact Visual Grid) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Orders by Status Pipeline</span>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-[11px] text-blue-600 font-bold hover:underline"
          >
            Manage All
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex justify-between items-center text-slate-500 font-medium text-[11px]">
              <span>Scheduled</span>
              <Clock className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <span className="text-base font-black text-slate-900 mt-1 block">
              {statusCounts.scheduled}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex justify-between items-center text-slate-500 font-medium text-[11px]">
              <span>Picked Up</span>
              <Truck className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <span className="text-base font-black text-slate-900 mt-1 block">
              {statusCounts.picked_up}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex justify-between items-center text-slate-500 font-medium text-[11px]">
              <span>Washing Cycle</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <span className="text-base font-black text-slate-900 mt-1 block">
              {statusCounts.washing}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex justify-between items-center text-slate-500 font-medium text-[11px]">
              <span>Ready & Packed</span>
              <Package className="w-3.5 h-3.5 text-teal-500" />
            </div>
            <span className="text-base font-black text-slate-900 mt-1 block">
              {statusCounts.ready}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex justify-between items-center text-slate-500 font-medium text-[11px]">
              <span>Out for Delivery</span>
              <Truck className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <span className="text-base font-black text-slate-900 mt-1 block">
              {statusCounts.out_for_delivery}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex justify-between items-center text-slate-500 font-medium text-[11px]">
              <span>Delivered</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <span className="text-base font-black text-slate-900 mt-1 block">
              {statusCounts.delivered}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Orders Compact Table / Card List */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Recent Order Activity</span>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-[11px] text-blue-600 font-bold hover:underline"
          >
            View Full List
          </button>
        </div>

        <div className="space-y-2">
          {orders.slice(0, 4).map((order) => (
            <div
              key={order.id}
              onClick={() => {
                onSelectOrder(order.id);
                onNavigateTab('orders');
              }}
              className="p-2.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer transition-colors text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{order.id}</span>
                  <span className="text-slate-600 truncate max-w-[120px]">
                    {order.customer_name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                  <span>Driver: {order.driver_name || 'Unassigned'}</span>
                  <span>•</span>
                  <span>{order.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-extrabold text-slate-900">
                  KSh {Math.round(order.total_amount).toLocaleString()}
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize block mt-0.5 ${
                    order.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.status === 'washing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {order.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
