"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Buttons/Button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import HeroMain from "@/assets/hero__main copy.jpg";
import HeroMain2 from "@/assets/hero__main_2.jpg";
import Banner2 from "@/assets/banner2.jpg";
import Banner3 from "@/assets/banner3.jpg";
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
    title: "Широкий ассортимент инструментов",
    subtitle: "Все для профессиональной работы",
    image: Banner2,
    link: "/catalog",
    buttonText: "СМОТРЕТЬ КАТАЛОГ",
  },
  {
    id: "3",
    title: "Передовые технологии",
    subtitle: "Проверенные делом",
    image: Banner3,
    link: "/catalog",
    buttonText: "ПЕРЕЙТИ В КАТАЛОГ",
  },
  {
    id: "4",
    title: "Специальные предложения",
    subtitle: "Лучшие цены на инструменты",
    image: PrevCoofix,
    link: "/catalog?filter=sale",
    buttonText: "СМОТРЕТЬ АКЦИИ",
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
    title: "Оповикам и юрлицам",
    image: PrevCoofix,
    link: "/wholesale",
  },
];

export default function HeroBanner({
  mainBanners = defaultMainBanners,
  sideBanners = defaultSideBanners,
}: HeroBannerProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <section className="container mx-auto px-4 py-6 lg:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Main Banner Swiper */}
        <div className="lg:col-span-3 relative rounded-xl overflow-hidden h-64 md:h-96 lg:h-[500px]">
          <Swiper className="h-full"
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            modules={[Autoplay, Navigation, Pagination]}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
            }}
            loop={true}
            navigation={true}
            pagination={{
              clickable: true,
            }}
          >
            {mainBanners.map((banner) => (
              <SwiperSlide key={banner.id}>
                <Link href={banner.link} className="block h-full relative group">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 75vw"
                    priority={banner.id === "1"}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-coal/80 to-transparent z-10" />
                  <div className="absolute inset-0 flex flex-col justify-center items-start p-8 md:p-12 lg:p-16 z-20">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 max-w-2xl drop-shadow-md">
                      {banner.title}
                    </h2>
                    {banner.subtitle && (
                      <p className="text-white/90 text-lg mb-6 max-w-xl drop-shadow-sm">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.buttonText && (
                      <Button variant="primary" className="mt-4">
                        {banner.buttonText}
                      </Button>
                    )}
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Side Banners */}
        <div className="lg:col-span-1 flex flex-col gap-4 h-64 md:h-96 lg:h-[500px]">
          {sideBanners.map((banner) => (
            <Link
              key={banner.id}
              href={banner.link}
              className="relative flex-1 rounded-xl overflow-hidden group"
            >
              {/* Фоновое изображение бокового баннера с зумом */}
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Затемняющий слой */}
              <div className="absolute inset-0 bg-coal/60 z-10" />

              <div className="absolute inset-0 flex flex-col justify-center items-start p-6 z-20">
                <h3 className="text-lg md:text-xl font-bold text-white drop-shadow-sm">
                  {banner.title}
                </h3>
              </div>
              {/* Small navigation arrows for side banners
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex gap-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2"
                  aria-label="Previous"
                >
                  <FiChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2"
                  aria-label="Next"
                >
                  <FiChevronRight className="w-4 h-4 text-white" />
                </button>
              </div> */}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}