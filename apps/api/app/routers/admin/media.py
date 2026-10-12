from typing import Annotated

from fastapi import APIRouter, Depends, Request, UploadFile

from app.core.deps import DB, require
from app.core.ratelimit import rate_limit
from app.models import User
from app.schemas.common import Output
from app.services.audit import record
from app.services.media import MAX_BYTES, save_image

router = APIRouter(prefix="/admin", tags=["admin-media"])


class MediaOut(Output):
    url: str
    width: int
    height: int


@router.post(
    "/media",
    response_model=MediaOut,
    status_code=201,
    dependencies=[Depends(rate_limit("media", 120, 600))],
)
async def upload(
    file: UploadFile,
    db: DB,
    user: Annotated[User, Depends(require("catalog.write"))],
    request: Request,
):
    data = await file.read(MAX_BYTES + 1)
    result = await save_image(data)
    await record(db, user, "media.upload", "media", result["url"], {"bytes": len(data)}, request)
    await db.commit()
    return result
