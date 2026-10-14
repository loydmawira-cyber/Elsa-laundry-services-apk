import React, { useCallback, useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { enablePush, getPushPermission, openNotificationSettings, registerPush } from '../services/push';

const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000; // ask again after 3 days

interface Props {
  userId: string;
}

/**
 * Friendly explanation before the phone's permission box, plus a reminder with a
 * "Open settings" button for people who have blocked notifications.
 */
export function NotificationPrompt({ userId }: Props) {
  const [mode, setMode] = useState<'none' | 'ask' | 'blocked'>('none');
  const snoozeKey = `elsa-push-snooze-${userId}`;

  const check = useCallback(async () => {
    const permission = await registerPush(userId);
    if (permission === 'granted' || permission === 'unsupported') {
      setMode('none');
      return;
    }
    const snoozedAt = Number(localStorage.getItem(snoozeKey) || 0);
    if (Date.now() - snoozedAt < SNOOZE_MS) {
      setMode('none');
      return;
    }
    setMode(permission === 'denied' ? 'blocked' : 'ask');
  }, [userId, snoozeKey]);

  useEffect(() => {
    void check();
    // Re-check when the user comes back from phone settings
    const onVisible = () => {
      if (document.visibilityState === 'visible') void check();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [check]);

  const later = () => {
    localStorage.setItem(snoozeKey, String(Date.now()));
    setMode('none');
  };

  const turnOn = async () => {
    const result = await enablePush(userId);
    if (result === 'granted') setMode('none');
    else setMode('blocked'); // Android will not show the box again, so guide to settings
  };

  if (mode === 'none') return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-[60]">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            {mode === 'ask' ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {mode === 'ask' ? 'Stay updated on your laundry' : 'Notifications are turned off'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'ask'
                ? 'Turn on notifications to get pickup, sorting, washing, delivery and payment updates, and to approve your final price quickly.'
                : 'You may miss pickup, sorting and delivery updates. Turn them on in your phone settings.'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={mode === 'ask' ? turnOn : openNotificationSettings}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            {mode === 'ask' ? 'Turn on notifications' : 'Open settings'}
          </button>
          <button onClick={later} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
