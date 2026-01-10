"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "../../assets/logo.png";
import { SocialIcons } from "@/components/ui/Icons/SocialIcons";

export default function Footer() {
  return (
    <footer className="bg-coal text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Product Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-smoky">
              Каталог
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/catalog?category=malyarnye-tovary"
                  className="text-gray-smoky hover:text-orange transition-colors"
                >
                  Малярные товары
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?category=elektrooborudovanie"
                  className="text-gray-smoky hover:text-orange transition-colors"
                >
                  Электрооборудование
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?category=specodezhda"
                  className="text-gray-smoky hover:text-orange transition-colors"
                >
                  Спецодежда
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?category=dlya-doma-i-dachi"
                  className="text-gray-smoky hover:text-orange transition-colors"
                >
                  Для дома и дачи
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?category=sezonnoe"
                  className="text-gray-smoky hover:text-orange transition-colors"
                >
                  Сезонное
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?category=instrument"
                  className="text-gray-smoky hover:text-orange transition-colors"
                >
                  Инструмент
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Company Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-smoky">
              Компания
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-smoky hover:text-orange transition-colors"
                >
                  О компании
                </Link>
              </li>
              <li>
                <Link
                  href="/contacts"
                  className="text-gray-smoky hover:text-orange transition-colors"
                >
                  Контакты
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="text-gray-smoky hover:text-orange transition-colors"
                >
                  Новинки
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?filter=hits"
                  className="text-gray-smoky hover:text-orange transition-colors"
                >
                  Хиты сезона
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?filter=sale"
                  className="text-gray-smoky hover:text-orange transition-colors"
                >
                  Распродажи
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Logo and Contact Information */}
          <div>
            <div className="mb-6">
              <Image
                src={Logo}
                alt="COOFIX Logo"
                width={150}
                height={50}
                className="h-auto"
                priority
              />
            </div>
            <div className="space-y-2">
              <a
                href="tel:+74951203214"
                className="block text-gray-smoky hover:text-orange transition-colors"
              >
                +7 495 120-32-14
              </a>
              <a
                href="tel:+74951203215"
                className="block text-gray-smoky hover:text-orange transition-colors"
              >
                +7 495 120-32-15
              </a>
            </div>
          </div>

          {/* Column 4: Social Media and Legal Information */}
          <div>
            <div className="mb-6">
              <SocialIcons variant="footer" iconSize={20} />
            </div>
            <div className="space-y-2">
              <Link
                href="/user-agreement"
                className="block text-gray-smoky hover:text-orange transition-colors text-sm"
              >
                Соглашение пользователя
              </Link>
              <p className="text-gray-smoky text-sm">
                Copyright © COOFIX {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
