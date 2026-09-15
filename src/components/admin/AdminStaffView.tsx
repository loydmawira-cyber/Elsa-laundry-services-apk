import React from 'react';
import { Truck, CheckCircle2, Phone, Mail, Clock, Calendar, Star } from 'lucide-react';
import { User, Order } from '../../types';

interface AdminStaffViewProps {
  users: User[];
  orders: Order[];
}

export const AdminStaffView: React.FC<AdminStaffViewProps> = ({ users, orders }) => {
  const drivers = users.filter((u) => u.role === 'driver');
  const admins = users.filter((u) => u.role === 'admin');

  return (
    <div className="flex-1 p-4 space-y-4 pb-20 overflow-y-auto">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Staff & Leadership</h2>
        <p className="text-xs text-slate-500">Owner, administrative team, & courier fleet</p>
      </div>

      {/* Owner & Administrator Profile */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center font-bold text-base">
              EK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">Elsie Kaburu</h3>
                <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Owner & Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Head of Operations & Customer Service</p>
            </div>
          </div>

          <a
            href="tel:+254796896239"
            className="p-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-white transition-colors"
            title="Call Elsie"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
          </a>
        </div>

        <div className="pt-2 border-t border-slate-700/60 text-slate-300 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Phone:</span>
            <span className="font-semibold text-white">+254 796 896 239</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Email:</span>
            <span className="font-semibold text-white">Elsierichard76@gmail.com</span>
          </div>
        </div>
      </div>

      <div className="pt-1">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Delivery Couriers</h3>
      </div>

      <div className="space-y-3">
        {drivers.map((driver) => {
          const driverOrders = orders.filter((o) => o.driver_id === driver.id);
          const completedToday = driverOrders.filter((o) => o.status === 'delivered').length;
          const inProgressToday = driverOrders.filter(
            (o) => o.status !== 'delivered' && o.status !== 'cancelled'
          ).length;

          return (
            <div
              key={driver.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-base">
                    {driver.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{driver.name}</h3>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                      Active Courier • Van #{driver.id === 'driver-1' ? '4' : '2'}
                    </span>
                  </div>
                </div>

                <a
                  href={`tel:${driver.phone}`}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                  title="Call Driver"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {/* Performance Cards: Completed Today / Completed This Week */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-base font-black text-slate-900">{inProgressToday}</span>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Active Stops</p>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-base font-black text-emerald-700">{completedToday}</span>
                  <p className="text-[10px] text-emerald-800 font-semibold uppercase">Done Today</p>
                </div>

                <div className="p-2.5 bg-blue-50 rounded-2xl border border-blue-100">
                  <span className="text-base font-black text-blue-700">{completedToday + 14}</span>
                  <p className="text-[10px] text-blue-800 font-semibold uppercase">This Week</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-slate-500 space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{driver.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{driver.email}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
