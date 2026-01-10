"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Buttons/Button";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import HeroMain from "@/assets/hero__main copy.jpg";
import HeroMain2 from "@/assets/hero__main_2.jpg";
import PrevCoofix from "@/assets/prew__coofix.jpg";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: string | any; // Allow both string paths and imported images
  link: string;
  buttonText?: string;
}

interface HeroBannerProps {
  mainBanners?: Banner[];
  sideBanners?: Banner[];
}

const defaultMainBanners: Banner[] = [
  {
    id: "1",
    title: "Coofix - Инструмент с настоящим характером",
    image: HeroMain, 
    link: "/catalog",
    buttonText: "ПЕРЕЙТИ В КАТАЛОГ",
  },
  {
    id: "2",
    title: "Профессиональное оборудование",
    subtitle: "Гарантия качества и надежности",
    image: HeroMain2,
    link: "/catalog",
    buttonText: "ПОДРОБНЕЕ",
  }
];

const defaultSideBanners: Banner[] = [
  {
    id: "1",
    title: "Акции",
    image: PrevCoofix,
    link: "/catalog?filter=promo",
  },
  {
    id: "2",
    title: "Новое поступление",
    image: HeroMain2,
    link: "/catalog?filter=new",
  },
  {
    id: "3",
    title: "Акции на сверла",
    image: PrevCoofix,
    link: "/catalog?category=drills&filter=promo",
  },
];

export default function HeroBanner({
  mainBanners = defaultMainBanners,
  sideBanners = defaultSideBanners,
}: HeroBannerProps) {
  const [currentMainIndex, setCurrentMainIndex] = useState(0);

  const nextMainBanner = () => {
    setCurrentMainIndex((prev) => (prev + 1) % mainBanners.length);
  };

  const prevMainBanner = () => {
    setCurrentMainIndex((prev) => (prev - 1 + mainBanners.length) % mainBanners.length);
  };

  const currentMainBanner = mainBanners[currentMainIndex];

  return (
    <section className="container mx-auto px-4 py-6 lg:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Main Banner */}
        {/* Переместили overflow-hidden и rounded-xl сюда, чтобы зум картинки не вылезал за рамки */}
        <div className="lg:col-span-3 relative group rounded-xl overflow-hidden h-64 md:h-96 lg:h-[500px]">
          <Link href={currentMainBanner.link} className="block h-full relative">
            {/* Фоновое изображение с эффектом увеличения */}
            <Image
              src={currentMainBanner.image}
              alt={currentMainBanner.title}
              fill
              priority // Важно для LCP (Largest Contentful Paint)
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Затемняющий слой (Overlay) для читаемости текста */}
            <div className="absolute inset-0 bg-linear-to-r from-coal/80 to-transparent z-10" />

            <div className="absolute inset-0 flex flex-col justify-center items-start p-8 md:p-12 lg:p-16 z-20">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 max-w-2xl drop-shadow-md">
                {currentMainBanner.title}
              </h2>
              {currentMainBanner.subtitle && (
                <p className="text-white/90 text-lg mb-6 max-w-xl drop-shadow-sm">
                  {currentMainBanner.subtitle}
                </p>
              )}
              {currentMainBanner.buttonText && (
                <Button variant="primary" className="mt-4">
                  {currentMainBanner.buttonText}
                </Button>
              )}
            </div>

            {/* Navigation Arrows */}
            {mainBanners.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    prevMainBanner();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Previous banner"
                >
                  <FiChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    nextMainBanner();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Next banner"
                >
                  <FiChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
            {/* Dots Indicator */}
            {mainBanners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {mainBanners.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentMainIndex(index);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentMainIndex
                        ? "w-8 bg-orange"
                        : "w-2 bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Go to banner ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </Link>
        </div>

        {/* Side Banners */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {sideBanners.map((banner) => (
            <Link
              key={banner.id}
              href={banner.link}
              className="relative h-48 md:h-56 lg:h-[calc((500px-16px)/3)] rounded-xl overflow-hidden group"
            >
              {/* Фоновое изображение бокового баннера с зумом */}
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Затемняющий слой */}
              <div className="absolute inset-0 bg-coal/60 z-10" />

              <div className="absolute inset-0 flex flex-col justify-center items-start p-6 z-20">
                <h3 className="text-lg md:text-xl font-bold text-white drop-shadow-sm">
                  {banner.title}
                </h3>
              </div>
              {/* Small navigation arrows for side banners */}
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex gap-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-1.5"
                  aria-label="Previous"
                >
                  <FiChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-1.5"
                  aria-label="Next"
                >
                  <FiChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}