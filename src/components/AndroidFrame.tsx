import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
} from 'lucide-react';
import { ElsaLogo } from './ElsaLogo';
import { store } from '../services/store';
import { User, AppNotification } from '../types';
import { TopLaundryBanner } from './TopLaundryBanner';

interface AndroidFrameProps {
  children: React.ReactNode;
  currentUser: User | null;
  onLogout: () => void;
  title?: string;
  onBack?: () => void;
  activeTab?: string;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  currentUser,
  onLogout,
  title,
  onBack,
}) => {
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const updateNotifs = () => {
      const notifs = store.getNotifications({ id: currentUser.id, role: currentUser.role });
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    };

    updateNotifs();
    const unsubscribe = store.subscribe(() => {
      const notifs = store.getNotifications({ id: currentUser.id, role: currentUser.role });
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
      if (notifs.length > 0 && !notifs[0].read) {
        setActiveNotification(notifs[0]);
        // Auto-dismiss heads-up after 5s
        setTimeout(() => {
          setActiveNotification((prev) => (prev?.id === notifs[0].id ? null : prev));
        }, 5000);
      }
    });

    return () => unsubscribe();
  }, [currentUser?.id, currentUser?.role]);

  const handleClearNotif = () => {
    if (currentUser) {
      store.markNotificationsRead({ id: currentUser.id, role: currentUser.role });
    }
    setActiveNotification(null);
  };

  return (
    <div className={`min-h-screen ${currentUser ? 'bg-slate-100' : 'bg-slate-950'} flex flex-col items-center justify-start font-sans antialiased transition-colors`}>
      {/* Main Responsive App Container */}
      <div className={`w-full max-w-md min-h-screen ${currentUser ? 'bg-slate-50 text-slate-900' : 'bg-blue-950 text-white'} relative shadow-2xl flex flex-col`}>
        {/* Push Notification Toast */}
        {activeNotification && currentUser && (
          <div
            id="app-push-toast"
            className="fixed top-4 left-4 right-4 max-w-md mx-auto z-50 bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-top duration-200"
          >
            <ElsaLogo size="sm" withGlow />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-blue-300">Elsa Laundry</span>
                  <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 bg-blue-900/80 border border-blue-600/50 text-blue-200 rounded">
                    {currentUser.role}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">now</span>
              </div>
              <p className="text-xs font-semibold text-white mt-0.5">{activeNotification.title}</p>
              <p className="text-xs text-slate-300 line-clamp-2">{activeNotification.body}</p>
            </div>
            <button
              onClick={handleClearNotif}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Notification Drawer Sheet */}
        {showNotifDrawer && currentUser && (
          <div
            id="notification-drawer"
            className="absolute inset-x-0 top-0 bg-white shadow-2xl border-b border-slate-200 z-50 p-4 max-h-[380px] overflow-y-auto animate-in slide-in-from-top duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {currentUser.role === 'customer'
                    ? 'Customer Notifications'
                    : currentUser.role === 'driver'
                    ? 'Driver Notifications'
                    : 'Admin Alerts'} ({notifications.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearNotif}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Mark all read
                </button>
                <button
                  onClick={() => setShowNotifDrawer(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-2 space-y-2">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No notifications yet</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl text-xs ${
                      n.read ? 'bg-slate-50 text-slate-600' : 'bg-blue-50 border border-blue-200/60 text-slate-900'
                    }`}
                  >
                    <div className="flex justify-between items-center font-semibold mb-0.5">
                      <span className="text-blue-700">{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{n.timestamp}</span>
                    </div>
                    <p className="text-xs leading-relaxed">{n.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Global Top Banner: Laundry Name & User Current Location */}
        {currentUser && <TopLaundryBanner currentUser={currentUser} />}

        {/* Main App Content Viewport */}
        <main className={`flex-1 flex flex-col relative ${currentUser ? 'bg-slate-50 pb-24' : 'bg-blue-950 pb-2'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
