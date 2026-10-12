/** Real company data (sourced from the legacy storefront). Text labels live in i18n. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://coofix.store").replace(/\/$/, "");

export const PHONES = [
  { display: "+7 (926) 737-03-37", href: "tel:+79267370337" },
  { display: "+7 (996) 990-00-94", href: "tel:+79969900094" },
] as const;

/** Phone used to order a pickup pass (per legacy "Оплата и доставка"). */
export const PASS_PHONE = PHONES[1];

export const EMAIL = "coofix@mail.ru";

export const SOCIAL = [
  { id: "telegram", label: "Telegram", href: "https://t.me/coofixmoskov" },
  { id: "vk", label: "VK", href: "https://vk.com/coofixrussia" },
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/coofixrussia" },
] as const;

export const MARKETPLACES = [
  { id: "wb", label: "Wildberries", href: "https://www.wildberries.ru/seller/250037177" },
  { id: "ozon", label: "Ozon", href: "https://ozon.ru/t/rd4SVmK" },
  { id: "yandex", label: "Яндекс Маркет", href: "https://market.yandex.ru/cc/8VnW99" },
] as const;

export const MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d2252.892983219038!2d37.784055599999995!3d55.621277799999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNTXCsDM3JzE2LjYiTiAzN8KwNDcnMDIuNiJF!5e0!3m2!1sru!2s!4v1764596590779!5m2!1sru!2s";

export const COMPARE_LIMIT = 4;
export const PER_PAGE = 24;
