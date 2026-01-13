"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Buttons/Button";
import AboutImg from "@/assets/aboutImg.png";

export default function AboutSection() {
  return (
    <section className="bg-white dark:bg-dark py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image Section */}
          <div className="relative h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden">
            <Image
              src={AboutImg}
              alt="О нас - COOFIX TOOLS"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Text Section */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-coal dark:text-foreground">
              О нас
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 text-lg">
              <p>
                Coofix Tools — надёжный и доступный поставщик профессиональных
                инструментов. Мы предлагаем широкий ассортимент:
                электроинструменты, ручные инструменты, садовые, пневмо- и
                строительное оборудование.
              </p>
              <p>
                Более 10 лет опыта на рынке и более 2000 довольных клиентов по
                всему миру. Мы контролируем производство, тестируем качество и
                предоставляем поддержку на каждом этапе.
              </p>
              <p className="font-semibold text-orange">
                Ваш успех — наш приоритет!
              </p>
            </div>
            <Link href="/catalog">
              <Button variant="primary">ПЕРЕЙТИ В КАТАЛОГ</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

