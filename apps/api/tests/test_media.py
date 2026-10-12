import io

from PIL import Image

from app.models import Role
from tests.conftest import login, make_user


def _png(size=(3000, 1500)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, (240, 90, 0)).save(buf, "PNG")
    return buf.getvalue()


async def test_upload_reencodes_and_resizes(client, tmp_path, monkeypatch):
    from app.core.config import get_settings

    monkeypatch.setattr(get_settings(), "media_root", str(tmp_path))
    await make_user("ed@x.ru", role=Role.content)
    h = await login(client, "ed@x.ru", admin=True)
    r = await client.post(
        "/api/admin/media", headers=h, files={"file": ("a.png", _png(), "image/png")}
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["url"].endswith(".webp") and (body["width"], body["height"]) == (2000, 1000)
    stored = list(tmp_path.rglob("*.webp"))
    assert len(stored) == 1 and stored[0].read_bytes()[8:12] == b"WEBP"


async def test_upload_rejects_non_images_and_unauthorized(client, tmp_path, monkeypatch):
    from app.core.config import get_settings

    monkeypatch.setattr(get_settings(), "media_root", str(tmp_path))
    fake = b"<svg onload=alert(1)>"
    r = await client.post("/api/admin/media", files={"file": ("x.png", fake, "image/png")})
    assert r.status_code == 401
    await make_user("sup@x.ru", role=Role.support)
    h = await login(client, "sup@x.ru", admin=True)
    r = await client.post(
        "/api/admin/media", headers=h, files={"file": ("x.png", _png(), "image/png")}
    )
    assert r.status_code == 403
    await make_user("ed2@x.ru", role=Role.content)
    h = await login(client, "ed2@x.ru", admin=True)
    r = await client.post(
        "/api/admin/media", headers=h, files={"file": ("x.png", fake, "image/png")}
    )
    assert r.json()["error"]["code"] == "unsupported_media"
    assert not list(tmp_path.rglob("*"))
