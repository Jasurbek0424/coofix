"use client";

import { useEffect, useState } from "react";
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

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Replace with actual API call when news API is available
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Placeholder data - replace with actual API call
        // const response = await getNews();
        // setNews(response);
        
        // Temporary placeholder data
        setNews([
          {
            id: "1",
            title: "Новые поступления в нашем каталоге",
            date: "15 января 2024",
            excerpt: "Мы рады представить вам новую коллекцию инструментов и оборудования.",
            content: "Полный текст новости...",
          },
          {
            id: "2",
            title: "Специальные предложения на электроинструменты",
            date: "10 января 2024",
            excerpt: "Большие скидки на все электроинструменты до конца месяца.",
            content: "Полный текст новости...",
          },
        ]);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Ошибка при загрузке новостей");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: "Новости" },
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

  if (error) {
    return (
      <div className="flex-1 flex flex-col bg-background min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500 text-lg">{error}</p>
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
      
      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12">
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="text-3xl md:text-4xl font-bold text-coal dark:text-foreground mb-8">
          Новости
        </h1>

        {news.length === 0 ? (
          <EmptyState
            title="Новости отсутствуют"
            message="В данный момент новостей нет. Следите за обновлениями."
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.id}`}
                className="bg-white dark:bg-dark rounded-lg shadow-md border border-gray-200 dark:border-coal overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {item.image && (
                  <div className="relative h-48 w-full bg-gray-100 dark:bg-coal">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-coal dark:text-foreground mb-2 group-hover:text-orange transition-colors line-clamp-2">
                    {item.title}
                  </h2>
                  {item.excerpt && (
                    <p className="text-gray-smoky text-sm mb-4 line-clamp-3">
                      {item.excerpt}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.date}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
