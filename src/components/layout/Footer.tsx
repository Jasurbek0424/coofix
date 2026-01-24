"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../assets/logo.png";
import { SocialIcons } from "@/components/ui/Icons/SocialIcons";
import { getCategoriesTree } from "@/api/categories";
import type { Category } from "@/types/product";

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const categoriesTree = await getCategoriesTree().catch((error) => {
          console.error("Error fetching categories for footer:", error);
          return [];
        });
        
        if (categoriesTree && categoriesTree.length > 0) {
          // Faqat parent category'larni olish (children'ga ega bo'lganlar)
          const parentCategories = categoriesTree.filter(
            (category) => category.children && category.children.length > 0
          );
          
          // Show first 7 parent categories in footer
          const footerCategories = parentCategories.slice(0, 7);
          setCategories(footerCategories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories for footer:", error);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

 
  
  return (
    <footer className="bg-coal text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Product Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-smoky">
              Каталог
            </h3>
            {isLoading ? (
              <ul className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <li key={i} className="h-5 bg-gray-600/30 rounded animate-pulse" />
                ))}
              </ul>
            ) : categories.length > 0 ? (
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category._id}>
                    <Link
                      href={`/catalog?category=${category.slug}`}
                      className="text-gray-smoky hover:text-orange transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-smoky text-sm">Категории не найдены</p>
            )}
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
              <li>
                <Link
                  href="/payment-delivery"
                  className="text-gray-smoky hover:text-orange transition-colors"
                >
                  Оплата и доставка
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
                href="tel:+79267370337"
                className="block text-gray-smoky hover:text-orange transition-colors"
              >
                +7(926)737-03-37
              </a>
              <a
                href="tel:+74951203215"
                className="block text-gray-smoky hover:text-orange transition-colors"
              >
                +7(996)990-00-94
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
