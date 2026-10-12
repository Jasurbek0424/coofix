from datetime import datetime

from pydantic import EmailStr, Field

from app.models import Role
from app.schemas.common import Input, Output, Phone

Password = Field(min_length=8, max_length=128)


class RegisterIn(Input):
    email: EmailStr
    password: str = Password
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str | None = Field(default=None, max_length=80)
    phone: Phone | None = None


class LoginIn(Input):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ChangePasswordIn(Input):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Password


class ProfileUpdateIn(Input):
    first_name: str | None = Field(default=None, min_length=1, max_length=80)
    last_name: str | None = Field(default=None, max_length=80)
    phone: Phone | None = None


class UserOut(Output):
    id: int
    email: str
    first_name: str
    last_name: str | None
    phone: str | None
    role: Role
    email_verified_at: datetime | None
    created_at: datetime


class TokenOut(Output):
    access_token: str
    token_type: str = "bearer"  # noqa: S105
    expires_in: int
    user: UserOut
