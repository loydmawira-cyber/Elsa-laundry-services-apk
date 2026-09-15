import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCoCHWw0oz-jglkwupKYJdctpnnbnKBsGg",
  authDomain: "elsa-laundry-services.firebaseapp.com",
  projectId: "elsa-laundry-services",
  storageBucket: "elsa-laundry-services.firebasestorage.app",
  messagingSenderId: "778109549619",
  appId: "1:778109549619:web:5d4787e0144be790f4b746"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
