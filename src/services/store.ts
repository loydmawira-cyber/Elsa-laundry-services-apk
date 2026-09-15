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

const USERS_STORAGE_KEY = 'elsa_laundry_users_v2';
const CURRENT_USER_KEY = 'elsa_laundry_current_user_v2';
const ORDERS_STORAGE_KEY = 'elsa_laundry_orders_v2';
const ADDRESSES_STORAGE_KEY = 'elsa_laundry_addresses_v2';
const INVENTORY_STORAGE_KEY = 'elsa_laundry_inventory_v2';
const NOTIFICATIONS_STORAGE_KEY = 'elsa_laundry_notifications_v2';
const LOCATION_STORAGE_KEY = 'elsa_laundry_user_location_v2';

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
  // Customer notifications
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
  // Driver notifications
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
  // Admin notifications
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

  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(USERS_STORAGE_KEY)) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(CURRENT_USER_KEY)) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(INITIAL_USERS[0])); // Sarah Wanjiku by default
    }
    if (!localStorage.getItem(ADDRESSES_STORAGE_KEY)) {
      localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(INITIAL_ADDRESSES));
    }
    if (!localStorage.getItem(ORDERS_STORAGE_KEY)) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem(INVENTORY_STORAGE_KEY)) {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(INITIAL_INVENTORY));
    }
    if (!localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
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

  // Users & Auth
  public getUsers(): User[] {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  public getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      if (!data || data === 'null' || data === 'undefined') return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  public setCurrentUser(user: User | null) {
    if (!user) {
      localStorage.removeItem(CURRENT_USER_KEY);
    } else {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
    this.notify();
  }

  public logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    this.notify();
  }

  public registerUser(params: {
    name: string;
    phone: string;
    email: string;
    role: UserRole;
    default_detergent?: string;
  }): User {
    const users = this.getUsers();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: params.name,
      phone: params.phone,
      email: params.email,
      role: params.role,
      created_at: new Date().toISOString(),
      default_detergent: params.default_detergent || 'Hypoallergenic Gentle Wash (Fragrance Free)',
    };
    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return newUser;
  }

  public loginAs(role: 'customer' | 'driver' | 'admin'): User {
    const users = this.getUsers();
    const user = users.find((u) => u.role === role) || users[0];
    this.setCurrentUser(user);
    return user;
  }

  public loginWithCredentials(identifier: string): User {
    const users = this.getUsers();
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[^0-9]/g, '');

    let found = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (cleanDigits.length >= 8 && u.phone.replace(/[^0-9]/g, '').endsWith(cleanDigits.slice(-8)))
    );
    if (!found) {
      // Create account if logging in with new phone/email
      const isKenyanPhone = /^(?:\+254|0)?7\d{8}$/.test(cleanDigits);
      const formattedPhone = isKenyanPhone
        ? `+254 ${cleanDigits.slice(-9)}`
        : identifier.includes('@')
        ? '+254 700 000 111'
        : identifier;

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: identifier.includes('@') ? identifier.split('@')[0] : 'Valued Customer',
        phone: formattedPhone,
        email: identifier.includes('@') ? identifier : `${cleanDigits}@gmail.com`,
        role: cleanId.includes('admin') ? 'admin' : cleanId.includes('driver') ? 'driver' : 'customer',
        created_at: new Date().toISOString(),
        default_detergent: 'Hypoallergenic Gentle Wash (Fragrance Free)',
      };
      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      found = newUser;
    }
    this.setCurrentUser(found);
    return found;
  }

  public updateProfile(userId: string, updates: Partial<User>) {
    const users = this.getUsers().map((u) => (u.id === userId ? { ...u, ...updates } : u));
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser({ ...current, ...updates });
    } else {
      this.notify();
    }
  }

  // Addresses
  public getAddresses(customerId?: string): Address[] {
    try {
      const data = localStorage.getItem(ADDRESSES_STORAGE_KEY);
      const list: Address[] = data ? JSON.parse(data) : INITIAL_ADDRESSES;
      return customerId ? list.filter((a) => a.customer_id === customerId) : list;
    } catch {
      return INITIAL_ADDRESSES;
    }
  }

  public addAddress(address: Omit<Address, 'id'>): Address {
    const addresses = this.getAddresses();
    const newAddr: Address = {
      ...address,
      id: `addr-${Date.now()}`,
    };
    if (newAddr.is_default) {
      addresses.forEach((a) => {
        if (a.customer_id === address.customer_id) a.is_default = false;
      });
    }
    addresses.unshift(newAddr);
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
    this.notify();
    return newAddr;
  }

  public deleteAddress(id: string) {
    const filtered = this.getAddresses().filter((a) => a.id !== id);
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(filtered));
    this.notify();
  }

  // Orders
  public getOrders(): Order[] {
    try {
      const data = localStorage.getItem(ORDERS_STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
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

  public createOrder(params: {
    customer: User;
    pickup_address: string;
    dropoff_address: string;
    pickup_window: string;
    dropoff_window: string;
    items: OrderItem[];
    detergent_choice: string;
    payment_method: PaymentMethod;
  }): Order {
    const orders = this.getOrders();
    const subtotal = params.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const delivery_fee = 250;
    const total_amount = Math.round(subtotal + delivery_fee);
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    // Auto assign driver Brian Mwangi if available
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

    orders.unshift(newOrder);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

    // Create targeted notifications:
    // 1. Customer notification
    this.addNotification({
      title: 'Pickup Scheduled!',
      body: `Your order #${orderId} is confirmed. Driver scheduled for ${params.pickup_window}.`,
      order_id: orderId,
      target_role: 'customer',
      user_id: params.customer.id,
    });

    // 2. Admin notification
    this.addNotification({
      title: 'New Order Received',
      body: `Order #${orderId} placed by ${params.customer.name} (${formatKES(total_amount)}). Needs pickup assignment.`,
      order_id: orderId,
      target_role: 'admin',
    });

    this.notify();
    return newOrder;
  }

  public updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    proofPhoto?: string
  ) {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return;

    const order = orders[orderIndex];
    order.status = newStatus;
    order.updated_at = new Date().toISOString();
    if (proofPhoto) {
      order.proof_photo = proofPhoto;
    }
    if (note) {
      order.driver_notes = note;
    }

    order.status_history.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${newStatus.replace('_', ' ')}`,
    });

    orders[orderIndex] = order;
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

    // Send push notification to customer
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

    // Notify driver if out for delivery / picked up
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

  public assignDriver(orderId: string, driverId: string | null) {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const drivers = this.getUsers().filter((u) => u.role === 'driver');
    const driver = drivers.find((d) => d.id === driverId);

    order.driver_id = driverId;
    order.driver_name = driver ? driver.name : undefined;

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

    if (driver) {
      // 1. Notify the driver
      this.addNotification({
        title: 'New Delivery Assigned',
        body: `You have been assigned to Order #${order.id} (${order.pickup_address})`,
        order_id: order.id,
        target_role: 'driver',
        user_id: driver.id,
      });

      // 2. Notify the customer
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
    try {
      const data = localStorage.getItem(INVENTORY_STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  }

  public updateInventoryQuantity(id: string, delta: number) {
    const items = this.getInventory().map((it) => {
      if (it.id === id) {
        const nextQty = Math.max(0, it.quantity + delta);
        return { ...it, quantity: nextQty };
      }
      return it;
    });
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
    this.notify();
  }

  public setInventoryItem(id: string, updates: Partial<InventoryItem>) {
    const items = this.getInventory().map((it) => (it.id === id ? { ...it, ...updates } : it));
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
    this.notify();
  }

  public addInventoryItem(item: Omit<InventoryItem, 'id'>) {
    const items = this.getInventory();
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
    };
    items.push(newItem);
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
    this.notify();
  }

  // Notifications
  public getNotifications(user?: { id?: string; role?: UserRole }): AppNotification[] {
    try {
      const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const list: AppNotification[] = data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
      if (!user || !user.role) {
        return list;
      }
      return list.filter((notif) => {
        // Must match user's role
        if (notif.target_role !== user.role) {
          return false;
        }
        // If assigned to a specific user_id, check match (or allow if not bound to a specific user)
        if (notif.user_id && user.id && notif.user_id !== user.id) {
          return false;
        }
        return true;
      });
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
    let list: AppNotification[] = [];
    try {
      const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      list = data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      list = INITIAL_NOTIFICATIONS;
    }

    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: 'Just now',
      read: false,
    };
    list.unshift(newNotif);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    this.notify();
  }

  public markNotificationsRead(user?: { id?: string; role?: UserRole }) {
    let list: AppNotification[] = [];
    try {
      const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      list = data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      list = INITIAL_NOTIFICATIONS;
    }

    const updated = list.map((n) => {
      if (!user || !user.role || n.target_role === user.role) {
        if (!user?.id || !n.user_id || n.user_id === user.id) {
          return { ...n, read: true };
        }
      }
      return n;
    });

    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    this.notify();
  }

  // User Current Location
  public getLocation(): UserLocation {
    try {
      const data = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (data) {
        const parsed: UserLocation = JSON.parse(data);
        // If ISP returned Al Asimah governorate instead of Subhan, correct to Subhan
        if (parsed.area === 'Al Asimah' || (parsed.city && parsed.city.toLowerCase().includes('al asimah'))) {
          const subhan: UserLocation = {
            area: 'Subhan',
            street: 'Subhan Industrial Area, Block 1',
            city: 'Subhan, Kuwait',
            country: 'Kuwait',
            lat: 29.2392,
            lng: 47.9856,
            source: 'manual',
            isOutsideKenya: true,
            updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(subhan));
          return subhan;
        }
        return parsed;
      }
      return {
        area: 'Subhan',
        street: 'Subhan Industrial Area, Block 1',
        city: 'Subhan, Kuwait',
        country: 'Kuwait',
        lat: 29.2392,
        lng: 47.9856,
        source: 'manual',
        isOutsideKenya: true,
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    } catch {
      return {
        area: 'Subhan',
        street: 'Subhan Industrial Area, Block 1',
        city: 'Subhan, Kuwait',
        country: 'Kuwait',
        lat: 29.2392,
        lng: 47.9856,
        source: 'manual',
        isOutsideKenya: true,
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }
  }

  public setLocation(location: UserLocation) {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
    this.notify();
  }

  public resetToSampleData() {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(INITIAL_USERS[0]));
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(INITIAL_ADDRESSES));
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(INITIAL_INVENTORY));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(DEFAULT_USER_LOCATION));
    this.notify();
  }
}

export const store = new StoreService();
