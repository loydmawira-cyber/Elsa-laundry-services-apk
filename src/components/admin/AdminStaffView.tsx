import React, { useState } from 'react';
import {
  Truck,
  Shield,
  Phone,
  Mail,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Lock,
  User as UserIcon,
  X,
  Sparkles,
} from 'lucide-react';
import { User, Order } from '../../types';
import { store } from '../../services/store';

interface AdminStaffViewProps {
  users: User[];
  orders: Order[];
}

export const AdminStaffView: React.FC<AdminStaffViewProps> = ({ users, orders }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+254 7');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'driver' | 'attendant' | 'admin'>('driver');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const drivers = users.filter((u) => u.role === 'driver');
  const attendants = users.filter((u) => u.role === 'attendant');
  const admins = users.filter((u) => u.role === 'admin');

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter the staff member full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please provide a valid work email address');
      return;
    }
    if (!password.trim() || password.trim().length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await store.createStaffUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || '+254 700 000 000',
        password: password.trim(),
        role: role,
      });

      setSuccessMsg(`Successfully created ${role === 'admin' ? 'Administrator' : role === 'attendant' ? 'Attendant' : 'Courier'} account for ${name.trim()}!`);
      setName('');
      setEmail('');
      setPhone('+254 7');
      setPassword('');
      setTimeout(() => {
        setShowAddModal(false);
        setSuccessMsg('');
      }, 2500);
    } catch (err: any) {
      console.error('Error creating staff member:', err);
      setErrorMsg(err?.message || 'Failed to create staff account. Please verify the details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 space-y-4 pb-20 overflow-y-auto">
      {/* Header with Create Staff Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Staff & Leadership</h2>
          <p className="text-xs text-slate-500">Administrative team & courier fleet</p>
        </div>

        <button
          type="button"
          id="btn-add-staff"
          onClick={() => {
            setErrorMsg('');
            setSuccessMsg('');
            setShowAddModal(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Staff</span>
        </button>
      </div>

      {/* SUCCESS BANNER */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* CREATE STAFF MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Provision Staff Account</h3>
                  <p className="text-[10px] text-slate-500">Admin-only secure role assignment</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Role Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('driver')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      role === 'driver'
                        ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5 text-amber-700" />
                    <span>Courier / Driver</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      role === 'admin'
                        ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-blue-700" />
                    <span>Administrator</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('attendant')}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                      role === 'attendant'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Attendant</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    id="staff-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Patrick Mwangi"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Work Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    id="staff-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patrick.mwangi@elsalaundry.co.ke"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Kenyan Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    id="staff-phone-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 712 345 678"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Temporary Initial Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    id="staff-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  id="btn-submit-staff"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-sm shadow-blue-500/25 flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Administrators Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Administrators ({admins.length || 1})
        </h3>

        {admins.length === 0 ? (
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
        ) : (
          admins.map((adm) => (
            <div
              key={adm.id}
              className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center font-bold text-base">
                    {adm.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase() || 'AD'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-white">{adm.name}</h3>
                      <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                        Admin
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Operations & Logistics Management</p>
                  </div>
                </div>

                <a
                  href={`tel:${adm.phone}`}
                  className="p-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-white transition-colors"
                  title="Call Admin"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                </a>
              </div>

              <div className="pt-2 border-t border-slate-700/60 text-slate-300 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-semibold text-white">{adm.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-semibold text-white">{adm.email}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Attendants Section */}
      <div className="pt-2 space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Laundry Attendants ({attendants.length})</h3>
        {attendants.length === 0 ? (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 text-center text-xs text-slate-500">No attendant accounts added yet.</div>
        ) : (
          attendants.map((attendant) => (
            <div key={attendant.id} className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">{attendant.name.split(' ').map((n) => n[0]).join('').toUpperCase()}</div>
                <div>
                  <p className="font-extrabold text-slate-900">{attendant.name}</p>
                  <p className="text-[11px] text-slate-500">{attendant.phone} • {attendant.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-1 rounded-full border border-emerald-200">Attendant</span>
            </div>
          ))
        )}
      </div>

      {/* Couriers / Drivers Section */}
      <div className="pt-2 space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Delivery Couriers & Drivers ({drivers.length})
        </h3>

        {drivers.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center space-y-2">
            <Truck className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-600 font-semibold">No courier accounts added yet</p>
            <p className="text-[11px] text-slate-400">
              Click &quot;Add Staff&quot; above to create driver accounts for your laundry delivery fleet.
            </p>
          </div>
        ) : (
          drivers.map((driver) => {
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
                        .join('')
                        .toUpperCase() || 'DR'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{driver.name}</h3>
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                        Active Courier
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

                {/* Performance Cards */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-base font-black text-slate-900">{inProgressToday}</span>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Active Stops</p>
                  </div>

                  <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="text-base font-black text-emerald-700">{completedToday}</span>
                    <p className="text-[10px] text-emerald-800 font-semibold uppercase">Done</p>
                  </div>

                  <div className="p-2.5 bg-blue-50 rounded-2xl border border-blue-100">
                    <span className="text-base font-black text-blue-700">{driverOrders.length}</span>
                    <p className="text-[10px] text-blue-800 font-semibold uppercase">Total</p>
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
          })
        )}
      </div>
    </div>
  );
};
