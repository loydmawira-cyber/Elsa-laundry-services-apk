import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
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
import { auth, db } from './firebase';
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

const INITIAL_USERS: User[] = [
  {
    id: 'cust-1',
    name: 'Sarah Wanjiku',
    phone: '+254 712 345 678',
    email: 'sarah.wanjiku@gmail.com',
    role: 'customer',
    created_at: '2026-08-10T10:00:00Z',
    default_detergent: 'Hypoallergenic Gentle Wash (Fragrance Free)',
  },
  {
    id: 'driver-1',
    name: 'Brian Mwangi',
    phone: '+254 791 234 567',
    email: 'brian.mwangi@elsalaundry.co.ke',
    role: 'driver',
    created_at: '2026-07-15T09:00:00Z',
  },
  {
    id: 'driver-2',
    name: 'Kevin Otieno',
    phone: '+254 788 654 321',
    email: 'kevin.otieno@elsalaundry.co.ke',
    role: 'driver',
    created_at: '2026-08-01T08:30:00Z',
  },
  {
    id: 'admin-1',
    name: 'Elsie Kaburu',
    phone: '+254 796 896 239',
    email: 'Elsierichard76@gmail.com',
    role: 'admin',
    created_at: '2026-06-01T12:00:00Z',
  },
];

const INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    customer_id: 'cust-1',
    label: 'Home (Apartment)',
    street: 'Dennis Pritt Road, Kilimani Heights Apt 4B',
    city: 'Kilimani, Nairobi',
    lat: -1.2921,
    lng: 36.7865,
    is_default: true,
  },
  {
    id: 'addr-2',
    customer_id: 'cust-1',
    label: 'Office',
    street: 'Delta Corner Towers, 8th Floor, Waiyaki Way',
    city: 'Westlands, Nairobi',
    lat: -1.2647,
    lng: 36.8043,
    is_default: false,
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-8921',
    customer_id: 'cust-1',
    customer_name: 'Sarah Wanjiku',
    customer_phone: '+254 712 345 678',
    driver_id: 'driver-1',
    driver_name: 'Brian Mwangi',
    pickup_address: 'Dennis Pritt Road, Kilimani Heights Apt 4B, Kilimani, Nairobi',
    dropoff_address: 'Dennis Pritt Road, Kilimani Heights Apt 4B, Kilimani, Nairobi',
    pickup_window: 'Today, 8:00 AM - 10:00 AM',
    dropoff_window: 'Tomorrow, 4:00 PM - 6:00 PM',
    status: 'washing',
    payment_status: 'paid',
    payment_method: 'mpesa',
    detergent_choice: 'Hypoallergenic Gentle Wash (Fragrance Free)',
    items: [
      { id: 'oi-1', order_id: 'ORD-8921', item_type: 'Dress Shirt (Launder & Press)', quantity: 4, care_notes: 'Light starch, hang on wooden hangers', price: 250 },
      { id: 'oi-2', order_id: 'ORD-8921', item_type: 'Trousers / Jeans', quantity: 2, care_notes: 'Cold wash only, no dryer', price: 300 },
      { id: 'oi-3', order_id: 'ORD-8921', item_type: 'Wash & Fold (Laundry Bag)', quantity: 1, care_notes: 'Separate darks and white garments', price: 1200 },
    ],
    subtotal: 2200,
    delivery_fee: 250,
    total_amount: 2450,
    created_at: '2026-09-14T07:30:00Z',
    status_history: [
      { status: 'scheduled', timestamp: '2026-09-14T07:30:00Z', note: 'Order placed & scheduled' },
      { status: 'picked_up', timestamp: '2026-09-14T08:45:00Z', note: 'Driver Brian Mwangi collected laundry from concierge' },
      { status: 'washing', timestamp: '2026-09-14T11:15:00Z', note: 'Garment sorting & wash cycle started at Kilimani facility' },
    ],
  },
  {
    id: 'ORD-8922',
    customer_id: 'cust-2',
    customer_name: 'David Ochieng',
    customer_phone: '+254 722 987 654',
    driver_id: 'driver-1',
    driver_name: 'Brian Mwangi',
    pickup_address: 'James Gichuru Road, Lavington Green Apt 12A, Lavington, Nairobi',
    dropoff_address: 'James Gichuru Road, Lavington Green Apt 12A, Lavington, Nairobi',
    pickup_window: 'Today, 1:00 PM - 3:00 PM',
    dropoff_window: 'Tomorrow, 5:00 PM - 7:00 PM',
    status: 'scheduled',
    payment_status: 'paid',
    payment_method: 'mpesa',
    detergent_choice: 'Fresh Spring Lavender & Tropical Bloom',
    items: [
      { id: 'oi-4', order_id: 'ORD-8922', item_type: 'Bed Sheets & Linens', quantity: 2, care_notes: 'High heat sanitize', price: 800 },
      { id: 'oi-5', order_id: 'ORD-8922', item_type: 'Heavy Coat / Suit Jacket', quantity: 1, care_notes: 'Spot treat tea stain on collar', price: 750 },
    ],
    subtotal: 2350,
    delivery_fee: 250,
    total_amount: 2600,
    created_at: '2026-09-14T09:00:00Z',
    status_history: [
      { status: 'scheduled', timestamp: '2026-09-14T09:00:00Z', note: 'Pickup confirmed for Lavington' },
    ],
  },
  {
    id: 'ORD-8919',
    customer_id: 'cust-3',
    customer_name: 'Amara Muthoni',
    customer_phone: '+254 733 456 789',
    driver_id: 'driver-1',
    driver_name: 'Brian Mwangi',
    pickup_address: 'Mandera Road, Kileleshwa Court, Kileleshwa, Nairobi',
    dropoff_address: 'Mandera Road, Kileleshwa Court, Kileleshwa, Nairobi',
    pickup_window: 'Yesterday, 9:00 AM - 11:00 AM',
    dropoff_window: 'Today, 2:00 PM - 4:00 PM',
    status: 'out_for_delivery',
    payment_status: 'paid',
    payment_method: 'mpesa',
    detergent_choice: 'Oxi-Action Deep Stain Lifter',
    items: [
      { id: 'oi-6', order_id: 'ORD-8919', item_type: 'Dress Shirt (Launder & Press)', quantity: 6, care_notes: 'Medium starch on collars and cuffs', price: 250 },
      { id: 'oi-7', order_id: 'ORD-8919', item_type: 'Trousers / Jeans', quantity: 3, care_notes: 'Standard steam press', price: 300 },
    ],
    subtotal: 2400,
    delivery_fee: 250,
    total_amount: 2650,
    created_at: '2026-09-13T08:10:00Z',
    status_history: [
      { status: 'scheduled', timestamp: '2026-09-13T08:10:00Z' },
      { status: 'picked_up', timestamp: '2026-09-13T09:30:00Z' },
      { status: 'washing', timestamp: '2026-09-13T13:00:00Z' },
      { status: 'ready', timestamp: '2026-09-14T09:00:00Z' },
      { status: 'out_for_delivery', timestamp: '2026-09-14T13:30:00Z', note: 'Out for delivery in Van #4 with Brian Mwangi' },
    ],
  },
  {
    id: 'ORD-8915',
    customer_id: 'cust-1',
    customer_name: 'Sarah Wanjiku',
    customer_phone: '+254 712 345 678',
    driver_id: 'driver-2',
    driver_name: 'Kevin Otieno',
    pickup_address: 'Dennis Pritt Road, Kilimani Heights Apt 4B, Kilimani, Nairobi',
    dropoff_address: 'Dennis Pritt Road, Kilimani Heights Apt 4B, Kilimani, Nairobi',
    pickup_window: 'Sep 8, 9:00 AM - 11:00 AM',
    dropoff_window: 'Sep 9, 3:00 PM - 5:00 PM',
    status: 'delivered',
    payment_status: 'paid',
    payment_method: 'mpesa',
    detergent_choice: 'Hypoallergenic Gentle Wash (Fragrance Free)',
    items: [
      { id: 'oi-8', order_id: 'ORD-8915', item_type: 'Wash & Fold (Laundry Bag)', quantity: 2, care_notes: 'Neat bundle fold', price: 1200 },
      { id: 'oi-9', order_id: 'ORD-8915', item_type: 'Towels & Bathrobes', quantity: 2, care_notes: 'Extra soft rinse', price: 350 },
    ],
    subtotal: 3100,
    delivery_fee: 250,
    total_amount: 3350,
    created_at: '2026-09-08T08:00:00Z',
    status_history: [
      { status: 'scheduled', timestamp: '2026-09-08T08:00:00Z' },
      { status: 'picked_up', timestamp: '2026-09-08T09:40:00Z' },
      { status: 'washing', timestamp: '2026-09-08T12:00:00Z' },
      { status: 'ready', timestamp: '2026-09-09T10:00:00Z' },
      { status: 'out_for_delivery', timestamp: '2026-09-09T14:00:00Z' },
      { status: 'delivered', timestamp: '2026-09-09T15:20:00Z', note: 'Delivered and left safely with main security gate' },
    ],
  },
  {
    id: 'ORD-8910',
    customer_id: 'cust-4',
    customer_name: 'James Kiprop',
    customer_phone: '+254 701 234 567',
    driver_id: null,
    pickup_address: 'Rhapta Road, Westlands Valley Apt 3, Westlands, Nairobi',
    dropoff_address: 'Rhapta Road, Westlands Valley Apt 3, Westlands, Nairobi',
    pickup_window: 'Today, 4:00 PM - 6:00 PM',
    dropoff_window: 'Tomorrow, 2:00 PM - 4:00 PM',
    status: 'scheduled',
    payment_status: 'paid',
    payment_method: 'mpesa',
    detergent_choice: 'Gentle Silk & Wool Softening Conditioner',
    items: [
      { id: 'oi-10', order_id: 'ORD-8910', item_type: 'Delicate / Silk / Kitenge', quantity: 3, care_notes: 'Hand wash cold only, iron low', price: 500 },
    ],
    subtotal: 1500,
    delivery_fee: 250,
    total_amount: 1750,
    created_at: '2026-09-14T11:00:00Z',
    status_history: [
      { status: 'scheduled', timestamp: '2026-09-14T11:00:00Z', note: 'Pickup booked for Westlands' },
    ],
  },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', item_name: 'Hypoallergenic Gentle Fabric Detergent', quantity: 22, unit: 'Bottles (5 Litre)', low_stock_threshold: 8, category: 'Detergents' },
  { id: 'inv-2', item_name: 'Lavender & Tropical Bloom Detergent', quantity: 28, unit: 'Bottles (5 Litre)', low_stock_threshold: 10, category: 'Detergents' },
  { id: 'inv-3', item_name: 'Oxi-Stain Action Booster Powder', quantity: 5, unit: 'Tubs (3 kg)', low_stock_threshold: 8, category: 'Additives' },
  { id: 'inv-4', item_name: 'Silk & Delicate Fabric Softener', quantity: 14, unit: 'Bottles (2 Litre)', low_stock_threshold: 5, category: 'Detergents' },
  { id: 'inv-5', item_name: 'Elsa Laundry Heavy Poly Garment Bags', quantity: 180, unit: 'Rolls (100 pk)', low_stock_threshold: 50, category: 'Packaging' },
  { id: 'inv-6', item_name: 'Eco Wooden Shirt Hangers', quantity: 260, unit: 'Pieces', low_stock_threshold: 100, category: 'Hangers' },
  { id: 'inv-7', item_name: 'Wire Hangers with Cardboard Struts', quantity: 450, unit: 'Pieces', low_stock_threshold: 150, category: 'Hangers' },
  { id: 'inv-8', item_name: 'Elsa Laundry Thermal Tag Ribbons', quantity: 8, unit: 'Spools', low_stock_threshold: 15, category: 'Tags' },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-cust-1',
    title: 'Order Status Update',
    body: 'Your laundry is currently in the washing cycle at Elsa Laundry Kilimani hub.',
    timestamp: '2 hours ago',
    read: false,
    order_id: 'ORD-8921',
    target_role: 'customer',
    user_id: 'cust-1',
  },
  {
    id: 'notif-cust-2',
    title: 'Driver Assigned',
    body: 'Brian Mwangi has been assigned to pick up your laundry.',
    timestamp: 'Today, 8:15 AM',
    read: true,
    order_id: 'ORD-8921',
    target_role: 'customer',
    user_id: 'cust-1',
  },
  {
    id: 'notif-cust-3',
    title: 'Order Delivered',
    body: 'Order #ORD-8915 has been delivered to Dennis Pritt Road.',
    timestamp: 'Yesterday',
    read: true,
    order_id: 'ORD-8915',
    target_role: 'customer',
    user_id: 'cust-1',
  },
  {
    id: 'notif-drv-1',
    title: 'New Route Assigned',
    body: 'Route for Kilimani & Lavington has been assigned with 4 pickup/delivery stops.',
    timestamp: '1 hour ago',
    read: false,
    target_role: 'driver',
    user_id: 'driver-1',
  },
  {
    id: 'notif-drv-2',
    title: 'Pickup Window Reminder',
    body: 'Upcoming pickup at Dennis Pritt Road Apt 4B scheduled for 9:00 AM - 11:00 AM.',
    timestamp: 'Today, 7:45 AM',
    read: true,
    order_id: 'ORD-8921',
    target_role: 'driver',
    user_id: 'driver-1',
  },
  {
    id: 'notif-drv-3',
    title: 'M-Pesa Cash on Delivery',
    body: 'Customer Wangari Kamau has prepaid KSh 3,650 via M-Pesa.',
    timestamp: 'Yesterday',
    read: true,
    order_id: 'ORD-8920',
    target_role: 'driver',
    user_id: 'driver-1',
  },
  {
    id: 'notif-adm-1',
    title: 'New Order Received',
    body: 'Customer Wangari Kamau placed Order #ORD-8920 in Westlands (KSh 3,650).',
    timestamp: '30 mins ago',
    read: false,
    order_id: 'ORD-8920',
    target_role: 'admin',
  },
  {
    id: 'notif-adm-2',
    title: 'Inventory Alert: Low Stock',
    body: 'Oxi-Stain Action Booster Powder is low (5 tubs remaining, threshold is 8).',
    timestamp: '2 hours ago',
    read: false,
    target_role: 'admin',
  },
  {
    id: 'notif-adm-3',
    title: 'Daily Revenue Target Reached',
    body: 'Elsa Laundry has surpassed KSh 12,000 in processed orders today.',
    timestamp: 'Today, 11:00 AM',
    read: true,
    target_role: 'admin',
  },
];

class StoreService {
  private listeners: Set<() => void> = new Set();
  private currentUser: User | null = null;
  private users: User[] = [...INITIAL_USERS];
  private orders: Order[] = [...INITIAL_ORDERS];
  private inventory: InventoryItem[] = [...INITIAL_INVENTORY];
  private addresses: Map<string, Address[]> = new Map();
  private notifications: AppNotification[] = [...INITIAL_NOTIFICATIONS];
  private userLocation: UserLocation = DEFAULT_USER_LOCATION;
  private addressUnsubscribe: Unsubscribe | null = null;
  private isInitialized = false;

  constructor() {
    this.initFirebaseListeners();
  }

  private async initFirebaseListeners() {
    // 1. Listen for Auth State Changes
    onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            this.currentUser = {
              id: fbUser.uid,
              name: data.name || fbUser.displayName || 'Valued User',
              email: data.email || fbUser.email || '',
              phone: data.phone || '+254 700 000 000',
              role: (data.role as UserRole) || 'customer',
              created_at: data.created_at || new Date().toISOString(),
              default_detergent: data.default_detergent || 'Hypoallergenic Gentle Wash (Fragrance Free)',
              avatar: data.avatar,
            };
          } else {
            // Create user document if missing
            const role: UserRole = (fbUser.email?.toLowerCase().includes('admin') || fbUser.email?.toLowerCase().includes('elsie'))
              ? 'admin'
              : (fbUser.email?.toLowerCase().includes('driver') || fbUser.email?.toLowerCase().includes('mwangi'))
              ? 'driver'
              : 'customer';

            const newUserDoc: User = {
              id: fbUser.uid,
              name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Valued User'),
              email: fbUser.email || '',
              phone: '+254 700 000 000',
              role,
              created_at: new Date().toISOString(),
              default_detergent: 'Hypoallergenic Gentle Wash (Fragrance Free)',
            };
            await setDoc(userDocRef, newUserDoc);
            this.currentUser = newUserDoc;
          }

          // Attach subcollection listener for addresses
          this.listenToUserAddresses(fbUser.uid);
        } catch (err) {
          console.warn('Could not fetch user document from Firestore:', err);
        }
      } else {
        this.currentUser = null;
        if (this.addressUnsubscribe) {
          this.addressUnsubscribe();
          this.addressUnsubscribe = null;
        }
      }
      this.notify();
    });

    // 2. Real-time Orders Listener
    try {
      const ordersCol = collection(db, 'orders');
      onSnapshot(
        ordersCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Order[] = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              return {
                ...data,
                id: docSnap.id,
              } as Order;
            });
            // Sort newest first
            list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            this.orders = list;
          } else {
            // Seed initial orders into Firestore on first run
            this.seedInitialOrders();
          }
          this.notify();
        },
        (error) => {
          console.warn('Orders onSnapshot notice:', error.message);
        }
      );
    } catch (err) {
      console.warn('Orders listener init error:', err);
    }

    // 3. Real-time Inventory Listener
    try {
      const inventoryCol = collection(db, 'inventory');
      onSnapshot(
        inventoryCol,
        (snapshot) => {
          if (!snapshot.empty) {
            this.inventory = snapshot.docs.map((docSnap) => ({
              ...docSnap.data(),
              id: docSnap.id,
            })) as InventoryItem[];
          } else {
            this.seedInitialInventory();
          }
          this.notify();
        },
        (error) => {
          console.warn('Inventory onSnapshot notice:', error.message);
        }
      );
    } catch (err) {
      console.warn('Inventory listener init error:', err);
    }

    // 4. Real-time Users Listener (for admin/staff/customer directory)
    try {
      const usersCol = collection(db, 'users');
      onSnapshot(
        usersCol,
        (snapshot) => {
          if (!snapshot.empty) {
            this.users = snapshot.docs.map((docSnap) => ({
              ...docSnap.data(),
              id: docSnap.id,
            })) as User[];
          } else {
            this.seedInitialUsers();
          }
          this.notify();
        },
        (error) => {
          console.warn('Users onSnapshot notice:', error.message);
        }
      );
    } catch (err) {
      console.warn('Users listener init error:', err);
    }

    // 5. Real-time Notifications Listener
    try {
      const notifsCol = collection(db, 'notifications');
      onSnapshot(
        notifsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            this.notifications = snapshot.docs.map((docSnap) => ({
              ...docSnap.data(),
              id: docSnap.id,
            })) as AppNotification[];
          }
          this.notify();
        },
        (error) => {
          console.warn('Notifications onSnapshot notice:', error.message);
        }
      );
    } catch (err) {
      console.warn('Notifications listener init error:', err);
    }

    this.isInitialized = true;
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

          if (list.length === 0 && userId === 'cust-1') {
            // Seed initial sample addresses for demo
            INITIAL_ADDRESSES.forEach((addr) => {
              setDoc(doc(db, 'users', userId, 'addresses', addr.id), addr);
            });
          } else {
            this.addresses.set(userId, list);
          }
          this.notify();
        },
        (err) => {
          console.warn('Addresses onSnapshot notice:', err.message);
        }
      );
    } catch (err) {
      console.warn('listenToUserAddresses error:', err);
    }
  }

  private async seedInitialOrders() {
    try {
      for (const ord of INITIAL_ORDERS) {
        await setDoc(doc(db, 'orders', ord.id), ord);
      }
    } catch (e) {
      console.warn('Seed initial orders error:', e);
    }
  }

  private async seedInitialInventory() {
    try {
      for (const item of INITIAL_INVENTORY) {
        await setDoc(doc(db, 'inventory', item.id), item);
      }
    } catch (e) {
      console.warn('Seed initial inventory error:', e);
    }
  }

  private async seedInitialUsers() {
    try {
      for (const u of INITIAL_USERS) {
        await setDoc(doc(db, 'users', u.id), u);
      }
    } catch (e) {
      console.warn('Seed initial users error:', e);
    }
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

  // Helper to format identifiers into valid Firebase email format
  private resolveAuthEmail(identifier: string): string {
    const cleanId = identifier.trim().toLowerCase();
    if (cleanId.includes('@')) {
      return cleanId;
    }
    const cleanDigits = identifier.replace(/[^0-9]/g, '');
    return `${cleanDigits || 'user'}@elsalaundry.app`;
  }

  // Authentication Methods (Firebase Auth + Firestore)
  public async registerUser(params: {
    name: string;
    phone: string;
    email: string;
    password?: string;
    role: UserRole;
    default_detergent?: string;
  }): Promise<User> {
    const email = params.email.trim() || this.resolveAuthEmail(params.phone);
    const password = params.password || 'password123';

    let fbUserUid = `user-${Date.now()}`;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      fbUserUid = userCredential.user.uid;
    } catch (err: any) {
      // If user already exists in Auth, try sign in with same password
      if (err?.code === 'auth/email-already-in-use') {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        fbUserUid = cred.user.uid;
      } else {
        console.warn('Firebase createUser notice:', err?.message);
      }
    }

    const newUser: User = {
      id: fbUserUid,
      name: params.name,
      phone: params.phone,
      email: email,
      role: params.role,
      created_at: new Date().toISOString(),
      default_detergent: params.default_detergent || 'Hypoallergenic Gentle Wash (Fragrance Free)',
    };

    try {
      await setDoc(doc(db, 'users', fbUserUid), newUser);
    } catch (err) {
      console.warn('Could not write user to Firestore:', err);
    }

    this.currentUser = newUser;
    this.listenToUserAddresses(fbUserUid);
    this.notify();
    return newUser;
  }

  public async loginWithCredentials(identifier: string, password = 'password123'): Promise<User> {
    const cleanId = identifier.trim().toLowerCase();
    const email = this.resolveAuthEmail(identifier);

    let fbUid = '';
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      fbUid = cred.user.uid;
    } catch (authErr: any) {
      // If account doesn't exist yet, auto-provision in Firebase Auth
      if (authErr?.code === 'auth/user-not-found' || authErr?.code === 'auth/invalid-credential') {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, email, password);
          fbUid = newCred.user.uid;
        } catch {
          // fallback
          fbUid = `user-${Date.now()}`;
        }
      } else {
        fbUid = `user-${Date.now()}`;
      }
    }

    // Determine role & metadata
    const role: UserRole =
      cleanId.includes('admin') || cleanId.includes('elsie')
        ? 'admin'
        : cleanId.includes('driver') || cleanId.includes('mwangi') || cleanId.includes('otieno')
        ? 'driver'
        : 'customer';

    const cleanDigits = identifier.replace(/[^0-9]/g, '');
    const isKenyanPhone = /^(?:\+254|0)?7\d{8}$/.test(cleanDigits);
    const formattedPhone = isKenyanPhone ? `+254 ${cleanDigits.slice(-9)}` : identifier;

    // Check if doc exists in Firestore
    let resolvedUser: User | null = null;
    if (fbUid) {
      try {
        const userDocRef = doc(db, 'users', fbUid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          resolvedUser = { ...(userSnap.data() as User), id: fbUid };
        } else {
          // Check matching initial demo users
          const initialMatch = INITIAL_USERS.find(
            (u) =>
              u.email.toLowerCase() === email.toLowerCase() ||
              (cleanDigits.length >= 8 && u.phone.replace(/[^0-9]/g, '').endsWith(cleanDigits.slice(-8)))
          );

          resolvedUser = {
            id: fbUid,
            name: initialMatch?.name || (identifier.includes('@') ? identifier.split('@')[0] : 'Valued Customer'),
            phone: initialMatch?.phone || formattedPhone,
            email: email,
            role: initialMatch?.role || role,
            created_at: new Date().toISOString(),
            default_detergent: initialMatch?.default_detergent || 'Hypoallergenic Gentle Wash (Fragrance Free)',
          };
          await setDoc(userDocRef, resolvedUser);
        }
      } catch (e) {
        console.warn('Firestore fetch user error:', e);
      }
    }

    if (!resolvedUser) {
      resolvedUser = {
        id: fbUid || `user-${Date.now()}`,
        name: identifier.includes('@') ? identifier.split('@')[0] : 'Valued Customer',
        phone: formattedPhone,
        email: email,
        role: role,
        created_at: new Date().toISOString(),
        default_detergent: 'Hypoallergenic Gentle Wash (Fragrance Free)',
      };
    }

    this.currentUser = resolvedUser;
    this.listenToUserAddresses(resolvedUser.id);
    this.notify();
    return resolvedUser;
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
    return this.users.length > 0 ? this.users : INITIAL_USERS;
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

  // Addresses
  public getAddresses(customerId?: string): Address[] {
    const targetId = customerId || this.currentUser?.id;
    if (targetId && this.addresses.has(targetId)) {
      const list = this.addresses.get(targetId) || [];
      if (list.length > 0) return list;
    }
    return INITIAL_ADDRESSES.filter((a) => !targetId || a.customer_id === targetId);
  }

  public async addAddress(address: Omit<Address, 'id'>): Promise<Address> {
    const addrId = `addr-${Date.now()}`;
    const newAddr: Address = {
      ...address,
      id: addrId,
    };

    const customerId = address.customer_id || this.currentUser?.id || 'cust-1';
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
    const targetId = customerId || this.currentUser?.id || 'cust-1';
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

  // Orders
  public getOrders(): Order[] {
    return this.orders.length > 0 ? this.orders : INITIAL_ORDERS;
  }

  public getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id);
  }

  public getOrdersForCustomer(customerId: string): Order[] {
    return this.getOrders().filter((o) => o.customer_id === customerId);
  }

  public getOrdersForDriver(driverId: string): Order[] {
    return this.getOrders().filter((o) => o.driver_id === driverId);
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

    const drivers = this.getUsers().filter((u) => u.role === 'driver');
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

    // Customer Notification
    this.addNotification({
      title: 'Pickup Scheduled!',
      body: `Your order #${orderId} is confirmed. Driver scheduled for ${params.pickup_window}.`,
      order_id: orderId,
      target_role: 'customer',
      user_id: params.customer.id,
    });

    // Admin Notification
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
      picked_up: 'Picked up by your courier',
      washing: 'Now washing at Elsa Laundry facility',
      ready: 'Folded & packaged ready for dispatch',
      out_for_delivery: 'Out for delivery to your location! 🚚',
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
    const drivers = this.getUsers().filter((u) => u.role === 'driver');
    const driver = drivers.find((d) => d.id === driverId);

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

  // Inventory
  public getInventory(): InventoryItem[] {
    return this.inventory.length > 0 ? this.inventory : INITIAL_INVENTORY;
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

  // Notifications
  public getNotifications(user?: { id?: string; role?: UserRole }): AppNotification[] {
    const list = this.notifications.length > 0 ? this.notifications : INITIAL_NOTIFICATIONS;
    if (!user || !user.role) return list;
    return list.filter((notif) => {
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

  // User Current Location
  public getLocation(): UserLocation {
    return this.userLocation;
  }

  public setLocation(location: UserLocation) {
    this.userLocation = location;
    this.notify();
  }

  public async resetToSampleData() {
    this.seedInitialOrders();
    this.seedInitialInventory();
    this.seedInitialUsers();
    this.userLocation = DEFAULT_USER_LOCATION;
    this.notify();
  }
}

export const store = new StoreService();
