"""Domain error hierarchy.

Services raise these; the GraphQL and REST layers translate them. Keeping the
mapping in one place is what stops the old pattern where an unauthenticated
caller got `AttributeError: 'NoneType' object has no attribute 'id'` (a 500)
instead of a clean authorization error.
"""

from __future__ import annotations

from typing import Any


class AppError(Exception):
    """Base class for every expected, client-visible failure."""

    code: str = "internal_error"
    http_status: int = 500
    #: Safe to show a user as-is.
    message: str = "Something went wrong."

    def __init__(
        self,
        message: str | None = None,
        *,
        code: str | None = None,
        extensions: dict[str, Any] | None = None,
    ) -> None:
        self.message = message or self.message
        if code:
            self.code = code
        self.extensions = extensions or {}
        super().__init__(self.message)

    def as_extensions(self) -> dict[str, Any]:
        return {"code": self.code, **self.extensions}


class AuthenticationError(AppError):
    code = "unauthenticated"
    http_status = 401
    message = "You must be signed in to do that."


class AuthorizationError(AppError):
    code = "forbidden"
    http_status = 403
    message = "You do not have permission to do that."


class NotFoundError(AppError):
    code = "not_found"
    http_status = 404
    message = "That resource does not exist."


class ValidationError(AppError):
    code = "validation_failed"
    http_status = 422
    message = "The request was not valid."


class ConflictError(AppError):
    code = "conflict"
    http_status = 409
    message = "That conflicts with the current state."


class RateLimitError(AppError):
    code = "rate_limited"
    http_status = 429
    message = "Too many requests. Please slow down."


# --- domain-specific ---------------------------------------------------------
class OutOfStockError(ConflictError):
    code = "out_of_stock"
    message = "One or more items are no longer available in that quantity."


class InvalidStatusTransitionError(ConflictError):
    code = "invalid_status_transition"
    message = "That status change is not allowed."


class InsufficientFundsError(ConflictError):
    code = "insufficient_funds"
    message = "Your wallet balance is too low for this order."


class PaymentError(AppError):
    code = "payment_failed"
    http_status = 402
    message = "The payment could not be completed."


class PaymentsDisabledError(AppError):
    code = "payments_disabled"
    http_status = 503
    message = "Online payment is not configured on this deployment."


class UploadsDisabledError(AppError):
    code = "uploads_disabled"
    http_status = 503
    message = "File uploads are not configured on this deployment."


class UploadError(AppError):
    code = "upload_failed"
    http_status = 400
    message = "The file could not be uploaded."
