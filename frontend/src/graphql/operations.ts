/**
 * Every GraphQL operation the app sends.
 *
 * One operation name maps to exactly one document. The previous codebase had
 * `GetCurrentUser` defined twice with *different selection sets*, so a
 * network-only fetch of the short one evicted fields the long one had
 * populated, and `GetCartByUserId` existed as three separate documents under
 * one name.
 */
import { graphql } from "@/graphql/generated";

/* -------------------------------------------------------------- identity */
export const ME = graphql(`
  query Me {
    me {
      id
      name
      email
      role
      phone
      avatarUrl
      upiId
      isVegetarian
      isActive
    }
  }
`);

export const SIGN_IN = graphql(`
  mutation SignIn($email: String!, $password: String!) {
    signIn(input: { email: $email, password: $password }) {
      csrfToken
      user {
        id
        name
        email
        role
        phone
        avatarUrl
        upiId
        isVegetarian
        isActive
      }
    }
  }
`);

export const SIGN_UP = graphql(`
  mutation SignUp($name: String!, $email: String!, $password: String!) {
    signUp(input: { name: $name, email: $email, password: $password }) {
      csrfToken
      user {
        id
        name
        email
        role
        phone
        avatarUrl
        upiId
        isVegetarian
        isActive
      }
    }
  }
`);

export const SIGN_OUT = graphql(`
  mutation SignOut {
    signOut {
      success
      message
    }
  }
`);

export const INITIATE_CAS_LOGIN = graphql(`
  mutation InitiateCasLogin {
    initiateCasLogin
  }
`);

export const VERIFY_CAS_TICKET = graphql(`
  mutation VerifyCasTicket($ticket: String!) {
    verifyCasTicket(ticket: $ticket) {
      csrfToken
      user {
        id
        name
        email
        role
        phone
        avatarUrl
        upiId
        isVegetarian
        isActive
      }
    }
  }
`);

export const UPDATE_PROFILE = graphql(`
  mutation UpdateProfile($input: ProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      email
      phone
      avatarUrl
      upiId
      isVegetarian
    }
  }
`);

export const CHANGE_PASSWORD = graphql(`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
      success
      message
    }
  }
`);

export const DELETE_MY_ACCOUNT = graphql(`
  mutation DeleteMyAccount {
    deleteMyAccount {
      success
      message
    }
  }
`);

/* --------------------------------------------------------------- catalog */
export const CANTEENS = graphql(`
  query Canteens($search: String, $openOnly: Boolean, $limit: Int, $offset: Int) {
    canteens(search: $search, openOnly: $openOnly, limit: $limit, offset: $offset) {
      id
      name
      slug
      description
      location
      bannerUrl
      logoUrl
      rating
      ratingCount
      isOpenNow
      isAcceptingOrders
      tags
      averagePreparationMinutes
      menuItemCount
      isFavorite
    }
  }
`);

export const CANTEEN = graphql(`
  query Canteen($id: Int!) {
    canteen(id: $id) {
      id
      name
      slug
      description
      location
      bannerUrl
      logoUrl
      phone
      email
      rating
      ratingCount
      opensAt
      closesAt
      isOpenNow
      isAcceptingOrders
      tags
      averagePreparationMinutes
      menuItemCount
      isFavorite
    }
  }
`);

export const MENU_ITEMS = graphql(`
  query MenuItems(
    $canteenId: Int
    $category: String
    $search: String
    $vegetarianOnly: Boolean
    $featuredOnly: Boolean
    $limit: Int
    $offset: Int
  ) {
    menuItems(
      canteenId: $canteenId
      category: $category
      search: $search
      vegetarianOnly: $vegetarianOnly
      featuredOnly: $featuredOnly
      limit: $limit
      offset: $offset
    ) {
      id
      name
      description
      imageUrl
      category
      canteenId
      canteenName
      isVegetarian
      isVegan
      isAvailable
      isFeatured
      isOrderable
      stockCount
      preparationMinutes
      rating
      ratingCount
      tags
      price {
        paise
        formatted
      }
      customizationGroups {
        id
        label
        selection
        required
        options {
          id
          label
          isDefault
          priceDelta {
            paise
            formatted
          }
        }
      }
    }
  }
`);

export const MENU_CATEGORIES = graphql(`
  query MenuCategories($canteenId: Int) {
    menuCategories(canteenId: $canteenId)
  }
`);

export const REVIEWS = graphql(`
  query Reviews($canteenId: Int, $menuItemId: Int, $limit: Int) {
    reviews(canteenId: $canteenId, menuItemId: $menuItemId, limit: $limit) {
      id
      rating
      body
      createdAt
      author {
        id
        name
        avatarUrl
      }
    }
  }
`);

export const LIVE_PROMOTIONS = graphql(`
  query LivePromotions($canteenId: Int!) {
    livePromotions(canteenId: $canteenId) {
      id
      code
      title
      description
      type
      value
      minOrder {
        paise
        formatted
      }
      maxDiscount {
        paise
        formatted
      }
    }
  }
`);

/* ------------------------------------------------------------------ cart */
export const CART = graphql(`
  query Cart {
    cart {
      id
      canteenId
      canteenName
      itemCount
      blockingIssues
      scheduledFor
      subtotal {
        paise
        formatted
      }
      tax {
        paise
        formatted
      }
      total {
        paise
        formatted
      }
      items {
        id
        menuItemId
        quantity
        note
        customizations
        customizationSummary
        isOrderable
        unitPrice {
          paise
          formatted
        }
        lineTotal {
          paise
          formatted
        }
        menuItem {
          id
          name
          imageUrl
          isVegetarian
          stockCount
        }
      }
    }
  }
`);

export const ADD_TO_CART = graphql(`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      id
      canteenId
      canteenName
      itemCount
      blockingIssues
      subtotal {
        paise
        formatted
      }
      tax {
        paise
        formatted
      }
      total {
        paise
        formatted
      }
      items {
        id
        menuItemId
        quantity
        note
        customizations
        customizationSummary
        isOrderable
        unitPrice {
          paise
          formatted
        }
        lineTotal {
          paise
          formatted
        }
        menuItem {
          id
          name
          imageUrl
          isVegetarian
          stockCount
        }
      }
    }
  }
`);

export const UPDATE_CART_ITEM = graphql(`
  mutation UpdateCartItem($cartItemId: Int!, $quantity: Int!) {
    updateCartItem(cartItemId: $cartItemId, quantity: $quantity) {
      id
      itemCount
      blockingIssues
      subtotal {
        paise
        formatted
      }
      tax {
        paise
        formatted
      }
      total {
        paise
        formatted
      }
      items {
        id
        quantity
        isOrderable
        lineTotal {
          paise
          formatted
        }
      }
    }
  }
`);

export const REMOVE_FROM_CART = graphql(`
  mutation RemoveFromCart($cartItemId: Int!) {
    removeFromCart(cartItemId: $cartItemId) {
      id
      canteenId
      itemCount
      blockingIssues
      subtotal {
        paise
        formatted
      }
      tax {
        paise
        formatted
      }
      total {
        paise
        formatted
      }
      items {
        id
      }
    }
  }
`);

export const CLEAR_CART = graphql(`
  mutation ClearCart {
    clearCart {
      id
      canteenId
      itemCount
      items {
        id
      }
    }
  }
`);

export const SET_CART_PICKUP_TIME = graphql(`
  mutation SetCartPickupTime($scheduledFor: DateTime) {
    setCartPickupTime(scheduledFor: $scheduledFor) {
      id
      scheduledFor
    }
  }
`);

export const PROMOTION_PREVIEW = graphql(`
  query PromotionPreview($code: String!) {
    promotionPreview(code: $code) {
      valid
      message
      discount {
        paise
        formatted
      }
    }
  }
`);

/* ---------------------------------------------------------------- orders */
export const ORDER_FIELDS = graphql(`
  fragment OrderFields on Order {
    id
    reference
    canteenId
    canteenName
    status
    paymentStatus
    paymentMethod
    createdAt
    scheduledFor
    readyEstimateAt
    completedAt
    cancelledAt
    cancellationReason
    customerNote
    contactPhone
    canCancel
    subtotal {
      paise
      formatted
    }
    tax {
      paise
      formatted
    }
    discount {
      paise
      formatted
    }
    total {
      paise
      formatted
    }
    items {
      id
      menuItemId
      name
      imageUrl
      quantity
      note
      customizations
      customizationSummary
      lineTotal {
        paise
        formatted
      }
    }
    statusEvents {
      id
      status
      note
      createdAt
    }
    customer {
      id
      name
      avatarUrl
    }
  }
`);

export const MY_ORDERS = graphql(`
  query MyOrders($activeOnly: Boolean, $limit: Int, $offset: Int) {
    myOrders(activeOnly: $activeOnly, limit: $limit, offset: $offset) {
      ...OrderFields
    }
  }
`);

export const ORDER = graphql(`
  query Order($id: Int!) {
    order(id: $id) {
      ...OrderFields
    }
  }
`);

export const PLACE_ORDER = graphql(`
  mutation PlaceOrder($input: PlaceOrderInput!) {
    placeOrder(input: $input) {
      ...OrderFields
    }
  }
`);

export const CANCEL_ORDER = graphql(`
  mutation CancelOrder($orderId: Int!, $reason: String) {
    cancelOrder(orderId: $orderId, reason: $reason) {
      ...OrderFields
    }
  }
`);

export const UPDATE_ORDER_STATUS = graphql(`
  mutation UpdateOrderStatus($orderId: Int!, $status: OrderStatus!, $note: String) {
    updateOrderStatus(orderId: $orderId, status: $status, note: $note) {
      ...OrderFields
    }
  }
`);

/* -------------------------------------------------------------- payments */
export const INITIATE_PAYMENT = graphql(`
  mutation InitiatePayment($orderId: Int!, $idempotencyKey: String) {
    initiatePayment(orderId: $orderId, idempotencyKey: $idempotencyKey) {
      paymentId
      gatewayOrderId
      keyId
      currency
      orderReference
      customerName
      customerEmail
      customerPhone
      amount {
        paise
        formatted
      }
    }
  }
`);

export const VERIFY_PAYMENT = graphql(`
  mutation VerifyPayment(
    $gatewayOrderId: String!
    $gatewayPaymentId: String!
    $signature: String!
  ) {
    verifyPayment(
      gatewayOrderId: $gatewayOrderId
      gatewayPaymentId: $gatewayPaymentId
      signature: $signature
    ) {
      ...OrderFields
    }
  }
`);

export const WALLET = graphql(`
  query Wallet {
    wallet {
      id
      isFrozen
      balance {
        paise
        formatted
      }
      transactions {
        id
        description
        createdAt
        orderId
        amount {
          paise
          formatted
        }
        balanceAfter {
          paise
          formatted
        }
      }
    }
  }
`);

export const CREATE_WALLET_TOP_UP = graphql(`
  mutation CreateWalletTopUp($amountPaise: Int!) {
    createWalletTopUp(amountPaise: $amountPaise)
  }
`);

/* --------------------------------------------------------- notifications */
export const NOTIFICATIONS = graphql(`
  query Notifications($unreadOnly: Boolean, $limit: Int) {
    notifications(unreadOnly: $unreadOnly, limit: $limit) {
      id
      type
      title
      body
      link
      isRead
      createdAt
    }
    unreadNotificationCount
  }
`);

export const MARK_NOTIFICATION_READ = graphql(`
  mutation MarkNotificationRead($notificationId: Int!) {
    markNotificationRead(notificationId: $notificationId) {
      id
      isRead
    }
  }
`);

export const MARK_ALL_NOTIFICATIONS_READ = graphql(`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead {
      success
      message
    }
  }
`);

/* ------------------------------------------------------------ engagement */
export const COMPLAINTS = graphql(`
  query Complaints($canteenId: Int, $status: ComplaintStatus, $mineOnly: Boolean, $limit: Int) {
    complaints(canteenId: $canteenId, status: $status, mineOnly: $mineOnly, limit: $limit) {
      id
      orderId
      canteenId
      canteenName
      subject
      body
      category
      status
      attachmentUrls
      responseBody
      respondedAt
      createdAt
      author {
        id
        name
        avatarUrl
      }
    }
  }
`);

export const CREATE_COMPLAINT = graphql(`
  mutation CreateComplaint($input: ComplaintInput!) {
    createComplaint(input: $input) {
      id
      subject
      status
      createdAt
    }
  }
`);

export const RESPOND_TO_COMPLAINT = graphql(`
  mutation RespondToComplaint(
    $complaintId: Int!
    $responseBody: String!
    $status: ComplaintStatus!
  ) {
    respondToComplaint(
      complaintId: $complaintId
      responseBody: $responseBody
      status: $status
    ) {
      id
      status
      responseBody
      respondedAt
    }
  }
`);

export const CREATE_REVIEW = graphql(`
  mutation CreateReview($input: ReviewInput!) {
    createReview(input: $input) {
      id
      rating
      body
      createdAt
    }
  }
`);

export const FAVORITE_CANTEENS = graphql(`
  query FavoriteCanteens {
    favoriteCanteens {
      id
      name
      location
      bannerUrl
      rating
      isOpenNow
      isFavorite
      menuItemCount
      tags
    }
  }
`);

export const SET_FAVORITE_CANTEEN = graphql(`
  mutation SetFavoriteCanteen($canteenId: Int!, $favorite: Boolean!) {
    setFavoriteCanteen(canteenId: $canteenId, favorite: $favorite) {
      success
    }
  }
`);

/* ----------------------------------------------------------- bulk orders */
export const MY_BULK_ORDERS = graphql(`
  query MyBulkOrders {
    myBulkOrders {
      id
      reference
      canteenId
      canteenName
      title
      notes
      headCount
      requiredAt
      status
      quoteNote
      quotedAt
      createdAt
      quotedTotal {
        paise
        formatted
      }
    }
  }
`);

export const CREATE_BULK_ORDER = graphql(`
  mutation CreateBulkOrder($input: BulkOrderInput!) {
    createBulkOrder(input: $input) {
      id
      reference
      status
    }
  }
`);

export const SET_BULK_ORDER_STATUS = graphql(`
  mutation SetBulkOrderStatus($bulkOrderId: Int!, $status: BulkOrderStatus!) {
    setBulkOrderStatus(bulkOrderId: $bulkOrderId, status: $status) {
      id
      status
    }
  }
`);

/* ---------------------------------------------------------------- vendor */
export const MANAGED_CANTEENS = graphql(`
  query ManagedCanteens {
    managedCanteens {
      id
      name
      slug
      location
      bannerUrl
      logoUrl
      isOpenNow
      isAcceptingOrders
      rating
      menuItemCount
    }
  }
`);

export const CANTEEN_ORDERS = graphql(`
  query CanteenOrders($canteenId: Int!, $statuses: [OrderStatus!], $limit: Int) {
    canteenOrders(canteenId: $canteenId, statuses: $statuses, limit: $limit) {
      ...OrderFields
    }
  }
`);

export const CANTEEN_MENU = graphql(`
  query CanteenMenu($canteenId: Int!) {
    canteenMenu(canteenId: $canteenId) {
      id
      name
      description
      imageUrl
      category
      canteenId
      isVegetarian
      isVegan
      isAvailable
      isFeatured
      isOrderable
      stockCount
      preparationMinutes
      rating
      tags
      price {
        paise
        formatted
      }
      customizationGroups {
        id
        label
        selection
        required
        options {
          id
          label
          isDefault
          priceDelta {
            paise
          }
        }
      }
    }
  }
`);

export const CANTEEN_STATS = graphql(`
  query CanteenStats($canteenId: Int!) {
    canteenStats(canteenId: $canteenId) {
      canteenId
      canteenName
      ordersToday
      ordersTotal
      pendingOrders
      openComplaints
      rating
      revenueToday {
        paise
        formatted
      }
      revenueTotal {
        paise
        formatted
      }
      averageOrderValue {
        paise
        formatted
      }
    }
  }
`);

export const REVENUE_TIMESERIES = graphql(`
  query RevenueTimeseries($canteenId: Int, $days: Int) {
    revenueTimeseries(canteenId: $canteenId, days: $days) {
      date
      orders
      revenue {
        paise
        rupees
      }
    }
  }
`);

export const TOP_ITEMS = graphql(`
  query TopItems($canteenId: Int, $limit: Int) {
    topItems(canteenId: $canteenId, limit: $limit) {
      menuItemId
      name
      quantity
      revenue {
        paise
        formatted
        rupees
      }
    }
  }
`);

export const CREATE_MENU_ITEM = graphql(`
  mutation CreateMenuItem($canteenId: Int!, $input: MenuItemInput!) {
    createMenuItem(canteenId: $canteenId, input: $input) {
      id
      name
      isAvailable
      price {
        paise
        formatted
      }
    }
  }
`);

export const UPDATE_MENU_ITEM = graphql(`
  mutation UpdateMenuItem($itemId: Int!, $input: MenuItemInput!) {
    updateMenuItem(itemId: $itemId, input: $input) {
      id
      name
      description
      imageUrl
      category
      isVegetarian
      isAvailable
      isFeatured
      stockCount
      preparationMinutes
      price {
        paise
        formatted
      }
    }
  }
`);

export const DELETE_MENU_ITEM = graphql(`
  mutation DeleteMenuItem($itemId: Int!) {
    deleteMenuItem(itemId: $itemId) {
      success
      message
    }
  }
`);

export const SET_MENU_ITEM_STOCK = graphql(`
  mutation SetMenuItemStock($itemId: Int!, $stockCount: Int) {
    setMenuItemStock(itemId: $itemId, stockCount: $stockCount) {
      id
      stockCount
      isOrderable
    }
  }
`);

export const UPDATE_CANTEEN = graphql(`
  mutation UpdateCanteen($canteenId: Int!, $input: CanteenInput!) {
    updateCanteen(canteenId: $canteenId, input: $input) {
      id
      name
      description
      location
      phone
      email
      bannerUrl
      logoUrl
      opensAt
      closesAt
      isAcceptingOrders
      isOpenNow
      tags
      averagePreparationMinutes
    }
  }
`);

export const CANTEEN_PROMOTIONS = graphql(`
  query CanteenPromotions($canteenId: Int!) {
    canteenPromotions(canteenId: $canteenId) {
      id
      code
      title
      description
      type
      value
      startsAt
      endsAt
      isActive
      isLiveNow
      redemptionCount
      maxRedemptions
      maxRedemptionsPerUser
      minOrder {
        paise
        formatted
      }
      maxDiscount {
        paise
        formatted
      }
    }
  }
`);

export const CREATE_PROMOTION = graphql(`
  mutation CreatePromotion($canteenId: Int!, $input: PromotionInput!) {
    createPromotion(canteenId: $canteenId, input: $input) {
      id
      code
      title
      isActive
      isLiveNow
    }
  }
`);

export const SET_PROMOTION_ACTIVE = graphql(`
  mutation SetPromotionActive($promotionId: Int!, $isActive: Boolean!) {
    setPromotionActive(promotionId: $promotionId, isActive: $isActive) {
      id
      isActive
      isLiveNow
    }
  }
`);

export const CANTEEN_BULK_ORDERS = graphql(`
  query CanteenBulkOrders($canteenId: Int!) {
    canteenBulkOrders(canteenId: $canteenId) {
      id
      reference
      title
      notes
      headCount
      requiredAt
      contactPhone
      requestedItems
      status
      quoteNote
      createdAt
      quotedTotal {
        paise
        formatted
      }
      requester {
        id
        name
        avatarUrl
      }
    }
  }
`);

export const QUOTE_BULK_ORDER = graphql(`
  mutation QuoteBulkOrder($bulkOrderId: Int!, $quotedTotalPaise: Int!, $quoteNote: String) {
    quoteBulkOrder(
      bulkOrderId: $bulkOrderId
      quotedTotalPaise: $quotedTotalPaise
      quoteNote: $quoteNote
    ) {
      id
      status
      quotedTotal {
        paise
        formatted
      }
    }
  }
`);

export const CANTEEN_STAFF = graphql(`
  query CanteenStaff($canteenId: Int!) {
    canteenStaff(canteenId: $canteenId) {
      id
      name
      email
      role
      avatarUrl
    }
  }
`);

export const ASSIGN_STAFF = graphql(`
  mutation AssignStaff($canteenId: Int!, $userIds: [String!]!) {
    assignStaff(canteenId: $canteenId, userIds: $userIds) {
      id
      name
      email
      role
    }
  }
`);

export const REMOVE_STAFF = graphql(`
  mutation RemoveStaff($canteenId: Int!, $userIds: [String!]!) {
    removeStaff(canteenId: $canteenId, userIds: $userIds) {
      id
      name
      email
      role
    }
  }
`);

/* ----------------------------------------------------------------- admin */
export const PLATFORM_STATS = graphql(`
  query PlatformStats {
    platformStats {
      totalUsers
      totalVendors
      totalCanteens
      totalMenuItems
      ordersToday
      openComplaints
      activeOrders
      revenueToday {
        paise
        formatted
      }
      revenueTotal {
        paise
        formatted
      }
    }
  }
`);

export const USERS = graphql(`
  query Users($role: UserRole, $search: String, $limit: Int, $offset: Int) {
    users(role: $role, search: $search, limit: $limit, offset: $offset) {
      id
      name
      email
      role
      phone
      avatarUrl
      isActive
      createdAt
    }
  }
`);

export const CREATE_STAFF_ACCOUNT = graphql(`
  mutation CreateStaffAccount(
    $name: String!
    $email: String!
    $password: String!
    $role: UserRole!
  ) {
    createStaffAccount(name: $name, email: $email, password: $password, role: $role) {
      id
      name
      email
      role
    }
  }
`);

export const SET_USER_ROLE = graphql(`
  mutation SetUserRole($userId: String!, $role: UserRole!) {
    setUserRole(userId: $userId, role: $role) {
      id
      role
    }
  }
`);

export const SET_USER_ACTIVE = graphql(`
  mutation SetUserActive($userId: String!, $isActive: Boolean!) {
    setUserActive(userId: $userId, isActive: $isActive) {
      id
      isActive
    }
  }
`);

export const CREATE_CANTEEN = graphql(`
  mutation CreateCanteen($ownerId: String!, $input: CanteenInput!) {
    createCanteen(ownerId: $ownerId, input: $input) {
      id
      name
      slug
    }
  }
`);

export const SET_CANTEEN_ACTIVE = graphql(`
  mutation SetCanteenActive($canteenId: Int!, $isActive: Boolean!) {
    setCanteenActive(canteenId: $canteenId, isActive: $isActive) {
      id
      isActive
    }
  }
`);

/* --------------------------------------------------------- subscriptions */
export const ORDER_STATUS_SUBSCRIPTION = graphql(`
  subscription OrderStatus($orderId: Int!) {
    orderStatus(orderId: $orderId) {
      orderId
      reference
      status
      paymentStatus
      note
      at
    }
  }
`);

export const CANTEEN_QUEUE_SUBSCRIPTION = graphql(`
  subscription CanteenOrderQueue($canteenId: Int!) {
    canteenOrderQueue(canteenId: $canteenId) {
      orderId
      reference
      status
      paymentStatus
      note
      at
    }
  }
`);

export const NOTIFICATIONS_SUBSCRIPTION = graphql(`
  subscription NotificationStream {
    notifications {
      id
      type
      title
      body
      link
      createdAt
    }
  }
`);
