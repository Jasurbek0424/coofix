import {
  HiPhone,
  HiClock,
  HiMail,
  HiLocationMarker,
  HiDeviceMobile,
} from "react-icons/hi";
import { SocialIcons } from "../ui/Icons/SocialIcons";

export default function Contacts() {
  return (
    <main className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto">
        <div className="mb-12 text-center lg:mb-16">
          <h1 className="mb-4 text-4xl font-extrabold text-coal dark:text-foreground sm:text-5xl lg:text-6xl">
            Свяжитесь с нами
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Если у вас есть вопросы или предложения, мы всегда готовы помочь.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="rounded-xl border border-dark p-8 shadow-lg bg-white dark:bg-dark min-h-[585px]">
              <h2 className="mb-8 text-3xl font-bold text-coal dark:text-foreground">
                Контактная информация
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange/10">
                    <HiLocationMarker className="h-6 w-6 text-orange" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-coal dark:text-foreground">
                      Адрес
                    </h3>
                    <p className="text-smoky leading-relaxed">
                      ТК Южные ворота МКАД,
                      <br />
                      19-й километр, вл20с1
                      <br />
                      16 линия 79 павильон
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange/10">
                    <HiPhone className="h-6 w-6 text-orange" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-coal dark:text-foreground">
                      Телефон
                    </h3>
                    <a
                      href="tel:+79969900094"
                      className="text-lg font-medium text-smoky transition-colors hover:text-orange "
                    >
                      +7 (996) 990-00-94
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange/10">
                    <HiMail className="h-6 w-6 text-orange" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-coal dark:text-foreground">
                      Email
                    </h3>
                    <a
                      href="mailto:coofix@mail.ru"
                      className="text-lg font-medium text-smoky transition-colors hover:text-orange"
                    >
                      coofix@mail.ru
                    </a>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange/10">
                    <HiClock className="h-6 w-6 text-orange" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-coal dark:text-foreground">
                      Время работы
                    </h3>
                    <p className="text-smoky">Без выходных: 09:00 - 18:00</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange/10">
                    <HiDeviceMobile className="h-6 w-6 text-orange" />
                  </div>
                  <SocialIcons
                    variant="header"
                    className="flex"
                    iconSize={22}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-xl border border-dark p-8 shadow-lg bg-dark h-full flex flex-col min-h-[585px]">
              <h2 className="mb-6 text-3xl font-bold text-coal dark:text-foreground">
                Наше местоположение
              </h2>

              <div className="relative w-full overflow-hidden rounded-lg bg-dark grow min-h-[300px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d2252.892983219038!2d37.784055599999995!3d55.621277799999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNTXCsDM3JzE2LjYiTiAzN8KwNDcnMDIuNiJF!5e0!3m2!1sru!2s!4v1764596590779!5m2!1sru!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  className="absolute inset-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                ></iframe>
              </div>

              <div className="mt-6">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-dark/50 border border-gray-100 dark:border-gray-800">
                  <h3 className="mb-2 font-semibold text-coal dark:text-foreground">
                    Дополнительная информация
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    Наш офис расположен в центре города, что обеспечивает
                    удобный доступ на общественном транспорте и личном
                    автомобиле. Перед зданием имеется бесплатная парковка для
                    посетителей.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-xl border border-background bg-dark p-8 shadow-lg ">
          <h2 className="mb-6 text-3xl font-bold text-coal dark:text-foreground">
            О нашей компании
          </h2>
          <div className="space-y-4">
            <p className="leading-relaxed text-smoky">
              Coofix Tools — ваш надёжный партнёр в мире профессионального
              инструмента. Мы стремимся обеспечить наших клиентов
              высококачественной продукцией, гарантируя долговечность и
              эффективность каждого инструмента. Наш приоритет — прозрачность и
              отличное обслуживание.
            </p>
            <p className="leading-relaxed text-smoky">
              Мы постоянно расширяем ассортимент и улучшаем логистику, чтобы вы
              могли получить необходимый инструмент максимально быстро.
              Свяжитесь с нами, и мы обсудим, как мы можем помочь вашему
              бизнесу.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
