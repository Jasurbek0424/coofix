"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function UserAgreementPage() {
  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: "Соглашение пользователя" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12 max-w-4xl">
        <Breadcrumbs items={breadcrumbs} />
        
        <article className="bg-white dark:bg-dark rounded-lg shadow-md border border-gray-200 dark:border-coal p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-coal dark:text-foreground mb-6">
            Соглашение пользователя
          </h1>
          
          <div className="prose prose-lg max-w-none dark:prose-invert text-gray-smoky leading-relaxed space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-coal dark:text-foreground mb-4 mt-8">
                1. Общие положения
              </h2>
              <p>
                Настоящее Соглашение пользователя (далее — «Соглашение») определяет условия использования 
                интернет-магазина COOFIX (далее — «Сайт»). Используя Сайт, вы соглашаетесь с условиями 
                настоящего Соглашения.
              </p>
              <p>
                Администрация Сайта оставляет за собой право в любое время изменять условия настоящего 
                Соглашения. Изменения вступают в силу с момента их публикации на Сайте.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-coal dark:text-foreground mb-4 mt-8">
                2. Регистрация и учетная запись
              </h2>
              <p>
                Для оформления заказа вам необходимо зарегистрироваться на Сайте, указав достоверные 
                персональные данные. Вы несете ответственность за достоверность предоставленной информации.
              </p>
              <p>
                Вы обязаны хранить в секрете пароль от вашей учетной записи и не передавать его третьим лицам.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-coal dark:text-foreground mb-4 mt-8">
                3. Заказ товаров
              </h2>
              <p>
                Оформляя заказ на Сайте, вы подтверждаете, что ознакомились с описанием товара, его 
                характеристиками и условиями доставки.
              </p>
              <p>
                Цены на товары указаны в российских рублях. Администрация Сайта оставляет за собой право 
                изменять цены на товары без предварительного уведомления.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-coal dark:text-foreground mb-4 mt-8">
                4. Оплата и доставка
              </h2>
              <p>
                Способы оплаты и доставки указаны на странице оформления заказа. Сроки доставки зависят 
                от выбранного способа доставки и вашего местоположения.
              </p>
              <p>
                Товар передается покупателю после полной оплаты или в соответствии с выбранным способом оплаты.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-coal dark:text-foreground mb-4 mt-8">
                5. Возврат товара
              </h2>
              <p>
                Вы имеете право вернуть товар надлежащего качества в течение 14 дней с момента покупки, 
                если товар не был в употреблении, сохранены его товарный вид и потребительские свойства.
              </p>
              <p>
                Возврат товара ненадлежащего качества осуществляется в соответствии с законодательством 
                Российской Федерации о защите прав потребителей.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-coal dark:text-foreground mb-4 mt-8">
                6. Конфиденциальность
              </h2>
              <p>
                Администрация Сайта обязуется не передавать персональные данные пользователей третьим лицам, 
                за исключением случаев, предусмотренных законодательством Российской Федерации.
              </p>
              <p>
                Обработка персональных данных осуществляется в соответствии с политикой конфиденциальности Сайта.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-coal dark:text-foreground mb-4 mt-8">
                7. Контактная информация
              </h2>
              <p>
                По всем вопросам, связанным с использованием Сайта и настоящим Соглашением, вы можете 
                обратиться к администрации Сайта по телефону или через форму обратной связи.
              </p>
              <p>
                Телефон: +7(926)737-03-37<br />
                Телефон: +7(996)990-00-94
              </p>
            </section>

            <section>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
                Дата последнего обновления: {new Date().toLocaleDateString("ru-RU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
            </section>
          </div>
        </article>
      </main>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
