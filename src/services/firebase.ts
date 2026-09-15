import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyCoCHWw0oz-jglkwupKYJdctpnnbnKBsGg",
  authDomain: "elsa-laundry-services.firebaseapp.com",
  projectId: "elsa-laundry-services",
  storageBucket: "elsa-laundry-services.firebasestorage.app",
  messagingSenderId: "778109549619",
  appId: "1:778109549619:web:5d4787e0144be790f4b746"
};

// Primary App instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Secondary Auth instance for Admin Staff Provisioning (avoids logging out active admin)
export function getStaffCreationAuth() {
  const staffAppName = 'staff-admin-creator';
  const existingApps = getApps();
  const staffApp = existingApps.find(a => a.name === staffAppName) || initializeApp(firebaseConfig, staffAppName);
  return getAuth(staffApp);
}
