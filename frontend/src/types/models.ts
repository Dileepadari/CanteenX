// Auto-generated TypeScript shapes derived from backend GraphQL/SQLAlchemy models
// Keep this in sync with backend/app/models/*.py

export type ID = number | string;

// ------------------------- Menu Item -------------------------
export interface SizeOption {
  name: string;
  price: number;
}

export interface AdditionOption {
  name: string;
  price: number;
}

export interface CustomizationOptionsType {
  sizes?: SizeOption[] | null;
  additions?: AdditionOption[] | null;
  removals?: string[] | null;
  notesAllowed?: boolean | null;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  canteenId: number;
  canteenName?: string | null;
  description?: string | null;
  image?: string | null;
  category?: string | null;
  tags?: string[] | null;
  rating?: number;
  ratingCount?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  stockCount?: number;
  preparationTime?: number;
  customizationOptions?: CustomizationOptionsType | null;
  // backward-compatible flags
  isVegetarian?: boolean;
}

// ------------------------- Canteen -------------------------
export interface ScheduleType {
  breakfast?: string | null;
  lunch?: string | null;
  dinner?: string | null;
  regular?: string | null;
  evening?: string | null;
  night?: string | null;
  weekday?: string | null;
  weekend?: string | null;
}

export interface Canteen {
  id: number;
  name: string;
  userId: string;
  isOpen: boolean;
  image?: string | null;
  location?: string | null;
  rating?: number | null;
  openTime?: string | null; // "HH:MM"
  closeTime?: string | null; // "HH:MM"
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  schedule?: ScheduleType | null;
  tags?: string[] | null;
}

// ------------------------- User -------------------------
export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // e.g. 'student' | 'vendor' | 'admin'
  profilePicture?: string | null;
  preferredPayment?: string | null;
  isVegetarian?: boolean;
  notifPrefs?: string[] | null;
  favoriteCanteens?: number[] | null;
  recentOrders?: number[] | null;
}

// ------------------------- Cart -------------------------
export interface CartCustomizations {
  size?: string | null;
  additions?: string[] | null;
  removals?: string[] | null;
  notes?: string | null;
}

export interface CartItem {
  id: number;
  menuItemId: number;
  quantity: number;
  name?: string | null;
  price?: number | null;
  canteenId?: number | null;
  canteenName?: string | null;
  cartId?: number | null;
  specialInstructions?: string | null;
  location?: string | null;
  customizations?: CartCustomizations | null;
}

export interface Cart {
  id: number;
  userId: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  pickupDate?: string | null;
  pickupTime?: string | null;
  items?: CartItem[] | null;
}

// ------------------------- Order -------------------------
export interface OrderItem {
  id: number;
  itemId: number;
  quantity: number;
  customizations?: {
    size?: string | null;
    additions?: string[] | null;
    removals?: string[] | null;
    notes?: string | null;
  } | null;
  note?: string | null;
}

export interface OrderStep {
  id: number;
  orderId: number;
  status: string;
  description: string;
  time?: string | null; // ISO
  completed: boolean;
  current: boolean;
}

export interface Order {
  id: number;
  userId: string;
  canteenId: number;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  orderTime: string; // ISO
  confirmedTime?: string | null;
  preparingTime?: string | null;
  readyTime?: string | null;
  deliveryTime?: string | null;
  paymentMethod: string;
  paymentStatus: string;
  customerNote?: string | null;
  discount?: number;
  phone: string;
  pickupTime?: string | null;
  isPreOrder?: boolean;
  cancelledTime?: string | null;
  cancellationReason?: string | null;
  steps?: OrderStep[] | null;
}

// ------------------------- Payment -------------------------
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'upi' | 'wallet' | 'pay_later' | 'cash';

export interface Payment {
  id: number;
  orderId: number;
  userId: string;
  merchantId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  paymentResponse?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Merchant {
  id: number;
  canteenId: number;
  name: string;
  razorpayMerchantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserWallet {
  id: number;
  userId: string;
  balance: number;
  isPrivileged: boolean;
  creditLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: number;
  walletId: number;
  amount: number;
  description: string;
  paymentId?: number | null;
  createdAt: string;
}

// ------------------------- Complaint -------------------------
export interface Complaint {
  id: number;
  userId: string;
  orderId?: number | null;
  complaintText: string;
  heading?: string | null;
  complaintType?: string | null;
  status?: string | null;
  isEscalated: boolean;
  responseText?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ------------------------- Utility / Partial types -------------------------
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Export default grouped types for convenience
// NOTE: don't export a runtime object of TypeScript types — types are erased at runtime.
// Import and use the interfaces by name, e.g. `import { MenuItem } from 'src/types/models'`.
