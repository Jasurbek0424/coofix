/* eslint-disable react/no-unescaped-entities */
import { HiPhone, HiClock, HiMail, HiLocationMarker } from "react-icons/hi";

export default function Contacts() {
  return (
    <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
            Biz bilan bog'lanish
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Savollaringiz bo'lsa, bizga murojaat qiling
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 p-6 shadow-sm bg-transparent">
              <h2 className="mb-6 text-2xl font-semibold text-black">
                Kontakt ma'lumotlari
              </h2>

              <div className="space-y-4">
                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <HiLocationMarker className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-black dark:text-white">
                      Manzil
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Toshkent shahar, Yunusobod tumani
                      <br />
                      Amir Temur ko'chasi, 123-uy
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <HiPhone className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-black dark:text-white">
                      Telefon
                    </h3>
                    <a
                      href="tel:+998901234567"
                      className="text-gray-600 transition-colors hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
                    >
                      +998 90 123 45 67
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <HiMail className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-black dark:text-white">
                      Email
                    </h3>
                    <a
                      href="mailto:info@coofix.uz"
                      className="text-gray-600 transition-colors hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
                    >
                      info@coofix.uz
                    </a>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <HiClock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-black dark:text-white">
                      Ish vaqti
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Dushanba - Juma: 09:00 - 18:00
                      <br />
                      Shanba - Yakshanba: Dam olish
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white">
                Bizning joylashuvimiz
              </h2>

              {/* Map Placeholder */}
              <div className="relative h-96 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.363480637712!2d69.240562!3d41.311081!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDE4JzM5LjkiTiA2OcKwMTQnMjYuMCJF!5e0!3m2!1sen!2s!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                ></iframe>
              </div>

              {/* Additional Text Section */}
              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  <h3 className="mb-2 font-semibold text-black dark:text-white">
                    Qo'shimcha ma'lumot
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    Bizning ofisimiz shahar markazida joylashgan. Transport
                    vositalari bilan qulay yetib borish mumkin. Mehmonxona
                    oldida bepul parkovka mavjud.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Text Content */}
        <div className="mt-12 rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white">
            Biz haqimizda
          </h2>
          <div className="prose prose-gray max-w-none dark:prose-invert">
            <p className="mb-4 leading-relaxed text-gray-600 dark:text-gray-400">
              {/* Bu yerda qo'shimcha matnlar bo'ladi */}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
            <p className="leading-relaxed text-gray-600 dark:text-gray-400">
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

