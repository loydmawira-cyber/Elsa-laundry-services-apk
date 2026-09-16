import React, { useState, useEffect } from 'react';
import {
  Home,
  Clock,
  History,
  User as UserIcon,
  Truck,
  LayoutDashboard,
  Layers,
  Users,
  Package,
  Calendar,
  Sparkles,
  Plus,
  Shield,
  Settings,
} from 'lucide-react';
import { User, UserRole, Order, InventoryItem } from './types';
import { store } from './services/store';
import { AndroidFrame } from './components/AndroidFrame';
import { LoginView } from './components/LoginView';

// Customer Components
import { CustomerHome } from './components/customer/CustomerHome';
import { ScheduleOrderModal } from './components/customer/ScheduleOrderModal';
import { TrackOrderView } from './components/customer/TrackOrderView';
import { OrderHistoryView } from './components/customer/OrderHistoryView';
import { CustomerProfileView } from './components/customer/CustomerProfileView';

// Driver Components
import { DriverRouteView } from './components/driver/DriverRouteView';

// Admin Components
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AdminOrdersView } from './components/admin/AdminOrdersView';
import { AdminInventoryView } from './components/admin/AdminInventoryView';
import { AdminStaffView } from './components/admin/AdminStaffView';
import { AdminCustomersView } from './components/admin/AdminCustomersView';
import { AdminSettingsView } from './components/admin/AdminSettingsView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(store.getCurrentUser());
  const [orders, setOrders] = useState<Order[]>(store.getOrders());
  const [inventory, setInventory] = useState<InventoryItem[]>(store.getInventory());
  const [allUsers, setAllUsers] = useState<User[]>(store.getUsers());

  // Customer Navigation State: 'home' | 'track' | 'history' | 'profile'
  const [customerTab, setCustomerTab] = useState<'home' | 'track' | 'history' | 'profile'>('home');
  const [trackOrderId, setTrackOrderId] = useState<string | undefined>();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [reorderItems, setReorderItems] = useState<
    { item_type: string; quantity: number; care_notes: string; price: number }[] | undefined
  >();

  // Admin Navigation State: 'dashboard' | 'orders' | 'inventory' | 'staff' | 'customers' | 'settings'
  const [adminTab, setAdminTab] = useState<
    'dashboard' | 'orders' | 'inventory' | 'staff' | 'customers' | 'settings'
  >('dashboard');
  const [adminSelectedOrderId, setAdminSelectedOrderId] = useState<string | null>(null);

  // Sync state on store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
      setOrders(store.getOrders());
      setInventory(store.getInventory());
      setAllUsers(store.getUsers());
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'customer') setCustomerTab('home');
    if (user.role === 'admin') setAdminTab('dashboard');
  };

  const handleLogout = () => {
    store.logout();
    setCurrentUser(null);
  };

  const handleReorder = (order: Order) => {
    setReorderItems(
      order.items.map((i) => ({
        item_type: i.item_type,
        quantity: i.quantity,
        care_notes: i.care_notes,
        price: i.price,
      }))
    );
    setIsScheduleOpen(true);
  };

  const handleOpenTrackWithOrder = (orderId?: string) => {
    if (orderId) setTrackOrderId(orderId);
    setCustomerTab('track');
  };

  return (
    <AndroidFrame
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {/* ------------------------------------------------------------- */}
      {/* 0. AUTH / LOGIN VIEW (WHEN NOT LOGGED IN)                    */}
      {/* ------------------------------------------------------------- */}
      {!currentUser && (
        <LoginView onLoginSuccess={handleLoginSuccess} />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. CUSTOMER ROLE SCREENS                                     */}
      {/* ------------------------------------------------------------- */}
      {currentUser && currentUser.role === 'customer' && (
        <div className="flex-1 flex flex-col h-full relative">
          {customerTab === 'home' && (
            <CustomerHome
              currentUser={currentUser}
              orders={orders}
              onOpenSchedule={() => {
                setReorderItems(undefined);
                setIsScheduleOpen(true);
              }}
              onNavigateToTrack={handleOpenTrackWithOrder}
              onReorder={handleReorder}
            />
          )}

          {customerTab === 'track' && (
            <TrackOrderView
              orders={orders.filter((o) => o.customer_id === currentUser.id)}
              selectedOrderId={trackOrderId}
              onSelectOrder={(id) => setTrackOrderId(id)}
              onOpenSchedule={() => {
                setReorderItems(undefined);
                setIsScheduleOpen(true);
              }}
            />
          )}

          {customerTab === 'history' && (
            <OrderHistoryView
              orders={orders.filter((o) => o.customer_id === currentUser.id)}
              onReorder={handleReorder}
              onTrackOrder={handleOpenTrackWithOrder}
            />
          )}

          {customerTab === 'profile' && (
            <CustomerProfileView
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          )}

          {/* Customer Bottom Navigation Bar (Fixed to bottom) */}
          <nav
            id="customer-bottom-nav"
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-4 flex items-center justify-around z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
          >
            <button
              id="cust-nav-home"
              onClick={() => setCustomerTab('home')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                customerTab === 'home'
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-500 font-medium hover:text-slate-900'
              }`}
            >
              <div
                className={`w-10 h-6 rounded-full flex items-center justify-center transition-all ${
                  customerTab === 'home' ? 'bg-blue-100 text-blue-700' : 'text-slate-500'
                }`}
              >
                <Home className="w-4 h-4" />
              </div>
              <span className="text-[11px]">Home</span>
            </button>

            <button
              id="cust-nav-track"
              onClick={() => setCustomerTab('track')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                customerTab === 'track'
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-500 font-medium hover:text-slate-900'
              }`}
            >
              <div
                className={`w-10 h-6 rounded-full flex items-center justify-center transition-all ${
                  customerTab === 'track' ? 'bg-blue-100 text-blue-700' : 'text-slate-500'
                }`}
              >
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[11px]">Track Order</span>
            </button>

            <button
              id="cust-nav-history"
              onClick={() => setCustomerTab('history')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                customerTab === 'history'
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-500 font-medium hover:text-slate-900'
              }`}
            >
              <div
                className={`w-10 h-6 rounded-full flex items-center justify-center transition-all ${
                  customerTab === 'history' ? 'bg-blue-100 text-blue-700' : 'text-slate-500'
                }`}
              >
                <History className="w-4 h-4" />
              </div>
              <span className="text-[11px]">History</span>
            </button>

            <button
              id="cust-nav-profile"
              onClick={() => setCustomerTab('profile')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                customerTab === 'profile'
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-500 font-medium hover:text-slate-900'
              }`}
            >
              <div
                className={`w-10 h-6 rounded-full flex items-center justify-center transition-all ${
                  customerTab === 'profile' ? 'bg-blue-100 text-blue-700' : 'text-slate-500'
                }`}
              >
                <UserIcon className="w-4 h-4" />
              </div>
              <span className="text-[11px]">Profile</span>
            </button>
          </nav>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. DRIVER ROLE SCREENS                                       */}
      {/* ------------------------------------------------------------- */}
      {currentUser && currentUser.role === 'driver' && (
        <div className="flex-1 flex flex-col h-full">
          <DriverRouteView
            currentUser={currentUser}
            orders={orders}
            onLogout={handleLogout}
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. ADMIN ROLE SCREENS                                        */}
      {/* ------------------------------------------------------------- */}
      {currentUser && currentUser.role === 'admin' && (
        <div className="flex-1 flex flex-col h-full relative">
          {adminTab === 'dashboard' && (
            <AdminDashboardView
              orders={orders}
              inventory={inventory}
              users={allUsers}
              onNavigateTab={(tab) => setAdminTab(tab)}
              onSelectOrder={(id) => {
                setAdminSelectedOrderId(id);
                setAdminTab('orders');
              }}
              onLogout={handleLogout}
            />
          )}

          {adminTab === 'orders' && (
            <AdminOrdersView
              orders={orders}
              users={allUsers}
              initialSelectedOrderId={adminSelectedOrderId}
            />
          )}

          {adminTab === 'inventory' && <AdminInventoryView inventory={inventory} />}

          {adminTab === 'staff' && <AdminStaffView users={allUsers} orders={orders} />}

          {adminTab === 'customers' && (
            <AdminCustomersView users={allUsers} orders={orders} />
          )}

          {adminTab === 'settings' && <AdminSettingsView />}

          {/* Admin Bottom Navigation Bar (Fixed to bottom) */}
          <nav
            id="admin-bottom-nav"
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 py-1 px-1 flex items-center justify-around z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
          >
            <button
              onClick={() => setAdminTab('dashboard')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all ${
                adminTab === 'dashboard'
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-slate-500 font-medium hover:text-slate-800'
              }`}
            >
              <div
                className={`w-8 h-5 rounded-full flex items-center justify-center ${
                  adminTab === 'dashboard' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px]">Dashboard</span>
            </button>

            <button
              onClick={() => {
                setAdminSelectedOrderId(null);
                setAdminTab('orders');
              }}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all ${
                adminTab === 'orders'
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-slate-500 font-medium hover:text-slate-800'
              }`}
            >
              <div
                className={`w-8 h-5 rounded-full flex items-center justify-center ${
                  adminTab === 'orders' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px]">Orders</span>
            </button>

            <button
              onClick={() => setAdminTab('inventory')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all ${
                adminTab === 'inventory'
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-slate-500 font-medium hover:text-slate-800'
              }`}
            >
              <div
                className={`w-8 h-5 rounded-full flex items-center justify-center ${
                  adminTab === 'inventory' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px]">Stock</span>
            </button>

            <button
              onClick={() => setAdminTab('staff')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all ${
                adminTab === 'staff'
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-slate-500 font-medium hover:text-slate-800'
              }`}
            >
              <div
                className={`w-8 h-5 rounded-full flex items-center justify-center ${
                  adminTab === 'staff' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px]">Drivers</span>
            </button>

            <button
              onClick={() => setAdminTab('customers')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all ${
                adminTab === 'customers'
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-slate-500 font-medium hover:text-slate-800'
              }`}
            >
              <div
                className={`w-8 h-5 rounded-full flex items-center justify-center ${
                  adminTab === 'customers' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px]">Clients</span>
            </button>

            <button
              onClick={() => setAdminTab('settings')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all ${
                adminTab === 'settings'
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-slate-500 font-medium hover:text-slate-800'
              }`}
            >
              <div
                className={`w-8 h-5 rounded-full flex items-center justify-center ${
                  adminTab === 'settings' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px]">Settings</span>
            </button>
          </nav>
        </div>
      )}

      {/* Schedule Order Full Flow Modal */}
      {currentUser && (
        <ScheduleOrderModal
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          currentUser={currentUser}
          initialItems={reorderItems}
          onOrderCreated={(orderId) => {
            setTrackOrderId(orderId);
            setCustomerTab('track');
          }}
        />
      )}
    </AndroidFrame>
  );
}
