"""Complaints and reviews.

Both were stubs on the client (`// In a real app, this would save…`), so
nothing a user submitted ever left the browser.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import (
    AuthorizationError,
    ConflictError,
    NotFoundError,
    ValidationError,
)
from app.db.models import (
    Canteen,
    Complaint,
    ComplaintCategory,
    ComplaintStatus,
    MenuItem,
    NotificationType,
    Order,
    OrderStatus,
    Review,
    User,
    UserRole,
)
from app.domain.services import notification_service

COMPLAINT_LOAD = (
    selectinload(Complaint.user),
    selectinload(Complaint.canteen),
)


# ------------------------------------------------------------------ complaints
async def create_complaint(
    session: AsyncSession,
    *,
    user: User,
    subject: str,
    body: str,
    category: ComplaintCategory = ComplaintCategory.OTHER,
    order_id: int | None = None,
    canteen_id: int | None = None,
    attachment_urls: list[str] | None = None,
) -> Complaint:
    subject, body = subject.strip(), body.strip()
    if not subject or not body:
        raise ValidationError("Please provide a subject and a description.")

    if order_id is not None:
        order = await session.get(Order, order_id)
        if order is None or order.user_id != user.id:
            raise NotFoundError("That order does not exist.")
        canteen_id = order.canteen_id

    complaint = Complaint(
        user_id=user.id,
        order_id=order_id,
        canteen_id=canteen_id,
        subject=subject,
        body=body,
        category=category,
        attachment_urls=attachment_urls or [],
    )
    session.add(complaint)
    await session.flush()

    return await get_complaint(session, complaint.id)


async def get_complaint(session: AsyncSession, complaint_id: int) -> Complaint:
    complaint = await session.scalar(
        select(Complaint).where(Complaint.id == complaint_id).options(*COMPLAINT_LOAD)
    )
    if complaint is None:
        raise NotFoundError("That complaint does not exist.")
    return complaint


async def list_complaints(
    session: AsyncSession,
    *,
    actor: User,
    canteen_id: int | None = None,
    status: ComplaintStatus | None = None,
    mine_only: bool = False,
    limit: int = 50,
    offset: int = 0,
) -> list[Complaint]:
    """Scope is derived from the actor, never from a client-supplied user id.

    Previously every complaint query was public, so an anonymous caller could
    read the full text of everyone's complaints.
    """
    query = select(Complaint).options(*COMPLAINT_LOAD)

    if mine_only or actor.role is UserRole.STUDENT:
        query = query.where(Complaint.user_id == actor.id)
    elif actor.role is not UserRole.ADMIN:
        from app.domain.services.user_service import canteens_managed_by

        managed = [c.id for c in await canteens_managed_by(session, actor)]
        if not managed:
            return []
        query = query.where(Complaint.canteen_id.in_(managed))

    if canteen_id is not None:
        query = query.where(Complaint.canteen_id == canteen_id)
    if status is not None:
        query = query.where(Complaint.status == status)

    result = await session.execute(
        query.order_by(Complaint.created_at.desc()).limit(limit).offset(offset)
    )
    return list(result.unique().scalars().all())


async def respond_to_complaint(
    session: AsyncSession,
    *,
    actor: User,
    complaint_id: int,
    response_body: str,
    status: ComplaintStatus,
) -> Complaint:
    complaint = await get_complaint(session, complaint_id)

    if actor.role is not UserRole.ADMIN:
        from app.domain.services.catalog_service import assert_manages_canteen

        if complaint.canteen_id is None:
            raise AuthorizationError("Only administrators can handle this complaint.")
        await assert_manages_canteen(session, actor, complaint.canteen_id)

    complaint.response_body = response_body.strip() or None
    complaint.responded_by_id = actor.id
    complaint.responded_at = datetime.now(UTC)
    complaint.status = status

    now = datetime.now(UTC)
    if status is ComplaintStatus.ESCALATED:
        complaint.escalated_at = now
    elif status in (ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED):
        complaint.resolved_at = now

    await notification_service.notify(
        session,
        user_id=complaint.user_id,
        type=NotificationType.COMPLAINT,
        title="Your complaint was updated",
        body=f"'{complaint.subject}' is now {status.value.replace('_', ' ')}.",
        link="/feedback",
        data={"complaintId": complaint.id, "status": status.value},
    )

    await session.flush()
    return complaint


async def escalate_stale_complaints(
    session: AsyncSession, *, older_than_days: int = 7
) -> int:
    cutoff = datetime.now(UTC) - timedelta(days=older_than_days)
    result = await session.execute(
        update(Complaint)
        .where(
            Complaint.status == ComplaintStatus.OPEN,
            Complaint.created_at < cutoff,
        )
        .values(status=ComplaintStatus.ESCALATED, escalated_at=datetime.now(UTC))
    )
    return result.rowcount or 0


# --------------------------------------------------------------------- reviews
async def create_review(
    session: AsyncSession,
    *,
    user: User,
    order_id: int,
    rating: int,
    body: str | None = None,
    menu_item_id: int | None = None,
) -> Review:
    """Reviews are anchored to a completed order the reviewer actually placed."""
    if not 1 <= rating <= 5:
        raise ValidationError("Rating must be between 1 and 5.")

    order = await session.get(Order, order_id)
    if order is None or order.user_id != user.id:
        raise NotFoundError("That order does not exist.")

    if order.status is not OrderStatus.COMPLETED:
        raise ConflictError("You can review an order once it has been completed.")

    if menu_item_id is not None:
        belongs = await session.scalar(
            select(func.count())
            .select_from(MenuItem)
            .join(Order, Order.canteen_id == MenuItem.canteen_id)
            .where(MenuItem.id == menu_item_id, Order.id == order_id)
        )
        if not belongs:
            raise ValidationError("That item was not part of this order.")

    review = Review(
        user_id=user.id,
        order_id=order_id,
        canteen_id=order.canteen_id,
        menu_item_id=menu_item_id,
        rating=rating,
        body=(body or "").strip() or None,
    )
    session.add(review)

    try:
        await session.flush()
    except IntegrityError:
        await session.rollback()
        raise ConflictError("You have already reviewed this.") from None

    await _recalculate_ratings(
        session, canteen_id=order.canteen_id, menu_item_id=menu_item_id
    )
    return review


async def _recalculate_ratings(
    session: AsyncSession, *, canteen_id: int, menu_item_id: int | None
) -> None:
    """Recompute the denormalised averages from the source rows.

    Recomputing beats incrementing: an incremental average drifts as soon as a
    single review is edited or deleted.
    """
    canteen_stats = (
        await session.execute(
            select(func.avg(Review.rating), func.count()).where(
                Review.canteen_id == canteen_id
            )
        )
    ).one()

    await session.execute(
        update(Canteen)
        .where(Canteen.id == canteen_id)
        .values(
            rating=round(float(canteen_stats[0] or 0), 2),
            rating_count=canteen_stats[1] or 0,
        )
    )

    if menu_item_id is not None:
        item_stats = (
            await session.execute(
                select(func.avg(Review.rating), func.count()).where(
                    Review.menu_item_id == menu_item_id
                )
            )
        ).one()
        await session.execute(
            update(MenuItem)
            .where(MenuItem.id == menu_item_id)
            .values(
                rating=round(float(item_stats[0] or 0), 2),
                rating_count=item_stats[1] or 0,
            )
        )


async def list_reviews(
    session: AsyncSession,
    *,
    canteen_id: int | None = None,
    menu_item_id: int | None = None,
    limit: int = 20,
    offset: int = 0,
) -> list[Review]:
    query = select(Review).options(selectinload(Review.user))
    if canteen_id is not None:
        query = query.where(Review.canteen_id == canteen_id)
    if menu_item_id is not None:
        query = query.where(Review.menu_item_id == menu_item_id)

    result = await session.execute(
        query.order_by(Review.created_at.desc()).limit(limit).offset(offset)
    )
    return list(result.unique().scalars().all())
