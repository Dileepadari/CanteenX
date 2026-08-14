"""Structured JSON logging with a per-request correlation id."""

from __future__ import annotations

import logging
import sys
import uuid
from contextvars import ContextVar

from pythonjsonlogger.json import JsonFormatter

from app.core.config import settings

_request_id: ContextVar[str | None] = ContextVar("request_id", default=None)

#: Keys that must never reach the logs, whatever an exception carries.
_REDACTED = {
    "password",
    "password_hash",
    "token",
    "access_token",
    "refresh_token",
    "authorization",
    "cookie",
    "jwt_secret",
    "razorpay_key_secret",
    "razorpay_webhook_secret",
    "oracle_upload_api_key",
    "x-upload-key",
}


def set_request_id(value: str | None = None) -> str:
    rid = value or uuid.uuid4().hex[:12]
    _request_id.set(rid)
    return rid


def get_request_id() -> str | None:
    return _request_id.get()


class _ContextFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = get_request_id()
        record.environment = settings.environment.value
        for key in list(record.__dict__):
            if key.lower() in _REDACTED:
                record.__dict__[key] = "[redacted]"
        return True


def configure_logging() -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        JsonFormatter(
            "%(asctime)s %(levelname)s %(name)s %(message)s",
            rename_fields={"levelname": "level", "asctime": "timestamp"},
            timestamp=True,
        )
    )
    handler.addFilter(_ContextFilter())

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(settings.log_level)

    # uvicorn installs its own handlers; route them through ours so every line
    # is JSON and carries the request id.
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        logger = logging.getLogger(name)
        logger.handlers.clear()
        logger.propagate = True

    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.db_echo else logging.WARNING
    )


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
