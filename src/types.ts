export type UserRole = 'customer' | 'driver' | 'admin';

export type OrderStatus =
  | 'scheduled'
  | 'picked_up'
  | 'at_facility'
  | 'washing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'mpesa' | 'card' | 'cash' | 'wallet';

export interface UserLocation {
  area: string;
  street?: string;
  city: string;
  country?: string;
  lat?: number;
  lng?: number;
  source: 'gps' | 'ip' | 'saved' | 'preset' | 'manual';
  updatedAt?: string;
  isOutsideKenya?: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  created_at: string;
  default_detergent?: string;
  avatar?: string;
  pin_hash?: string;
}

export interface Address {
  id: string;
  customer_id: string;
  label: string; // e.g. "Home", "Office", "Apartment 4B"
  street: string;
  city: string;
  lat: number;
  lng: number;
  is_default?: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: string;
  quantity: number;
  care_notes: string;
  price: number; // unit price
}

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  driver_id: string | null;
  driver_name?: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_window: string;
  dropoff_window: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  mpesa_confirmation_code?: string;
  payment_submitted_at?: string;
  paid_at?: string;
  detergent_choice: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  created_at: string;
  updated_at?: string;
  proof_photo?: string | null;
  driver_notes?: string;
  status_history: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface RouteStop {
  order_id: string;
  type: 'pickup' | 'delivery';
  address: string;
  customer_name: string;
  customer_phone: string;
  time_window: string;
  status: OrderStatus;
  completed: boolean;
  notes?: string;
  care_notes_summary?: string;
}

export interface DriverRoute {
  id: string;
  driver_id: string;
  date: string;
  order_ids: string[];
  stops: RouteStop[];
}

export interface InventoryItem {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  low_stock_threshold: number;
  category?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  order_id?: string;
  target_role: UserRole; // 'customer' | 'driver' | 'admin'
  user_id?: string; // specific user recipient, if applicable
}

export interface LaundryCatalogItem {
  id: string;
  name: string;
  category: 'Everyday' | 'Apparel' | 'Bedding' | 'Delicates';
  unit_price: number;
  unit_label: string;
  icon: string;
  popular?: boolean;
}
