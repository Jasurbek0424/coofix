from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError

from app.core.deps import DB, require
from app.core.errors import AppError
from app.models import Brand, Category, OrderItem, Product, User
from app.schemas.catalog import (
    BrandAdminOut,
    BrandIn,
    BrandPatch,
    CategoryAdminOut,
    CategoryIn,
    CategoryPatch,
    ProductAdminOut,
    ProductIn,
    ProductPatch,
    StockAdjustIn,
)
from app.schemas.common import Page
from app.services import catalog as svc
from app.services.audit import record

router = APIRouter(prefix="/admin", tags=["admin-catalog"])
Editor = Annotated[User, Depends(require("catalog.write"))]


def _dump(model, exclude: set[str] | None = None) -> dict:
    """Pydantic → plain dict for DB columns (HttpUrl → str, nested models → dict)."""
    return model.model_dump(mode="json", exclude_unset=True, exclude=exclude)


async def _get(db, model, obj_id: int):
    obj = await db.get(model, obj_id)
    if obj is None:
        raise AppError(404, "not_found", f"{model.__name__} not found")
    return obj


async def _commit(db) -> None:
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        msg = str(e.orig)
        if "slug" in msg:
            raise AppError(409, "slug_taken", "Slug already in use") from None
        if "sku" in msg:
            raise AppError(409, "sku_taken", "SKU already in use") from None
        if "foreign key" in msg.lower():
            raise AppError(409, "in_use", "Referenced by other records") from None
        raise


# ---------- categories ----------


@router.get("/categories", response_model=list[CategoryAdminOut])
async def list_categories(db: DB, _: Editor):
    return await svc.all_categories(db, active_only=False)


@router.post("/categories", response_model=CategoryAdminOut, status_code=201)
async def create_category(data: CategoryIn, db: DB, user: Editor, request: Request):
    if data.parent_id is not None:
        await _get(db, Category, data.parent_id)
    values = _dump(data)
    values["slug"] = data.slug or await svc.unique_slug(
        db, Category, svc.make_slug(data.name["ru"])
    )
    cat = Category(**values)
    db.add(cat)
    await db.flush()
    await record(db, user, "category.create", "category", cat.id, values, request)
    await _commit(db)
    return cat


@router.patch("/categories/{cat_id}", response_model=CategoryAdminOut)
async def update_category(cat_id: int, data: CategoryPatch, db: DB, user: Editor, request: Request):
    cat = await _get(db, Category, cat_id)
    values = _dump(data)
    if "parent_id" in values:
        if values["parent_id"] is not None:
            await _get(db, Category, values["parent_id"])
        await svc.assert_no_cycle(db, cat.id, values["parent_id"])
    for k, v in values.items():
        setattr(cat, k, v)
    await record(db, user, "category.update", "category", cat.id, values, request)
    await _commit(db)
    await db.refresh(cat)
    return cat


@router.delete("/categories/{cat_id}", status_code=204)
async def delete_category(cat_id: int, db: DB, user: Editor, request: Request):
    cat = await _get(db, Category, cat_id)
    has_children = await db.scalar(select(func.count()).where(Category.parent_id == cat.id))
    has_products = await db.scalar(select(func.count()).where(Product.category_id == cat.id))
    if has_children or has_products:
        raise AppError(409, "in_use", "Category has subcategories or products")
    await db.delete(cat)
    await record(db, user, "category.delete", "category", cat_id, {"slug": cat.slug}, request)
    await _commit(db)


# ---------- brands ----------


@router.get("/brands", response_model=list[BrandAdminOut])
async def list_brands(db: DB, _: Editor):
    return list(await db.scalars(select(Brand).order_by(Brand.name)))


@router.post("/brands", response_model=BrandAdminOut, status_code=201)
async def create_brand(data: BrandIn, db: DB, user: Editor, request: Request):
    values = _dump(data)
    values["slug"] = data.slug or await svc.unique_slug(db, Brand, svc.make_slug(data.name))
    brand = Brand(**values)
    db.add(brand)
    await db.flush()
    await record(db, user, "brand.create", "brand", brand.id, values, request)
    await _commit(db)
    return brand


@router.patch("/brands/{brand_id}", response_model=BrandAdminOut)
async def update_brand(brand_id: int, data: BrandPatch, db: DB, user: Editor, request: Request):
    brand = await _get(db, Brand, brand_id)
    values = _dump(data)
    for k, v in values.items():
        setattr(brand, k, v)
    await record(db, user, "brand.update", "brand", brand.id, values, request)
    await _commit(db)
    await db.refresh(brand)
    return brand


@router.delete("/brands/{brand_id}", status_code=204)
async def delete_brand(brand_id: int, db: DB, user: Editor, request: Request):
    brand = await _get(db, Brand, brand_id)
    await db.delete(brand)  # products keep existing with brand_id = NULL
    await record(db, user, "brand.delete", "brand", brand_id, {"slug": brand.slug}, request)
    await _commit(db)


# ---------- products ----------


@router.get("/products", response_model=Page[ProductAdminOut])
async def list_products(
    db: DB,
    _: Editor,
    q: Annotated[str | None, Query(max_length=100)] = None,
    category_id: int | None = None,
    brand_id: int | None = None,
    is_active: bool | None = None,
    low_stock: bool | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    per_page: Annotated[int, Query(ge=1, le=100)] = 25,
):
    stmt = select(Product)
    if q:
        pattern = f"%{svc.escape_like(q)}%"
        stmt = stmt.where(
            or_(
                Product.name["ru"].astext.ilike(pattern, escape="\\"),
                Product.sku.ilike(pattern, escape="\\"),
                Product.slug.ilike(pattern, escape="\\"),
            )
        )
    if category_id is not None:
        stmt = stmt.where(Product.category_id == category_id)
    if brand_id is not None:
        stmt = stmt.where(Product.brand_id == brand_id)
    if is_active is not None:
        stmt = stmt.where(Product.is_active == is_active)
    if low_stock:
        stmt = stmt.where(Product.stock <= svc.LOW_STOCK)
    stmt = stmt.order_by(Product.updated_at.desc(), Product.id.desc())
    items, total = await svc.paginate(db, stmt, page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page)


@router.get("/products/{product_id}", response_model=ProductAdminOut)
async def get_product(product_id: int, db: DB, _: Editor):
    return await _get(db, Product, product_id)


async def _check_refs(db, category_id: int | None, brand_id: int | None) -> None:
    if category_id is not None:
        await _get(db, Category, category_id)
    if brand_id is not None:
        await _get(db, Brand, brand_id)


@router.post("/products", response_model=ProductAdminOut, status_code=201)
async def create_product(data: ProductIn, db: DB, user: Editor, request: Request):
    await _check_refs(db, data.category_id, data.brand_id)
    values = _dump(data)
    values["slug"] = data.slug or await svc.unique_slug(db, Product, svc.make_slug(data.name["ru"]))
    product = Product(**values)
    db.add(product)
    await db.flush()
    await record(db, user, "product.create", "product", product.id, values, request)
    await _commit(db)
    await db.refresh(product)
    return product


@router.patch("/products/{product_id}", response_model=ProductAdminOut)
async def update_product(
    product_id: int, data: ProductPatch, db: DB, user: Editor, request: Request
):
    product = await _get(db, Product, product_id)
    values = _dump(data)
    await _check_refs(db, values.get("category_id"), values.get("brand_id"))
    price = values.get("price_minor", product.price_minor)
    old = values.get("old_price_minor", product.old_price_minor)
    if old is not None and old <= price:
        raise AppError(422, "invalid_old_price", "Old price must exceed price")
    for field in ("name", "category_id", "price_minor", "is_active"):
        if field in values and values[field] is None:
            raise AppError(422, "required_field", f"{field} cannot be null")
    for k, v in values.items():
        setattr(product, k, v)
    await record(db, user, "product.update", "product", product.id, values, request)
    await _commit(db)
    await db.refresh(product)
    return product


@router.post("/products/{product_id}/stock", response_model=ProductAdminOut)
async def adjust_stock(
    product_id: int, data: StockAdjustIn, db: DB, user: Editor, request: Request
):
    product = await db.scalar(
        select(Product).where(Product.id == product_id).with_for_update(of=Product)
    )
    if product is None:
        raise AppError(404, "not_found", "Product not found")
    new_stock = product.stock + data.delta
    if new_stock < 0:
        raise AppError(422, "negative_stock", "Stock cannot go below zero")
    before = product.stock
    product.stock = new_stock
    await record(
        db,
        user,
        "product.stock",
        "product",
        product.id,
        {"before": before, "after": new_stock, "reason": data.reason},
        request,
    )
    await _commit(db)
    await db.refresh(product)
    return product


@router.delete("/products/{product_id}", status_code=204)
async def delete_product(product_id: int, db: DB, user: Editor, request: Request):
    product = await _get(db, Product, product_id)
    ordered = await db.scalar(select(func.count()).where(OrderItem.product_id == product.id))
    if ordered:
        raise AppError(409, "in_use", "Product has orders; deactivate it instead")
    await db.delete(product)
    await record(db, user, "product.delete", "product", product_id, {"slug": product.slug}, request)
    await _commit(db)
