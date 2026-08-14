"""Wallet ledger with atomic, auditable balance changes."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ConflictError, InsufficientFundsError, ValidationError
from app.db.models import UserWallet, WalletTransaction


async def get_or_create(session: AsyncSession, user_id: str) -> UserWallet:
    wallet = await session.scalar(
        select(UserWallet).where(UserWallet.user_id == user_id)
    )
    if wallet is not None:
        return wallet

    wallet = UserWallet(user_id=user_id, balance_paise=0)
    session.add(wallet)
    try:
        await session.flush()
    except IntegrityError:
        await session.rollback()
        wallet = await session.scalar(
            select(UserWallet).where(UserWallet.user_id == user_id)
        )
        if wallet is None:  # pragma: no cover - unreachable in practice
            raise
    return wallet


async def _apply_delta(
    session: AsyncSession,
    *,
    wallet: UserWallet,
    delta_paise: int,
    description: str,
    order_id: int | None = None,
    payment_id: int | None = None,
) -> WalletTransaction:
    """Move money and write the ledger entry in one statement pair.

    The balance update is conditional (`balance_paise + delta >= 0`), so a
    concurrent double-spend loses the race instead of driving the balance
    negative. The old code committed the debit independently of the payment
    record, so a crash between the two silently lost money.
    """
    if delta_paise == 0:
        raise ValidationError("Amount must not be zero.")
    if wallet.is_frozen:
        raise ConflictError("This wallet is frozen.")

    result = await session.execute(
        update(UserWallet)
        .where(
            UserWallet.id == wallet.id,
            UserWallet.balance_paise + delta_paise >= 0,
        )
        .values(balance_paise=UserWallet.balance_paise + delta_paise)
        .returning(UserWallet.balance_paise)
    )
    new_balance = result.scalar_one_or_none()

    if new_balance is None:
        raise InsufficientFundsError()

    transaction = WalletTransaction(
        wallet_id=wallet.id,
        amount_paise=delta_paise,
        balance_after_paise=new_balance,
        description=description,
        order_id=order_id,
        payment_id=payment_id,
        created_at=datetime.now(UTC),
    )
    session.add(transaction)
    await session.flush()
    session.expire(wallet, ["balance_paise"])
    return transaction


async def credit(
    session: AsyncSession,
    *,
    user_id: str,
    amount_paise: int,
    description: str,
    order_id: int | None = None,
    payment_id: int | None = None,
) -> WalletTransaction:
    if amount_paise <= 0:
        raise ValidationError("Credit amount must be positive.")
    wallet = await get_or_create(session, user_id)
    return await _apply_delta(
        session,
        wallet=wallet,
        delta_paise=amount_paise,
        description=description,
        order_id=order_id,
        payment_id=payment_id,
    )


async def debit(
    session: AsyncSession,
    *,
    user_id: str,
    amount_paise: int,
    description: str,
    order_id: int | None = None,
    payment_id: int | None = None,
) -> WalletTransaction:
    if amount_paise <= 0:
        raise ValidationError("Debit amount must be positive.")
    wallet = await get_or_create(session, user_id)
    return await _apply_delta(
        session,
        wallet=wallet,
        delta_paise=-amount_paise,
        description=description,
        order_id=order_id,
        payment_id=payment_id,
    )


async def list_transactions(
    session: AsyncSession, *, user_id: str, limit: int = 30, offset: int = 0
) -> list[WalletTransaction]:
    wallet = await get_or_create(session, user_id)
    result = await session.execute(
        select(WalletTransaction)
        .where(WalletTransaction.wallet_id == wallet.id)
        .order_by(WalletTransaction.created_at.desc(), WalletTransaction.id.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())
