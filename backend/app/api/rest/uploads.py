"""Authenticated image upload endpoint.

Multipart uploads go over REST rather than GraphQL: the `Upload` scalar forces
every client through a multipart spec that Apollo Client does not support out
of the box, and a plain endpoint is simpler to rate-limit and stream.
"""

from __future__ import annotations

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.context import _extract_claims
from app.core.config import settings
from app.core.database import get_session
from app.core.errors import AppError, AuthenticationError
from app.db.models import User, UserRole
from app.domain.services import upload_service

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

#: Which roles may upload which kind of asset.
_KIND_ROLES: dict[str, set[UserRole]] = {
    "avatar": {UserRole.STUDENT, UserRole.STAFF, UserRole.VENDOR, UserRole.ADMIN},
    "complaint": {UserRole.STUDENT, UserRole.STAFF, UserRole.VENDOR, UserRole.ADMIN},
    "menu": {UserRole.VENDOR, UserRole.STAFF, UserRole.ADMIN},
    "canteen": {UserRole.VENDOR, UserRole.STAFF, UserRole.ADMIN},
}


async def _current_user(
    request: Request, session: AsyncSession = Depends(get_session)
) -> User:
    claims = _extract_claims(request)
    if claims is None:
        raise AuthenticationError()

    user = await session.get(User, claims.subject)
    if user is None or not user.is_active or user.deleted_at is not None:
        raise AuthenticationError()
    return user


@router.post("/image")
async def upload_image(
    kind: Annotated[Literal["menu", "canteen", "avatar", "complaint"], Form()],
    file: Annotated[UploadFile, File()],
    user: User = Depends(_current_user),
) -> dict[str, object]:
    allowed = _KIND_ROLES.get(kind, set())
    if user.role not in allowed:
        raise HTTPException(status_code=403, detail="Not allowed to upload that.")

    # Read with a hard ceiling so a huge upload cannot exhaust memory before the
    # size check runs.
    raw = await file.read(settings.upload_max_bytes + 1)
    if len(raw) > settings.upload_max_bytes:
        limit_mb = settings.upload_max_bytes / (1024 * 1024)
        raise HTTPException(
            status_code=413, detail=f"Images must be smaller than {limit_mb:.0f} MB."
        )

    try:
        result = await upload_service.upload_image(raw, kind=kind, owner_id=user.id)
    except AppError as exc:
        raise HTTPException(status_code=exc.http_status, detail=exc.message) from exc

    return {
        "url": result.url,
        "fileName": result.file_name,
        "width": result.width,
        "height": result.height,
        "bytes": result.bytes,
    }
