from slugify import slugify
from sqlalchemy import Select, and_, func, literal_column, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import AppError
from app.models import Category, Product
from app.schemas.catalog import (
    BrandOut,
    CategoryNode,
    Crumb,
    ProductCard,
    ProductDetail,
    ProductSort,
)
from app.schemas.common import pick

LOW_STOCK = 5


def make_slug(text: str) -> str:
    slug = slugify(text, max_length=110, word_boundary=True)
    if not slug:
        raise AppError(422, "invalid_slug", "Cannot derive slug; provide one explicitly")
    return slug


async def unique_slug(db: AsyncSession, model, base: str, exclude_id: int | None = None) -> str:
    candidate, n = base, 1
    while True:
        stmt = select(model.id).where(model.slug == candidate)
        if exclude_id is not None:
            stmt = stmt.where(model.id != exclude_id)
        if await db.scalar(stmt) is None:
            return candidate
        n += 1
        candidate = f"{base}-{n}"


def escape_like(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


# ---------- categories ----------


async def all_categories(db: AsyncSession, active_only: bool = True) -> list[Category]:
    stmt = select(Category).order_by(Category.sort_order, Category.id)
    if active_only:
        stmt = stmt.where(Category.is_active)
    return list(await db.scalars(stmt))


def build_tree(cats: list[Category], lang: str, root: int | None = None) -> list[CategoryNode]:
    by_parent: dict[int | None, list[Category]] = {}
    for c in cats:
        by_parent.setdefault(c.parent_id, []).append(c)

    def node(c: Category) -> CategoryNode:
        return CategoryNode(
            id=c.id,
            slug=c.slug,
            name=pick(c.name, lang),
            image_url=c.image_url,
            children=[node(ch) for ch in by_parent.get(c.id, [])],
        )

    return [node(c) for c in by_parent.get(root, [])]


def breadcrumbs(cats: list[Category], category_id: int, lang: str) -> list[Crumb]:
    by_id = {c.id: c for c in cats}
    chain: list[Crumb] = []
    seen: set[int] = set()
    cur = by_id.get(category_id)
    while cur is not None and cur.id not in seen:
        seen.add(cur.id)
        chain.append(Crumb(slug=cur.slug, name=pick(cur.name, lang)))
        cur = by_id.get(cur.parent_id) if cur.parent_id else None
    return list(reversed(chain))


def descendant_ids(cats: list[Category], root_id: int) -> set[int]:
    children: dict[int, list[int]] = {}
    for c in cats:
        if c.parent_id is not None:
            children.setdefault(c.parent_id, []).append(c.id)
    out, stack = set(), [root_id]
    while stack:
        cid = stack.pop()
        if cid in out:
            continue
        out.add(cid)
        stack.extend(children.get(cid, []))
    return out


async def assert_no_cycle(db: AsyncSession, category_id: int, new_parent_id: int | None) -> None:
    if new_parent_id is None:
        return
    if new_parent_id == category_id:
        raise AppError(422, "category_cycle", "Category cannot be its own parent")
    cats = await all_categories(db, active_only=False)
    if new_parent_id in descendant_ids(cats, category_id):
        raise AppError(422, "category_cycle", "Parent cannot be a descendant")


# ---------- products ----------


def stock_level(stock: int) -> str:
    if stock <= 0:
        return "out"
    return "low" if stock <= LOW_STOCK else "in"


def to_card(p: Product, lang: str) -> ProductCard:
    return ProductCard(
        id=p.id,
        slug=p.slug,
        sku=p.sku,
        name=pick(p.name, lang),
        price_minor=p.price_minor,
        old_price_minor=p.old_price_minor,
        currency=get_settings().currency,
        image=p.images[0] if p.images else None,
        stock_level=stock_level(p.stock),
        is_new=p.is_new,
        is_hit=p.is_hit,
        rating_avg=p.rating_avg,
        rating_count=p.rating_count,
        brand=BrandOut.model_validate(p.brand) if p.brand and p.brand.is_active else None,
    )


def to_detail(p: Product, lang: str, cats: list[Category]) -> ProductDetail:
    seo = p.seo or {}
    return ProductDetail(
        **to_card(p, lang).model_dump(),
        description=pick(p.description, lang),
        images=p.images,
        attributes=p.attributes,
        category=Crumb(slug=p.category.slug, name=pick(p.category.name, lang)),
        breadcrumbs=breadcrumbs(cats, p.category_id, lang),
        seo={
            "title": pick(seo.get("title"), lang) or pick(p.name, lang),
            "description": pick(seo.get("description"), lang),
        },
    )


def product_query(
    *,
    lang: str,
    q: str | None,
    category_ids: set[int] | None,
    brand_ids: list[int] | None,
    price_min: int | None,
    price_max: int | None,
    in_stock: bool | None,
    is_new: bool | None,
    is_hit: bool | None,
    on_sale: bool | None,
) -> Select:
    stmt = select(Product).where(Product.is_active)
    stmt = stmt.join(Product.category).where(Category.is_active)
    if q:
        pattern = f"%{escape_like(q)}%"
        name_ru = Product.name[get_settings().default_locale].astext
        name_lang = Product.name[lang].astext
        stmt = stmt.where(
            or_(
                name_ru.ilike(pattern, escape="\\"),
                name_lang.ilike(pattern, escape="\\"),
                Product.sku.ilike(pattern, escape="\\"),
            )
        )
    if category_ids is not None:
        stmt = stmt.where(Product.category_id.in_(category_ids))
    if brand_ids:
        stmt = stmt.where(Product.brand_id.in_(brand_ids))
    if price_min is not None:
        stmt = stmt.where(Product.price_minor >= price_min)
    if price_max is not None:
        stmt = stmt.where(Product.price_minor <= price_max)
    if in_stock:
        stmt = stmt.where(Product.stock > 0)
    if is_new:
        stmt = stmt.where(Product.is_new)
    if is_hit:
        stmt = stmt.where(Product.is_hit)
    if on_sale:
        stmt = stmt.where(
            and_(
                Product.old_price_minor.is_not(None), Product.old_price_minor > Product.price_minor
            )
        )
    return stmt


def apply_sort(stmt: Select, sort: ProductSort, lang: str) -> Select:
    # In-stock items first regardless of sort — nobody wants to scroll past "нет в наличии".
    in_stock_first = (Product.stock > 0).desc()
    order = {
        "popular": [Product.is_hit.desc(), Product.rating_count.desc(), Product.id.desc()],
        "new": [Product.created_at.desc(), Product.id.desc()],
        "price_asc": [Product.price_minor.asc(), Product.id],
        "price_desc": [Product.price_minor.desc(), Product.id],
        "name": [Product.name[lang].astext.asc(), Product.id],
    }[sort]
    return stmt.order_by(in_stock_first, *order)


async def paginate(db: AsyncSession, stmt: Select, page: int, per_page: int):
    total = await db.scalar(select(func.count()).select_from(stmt.order_by(None).subquery()))
    rows = await db.scalars(stmt.limit(per_page).offset((page - 1) * per_page))
    return list(rows.unique()), int(total or 0)


async def price_bounds(db: AsyncSession, stmt: Select) -> tuple[int, int]:
    sub = stmt.order_by(None).subquery()
    row = (
        await db.execute(
            select(
                func.coalesce(func.min(sub.c.price_minor), literal_column("0")),
                func.coalesce(func.max(sub.c.price_minor), literal_column("0")),
            )
        )
    ).one()
    return int(row[0]), int(row[1])
