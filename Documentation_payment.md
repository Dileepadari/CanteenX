# Documentation on Payment Service
## 1. Overview

The Smart Canteen payment system implements a comprehensive payment processing architecture that supports multiple payment methods while ensuring security, reliability, and scalability. The system facilitates seamless transactions between users, canteens, and payment processors.

## 2. Architecture

### 2.1 High-Level Architecture

The payment system follows a layered architecture:

- **Presentation Layer**: Frontend components for payment options and checkout
- **Service Layer**: Backend services coordinating payment operations
- **Adapter Layer**: Payment gateway integrations (Razorpay, Wallet)
- **Data Layer**: Repositories for persistent storage

### 2.2 Technology Stack

- **Frontend**: React, TypeScript, Zustand (state management)
- **Backend**: Python FastAPI, SQLAlchemy ORM
- **Payment Gateways**: Razorpay for UPI/online payments
- **Additional Features**: In-app wallet system

## 3. Frontend Implementation

### 3.1 Core Components

- **PaymentOptions Component**: Central component handling payment method selection and processing
- **RazorpayCheckout Component**: Specialized component for Razorpay integration
- **PaymentService**: Service that communicates with backend payment APIs

### 3.2 Payment Flow

1. **Checkout Initiation**:
   - Order details are compiled from cart items
   - Total amount is calculated
   - User arrives at checkout page

2. **Payment Method Selection**:
   - User selects between UPI and Cash payment options
   - Each payment method is presented with relevant UI elements

3. **UPI Payment Processing**:
   - System loads Razorpay SDK dynamically
   - Fetches merchant details for selected canteen
   - Creates a payment order through backend API
   - Opens Razorpay checkout modal
   - Handles payment completion or failure

4. **Cash Payment Processing**:
   - Implements a simplified flow for cash on delivery
   - Creates order directly without payment gateway interaction

5. **Order Confirmation**:
   - On successful payment (or cash selection), order is confirmed
   - Cart is cleared
   - User is redirected to order tracking

### 3.3 Development and Test Modes

The frontend implements a test mode for development:
- Uses mock merchant details when in development environment
- Creates mock payment orders for testing
- Bypasses actual payment gateway calls in development

## 4. Backend Implementation

### 4.1 Core Components

- **PaymentService**: Orchestrates payment operations and business logic
- **PaymentProcessor Interface**: Defines common interface for payment methods
- **Payment Adapters**: Implement specific payment gateway integrations
- **Repositories**: Handle data access for payments, merchants, and wallets

### 4.2 Payment Processing Flow

1. **Payment Initiation**:
   - Validates order and payment request
   - Selects appropriate payment processor based on method
   - Creates payment records in pending state
   - Returns necessary information for frontend processing

2. **Payment Verification**:
   - Receives verification data from payment gateway
   - Validates payment signatures and details
   - Updates payment status based on verification result
   - Updates related order status

3. **Payment History and Management**:
   - Provides endpoints for fetching payment history
   - Enables payment status tracking
   - Supports potential refund operations

### 4.3 API Endpoints and GraphQL

- REST endpoints for direct payment operations
- GraphQL mutations for payment initiation and verification
- GraphQL queries for payment history and details

## 5. Design Patterns

The payment system implements several design patterns to ensure maintainability, extensibility, and clean architecture:

### 5.1 Adapter Pattern

The system uses the Adapter pattern to provide a unified interface for different payment gateways:

- `PaymentProcessor`: Abstract interface defining common payment operations
- `RazorpayAdapter`: Adapts Razorpay's API to the common interface
- `WalletAdapter`: Adapts internal wallet operations to the same interface

This pattern allows seamless addition of new payment methods without changing core business logic.

### 5.2 Repository Pattern

The system separates data access concerns using repositories:

- `PaymentRepository`: Handles payment data operations
- `MerchantRepository`: Manages merchant payment credentials
- `WalletRepository`: Manages wallet operations

This pattern ensures clean separation between business logic and data access.

### 5.3 Factory Method Pattern

The `PaymentService.get_payment_processor()` method acts as a factory, creating the appropriate payment processor based on the payment method. This encapsulates creation logic and makes the system extensible.

## 6. Payment Methods

### 6.1 UPI Payments (Razorpay)

- Integration with Razorpay for secure UPI transactions
- Dynamic loading of Razorpay SDK
- Complete payment flow with order creation and verification
- Support for multiple UPI apps (GPay, PhonePe, etc.)

### 6.2 Wallet Payments

- In-app wallet system for balance-based payments
- Transaction history tracking
- Balance management with credits and debits
- Support for privileged users with credit limits

### 6.3 Cash Payments

- Simple implementation for cash on delivery
- Order creation without payment verification
- Status management for cash payments

## 7. Security Considerations

The payment system implements several security measures:

- Payment verification with digital signatures (Razorpay)
- Secure storage of merchant credentials
- Transaction record keeping for audit trails
- Proper error handling to prevent information leakage

## 8. Error Handling

The system implements robust error handling:

- Frontend toast notifications for user feedback
- Graceful fallbacks in case of API failures
- Comprehensive error logging
- Development mode with mock data for testing

## 9. Future Enhancements

Potential areas for enhancement:

- Implementation of additional payment methods (cards, net banking)
- Enhanced refund processing workflows
- Payment analytics and reporting
- Subscription-based payment models
- Splitting bills among multiple users

## 10. Conclusion

The Smart Canteen payment system demonstrates a well-structured architecture that effectively separates concerns, implements appropriate design patterns, and provides a seamless experience for users. The system's use of adapters makes it extensible for future payment methods, while the clear separation between frontend and backend components ensures maintainability.

The implementation of both online (UPI) and offline (Cash) payment methods covers the primary use cases for a canteen environment, while the wallet system provides an additional convenience for frequent users.