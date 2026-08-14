"""A local stand-in for the object storage service, for development only.

Implements the same contract as the production endpoint (see DEVDOC.md), so the
whole upload path - validation, EXIF stripping, WebP re-encoding, the proxy hop,
and public URL construction - can be exercised without cloud credentials.

    python -m scripts.local_storage          # serves on :9000

Then point the API at it:
    ORACLE_UPLOAD_BASE_URL=http://127.0.0.1:9000
    ORACLE_PUBLIC_BASE_URL=http://127.0.0.1:9000
    ORACLE_UPLOAD_API_KEY=local-dev-key
"""

from __future__ import annotations

import os
import re
from pathlib import Path

import uvicorn
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import FileResponse

ROOT = Path(os.getenv("LOCAL_STORAGE_ROOT", "/tmp/canteenx-storage"))
API_KEY = os.getenv("LOCAL_STORAGE_KEY", "local-dev-key")

# Mirrors the real server: letters, digits, '.', '_' and '-' only. No slashes,
# so a caller cannot choose a folder.
SAFE_FILENAME = re.compile(r"^[A-Za-z0-9._-]+$")

# The live box writes everything under one folder regardless of x-file-type.
STORAGE_FOLDER = os.getenv("LOCAL_STORAGE_FOLDER", "images")

app = FastAPI(title="CanteenX local storage (development only)")


@app.post("/functions/v1/upload")
async def upload(
    request: Request,
    x_upload_key: str = Header(default=""),
    x_file_type: str = Header(default="images"),
    x_app_name: str = Header(default="canteenx"),
    x_file_name: str = Header(default=""),
) -> dict[str, object]:
    if x_upload_key != API_KEY:
        raise HTTPException(status_code=401, detail="Bad upload key")
    if not x_file_name or not SAFE_FILENAME.match(x_file_name):
        raise HTTPException(
            status_code=400,
            detail=(
                "Missing or invalid x-file-name header (letters, digits, '.', "
                "'_', '-' only, no slashes)"
            ),
        )

    # Everything lands in one folder, whatever x-file-type says - matching the
    # live server, so the API cannot quietly depend on type-based routing.
    _ = x_file_type
    destination = ROOT / STORAGE_FOLDER / x_app_name / x_file_name
    destination.parent.mkdir(parents=True, exist_ok=True)
    body = await request.body()
    destination.write_bytes(body)

    # The live server returns a URL on the *upload* host, which is not where
    # reads are served. Reproduced here so the API is exercised against the
    # same quirk rather than a friendlier fiction.
    return {
        "success": True,
        "url": f"http://upload-host.invalid/{STORAGE_FOLDER}/{x_app_name}/{x_file_name}",
        "bytes": len(body),
    }


@app.get("/{file_type}/{app_name}/{path:path}")
async def read(file_type: str, app_name: str, path: str) -> FileResponse:
    target = ROOT / file_type / app_name / path
    if not target.is_file():
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(target, media_type="image/webp")


if __name__ == "__main__":
    ROOT.mkdir(parents=True, exist_ok=True)
    print(f"Local storage serving {ROOT} on http://127.0.0.1:9000")
    uvicorn.run(app, host="127.0.0.1", port=9000, log_level="warning")
