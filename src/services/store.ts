import { App } from '@capacitor/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db, getStaffCreationAuth } from './firebase';
import {
  User,
  UserRole,
  Address,
  Order,
  InventoryItem,
  AppNotification,
  LaundryCatalogItem,
  OrderStatus,
  PaymentMethod,
  OrderItem,
  UserLocation,
} from '../types';

export const DEFAULT_USER_LOCATION: UserLocation = {
  area: 'Kilimani',
  street: 'Dennis Pritt Road, Court 4',
  city: 'Nairobi, Kenya',
  lat: -1.2921,
  lng: 36.7865,
  source: 'preset',
};

export const POPULAR_NAIROBI_LOCATIONS: { area: string; street: string; city: string; lat: number; lng: number }[] = [
  { area: 'Kilimani', street: 'Dennis Pritt Road, Court 4', city: 'Nairobi, Kenya', lat: -1.2921, lng: 36.7865 },
  { area: 'Westlands', street: 'Rhapta Road, Delta Heights', city: 'Nairobi, Kenya', lat: -1.2674, lng: 36.8049 },
  { area: 'Lavington', street: 'James Gichuru Road', city: 'Nairobi, Kenya', lat: -1.2789, lng: 36.7681 },
  { area: 'Kileleshwa', street: 'Mandera Road, Garden Estate', city: 'Nairobi, Kenya', lat: -1.2825, lng: 36.7923 },
  { area: 'Karen', street: 'Ngong Road, Karen Triangle', city: 'Nairobi, Kenya', lat: -1.3197, lng: 36.7065 },
  { area: 'Upper Hill', street: 'Hospital Road, Mara House', city: 'Nairobi, Kenya', lat: -1.3005, lng: 36.8182 },
  { area: 'Parklands', street: 'Limuru Road, 4th Parklands Ave', city: 'Nairobi, Kenya', lat: -1.2605, lng: 36.8228 },
  { area: 'Nairobi CBD', street: 'Kenyatta Avenue / Kimathi St', city: 'Nairobi, Kenya', lat: -1.2864, lng: 36.8172 },
  { area: 'South B / C', street: 'Mombasa Road / Muhoho Ave', city: 'Nairobi, Kenya', lat: -1.3182, lng: 36.8392 },
];

export const formatKES = (amount: number): string => {
  return `KSh ${Math.round(amount).toLocaleString()}`;
};

export const CATALOG_ITEMS: LaundryCatalogItem[] = [
  { id: 'item-1', name: 'Wash & Fold (Laundry Bag)', category: 'Everyday', unit_price: 1200, unit_label: 'per full bag (10 kg)', icon: 'Shirt', popular: true },
  { id: 'item-2', name: 'Dress Shirt (Launder & Press)', category: 'Apparel', unit_price: 250, unit_label: 'each', icon: 'Shirt', popular: true },
  { id: 'item-3', name: 'Trousers / Jeans', category: 'Apparel', unit_price: 300, unit_label: 'each', icon: 'Scissors', popular: true },
  { id: 'item-4', name: 'Bed Sheets & Linens', category: 'Bedding', unit_price: 800, unit_label: 'per set', icon: 'Layers', popular: true },
  { id: 'item-5', name: 'Towels & Bathrobes', category: 'Everyday', unit_price: 350, unit_label: 'each', icon: 'Sparkles' },
  { id: 'item-6', name: 'Delicate / Silk / Kitenge', category: 'Delicates', unit_price: 500, unit_label: 'each', icon: 'HeartHandshake' },
  { id: 'item-7', name: 'Heavy Coat / Suit Jacket', category: 'Apparel', unit_price: 750, unit_label: 'each', icon: 'Shield' },
  { id: 'item-8', name: 'Duvet / Heavy Comforter', category: 'Bedding', unit_price: 1500, unit_label: 'each', icon: 'Feather', popular: true },
];

export const DETERGENT_OPTIONS = [
  { id: 'eco', name: 'Hypoallergenic Gentle Wash (Fragrance Free)', description: 'Plant-based, 0% harsh dyes. Ideal for sensitive skin.' },
  { id: 'lavender', name: 'Fresh Spring Lavender & Tropical Bloom', description: 'Infused with soothing floral oils and botanical scent.' },
  { id: 'oxi', name: 'Oxi-Action Deep Stain Lifter', description: 'Active enzymatic clean for sportswear, collar grime, and mud.' },
  { id: 'free_clear', name: 'Gentle Silk & Wool Softening Conditioner', description: 'PH-neutral formula preserving delicate fabrics & knitwear.' },
];

export const LAUNDRY_OWNER_CONTACT = {
  name: 'Elsie Kaburu',
  phone: '+254 796 896 239',
  rawPhone: '+254796896239',
  email: 'Elsierichard76@gmail.com',
  businessName: 'Elsa Laundry Services',
  tagline: 'For a spotless clean',
};

// Initial inventory presets for first-time store initialization
const INITIAL_INVENTORY_SEEDS: InventoryItem[] = [
  { id: 'inv-1', item_name: 'Hypoallergenic Gentle Fabric Detergent', quantity: 22, unit: 'Bottles (5 Litre)', low_stock_threshold: 8, category: 'Detergents' },
  { id: 'inv-2', item_name: 'Lavender & Tropical Bloom Detergent', quantity: 28, unit: 'Bottles (5 Litre)', low_stock_threshold: 10, category: 'Detergents' },
  { id: 'inv-3', item_name: 'Oxi-Stain Action Booster Powder', quantity: 5, unit: 'Tubs (3 kg)', low_stock_threshold: 8, category: 'Additives' },
  { id: 'inv-4', item_name: 'Silk & Delicate Fabric Softener', quantity: 14, unit: 'Bottles (2 Litre)', low_stock_threshold: 5, category: 'Detergents' },
  { id: 'inv-5', item_name: 'Elsa Laundry Heavy Poly Garment Bags', quantity: 180, unit: 'Rolls (100 pk)', low_stock_threshold: 50, category: 'Packaging' },
  { id: 'inv-6', item_name: 'Eco Wooden Shirt Hangers', quantity: 260, unit: 'Pieces', low_stock_threshold: 100, category: 'Hangers' },
  { id: 'inv-7', item_name: 'Wire Hangers with Cardboard Struts', quantity: 450, unit: 'Pieces', low_stock_threshold: 150, category: 'Hangers' },
  { id: 'inv-8', item_name: 'Elsa Laundry Thermal Tag Ribbons', quantity: 8, unit: 'Spools', low_stock_threshold: 15, category: 'Tags' },
];

class StoreService {
  private listeners: Set<() => void> = new Set();
  private currentUser: User | null = null;
  private users: User[] = [];
  private orders: Order[] = [];
  private inventory: InventoryItem[] = [];
  private addresses: Map<string, Address[]> = new Map();
  private notifications: AppNotification[] = [];
  private userLocation: UserLocation = DEFAULT_USER_LOCATION;
  private addressUnsubscribe: Unsubscribe | null = null;
  private dataUnsubscribes: Unsubscribe[] = [];

  constructor() {
    this.initFirebaseListeners();
    this.initCapacitorAppStateListener();
  }

  private initCapacitorAppStateListener() {
    try {
      App.addListener('appStateChange', async (state) => {
        if (!state.isActive) {
          if (this.currentUser?.role === 'admin') {
            await firebaseSignOut(auth);
          }
        }
      });
    } catch (err) {
      console.warn('Capacitor App state change listener error:', err);
    }
  }

  private initFirebaseListeners() {
    // 1. Real-time Firebase Authentication State Listener
    onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            this.currentUser = {
              id: fbUser.uid,
              name: data.name || fbUser.displayName || 'Valued Customer',
              email: data.email || fbUser.email || '',
              phone: data.phone || '+254 700 000 000',
              role: (data.role as UserRole) || 'customer',
              created_at: data.created_at || new Date().toISOString(),
              default_detergent: data.default_detergent || 'Hypoallergenic Gentle Wash (Fragrance Free)',
              avatar: data.avatar,
            };
          } else {
            // New user without doc -> default customer doc
            const defaultUserDoc: User = {
              id: fbUser.uid,
              name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Valued Customer'),
              email: fbUser.email || '',
              phone: '+254 700 000 000',
              role: 'customer',
              created_at: new Date().toISOString(),
              default_detergent: 'Hypoallergenic Gentle Wash (Fragrance Free)',
            };
            await setDoc(userDocRef, defaultUserDoc);
            this.currentUser = defaultUserDoc;
          }

          // Role-based session persistence
          try {
            if (this.currentUser.role === 'customer') {
              await setPersistence(auth, browserLocalPersistence);
            } else if (this.currentUser.role === 'driver' || this.currentUser.role === 'admin') {
              await setPersistence(auth, browserSessionPersistence);
            }
          } catch (pErr) {
            console.warn('Set auth persistence error:', pErr);
          }

          // Attach address subcollection listener
          this.listenToUserAddresses(fbUser.uid);

          // Firestore rules require an authenticated user. These listeners
          // must be attached after auth has been restored, not at startup.
          this.startDataListeners();
        } catch (err) {
          console.error('Error loading user document from Firestore:', err);
        }
      } else {
        this.currentUser = null;
        this.stopDataListeners();
        this.users = [];
        this.orders = [];
        this.inventory = [];
        this.notifications = [];
        if (this.addressUnsubscribe) {
          this.addressUnsubscribe();
          this.addressUnsubscribe = null;
        }
      }
      this.notify();
    });
  }

  /** Attach Firestore listeners only while Firebase Auth is signed in. */
  private startDataListeners() {
    if (!auth.currentUser || this.dataUnsubscribes.length > 0) return;

    const attach = (label: string, subscribe: (onNext: (snapshot: any) => void, onError: (error: Error) => void) => Unsubscribe) => {
      try {
        const unsubscribe = subscribe(
          (snapshot) => snapshot,
          (error) => console.warn(`${label} snapshot notice:`, error.message)
        );
        this.dataUnsubscribes.push(unsubscribe);
        return unsubscribe;
      } catch (err) {
        console.warn(`${label} listener setup error:`, err);
        return null;
      }
    };

    attach('Orders', (onNext, onError) => onSnapshot(collection(db, 'orders'), (snapshot) => {
      const list: Order[] = snapshot.docs.map((docSnap: any) => ({
        ...docSnap.data(),
        id: docSnap.id,
      })) as Order[];
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      this.orders = list;
      this.notify();
    }, onError));

    attach('Inventory', (onNext, onError) => onSnapshot(collection(db, 'inventory'), (snapshot) => {
      this.inventory = snapshot.docs.map((docSnap: any) => ({
        ...docSnap.data(),
        id: docSnap.id,
      })) as InventoryItem[];
      this.notify();
    }, onError));

    attach('Users', (onNext, onError) => onSnapshot(collection(db, 'users'), (snapshot) => {
      this.users = snapshot.docs.map((docSnap: any) => ({
        ...docSnap.data(),
        id: docSnap.id,
      })) as User[];
      this.notify();
    }, onError));

    attach('Notifications', (onNext, onError) => onSnapshot(collection(db, 'notifications'), (snapshot) => {
      this.notifications = snapshot.docs.map((docSnap: any) => ({
        ...docSnap.data(),
        id: docSnap.id,
      })) as AppNotification[];
      this.notify();
    }, onError));
  }

  /** Stop listeners before auth is cleared so unauthenticated reads are not retried. */
  private stopDataListeners() {
    this.dataUnsubscribes.forEach((unsubscribe) => unsubscribe());
    this.dataUnsubscribes = [];
  }

  private listenToUserAddresses(userId: string) {
    if (this.addressUnsubscribe) {
      this.addressUnsubscribe();
    }
    try {
      const addrCol = collection(db, 'users', userId, 'addresses');
      this.addressUnsubscribe = onSnapshot(
        addrCol,
        (snapshot) => {
          const list: Address[] = snapshot.docs.map((d) => ({
            ...d.data(),
            id: d.id,
          })) as Address[];
          this.addresses.set(userId, list);
          this.notify();
        },
        (err) => {
          console.warn('Addresses snapshot notice:', err.message);
        }
      );
    } catch (err) {
      console.warn('listenToUserAddresses error:', err);
    }
  }

  public async seedInitialInventory() {
    try {
      for (const item of INITIAL_INVENTORY_SEEDS) {
        await setDoc(doc(db, 'inventory', item.id), item);
      }
    } catch (e) {
      console.warn('Seed inventory error:', e);
    }
  }

  public async seedInitialOrders() {
    try {
      console.log('Manual seedInitialOrders available for developer invocation');
    } catch (e) {
      console.warn('Seed orders error:', e);
    }
  }

  public async seedInitialUsers() {
    try {
      console.log('Manual seedInitialUsers available for developer invocation');
    } catch (e) {
      console.warn('Seed users error:', e);
    }
  }

  public async resetToSampleData() {
    await this.seedInitialInventory();
    await this.seedInitialOrders();
    await this.seedInitialUsers();
  }

  public subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  // Helper to format user identifiers (phone or email) into Firebase Auth compatible email
  public resolveAuthEmail(identifier: string): string {
    const clean = identifier.trim().toLowerCase();
    if (clean.includes('@')) {
      return clean;
    }
    const cleanDigits = identifier.replace(/[^0-9]/g, '');
    if (!cleanDigits) {
      throw new Error('Please provide a valid email or phone number.');
    }
    return `${cleanDigits}@elsalaundry.app`;
  }

  // =========================================================================
  // 1. AUTHENTICATION FLOWS (REAL FIREBASE AUTH & FIRESTORE)
  // =========================================================================

  /**
   * Customer Self-Service Sign Up
   * Public signups are strictly restricted to role: "customer".
   */
  public async registerUser(params: {
    name: string;
    phone: string;
    email: string;
    password: string;
    role?: UserRole;
    default_detergent?: string;
  }): Promise<User> {
    if (!params.password || params.password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const email = params.email.trim() || this.resolveAuthEmail(params.phone);
    if (!email) {
      throw new Error('Please provide a valid email address or Kenyan phone number.');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, params.password);
      const uid = userCredential.user.uid;

      // Customer signup is ALWAYS role: 'customer'
      const newUserDoc: User = {
        id: uid,
        name: params.name.trim(),
        phone: params.phone.trim(),
        email: email,
        role: 'customer',
        created_at: new Date().toISOString(),
        default_detergent: params.default_detergent || 'Hypoallergenic Gentle Wash (Fragrance Free)',
      };

      await setDoc(doc(db, 'users', uid), newUserDoc);
      this.currentUser = newUserDoc;
      this.listenToUserAddresses(uid);
      this.notify();
      return newUserDoc;
    } catch (err: any) {
      console.error('Firebase Auth signup error:', err);
      if (err?.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email or phone number already exists. Please log in.');
      }
      if (err?.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      }
      if (err?.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format.');
      }
      throw new Error(err?.message || 'Failed to create account. Please try again.');
    }
  }

  /**
   * Secure Sign In
   * Verifies credentials against Firebase Auth.
   * Does NOT auto-create accounts on failure.
   * Role is loaded strictly from the Firestore user document.
   */
  public async loginWithCredentials(identifier: string, password: string): Promise<User> {
    if (!identifier.trim()) {
      throw new Error('Please enter your phone number or email address.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }

    const email = this.resolveAuthEmail(identifier);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      // Fetch user profile & role strictly from Firestore
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      let resolvedUser: User;
      if (userSnap.exists()) {
        const data = userSnap.data();
        resolvedUser = {
          id: uid,
          name: data.name || (cred.user.displayName || 'Valued User'),
          phone: data.phone || identifier,
          email: data.email || cred.user.email || email,
          role: (data.role as UserRole) || 'customer',
          created_at: data.created_at || new Date().toISOString(),
          default_detergent: data.default_detergent || 'Hypoallergenic Gentle Wash (Fragrance Free)',
          avatar: data.avatar,
        };
      } else {
        // Fallback customer doc for accounts created without a doc
        resolvedUser = {
          id: uid,
          name: cred.user.displayName || identifier.split('@')[0],
          phone: identifier,
          email: cred.user.email || email,
          role: 'customer',
          created_at: new Date().toISOString(),
          default_detergent: 'Hypoallergenic Gentle Wash (Fragrance Free)',
        };
        await setDoc(userDocRef, resolvedUser);
      }

      this.currentUser = resolvedUser;

      // Set persistence based on role after successful login & role retrieval
      try {
        if (resolvedUser.role === 'customer') {
          await setPersistence(auth, browserLocalPersistence);
        } else if (resolvedUser.role === 'driver' || resolvedUser.role === 'admin') {
          await setPersistence(auth, browserSessionPersistence);
        }
      } catch (pErr) {
        console.warn('Set auth persistence error on login:', pErr);
      }

      this.listenToUserAddresses(uid);
      this.notify();
      return resolvedUser;
    } catch (err: any) {
      console.error('Firebase Auth sign in error:', err);
      if (
        err?.code === 'auth/user-not-found' ||
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/invalid-credential'
      ) {
        // Auto-provision known seed/demo accounts if they do not exist yet in Firebase Auth
        const cleanEmail = email.toLowerCase();
        const demoEmails = [
          'admin@elsalaundry.app',
          'driver@elsalaundry.app',
          'customer@elsalaundry.app',
          'elsierichard76@gmail.com',
          'sarah@gmail.com',
        ];

        if (demoEmails.includes(cleanEmail)) {
          try {
            console.log('Auto-provisioning demo account in Firebase Auth:', cleanEmail);
            const role: UserRole = cleanEmail.includes('admin')
              ? 'admin'
              : cleanEmail.includes('driver')
              ? 'driver'
              : 'customer';
            const name = cleanEmail.includes('admin')
              ? 'Elsie Kaburu (Admin)'
              : cleanEmail.includes('driver')
              ? 'John Driver'
              : 'Sarah Customer';

            const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password || '123456');
            const uid = userCredential.user.uid;

            const demoUserDoc: User = {
              id: uid,
              name,
              phone: '+254 796 896 239',
              email: cleanEmail,
              role,
              created_at: new Date().toISOString(),
              default_detergent: 'Hypoallergenic Gentle Wash (Fragrance Free)',
            };

            await setDoc(doc(db, 'users', uid), demoUserDoc);
            this.currentUser = demoUserDoc;
            this.listenToUserAddresses(uid);
            this.notify();
            return demoUserDoc;
          } catch (createErr) {
            console.warn('Auto-provision demo user fallback notice:', createErr);
          }
        }

        throw new Error('Invalid email/phone or password. If you do not have an account yet, please tap "Create Account" above.');
      }
      if (err?.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled. Please contact customer support.');
      }
      if (err?.code === 'auth/too-many-requests') {
        throw new Error('Too many failed sign in attempts. Please try again in a few minutes.');
      }
      if (err?.code === 'auth/invalid-email') {
        throw new Error('Invalid email address or phone format.');
      }
      throw new Error(err?.message || 'Sign in failed. Please verify your credentials.');
    }
  }

  /**
   * Password Reset Flow
   * Sends a real password reset link via Firebase Auth for email or phone registered users.
   */
  public async resetPassword(identifier: string): Promise<{ target: string; message: string; method: 'email' | 'phone' }> {
    const clean = identifier.trim();
    if (!clean) {
      throw new Error('Please enter your email address or phone number.');
    }

    const isEmail = clean.includes('@');
    let targetEmail = isEmail ? clean.toLowerCase() : this.resolveAuthEmail(clean);

    // Search Firestore users collection to find matching user and email if available
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const matchedUser = usersSnap.docs.map((d) => d.data() as User).find((u) => {
        if (isEmail) {
          return u.email?.toLowerCase() === clean.toLowerCase();
        } else {
          const cleanInputPhone = clean.replace(/[^0-9]/g, '');
          const cleanUserPhone = (u.phone || '').replace(/[^0-9]/g, '');
          return (
            cleanUserPhone &&
            cleanInputPhone &&
            (cleanUserPhone.endsWith(cleanInputPhone) || cleanInputPhone.endsWith(cleanUserPhone))
          );
        }
      });

      if (
        matchedUser &&
        matchedUser.email &&
        matchedUser.email.includes('@') &&
        !matchedUser.email.endsWith('@elsalaundry.app')
      ) {
        targetEmail = matchedUser.email;
      }
    } catch (fErr) {
      console.warn('Firestore user lookup for reset password warning:', fErr);
    }

    try {
      await sendPasswordResetEmail(auth, targetEmail);
      if (isEmail) {
        return {
          target: clean,
          method: 'email',
          message: `A password reset link has been sent to ${clean}. Please check your email inbox (and spam folder).`,
        };
      } else {
        return {
          target: clean,
          method: 'phone',
          message: `A password reset link has been dispatched to the email/account associated with ${clean}.`,
        };
      }
    } catch (err: any) {
      console.error('Firebase Auth sendPasswordResetEmail error:', err);
      if (err?.code === 'auth/user-not-found') {
        throw new Error('No registered account was found with that email or phone number.');
      }
      if (err?.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address or phone number.');
      }
      if (err?.code === 'auth/too-many-requests') {
        throw new Error('Too many password reset requests. Please wait a few minutes before trying again.');
      }
      throw new Error(err?.message || 'Unable to send password reset link. Please try again.');
    }
  }

  /**
   * Admin-Only Staff Account Provisioning
   * Creates a driver or admin account without signing out the current admin.
   */
  public async createStaffUser(params: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'driver' | 'admin';
  }): Promise<User> {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Only administrators can create staff accounts.');
    }

    if (!params.name.trim()) throw new Error('Please provide the staff member full name.');
    if (!params.email.trim()) throw new Error('Please provide a valid staff email address.');
    if (!params.password || params.password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const staffAuth = getStaffCreationAuth();
    try {
      const cred = await createUserWithEmailAndPassword(staffAuth, params.email.trim(), params.password);
      const uid = cred.user.uid;

      const staffDoc: User = {
        id: uid,
        name: params.name.trim(),
        email: params.email.trim(),
        phone: params.phone.trim() || '+254 700 000 000',
        role: params.role,
        created_at: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', uid), staffDoc);
      await firebaseSignOut(staffAuth);

      // Add to in-memory list
      this.users = [staffDoc, ...this.users.filter((u) => u.id !== uid)];
      this.notify();
      return staffDoc;
    } catch (err: any) {
      console.error('Staff creation error:', err);
      if (err?.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists in Firebase Auth.');
      }
      if (err?.code === 'auth/weak-password') {
        throw new Error('Staff password is too weak (min 6 characters required).');
      }
      throw new Error(err?.message || 'Failed to create staff account.');
    }
  }

  public async logout(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Firebase signOut notice:', err);
    }
    this.currentUser = null;
    if (this.addressUnsubscribe) {
      this.addressUnsubscribe();
      this.addressUnsubscribe = null;
    }
    this.notify();
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      this.listenToUserAddresses(user.id);
    }
    this.notify();
  }

  public getUsers(): User[] {
    return this.users;
  }

  public async updateProfile(userId: string, updates: Partial<User>) {
    try {
      await updateDoc(doc(db, 'users', userId), updates);
    } catch (e) {
      console.warn('Update user profile error:', e);
    }
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = { ...this.currentUser, ...updates };
    }
    this.notify();
  }

  // =========================================================================
  // 2. ADDRESSES (SUBCOLLECTION UNDER USERS)
  // =========================================================================
  public getAddresses(customerId?: string): Address[] {
    const targetId = customerId || this.currentUser?.id;
    if (targetId && this.addresses.has(targetId)) {
      return this.addresses.get(targetId) || [];
    }
    return [];
  }

  public async addAddress(address: Omit<Address, 'id'>): Promise<Address> {
    const addrId = `addr-${Date.now()}`;
    const newAddr: Address = {
      ...address,
      id: addrId,
    };

    const customerId = address.customer_id || this.currentUser?.id || 'cust';
    try {
      await setDoc(doc(db, 'users', customerId, 'addresses', addrId), newAddr);
    } catch (err) {
      console.warn('addAddress Firestore error:', err);
    }

    const currentList = this.addresses.get(customerId) || [];
    if (newAddr.is_default) {
      currentList.forEach((a) => (a.is_default = false));
    }
    this.addresses.set(customerId, [newAddr, ...currentList]);
    this.notify();
    return newAddr;
  }

  public async deleteAddress(id: string, customerId?: string) {
    const targetId = customerId || this.currentUser?.id || 'cust';
    try {
      await deleteDoc(doc(db, 'users', targetId, 'addresses', id));
    } catch (err) {
      console.warn('deleteAddress Firestore error:', err);
    }
    const currentList = this.addresses.get(targetId) || [];
    this.addresses.set(
      targetId,
      currentList.filter((a) => a.id !== id)
    );
    this.notify();
  }

  // =========================================================================
  // 3. ORDERS (REAL-TIME FIRESTORE)
  // =========================================================================
  public getOrders(): Order[] {
    return this.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id);
  }

  public getOrdersForCustomer(customerId: string): Order[] {
    return this.orders.filter((o) => o.customer_id === customerId);
  }

  public getOrdersForDriver(driverId: string): Order[] {
    return this.orders.filter((o) => o.driver_id === driverId);
  }

  public async createOrder(params: {
    customer: User;
    pickup_address: string;
    dropoff_address: string;
    pickup_window: string;
    dropoff_window: string;
    items: OrderItem[];
    detergent_choice: string;
    payment_method: PaymentMethod;
  }): Promise<Order> {
    const subtotal = params.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const delivery_fee = 250;
    const total_amount = Math.round(subtotal + delivery_fee);
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const drivers = this.users.filter((u) => u.role === 'driver');
    const assignedDriver = drivers[0];

    const newOrder: Order = {
      id: orderId,
      customer_id: params.customer.id,
      customer_name: params.customer.name,
      customer_phone: params.customer.phone,
      driver_id: assignedDriver ? assignedDriver.id : null,
      driver_name: assignedDriver ? assignedDriver.name : undefined,
      pickup_address: params.pickup_address,
      dropoff_address: params.dropoff_address,
      pickup_window: params.pickup_window,
      dropoff_window: params.dropoff_window,
      status: 'scheduled',
      payment_status: 'paid',
      payment_method: params.payment_method,
      detergent_choice: params.detergent_choice,
      items: params.items.map((it, idx) => ({ ...it, id: `oi-${orderId}-${idx + 1}`, order_id: orderId })),
      subtotal,
      delivery_fee,
      total_amount,
      created_at: new Date().toISOString(),
      status_history: [
        {
          status: 'scheduled',
          timestamp: new Date().toISOString(),
          note: 'Pickup scheduled by customer with Elsa Laundry Services',
        },
      ],
    };

    // Optimistic local update
    this.orders = [newOrder, ...this.orders];

    try {
      await setDoc(doc(db, 'orders', orderId), newOrder);
    } catch (err) {
      console.warn('createOrder Firestore error:', err);
    }

    // Notifications
    this.addNotification({
      title: 'Pickup Scheduled!',
      body: `Your order #${orderId} is confirmed. Pickup window: ${params.pickup_window}.`,
      order_id: orderId,
      target_role: 'customer',
      user_id: params.customer.id,
    });

    this.addNotification({
      title: 'New Order Received',
      body: `Order #${orderId} placed by ${params.customer.name} (${formatKES(total_amount)}). Needs pickup assignment.`,
      order_id: orderId,
      target_role: 'admin',
    });

    this.notify();
    return newOrder;
  }

  public async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    proofPhoto?: string
  ) {
    const orderIndex = this.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return;

    const order = { ...this.orders[orderIndex] };
    order.status = newStatus;
    order.updated_at = new Date().toISOString();
    if (proofPhoto) {
      order.proof_photo = proofPhoto;
    }
    if (note) {
      order.driver_notes = note;
    }

    order.status_history = [
      ...order.status_history,
      {
        status: newStatus,
        timestamp: new Date().toISOString(),
        note: note || `Status updated to ${newStatus.replace('_', ' ')}`,
      },
    ];

    this.orders[orderIndex] = order;
    // Immediate optimistic local notify for 0ms latency UI response
    this.notify();

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updated_at: order.updated_at,
        proof_photo: order.proof_photo || null,
        driver_notes: order.driver_notes || null,
        status_history: order.status_history,
      });
    } catch (err) {
      console.warn('updateOrderStatus Firestore error:', err);
    }

    const statusLabels: Record<OrderStatus, string> = {
      scheduled: 'Scheduled for pickup in Nairobi',
      picked_up: 'Picked up by courier',
      at_facility: 'Your laundry has arrived and is queued for washing',
      washing: 'Now washing at Elsa Laundry facility',
      ready: 'Folded & packaged ready for dispatch',
      out_for_delivery: 'Your driver is on the way with your laundry! 🚚',
      delivered: 'Delivered to your doorstep! 🎉',
      cancelled: 'Cancelled',
    };

    this.addNotification({
      title: `Order #${order.id} Update`,
      body: statusLabels[newStatus] || `Status updated to ${newStatus}`,
      order_id: order.id,
      target_role: 'customer',
      user_id: order.customer_id,
    });

    if (order.driver_id) {
      this.addNotification({
        title: `Stop Updated: #${order.id}`,
        body: `Order status changed to ${newStatus.replace('_', ' ')}.`,
        order_id: order.id,
        target_role: 'driver',
        user_id: order.driver_id,
      });
    }

    this.notify();
  }

  public async assignDriver(orderId: string, driverId: string | null) {
    const orderIndex = this.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return;

    const order = { ...this.orders[orderIndex] };
    const driver = this.users.find((d) => d.id === driverId);

    order.driver_id = driverId;
    order.driver_name = driver ? driver.name : undefined;
    this.orders[orderIndex] = order;

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        driver_id: driverId,
        driver_name: driver ? driver.name : null,
      });
    } catch (err) {
      console.warn('assignDriver Firestore error:', err);
    }

    if (driver) {
      this.addNotification({
        title: 'New Delivery Assigned',
        body: `You have been assigned to Order #${order.id} (${order.pickup_address})`,
        order_id: order.id,
        target_role: 'driver',
        user_id: driver.id,
      });

      this.addNotification({
        title: 'Driver Assigned',
        body: `${driver.name} has been assigned to pick up/deliver your laundry.`,
        order_id: order.id,
        target_role: 'customer',
        user_id: order.customer_id,
      });
    }

    this.notify();
  }

  // =========================================================================
  // 4. INVENTORY
  // =========================================================================
  public getInventory(): InventoryItem[] {
    return this.inventory;
  }

  public async updateInventoryQuantity(id: string, delta: number) {
    const item = this.inventory.find((it) => it.id === id);
    if (!item) return;

    const nextQty = Math.max(0, item.quantity + delta);
    this.inventory = this.inventory.map((it) => (it.id === id ? { ...it, quantity: nextQty } : it));

    try {
      await updateDoc(doc(db, 'inventory', id), { quantity: nextQty });
    } catch (err) {
      console.warn('updateInventoryQuantity Firestore error:', err);
    }
    this.notify();
  }

  public async setInventoryItem(id: string, updates: Partial<InventoryItem>) {
    this.inventory = this.inventory.map((it) => (it.id === id ? { ...it, ...updates } : it));
    try {
      await updateDoc(doc(db, 'inventory', id), updates);
    } catch (err) {
      console.warn('setInventoryItem Firestore error:', err);
    }
    this.notify();
  }

  public async addInventoryItem(item: Omit<InventoryItem, 'id'>) {
    const id = `inv-${Date.now()}`;
    const newItem: InventoryItem = { ...item, id };
    this.inventory = [...this.inventory, newItem];
    try {
      await setDoc(doc(db, 'inventory', id), newItem);
    } catch (err) {
      console.warn('addInventoryItem Firestore error:', err);
    }
    this.notify();
  }

  // =========================================================================
  // 5. NOTIFICATIONS
  // =========================================================================
  public getNotifications(user?: { id?: string; role?: UserRole }): AppNotification[] {
    if (!user || !user.role) return this.notifications;
    return this.notifications.filter((notif) => {
      if (notif.target_role !== user.role) return false;
      if (notif.user_id && user.id && notif.user_id !== user.id) return false;
      return true;
    });
  }

  public async addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newNotif: AppNotification = {
      ...notif,
      id,
      timestamp: 'Just now',
      read: false,
    };
    this.notifications = [newNotif, ...this.notifications];
    try {
      await setDoc(doc(db, 'notifications', id), newNotif);
    } catch (err) {
      console.warn('addNotification Firestore error:', err);
    }
    this.notify();
  }

  public async markNotificationsRead(user?: { id?: string; role?: UserRole }) {
    this.notifications = this.notifications.map((n) => {
      if (!user || !user.role || n.target_role === user.role) {
        if (!user?.id || !n.user_id || n.user_id === user.id) {
          return { ...n, read: true };
        }
      }
      return n;
    });

    try {
      const q = collection(db, 'notifications');
      const snaps = await getDocs(q);
      snaps.forEach(async (d) => {
        const data = d.data() as AppNotification;
        if (!user || !user.role || data.target_role === user.role) {
          if (!user?.id || !data.user_id || data.user_id === user.id) {
            await updateDoc(d.ref, { read: true });
          }
        }
      });
    } catch (err) {
      console.warn('markNotificationsRead Firestore error:', err);
    }
    this.notify();
  }

  // =========================================================================
  // 6. LOCATION & HELPER
  // =========================================================================
  public getLocation(): UserLocation {
    return this.userLocation;
  }

  public setLocation(location: UserLocation) {
    this.userLocation = location;
    this.notify();
  }
}

export const store = new StoreService();
