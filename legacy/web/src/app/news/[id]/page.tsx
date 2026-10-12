"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Loader } from "@/components/shared/Loader";
import { EmptyState } from "@/components/shared/EmptyState";

interface NewsItem {
  id: string;
  title: string;
  date: string;
  image?: string;
  excerpt?: string;
  content?: string;
}

export default function NewsDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsItem = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // TODO: Replace with actual API call when news API is available
        // const response = await getNewsById(id);
        // setNewsItem(response);
        
        // Temporary placeholder data - replace with actual API
        const mockNews: NewsItem[] = [
          {
            id: "1",
            title: "Новые поступления в нашем каталоге",
            date: "12 января 2026",
            excerpt: "Мы рады представить вам новую коллекцию инструментов и оборудования.",
            content: "Полный текст новости... Мы рады представить вам новую коллекцию инструментов и оборудования. В этом обновлении вы найдете множество новых продуктов от ведущих производителей.",
          },
          {
            id: "2",
            title: "Специальные предложения на электроинструменты",
            date: "9 января 2026",
            excerpt: "Большие скидки на все электроинструменты до конца месяца.",
            content: "Полный текст новости... Большие скидки на все электроинструменты до конца месяца. Не упустите возможность приобрести качественные инструменты по выгодным ценам.",
          },
          {
            id: "3",
            title: "Новинки сезона 2026",
            date: "7 января 2026",
            excerpt: "Представляем обновленную линейку продукции для оптовых покупок на 2026 год.",
            content: "Полный текст новости... Представляем обновленную линейку продукции на 2024 год. Новые модели сочетают в себе надежность, качество и инновационные технологии.",
          },
          {
            id: "4",
            title: "Скидки на садовые инструменты",
            date: "6 января 2026",
            excerpt: "Специальные цены на все садовые инструменты и оборудование.",
            content: "Полный текст новости... Специальные цены на все садовые инструменты и оборудование. Идеальное время для подготовки к новому сезону.",
          },
        ];
        
        const item = mockNews.find((n) => n.id === id);
        if (item) {
          setNewsItem(item);
        } else {
          setError("Новость не найдена");
        }
      } catch (err) {
        console.error("Error fetching news item:", err);
        setError("Ошибка при загрузке новости");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchNewsItem();
    }
  }, [id]);

  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: "Новости", href: "/news" },
    { label: newsItem?.title || "Загрузка..." },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col bg-background min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" />
        </div>
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className="flex-1 flex flex-col bg-background min-h-screen">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8 lg:py-12">
          <Breadcrumbs items={breadcrumbs} />
          <EmptyState
            title={error || "Новость не найдена"}
            message="Попробуйте вернуться на страницу новостей"
            icon={
              <svg
                className="w-16 h-16 text-gray-300 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            }
          />
          <div className="text-center mt-6">
            <Link
              href="/news"
              className="inline-block px-6 py-3 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors"
            >
              Вернуться к новостям
            </Link>
          </div>
        </div>
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12 max-w-4xl">
        <Breadcrumbs items={breadcrumbs} />
        
        <article className="bg-white dark:bg-dark rounded-lg shadow-md border border-gray-200 dark:border-coal overflow-hidden">
          {newsItem.image && (
            <div className="relative h-64 md:h-96 w-full bg-gray-100 dark:bg-coal">
              <Image
                src={newsItem.image}
                alt={newsItem.title}
                fill
                sizes="(max-width: 768px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          )}
          
          <div className="p-6 md:p-8">
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {newsItem.date}
              </p>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-coal dark:text-foreground mb-6">
              {newsItem.title}
            </h1>
            
            {newsItem.excerpt && (
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 font-medium">
                {newsItem.excerpt}
              </p>
            )}
            
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p className="text-gray-smoky leading-relaxed whitespace-pre-line">
                {newsItem.content || newsItem.excerpt}
              </p>
            </div>
          </div>
        </article>
        
        <div className="mt-8 text-center">
          <Link
            href="/news"
            className="inline-block px-6 py-3 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors"
          >
            ← Вернуться к новостям
          </Link>
        </div>
      </main>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
