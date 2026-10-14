import { Capacitor, registerPlugin } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from './firebase';

let listenersAdded = false;
let currentToken: string | null = null;
let activeUserId: string | null = null;

const saveToken = async (userId: string, token: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), { fcm_tokens: arrayUnion(token) });
  } catch (err) {
    console.warn('Saving push token failed:', err);
  }
};

export type PushPermission = 'granted' | 'denied' | 'prompt' | 'unsupported';

const AppSettings = registerPlugin<{ openNotificationSettings(): Promise<void> }>('AppSettings');

/** Current notification permission on this phone. */
export async function getPushPermission(): Promise<PushPermission> {
  if (!Capacitor.isNativePlatform()) return 'unsupported';
  try {
    const p = await PushNotifications.checkPermissions();
    if (p.receive === 'granted') return 'granted';
    if (p.receive === 'denied') return 'denied';
    return 'prompt';
  } catch {
    return 'unsupported';
  }
}

/** Opens this app's notification settings in the phone's Settings. */
export async function openNotificationSettings(): Promise<void> {
  try {
    await AppSettings.openNotificationSettings();
  } catch (err) {
    console.warn('Could not open settings:', err);
  }
}

const addListenersOnce = async () => {
  if (listenersAdded) return;
  listenersAdded = true;

  await PushNotifications.addListener('registration', (result) => {
    currentToken = result.value;
    if (activeUserId) void saveToken(activeUserId, result.value);
  });

  await PushNotifications.addListener('registrationError', (err) => {
    console.warn('Push registration error:', err);
  });

  // Tapping a notification opens the related order.
  await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const orderId = action.notification?.data?.order_id as string | undefined;
    window.dispatchEvent(new CustomEvent('elsa:open-order', { detail: { orderId } }));
  });
};

const registerNow = async (userId: string) => {
  await PushNotifications.createChannel({
    id: 'elsa_orders',
    name: 'Order updates',
    description: 'Pickup, sorting, washing, delivery and payment updates',
    importance: 5,
    visibility: 1,
    vibration: true,
  });
  // Same phone, new user: the token is already known, so save it for them too.
  if (currentToken) await saveToken(userId, currentToken);
  await PushNotifications.register();
};

/**
 * Call after sign-in. If permission is already granted this connects the phone silently.
 * It never shows the system permission box: the friendly prompt in the app does that.
 */
export async function registerPush(userId: string): Promise<PushPermission> {
  if (!Capacitor.isNativePlatform()) return 'unsupported';
  activeUserId = userId;
  try {
    await addListenersOnce();
    const permission = await getPushPermission();
    if (permission === 'granted') await registerNow(userId);
    return permission;
  } catch (err) {
    console.warn('Push setup failed:', err);
    return 'unsupported';
  }
}

/** Shows the system permission box (when Android still allows it) and connects the phone. */
export async function enablePush(userId: string): Promise<PushPermission> {
  if (!Capacitor.isNativePlatform()) return 'unsupported';
  activeUserId = userId;
  try {
    await addListenersOnce();
    const result = await PushNotifications.requestPermissions();
    if (result.receive === 'granted') {
      await registerNow(userId);
      return 'granted';
    }
    return result.receive === 'denied' ? 'denied' : 'prompt';
  } catch (err) {
    console.warn('Enabling push failed:', err);
    return 'denied';
  }
}

/** Stop this phone receiving the signed-out user's notifications. Call before signing out. */
export async function unregisterPush(userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform() || !currentToken) return;
  try {
    await updateDoc(doc(db, 'users', userId), { fcm_tokens: arrayRemove(currentToken) });
  } catch (err) {
    console.warn('Removing push token failed:', err);
  }
  activeUserId = null;
}

// After you deploy the Cloudflare worker (see worker/), paste its address here.
const PUSH_WORKER_URL = 'https://elsa-push.loydmawira.workers.dev';

/** Ask the push worker to send the phone notification for a saved notification. */
export async function sendPush(notificationId: string): Promise<void> {
  if (!PUSH_WORKER_URL) return;
  try {
    const user = auth.currentUser;
    if (!user) return;
    const idToken = await user.getIdToken();
    await fetch(PUSH_WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ notification_id: notificationId }),
    });
  } catch (err) {
    console.warn('Sending push failed:', err);
  }
}
