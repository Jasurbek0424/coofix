from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import Field, HttpUrl, field_validator, model_validator

from app.schemas.common import I18nRequired, I18nText, Input, Money, Output, Slug

# ---------- storefront (localized) ----------


class BrandOut(Output):
    id: int
    slug: str
    name: str
    logo_url: str | None


class CategoryNode(Output):
    id: int
    slug: str
    name: str
    image_url: str | None
    children: list["CategoryNode"] = []


class Crumb(Output):
    slug: str
    name: str


class CategoryOut(Output):
    id: int
    slug: str
    name: str
    description: str
    image_url: str | None
    breadcrumbs: list[Crumb]
    children: list[CategoryNode]
    seo: dict


StockLevel = Literal["out", "low", "in"]


class ProductCard(Output):
    id: int
    slug: str
    sku: str | None
    name: str
    price_minor: int
    old_price_minor: int | None
    currency: str
    image: dict | None
    stock_level: StockLevel
    is_new: bool
    is_hit: bool
    rating_avg: Decimal
    rating_count: int
    brand: BrandOut | None


class ProductDetail(ProductCard):
    description: str
    images: list[dict]
    attributes: dict
    category: Crumb
    breadcrumbs: list[Crumb]
    seo: dict


ProductSort = Literal["popular", "new", "price_asc", "price_desc", "name"]


# ---------- admin (raw translations) ----------


class Image(Input):
    url: HttpUrl
    alt: str | None = Field(default=None, max_length=200)

    def as_json(self) -> dict:
        return {"url": str(self.url), "alt": self.alt}


class Seo(Input):
    title: I18nText = {}
    description: I18nText = {}


class CategoryIn(Input):
    name: I18nRequired
    slug: Slug | None = None
    parent_id: int | None = None
    description: I18nText = {}
    image_url: HttpUrl | None = None
    sort_order: int = Field(default=0, ge=-10000, le=10000)
    is_active: bool = True
    seo: Seo = Seo()


class CategoryPatch(Input):
    name: I18nRequired | None = None
    slug: Slug | None = None
    parent_id: int | None = None
    description: I18nText | None = None
    image_url: HttpUrl | None = None
    sort_order: int | None = Field(default=None, ge=-10000, le=10000)
    is_active: bool | None = None
    seo: Seo | None = None


class CategoryAdminOut(Output):
    id: int
    parent_id: int | None
    slug: str
    name: dict[str, str]
    description: dict[str, str]
    image_url: str | None
    sort_order: int
    is_active: bool
    seo: dict
    created_at: datetime
    updated_at: datetime


class BrandIn(Input):
    name: str = Field(min_length=1, max_length=120)
    slug: Slug | None = None
    logo_url: HttpUrl | None = None
    is_active: bool = True


class BrandPatch(Input):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    slug: Slug | None = None
    logo_url: HttpUrl | None = None
    is_active: bool | None = None


class BrandAdminOut(Output):
    id: int
    slug: str
    name: str
    logo_url: str | None
    is_active: bool
    created_at: datetime


AttrKey = Field(min_length=1, max_length=100)


class _ProductFields(Input):
    @field_validator("attributes", check_fields=False)
    @classmethod
    def _attrs(cls, v: dict[str, str] | None) -> dict[str, str] | None:
        if v is None:
            return v
        if len(v) > 100:
            raise ValueError("Too many attributes")
        for k, val in v.items():
            if not k.strip() or len(k) > 100 or len(val) > 500:
                raise ValueError("Attribute keys ≤100 chars, values ≤500 chars")
        return {k.strip(): val.strip() for k, val in v.items()}

    @model_validator(mode="after")
    def _old_price(self):
        price = getattr(self, "price_minor", None)
        old = getattr(self, "old_price_minor", None)
        if price is not None and old is not None and old <= price:
            raise ValueError("old_price_minor must be greater than price_minor")
        return self


class ProductIn(_ProductFields):
    name: I18nRequired
    slug: Slug | None = None
    sku: str | None = Field(default=None, min_length=1, max_length=64, pattern=r"^[\w\-./]+$")
    description: I18nText = {}
    category_id: int
    brand_id: int | None = None
    price_minor: Money
    old_price_minor: Money | None = None
    stock: int = Field(default=0, ge=0, le=1_000_000)
    images: list[Image] = Field(default=[], max_length=20)
    attributes: dict[str, str] = {}
    is_active: bool = True
    is_new: bool = False
    is_hit: bool = False
    seo: Seo = Seo()


class ProductPatch(_ProductFields):
    name: I18nRequired | None = None
    slug: Slug | None = None
    sku: str | None = Field(default=None, min_length=1, max_length=64, pattern=r"^[\w\-./]+$")
    description: I18nText | None = None
    category_id: int | None = None
    brand_id: int | None = None
    price_minor: Money | None = None
    old_price_minor: Money | None = None
    images: list[Image] | None = Field(default=None, max_length=20)
    attributes: dict[str, str] | None = None
    is_active: bool | None = None
    is_new: bool | None = None
    is_hit: bool | None = None
    seo: Seo | None = None


class StockAdjustIn(Input):
    delta: int = Field(ge=-1_000_000, le=1_000_000)
    reason: str = Field(min_length=1, max_length=300)


class ProductAdminOut(Output):
    id: int
    slug: str
    sku: str | None
    name: dict[str, str]
    description: dict[str, str]
    category_id: int
    brand_id: int | None
    price_minor: int
    old_price_minor: int | None
    stock: int
    images: list[dict]
    attributes: dict
    is_active: bool
    is_new: bool
    is_hit: bool
    rating_avg: Decimal
    rating_count: int
    seo: dict
    created_at: datetime
    updated_at: datetime
