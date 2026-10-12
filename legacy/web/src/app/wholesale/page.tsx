"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { WholesaleForm } from "@/components/ui/Forms/WholesaleForm";

export default function WholesalePage() {
  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: "Оптовикам и юрлицам" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      <Header />
      
      <div className="flex-1 flex-grow">
        <main className="container mx-auto px-4 py-8 lg:py-12">
          <Breadcrumbs items={breadcrumbs} />
          
          <h1 className="text-3xl md:text-4xl font-bold text-coal dark:text-foreground mb-8">
            COOFIX оптом и для юридических лиц
          </h1>

          <div className="bg-white dark:bg-dark rounded-lg p-6 md:p-8 border border-gray-200 dark:border-coal mb-8">
            <h2 className="text-2xl font-semibold text-coal dark:text-foreground mb-4">
              Контакты оптового отдела COOFIX
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Если у вас остались вопросы или Вы хотите приобрести продукцию компании COOFIX, 
              Вы всегда можете обратиться за более подробной информацией к специалистам нашей компании.
            </p>
            <div className="h-px bg-gray-200 dark:bg-coal mb-6"></div>
          </div>

          <div className="bg-white dark:bg-dark rounded-lg p-6 md:p-8 border border-gray-200 dark:border-coal mb-8">
            <h2 className="text-2xl font-semibold text-coal dark:text-foreground mb-4">
              Обратная связь
            </h2>
            <div className="h-px bg-gray-200 dark:bg-coal mb-6"></div>
            <WholesaleForm />
          </div>
        </main>
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
