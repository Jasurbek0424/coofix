"""Image ingestion: every upload is decoded and re-encoded, so only clean WebP pixels
reach disk (no polyglot files, scripts, or EXIF/GPS metadata)."""

import asyncio
import io
import uuid
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError

from app.core.config import get_settings
from app.core.errors import AppError

MAX_BYTES = 10 * 1024 * 1024
MAX_SIDE = 2000
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}
Image.MAX_IMAGE_PIXELS = 40_000_000  # decompression-bomb guard


def _process(data: bytes) -> tuple[bytes, int, int]:
    try:
        with Image.open(io.BytesIO(data)) as probe:
            if probe.format not in ALLOWED_FORMATS:
                raise AppError(415, "unsupported_media", "Only JPEG, PNG or WebP images")
            probe.verify()
        with Image.open(io.BytesIO(data)) as img:
            img = ImageOps.exif_transpose(img)
            img = img.convert("RGBA" if img.mode in ("RGBA", "LA", "P") else "RGB")
            img.thumbnail((MAX_SIDE, MAX_SIDE), Image.Resampling.LANCZOS)
            out = io.BytesIO()
            img.save(out, "WEBP", quality=85, method=6)
            return out.getvalue(), img.width, img.height
    except (UnidentifiedImageError, Image.DecompressionBombError, OSError, SyntaxError):
        raise AppError(415, "unsupported_media", "File is not a valid image") from None


async def save_image(data: bytes) -> dict:
    if len(data) > MAX_BYTES:
        raise AppError(413, "file_too_large", "Image must be 10 MB or smaller")
    webp, width, height = await asyncio.to_thread(_process, data)
    s = get_settings()
    name = f"{uuid.uuid4().hex}.webp"
    sub = name[:2]
    folder = Path(s.media_root) / sub
    folder.mkdir(parents=True, exist_ok=True)
    await asyncio.to_thread((folder / name).write_bytes, webp)
    return {"url": f"{s.media_url.rstrip('/')}/{sub}/{name}", "width": width, "height": height}
