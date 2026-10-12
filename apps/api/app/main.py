import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.deps import CSRF_HEADER
from app.core.errors import install_error_handlers
from app.routers import auth, catalog, shop
from app.routers.admin import catalog as admin_catalog
from app.routers.admin import media as admin_media
from app.routers.admin import ops as admin_ops

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")


def create_app() -> FastAPI:
    s = get_settings()
    app = FastAPI(
        title="Coofix API",
        version="2.0.0",
        # Interactive docs only outside production.
        docs_url=None if s.is_prod else "/api/docs",
        redoc_url=None,
        openapi_url=None if s.is_prod else "/api/openapi.json",
    )
    install_error_handlers(app)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=s.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        allow_headers=["Authorization", "Content-Type", CSRF_HEADER],
        max_age=600,
    )

    @app.middleware("http")
    async def security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault("Cache-Control", "no-store")
        return response

    for r in (
        auth.store,
        auth.admin,
        catalog.router,
        shop.router,
        admin_catalog.router,
        admin_ops.router,
        admin_media.router,
    ):
        app.include_router(r, prefix="/api")

    if not s.is_prod:
        # In production Caddy serves /media directly from the shared volume.
        from pathlib import Path

        from fastapi.staticfiles import StaticFiles

        Path(s.media_root).mkdir(parents=True, exist_ok=True)
        app.mount("/media", StaticFiles(directory=s.media_root), name="media")

    @app.get("/api/health", tags=["meta"])
    async def health():
        return {"status": "ok"}

    return app


app = create_app()
