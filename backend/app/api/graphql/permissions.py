"""GraphQL permission classes.

Two layers, deliberately separated:

* **Permission classes** (here) gate by *role* - "may an actor of this kind
  attempt this operation at all". They are declarative and cheap.
* **Services** enforce *object-level* ownership - "is this specific order
  yours", "do you run this canteen". That cannot live in a permission class
  because it needs the loaded row.

Every field must name at least one of these, including `AllowAny`. The audit of
the previous build found only 5 of 23 queries carried any policy, which is how
`getAllOrders(userId:)` ended up returning any user's order history to an
anonymous caller.
"""

from __future__ import annotations

from typing import Any

from strawberry import BasePermission
from strawberry.types import Info

from app.core.errors import AuthenticationError, AuthorizationError
from app.core.logging import get_logger
from app.db.models import UserRole

logger = get_logger(__name__)


class _Policy(BasePermission):
    """Base class that reports failures as domain errors rather than `False`.

    Returning False makes Strawberry emit a generic "permission denied" with a
    null field; raising lets the error formatter attach a machine-readable code
    the client can branch on (refresh the token vs. show a forbidden screen).
    """

    error: type[Exception] = AuthorizationError

    def on_unauthorized(self) -> None:
        # Logged so a denial can be traced to the policy that produced it;
        # the client only ever sees the safe message.
        logger.info("Policy denied access", extra={"policy": type(self).__name__})
        raise self.error()


class AllowAny(_Policy):
    """Explicitly public.

    Exists so that "public" is a decision someone wrote down, and so the
    schema-completeness test can tell it apart from a field whose policy was
    simply forgotten.
    """

    message = "Public field."

    def has_permission(self, source: Any, info: Info, **kwargs: Any) -> bool:
        return True


class IsAuthenticated(_Policy):
    message = "You must be signed in to do that."
    error = AuthenticationError

    def has_permission(self, source: Any, info: Info, **kwargs: Any) -> bool:
        return info.context.is_authenticated


class IsAdmin(_Policy):
    message = "Administrator access is required."

    def has_permission(self, source: Any, info: Info, **kwargs: Any) -> bool:
        context = info.context
        if not context.is_authenticated:
            raise AuthenticationError()
        return context.role is UserRole.ADMIN


class IsVendor(_Policy):
    """A canteen owner or a member of canteen staff (admins included)."""

    message = "Vendor access is required."

    def has_permission(self, source: Any, info: Info, **kwargs: Any) -> bool:
        context = info.context
        if not context.is_authenticated:
            raise AuthenticationError()
        return context.role in (UserRole.VENDOR, UserRole.STAFF, UserRole.ADMIN)


class IsSelfOrAdmin(_Policy):
    """Guards fields that take an explicit `user_id` argument.

    Without this, `getUserByEmail` and `getUsersByRole` let any signed-in
    student enumerate the entire user table.
    """

    message = "You can only access your own account."

    def has_permission(self, source: Any, info: Info, **kwargs: Any) -> bool:
        context = info.context
        if not context.is_authenticated:
            raise AuthenticationError()
        if context.role is UserRole.ADMIN:
            return True

        target = kwargs.get("user_id") or kwargs.get("userId")
        if target is None:
            # No target argument means "the current user", which is always self.
            return True
        return str(target) == context.user_id
