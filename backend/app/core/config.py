"""Application settings.

One `Settings` object, built from the environment, validated at import time.
There are deliberately **no fallback values for secrets** - a missing or weak
`JWT_SECRET` raises on startup rather than silently signing tokens with a value
that is committed to the repository and therefore forgeable by anyone.
"""

from __future__ import annotations

import secrets
from enum import Enum
from functools import lru_cache
from typing import Annotated, Any, Literal
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import Field, PostgresDsn, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

MIN_SECRET_LENGTH = 32


class Environment(str, Enum):
    development = "development"
    test = "test"
    staging = "staging"
    production = "production"

    @property
    def is_production(self) -> bool:
        return self is Environment.production

    @property
    def is_local(self) -> bool:
        return self in (Environment.development, Environment.test)


def _split_csv(value: Any) -> Any:
    """Allow list-valued settings to be supplied as comma-separated strings.

    Render and Vercel dashboards can only set flat strings, so
    `CORS_ORIGINS=https://a.com,https://b.com` has to parse as a list.
    """
    if isinstance(value, str):
        text = value.strip()
        if text.startswith("["):
            import json

            return json.loads(text)
        return [item.strip() for item in text.split(",") if item.strip()]
    return value


#: `NoDecode` stops pydantic-settings from JSON-parsing the raw env value, so
#: the before-validator below receives the plain string and can split it.
CsvList = Annotated[list[str], NoDecode, Field(default_factory=list)]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # --- Runtime -------------------------------------------------------------
    environment: Environment = Environment.development
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    api_prefix: str = "/api"

    # --- Database ------------------------------------------------------------
    database_url: PostgresDsn
    db_pool_size: int = 5
    db_max_overflow: int = 2
    db_pool_recycle_seconds: int = 300
    db_echo: bool = False

    # --- Auth ----------------------------------------------------------------
    jwt_secret: str
    jwt_algorithm: Literal["HS256", "HS384", "HS512"] = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    cookie_domain: str | None = None
    # SameSite=None is required when the SPA is on a different site than the API
    # (canteenx.vercel.app -> canteenx.onrender.com). It mandates Secure=True,
    # which is enforced in the validator below.
    cookie_samesite: Literal["lax", "strict", "none"] = "lax"

    # --- CORS ----------------------------------------------------------------
    cors_origins: CsvList

    # --- CAS SSO -------------------------------------------------------------
    cas_enabled: bool = True
    cas_server_url: str = "https://login.iiit.ac.in/cas/"
    cas_service_url: str = "http://localhost:8080/cas"
    cas_email_domain: str = "iiit.ac.in"

    # --- Razorpay ------------------------------------------------------------
    # Absent keys disable online payment rather than silently falling back to a
    # mock processor. The previous build shipped a mock that accepted any
    # payload and returned "captured", which made every order free.
    razorpay_key_id: str | None = None
    razorpay_key_secret: str | None = None
    razorpay_webhook_secret: str | None = None

    # --- Oracle object storage (shared with the portfolio project) ------------
    oracle_upload_base_url: str | None = "https://supabase.dileepadari.dev"
    #: Reads are served by a *different* host than uploads.
    oracle_public_base_url: str | None = "https://mystorage.dileepadari.dev"
    oracle_upload_api_key: str | None = None
    #: The upload route on the storage box. The current deployment exposes it
    #: at /functions/v1/upload; older standalone builds used /upload.
    oracle_upload_path: str = "/functions/v1/upload"
    oracle_app_name: str = "canteenx"
    #: The box writes everything under one folder regardless of file type.
    #: Only used to rebuild a public URL when the response does not say where
    #: the file actually landed.
    oracle_storage_folder: str = "images"
    upload_max_bytes: int = 8 * 1024 * 1024

    # --- Real-time -----------------------------------------------------------
    # Unset -> in-process pub/sub, which is correct for a single instance.
    redis_url: str | None = None

    # --- GraphQL hardening ---------------------------------------------------
    graphql_max_depth: int = 12
    graphql_max_aliases: int = 30

    # --- Business rules ------------------------------------------------------
    tax_rate_bps: int = 500  # 5.00% expressed in basis points
    order_cancellation_window_seconds: int = 300
    stock_reservation_ttl_seconds: int = 900

    # ------------------------------------------------------------------ hooks
    _normalise_lists = field_validator("cors_origins", mode="before")(_split_csv)

    @field_validator("jwt_secret")
    @classmethod
    def _reject_weak_secret(cls, value: str) -> str:
        if len(value) < MIN_SECRET_LENGTH:
            raise ValueError(
                f"JWT_SECRET must be at least {MIN_SECRET_LENGTH} characters. "
                f"Generate one with: openssl rand -hex 32"
            )
        return value

    @field_validator("database_url", mode="before")
    @classmethod
    def _coerce_async_driver(cls, value: Any) -> Any:
        """Normalise any Postgres URL to the asyncpg driver.

        Supabase hands out `postgresql://...?sslmode=require`. asyncpg does not
        understand libpq's `sslmode` query parameter and raises on it, so the
        parameter is translated into the `ssl` connect arg in database.py and
        stripped here.
        """
        if not isinstance(value, str):
            return value

        parts = urlsplit(value)
        scheme = parts.scheme
        if scheme in ("postgres", "postgresql") or scheme.startswith("postgresql+"):
            scheme = "postgresql+asyncpg"

        query = [
            (k, v) for k, v in parse_qsl(parts.query) if k not in ("sslmode", "ssl")
        ]
        return urlunsplit(
            (scheme, parts.netloc, parts.path, urlencode(query), parts.fragment)
        )

    @model_validator(mode="after")
    def _validate_cross_field_rules(self) -> "Settings":
        if self.cookie_samesite == "none" and not self.environment.is_production:
            # Secure cookies are required with SameSite=None, and Secure cookies
            # are dropped over plain http, so this combination breaks local dev
            # silently rather than loudly. Catch it here instead.
            raise ValueError(
                "COOKIE_SAMESITE=none requires HTTPS and is only valid when "
                "ENVIRONMENT=production."
            )

        if self.environment.is_production:
            if not self.cors_origins:
                raise ValueError("CORS_ORIGINS must be set in production.")
            if any(origin == "*" for origin in self.cors_origins):
                raise ValueError(
                    "CORS_ORIGINS cannot contain '*' when credentials are allowed."
                )
        elif not self.cors_origins:
            self.cors_origins = [
                "http://localhost:8080",
                "http://localhost:5173",
                "http://127.0.0.1:8080",
            ]

        return self

    # --------------------------------------------------------------- helpers
    @property
    def cookie_secure(self) -> bool:
        return self.environment.is_production or self.cookie_samesite == "none"

    @property
    def payments_enabled(self) -> bool:
        return bool(self.razorpay_key_id and self.razorpay_key_secret)

    @property
    def webhooks_enabled(self) -> bool:
        return bool(self.razorpay_webhook_secret)

    @property
    def uploads_enabled(self) -> bool:
        return bool(
            self.oracle_upload_base_url
            and self.oracle_public_base_url
            and self.oracle_upload_api_key
        )

    @property
    def graphiql_enabled(self) -> bool:
        return not self.environment.is_production

    @property
    def introspection_enabled(self) -> bool:
        return not self.environment.is_production

    def public_asset_url(
        self, file_name: str, upload_result_url: str | None = None
    ) -> str:
        """Build the public URL for an uploaded object.

        The *host* always comes from `oracle_public_base_url`: reads are served
        from a different domain than uploads, and the upload response's own
        `url` field points at the wrong one (a known bug on the storage box,
        worked around identically in the portfolio and workos projects).

        The *path* is taken from the response when it parses, because only the
        storage server knows which folder the file actually landed in. The
        documented convention is the fallback.
        """
        base = (self.oracle_public_base_url or "").rstrip("/")
        path = f"/{self.oracle_storage_folder}/{self.oracle_app_name}/{file_name}"

        if upload_result_url:
            try:
                from urllib.parse import urlsplit

                parsed = urlsplit(upload_result_url)
                if parsed.path:
                    path = parsed.path
            except ValueError:
                pass  # malformed - keep the conventional path

        return f"{base}{path}"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()


def generate_secret() -> str:
    """Convenience for `python -c 'from app.core.config import generate_secret; ...'`."""
    return secrets.token_hex(32)
