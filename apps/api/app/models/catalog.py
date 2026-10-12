from decimal import Decimal

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, Timestamped

# Translatable text is stored as JSONB {"ru": "...", "zh": "..."}.
I18n = dict[str, str]


class Category(Timestamped, Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"), index=True
    )
    slug: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    name: Mapped[I18n] = mapped_column(JSONB, nullable=False)
    description: Mapped[I18n] = mapped_column(JSONB, nullable=False, server_default="{}")
    image_url: Mapped[str | None] = mapped_column(String(500))
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    is_active: Mapped[bool] = mapped_column(nullable=False, server_default=text("true"))
    seo: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default="{}")


class Brand(Timestamped, Base):
    __tablename__ = "brands"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    logo_url: Mapped[str | None] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(nullable=False, server_default=text("true"))


class Product(Timestamped, Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    slug: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    sku: Mapped[str | None] = mapped_column(String(64), unique=True)
    name: Mapped[I18n] = mapped_column(JSONB, nullable=False)
    description: Mapped[I18n] = mapped_column(JSONB, nullable=False, server_default="{}")
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    brand_id: Mapped[int | None] = mapped_column(
        ForeignKey("brands.id", ondelete="SET NULL"), index=True
    )
    # Money in minor units (kopecks) — never floats.
    price_minor: Mapped[int] = mapped_column(BigInteger, nullable=False)
    old_price_minor: Mapped[int | None] = mapped_column(BigInteger)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    images: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, server_default="[]")
    # Characteristics: {"Мощность, Вт": "800", ...}; values may be translatable later.
    attributes: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default="{}")
    is_active: Mapped[bool] = mapped_column(nullable=False, server_default=text("true"))
    is_new: Mapped[bool] = mapped_column(nullable=False, server_default=text("false"))
    is_hit: Mapped[bool] = mapped_column(nullable=False, server_default=text("false"))
    rating_avg: Mapped[Decimal] = mapped_column(Numeric(3, 2), nullable=False, server_default="0")
    rating_count: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    seo: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default="{}")

    category: Mapped[Category] = relationship(lazy="joined")
    brand: Mapped[Brand | None] = relationship(lazy="joined")

    __table_args__ = (
        CheckConstraint("price_minor >= 0", name="price_nonneg"),
        CheckConstraint("old_price_minor IS NULL OR old_price_minor >= 0", name="old_price_nonneg"),
        CheckConstraint("stock >= 0", name="stock_nonneg"),
        Index(
            "ix_products_name_ru_trgm",
            text("(name->>'ru') gin_trgm_ops"),
            postgresql_using="gin",
        ),
        Index("ix_products_price", "price_minor"),
    )
