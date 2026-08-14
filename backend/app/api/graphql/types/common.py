"""Shared GraphQL types."""

from __future__ import annotations

from typing import Generic, TypeVar

import strawberry

T = TypeVar("T")


@strawberry.type(description="A monetary amount. Always transported in paise.")
class Money:
    """Money crosses the wire as an integer.

    `paise` is authoritative; `formatted` is a rendering convenience so every
    surface shows amounts identically instead of each screen re-implementing
    currency formatting (and drifting).
    """

    paise: int

    @strawberry.field(description='Rupees with two decimals, e.g. "₹184.50".')
    def formatted(self) -> str:
        return f"₹{self.paise / 100:,.2f}"

    @strawberry.field(description="Amount in rupees, for chart axes and sums.")
    def rupees(self) -> float:
        return round(self.paise / 100, 2)


def money(paise: int | None) -> Money:
    return Money(paise=int(paise or 0))


@strawberry.type
class PageInfo:
    total: int
    limit: int
    offset: int

    @strawberry.field
    def has_next_page(self) -> bool:
        return self.offset + self.limit < self.total


@strawberry.type
class Page(Generic[T]):
    items: list[T]
    page_info: PageInfo


@strawberry.input(description="Standard pagination arguments.")
class PageInput:
    limit: int = 20
    offset: int = 0

    def clamped(self, *, max_limit: int = 100) -> tuple[int, int]:
        """Bound the window so a client cannot ask for the whole table."""
        return max(1, min(self.limit, max_limit)), max(0, self.offset)


@strawberry.type
class MutationSuccess:
    """Returned by mutations whose only meaningful output is 'it worked'."""

    success: bool = True
    message: str | None = None
