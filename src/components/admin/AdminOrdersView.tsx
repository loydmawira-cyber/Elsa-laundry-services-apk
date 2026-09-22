import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  User,
  Truck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  Sparkles,
  DollarSign,
  AlertCircle,
  Camera,
  ChevronRight,
} from 'lucide-react';
import { Order, User as UserType, OrderStatus } from '../../types';
import { store } from '../../services/store';

interface AdminOrdersViewProps {
  orders: Order[];
  users: UserType[];
  initialSelectedOrderId?: string | null;
}

export const AdminOrdersView: React.FC<AdminOrdersViewProps> = ({
  orders,
  users,
  initialSelectedOrderId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(
    orders.find((o) => o.id === initialSelectedOrderId) || null
  );

  // Keep selectedOrder in sync with real-time updates to orders prop
  useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find((o) => o.id === selectedOrder.id);
      if (updated) {
        setSelectedOrder(updated);
      }
    }
  }, [orders]);

  const drivers = users.filter((u) => u.role === 'driver');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAssignDriver = (orderId: string, driverId: string | null) => {
    store.assignDriver(orderId, driverId);
    if (selectedOrder && selectedOrder.id === orderId) {
      const updated = store.getOrderById(orderId);
      if (updated) setSelectedOrder(updated);
    }
  };

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    store.updateOrderStatus(orderId, status, `Status changed by Admin`);
    if (selectedOrder && selectedOrder.id === orderId) {
      const updated = store.getOrderById(orderId);
      if (updated) setSelectedOrder(updated);
    }
  };

  const handleMarkPaymentPaid = (orderId: string) => {
    store.updatePaymentStatus(orderId, 'paid');
    const updated = store.getOrderById(orderId);
    if (updated) setSelectedOrder(updated);
  };

  return (
    <div className="flex-1 p-4 space-y-4 pb-20 overflow-y-auto">
      {/* Search & Status Filter Controls */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
        </div>

        {/* Compact Horizontal Scroll Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'picked_up', label: 'Picked Up' },
            { id: 'at_facility', label: 'At Facility' },
            { id: 'washing', label: 'Washing' },
            { id: 'ready', label: 'Ready' },
            { id: 'out_for_delivery', label: 'Out for Delivery' },
            { id: 'delivered', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Compact Table / Cards Layout */}
      <div className="space-y-2.5">
        {filteredOrders.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
            No matching orders found.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 shadow-xs cursor-pointer transition-all space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900">{order.id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      order.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'washing'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'scheduled'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <span className="font-extrabold text-slate-900">
                  KSh {Math.round(order.total_amount).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">
                    Customer
                  </span>
                  <p className="font-semibold text-slate-800 truncate">{order.customer_name}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">
                    Assigned Driver
                  </span>
                  <p
                    className={`font-semibold truncate ${
                      order.driver_name ? 'text-slate-800' : 'text-amber-600 italic'
                    }`}
                  >
                    {order.driver_name || '⚠️ Unassigned'}
                  </p>
                </div>
              </div>
              <div className={`pt-1 border-t border-slate-100 text-[10px] font-bold ${order.payment_status === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                Payment: {order.payment_status === 'paid' ? 'Paid' : 'Awaiting confirmation'}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Full Order Detail & Driver Assignment Sheet Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            id="admin-order-modal"
            className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xs">
                  {selectedOrder.id.slice(-3)}
                </span>
                <div>
                  <h3 className="font-bold text-sm">Order #{selectedOrder.id}</h3>
                  <p className="text-[11px] text-slate-400">
                    Created {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* DRIVER ASSIGNMENT / REASSIGNMENT CONTROL */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                <label className="font-bold text-blue-950 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Assign or Reassign Driver</span>
                </label>
                <select
                  value={selectedOrder.driver_id || ''}
                  onChange={(e) =>
                    handleAssignDriver(selectedOrder.id, e.target.value ? e.target.value : null)
                  }
                  className="w-full p-2.5 bg-white border border-blue-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Unassigned --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-blue-700">
                  Changing driver updates today's route dispatch immediately.
                </p>
              </div>

              {/* STATUS OVERRIDE - ALL STATUSES VISIBLE, AUTOMATED ONES UNCLICKABLE */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Operational Status</label>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 capitalize flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    Current: {selectedOrder.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">
                  Manual updates are enabled for facility steps (<span className="font-semibold text-slate-700">At Facility, Washing, Ready</span>). Pickup and delivery status buttons are automated via driver actions.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                  {[
                    { key: 'scheduled', label: 'Scheduled', isManual: false },
                    { key: 'picked_up', label: 'Picked Up', isManual: false },
                    { key: 'at_facility', label: 'At Facility', isManual: true },
                    { key: 'washing', label: 'Washing', isManual: true },
                    { key: 'ready', label: 'Ready', isManual: true },
                    { key: 'out_for_delivery', label: 'Out For Delivery', isManual: false },
                    { key: 'delivered', label: 'Delivered', isManual: false },
                  ].map((st) => {
                    const isCurrent = selectedOrder.status === st.key;
                    if (st.isManual) {
                      return (
                        <button
                          key={st.key}
                          type="button"
                          onClick={() => handleUpdateStatus(selectedOrder.id, st.key as OrderStatus)}
                          className={`py-2 px-1.5 rounded-xl text-[11px] font-bold capitalize border text-center transition-all ${
                            isCurrent
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-300'
                              : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 hover:border-blue-400'
                          }`}
                        >
                          {st.label}
                        </button>
                      );
                    }

                    // Automated status - visible but unclickable (disabled)
                    return (
                      <button
                        key={st.key}
                        type="button"
                        disabled
                        title="Automated status (managed by Driver App actions)"
                        className={`py-2 px-1.5 rounded-xl text-[11px] font-bold capitalize border text-center transition-all cursor-not-allowed ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-blue-700 font-extrabold shadow-sm ring-2 ring-blue-300'
                            : 'bg-slate-100 text-slate-400 border-slate-200 opacity-70'
                        }`}
                      >
                        <span className="flex items-center justify-center gap-1">
                          <span>{st.label}</span>
                          <span className="text-[9px] text-slate-400 font-normal uppercase tracking-wider">(Auto)</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Automated Status Notice if currently in an automated driver phase */}
                {['scheduled', 'picked_up', 'out_for_delivery', 'delivered'].includes(selectedOrder.status) && (
                  <div className="mt-2 p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-[11px] text-blue-900 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>
                      {selectedOrder.status === 'scheduled' && 'Automated: Pending driver pickup. Will auto-update to "Picked Up" when collected by driver.'}
                      {selectedOrder.status === 'picked_up' && 'Automated: Item picked up by driver. Click "At Facility" when garments arrive.'}
                      {selectedOrder.status === 'out_for_delivery' && 'Automated: Driver is currently en route delivering garments to customer.'}
                      {selectedOrder.status === 'delivered' && 'Automated: Order has been successfully delivered by driver.'}
                    </span>
                  </div>
                )}
              </div>

              {/* Customer Details */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="font-bold text-slate-900 block">Customer Information</span>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">NAME</span>
                    <p className="font-bold text-slate-800">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">PHONE</span>
                    <p className="font-bold text-slate-800">{selectedOrder.customer_phone}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>Pickup: {selectedOrder.pickup_address}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Dropoff: {selectedOrder.dropoff_address}</span>
                  </div>
                </div>
              </div>

              {/* PAYMENT CONFIRMATION */}
              <div className={`p-4 rounded-2xl border space-y-2 ${selectedOrder.payment_status === 'paid' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center justify-between">
                  <label className={`font-bold flex items-center gap-1.5 ${selectedOrder.payment_status === 'paid' ? 'text-emerald-950' : 'text-amber-950'}`}>
                    <DollarSign className="w-4 h-4" />
                    <span>Payment Confirmation</span>
                  </label>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${selectedOrder.payment_status === 'paid' ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}`}>
                    {selectedOrder.payment_status === 'paid' ? 'PAID' : 'AWAITING CONFIRMATION'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="block text-slate-500 font-semibold">AMOUNT PAID</span>
                    <span className="font-extrabold text-slate-900">KSh {Math.round(selectedOrder.total_amount).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-semibold">M-PESA CODE</span>
                    <span className="font-extrabold text-slate-900">{selectedOrder.mpesa_confirmation_code || 'Not provided'}</span>
                  </div>
                </div>
                {selectedOrder.payment_status !== 'paid' && (
                  <button
                    type="button"
                    onClick={() => handleMarkPaymentPaid(selectedOrder.id)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as paid
                  </button>
                )}
              </div>

              {/* Items in Order */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="font-bold text-slate-900 block">Garments & Care Notes</span>
                <div className="space-y-1.5">
                  {selectedOrder.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-800">
                          {it.quantity}x {it.item_type}
                        </span>
                        {it.care_notes && (
                          <p className="text-[10px] text-amber-700 italic">
                            Care: {it.care_notes}
                          </p>
                        )}
                      </div>
                      <span className="font-semibold text-slate-700">
                        KSh {(it.price * it.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-1.5 font-bold text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal + Delivery</span>
                    <span>KSh {Math.round(selectedOrder.total_amount).toLocaleString()}</span>
                  </div>
                  
                  {/* Automated 5% Revenue Share Cut */}
                  <div className="p-2.5 bg-blue-50 border border-blue-200/80 rounded-xl space-y-1 text-[11px]">
                    <div className="flex justify-between text-blue-900 font-extrabold">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        5% Platform Tech Fee (Auto-Sent)
                      </span>
                      <span className="text-blue-700">
                        KSh {Math.round(selectedOrder.platform_fee || selectedOrder.total_amount * 0.05).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-900 font-extrabold">
                      <span>95% Laundry Net Payout</span>
                      <span className="text-emerald-700">
                        KSh {Math.round(selectedOrder.merchant_net || selectedOrder.total_amount * 0.95).toLocaleString()}
                      </span>
                    </div>
                    {selectedOrder.payout_reference && (
                      <p className="text-[10px] text-blue-600 font-semibold pt-0.5 border-t border-blue-200/50">
                        Disbursement Ref: {selectedOrder.payout_reference} • Status: {selectedOrder.payout_status || 'disbursed'}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1">
                    <span>Gross Total</span>
                    <span className="text-emerald-700">
                      KSh {Math.round(selectedOrder.total_amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Proof Photo if available */}
              {selectedOrder.proof_photo && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    Proof Photo from Driver
                  </span>
                  <div className="rounded-xl overflow-hidden border border-slate-300">
                    <img
                      src={selectedOrder.proof_photo}
                      alt="Proof"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
