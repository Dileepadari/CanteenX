"""Key/value platform settings.

The admin settings screen previously rendered four read-only count queries and
had no mutation at all, so nothing on it could ever be saved. These rows back
it for real.
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.db.models.base import TZDateTime

if TYPE_CHECKING:  # pragma: no cover
    pass


class PlatformSetting(Base):
    __tablename__ = "platform_settings"

    key: Mapped[str] = mapped_column(String(80), primary_key=True)
    value: Mapped[dict] = mapped_column(JSONB, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, default=None)

    updated_by_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), default=None
    )
    updated_at: Mapped[datetime] = mapped_column(TZDateTime, nullable=False)
