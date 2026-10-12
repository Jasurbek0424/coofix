"use client";

import Image from "next/image";
import AdditionalBg from "@/assets/additional__bg.png";
import AdditionalBg2 from "@/assets/additional__bg2.png";

export default function FeaturesSection() {
  const features = [
    {
      id: "bonuses",
      title: "Бонусы с каждой покупки",
      description: "Копите бонусы и оплачивайте ими до 99% стоимости заказа",
      icon: (
        <svg
          className="w-12 h-12 md:w-16 md:h-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
      ),
    },
    {
      id: "service",
      title: "Клиентский сервис",
      description: "Поможем подобрать товар и ответим на все вопросы",
      icon: (
        <svg
          className="w-12 h-12 md:w-16 md:h-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      ),
    },
    {
      id: "quality",
      title: "Гарантия качества",
      description: "Многоступенчатый контроль качества на производстве",
      icon: (
        <svg
          className="w-12 h-12 md:w-16 md:h-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      id: "delivery",
      title: "Бесплатная доставка",
      description: "Доставим заказ в любую точку России точно в срок",
      icon: (
        <svg
          className="w-12 h-12 md:w-16 md:h-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 17h14M5 17V9l4-4h6l4 4v8M5 17h14"
          />
          <circle cx="7" cy="17" r="2" strokeWidth={1.5} />
          <circle cx="17" cy="17" r="2" strokeWidth={1.5} />
        </svg>
      ),
    },
    {
      id: "warehouse",
      title: "Привозим со склада",
      description: "Более 90% товаров в наличии на складе",
      icon: (
        <svg
          className="w-12 h-12 md:w-16 md:h-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m-3-8v12"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative bg-coal py-12 lg:py-16 overflow-hidden">
      {/* Decorative Background Images */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-1/2 h-full">
          <Image
            src={AdditionalBg}
            alt=""
            fill
            sizes="50vw"
            className="object-cover"
            priority={false}
          />
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full">
          <Image
            src={AdditionalBg2}
            alt=""
            fill
            sizes="50vw"
            className="object-cover"
            priority={false}
          />
        </div>
      </div>

      {/* Additional Decorative Lines Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-0 w-32 h-px bg-orange transform rotate-12"></div>
          <div className="absolute top-20 right-10 w-24 h-px bg-orange transform -rotate-12"></div>
          <div className="absolute bottom-20 left-10 w-40 h-px bg-orange transform rotate-45"></div>
          <div className="absolute bottom-10 right-0 w-28 h-px bg-orange transform -rotate-45"></div>
          <div className="absolute top-1/2 left-1/4 w-20 h-px bg-orange transform rotate-90"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-px bg-orange transform -rotate-90"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex flex-col items-center text-center group hover:transform hover:scale-105 transition-transform duration-300"
            >
              {/* Icon with gold/yellow accent */}
              <div className="mb-4 text-orange group-hover:text-orange/80 transition-colors">
                {feature.icon}
              </div>
              
              {/* Title */}
              <h3 className="text-base md:text-lg font-bold text-white mb-2 group-hover:text-orange transition-colors">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm md:text-base text-white/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
