// src/app/about/page.tsx
"use client";
import Image from "next/image"; 
import Prev from "../../assets/prew__coofix.jpg"; 

export default function About() {
  return (
    <main className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
      
      {/* --- Sarlavha Qismi (Hero Section) --- */}
      <section className="max-w-4xl mx-auto text-center mb-12 lg:mb-16">
        {/* H1: Bosh matn rangi (Foreground) */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-coal dark:text-foreground mb-6">
          О нас — Coofix Tools
        </h1>
        {/* P: Matn rangi (Gray) */}
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Coofix Tools — надёжный и доступный поставщик профессиональных
          инструментов. Мы предлагаем широкий ассортимент: электроинструменты,
          ручные инструменты, садовые, пневмо- и строительное оборудование, с
          десятилетним опытом на рынке.
        </p>
      </section>

      <hr className="my-10 border-gray-default dark:border-gray-default" />

      {/* --- Asosiy Ma'lumotlar va Statistika (Grid Section) --- */}
      <section className="grid gap-8 lg:gap-12 md:grid-cols-2 max-w-6xl mx-auto">
        
        {/* Block 1 */}
        <div className="space-y-6 p-6 sm:p-8 bg-white dark:bg-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-default">
          {/* H2: Bosh matn rangi (Coal) */}
          <h2 className="text-3xl font-bold text-coal dark:text-foreground">
            Наша миссия
          </h2>
          {/* P: Matn rangi (Gray) */}
          <p className="text-gray-600 dark:text-gray-400">
            Обеспечивать профессиональное качество инструментов по доступным
            ценам. Мы хотим, чтобы каждая мастерская — от домашней до
            профессиональной — могла получить надёжные инструменты без переплат.
          </p>

          {/* H3: Bosh matn rangi (Coal) */}
          <h3 className="text-2xl font-semibold pt-4 text-coal dark:text-foreground">
            Что мы предлагаем
          </h3>
          <ul className="list-none space-y-3">
            {/* List Item: Marker rangi (Orange), Matn rangi (Gray) */}
            <li className="flex items-start text-gray-600 dark:text-gray-400">
              <span className="text-orange mr-2 mt-1">•</span>
              Электроинструменты: дрели, отбойники, шлифмашины и др.
            </li>
            <li className="flex items-start text-gray-600 dark:text-gray-400">
              <span className="text-orange mr-2 mt-1">•</span>
              Ручные и садовые инструменты, аксессуары, детали.
            </li>
            <li className="flex items-start text-gray-600 dark:text-gray-400">
              <span className="text-orange mr-2 mt-1">•</span>
              Пневматическое, строительное и садовое оборудование.
            </li>
            <li className="flex items-start text-gray-600 dark:text-gray-400">
              <span className="text-orange mr-2 mt-1">•</span>
              Гарантия качества, контроль на производстве и строгий QA/QC
              процесс.
            </li>
            <li className="flex items-start text-gray-600 dark:text-gray-400">
              <span className="text-orange mr-2 mt-1">•</span>
              Гибкие условия, OEM/ODM, помощь с упаковкой, брендингом и
              логистикой для клиентов.
            </li>
          </ul>
        </div>

        {/* Block 2 */}
        <div className="space-y-6 p-6 sm:p-8 bg-white dark:bg-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-default">
          {/* H2: Bosh matn rangi (Coal) */}
          <h2 className="text-3xl font-bold text-coal dark:text-foreground">
            Наши достижения
          </h2>
          <ul className="space-y-6 pt-4">
            {/* Statistika 1: Raqam rangi (Orange), Matn rangi (Gray), Strong rangi (Coal) */}
            <li className="text-gray-600 dark:text-gray-400 flex items-center">
              <span className="text-4xl font-extrabold text-orange mr-4">
                10+
              </span>
              <p className="text-lg">
                <strong className="text-coal dark:text-foreground">лет опыта</strong>{" "}
                на рынке OEM / инструментов.
              </p>
            </li>
            {/* Statistika 2 */}
            <li className="text-gray-600 dark:text-gray-400 flex items-center">
              <span className="text-4xl font-extrabold text-orange mr-4">
                2000+
              </span>
              <p className="text-lg">
                Более{" "}
                <strong className="text-coal dark:text-foreground">
                  клиентов / агентов
                </strong>{" "}
                по всему миру.
              </p>
            </li>
            {/* Statistika 3 */}
            <li className="text-gray-600 dark:text-gray-400 flex items-center">
              <span className="text-4xl font-extrabold text-orange mr-4">
                100%
              </span>
              <p className="text-lg">
                Широкий ассортимент: электроинструменты, ручные, садовые,
                пневматические, оборудование и многое другое.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* --- Rasm Seksiyasi --- */}
      <section className="mt-16 lg:mt-24 text-center max-w-6xl mx-auto">
        <div className="relative mx-auto w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01]">
          <Image
            src={Prev}
            alt="Coofix Tools factory — Производственный объект"
            width={1200}
            height={675} 
            loading="lazy"
            className="w-full h-auto object-cover" 
          />
        </div>
      </section>
      
      {/* --- Nima uchun bizni tanlashadi --- */}
      <section className="mt-16 lg:mt-24 max-w-4xl mx-auto space-y-6 text-gray-600 dark:text-gray-400">
        {/* H2: Bosh matn rangi (Coal) */}
        <h2 className="text-3xl font-bold text-coal dark:text-foreground text-center">
          Почему выбирают нас
        </h2>
        {/* P: Matn rangi (Gray) */}
        <p className="text-lg pt-4">
          Coofix Tools ориентирован на **качество**, **надёжность** и
          **честность**. Мы контролируем производство, тестируем качество и
          предоставляем поддержку на каждом этапе.
        </p>
        <p className="text-lg">
          Наши клиенты ценят **стабильность**, **оперативность** и **партнёрский
          подход**. Мы предлагаем OEM/ODM решения, гибкие условия заказа,
          строгий контроль качества и поддержку клиентов на всех этапах, от
          консультаций до логистики.
        </p>
        {/* P: Aktsent rangi (Orange) */}
        <p className="text-lg font-semibold text-orange-600 dark:text-orange">
          Ваш успех — наш приоритет!
        </p>
      </section>
    </main>
  );
}