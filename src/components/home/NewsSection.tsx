"use client";

import Link from "next/link";
import Image from "next/image";
import { StaticImageData } from "next/image";
import { Button } from "@/components/ui/Buttons/Button";
import HeroMain from "@/assets/hero__main copy.jpg";
import HeroMain2 from "@/assets/hero__main_2.jpg";
import PrevCoofix from "@/assets/prew__coofix.jpg";

interface NewsItem {
  id: string;
  title: string;
  date: string;
  image?: string | StaticImageData;
  excerpt?: string;
}

interface NewsSectionProps {
  news?: NewsItem[];
  title?: string;
}

const defaultNews: NewsItem[] = [
  {
    id: "1",
    title: "Название новости",
    date: "12 января 2023",
    image: PrevCoofix,
  },
  {
    id: "2",
    title: "Название новости",
    date: "12 января 2023",
    image: HeroMain2,
  },
  {
    id: "3",
    title: "Название новости",
    date: "12 января 2023",
    image: HeroMain,
  },
  {
    id: "4",
    title: "Название новости",
    date: "12 января 2023",
    image: PrevCoofix,
  },
];

export default function NewsSection({
  news = defaultNews,
  title = "Новости",
}: NewsSectionProps) {
  return (
    <section className="bg-white dark:bg-dark py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Title and Description */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-coal dark:text-foreground">
              {title}
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 text-lg">
              <p>
                Следите за последними новостями и обновлениями в мире инструментов.
                Узнавайте о новых поступлениях, специальных предложениях и полезных
                советах.
              </p>
            </div>
            <Link href="/news">
              <Button variant="primary">ПЕРЕЙТИ К НОВОСТЯМ</Button>
            </Link>
          </div>

          {/* Right: News Grid */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-coal dark:text-foreground">
                Последние новости
              </h3>
              <Link
                href="/news"
                className="text-orange hover:text-orange/80 font-medium transition-colors"
              >
                Смотреть все →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {news.slice(0, 4).map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="group block"
                >
                  <div className="relative h-32 md:h-40 rounded-lg overflow-hidden bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 mb-2">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl">
                        📰
                      </div>
                    )}
                  </div>
                  <h4 className="text-sm md:text-base font-semibold text-coal dark:text-foreground group-hover:text-orange transition-colors mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    {item.date}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

