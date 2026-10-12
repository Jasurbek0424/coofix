from typing import Annotated

from fastapi import APIRouter, Query
from sqlalchemy import select

from app.core.deps import DB, Locale
from app.core.errors import AppError
from app.models import Brand, Product
from app.schemas.catalog import (
    BrandOut,
    CategoryNode,
    CategoryOut,
    ProductCard,
    ProductDetail,
    ProductSort,
)
from app.schemas.common import Page, pick
from app.services import catalog as svc

router = APIRouter(prefix="/catalog", tags=["catalog"])


class ProductPage(Page[ProductCard]):
    price_min: int
    price_max: int


@router.get("/categories", response_model=list[CategoryNode])
async def category_tree(db: DB, lang: Locale):
    return svc.build_tree(await svc.all_categories(db), lang)


@router.get("/categories/{slug}", response_model=CategoryOut)
async def category_detail(slug: str, db: DB, lang: Locale):
    cats = await svc.all_categories(db)
    cat = next((c for c in cats if c.slug == slug), None)
    if cat is None:
        raise AppError(404, "not_found", "Category not found")
    seo = cat.seo or {}
    return CategoryOut(
        id=cat.id,
        slug=cat.slug,
        name=pick(cat.name, lang),
        description=pick(cat.description, lang),
        image_url=cat.image_url,
        breadcrumbs=svc.breadcrumbs(cats, cat.id, lang),
        children=svc.build_tree(cats, lang, root=cat.id),
        seo={
            "title": pick(seo.get("title"), lang) or pick(cat.name, lang),
            "description": pick(seo.get("description"), lang),
        },
    )


@router.get("/brands", response_model=list[BrandOut])
async def brands(db: DB):
    return list(await db.scalars(select(Brand).where(Brand.is_active).order_by(Brand.name)))


@router.get("/products", response_model=ProductPage)
async def products(
    db: DB,
    lang: Locale,
    q: Annotated[str | None, Query(min_length=2, max_length=100)] = None,
    category: Annotated[str | None, Query(max_length=120)] = None,
    brand: Annotated[list[str] | None, Query(max_length=20)] = None,
    price_min: Annotated[int | None, Query(ge=0)] = None,
    price_max: Annotated[int | None, Query(ge=0)] = None,
    in_stock: bool | None = None,
    is_new: bool | None = None,
    is_hit: bool | None = None,
    on_sale: bool | None = None,
    sort: ProductSort = "popular",
    page: Annotated[int, Query(ge=1, le=1000)] = 1,
    per_page: Annotated[int, Query(ge=1, le=60)] = 24,
):
    category_ids = None
    if category:
        cats = await svc.all_categories(db)
        root = next((c for c in cats if c.slug == category), None)
        if root is None:
            raise AppError(404, "not_found", "Category not found")
        category_ids = svc.descendant_ids(cats, root.id)

    brand_ids = None
    if brand:
        brand_ids = list(
            await db.scalars(select(Brand.id).where(Brand.slug.in_(brand), Brand.is_active))
        )
        if not brand_ids:
            return ProductPage(
                items=[], total=0, page=page, per_page=per_page, price_min=0, price_max=0
            )

    base = svc.product_query(
        lang=lang,
        q=q,
        category_ids=category_ids,
        brand_ids=brand_ids,
        price_min=None,
        price_max=None,
        in_stock=in_stock,
        is_new=is_new,
        is_hit=is_hit,
        on_sale=on_sale,
    )
    # Price bounds come from the result set *before* the price filter, for the range slider.
    lo, hi = await svc.price_bounds(db, base)
    if price_min is not None:
        base = base.where(Product.price_minor >= price_min)
    if price_max is not None:
        base = base.where(Product.price_minor <= price_max)

    rows, total = await svc.paginate(db, svc.apply_sort(base, sort, lang), page, per_page)
    return ProductPage(
        items=[svc.to_card(p, lang) for p in rows],
        total=total,
        page=page,
        per_page=per_page,
        price_min=lo,
        price_max=hi,
    )


@router.get("/products/{slug}", response_model=ProductDetail)
async def product_detail(slug: str, db: DB, lang: Locale):
    product = await db.scalar(select(Product).where(Product.slug == slug, Product.is_active))
    if product is None or not product.category.is_active:
        raise AppError(404, "not_found", "Product not found")
    return svc.to_detail(product, lang, await svc.all_categories(db, active_only=False))


@router.get("/products/{slug}/related", response_model=list[ProductCard])
async def related(slug: str, db: DB, lang: Locale):
    product = await db.scalar(select(Product).where(Product.slug == slug, Product.is_active))
    if product is None:
        raise AppError(404, "not_found", "Product not found")
    rows = await db.scalars(
        select(Product)
        .where(
            Product.category_id == product.category_id,
            Product.id != product.id,
            Product.is_active,
        )
        .order_by((Product.stock > 0).desc(), Product.rating_count.desc(), Product.id.desc())
        .limit(12)
    )
    return [svc.to_card(p, lang) for p in rows]


@router.get("/products-by-ids", response_model=list[ProductCard])
async def products_by_ids(db: DB, lang: Locale, ids: Annotated[list[int], Query(max_length=100)]):
    """Used by guest cart / favorites / compare stored on the client."""
    rows = await db.scalars(select(Product).where(Product.id.in_(ids), Product.is_active))
    by_id = {p.id: p for p in rows}
    return [svc.to_card(by_id[i], lang) for i in ids if i in by_id]
