import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Battery,
  Signal,
  Bell,
  Sparkles,
  Smartphone,
  Maximize2,
  Minimize2,
  RefreshCw,
  LogOut,
  UserCheck,
  Truck,
  Shield,
  User as UserIcon,
  X,
  CheckCircle2,
  ExternalLink,
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
  const [currentTime, setCurrentTime] = useState('9:41');
  const [isFramed, setIsFramed] = useState(true);
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-0 sm:p-4 font-sans">
      {/* Main Phone Container */}
      <div
        className={`w-full transition-all duration-300 flex justify-center ${
          isFramed ? 'max-w-[420px]' : 'max-w-4xl'
        }`}
      >
        <div
          className={`w-full bg-slate-50 text-slate-900 relative shadow-2xl flex flex-col overflow-hidden ${
            isFramed
              ? 'rounded-[44px] border-[10px] border-slate-800 ring-1 ring-slate-700 min-h-[840px] max-h-[90vh]'
              : 'rounded-2xl border border-slate-200 min-h-[820px]'
          }`}
          style={{ height: isFramed ? '860px' : 'auto' }}
        >
          {/* Android Status Bar */}
          <div
            id="android-status-bar"
            className="w-full bg-white text-slate-800 px-6 pt-3 pb-2 flex items-center justify-between text-xs font-semibold select-none border-b border-slate-100 z-30"
          >
            <span className="tracking-tight text-slate-900">{currentTime}</span>

            {/* Android Notch / Camera cutout */}
            {isFramed && (
              <div className="w-4 h-4 rounded-full bg-slate-900 mx-auto -mt-1 ring-2 ring-slate-800 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-950/80"></div>
              </div>
            )}

            <div className="flex items-center gap-2 text-slate-700">
              {currentUser && (
                <button
                  id="notification-bell-btn"
                  onClick={() => setShowNotifDrawer(!showNotifDrawer)}
                  className="relative p-0.5 hover:text-blue-600 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500"></span>
                  )}
                </button>
              )}
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px]">98%</span>
                <Battery className="w-3.5 h-3.5 fill-slate-800" />
              </div>
            </div>
          </div>

          {/* Android Heads-Up Push Notification Toast (Material Banner) */}
          {activeNotification && currentUser && (
            <div
              id="android-push-toast"
              className="absolute top-12 left-3 right-3 z-50 bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700/80 backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-top duration-200"
            >
              <ElsaLogo size="sm" withGlow />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-blue-300">Elsa Laundry Notice</span>
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
              className="absolute inset-x-0 top-11 bg-white/95 backdrop-blur-md shadow-2xl border-b border-slate-200 z-40 p-4 max-h-[360px] overflow-y-auto animate-in slide-in-from-top-2 duration-150"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {currentUser.role === 'customer'
                      ? 'Customer Notifications'
                      : currentUser.role === 'driver'
                      ? 'Driver Notifications'
                      : 'Admin System Alerts'} ({notifications.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearNotif}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mark read
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
          <main className="flex-1 overflow-y-auto flex flex-col bg-slate-50 relative">
            {children}
          </main>

          {/* Android Gesture Bar / Home Indicator */}
          {isFramed && (
            <div className="w-full py-2 bg-white flex justify-center items-center shrink-0 border-t border-slate-100">
              <div className="w-32 h-1 bg-slate-400/70 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
