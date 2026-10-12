import re
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, StrictInt, StringConstraints

from app.core.config import get_settings


class Input(BaseModel):
    """Base for request bodies: unknown fields are rejected (no mass assignment)."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class Output(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Page[T](BaseModel):
    items: list[T]
    total: int
    page: int
    per_page: int


_NON_DIGITS = re.compile(r"[\s\-()]")


def _ru_phone(value: str) -> str:
    digits = _NON_DIGITS.sub("", value)
    if re.fullmatch(r"8\d{10}", digits):
        digits = "+7" + digits[1:]
    if not re.fullmatch(r"\+7\d{10}", digits):
        raise ValueError("Phone must be a Russian number: +7XXXXXXXXXX")
    return digits


def _i18n(value: dict[str, str]) -> dict[str, str]:
    s = get_settings()
    unknown = set(value) - set(s.locales)
    if unknown:
        raise ValueError(f"Unsupported locales: {sorted(unknown)}")
    if not value.get(s.default_locale, "").strip():
        raise ValueError(f"'{s.default_locale}' translation is required")
    return {k: v.strip() for k, v in value.items() if v.strip()}


def _i18n_optional(value: dict[str, str]) -> dict[str, str]:
    s = get_settings()
    unknown = set(value) - set(s.locales)
    if unknown:
        raise ValueError(f"Unsupported locales: {sorted(unknown)}")
    return {k: v.strip() for k, v in value.items() if v.strip()}


Phone = Annotated[str, Field(max_length=25), AfterValidator(_ru_phone)]
Slug = Annotated[str, StringConstraints(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=120)]
I18nRequired = Annotated[dict[str, Annotated[str, Field(max_length=300)]], AfterValidator(_i18n)]
I18nText = Annotated[
    dict[str, Annotated[str, Field(max_length=20000)]], AfterValidator(_i18n_optional)
]
Money = Annotated[StrictInt, Field(ge=0, le=10**12, description="Minor units (kopecks)")]


def pick(value: dict[str, str] | None, lang: str) -> str:
    if not value:
        return ""
    return value.get(lang) or value.get(get_settings().default_locale) or ""
