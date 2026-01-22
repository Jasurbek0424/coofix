"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function PaymentDeliveryPage() {
  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12">
        <Breadcrumbs items={[
          { label: "Главная", href: "/" },
          { label: "Оплата и доставка" }
        ]} />
        
        <h1 className="text-3xl md:text-4xl font-bold text-coal dark:text-foreground mb-8">
          Оплата и доставка
        </h1>

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Как оплатить? */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-coal dark:text-foreground mb-6">
              Как оплатить?
            </h2>
            
            <div className="space-y-8">
              {/* Наличный расчёт */}
              <div className="bg-white dark:bg-dark rounded-lg p-6 shadow-md border border-gray-200 dark:border-coal">
                <h3 className="text-xl font-semibold text-coal dark:text-foreground mb-4">
                  Наличный расчёт
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Если товар забирается самовывозом из пункта выдачи, то возможен наличный расчет при получении.
                </p>
              </div>

              {/* Банковской картой */}
              <div className="bg-white dark:bg-dark rounded-lg p-6 shadow-md border border-gray-200 dark:border-coal">
                <h3 className="text-xl font-semibold text-coal dark:text-foreground mb-4">
                  Банковской картой
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Оплатить банковской картой вы можете при получении товара в пункте выдачи и на сайте. Оплата происходит через ПАО СБЕРБАНК с использованием банковских карт следующих платёжных систем:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                  <li>МИР;</li>
                  <li>VISA International;</li>
                  <li>Mastercard Worldwide.</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
                  Оплата на сайте доступна только после подтверждения заказа оператором.
                </p>
              </div>

              {/* Оплата по счету */}
              <div className="bg-white dark:bg-dark rounded-lg p-6 shadow-md border border-gray-200 dark:border-coal">
                <h3 className="text-xl font-semibold text-coal dark:text-foreground mb-4">
                  Оплата по счету
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Для юридических лиц доступна оплата безналичным расчетом. Оплата по счету доступна только после подтверждения заказа оператором.
                </p>
              </div>
            </div>
          </section>

          {/* Как забрать товар? */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-coal dark:text-foreground mb-6">
              Как забрать товар?
            </h2>
            
            <div className="space-y-8">
              {/* Самовывоз */}
              <div className="bg-white dark:bg-dark rounded-lg p-6 shadow-md border border-gray-200 dark:border-coal">
                <h3 className="text-xl font-semibold text-coal dark:text-foreground mb-4">
                  Самовывоз
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Товар можно забрать самовывозом по адресу:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-400 ml-4 mb-6">
                  <li>
                    Московская область, городской округ Мытищи, деревня Коргашино, Тарасовская улица, Строительные рынок Удача, Павильон А6,
                  </li>
                  <li>
                    ТК Южные ворота МКАД, 19-й километр, вл20с1, 16 линия 79 павильон
                  </li>
                </ol>
                
                {/* Google Maps */}
                <div className="w-full h-96 rounded-lg overflow-hidden mb-4">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d2232.7881154531065!2d37.7439310774111!3d55.97037397316554!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNTXCsDU4JzEzLjQiTiAzN8KwNDQnNDcuNCJF!5e0!3m2!1sru!2s!4v1769091843430!5m2!1sru!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  />
                </div>
                
                <div className="bg-orange/10 dark:bg-orange/20 border-l-4 border-orange p-4 rounded">
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Внимание!
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Необходимо заказать пропуск у менеджера не менее чем за 1 час.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-2">
                    Тел. для заказа пропуска:{" "}
                    <a
                      href="tel:+79969900094"
                      className="text-orange hover:text-orange/80 font-medium"
                    >
                      +7(996)990-00-94
                    </a>
                  </p>
                </div>
              </div>

              {/* Доставка */}
              <div className="bg-white dark:bg-dark rounded-lg p-6 shadow-md border border-gray-200 dark:border-coal">
                <h3 className="text-xl font-semibold text-coal dark:text-foreground mb-4">
                  Доставка
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Для некоторых регионов доступна доставка товара по городу. Уточнить доступность, рассчитать стоимость и оформить доставку можно в корзине или у операторов.
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4 font-medium">
                  Доставка осуществляется только после полной оплаты заказа на сайте.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
