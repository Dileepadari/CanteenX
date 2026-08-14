/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Date with time (isoformat) */
  DateTime: { input: string; output: string; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](https://ecma-international.org/wp-content/uploads/ECMA-404_2nd_edition_december_2017.pdf). */
  JSON: { input: Record<string, unknown>; output: Record<string, unknown>; }
  /** Time (isoformat) */
  Time: { input: string; output: string; }
};

export type AddToCartInput = {
  customizations?: InputMaybe<Scalars['JSON']['input']>;
  menuItemId: Scalars['Int']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  quantity?: Scalars['Int']['input'];
  replaceCart?: Scalars['Boolean']['input'];
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  csrfToken: Scalars['String']['output'];
  user: User;
};

export type BulkOrder = {
  __typename?: 'BulkOrder';
  canteenId: Scalars['Int']['output'];
  canteenName?: Maybe<Scalars['String']['output']>;
  confirmedAt?: Maybe<Scalars['DateTime']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  fulfilledAt?: Maybe<Scalars['DateTime']['output']>;
  headCount: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  quoteNote?: Maybe<Scalars['String']['output']>;
  quotedAt?: Maybe<Scalars['DateTime']['output']>;
  quotedTotal?: Maybe<Money>;
  reference: Scalars['String']['output'];
  requestedItems: Scalars['JSON']['output'];
  requester?: Maybe<PublicUser>;
  requesterId: Scalars['ID']['output'];
  requiredAt: Scalars['DateTime']['output'];
  status: BulkOrderStatus;
  title: Scalars['String']['output'];
};

export type BulkOrderInput = {
  canteenId: Scalars['Int']['input'];
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  headCount: Scalars['Int']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  requestedItems?: InputMaybe<Scalars['JSON']['input']>;
  requiredAt: Scalars['DateTime']['input'];
  title: Scalars['String']['input'];
};

export enum BulkOrderStatus {
  Cancelled = 'CANCELLED',
  Confirmed = 'CONFIRMED',
  Declined = 'DECLINED',
  Fulfilled = 'FULFILLED',
  Quoted = 'QUOTED',
  Requested = 'REQUESTED'
}

export type Canteen = {
  __typename?: 'Canteen';
  averagePreparationMinutes: Scalars['Int']['output'];
  bannerUrl?: Maybe<Scalars['String']['output']>;
  closesAt?: Maybe<Scalars['Time']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  isAcceptingOrders: Scalars['Boolean']['output'];
  isActive: Scalars['Boolean']['output'];
  isFavorite: Scalars['Boolean']['output'];
  isOpenNow: Scalars['Boolean']['output'];
  location?: Maybe<Scalars['String']['output']>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  menuItemCount: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  opensAt?: Maybe<Scalars['Time']['output']>;
  ownerId: Scalars['ID']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  rating: Scalars['Float']['output'];
  ratingCount: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  tags: Array<Scalars['String']['output']>;
};

export type CanteenInput = {
  averagePreparationMinutes?: InputMaybe<Scalars['Int']['input']>;
  bannerUrl?: InputMaybe<Scalars['String']['input']>;
  closesAt?: InputMaybe<Scalars['Time']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  isAcceptingOrders?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  opensAt?: InputMaybe<Scalars['Time']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  weeklySchedule?: InputMaybe<Scalars['JSON']['input']>;
};

export type CanteenStats = {
  __typename?: 'CanteenStats';
  averageOrderValue: Money;
  canteenId: Scalars['Int']['output'];
  canteenName: Scalars['String']['output'];
  openComplaints: Scalars['Int']['output'];
  ordersToday: Scalars['Int']['output'];
  ordersTotal: Scalars['Int']['output'];
  pendingOrders: Scalars['Int']['output'];
  rating: Scalars['Float']['output'];
  revenueToday: Money;
  revenueTotal: Money;
};

export type Cart = {
  __typename?: 'Cart';
  blockingIssues: Array<Scalars['String']['output']>;
  canteenId?: Maybe<Scalars['Int']['output']>;
  canteenName?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  itemCount: Scalars['Int']['output'];
  items: Array<CartItem>;
  scheduledFor?: Maybe<Scalars['DateTime']['output']>;
  subtotal: Money;
  tax: Money;
  total: Money;
};

export type CartItem = {
  __typename?: 'CartItem';
  customizationSummary?: Maybe<Scalars['String']['output']>;
  customizations: Scalars['JSON']['output'];
  id: Scalars['Int']['output'];
  isOrderable: Scalars['Boolean']['output'];
  lineTotal: Money;
  menuItem?: Maybe<MenuItem>;
  menuItemId: Scalars['Int']['output'];
  note?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['Int']['output'];
  unitPrice: Money;
};

export type Complaint = {
  __typename?: 'Complaint';
  attachmentUrls: Array<Scalars['String']['output']>;
  author?: Maybe<PublicUser>;
  body: Scalars['String']['output'];
  canteenId?: Maybe<Scalars['Int']['output']>;
  canteenName?: Maybe<Scalars['String']['output']>;
  category: ComplaintCategory;
  createdAt: Scalars['DateTime']['output'];
  escalatedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['Int']['output'];
  orderId?: Maybe<Scalars['Int']['output']>;
  resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  respondedAt?: Maybe<Scalars['DateTime']['output']>;
  responseBody?: Maybe<Scalars['String']['output']>;
  status: ComplaintStatus;
  subject: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export enum ComplaintCategory {
  Delay = 'DELAY',
  FoodQuality = 'FOOD_QUALITY',
  Hygiene = 'HYGIENE',
  Other = 'OTHER',
  Payment = 'PAYMENT',
  StaffBehaviour = 'STAFF_BEHAVIOUR',
  WrongOrder = 'WRONG_ORDER'
}

export type ComplaintInput = {
  attachmentUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  body: Scalars['String']['input'];
  canteenId?: InputMaybe<Scalars['Int']['input']>;
  category?: ComplaintCategory;
  orderId?: InputMaybe<Scalars['Int']['input']>;
  subject: Scalars['String']['input'];
};

export enum ComplaintStatus {
  Closed = 'CLOSED',
  Escalated = 'ESCALATED',
  InReview = 'IN_REVIEW',
  Open = 'OPEN',
  Resolved = 'RESOLVED'
}

export type CustomizationGroup = {
  __typename?: 'CustomizationGroup';
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  options: Array<CustomizationOption>;
  required: Scalars['Boolean']['output'];
  selection: Scalars['String']['output'];
};

export type CustomizationOption = {
  __typename?: 'CustomizationOption';
  id: Scalars['String']['output'];
  isDefault: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  priceDelta: Money;
};

export type MenuItem = {
  __typename?: 'MenuItem';
  canteenId: Scalars['Int']['output'];
  canteenName?: Maybe<Scalars['String']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  containsAllergens: Array<Scalars['String']['output']>;
  customizationGroups: Array<CustomizationGroup>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isAvailable: Scalars['Boolean']['output'];
  isFeatured: Scalars['Boolean']['output'];
  /** False when unavailable or tracked and sold out. */
  isOrderable: Scalars['Boolean']['output'];
  isVegan: Scalars['Boolean']['output'];
  isVegetarian: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  orderCount: Scalars['Int']['output'];
  preparationMinutes: Scalars['Int']['output'];
  price: Money;
  rating: Scalars['Float']['output'];
  ratingCount: Scalars['Int']['output'];
  stockCount?: Maybe<Scalars['Int']['output']>;
  tags: Array<Scalars['String']['output']>;
};

export type MenuItemInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  containsAllergens?: InputMaybe<Array<Scalars['String']['input']>>;
  customizationGroups?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isAvailable?: InputMaybe<Scalars['Boolean']['input']>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  isVegan?: InputMaybe<Scalars['Boolean']['input']>;
  isVegetarian?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  preparationMinutes?: InputMaybe<Scalars['Int']['input']>;
  pricePaise?: InputMaybe<Scalars['Int']['input']>;
  stockCount?: InputMaybe<Scalars['Int']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** A monetary amount. Always transported in paise. */
export type Money = {
  __typename?: 'Money';
  /** Rupees with two decimals, e.g. "₹184.50". */
  formatted: Scalars['String']['output'];
  paise: Scalars['Int']['output'];
  /** Amount in rupees, for chart axes and sums. */
  rupees: Scalars['Float']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addToCart: Cart;
  assignStaff: Array<User>;
  cancelOrder: Order;
  changePassword: MutationSuccess;
  clearCart: Cart;
  createBulkOrder: BulkOrder;
  createCanteen: Canteen;
  createComplaint: Complaint;
  createMenuItem: MenuItem;
  createPromotion: Promotion;
  createReview: Review;
  createStaffAccount: User;
  createWalletTopUp: Scalars['String']['output'];
  deleteMenuItem: MutationSuccess;
  deleteMyAccount: MutationSuccess;
  escalateStaleComplaints: MutationSuccess;
  initiateCasLogin: Scalars['String']['output'];
  /** Start payment for an order. Wallet orders settle immediately. */
  initiatePayment?: Maybe<RazorpayCheckout>;
  markAllNotificationsRead: MutationSuccess;
  markNotificationRead: Notification;
  placeOrder: Order;
  quoteBulkOrder: BulkOrder;
  /** Rotate the refresh cookie and issue a fresh access token. */
  refreshSession: AuthPayload;
  removeFromCart: Cart;
  removeStaff: Array<User>;
  respondToComplaint: Complaint;
  setBulkOrderStatus: BulkOrder;
  setCanteenActive: Canteen;
  setCartPickupTime: Cart;
  setFavoriteCanteen: MutationSuccess;
  setMenuItemStock: MenuItem;
  setPromotionActive: Promotion;
  setUserActive: User;
  setUserRole: User;
  signIn: AuthPayload;
  signOut: MutationSuccess;
  signUp: AuthPayload;
  updateCanteen: Canteen;
  updateCartItem: Cart;
  updateMenuItem: MenuItem;
  updateOrderStatus: Order;
  updateProfile: User;
  verifyCasTicket: AuthPayload;
  /** Verify the Razorpay checkout callback. Signature-checked. */
  verifyPayment: Order;
};


export type MutationAddToCartArgs = {
  input: AddToCartInput;
};


export type MutationAssignStaffArgs = {
  canteenId: Scalars['Int']['input'];
  userIds: Array<Scalars['String']['input']>;
};


export type MutationCancelOrderArgs = {
  orderId: Scalars['Int']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};


export type MutationCreateBulkOrderArgs = {
  input: BulkOrderInput;
};


export type MutationCreateCanteenArgs = {
  input: CanteenInput;
  ownerId: Scalars['String']['input'];
};


export type MutationCreateComplaintArgs = {
  input: ComplaintInput;
};


export type MutationCreateMenuItemArgs = {
  canteenId: Scalars['Int']['input'];
  input: MenuItemInput;
};


export type MutationCreatePromotionArgs = {
  canteenId: Scalars['Int']['input'];
  input: PromotionInput;
};


export type MutationCreateReviewArgs = {
  input: ReviewInput;
};


export type MutationCreateStaffAccountArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  role: UserRole;
};


export type MutationCreateWalletTopUpArgs = {
  amountPaise: Scalars['Int']['input'];
};


export type MutationDeleteMenuItemArgs = {
  itemId: Scalars['Int']['input'];
};


export type MutationEscalateStaleComplaintsArgs = {
  olderThanDays?: Scalars['Int']['input'];
};


export type MutationInitiatePaymentArgs = {
  idempotencyKey?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['Int']['input'];
};


export type MutationMarkNotificationReadArgs = {
  notificationId: Scalars['Int']['input'];
};


export type MutationPlaceOrderArgs = {
  input: PlaceOrderInput;
};


export type MutationQuoteBulkOrderArgs = {
  bulkOrderId: Scalars['Int']['input'];
  quoteNote?: InputMaybe<Scalars['String']['input']>;
  quotedTotalPaise: Scalars['Int']['input'];
};


export type MutationRemoveFromCartArgs = {
  cartItemId: Scalars['Int']['input'];
};


export type MutationRemoveStaffArgs = {
  canteenId: Scalars['Int']['input'];
  userIds: Array<Scalars['String']['input']>;
};


export type MutationRespondToComplaintArgs = {
  complaintId: Scalars['Int']['input'];
  responseBody: Scalars['String']['input'];
  status: ComplaintStatus;
};


export type MutationSetBulkOrderStatusArgs = {
  bulkOrderId: Scalars['Int']['input'];
  status: BulkOrderStatus;
};


export type MutationSetCanteenActiveArgs = {
  canteenId: Scalars['Int']['input'];
  isActive: Scalars['Boolean']['input'];
};


export type MutationSetCartPickupTimeArgs = {
  scheduledFor?: InputMaybe<Scalars['DateTime']['input']>;
};


export type MutationSetFavoriteCanteenArgs = {
  canteenId: Scalars['Int']['input'];
  favorite: Scalars['Boolean']['input'];
};


export type MutationSetMenuItemStockArgs = {
  itemId: Scalars['Int']['input'];
  stockCount?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationSetPromotionActiveArgs = {
  isActive: Scalars['Boolean']['input'];
  promotionId: Scalars['Int']['input'];
};


export type MutationSetUserActiveArgs = {
  isActive: Scalars['Boolean']['input'];
  userId: Scalars['String']['input'];
};


export type MutationSetUserRoleArgs = {
  role: UserRole;
  userId: Scalars['String']['input'];
};


export type MutationSignInArgs = {
  input: SignInInput;
};


export type MutationSignUpArgs = {
  input: SignUpInput;
};


export type MutationUpdateCanteenArgs = {
  canteenId: Scalars['Int']['input'];
  input: CanteenInput;
};


export type MutationUpdateCartItemArgs = {
  cartItemId: Scalars['Int']['input'];
  quantity: Scalars['Int']['input'];
};


export type MutationUpdateMenuItemArgs = {
  input: MenuItemInput;
  itemId: Scalars['Int']['input'];
};


export type MutationUpdateOrderStatusArgs = {
  note?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['Int']['input'];
  status: OrderStatus;
};


export type MutationUpdateProfileArgs = {
  input: ProfileInput;
};


export type MutationVerifyCasTicketArgs = {
  ticket: Scalars['String']['input'];
};


export type MutationVerifyPaymentArgs = {
  gatewayOrderId: Scalars['String']['input'];
  gatewayPaymentId: Scalars['String']['input'];
  signature: Scalars['String']['input'];
};

export type MutationSuccess = {
  __typename?: 'MutationSuccess';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Notification = {
  __typename?: 'Notification';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  data: Scalars['JSON']['output'];
  id: Scalars['Int']['output'];
  isRead: Scalars['Boolean']['output'];
  link?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: NotificationType;
};

export type NotificationEvent = {
  __typename?: 'NotificationEvent';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  link?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export enum NotificationType {
  Complaint = 'COMPLAINT',
  OrderPlaced = 'ORDER_PLACED',
  OrderStatus = 'ORDER_STATUS',
  Payment = 'PAYMENT',
  Promotion = 'PROMOTION',
  System = 'SYSTEM'
}

export type Order = {
  __typename?: 'Order';
  canCancel: Scalars['Boolean']['output'];
  cancellationReason?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['DateTime']['output']>;
  canteenId: Scalars['Int']['output'];
  canteenName?: Maybe<Scalars['String']['output']>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  customer?: Maybe<PublicUser>;
  customerNote?: Maybe<Scalars['String']['output']>;
  discount: Money;
  id: Scalars['Int']['output'];
  items: Array<OrderItem>;
  paymentMethod?: Maybe<PaymentMethod>;
  paymentStatus: PaymentStatus;
  readyEstimateAt?: Maybe<Scalars['DateTime']['output']>;
  reference: Scalars['String']['output'];
  scheduledFor?: Maybe<Scalars['DateTime']['output']>;
  status: OrderStatus;
  statusEvents: Array<OrderStatusEvent>;
  subtotal: Money;
  tax: Money;
  total: Money;
  userId: Scalars['ID']['output'];
};

export type OrderItem = {
  __typename?: 'OrderItem';
  customizationPrice: Money;
  customizationSummary?: Maybe<Scalars['String']['output']>;
  customizations: Scalars['JSON']['output'];
  id: Scalars['Int']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  lineTotal: Money;
  menuItemId?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['Int']['output'];
  unitPrice: Money;
};

export enum OrderStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Confirmed = 'CONFIRMED',
  Pending = 'PENDING',
  Preparing = 'PREPARING',
  Ready = 'READY'
}

export type OrderStatusEvent = {
  __typename?: 'OrderStatusEvent';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  note?: Maybe<Scalars['String']['output']>;
  status: OrderStatus;
};

export type OrderStatusUpdate = {
  __typename?: 'OrderStatusUpdate';
  at: Scalars['String']['output'];
  canteenId: Scalars['Int']['output'];
  note?: Maybe<Scalars['String']['output']>;
  orderId: Scalars['Int']['output'];
  paymentStatus: PaymentStatus;
  reference: Scalars['String']['output'];
  status: OrderStatus;
};

export enum PaymentMethod {
  Card = 'CARD',
  Cash = 'CASH',
  Upi = 'UPI',
  Wallet = 'WALLET'
}

export enum PaymentStatus {
  Failed = 'FAILED',
  Paid = 'PAID',
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Refunded = 'REFUNDED'
}

export type PlaceOrderInput = {
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  customerNote?: InputMaybe<Scalars['String']['input']>;
  paymentMethod: PaymentMethod;
  promotionCode?: InputMaybe<Scalars['String']['input']>;
  scheduledFor?: InputMaybe<Scalars['DateTime']['input']>;
};

export type PlatformStats = {
  __typename?: 'PlatformStats';
  activeOrders: Scalars['Int']['output'];
  openComplaints: Scalars['Int']['output'];
  ordersToday: Scalars['Int']['output'];
  revenueToday: Money;
  revenueTotal: Money;
  totalCanteens: Scalars['Int']['output'];
  totalMenuItems: Scalars['Int']['output'];
  totalUsers: Scalars['Int']['output'];
  totalVendors: Scalars['Int']['output'];
};

export type ProfileInput = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  isVegetarian?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  notificationPreferences?: InputMaybe<Scalars['JSON']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  upiId?: InputMaybe<Scalars['String']['input']>;
};

export type Promotion = {
  __typename?: 'Promotion';
  canteenId: Scalars['Int']['output'];
  code: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endsAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  isLiveNow: Scalars['Boolean']['output'];
  maxDiscount?: Maybe<Money>;
  maxRedemptions?: Maybe<Scalars['Int']['output']>;
  maxRedemptionsPerUser: Scalars['Int']['output'];
  minOrder: Money;
  redemptionCount: Scalars['Int']['output'];
  startsAt: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
  type: PromotionType;
  value: Scalars['Int']['output'];
};

export type PromotionInput = {
  code: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt: Scalars['DateTime']['input'];
  isActive?: Scalars['Boolean']['input'];
  maxDiscountPaise?: InputMaybe<Scalars['Int']['input']>;
  maxRedemptions?: InputMaybe<Scalars['Int']['input']>;
  maxRedemptionsPerUser?: Scalars['Int']['input'];
  minOrderPaise?: Scalars['Int']['input'];
  startsAt: Scalars['DateTime']['input'];
  title: Scalars['String']['input'];
  type: PromotionType;
  value: Scalars['Int']['input'];
};

export type PromotionPreview = {
  __typename?: 'PromotionPreview';
  discount: Money;
  message: Scalars['String']['output'];
  promotion?: Maybe<Promotion>;
  valid: Scalars['Boolean']['output'];
};

export enum PromotionType {
  Flat = 'FLAT',
  Percentage = 'PERCENTAGE'
}

/** The subset safe to show to other users. */
export type PublicUser = {
  __typename?: 'PublicUser';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  canteen: Canteen;
  canteenBulkOrders: Array<BulkOrder>;
  /** Vendor menu view - includes unavailable items. */
  canteenMenu: Array<MenuItem>;
  canteenOrders: Array<Order>;
  canteenPromotions: Array<Promotion>;
  canteenStaff: Array<User>;
  canteenStats: CanteenStats;
  canteens: Array<Canteen>;
  cart: Cart;
  complaints: Array<Complaint>;
  favoriteCanteens: Array<Canteen>;
  /** Promotions currently running at a canteen. */
  livePromotions: Array<Promotion>;
  /** Canteens the signed-in user owns or staffs. */
  managedCanteens: Array<Canteen>;
  /** The signed-in user, or null when anonymous. */
  me?: Maybe<User>;
  menuCategories: Array<Scalars['String']['output']>;
  menuItem: MenuItem;
  menuItems: Array<MenuItem>;
  myBulkOrders: Array<BulkOrder>;
  myOrders: Array<Order>;
  notifications: Array<Notification>;
  /** A single order. Visible to its owner and the canteen team. */
  order: Order;
  platformStats: PlatformStats;
  /** Check a promo code against the current cart without using it. */
  promotionPreview: PromotionPreview;
  revenueTimeseries: Array<TimeseriesPoint>;
  reviews: Array<Review>;
  topItems: Array<TopItem>;
  unreadNotificationCount: Scalars['Int']['output'];
  users: Array<User>;
  wallet: Wallet;
};


export type QueryCanteenArgs = {
  id: Scalars['Int']['input'];
};


export type QueryCanteenBulkOrdersArgs = {
  canteenId: Scalars['Int']['input'];
};


export type QueryCanteenMenuArgs = {
  canteenId: Scalars['Int']['input'];
};


export type QueryCanteenOrdersArgs = {
  canteenId: Scalars['Int']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  statuses?: InputMaybe<Array<OrderStatus>>;
};


export type QueryCanteenPromotionsArgs = {
  canteenId: Scalars['Int']['input'];
};


export type QueryCanteenStaffArgs = {
  canteenId: Scalars['Int']['input'];
};


export type QueryCanteenStatsArgs = {
  canteenId: Scalars['Int']['input'];
};


export type QueryCanteensArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  openOnly?: Scalars['Boolean']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryComplaintsArgs = {
  canteenId?: InputMaybe<Scalars['Int']['input']>;
  limit?: Scalars['Int']['input'];
  mineOnly?: Scalars['Boolean']['input'];
  offset?: Scalars['Int']['input'];
  status?: InputMaybe<ComplaintStatus>;
};


export type QueryLivePromotionsArgs = {
  canteenId: Scalars['Int']['input'];
};


export type QueryMenuCategoriesArgs = {
  canteenId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMenuItemArgs = {
  id: Scalars['Int']['input'];
};


export type QueryMenuItemsArgs = {
  canteenId?: InputMaybe<Scalars['Int']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  featuredOnly?: Scalars['Boolean']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  vegetarianOnly?: Scalars['Boolean']['input'];
};


export type QueryMyOrdersArgs = {
  activeOnly?: Scalars['Boolean']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


export type QueryNotificationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  unreadOnly?: Scalars['Boolean']['input'];
};


export type QueryOrderArgs = {
  id: Scalars['Int']['input'];
};


export type QueryPromotionPreviewArgs = {
  code: Scalars['String']['input'];
};


export type QueryRevenueTimeseriesArgs = {
  canteenId?: InputMaybe<Scalars['Int']['input']>;
  days?: Scalars['Int']['input'];
};


export type QueryReviewsArgs = {
  canteenId?: InputMaybe<Scalars['Int']['input']>;
  limit?: Scalars['Int']['input'];
  menuItemId?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
};


export type QueryTopItemsArgs = {
  canteenId?: InputMaybe<Scalars['Int']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryUsersArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  role?: InputMaybe<UserRole>;
  search?: InputMaybe<Scalars['String']['input']>;
};

/** Everything the browser SDK needs to open the payment sheet. */
export type RazorpayCheckout = {
  __typename?: 'RazorpayCheckout';
  amount: Money;
  currency: Scalars['String']['output'];
  customerEmail: Scalars['String']['output'];
  customerName: Scalars['String']['output'];
  customerPhone?: Maybe<Scalars['String']['output']>;
  gatewayOrderId: Scalars['String']['output'];
  keyId: Scalars['String']['output'];
  orderReference: Scalars['String']['output'];
  paymentId: Scalars['Int']['output'];
};

export type Review = {
  __typename?: 'Review';
  author?: Maybe<PublicUser>;
  body?: Maybe<Scalars['String']['output']>;
  canteenId: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  menuItemId?: Maybe<Scalars['Int']['output']>;
  orderId: Scalars['Int']['output'];
  rating: Scalars['Int']['output'];
  userId: Scalars['ID']['output'];
};

export type ReviewInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  menuItemId?: InputMaybe<Scalars['Int']['input']>;
  orderId: Scalars['Int']['input'];
  rating: Scalars['Int']['input'];
};

export type SignInInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type SignUpInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Live order queue for a canteen kitchen display. */
  canteenOrderQueue: OrderStatusUpdate;
  /** Notifications addressed to the signed-in user. */
  notifications: NotificationEvent;
  /** Live status for one order. Owner or canteen team only. */
  orderStatus: OrderStatusUpdate;
};


export type SubscriptionCanteenOrderQueueArgs = {
  canteenId: Scalars['Int']['input'];
};


export type SubscriptionOrderStatusArgs = {
  orderId: Scalars['Int']['input'];
};

export type TimeseriesPoint = {
  __typename?: 'TimeseriesPoint';
  date: Scalars['String']['output'];
  orders: Scalars['Int']['output'];
  revenue: Money;
};

export type TopItem = {
  __typename?: 'TopItem';
  menuItemId?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  revenue: Money;
};

export type User = {
  __typename?: 'User';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isVegetarian: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  role: UserRole;
  upiId?: Maybe<Scalars['String']['output']>;
};

export enum UserRole {
  Admin = 'ADMIN',
  Staff = 'STAFF',
  Student = 'STUDENT',
  Vendor = 'VENDOR'
}

export type Wallet = {
  __typename?: 'Wallet';
  balance: Money;
  id: Scalars['Int']['output'];
  isFrozen: Scalars['Boolean']['output'];
  transactions: Array<WalletTransaction>;
};

export type WalletTransaction = {
  __typename?: 'WalletTransaction';
  amount: Money;
  balanceAfter: Money;
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  orderId?: Maybe<Scalars['Int']['output']>;
};

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, name: string, email: string, role: UserRole, phone?: string | null, avatarUrl?: string | null, upiId?: string | null, isVegetarian: boolean, isActive: boolean } | null };

export type SignInMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type SignInMutation = { __typename?: 'Mutation', signIn: { __typename?: 'AuthPayload', csrfToken: string, user: { __typename?: 'User', id: string, name: string, email: string, role: UserRole, phone?: string | null, avatarUrl?: string | null, upiId?: string | null, isVegetarian: boolean, isActive: boolean } } };

export type SignUpMutationVariables = Exact<{
  name: Scalars['String']['input'];
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type SignUpMutation = { __typename?: 'Mutation', signUp: { __typename?: 'AuthPayload', csrfToken: string, user: { __typename?: 'User', id: string, name: string, email: string, role: UserRole, phone?: string | null, avatarUrl?: string | null, upiId?: string | null, isVegetarian: boolean, isActive: boolean } } };

export type SignOutMutationVariables = Exact<{ [key: string]: never; }>;


export type SignOutMutation = { __typename?: 'Mutation', signOut: { __typename?: 'MutationSuccess', success: boolean, message?: string | null } };

export type InitiateCasLoginMutationVariables = Exact<{ [key: string]: never; }>;


export type InitiateCasLoginMutation = { __typename?: 'Mutation', initiateCasLogin: string };

export type VerifyCasTicketMutationVariables = Exact<{
  ticket: Scalars['String']['input'];
}>;


export type VerifyCasTicketMutation = { __typename?: 'Mutation', verifyCasTicket: { __typename?: 'AuthPayload', csrfToken: string, user: { __typename?: 'User', id: string, name: string, email: string, role: UserRole, phone?: string | null, avatarUrl?: string | null, upiId?: string | null, isVegetarian: boolean, isActive: boolean } } };

export type UpdateProfileMutationVariables = Exact<{
  input: ProfileInput;
}>;


export type UpdateProfileMutation = { __typename?: 'Mutation', updateProfile: { __typename?: 'User', id: string, name: string, email: string, phone?: string | null, avatarUrl?: string | null, upiId?: string | null, isVegetarian: boolean } };

export type ChangePasswordMutationVariables = Exact<{
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}>;


export type ChangePasswordMutation = { __typename?: 'Mutation', changePassword: { __typename?: 'MutationSuccess', success: boolean, message?: string | null } };

export type DeleteMyAccountMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteMyAccountMutation = { __typename?: 'Mutation', deleteMyAccount: { __typename?: 'MutationSuccess', success: boolean, message?: string | null } };

export type CanteensQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  openOnly?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CanteensQuery = { __typename?: 'Query', canteens: Array<{ __typename?: 'Canteen', id: number, name: string, slug: string, description?: string | null, location?: string | null, bannerUrl?: string | null, logoUrl?: string | null, rating: number, ratingCount: number, isOpenNow: boolean, isAcceptingOrders: boolean, tags: Array<string>, averagePreparationMinutes: number, menuItemCount: number, isFavorite: boolean }> };

export type CanteenQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type CanteenQuery = { __typename?: 'Query', canteen: { __typename?: 'Canteen', id: number, name: string, slug: string, description?: string | null, location?: string | null, bannerUrl?: string | null, logoUrl?: string | null, phone?: string | null, email?: string | null, rating: number, ratingCount: number, opensAt?: string | null, closesAt?: string | null, isOpenNow: boolean, isAcceptingOrders: boolean, tags: Array<string>, averagePreparationMinutes: number, menuItemCount: number, isFavorite: boolean } };

export type MenuItemsQueryVariables = Exact<{
  canteenId?: InputMaybe<Scalars['Int']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  vegetarianOnly?: InputMaybe<Scalars['Boolean']['input']>;
  featuredOnly?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type MenuItemsQuery = { __typename?: 'Query', menuItems: Array<{ __typename?: 'MenuItem', id: number, name: string, description?: string | null, imageUrl?: string | null, category?: string | null, canteenId: number, canteenName?: string | null, isVegetarian: boolean, isVegan: boolean, isAvailable: boolean, isFeatured: boolean, isOrderable: boolean, stockCount?: number | null, preparationMinutes: number, rating: number, ratingCount: number, tags: Array<string>, price: { __typename?: 'Money', paise: number, formatted: string }, customizationGroups: Array<{ __typename?: 'CustomizationGroup', id: string, label: string, selection: string, required: boolean, options: Array<{ __typename?: 'CustomizationOption', id: string, label: string, isDefault: boolean, priceDelta: { __typename?: 'Money', paise: number, formatted: string } }> }> }> };

export type MenuCategoriesQueryVariables = Exact<{
  canteenId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type MenuCategoriesQuery = { __typename?: 'Query', menuCategories: Array<string> };

export type ReviewsQueryVariables = Exact<{
  canteenId?: InputMaybe<Scalars['Int']['input']>;
  menuItemId?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ReviewsQuery = { __typename?: 'Query', reviews: Array<{ __typename?: 'Review', id: number, rating: number, body?: string | null, createdAt: string, author?: { __typename?: 'PublicUser', id: string, name: string, avatarUrl?: string | null } | null }> };

export type LivePromotionsQueryVariables = Exact<{
  canteenId: Scalars['Int']['input'];
}>;


export type LivePromotionsQuery = { __typename?: 'Query', livePromotions: Array<{ __typename?: 'Promotion', id: number, code: string, title: string, description?: string | null, type: PromotionType, value: number, minOrder: { __typename?: 'Money', paise: number, formatted: string }, maxDiscount?: { __typename?: 'Money', paise: number, formatted: string } | null }> };

export type CartQueryVariables = Exact<{ [key: string]: never; }>;


export type CartQuery = { __typename?: 'Query', cart: { __typename?: 'Cart', id: number, canteenId?: number | null, canteenName?: string | null, itemCount: number, blockingIssues: Array<string>, scheduledFor?: string | null, subtotal: { __typename?: 'Money', paise: number, formatted: string }, tax: { __typename?: 'Money', paise: number, formatted: string }, total: { __typename?: 'Money', paise: number, formatted: string }, items: Array<{ __typename?: 'CartItem', id: number, menuItemId: number, quantity: number, note?: string | null, customizations: Record<string, unknown>, customizationSummary?: string | null, isOrderable: boolean, unitPrice: { __typename?: 'Money', paise: number, formatted: string }, lineTotal: { __typename?: 'Money', paise: number, formatted: string }, menuItem?: { __typename?: 'MenuItem', id: number, name: string, imageUrl?: string | null, isVegetarian: boolean, stockCount?: number | null } | null }> } };

export type AddToCartMutationVariables = Exact<{
  input: AddToCartInput;
}>;


export type AddToCartMutation = { __typename?: 'Mutation', addToCart: { __typename?: 'Cart', id: number, canteenId?: number | null, canteenName?: string | null, itemCount: number, blockingIssues: Array<string>, subtotal: { __typename?: 'Money', paise: number, formatted: string }, tax: { __typename?: 'Money', paise: number, formatted: string }, total: { __typename?: 'Money', paise: number, formatted: string }, items: Array<{ __typename?: 'CartItem', id: number, menuItemId: number, quantity: number, note?: string | null, customizations: Record<string, unknown>, customizationSummary?: string | null, isOrderable: boolean, unitPrice: { __typename?: 'Money', paise: number, formatted: string }, lineTotal: { __typename?: 'Money', paise: number, formatted: string }, menuItem?: { __typename?: 'MenuItem', id: number, name: string, imageUrl?: string | null, isVegetarian: boolean, stockCount?: number | null } | null }> } };

export type UpdateCartItemMutationVariables = Exact<{
  cartItemId: Scalars['Int']['input'];
  quantity: Scalars['Int']['input'];
}>;


export type UpdateCartItemMutation = { __typename?: 'Mutation', updateCartItem: { __typename?: 'Cart', id: number, itemCount: number, blockingIssues: Array<string>, subtotal: { __typename?: 'Money', paise: number, formatted: string }, tax: { __typename?: 'Money', paise: number, formatted: string }, total: { __typename?: 'Money', paise: number, formatted: string }, items: Array<{ __typename?: 'CartItem', id: number, quantity: number, isOrderable: boolean, lineTotal: { __typename?: 'Money', paise: number, formatted: string } }> } };

export type RemoveFromCartMutationVariables = Exact<{
  cartItemId: Scalars['Int']['input'];
}>;


export type RemoveFromCartMutation = { __typename?: 'Mutation', removeFromCart: { __typename?: 'Cart', id: number, canteenId?: number | null, itemCount: number, blockingIssues: Array<string>, subtotal: { __typename?: 'Money', paise: number, formatted: string }, tax: { __typename?: 'Money', paise: number, formatted: string }, total: { __typename?: 'Money', paise: number, formatted: string }, items: Array<{ __typename?: 'CartItem', id: number }> } };

export type ClearCartMutationVariables = Exact<{ [key: string]: never; }>;


export type ClearCartMutation = { __typename?: 'Mutation', clearCart: { __typename?: 'Cart', id: number, canteenId?: number | null, itemCount: number, items: Array<{ __typename?: 'CartItem', id: number }> } };

export type SetCartPickupTimeMutationVariables = Exact<{
  scheduledFor?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type SetCartPickupTimeMutation = { __typename?: 'Mutation', setCartPickupTime: { __typename?: 'Cart', id: number, scheduledFor?: string | null } };

export type PromotionPreviewQueryVariables = Exact<{
  code: Scalars['String']['input'];
}>;


export type PromotionPreviewQuery = { __typename?: 'Query', promotionPreview: { __typename?: 'PromotionPreview', valid: boolean, message: string, discount: { __typename?: 'Money', paise: number, formatted: string } } };

export type OrderFieldsFragment = { __typename?: 'Order', id: number, reference: string, canteenId: number, canteenName?: string | null, status: OrderStatus, paymentStatus: PaymentStatus, paymentMethod?: PaymentMethod | null, createdAt: string, scheduledFor?: string | null, readyEstimateAt?: string | null, completedAt?: string | null, cancelledAt?: string | null, cancellationReason?: string | null, customerNote?: string | null, contactPhone?: string | null, canCancel: boolean, subtotal: { __typename?: 'Money', paise: number, formatted: string }, tax: { __typename?: 'Money', paise: number, formatted: string }, discount: { __typename?: 'Money', paise: number, formatted: string }, total: { __typename?: 'Money', paise: number, formatted: string }, items: Array<{ __typename?: 'OrderItem', id: number, menuItemId?: number | null, name: string, imageUrl?: string | null, quantity: number, note?: string | null, customizations: Record<string, unknown>, customizationSummary?: string | null, lineTotal: { __typename?: 'Money', paise: number, formatted: string } }>, statusEvents: Array<{ __typename?: 'OrderStatusEvent', id: number, status: OrderStatus, note?: string | null, createdAt: string }>, customer?: { __typename?: 'PublicUser', id: string, name: string, avatarUrl?: string | null } | null };

export type MyOrdersQueryVariables = Exact<{
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type MyOrdersQuery = { __typename?: 'Query', myOrders: Array<{ __typename?: 'Order', id: number, reference: string, canteenId: number, canteenName?: string | null, status: OrderStatus, paymentStatus: PaymentStatus, paymentMethod?: PaymentMethod | null, createdAt: string, scheduledFor?: string | null, readyEstimateAt?: string | null, completedAt?: string | null, cancelledAt?: string | null, cancellationReason?: string | null, customerNote?: string | null, contactPhone?: string | null, canCancel: boolean, subtotal: { __typename?: 'Money', paise: number, formatted: string }, tax: { __typename?: 'Money', paise: number, formatted: string }, discount: { __typename?: 'Money', paise: number, formatted: string }, total: { __typename?: 'Money', paise: number, formatted: string }, items: Array<{ __typename?: 'OrderItem', id: number, menuItemId?: number | null, name: string, imageUrl?: string | null, quantity: number, note?: string | null, customizations: Record<string, unknown>, customizationSummary?: string | null, lineTotal: { __typename?: 'Money', paise: number, formatted: string } }>, statusEvents: Array<{ __typename?: 'OrderStatusEvent', id: number, status: OrderStatus, note?: string | null, createdAt: string }>, customer?: { __typename?: 'PublicUser', id: string, name: string, avatarUrl?: string | null } | null }> };

export type OrderQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type OrderQuery = { __typename?: 'Query', order: { __typename?: 'Order', id: number, reference: string, canteenId: number, canteenName?: string | null, status: OrderStatus, paymentStatus: PaymentStatus, paymentMethod?: PaymentMethod | null, createdAt: string, scheduledFor?: string | null, readyEstimateAt?: string | null, completedAt?: string | null, cancelledAt?: string | null, cancellationReason?: string | null, customerNote?: string | null, contactPhone?: string | null, canCancel: boolean, subtotal: { __typename?: 'Money', paise: number, formatted: string }, tax: { __typename?: 'Money', paise: number, formatted: string }, discount: { __typename?: 'Money', paise: number, formatted: string }, total: { __typename?: 'Money', paise: number, formatted: string }, items: Array<{ __typename?: 'OrderItem', id: number, menuItemId?: number | null, name: string, imageUrl?: string | null, quantity: number, note?: string | null, customizations: Record<string, unknown>, customizationSummary?: string | null, lineTotal: { __typename?: 'Money', paise: number, formatted: string } }>, statusEvents: Array<{ __typename?: 'OrderStatusEvent', id: number, status: OrderStatus, note?: string | null, createdAt: string }>, customer?: { __typename?: 'PublicUser', id: string, name: string, avatarUrl?: string | null } | null } };

export type PlaceOrderMutationVariables = Exact<{
  input: PlaceOrderInput;
}>;


export type PlaceOrderMutation = { __typename?: 'Mutation', placeOrder: { __typename?: 'Order', id: number, reference: string, canteenId: number, canteenName?: string | null, status: OrderStatus, paymentStatus: PaymentStatus, paymentMethod?: PaymentMethod | null, createdAt: string, scheduledFor?: string | null, readyEstimateAt?: string | null, completedAt?: string | null, cancelledAt?: string | null, cancellationReason?: string | null, customerNote?: string | null, contactPhone?: string | null, canCancel: boolean, subtotal: { __typename?: 'Money', paise: number, formatted: string }, tax: { __typename?: 'Money', paise: number, formatted: string }, discount: { __typename?: 'Money', paise: number, formatted: string }, total: { __typename?: 'Money', paise: number, formatted: string }, items: Array<{ __typename?: 'OrderItem', id: number, menuItemId?: number | null, name: string, imageUrl?: string | null, quantity: number, note?: string | null, customizations: Record<string, unknown>, customizationSummary?: string | null, lineTotal: { __typename?: 'Money', paise: number, formatted: string } }>, statusEvents: Array<{ __typename?: 'OrderStatusEvent', id: number, status: OrderStatus, note?: string | null, createdAt: string }>, customer?: { __typename?: 'PublicUser', id: string, name: string, avatarUrl?: string | null } | null } };

export type CancelOrderMutationVariables = Exact<{
  orderId: Scalars['Int']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type CancelOrderMutation = { __typename?: 'Mutation', cancelOrder: { __typename?: 'Order', id: number, reference: string, canteenId: number, canteenName?: string | null, status: OrderStatus, paymentStatus: PaymentStatus, paymentMethod?: PaymentMethod | null, createdAt: string, scheduledFor?: string | null, readyEstimateAt?: string | null, completedAt?: string | null, cancelledAt?: string | null, cancellationReason?: string | null, customerNote?: string | null, contactPhone?: string | null, canCancel: boolean, subtotal: { __typename?: 'Money', paise: number, formatted: string }, tax: { __typename?: 'Money', paise: number, formatted: string }, discount: { __typename?: 'Money', paise: number, formatted: string }, total: { __typename?: 'Money', paise: number, formatted: string }, items: Array<{ __typename?: 'OrderItem', id: number, menuItemId?: number | null, name: string, imageUrl?: string | null, quantity: number, note?: string | null, customizations: Record<string, unknown>, customizationSummary?: string | null, lineTotal: { __typename?: 'Money', paise: number, formatted: string } }>, statusEvents: Array<{ __typename?: 'OrderStatusEvent', id: number, status: OrderStatus, note?: string | null, createdAt: string }>, customer?: { __typename?: 'PublicUser', id: string, name: string, avatarUrl?: string | null } | null } };

export type UpdateOrderStatusMutationVariables = Exact<{
  orderId: Scalars['Int']['input'];
  status: OrderStatus;
  note?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateOrderStatusMutation = { __typename?: 'Mutation', updateOrderStatus: { __typename?: 'Order', id: number, reference: string, canteenId: number, canteenName?: string | null, status: OrderStatus, paymentStatus: PaymentStatus, paymentMethod?: PaymentMethod | null, createdAt: string, scheduledFor?: string | null, readyEstimateAt?: string | null, completedAt?: string | null, cancelledAt?: string | null, cancellationReason?: string | null, customerNote?: string | null, contactPhone?: string | null, canCancel: boolean, subtotal: { __typename?: 'Money', paise: number, formatted: string }, tax: { __typename?: 'Money', paise: number, formatted: string }, discount: { __typename?: 'Money', paise: number, formatted: string }, total: { __typename?: 'Money', paise: number, formatted: string }, items: Array<{ __typename?: 'OrderItem', id: number, menuItemId?: number | null, name: string, imageUrl?: string | null, quantity: number, note?: string | null, customizations: Record<string, unknown>, customizationSummary?: string | null, lineTotal: { __typename?: 'Money', paise: number, formatted: string } }>, statusEvents: Array<{ __typename?: 'OrderStatusEvent', id: number, status: OrderStatus, note?: string | null, createdAt: string }>, customer?: { __typename?: 'PublicUser', id: string, name: string, avatarUrl?: string | null } | null } };

export type InitiatePaymentMutationVariables = Exact<{
  orderId: Scalars['Int']['input'];
  idempotencyKey?: InputMaybe<Scalars['String']['input']>;
}>;


export type InitiatePaymentMutation = { __typename?: 'Mutation', initiatePayment?: { __typename?: 'RazorpayCheckout', paymentId: number, gatewayOrderId: string, keyId: string, currency: string, orderReference: string, customerName: string, customerEmail: string, customerPhone?: string | null, amount: { __typename?: 'Money', paise: number, formatted: string } } | null };

export type VerifyPaymentMutationVariables = Exact<{
  gatewayOrderId: Scalars['String']['input'];
  gatewayPaymentId: Scalars['String']['input'];
  signature: Scalars['String']['input'];
}>;


export type VerifyPaymentMutation = { __typename?: 'Mutation', verifyPayment: { __typename?: 'Order', id: number, reference: string, canteenId: number, canteenName?: string | null, status: OrderStatus, paymentStatus: PaymentStatus, paymentMethod?: PaymentMethod | null, createdAt: string, scheduledFor?: string | null, readyEstimateAt?: string | null, completedAt?: string | null, cancelledAt?: string | null, cancellationReason?: string | null, customerNote?: string | null, contactPhone?: string | null, canCancel: boolean, subtotal: { __typename?: 'Money', paise: number, formatted: string }, tax: { __typename?: 'Money', paise: number, formatted: string }, discount: { __typename?: 'Money', paise: number, formatted: string }, total: { __typename?: 'Money', paise: number, formatted: string }, items: Array<{ __typename?: 'OrderItem', id: number, menuItemId?: number | null, name: string, imageUrl?: string | null, quantity: number, note?: string | null, customizations: Record<string, unknown>, customizationSummary?: string | null, lineTotal: { __typename?: 'Money', paise: number, formatted: string } }>, statusEvents: Array<{ __typename?: 'OrderStatusEvent', id: number, status: OrderStatus, note?: string | null, createdAt: string }>, customer?: { __typename?: 'PublicUser', id: string, name: string, avatarUrl?: string | null } | null } };

export type WalletQueryVariables = Exact<{ [key: string]: never; }>;


export type WalletQuery = { __typename?: 'Query', wallet: { __typename?: 'Wallet', id: number, isFrozen: boolean, balance: { __typename?: 'Money', paise: number, formatted: string }, transactions: Array<{ __typename?: 'WalletTransaction', id: number, description: string, createdAt: string, orderId?: number | null, amount: { __typename?: 'Money', paise: number, formatted: string }, balanceAfter: { __typename?: 'Money', paise: number, formatted: string } }> } };

export type CreateWalletTopUpMutationVariables = Exact<{
  amountPaise: Scalars['Int']['input'];
}>;


export type CreateWalletTopUpMutation = { __typename?: 'Mutation', createWalletTopUp: string };

export type NotificationsQueryVariables = Exact<{
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type NotificationsQuery = { __typename?: 'Query', unreadNotificationCount: number, notifications: Array<{ __typename?: 'Notification', id: number, type: NotificationType, title: string, body?: string | null, link?: string | null, isRead: boolean, createdAt: string }> };

export type MarkNotificationReadMutationVariables = Exact<{
  notificationId: Scalars['Int']['input'];
}>;


export type MarkNotificationReadMutation = { __typename?: 'Mutation', markNotificationRead: { __typename?: 'Notification', id: number, isRead: boolean } };

export type MarkAllNotificationsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsReadMutation = { __typename?: 'Mutation', markAllNotificationsRead: { __typename?: 'MutationSuccess', success: boolean, message?: string | null } };

export type ComplaintsQueryVariables = Exact<{
  canteenId?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<ComplaintStatus>;
  mineOnly?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ComplaintsQuery = { __typename?: 'Query', complaints: Array<{ __typename?: 'Complaint', id: number, orderId?: number | null, canteenId?: number | null, canteenName?: string | null, subject: string, body: string, category: ComplaintCategory, status: ComplaintStatus, attachmentUrls: Array<string>, responseBody?: string | null, respondedAt?: string | null, createdAt: string, author?: { __typename?: 'PublicUser', id: string, name: string, avatarUrl?: string | null } | null }> };

export type CreateComplaintMutationVariables = Exact<{
  input: ComplaintInput;
}>;


export type CreateComplaintMutation = { __typename?: 'Mutation', createComplaint: { __typename?: 'Complaint', id: number, subject: string, status: ComplaintStatus, createdAt: string } };

export type RespondToComplaintMutationVariables = Exact<{
  complaintId: Scalars['Int']['input'];
  responseBody: Scalars['String']['input'];
  status: ComplaintStatus;
}>;


export type RespondToComplaintMutation = { __typename?: 'Mutation', respondToComplaint: { __typename?: 'Complaint', id: number, status: ComplaintStatus, responseBody?: string | null, respondedAt?: string | null } };

export type CreateReviewMutationVariables = Exact<{
  input: ReviewInput;
}>;


export type CreateReviewMutation = { __typename?: 'Mutation', createReview: { __typename?: 'Review', id: number, rating: number, body?: string | null, createdAt: string } };

export type FavoriteCanteensQueryVariables = Exact<{ [key: string]: never; }>;


export type FavoriteCanteensQuery = { __typename?: 'Query', favoriteCanteens: Array<{ __typename?: 'Canteen', id: number, name: string, location?: string | null, bannerUrl?: string | null, rating: number, isOpenNow: boolean, isFavorite: boolean, menuItemCount: number, tags: Array<string> }> };

export type SetFavoriteCanteenMutationVariables = Exact<{
  canteenId: Scalars['Int']['input'];
  favorite: Scalars['Boolean']['input'];
}>;


export type SetFavoriteCanteenMutation = { __typename?: 'Mutation', setFavoriteCanteen: { __typename?: 'MutationSuccess', success: boolean } };

export type MyBulkOrdersQueryVariables = Exact<{ [key: string]: never; }>;


export type MyBulkOrdersQuery = { __typename?: 'Query', myBulkOrders: Array<{ __typename?: 'BulkOrder', id: number, reference: string, canteenId: number, canteenName?: string | null, title: string, notes?: string | null, headCount: number, requiredAt: string, status: BulkOrderStatus, quoteNote?: string | null, quotedAt?: string | null, createdAt: string, quotedTotal?: { __typename?: 'Money', paise: number, formatted: string } | null }> };

export type CreateBulkOrderMutationVariables = Exact<{
  input: BulkOrderInput;
}>;


export type CreateBulkOrderMutation = { __typename?: 'Mutation', createBulkOrder: { __typename?: 'BulkOrder', id: number, reference: string, status: BulkOrderStatus } };

export type SetBulkOrderStatusMutationVariables = Exact<{
  bulkOrderId: Scalars['Int']['input'];
  status: BulkOrderStatus;
}>;


export type SetBulkOrderStatusMutation = { __typename?: 'Mutation', setBulkOrderStatus: { __typename?: 'BulkOrder', id: number, status: BulkOrderStatus } };

export type ManagedCanteensQueryVariables = Exact<{ [key: string]: never; }>;


export type ManagedCanteensQuery = { __typename?: 'Query', managedCanteens: Array<{ __typename?: 'Canteen', id: number, name: string, slug: string, location?: string | null, bannerUrl?: string | null, logoUrl?: string | null, isOpenNow: boolean, isAcceptingOrders: boolean, rating: number, menuItemCount: number }> };

export type CanteenOrdersQueryVariables = Exact<{
  canteenId: Scalars['Int']['input'];
  statuses?: InputMaybe<Array<OrderStatus> | OrderStatus>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CanteenOrdersQuery = { __typename?: 'Query', canteenOrders: Array<{ __typename?: 'Order', id: number, reference: string, canteenId: number, canteenName?: string | null, status: OrderStatus, paymentStatus: PaymentStatus, paymentMethod?: PaymentMethod | null, createdAt: string, scheduledFor?: string | null, readyEstimateAt?: string | null, completedAt?: string | null, cancelledAt?: string | null, cancellationReason?: string | null, customerNote?: string | null, contactPhone?: string | null, canCancel: boolean, subtotal: { __typename?: 'Money', paise: number, formatted: string }, tax: { __typename?: 'Money', paise: number, formatted: string }, discount: { __typename?: 'Money', paise: number, formatted: string }, total: { __typename?: 'Money', paise: number, formatted: string }, items: Array<{ __typename?: 'OrderItem', id: number, menuItemId?: number | null, name: string, imageUrl?: string | null, quantity: number, note?: string | null, customizations: Record<string, unknown>, customizationSummary?: string | null, lineTotal: { __typename?: 'Money', paise: number, formatted: string } }>, statusEvents: Array<{ __typename?: 'OrderStatusEvent', id: number, status: OrderStatus, note?: string | null, createdAt: string }>, customer?: { __typename?: 'PublicUser', id: string, name: string, avatarUrl?: string | null } | null }> };

export type CanteenMenuQueryVariables = Exact<{
  canteenId: Scalars['Int']['input'];
}>;


export type CanteenMenuQuery = { __typename?: 'Query', canteenMenu: Array<{ __typename?: 'MenuItem', id: number, name: string, description?: string | null, imageUrl?: string | null, category?: string | null, canteenId: number, isVegetarian: boolean, isVegan: boolean, isAvailable: boolean, isFeatured: boolean, isOrderable: boolean, stockCount?: number | null, preparationMinutes: number, rating: number, tags: Array<string>, price: { __typename?: 'Money', paise: number, formatted: string }, customizationGroups: Array<{ __typename?: 'CustomizationGroup', id: string, label: string, selection: string, required: boolean, options: Array<{ __typename?: 'CustomizationOption', id: string, label: string, isDefault: boolean, priceDelta: { __typename?: 'Money', paise: number } }> }> }> };

export type CanteenStatsQueryVariables = Exact<{
  canteenId: Scalars['Int']['input'];
}>;


export type CanteenStatsQuery = { __typename?: 'Query', canteenStats: { __typename?: 'CanteenStats', canteenId: number, canteenName: string, ordersToday: number, ordersTotal: number, pendingOrders: number, openComplaints: number, rating: number, revenueToday: { __typename?: 'Money', paise: number, formatted: string }, revenueTotal: { __typename?: 'Money', paise: number, formatted: string }, averageOrderValue: { __typename?: 'Money', paise: number, formatted: string } } };

export type RevenueTimeseriesQueryVariables = Exact<{
  canteenId?: InputMaybe<Scalars['Int']['input']>;
  days?: InputMaybe<Scalars['Int']['input']>;
}>;


export type RevenueTimeseriesQuery = { __typename?: 'Query', revenueTimeseries: Array<{ __typename?: 'TimeseriesPoint', date: string, orders: number, revenue: { __typename?: 'Money', paise: number, rupees: number } }> };

export type TopItemsQueryVariables = Exact<{
  canteenId?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type TopItemsQuery = { __typename?: 'Query', topItems: Array<{ __typename?: 'TopItem', menuItemId?: number | null, name: string, quantity: number, revenue: { __typename?: 'Money', paise: number, formatted: string, rupees: number } }> };

export type CreateMenuItemMutationVariables = Exact<{
  canteenId: Scalars['Int']['input'];
  input: MenuItemInput;
}>;


export type CreateMenuItemMutation = { __typename?: 'Mutation', createMenuItem: { __typename?: 'MenuItem', id: number, name: string, isAvailable: boolean, price: { __typename?: 'Money', paise: number, formatted: string } } };

export type UpdateMenuItemMutationVariables = Exact<{
  itemId: Scalars['Int']['input'];
  input: MenuItemInput;
}>;


export type UpdateMenuItemMutation = { __typename?: 'Mutation', updateMenuItem: { __typename?: 'MenuItem', id: number, name: string, description?: string | null, imageUrl?: string | null, category?: string | null, isVegetarian: boolean, isAvailable: boolean, isFeatured: boolean, stockCount?: number | null, preparationMinutes: number, price: { __typename?: 'Money', paise: number, formatted: string } } };

export type DeleteMenuItemMutationVariables = Exact<{
  itemId: Scalars['Int']['input'];
}>;


export type DeleteMenuItemMutation = { __typename?: 'Mutation', deleteMenuItem: { __typename?: 'MutationSuccess', success: boolean, message?: string | null } };

export type SetMenuItemStockMutationVariables = Exact<{
  itemId: Scalars['Int']['input'];
  stockCount?: InputMaybe<Scalars['Int']['input']>;
}>;


export type SetMenuItemStockMutation = { __typename?: 'Mutation', setMenuItemStock: { __typename?: 'MenuItem', id: number, stockCount?: number | null, isOrderable: boolean } };

export type UpdateCanteenMutationVariables = Exact<{
  canteenId: Scalars['Int']['input'];
  input: CanteenInput;
}>;


export type UpdateCanteenMutation = { __typename?: 'Mutation', updateCanteen: { __typename?: 'Canteen', id: number, name: string, description?: string | null, location?: string | null, phone?: string | null, email?: string | null, bannerUrl?: string | null, logoUrl?: string | null, opensAt?: string | null, closesAt?: string | null, isAcceptingOrders: boolean, isOpenNow: boolean, tags: Array<string>, averagePreparationMinutes: number } };

export type CanteenPromotionsQueryVariables = Exact<{
  canteenId: Scalars['Int']['input'];
}>;


export type CanteenPromotionsQuery = { __typename?: 'Query', canteenPromotions: Array<{ __typename?: 'Promotion', id: number, code: string, title: string, description?: string | null, type: PromotionType, value: number, startsAt: string, endsAt: string, isActive: boolean, isLiveNow: boolean, redemptionCount: number, maxRedemptions?: number | null, maxRedemptionsPerUser: number, minOrder: { __typename?: 'Money', paise: number, formatted: string }, maxDiscount?: { __typename?: 'Money', paise: number, formatted: string } | null }> };

export type CreatePromotionMutationVariables = Exact<{
  canteenId: Scalars['Int']['input'];
  input: PromotionInput;
}>;


export type CreatePromotionMutation = { __typename?: 'Mutation', createPromotion: { __typename?: 'Promotion', id: number, code: string, title: string, isActive: boolean, isLiveNow: boolean } };

export type SetPromotionActiveMutationVariables = Exact<{
  promotionId: Scalars['Int']['input'];
  isActive: Scalars['Boolean']['input'];
}>;


export type SetPromotionActiveMutation = { __typename?: 'Mutation', setPromotionActive: { __typename?: 'Promotion', id: number, isActive: boolean, isLiveNow: boolean } };

export type CanteenBulkOrdersQueryVariables = Exact<{
  canteenId: Scalars['Int']['input'];
}>;


export type CanteenBulkOrdersQuery = { __typename?: 'Query', canteenBulkOrders: Array<{ __typename?: 'BulkOrder', id: number, reference: string, title: string, notes?: string | null, headCount: number, requiredAt: string, contactPhone?: string | null, requestedItems: Record<string, unknown>, status: BulkOrderStatus, quoteNote?: string | null, createdAt: string, quotedTotal?: { __typename?: 'Money', paise: number, formatted: string } | null, requester?: { __typename?: 'PublicUser', id: string, name: string, avatarUrl?: string | null } | null }> };

export type QuoteBulkOrderMutationVariables = Exact<{
  bulkOrderId: Scalars['Int']['input'];
  quotedTotalPaise: Scalars['Int']['input'];
  quoteNote?: InputMaybe<Scalars['String']['input']>;
}>;


export type QuoteBulkOrderMutation = { __typename?: 'Mutation', quoteBulkOrder: { __typename?: 'BulkOrder', id: number, status: BulkOrderStatus, quotedTotal?: { __typename?: 'Money', paise: number, formatted: string } | null } };

export type CanteenStaffQueryVariables = Exact<{
  canteenId: Scalars['Int']['input'];
}>;


export type CanteenStaffQuery = { __typename?: 'Query', canteenStaff: Array<{ __typename?: 'User', id: string, name: string, email: string, role: UserRole, avatarUrl?: string | null }> };

export type AssignStaffMutationVariables = Exact<{
  canteenId: Scalars['Int']['input'];
  userIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type AssignStaffMutation = { __typename?: 'Mutation', assignStaff: Array<{ __typename?: 'User', id: string, name: string, email: string, role: UserRole }> };

export type RemoveStaffMutationVariables = Exact<{
  canteenId: Scalars['Int']['input'];
  userIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type RemoveStaffMutation = { __typename?: 'Mutation', removeStaff: Array<{ __typename?: 'User', id: string, name: string, email: string, role: UserRole }> };

export type PlatformStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type PlatformStatsQuery = { __typename?: 'Query', platformStats: { __typename?: 'PlatformStats', totalUsers: number, totalVendors: number, totalCanteens: number, totalMenuItems: number, ordersToday: number, openComplaints: number, activeOrders: number, revenueToday: { __typename?: 'Money', paise: number, formatted: string }, revenueTotal: { __typename?: 'Money', paise: number, formatted: string } } };

export type UsersQueryVariables = Exact<{
  role?: InputMaybe<UserRole>;
  search?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: string, name: string, email: string, role: UserRole, phone?: string | null, avatarUrl?: string | null, isActive: boolean, createdAt: string }> };

export type CreateStaffAccountMutationVariables = Exact<{
  name: Scalars['String']['input'];
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  role: UserRole;
}>;


export type CreateStaffAccountMutation = { __typename?: 'Mutation', createStaffAccount: { __typename?: 'User', id: string, name: string, email: string, role: UserRole } };

export type SetUserRoleMutationVariables = Exact<{
  userId: Scalars['String']['input'];
  role: UserRole;
}>;


export type SetUserRoleMutation = { __typename?: 'Mutation', setUserRole: { __typename?: 'User', id: string, role: UserRole } };

export type SetUserActiveMutationVariables = Exact<{
  userId: Scalars['String']['input'];
  isActive: Scalars['Boolean']['input'];
}>;


export type SetUserActiveMutation = { __typename?: 'Mutation', setUserActive: { __typename?: 'User', id: string, isActive: boolean } };

export type CreateCanteenMutationVariables = Exact<{
  ownerId: Scalars['String']['input'];
  input: CanteenInput;
}>;


export type CreateCanteenMutation = { __typename?: 'Mutation', createCanteen: { __typename?: 'Canteen', id: number, name: string, slug: string } };

export type SetCanteenActiveMutationVariables = Exact<{
  canteenId: Scalars['Int']['input'];
  isActive: Scalars['Boolean']['input'];
}>;


export type SetCanteenActiveMutation = { __typename?: 'Mutation', setCanteenActive: { __typename?: 'Canteen', id: number, isActive: boolean } };

export type OrderStatusSubscriptionVariables = Exact<{
  orderId: Scalars['Int']['input'];
}>;


export type OrderStatusSubscription = { __typename?: 'Subscription', orderStatus: { __typename?: 'OrderStatusUpdate', orderId: number, reference: string, status: OrderStatus, paymentStatus: PaymentStatus, note?: string | null, at: string } };

export type CanteenOrderQueueSubscriptionVariables = Exact<{
  canteenId: Scalars['Int']['input'];
}>;


export type CanteenOrderQueueSubscription = { __typename?: 'Subscription', canteenOrderQueue: { __typename?: 'OrderStatusUpdate', orderId: number, reference: string, status: OrderStatus, paymentStatus: PaymentStatus, note?: string | null, at: string } };

export type NotificationStreamSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NotificationStreamSubscription = { __typename?: 'Subscription', notifications: { __typename?: 'NotificationEvent', id: number, type: string, title: string, body?: string | null, link?: string | null, createdAt: string } };

export const OrderFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"canteenId"}},{"kind":"Field","name":{"kind":"Name","value":"canteenName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledFor"}},{"kind":"Field","name":{"kind":"Name","value":"readyEstimateAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancellationReason"}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"canCancel"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"menuItemId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"customizations"}},{"kind":"Field","name":{"kind":"Name","value":"customizationSummary"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<OrderFieldsFragment, unknown>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"upiId"}},{"kind":"Field","name":{"kind":"Name","value":"isVegetarian"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const SignInDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SignIn"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signIn"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"csrfToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"upiId"}},{"kind":"Field","name":{"kind":"Name","value":"isVegetarian"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]}}]} as unknown as DocumentNode<SignInMutation, SignInMutationVariables>;
export const SignUpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SignUp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signUp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"csrfToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"upiId"}},{"kind":"Field","name":{"kind":"Name","value":"isVegetarian"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]}}]} as unknown as DocumentNode<SignUpMutation, SignUpMutationVariables>;
export const SignOutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SignOut"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signOut"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<SignOutMutation, SignOutMutationVariables>;
export const InitiateCasLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InitiateCasLogin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"initiateCasLogin"}}]}}]} as unknown as DocumentNode<InitiateCasLoginMutation, InitiateCasLoginMutationVariables>;
export const VerifyCasTicketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyCasTicket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ticket"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyCasTicket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ticket"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ticket"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"csrfToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"upiId"}},{"kind":"Field","name":{"kind":"Name","value":"isVegetarian"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]}}]} as unknown as DocumentNode<VerifyCasTicketMutation, VerifyCasTicketMutationVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"upiId"}},{"kind":"Field","name":{"kind":"Name","value":"isVegetarian"}}]}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const ChangePasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currentPassword"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"newPassword"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"currentPassword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currentPassword"}}},{"kind":"Argument","name":{"kind":"Name","value":"newPassword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"newPassword"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const DeleteMyAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMyAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMyAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<DeleteMyAccountMutation, DeleteMyAccountMutationVariables>;
export const CanteensDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Canteens"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"openOnly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canteens"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"openOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"openOnly"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"bannerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"isOpenNow"}},{"kind":"Field","name":{"kind":"Name","value":"isAcceptingOrders"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"averagePreparationMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"menuItemCount"}},{"kind":"Field","name":{"kind":"Name","value":"isFavorite"}}]}}]}}]} as unknown as DocumentNode<CanteensQuery, CanteensQueryVariables>;
export const CanteenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Canteen"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canteen"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"bannerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"opensAt"}},{"kind":"Field","name":{"kind":"Name","value":"closesAt"}},{"kind":"Field","name":{"kind":"Name","value":"isOpenNow"}},{"kind":"Field","name":{"kind":"Name","value":"isAcceptingOrders"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"averagePreparationMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"menuItemCount"}},{"kind":"Field","name":{"kind":"Name","value":"isFavorite"}}]}}]}}]} as unknown as DocumentNode<CanteenQuery, CanteenQueryVariables>;
export const MenuItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MenuItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"vegetarianOnly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"featuredOnly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"menuItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}},{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"vegetarianOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"vegetarianOnly"}}},{"kind":"Argument","name":{"kind":"Name","value":"featuredOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"featuredOnly"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"canteenId"}},{"kind":"Field","name":{"kind":"Name","value":"canteenName"}},{"kind":"Field","name":{"kind":"Name","value":"isVegetarian"}},{"kind":"Field","name":{"kind":"Name","value":"isVegan"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isFeatured"}},{"kind":"Field","name":{"kind":"Name","value":"isOrderable"}},{"kind":"Field","name":{"kind":"Name","value":"stockCount"}},{"kind":"Field","name":{"kind":"Name","value":"preparationMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customizationGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"selection"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"priceDelta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<MenuItemsQuery, MenuItemsQueryVariables>;
export const MenuCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MenuCategories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"menuCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}}]}]}}]} as unknown as DocumentNode<MenuCategoriesQuery, MenuCategoriesQueryVariables>;
export const ReviewsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Reviews"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"menuItemId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}},{"kind":"Argument","name":{"kind":"Name","value":"menuItemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"menuItemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<ReviewsQuery, ReviewsQueryVariables>;
export const LivePromotionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LivePromotions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"livePromotions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"minOrder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"maxDiscount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}}]}}]} as unknown as DocumentNode<LivePromotionsQuery, LivePromotionsQueryVariables>;
export const CartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Cart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"canteenId"}},{"kind":"Field","name":{"kind":"Name","value":"canteenName"}},{"kind":"Field","name":{"kind":"Name","value":"itemCount"}},{"kind":"Field","name":{"kind":"Name","value":"blockingIssues"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledFor"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"menuItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"customizations"}},{"kind":"Field","name":{"kind":"Name","value":"customizationSummary"}},{"kind":"Field","name":{"kind":"Name","value":"isOrderable"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"menuItem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isVegetarian"}},{"kind":"Field","name":{"kind":"Name","value":"stockCount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CartQuery, CartQueryVariables>;
export const AddToCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddToCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddToCartInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addToCart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"canteenId"}},{"kind":"Field","name":{"kind":"Name","value":"canteenName"}},{"kind":"Field","name":{"kind":"Name","value":"itemCount"}},{"kind":"Field","name":{"kind":"Name","value":"blockingIssues"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"menuItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"customizations"}},{"kind":"Field","name":{"kind":"Name","value":"customizationSummary"}},{"kind":"Field","name":{"kind":"Name","value":"isOrderable"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"menuItem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isVegetarian"}},{"kind":"Field","name":{"kind":"Name","value":"stockCount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AddToCartMutation, AddToCartMutationVariables>;
export const UpdateCartItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCartItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cartItemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"quantity"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCartItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cartItemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cartItemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"quantity"},"value":{"kind":"Variable","name":{"kind":"Name","value":"quantity"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"itemCount"}},{"kind":"Field","name":{"kind":"Name","value":"blockingIssues"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"isOrderable"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateCartItemMutation, UpdateCartItemMutationVariables>;
export const RemoveFromCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveFromCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cartItemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeFromCart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cartItemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cartItemId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"canteenId"}},{"kind":"Field","name":{"kind":"Name","value":"itemCount"}},{"kind":"Field","name":{"kind":"Name","value":"blockingIssues"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<RemoveFromCartMutation, RemoveFromCartMutationVariables>;
export const ClearCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClearCart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clearCart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"canteenId"}},{"kind":"Field","name":{"kind":"Name","value":"itemCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<ClearCartMutation, ClearCartMutationVariables>;
export const SetCartPickupTimeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetCartPickupTime"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scheduledFor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setCartPickupTime"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scheduledFor"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scheduledFor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledFor"}}]}}]}}]} as unknown as DocumentNode<SetCartPickupTimeMutation, SetCartPickupTimeMutationVariables>;
export const PromotionPreviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PromotionPreview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"promotionPreview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}}]}}]} as unknown as DocumentNode<PromotionPreviewQuery, PromotionPreviewQueryVariables>;
export const MyOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"activeOnly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"activeOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"activeOnly"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"canteenId"}},{"kind":"Field","name":{"kind":"Name","value":"canteenName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledFor"}},{"kind":"Field","name":{"kind":"Name","value":"readyEstimateAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancellationReason"}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"canCancel"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"menuItemId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"customizations"}},{"kind":"Field","name":{"kind":"Name","value":"customizationSummary"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<MyOrdersQuery, MyOrdersQueryVariables>;
export const OrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Order"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"canteenId"}},{"kind":"Field","name":{"kind":"Name","value":"canteenName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledFor"}},{"kind":"Field","name":{"kind":"Name","value":"readyEstimateAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancellationReason"}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"canCancel"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"menuItemId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"customizations"}},{"kind":"Field","name":{"kind":"Name","value":"customizationSummary"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<OrderQuery, OrderQueryVariables>;
export const PlaceOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PlaceOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PlaceOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"placeOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"canteenId"}},{"kind":"Field","name":{"kind":"Name","value":"canteenName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledFor"}},{"kind":"Field","name":{"kind":"Name","value":"readyEstimateAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancellationReason"}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"canCancel"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"menuItemId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"customizations"}},{"kind":"Field","name":{"kind":"Name","value":"customizationSummary"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<PlaceOrderMutation, PlaceOrderMutationVariables>;
export const CancelOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"canteenId"}},{"kind":"Field","name":{"kind":"Name","value":"canteenName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledFor"}},{"kind":"Field","name":{"kind":"Name","value":"readyEstimateAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancellationReason"}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"canCancel"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"menuItemId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"customizations"}},{"kind":"Field","name":{"kind":"Name","value":"customizationSummary"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<CancelOrderMutation, CancelOrderMutationVariables>;
export const UpdateOrderStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOrderStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderStatus"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"note"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrderStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"note"},"value":{"kind":"Variable","name":{"kind":"Name","value":"note"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"canteenId"}},{"kind":"Field","name":{"kind":"Name","value":"canteenName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledFor"}},{"kind":"Field","name":{"kind":"Name","value":"readyEstimateAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancellationReason"}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"canCancel"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"menuItemId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"customizations"}},{"kind":"Field","name":{"kind":"Name","value":"customizationSummary"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<UpdateOrderStatusMutation, UpdateOrderStatusMutationVariables>;
export const InitiatePaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InitiatePayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idempotencyKey"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"initiatePayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}},{"kind":"Argument","name":{"kind":"Name","value":"idempotencyKey"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idempotencyKey"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paymentId"}},{"kind":"Field","name":{"kind":"Name","value":"gatewayOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"keyId"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"orderReference"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"customerEmail"}},{"kind":"Field","name":{"kind":"Name","value":"customerPhone"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}}]}}]} as unknown as DocumentNode<InitiatePaymentMutation, InitiatePaymentMutationVariables>;
export const VerifyPaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyPayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gatewayOrderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gatewayPaymentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"signature"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"gatewayOrderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gatewayOrderId"}}},{"kind":"Argument","name":{"kind":"Name","value":"gatewayPaymentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gatewayPaymentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"signature"},"value":{"kind":"Variable","name":{"kind":"Name","value":"signature"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"canteenId"}},{"kind":"Field","name":{"kind":"Name","value":"canteenName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledFor"}},{"kind":"Field","name":{"kind":"Name","value":"readyEstimateAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancellationReason"}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"canCancel"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"menuItemId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"customizations"}},{"kind":"Field","name":{"kind":"Name","value":"customizationSummary"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<VerifyPaymentMutation, VerifyPaymentMutationVariables>;
export const WalletDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Wallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isFrozen"}},{"kind":"Field","name":{"kind":"Name","value":"balance"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"transactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"balanceAfter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}}]}}]}}]} as unknown as DocumentNode<WalletQuery, WalletQueryVariables>;
export const CreateWalletTopUpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateWalletTopUp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amountPaise"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWalletTopUp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"amountPaise"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amountPaise"}}}]}]}}]} as unknown as DocumentNode<CreateWalletTopUpMutation, CreateWalletTopUpMutationVariables>;
export const NotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Notifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"unreadOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"link"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unreadNotificationCount"}}]}}]} as unknown as DocumentNode<NotificationsQuery, NotificationsQueryVariables>;
export const MarkNotificationReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkNotificationRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"notificationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markNotificationRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"notificationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"notificationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}}]}}]}}]} as unknown as DocumentNode<MarkNotificationReadMutation, MarkNotificationReadMutationVariables>;
export const MarkAllNotificationsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllNotificationsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllNotificationsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<MarkAllNotificationsReadMutation, MarkAllNotificationsReadMutationVariables>;
export const ComplaintsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Complaints"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ComplaintStatus"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mineOnly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"complaints"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"mineOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mineOnly"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"canteenId"}},{"kind":"Field","name":{"kind":"Name","value":"canteenName"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentUrls"}},{"kind":"Field","name":{"kind":"Name","value":"responseBody"}},{"kind":"Field","name":{"kind":"Name","value":"respondedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<ComplaintsQuery, ComplaintsQueryVariables>;
export const CreateComplaintDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateComplaint"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ComplaintInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createComplaint"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateComplaintMutation, CreateComplaintMutationVariables>;
export const RespondToComplaintDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RespondToComplaint"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"complaintId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"responseBody"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ComplaintStatus"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"respondToComplaint"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"complaintId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"complaintId"}}},{"kind":"Argument","name":{"kind":"Name","value":"responseBody"},"value":{"kind":"Variable","name":{"kind":"Name","value":"responseBody"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"responseBody"}},{"kind":"Field","name":{"kind":"Name","value":"respondedAt"}}]}}]}}]} as unknown as DocumentNode<RespondToComplaintMutation, RespondToComplaintMutationVariables>;
export const CreateReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateReviewMutation, CreateReviewMutationVariables>;
export const FavoriteCanteensDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FavoriteCanteens"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"favoriteCanteens"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"bannerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"isOpenNow"}},{"kind":"Field","name":{"kind":"Name","value":"isFavorite"}},{"kind":"Field","name":{"kind":"Name","value":"menuItemCount"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}}]}}]}}]} as unknown as DocumentNode<FavoriteCanteensQuery, FavoriteCanteensQueryVariables>;
export const SetFavoriteCanteenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetFavoriteCanteen"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"favorite"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setFavoriteCanteen"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}},{"kind":"Argument","name":{"kind":"Name","value":"favorite"},"value":{"kind":"Variable","name":{"kind":"Name","value":"favorite"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<SetFavoriteCanteenMutation, SetFavoriteCanteenMutationVariables>;
export const MyBulkOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyBulkOrders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myBulkOrders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"canteenId"}},{"kind":"Field","name":{"kind":"Name","value":"canteenName"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"headCount"}},{"kind":"Field","name":{"kind":"Name","value":"requiredAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"quoteNote"}},{"kind":"Field","name":{"kind":"Name","value":"quotedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"quotedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}}]}}]} as unknown as DocumentNode<MyBulkOrdersQuery, MyBulkOrdersQueryVariables>;
export const CreateBulkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBulkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BulkOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBulkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateBulkOrderMutation, CreateBulkOrderMutationVariables>;
export const SetBulkOrderStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetBulkOrderStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"bulkOrderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BulkOrderStatus"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setBulkOrderStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"bulkOrderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"bulkOrderId"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<SetBulkOrderStatusMutation, SetBulkOrderStatusMutationVariables>;
export const ManagedCanteensDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ManagedCanteens"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"managedCanteens"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"bannerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isOpenNow"}},{"kind":"Field","name":{"kind":"Name","value":"isAcceptingOrders"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"menuItemCount"}}]}}]}}]} as unknown as DocumentNode<ManagedCanteensQuery, ManagedCanteensQueryVariables>;
export const CanteenOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CanteenOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"statuses"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderStatus"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canteenOrders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}},{"kind":"Argument","name":{"kind":"Name","value":"statuses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"statuses"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"canteenId"}},{"kind":"Field","name":{"kind":"Name","value":"canteenName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledFor"}},{"kind":"Field","name":{"kind":"Name","value":"readyEstimateAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancellationReason"}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"canCancel"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"menuItemId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"customizations"}},{"kind":"Field","name":{"kind":"Name","value":"customizationSummary"}},{"kind":"Field","name":{"kind":"Name","value":"lineTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<CanteenOrdersQuery, CanteenOrdersQueryVariables>;
export const CanteenMenuDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CanteenMenu"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canteenMenu"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"canteenId"}},{"kind":"Field","name":{"kind":"Name","value":"isVegetarian"}},{"kind":"Field","name":{"kind":"Name","value":"isVegan"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isFeatured"}},{"kind":"Field","name":{"kind":"Name","value":"isOrderable"}},{"kind":"Field","name":{"kind":"Name","value":"stockCount"}},{"kind":"Field","name":{"kind":"Name","value":"preparationMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customizationGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"selection"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"priceDelta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<CanteenMenuQuery, CanteenMenuQueryVariables>;
export const CanteenStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CanteenStats"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canteenStats"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canteenId"}},{"kind":"Field","name":{"kind":"Name","value":"canteenName"}},{"kind":"Field","name":{"kind":"Name","value":"ordersToday"}},{"kind":"Field","name":{"kind":"Name","value":"ordersTotal"}},{"kind":"Field","name":{"kind":"Name","value":"pendingOrders"}},{"kind":"Field","name":{"kind":"Name","value":"openComplaints"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"revenueToday"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"revenueTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"averageOrderValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}}]}}]} as unknown as DocumentNode<CanteenStatsQuery, CanteenStatsQueryVariables>;
export const RevenueTimeseriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RevenueTimeseries"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"days"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revenueTimeseries"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}},{"kind":"Argument","name":{"kind":"Name","value":"days"},"value":{"kind":"Variable","name":{"kind":"Name","value":"days"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"orders"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"rupees"}}]}}]}}]}}]} as unknown as DocumentNode<RevenueTimeseriesQuery, RevenueTimeseriesQueryVariables>;
export const TopItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TopItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"topItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"menuItemId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}},{"kind":"Field","name":{"kind":"Name","value":"rupees"}}]}}]}}]}}]} as unknown as DocumentNode<TopItemsQuery, TopItemsQueryVariables>;
export const CreateMenuItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMenuItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MenuItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMenuItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}}]}}]} as unknown as DocumentNode<CreateMenuItemMutation, CreateMenuItemMutationVariables>;
export const UpdateMenuItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMenuItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MenuItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMenuItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"isVegetarian"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isFeatured"}},{"kind":"Field","name":{"kind":"Name","value":"stockCount"}},{"kind":"Field","name":{"kind":"Name","value":"preparationMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateMenuItemMutation, UpdateMenuItemMutationVariables>;
export const DeleteMenuItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMenuItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMenuItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<DeleteMenuItemMutation, DeleteMenuItemMutationVariables>;
export const SetMenuItemStockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetMenuItemStock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"stockCount"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setMenuItemStock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"stockCount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"stockCount"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"stockCount"}},{"kind":"Field","name":{"kind":"Name","value":"isOrderable"}}]}}]}}]} as unknown as DocumentNode<SetMenuItemStockMutation, SetMenuItemStockMutationVariables>;
export const UpdateCanteenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCanteen"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CanteenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCanteen"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"bannerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"opensAt"}},{"kind":"Field","name":{"kind":"Name","value":"closesAt"}},{"kind":"Field","name":{"kind":"Name","value":"isAcceptingOrders"}},{"kind":"Field","name":{"kind":"Name","value":"isOpenNow"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"averagePreparationMinutes"}}]}}]}}]} as unknown as DocumentNode<UpdateCanteenMutation, UpdateCanteenMutationVariables>;
export const CanteenPromotionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CanteenPromotions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canteenPromotions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isLiveNow"}},{"kind":"Field","name":{"kind":"Name","value":"redemptionCount"}},{"kind":"Field","name":{"kind":"Name","value":"maxRedemptions"}},{"kind":"Field","name":{"kind":"Name","value":"maxRedemptionsPerUser"}},{"kind":"Field","name":{"kind":"Name","value":"minOrder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"maxDiscount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}}]}}]} as unknown as DocumentNode<CanteenPromotionsQuery, CanteenPromotionsQueryVariables>;
export const CreatePromotionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePromotion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PromotionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPromotion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isLiveNow"}}]}}]}}]} as unknown as DocumentNode<CreatePromotionMutation, CreatePromotionMutationVariables>;
export const SetPromotionActiveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetPromotionActive"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"promotionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setPromotionActive"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"promotionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"promotionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"isActive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isLiveNow"}}]}}]}}]} as unknown as DocumentNode<SetPromotionActiveMutation, SetPromotionActiveMutationVariables>;
export const CanteenBulkOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CanteenBulkOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canteenBulkOrders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"headCount"}},{"kind":"Field","name":{"kind":"Name","value":"requiredAt"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"requestedItems"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"quoteNote"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"quotedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<CanteenBulkOrdersQuery, CanteenBulkOrdersQueryVariables>;
export const QuoteBulkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"QuoteBulkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"bulkOrderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"quotedTotalPaise"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"quoteNote"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quoteBulkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"bulkOrderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"bulkOrderId"}}},{"kind":"Argument","name":{"kind":"Name","value":"quotedTotalPaise"},"value":{"kind":"Variable","name":{"kind":"Name","value":"quotedTotalPaise"}}},{"kind":"Argument","name":{"kind":"Name","value":"quoteNote"},"value":{"kind":"Variable","name":{"kind":"Name","value":"quoteNote"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"quotedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}}]}}]} as unknown as DocumentNode<QuoteBulkOrderMutation, QuoteBulkOrderMutationVariables>;
export const CanteenStaffDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CanteenStaff"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canteenStaff"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<CanteenStaffQuery, CanteenStaffQueryVariables>;
export const AssignStaffDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignStaff"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignStaff"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<AssignStaffMutation, AssignStaffMutationVariables>;
export const RemoveStaffDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveStaff"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeStaff"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<RemoveStaffMutation, RemoveStaffMutationVariables>;
export const PlatformStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PlatformStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"platformStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalUsers"}},{"kind":"Field","name":{"kind":"Name","value":"totalVendors"}},{"kind":"Field","name":{"kind":"Name","value":"totalCanteens"}},{"kind":"Field","name":{"kind":"Name","value":"totalMenuItems"}},{"kind":"Field","name":{"kind":"Name","value":"ordersToday"}},{"kind":"Field","name":{"kind":"Name","value":"openComplaints"}},{"kind":"Field","name":{"kind":"Name","value":"activeOrders"}},{"kind":"Field","name":{"kind":"Name","value":"revenueToday"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"revenueTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paise"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}}]}}]}}]}}]} as unknown as DocumentNode<PlatformStatsQuery, PlatformStatsQueryVariables>;
export const UsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Users"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UserRole"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<UsersQuery, UsersQueryVariables>;
export const CreateStaffAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateStaffAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserRole"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStaffAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<CreateStaffAccountMutation, CreateStaffAccountMutationVariables>;
export const SetUserRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetUserRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserRole"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setUserRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<SetUserRoleMutation, SetUserRoleMutationVariables>;
export const SetUserActiveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetUserActive"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setUserActive"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"isActive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<SetUserActiveMutation, SetUserActiveMutationVariables>;
export const CreateCanteenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCanteen"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ownerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CanteenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCanteen"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ownerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ownerId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<CreateCanteenMutation, CreateCanteenMutationVariables>;
export const SetCanteenActiveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetCanteenActive"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setCanteenActive"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}},{"kind":"Argument","name":{"kind":"Name","value":"isActive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<SetCanteenActiveMutation, SetCanteenActiveMutationVariables>;
export const OrderStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OrderStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"at"}}]}}]}}]} as unknown as DocumentNode<OrderStatusSubscription, OrderStatusSubscriptionVariables>;
export const CanteenOrderQueueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"CanteenOrderQueue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canteenOrderQueue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"canteenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"canteenId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"at"}}]}}]}}]} as unknown as DocumentNode<CanteenOrderQueueSubscription, CanteenOrderQueueSubscriptionVariables>;
export const NotificationStreamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"NotificationStream"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"link"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<NotificationStreamSubscription, NotificationStreamSubscriptionVariables>;