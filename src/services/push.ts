import { Capacitor } from '@capacitor/core';
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

/** Ask for permission, get this phone's FCM token and save it on the signed-in user. */
export async function registerPush(userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  activeUserId = userId;

  try {
    if (!listenersAdded) {
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
    }

    await PushNotifications.createChannel({
      id: 'elsa_orders',
      name: 'Order updates',
      description: 'Pickup, sorting, washing, delivery and payment updates',
      importance: 5,
      visibility: 1,
      vibration: true,
    });

    let permission = await PushNotifications.checkPermissions();
    if (permission.receive === 'prompt' || permission.receive === 'prompt-with-rationale') {
      permission = await PushNotifications.requestPermissions();
    }
    if (permission.receive !== 'granted') return;

    // Same phone, new user: the token is already known, so save it for them too.
    if (currentToken) await saveToken(userId, currentToken);
    await PushNotifications.register();
  } catch (err) {
    console.warn('Push setup failed:', err);
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
