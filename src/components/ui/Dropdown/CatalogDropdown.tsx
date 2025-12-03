"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FiChevronRight, FiMenu } from "react-icons/fi";
import clsx from "clsx";

interface Subcategory {
  id: string;
  name: string;
  href: string;
}

interface Category {
  id: string;
  name: string;
  href: string;
  subcategories: Subcategory[];
}

// Sizning avvalgi javobingizdagi to'liq katalog ma'lumotlari shu yerda saqlangan
const categories: Category[] = [
  // ... (Katalog ma'lumotlari joylashgan qismi)
  {
    id: "elektroinstrumenty",
    name: "Электроинструмент",
    href: "/catalog?category=elektroinstrumenty",
    subcategories: [
      {
        id: "akk-dreli",
        name: "Аккумуляторные дрели и шуруповерты",
        href: "/catalog?category=elektroinstrumenty&sub=akk-dreli",
      },
      {
        id: "akk-pily",
        name: "Аккумуляторные пилы (Цепные, Сабельные, Циркулярные)",
        href: "/catalog?category=elektroinstrumenty&sub=akk-pily",
      },
      {
        id: "akk-ushm",
        name: "Аккумуляторные УШМ и шлифмашины",
        href: "/catalog?category=elektroinstrumenty&sub=akk-ushm",
      },
      {
        id: "akk-perforatory",
        name: "Аккумуляторные перфораторы",
        href: "/catalog?category=elektroinstrumenty&sub=akk-perforatory",
      },
      {
        id: "akk-gaykoverty",
        name: "Аккумуляторные гайковерты и винтоверты",
        href: "/catalog?category=elektroinstrumenty&sub=akk-gaykoverty",
      },
      {
        id: "akk-osnastka",
        name: "Аккумуляторные батареи и зарядные устройства",
        href: "/catalog?category=elektroinstrumenty&sub=akk-osnastka",
      },
      {
        id: "akk-prochie",
        name: "Прочий аккумуляторный инструмент (Лобзики, Отвертки, МФИ, Фонари)",
        href: "/catalog?category=elektroinstrumenty&sub=akk-prochie",
      },
      // Электроинструменты
      {
        id: "dreli-setevye",
        name: "Дрели, шуруповерты и миксеры (сетевые)",
        href: "/catalog?category=elektroinstrumenty&sub=dreli-setevye",
      },
      {
        id: "setevye-ushm",
        name: "Шлифовальные машины и УШМ (сетевые)",
        href: "/catalog?category=elektroinstrumenty&sub=setevye-ushm",
      },
      {
        id: "perforatory-setevye",
        name: "Перфораторы (сетевые)",
        href: "/catalog?category=elektroinstrumenty&sub=perforatory-setevye",
      },
      {
        id: "pily-setevye",
        name: "Пилы, лобзики и рубанки (сетевые)",
        href: "/catalog?category=elektroinstrumenty&sub=pily-setevye",
      },
      {
        id: "stanki-setevye",
        name: "Станки",
        href: "/catalog?category=elektroinstrumenty&sub=stanki-setevye",
      },
      {
        id: "feny",
        name: "Фены технические",
        href: "/catalog?category=elektroinstrumenty&sub=feny",
      },
    ],
  },
  {
    id: "sadovaya-i-stroitelnaya-tekhnika",
    name: "Садовая, строительная и уборочная техника",
    href: "/catalog?category=sadovaya-i-stroitelnaya-tekhnika",
    subcategories: [
      {
        id: "gazon",
        name: "Газонокосилки и Триммеры",
        href: "/catalog?category=sadovaya-i-stroitelnaya-tekhnika&sub=gazon",
      },
      {
        id: "kustorezy",
        name: "Кусторезы, Высоторезы и Измельчители",
        href: "/catalog?category=sadovaya-i-stroitelnaya-tekhnika&sub=kustorezy",
      },
      {
        id: "moto",
        name: "Мотобуры, Мотоблоки и навесное оборудование",
        href: "/catalog?category=sadovaya-i-stroitelnaya-tekhnika&sub=moto",
      },
      {
        id: "sneg",
        name: "Снегоуборщики",
        href: "/catalog?category=sadovaya-i-stroitelnaya-tekhnika&sub=sneg",
      },
      {
        id: "uborochnaya",
        name: "Воздуходувки, Собиратели листьев, Плeсос",
        href: "/catalog?category=sadovaya-i-stroitelnaya-tekhnika&sub=uborochnaya",
      },
      {
        id: "stroitelnaya-tekhnika",
        name: "Бетоносмесители и Виброплиты",
        href: "/catalog?category=sadovaya-i-stroitelnaya-tekhnika&sub=stroitelnaya-tekhnika",
      },
      {
        id: "prochee-sadovoe",
        name: "Тачки, Сеялки, Опрыскиватели, Скарификаторы",
        href: "/catalog?category=sadovaya-i-stroitelnaya-tekhnika&sub=prochee-sadovoe",
      },
      {
        id: "moyka-benzo",
        name: "Моечное оборудование и Бензорезы",
        href: "/catalog?category=sadovaya-i-stroitelnaya-tekhnika&sub=moyka-benzo",
      },
      {
        id: "sadovie-aksessuary",
        name: "Аксессуары для садовой и уборочной техники",
        href: "/catalog?category=sadovaya-i-stroitelnaya-tekhnika&sub=sadovie-aksessuary",
      },
    ],
  },
  {
    id: "ruchnoi-i-izmeritelnyi",
    name: "Ручной и Измерительный инструмент",
    href: "/catalog?category=ruchnoi-i-izmeritelnyi",
    subcategories: [
      {
        id: "izmeritelnyi",
        name: "Измерительные инструменты (Уровни, Дальномеры, Рулетки)",
        href: "/catalog?category=ruchnoi-i-izmeritelnyi&sub=izmeritelnyi",
      },
      {
        id: "sharnirno-gubcevyi",
        name: "Шарнирно-губцевый инструмент (Плоскогубцы, Бокорезы, Клещи)",
        href: "/catalog?category=ruchnoi-i-izmeritelnyi&sub=sharnirno-gubcevyi",
      },
      {
        id: "klyuchi",
        name: "Ключи (Разводные, Трещотки, Имбусовые)",
        href: "/catalog?category=ruchnoi-i-izmeritelnyi&sub=klyuchi",
      },
      {
        id: "udarnyi",
        name: "Ударный инструмент (Молотки, Кувалды, Топоры, Киянки)",
        href: "/catalog?category=ruchnoi-i-izmeritelnyi&sub=udarnyi",
      },
      {
        id: "rezhushchiy",
        name: "Режущий инструмент (Ножовки, Ножницы по металлу, Сучкорезы)",
        href: "/catalog?category=ruchnoi-i-izmeritelnyi&sub=rezhushchiy",
      },
      {
        id: "instrument-prochee",
        name: "Прочий ручной инструмент (Отвертки, Тиски, Струбцины, Степлеры)",
        href: "/catalog?category=ruchnoi-i-izmeritelnyi&sub=instrument-prochee",
      },
      {
        id: "nabory",
        name: "Наборы инструментов",
        href: "/catalog?category=ruchnoi-i-izmeritelnyi&sub=nabory",
      },
    ],
  },
  {
    id: "spetsialnoe-oborudovanie",
    name: "Специальное оборудование",
    href: "/catalog?category=spetsialnoe-oborudovanie",
    subcategories: [
      {
        id: "generatory",
        name: "Генераторы (Бензиновые, Дизельные, Инверторные) и аксессуары",
        href: "/catalog?category=spetsialnoe-oborudovanie&sub=generatory",
      },
      {
        id: "svarochnoe",
        name: "Сварочное оборудование (Аппараты, Маски, Паяльники)",
        href: "/catalog?category=spetsialnoe-oborudovanie&sub=svarochnoe",
      },
      {
        id: "nasosnoe",
        name: "Насосное оборудование (Погружные, Скважинные, Мотопомпы)",
        href: "/catalog?category=spetsialnoe-oborudovanie&sub=nasosnoe",
      },
      {
        id: "kompressory",
        name: "Компрессоры (Поршневые, Ременные)",
        href: "/catalog?category=spetsialnoe-oborudovanie&sub=kompressory",
      },
      {
        id: "pnevmoinstrument",
        name: "Пневмоинструмент (Гайковерты, Дрели, Краскораспылители, Нейлеры)",
        href: "/catalog?category=spetsialnoe-oborudovanie&sub=pnevmoinstrument",
      },
      {
        id: "otopitelnoe",
        name: "Отопительное оборудование (Тепловые пушки, Конвекторы)",
        href: "/catalog?category=spetsialnoe-oborudovanie&sub=otopitelnoe",
      },
      {
        id: "avtomobilnoe",
        name: "Автомобильное оборудование (Домкраты, Компрессоры, Лебедки)",
        href: "/catalog?category=spetsialnoe-oborudovanie&sub=avtomobilnoe",
      },
      {
        id: "telefery",
        name: "Тельферы электрические",
        href: "/catalog?category=spetsialnoe-oborudovanie&sub=telefery",
      },
      {
        id: "elektrika",
        name: "Электрика (Сетевые удлинители, Шнуры)",
        href: "/catalog?category=spetsialnoe-oborudovanie&sub=elektrika",
      },
    ],
  },
  {
    id: "rashodnye-materialy",
    name: "Расходные материалы и Аксессуары",
    href: "/catalog?category=rashodnye-materialy",
    subcategories: [
      {
        id: "pylesosy",
        name: "Пылесосы строительные и Аксессуары",
        href: "/catalog?category=rashodnye-materialy&sub=pylesosy",
      },
      {
        id: "sumki",
        name: "Сумки, Рюкзаки и Пояса для инструмента (Хранение)",
        href: "/catalog?category=rashodnye-materialy&sub=sumki",
      },
      {
        id: "dvigateli",
        name: "Двигатели (Прочие инструменты)",
        href: "/catalog?category=rashodnye-materialy&sub=dvigateli",
      },
      {
        id: "osnastka",
        name: "Оснастка для инструмента (сверла, диски, абразивы)",
        href: "/catalog?category=rashodnye-materialy&sub=osnastka",
      },
    ],
  },
  {
    id: "siz-i-spetsodezhda",
    name: "Спецодежда и СИЗ",
    href: "/catalog?category=siz-i-spetsodezhda",
    subcategories: [
      {
        id: "zashchita-golovy",
        name: "Защита головы (Каски, Щитки)",
        href: "/catalog?category=siz-i-spetsodezhda&sub=zashchita-golovy",
      },
      {
        id: "zashchita-ruk",
        name: "Средства защиты рук (Перчатки)",
        href: "/catalog?category=siz-i-spetsodezhda&sub=zashchita-ruk",
      },
      {
        id: "zashchita-glaz",
        name: "Очки защитные",
        href: "/catalog?category=siz-i-spetsodezhda&sub=zashchita-glaz",
      },
      {
        id: "odezhda",
        name: "Одежда (Брюки, Куртки, Полукомбинезоны)",
        href: "/catalog?category=siz-i-spetsodezhda&sub=odezhda",
      },
    ],
  },
];

export function CatalogDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // setSelectedSubcategory ni o'chirib tashladim, chunki u faqat vizual effekt uchun ishlatilgan, 
  // ammo funksional jihatdan kerak emas edi.
  // const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null); 

  const hoveredCategoryData = categories.find(
    (cat) => cat.id === hoveredCategory
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHoveredCategory(null);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleCategoryMouseEnter = (categoryId: string) => {
    setHoveredCategory(categoryId);
  };

  // Subkategoriyalarni teng ikkiga ajratish funksiyasi
  const splitSubcategories = (subcategories: Subcategory[]) => {
    const mid = Math.ceil(subcategories.length / 2);
    return [subcategories.slice(0, mid), subcategories.slice(mid)];
  };

  return (
    <div ref={dropdownRef} className="relative h-full">
      {/* Katalog tugmasi */}
      <Link
        href="/catalog"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => {
          // Dropdownni biroz kechikish bilan yopish, sichqonchani tez harakatlantirganda yopilmasligi uchun
          setTimeout(() => {
            if (!dropdownRef.current?.matches(":hover")) {
              setIsOpen(false);
              setHoveredCategory(null);
            }
          }, 200);
        }}
        className="flex items-center gap-2 px-4 py-2 border-l-2 border border-orange text-white hover:bg-orange transition-colors rounded shrink-0 h-full"
      >
        <FiMenu size={20} />
        <span className="font-medium">Каталог товаров</span>
        <FiChevronRight
          size={16}
          className={clsx("transition-transform", isOpen && "rotate-90")}
        />
      </Link>

      {/* Dropdown Menu - Responsive Qism */}
      {isOpen && (
        <div
          // Responsive Kenglikni o'rnatish
          className={clsx(
            "absolute top-full left-0 mt-2 bg-dark rounded-lg shadow-xl z-50 flex",
            "w-max max-w-[calc(100vw-3rem)] xl:max-w-6xl" // max-w-6xl = 1152px. Kichik ekranlarda viewportdan oshmaydi.
          )}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => {
            setIsOpen(false);
            setHoveredCategory(null);
          }}
        >
          {/* Chap Sidebar - Asosiy Kategoriyalar */}
          <div className="w-64 bg-dark border-r border-gray rounded-l-lg shrink-0">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                onMouseEnter={() => handleCategoryMouseEnter(category.id)}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center justify-between px-4 py-3 text-foreground hover:bg-coal hover:text-orange transition-colors duration-150",
                  hoveredCategory === category.id &&
                    "text-orange font-medium bg-coal"
                )}
              >
                <span>{category.name}</span>
                <FiChevronRight size={16} />
              </Link>
            ))}
          </div>

          {/* O'ng Panel - Subkategoriyalar */}
          {hoveredCategoryData &&
            hoveredCategoryData.subcategories.length > 0 && (
              <div className="flex-1 bg-dark p-6 rounded-r-lg lg:w-[680px] xl:w-[1200px]">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {/* Subkategoriyalarni ikki ustunga ajratib ko'rsatish */}
                  {splitSubcategories(hoveredCategoryData.subcategories).map(
                    (column, colIndex) => (
                      <div key={colIndex} className="space-y-2">
                        {column.map((subcategory) => (
                          <Link
                            key={subcategory.id}
                            href={subcategory.href}
                            onClick={() => {
                              setIsOpen(false);
                              setHoveredCategory(null);
                            }}
                            // Subkategoriya hover effekti to'g'rilandi
                            className={clsx(
                              "block py-2 px-2 rounded text-sm text-freground transition-colors duration-150",
                              "hover:text-orange hover:bg-coal"
                            )}
                          >
                            {subcategory.name}
                          </Link>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}