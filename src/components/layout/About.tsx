// src/app/about/page.tsx
"use client";
import Image from "next/image"; 
import Prev from "../../assets/prew__coofix.jpg";
import { Breadcrumbs } from "./Breadcrumbs"; 

export default function About() {
  return (
    <main className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
      <Breadcrumbs items={[
        { label: "Главная", href: "/" },
        { label: "О нас" }
      ]} />
      
      {/* --- Sarlavha Qismi (Hero Section) --- */}
      <section className="max-w-4xl mx-auto text-center mb-12 lg:mb-16">
        {/* H1: Bosh matn rangi (Foreground) */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-coal dark:text-foreground mb-6">
          О нас — Coofix Tools
        </h1>
        {/* P: Matn rangi (Gray) */}
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Coofix Tools — производитель, специализирующийся на электроинструментах, садовых инструментах, пневматическом оборудовании более 10 лет. Расположен в провинции Чжэцзян.
        </p>
      </section>

      <hr className="my-10 border-gray-default dark:border-gray-default" />

      {/* --- О компании --- */}
      <section className="max-w-6xl mx-auto mb-12 lg:mb-16">
        <div className="space-y-6 p-6 sm:p-8 bg-white dark:bg-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-default">
          <h2 className="text-3xl font-bold text-coal dark:text-foreground mb-6">
            О компании
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 text-lg">
            <p>
              Coofix Tools — производитель, специализирующийся на электроинструментах, садовых инструментах, пневматическом оборудовании более 10 лет. Расположен в провинции Чжэцзян. Наша основная продукция - электрическая дрель, угловая шлифовальная машина, циркулярная пила, перфоратор, аккумуляторные инструменты и сварочный аппарат, имеет более 10 лет продвижения на рынке OEM и более 4 лет опыта продвижения бренда coofix на рынке.
            </p>
            <p>
              <strong className="text-coal dark:text-foreground">OEM и ODM</strong> могут быть приемлемыми.
            </p>
            <p>
              Нет требований MOQ, быстрая доставка.
            </p>
            <p>
              У нас есть профессиональная команда по продажам, готовая изучить более продвинутые знания, а время работы составляет <strong className="text-coal dark:text-foreground">7 * 24 часа</strong>, поэтому на любой запрос мы можем ответить в течение <strong className="text-coal dark:text-foreground">3 часов</strong>.
            </p>
            <p>
              У нас есть команда QC и команда R&D, это означает, что все запасные части, которые мы будем тестировать перед производством продукции, и все образцы, которые мы будем тестировать перед отправкой вам. И мы можем предоставить некоторый дизайн упаковки для клиентов. И каждый месяц мы можем исследовать <strong className="text-coal dark:text-foreground">одну новую продукцию</strong>.
            </p>
            <p>
              Мы можем разработать веб-сайт для клиента, если клиенту нужно.
            </p>
            <p>
              Мы можем спроектировать и сделать каталог для клиента.
            </p>
            <p>
              Мы можем помочь клиенту обучить его команду продаж и научить их, как выполнять послепродажное обслуживание.
            </p>
            <p>
              Достаточный запас для большинства товаров. <strong className="text-coal dark:text-foreground">Склад 10000 м²</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* --- Наша фабрика --- */}
      <section className="max-w-6xl mx-auto mb-12 lg:mb-16">
        <div className="space-y-6 p-6 sm:p-8 bg-white dark:bg-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-default">
          <h2 className="text-3xl font-bold text-coal dark:text-foreground mb-6">
            Наша фабрика
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 text-lg">
            <p>
              CoofixTools, производящие и экспортирующие все серии электроинструментов. Что у нас есть:
            </p>
            <ul className="list-none space-y-3">
              <li className="flex items-start">
                <span className="text-orange mr-2 mt-1">•</span>
                <span><strong className="text-coal dark:text-foreground">4 фабрики</strong> электроинструментов</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange mr-2 mt-1">•</span>
                <span>Более <strong className="text-coal dark:text-foreground">2000 работников</strong></span>
              </li>
              <li className="flex items-start">
                <span className="text-orange mr-2 mt-1">•</span>
                <span>Команда QA/QC с более чем <strong className="text-coal dark:text-foreground">70 сотрудниками</strong></span>
              </li>
              <li className="flex items-start">
                <span className="text-orange mr-2 mt-1">•</span>
                <span>Отдел исследований и разработок</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange mr-2 mt-1">•</span>
                <span>Строгая команда управления ERP System</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange mr-2 mt-1">•</span>
                <span><strong className="text-coal dark:text-foreground">ISO9001</strong> Система качества</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- Наш продукт --- */}
      <section className="max-w-6xl mx-auto mb-12 lg:mb-16">
        <div className="space-y-6 p-6 sm:p-8 bg-white dark:bg-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-default">
          <h2 className="text-3xl font-bold text-coal dark:text-foreground mb-6">
            Наш продукт
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 text-lg">
            <p>
              <strong className="text-coal dark:text-foreground">Основной продукт:</strong> угловая шлифовальная машина, ударная дрель, полировщик, лобзиковая пила, беспроводная дрель, вращающийся молоток, снос, молоток, отрезная машина, пила митра; ручные инструменты.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div>
                <p><strong className="text-coal dark:text-foreground">Время доставки:</strong> 30-40 дней</p>
              </div>
              <div>
                <p><strong className="text-coal dark:text-foreground">Объем продаж:</strong> 200 000 штук в месяц</p>
              </div>
              <div>
                <p><strong className="text-coal dark:text-foreground">Принятие системы:</strong> ERP</p>
              </div>
              <div>
                <p><strong className="text-coal dark:text-foreground">Сертификация:</strong> CE/GS/EMC/ETL/UL; FFU</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Применение продукта --- */}
      <section className="max-w-6xl mx-auto mb-12 lg:mb-16">
        <div className="space-y-6 p-6 sm:p-8 bg-white dark:bg-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-default">
          <h2 className="text-3xl font-bold text-coal dark:text-foreground mb-6">
            Применение продукта
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 text-lg">
            <p>
              Инструменты COOFIX широко используются в следующих отраслях:
            </p>
            <ul className="list-none space-y-3">
              <li className="flex items-start">
                <span className="text-orange mr-2 mt-1">•</span>
                <span><strong className="text-coal dark:text-foreground">Механическая промышленность:</strong> бурение, нарезание резьбы, распиловка, шлифование, полировка, крепление</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange mr-2 mt-1">•</span>
                <span><strong className="text-coal dark:text-foreground">Строительство:</strong> бурение каменного, бетонное выключатель</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange mr-2 mt-1">•</span>
                <span><strong className="text-coal dark:text-foreground">Животноводство индустрия:</strong> спрей, стрижка лесного хозяйства, вырубка, садоводство</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange mr-2 mt-1">•</span>
                <span><strong className="text-coal dark:text-foreground">Плотник:</strong> распиливание, резка, шлифование</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange mr-2 mt-1">•</span>
                <span><strong className="text-coal dark:text-foreground">Промышленное искусство:</strong> гравировка</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange mr-2 mt-1">•</span>
                <span><strong className="text-coal dark:text-foreground">Другое специальное назначение:</strong> пробивание стальной пластины, специальный процесс</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- Наш сертификат --- */}
      <section className="max-w-6xl mx-auto mb-12 lg:mb-16">
        <div className="space-y-6 p-6 sm:p-8 bg-white dark:bg-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-default">
          <h2 className="text-3xl font-bold text-coal dark:text-foreground mb-6">
            Наш сертификат
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 text-lg">
            <p>
              Мы всегда считаем, что весь успех нашей компании напрямую связан с качеством предлагаемых нами продуктов. Они отвечают требованиям высочайшего качества, которые предусмотрены в <strong className="text-coal dark:text-foreground">ISO9001</strong>, <strong className="text-coal dark:text-foreground">CE</strong>, руководящих принципах <strong className="text-coal dark:text-foreground">SGS</strong> и нашей строгой системе контроля качества.
            </p>
          </div>
        </div>
      </section>

      {/* --- Производственный рынок --- */}
      <section className="max-w-6xl mx-auto mb-12 lg:mb-16">
        <div className="space-y-6 p-6 sm:p-8 bg-white dark:bg-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-default">
          <h2 className="text-3xl font-bold text-coal dark:text-foreground mb-6">
            Производственный рынок
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 text-lg">
            <p>
              Coofix Core Markets - Юго-Восточная Азия, Центральная Азия, Африка, Латинская Америка и Ближний Восток, Coofix Products Hot, продавая более <strong className="text-coal dark:text-foreground">100 стран и регионов</strong>, каждый год мы посещаем агента и помогут им сделать рынок большим, наш слоган: <strong className="text-orange">один COOFIX, Global Coofix, ваш Coofix</strong>.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-gray-50 dark:bg-coal rounded-lg">
                <p className="text-2xl font-bold text-orange mb-2">15%</p>
                <p className="text-coal dark:text-foreground">Юго-Восточная Азия</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-coal rounded-lg">
                <p className="text-2xl font-bold text-orange mb-2">10%</p>
                <p className="text-coal dark:text-foreground">Южная Азия</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-coal rounded-lg">
                <p className="text-2xl font-bold text-orange mb-2">20%</p>
                <p className="text-coal dark:text-foreground">Ближний Восток</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-coal rounded-lg">
                <p className="text-2xl font-bold text-orange mb-2">30%</p>
                <p className="text-coal dark:text-foreground">Южная Америка</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-coal rounded-lg">
                <p className="text-2xl font-bold text-orange mb-2">15%</p>
                <p className="text-coal dark:text-foreground">Африка</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-coal rounded-lg">
                <p className="text-2xl font-bold text-orange mb-2">10%</p>
                <p className="text-coal dark:text-foreground">Европа</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Наш сервис --- */}
      <section className="max-w-6xl mx-auto mb-12 lg:mb-16">
        <div className="space-y-6 p-6 sm:p-8 bg-white dark:bg-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-default">
          <h2 className="text-3xl font-bold text-coal dark:text-foreground mb-6">
            Наш сервис
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 text-lg">
            <p>
              Мы можем предоставить следующие услуги:
            </p>
            <ul className="list-none space-y-3">
              <li className="flex items-start">
                <span className="text-orange mr-2 mt-1">1.</span>
                <span>Услуги посредничества по импорту-экспорту</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange mr-2 mt-1">2.</span>
                <span>Реклама</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange mr-2 mt-1">3.</span>
                <span>Онлайн-реклама в компьютерной сети</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange mr-2 mt-1">4.</span>
                <span>Продвижение интернет-торговой площадки для покупателей и продавцов товаров и услуг</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange mr-2 mt-1">5.</span>
                <span>Демонстрация товара</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

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