"""Auth cookie helpers.

Centralised so the flags cannot drift between the login, refresh, and logout
paths - the previous logout cleared a non-httpOnly `accessToken` cookie that the
server never set, so signing out left the session fully valid.
"""

from __future__ import annotations

from fastapi import Response

from app.core.config import settings
from app.core.security import (
    ACCESS_COOKIE_NAME,
    CSRF_COOKIE_NAME,
    REFRESH_COOKIE_NAME,
)

#: Scope the refresh cookie to the refresh operation only, so it is not attached
#: to every ordinary API call.
REFRESH_COOKIE_PATH = "/api"


def _base_kwargs() -> dict:
    kwargs = {
        "secure": settings.cookie_secure,
        "samesite": settings.cookie_samesite,
        "httponly": True,
    }
    if settings.cookie_domain:
        kwargs["domain"] = settings.cookie_domain
    return kwargs


def set_auth_cookies(
    response: Response,
    *,
    access_token: str,
    refresh_token: str,
    csrf_token: str,
) -> None:
    response.set_cookie(
        ACCESS_COOKIE_NAME,
        access_token,
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
        **_base_kwargs(),
    )
    response.set_cookie(
        REFRESH_COOKIE_NAME,
        refresh_token,
        max_age=settings.refresh_token_expire_days * 86400,
        path=REFRESH_COOKIE_PATH,
        **_base_kwargs(),
    )

    # The CSRF cookie is deliberately readable by JavaScript: the SPA has to
    # echo it back in a header for the double-submit check to work.
    csrf_kwargs = _base_kwargs()
    csrf_kwargs["httponly"] = False
    response.set_cookie(
        CSRF_COOKIE_NAME,
        csrf_token,
        max_age=settings.refresh_token_expire_days * 86400,
        path="/",
        **csrf_kwargs,
    )


def clear_auth_cookies(response: Response) -> None:
    common = {"secure": settings.cookie_secure, "samesite": settings.cookie_samesite}
    if settings.cookie_domain:
        common["domain"] = settings.cookie_domain

    response.delete_cookie(ACCESS_COOKIE_NAME, path="/", httponly=True, **common)
    response.delete_cookie(
        REFRESH_COOKIE_NAME, path=REFRESH_COOKIE_PATH, httponly=True, **common
    )
    response.delete_cookie(CSRF_COOKIE_NAME, path="/", httponly=False, **common)
