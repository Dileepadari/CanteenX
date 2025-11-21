from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.payment import Payment, Merchant, UserWallet, WalletTransaction
from app.models.payment_dtos import (
    PaymentCreateDTO, PaymentUpdateDTO,
    MerchantCreateDTO, MerchantUpdateDTO,
    WalletTransactionCreateDTO,
)

class PaymentRepository:
    """Repository class for all Payment-related database operations."""
    def __init__(self, db: Session):
        self.db = db

    def create(self, payment_data: PaymentCreateDTO) -> Payment:
        """Creates a new payment record using a type-safe DTO."""
        db_payment = Payment(**payment_data.dict())
        self.db.add(db_payment)
        self.db.commit()
        self.db.refresh(db_payment)
        return db_payment

    def get_by_id(self, payment_id: int) -> Optional[Payment]:
        """Gets a payment by its primary key."""
        return self.db.query(Payment).filter(Payment.id == payment_id).first()

    def get_by_order_id(self, order_id: int) -> List[Payment]:
        """Gets all payments associated with a specific order ID."""
        return self.db.query(Payment).filter(Payment.order_id == order_id).all()

    def get_by_razorpay_order_id(self, razorpay_order_id: str) -> Optional[Payment]:
        """Gets a payment by the unique Razorpay order ID."""
        return self.db.query(Payment).filter(Payment.razorpay_order_id == razorpay_order_id).first()

    def get_all_by_user_id(self, user_id: str) -> List[Payment]:
        """Gets all payments made by a specific user."""
        return self.db.query(Payment).filter(Payment.user_id == user_id).all()

    def update(self, payment_id: int, update_data: PaymentUpdateDTO) -> Optional[Payment]:
        """Updates a payment record from a type-safe DTO."""
        payment = self.get_by_id(payment_id)
        if payment:
            # exclude_unset=True ensures we only update fields that were actually provided.
            for key, value in update_data.dict(exclude_unset=True).items():
                setattr(payment, key, value)
            self.db.commit()
            self.db.refresh(payment)
        return payment


class MerchantRepository:
    """Repository class for Merchant-related database operations."""
    def __init__(self, db: Session):
        self.db = db

    def create(self, merchant_data: MerchantCreateDTO) -> Merchant:
        """Creates a new merchant from a type-safe DTO."""
        db_merchant = Merchant(**merchant_data.dict())
        self.db.add(db_merchant)
        self.db.commit()
        self.db.refresh(db_merchant)
        return db_merchant

    def get_by_id(self, merchant_id: int) -> Optional[Merchant]:
        """Gets a merchant by their primary key."""
        return self.db.query(Merchant).filter(Merchant.id == merchant_id).first()

    def get_by_canteen_id(self, canteen_id: int) -> Optional[Merchant]:
        """Gets the merchant associated with a specific canteen."""
        return self.db.query(Merchant).filter(Merchant.canteen_id == canteen_id).first()


class WalletRepository:
    """Repository for all UserWallet and WalletTransaction database operations."""
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: str) -> Optional[UserWallet]:
        """Gets a user's wallet by their user ID."""
        return self.db.query(UserWallet).filter(UserWallet.user_id == user_id).first()

    def create(self, user_id: str, is_privileged: bool = False, credit_limit: float = 0.0) -> UserWallet:
        """Creates a new wallet for a user."""
        wallet = UserWallet(user_id=user_id, is_privileged=is_privileged, credit_limit=credit_limit)
        self.db.add(wallet)
        self.db.commit()
        self.db.refresh(wallet)
        return wallet

    def update_balance(self, wallet_id: int, amount_change: float) -> Optional[UserWallet]:
        """
        Updates a wallet's balance safely using a database lock to prevent race conditions.
        """
        wallet = self.db.query(UserWallet).filter(UserWallet.id == wallet_id).with_for_update().first()
        if wallet:
            wallet.balance += amount_change
            self.db.commit()
            self.db.refresh(wallet)
        return wallet

    def add_transaction(self, transaction_data: WalletTransactionCreateDTO) -> WalletTransaction:
        """Adds a new transaction record to a wallet's history."""
        transaction = WalletTransaction(**transaction_data.dict())
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction