import React, { useState } from 'react';
import {
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ChevronRight,
  Package,
  X,
} from 'lucide-react';
import { User as UserType, Order } from '../../types';

interface AdminCustomersViewProps {
  users: UserType[];
  orders: Order[];
}

export const AdminCustomersView: React.FC<AdminCustomersViewProps> = ({ users, orders }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<UserType | null>(null);

  const customers = users.filter((u) => u.role === 'customer');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const customerOrders = selectedCustomer
    ? orders.filter((o) => o.customer_id === selectedCustomer.id)
    : [];

  return (
    <div className="flex-1 p-4 space-y-4 pb-20 overflow-y-auto">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Customer Directory</h2>
        <p className="text-xs text-slate-500">Search customer accounts & view complete order receipts</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
        />
      </div>

      {/* Customer Compact Cards */}
      <div className="space-y-2.5">
        {filteredCustomers.map((cust) => {
          const userOrders = orders.filter((o) => o.customer_id === cust.id);
          const totalSpent = userOrders.reduce((acc, o) => acc + o.total_amount, 0);

          return (
            <div
              key={cust.id}
              onClick={() => setSelectedCustomer(cust)}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 cursor-pointer shadow-xs transition-all space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {cust.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900">{cust.name}</h4>
                    <p className="text-[11px] text-slate-500">{cust.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-slate-900">
                    KSh {Math.round(totalSpent).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {userOrders.length} Order{userOrders.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                <span>{cust.phone}</span>
                <span className="text-blue-600 font-bold flex items-center gap-0.5">
                  View History <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Order History Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            id="customer-history-modal"
            className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
          >
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xs">
                  {selectedCustomer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{selectedCustomer.name}</h3>
                  <p className="text-[11px] text-slate-400">{selectedCustomer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Order History ({customerOrders.length})</span>
                <span className="text-blue-600">
                  Total LTV: KSh {Math.round(customerOrders.reduce((s, o) => s + o.total_amount, 0)).toLocaleString()}
                </span>
              </div>

              {customerOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl">
                  No orders recorded for this customer.
                </div>
              ) : (
                customerOrders.map((ord) => (
                  <div key={ord.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{ord.id}</span>
                      <span className="font-bold text-emerald-700">
                        KSh {Math.round(ord.total_amount).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>{new Date(ord.created_at).toLocaleDateString()}</span>
                      <span className="capitalize font-semibold text-slate-700">
                        {ord.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 truncate">
                      {ord.items.map((i) => `${i.quantity}x ${i.item_type}`).join(', ')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
