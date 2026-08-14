"""Image uploads, proxied to Oracle object storage.

The upload key never reaches the browser: the client POSTs to this API, which
validates and re-encodes the file, then forwards it with the secret header.
This mirrors the contract the portfolio project's Edge Function implements, so
both apps share one storage backend.
"""

from __future__ import annotations

import io
import uuid
from dataclasses import dataclass
from typing import Literal

import httpx
from PIL import Image, ImageOps

from app.core.config import settings
from app.core.errors import UploadError, UploadsDisabledError
from app.core.logging import get_logger

logger = get_logger(__name__)

UploadKind = Literal["menu", "canteen", "avatar", "complaint"]

#: Longest edge per kind. Menu photography is the only place that benefits from
#: real resolution; avatars at 4000px are pure waste.
_MAX_EDGE: dict[str, int] = {
    "menu": 1600,
    "canteen": 2000,
    "avatar": 512,
    "complaint": 1600,
}

# Verified by decoding, not by trusting the declared content type - a caller can
# label anything `image/png`.
_ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP", "GIF", "HEIF", "AVIF"}


@dataclass(frozen=True, slots=True)
class UploadResult:
    url: str
    file_name: str
    width: int
    height: int
    bytes: int


def _process(raw: bytes, kind: UploadKind) -> tuple[bytes, int, int]:
    """Decode, normalise, and re-encode to WebP.

    Re-encoding is a security control as much as an optimisation: it strips
    EXIF (which carries GPS coordinates from phone cameras) and guarantees the
    stored bytes really are an image rather than a polyglot payload.
    """
    try:
        with Image.open(io.BytesIO(raw)) as image:
            if (image.format or "").upper() not in _ALLOWED_FORMATS:
                raise UploadError("That image format is not supported.")

            image = ImageOps.exif_transpose(image)
            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGB")

            max_edge = _MAX_EDGE.get(kind, 1600)
            image.thumbnail((max_edge, max_edge), Image.LANCZOS)

            buffer = io.BytesIO()
            image.save(buffer, format="WEBP", quality=82, method=5)
            return buffer.getvalue(), image.width, image.height
    except UploadError:
        raise
    except Exception as exc:
        logger.warning("Rejected an undecodable upload", extra={"error": str(exc)})
        raise UploadError("That file is not a readable image.") from exc


async def upload_image(raw: bytes, *, kind: UploadKind, owner_id: str) -> UploadResult:
    if not settings.uploads_enabled:
        raise UploadsDisabledError()

    if not raw:
        raise UploadError("The file is empty.")
    if len(raw) > settings.upload_max_bytes:
        limit_mb = settings.upload_max_bytes / (1024 * 1024)
        raise UploadError(f"Images must be smaller than {limit_mb:.0f} MB.")

    processed, width, height = _process(raw, kind)

    # Name from a UUID, never from client input - an attacker-chosen filename
    # is a path-traversal and overwrite vector.
    #
    # A hyphen separates the kind, not a slash: the storage server validates
    # `x-file-name` against letters, digits, '.', '_' and '-' only, and
    # rejects anything containing a path separator outright.
    file_name = f"{kind}-{uuid.uuid4().hex}.webp"

    endpoint = settings.oracle_upload_base_url.rstrip("/") + settings.oracle_upload_path

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                endpoint,
                headers={
                    "x-upload-key": settings.oracle_upload_api_key,
                    "x-file-type": "images",
                    "x-app-name": settings.oracle_app_name,
                    "x-file-name": file_name,
                    "content-type": "image/webp",
                },
                content=processed,
            )
    except httpx.HTTPError as exc:
        logger.error("Storage upload failed", exc_info=exc)
        raise UploadError("The image could not be stored. Please try again.") from exc

    payload: dict = {}
    try:
        payload = response.json()
    except ValueError:
        payload = {}

    # The service reports failure in the body as well as the status, so both
    # are checked - a 200 with `success: false` is still a failure.
    if response.status_code >= 400 or not payload.get("success", True):
        logger.error(
            "Storage rejected the upload",
            extra={
                "status": response.status_code,
                "error": str(payload.get("error"))[:200],
            },
        )
        raise UploadError("The image could not be stored. Please try again.")

    logger.info(
        "Image uploaded",
        extra={"kind": kind, "owner_id": owner_id, "bytes": len(processed)},
    )

    # Host from configuration, path from the response - see `public_asset_url`.
    return UploadResult(
        url=settings.public_asset_url(file_name, payload.get("url")),
        file_name=file_name,
        width=width,
        height=height,
        bytes=len(processed),
    )
