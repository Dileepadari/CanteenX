from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from ..models.payment import Payment, Merchant, UserWallet, WalletTransaction, PaymentStatus, PaymentMethod

class PaymentRepository:
    """
    Repository class for Payment-related database operations
    
    Rationale:
    - Encapsulates all database operations related to payments
    - Provides a clean interface for the service layer to interact with the database
    - Makes it easier to change database implementation details without affecting business logic
    """
    def __init__(self, db: Session):
        self.db = db

    def create_payment(self, payment_data: Dict[str, Any]) -> Payment:
        """Create a new payment record"""
        db_payment = Payment(**payment_data)
        self.db.add(db_payment)
        self.db.commit()
        self.db.refresh(db_payment)
        return db_payment

    def get_payment_by_id(self, payment_id: int) -> Optional[Payment]:
        """Get payment by ID"""
        return self.db.query(Payment).filter(Payment.id == payment_id).first()

    def get_payment_by_order_id(self, order_id: int) -> List[Payment]:
        """Get payments by order ID"""
        return self.db.query(Payment).filter(Payment.order_id == order_id).all()

    def get_payment_by_transaction_id(self, transaction_id: str) -> Optional[Payment]:
        """Get payment by transaction ID"""
        return self.db.query(Payment).filter(Payment.transaction_id == transaction_id).first()

    def get_payments_by_user_id(self, user_id: int) -> List[Payment]:
        """Get all payments made by a user"""
        return self.db.query(Payment).filter(Payment.user_id == user_id).all()

    def update_payment(self, payment_id: int, update_data: Dict[str, Any]) -> Optional[Payment]:
        """Update payment details"""
        payment = self.get_payment_by_id(payment_id)
        if payment:
            for key, value in update_data.items():
                setattr(payment, key, value)
            self.db.commit()
            self.db.refresh(payment)
        return payment

    def verify_payment_completion(self, payment_id: int, verification_data: Dict[str, Any]) -> Optional[Payment]:
        """Mark payment as verified/completed"""
        payment = self.get_payment_by_id(payment_id)
        if payment:
            payment.payment_status = PaymentStatus.COMPLETED.value
            payment.razorpay_payment_id = verification_data.get("razorpay_payment_id")
            payment.razorpay_signature = verification_data.get("razorpay_signature")
            payment.payment_response = str(verification_data)
            self.db.commit()
            self.db.refresh(payment)
        return payment

class MerchantRepository:
    """
    Repository class for Merchant-related database operations
    
    Rationale:
    - Encapsulates database operations related to merchant payment details
    - Simplifies access to payment credentials needed for gateway integration
    """
    def __init__(self, db: Session):
        self.db = db

    def create_merchant(self, merchant_data: Dict[str, Any]) -> Merchant:
        """Create a new merchant"""
        db_merchant = Merchant(**merchant_data)
        self.db.add(db_merchant)
        self.db.commit()
        self.db.refresh(db_merchant)
        return db_merchant

    def get_merchant_by_id(self, merchant_id: int) -> Optional[Merchant]:
        """Get merchant by ID"""
        return self.db.query(Merchant).filter(Merchant.id == merchant_id).first()

    def get_merchant_by_canteen_id(self, canteen_id: int) -> Optional[Merchant]:
        """Get merchant by canteen ID"""
        return self.db.query(Merchant).filter(Merchant.canteen_id == canteen_id).first()

    def get_all_active_merchants(self) -> List[Merchant]:
        """Get all active merchants"""
        return self.db.query(Merchant).filter(Merchant.is_active == True).all()

    def update_merchant(self, merchant_id: int, update_data: Dict[str, Any]) -> Optional[Merchant]:
        """Update merchant details"""
        merchant = self.get_merchant_by_id(merchant_id)
        if merchant:
            for key, value in update_data.items():
                setattr(merchant, key, value)
            self.db.commit()
            self.db.refresh(merchant)
        return merchant

class WalletRepository:
    """
    Repository class for Wallet-related database operations
    
    Rationale:
    - Handles all wallet-related database operations
    - Simplifies transaction management and balance updates
    - Will be used for wallet-based payments and pay-later implementation
    """
    def __init__(self, db: Session):
        self.db = db

    def get_wallet_by_user_id(self, user_id: int) -> Optional[UserWallet]:
        """Get user wallet by user ID"""
        return self.db.query(UserWallet).filter(UserWallet.user_id == user_id).first()

    def create_wallet(self, user_id: int, is_privileged: bool = False, credit_limit: float = 0.0) -> UserWallet:
        """Create a new wallet for user"""
        wallet = UserWallet(
            user_id=user_id, 
            is_privileged=is_privileged, 
            credit_limit=credit_limit
        )
        self.db.add(wallet)
        self.db.commit()
        self.db.refresh(wallet)
        return wallet

    def update_wallet_balance(self, wallet_id: int, amount_change: float) -> Optional[UserWallet]:
        """Update wallet balance"""
        wallet = self.db.query(UserWallet).filter(UserWallet.id == wallet_id).first()
        if wallet:
            wallet.balance += amount_change
            self.db.commit()
            self.db.refresh(wallet)
        return wallet

    def add_transaction(self, wallet_id: int, amount: float, description: str, payment_id: Optional[int] = None) -> WalletTransaction:
        """Add a transaction to wallet history"""
        transaction = WalletTransaction(
            wallet_id=wallet_id,
            amount=amount,
            description=description,
            payment_id=payment_id
        )
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction