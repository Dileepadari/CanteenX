"""Notification creation and real-time fan-out."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.core.pubsub import get_pubsub, user_channel
from app.db.models import Notification, NotificationType


async def notify(
    session: AsyncSession,
    *,
    user_id: str,
    type: NotificationType,
    title: str,
    body: str | None = None,
    link: str | None = None,
    data: dict[str, Any] | None = None,
) -> Notification:
    """Persist a notification and push it to any live subscriber.

    Persisting first is the point: a notification that only ever existed in the
    publishing tab's memory (the previous design) could never reach the person
    it was about.
    """
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        body=body,
        link=link,
        data=data or {},
        created_at=datetime.now(UTC),
    )
    session.add(notification)
    await session.flush()

    await get_pubsub().publish(
        user_channel(user_id),
        {
            "id": notification.id,
            "type": type.value,
            "title": title,
            "body": body,
            "link": link,
            "data": notification.data,
            "createdAt": notification.created_at.isoformat(),
        },
    )
    return notification


async def list_for_user(
    session: AsyncSession,
    *,
    user_id: str,
    limit: int = 30,
    offset: int = 0,
    unread_only: bool = False,
) -> list[Notification]:
    query = select(Notification).where(Notification.user_id == user_id)
    if unread_only:
        query = query.where(Notification.read_at.is_(None))

    result = await session.execute(
        query.order_by(Notification.created_at.desc()).limit(limit).offset(offset)
    )
    return list(result.scalars().all())


async def unread_count(session: AsyncSession, *, user_id: str) -> int:
    return (
        await session.scalar(
            select(func.count())
            .select_from(Notification)
            .where(Notification.user_id == user_id, Notification.read_at.is_(None))
        )
    ) or 0


async def mark_read(
    session: AsyncSession, *, user_id: str, notification_id: int
) -> Notification:
    notification = await session.scalar(
        select(Notification).where(
            Notification.id == notification_id, Notification.user_id == user_id
        )
    )
    if notification is None:
        raise NotFoundError("That notification does not exist.")

    if notification.read_at is None:
        notification.read_at = datetime.now(UTC)
    return notification


async def mark_all_read(session: AsyncSession, *, user_id: str) -> int:
    result = await session.execute(
        update(Notification)
        .where(Notification.user_id == user_id, Notification.read_at.is_(None))
        .values(read_at=datetime.now(UTC))
    )
    return result.rowcount or 0
