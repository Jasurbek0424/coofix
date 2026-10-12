"""Operational commands.

    uv run python -m app.cli create-admin --email owner@coofix.store --name Owner

The password is read interactively (never from argv, which lands in shell history).
"""

import argparse
import asyncio
import getpass
import sys
from datetime import UTC, datetime

from app.core.db import SessionLocal
from app.core.security import hash_password
from app.models import Role, User
from app.services.auth import find_by_email


async def create_admin(email: str, name: str) -> None:
    password = getpass.getpass("Password (min 12 chars): ")
    if len(password) < 12 or password != getpass.getpass("Repeat: "):
        sys.exit("Passwords must match and be at least 12 characters.")
    async with SessionLocal() as db:
        if await find_by_email(db, email):
            sys.exit("User with this email already exists.")
        db.add(
            User(
                email=email.lower(),
                password_hash=hash_password(password),
                first_name=name,
                role=Role.admin,
                email_verified_at=datetime.now(UTC),
            )
        )
        await db.commit()
    print(f"Admin {email} created.")


def main() -> None:
    parser = argparse.ArgumentParser(prog="coofix")
    sub = parser.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("create-admin")
    p.add_argument("--email", required=True)
    p.add_argument("--name", required=True)
    args = parser.parse_args()
    if args.cmd == "create-admin":
        asyncio.run(create_admin(args.email, args.name))


if __name__ == "__main__":
    main()
