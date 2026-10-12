"""DEV ONLY — fills a LOCAL database with demo catalog data for storefront testing.

Never run against production. Contains no contact data; product names/prices are
illustrative placeholders, not the real assortment.

    cd apps/api && uv run python ../web/scripts/dev_seed.py

Idempotent: rows whose slug already exists are skipped.
"""

import asyncio
import os
import random
import sys

sys.path.insert(0, os.getcwd())  # run from apps/api so `app` is importable

from sqlalchemy import select  # noqa: E402

from app.core.config import get_settings  # noqa: E402
from app.core.db import SessionLocal  # noqa: E402
from app.models import Brand, Category, Product  # noqa: E402

if get_settings().env == "prod":
    sys.exit("Refusing to seed: COOFIX_ENV=prod")

random.seed(42)

TREE = {
    ("elektroinstrument", "Электроинструмент"): [
        ("dreli-shurupoverty", "Дрели и шуруповёрты"),
        ("perforatory", "Перфораторы"),
        ("shlifmashiny", "Шлифовальные машины"),
        ("pily", "Пилы и лобзики"),
    ],
    ("akkumulyatornyj", "Аккумуляторный инструмент"): [
        ("akb-i-zaryadki", "Аккумуляторы и зарядные устройства"),
        ("akk-gaykoverty", "Гайковёрты"),
    ],
    ("svarochnoe", "Сварочное оборудование"): [
        ("svarochnye-invertory", "Сварочные инверторы"),
        ("maski", "Маски сварщика"),
    ],
    ("ruchnoj-instrument", "Ручной инструмент"): [
        ("nabory", "Наборы инструментов"),
        ("klyuchi", "Ключи"),
    ],
    ("sadovaya-tehnika", "Садовая техника"): [
        ("trimmery", "Триммеры"),
        ("vozduhoduvki", "Воздуходувки"),
    ],
    ("elektrika", "Электрооборудование"): [
        ("udliniteli", "Удлинители"),
        ("stabilizatory", "Стабилизаторы"),
    ],
}

BRANDS = [("coofix", "COOFIX"), ("coofix-pro", "COOFIX PRO"), ("tigerline", "Tigerline")]

PRODUCTS = {
    "dreli-shurupoverty": [
        ("Дрель ударная 850 Вт", 499000, {"Мощность": "850 Вт", "Патрон": "13 мм", "Обороты": "0–3000 об/мин"}),
        ("Шуруповёрт аккумуляторный 18 В, 2 АКБ", 899000, {"Напряжение": "18 В", "Крутящий момент": "45 Н·м", "Ёмкость АКБ": "2 Ач"}),
        ("Дрель-миксер 1400 Вт", 749000, {"Мощность": "1400 Вт", "Патрон": "M14"}),
    ],
    "perforatory": [
        ("Перфоратор SDS-plus 800 Вт", 799000, {"Энергия удара": "3 Дж", "Патрон": "SDS-plus", "Режимы": "3"}),
        ("Перфоратор SDS-max 1500 Вт", 1899000, {"Энергия удара": "10 Дж", "Патрон": "SDS-max"}),
    ],
    "shlifmashiny": [
        ("УШМ 125 мм, 1000 Вт", 459000, {"Диаметр диска": "125 мм", "Мощность": "1000 Вт"}),
        ("УШМ 230 мм, 2400 Вт", 1129000, {"Диаметр диска": "230 мм", "Мощность": "2400 Вт"}),
        ("Полировальная машина 1200 Вт", 869000, {"Диаметр": "180 мм", "Обороты": "600–3000 об/мин"}),
    ],
    "pily": [
        ("Пила циркулярная 1600 Вт", 989000, {"Диаметр диска": "190 мм", "Глубина реза": "65 мм"}),
        ("Лобзик электрический 650 Вт", 529000, {"Ход пилки": "20 мм", "Маятник": "4 положения"}),
        ("Пила торцовочная 1800 Вт", 2149000, {"Диаметр диска": "255 мм"}),
    ],
    "akb-i-zaryadki": [
        ("Аккумулятор 18 В, 4 Ач", 349000, {"Напряжение": "18 В", "Ёмкость": "4 Ач", "Тип": "Li-Ion"}),
        ("Зарядное устройство быстрое 18 В", 249000, {"Ток зарядки": "4 А"}),
    ],
    "akk-gaykoverty": [
        ("Гайковёрт ударный 18 В, 400 Н·м", 1249000, {"Крутящий момент": "400 Н·м", "Посадка": "1/2\""}),
    ],
    "svarochnye-invertory": [
        ("Сварочный инвертор 200 А", 1099000, {"Ток": "20–200 А", "Электрод": "1,6–4 мм"}),
        ("Полуавтомат MIG 180", 2299000, {"Ток": "40–180 А", "Проволока": "0,6–1,0 мм"}),
    ],
    "maski": [
        ("Маска сварщика Хамелеон", 259000, {"Затемнение": "DIN 9–13", "Датчики": "2"}),
    ],
    "nabory": [
        ("Набор инструментов 108 предметов", 649000, {"Предметов": "108", "Кейс": "Пластиковый"}),
        ("Набор бит и свёрл 45 предметов", 159000, {"Предметов": "45"}),
    ],
    "klyuchi": [
        ("Набор комбинированных ключей 8–22 мм", 289000, {"Размеры": "8–22 мм", "Сталь": "CrV"}),
    ],
    "trimmery": [
        ("Триммер бензиновый 1,9 л.с.", 1349000, {"Мощность": "1,9 л.с.", "Ширина скоса": "42 см"}),
        ("Триммер электрический 1200 Вт", 699000, {"Мощность": "1200 Вт"}),
    ],
    "vozduhoduvki": [
        ("Воздуходувка-пылесос 3000 Вт", 589000, {"Мощность": "3000 Вт", "Мешок": "45 л"}),
    ],
    "udliniteli": [
        ("Удлинитель на катушке 30 м", 349000, {"Длина": "30 м", "Сечение": "3×1,5 мм²"}),
    ],
    "stabilizatory": [
        ("Стабилизатор напряжения 5 кВт", 1599000, {"Мощность": "5000 ВА", "Точность": "±8%"}),
    ],
}


def slugify(text: str, idx: int) -> str:
    table = str.maketrans(
        {
            "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e", "ж": "zh",
            "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o",
            "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ф": "f", "х": "h", "ц": "c",
            "ч": "ch", "ш": "sh", "щ": "sch", "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu",
            "я": "ya",
        }
    )
    s = text.lower().translate(table)
    out = "".join(c if c.isalnum() else "-" for c in s)
    while "--" in out:
        out = out.replace("--", "-")
    return f"{out.strip('-')[:80]}-{idx}"


async def main() -> None:
    async with SessionLocal() as db:
        cats: dict[str, Category] = {
            c.slug: c for c in await db.scalars(select(Category))
        }
        for order, ((root_slug, root_name), children) in enumerate(TREE.items()):
            if root_slug not in cats:
                root = Category(slug=root_slug, name={"ru": root_name}, sort_order=order,
                                description={"ru": f"{root_name} для профессионалов и дома."})
                db.add(root)
                await db.flush()
                cats[root_slug] = root
            for ch_order, (slug, name) in enumerate(children):
                if slug not in cats:
                    c = Category(slug=slug, name={"ru": name}, parent_id=cats[root_slug].id,
                                 sort_order=ch_order)
                    db.add(c)
                    await db.flush()
                    cats[slug] = c

        brands = {b.slug: b for b in await db.scalars(select(Brand))}
        for slug, name in BRANDS:
            if slug not in brands:
                b = Brand(slug=slug, name=name)
                db.add(b)
                await db.flush()
                brands[slug] = b

        existing = set(await db.scalars(select(Product.slug)))
        idx = 0
        for cat_slug, items in PRODUCTS.items():
            for name, price, attrs in items:
                idx += 1
                slug = slugify(name, idx)
                if slug in existing:
                    continue
                roll = idx % 7
                stock = 0 if roll == 3 else (3 if roll == 5 else random.randint(8, 120))
                old = int(price * 1.18) // 100 * 100 if idx % 4 == 0 else None
                brand = brands["coofix-pro" if price > 1000000 else "coofix"]
                if idx % 9 == 0:
                    brand = brands["tigerline"]
                db.add(
                    Product(
                        slug=slug,
                        sku=f"CF-{1000 + idx}",
                        name={"ru": f"COOFIX {name}"},
                        description={
                            "ru": f"{name} — надёжный инструмент для ежедневной работы.\n"
                            "Демонстрационное описание для локальной разработки."
                        },
                        category_id=cats[cat_slug].id,
                        brand_id=brand.id,
                        price_minor=price,
                        old_price_minor=old,
                        stock=stock,
                        images=[],
                        attributes={**attrs, "Гарантия": "12 месяцев", "Страна бренда": "Китай"},
                        is_new=idx % 5 == 0,
                        is_hit=idx % 3 == 0,
                        rating_count=random.randint(0, 40),
                    )
                )
        await db.commit()
    print("dev seed: done")


if __name__ == "__main__":
    asyncio.run(main())
