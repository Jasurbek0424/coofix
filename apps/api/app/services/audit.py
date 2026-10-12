from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ratelimit import client_ip
from app.models import AuditLog, User


async def record(
    db: AsyncSession,
    actor: User | None,
    action: str,
    entity: str,
    entity_id: object | None = None,
    data: dict | None = None,
    request: Request | None = None,
) -> None:
    """Adds an audit row in the caller's transaction (committed together with the change)."""
    db.add(
        AuditLog(
            actor_user_id=actor.id if actor else None,
            action=action,
            entity=entity,
            entity_id=str(entity_id) if entity_id is not None else None,
            data=data or {},
            ip=client_ip(request) if request and request.client else None,
        )
    )
