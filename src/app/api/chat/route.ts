import { NextRequest, NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://coofix.store/api";

const BASE_PROMPT = `Ты — дружелюбный AI-помощник интернет-магазина COOFIX.STORE (Coofix Tools). Отвечай кратко, вежливо и по делу. Используй ТОЛЬКО информацию ниже — ничего не выдумывай.

## КОНТАКТЫ
- Телефон 1: +7(926)737-03-37
- Телефон 2: +7(996)990-00-94 (для заказа пропуска на самовывоз — звонить не менее чем за 1 час)
- Email: coofix@mail.ru
- Адрес офиса: ТК Южные ворота МКАД, 19-й километр, вл20с1, 16 линия 79 павильон
- Адрес самовывоза 2: Московская область, городской округ Мытищи, деревня Коргашино, Тарасовская улица, Строительный рынок Удача, Павильон А6
- Время работы: без выходных 09:00 — 18:00
- Сайт: https://coofix.store

## ОПЛАТА
Наличными при самовывозе; банковской картой (МИР, Visa, Mastercard); по счёту для юрлиц (после подтверждения оператором).

## ДОСТАВКА
Самовывоз из двух адресов. Пропуск: +7(996)990-00-94 за 1 час. Доставка по городу — уточнять в корзине или у операторов. Только после полной оплаты.

## МАРКЕТПЛЕЙСЫ
Wildberries, Ozon, Yandex Market.

## ПРАВИЛА
- Отвечай только по данным COOFIX. Нет информации — предложи позвонить или написать на email.
- Точные цены и наличие — в каталоге и у операторов.
- Для товара рекомендуй /catalog или /product/[slug], для связи — /contacts.`;

async function fetchFromBackend<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

function buildDynamicPrompt(categoriesText: string, productsText: string): string {
  const categoriesSection =
    categoriesText ||
    "Категории загружаются с бэкенда. Основные: электроинструменты, садовые инструменты, ручные инструменты, аксессуары.";
  const productsSection =
    productsText ||
    "Товары загружаются с бэкенда. Уточняй в каталоге https://coofix.store/catalog.";
  return `${BASE_PROMPT}

## КАТЕГОРИИ ТОВАРОВ (из бэкенда)
${categoriesSection}

## ПРИМЕРЫ ТОВАРОВ (из бэкенда)
${productsSection}`;
}

export async function POST(request: NextRequest) {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY не настроен" }, { status: 500 });
    }

    const body = await request.json();
    const text = body.text as string | undefined;
    const messages = body.messages as Array<{ role: string; content: string }> | undefined;

    const [treeRes, productsRes] = await Promise.all([
      fetchFromBackend<{ success: boolean; tree?: Array<{ name: string; children?: Array<{ name: string }> }> }>(
        "/categories/tree"
      ),
      fetchFromBackend<{ success: boolean; products?: Array<{ name: string; slug?: string; price?: number; brand?: { name: string } }> }>(
        "/products?limit=25"
      ),
    ]);

    let categoriesText = "";
    if (treeRes?.success && Array.isArray(treeRes.tree) && treeRes.tree.length > 0) {
      categoriesText = treeRes.tree
        .slice(0, 20)
        .map((cat) => {
          const sub = cat.children?.map((c) => c.name).join(", ");
          return `- ${cat.name}${sub ? ` (подкатегории: ${sub})` : ""}`;
        })
        .join("\n");
    }

    let productsText = "";
    if (productsRes?.success && Array.isArray(productsRes.products) && productsRes.products.length > 0) {
      productsText = productsRes.products
        .slice(0, 20)
        .map((p) => {
          const brand = p.brand?.name ? `, бренд: ${p.brand.name}` : "";
          const price = p.price ? `, ${p.price} ₽` : "";
          return `- ${p.name}${brand}${price} (slug: ${p.slug || "—"})`;
        })
        .join("\n");
    }

    const systemPrompt = buildDynamicPrompt(categoriesText, productsText);

    let chatMessages: Array<{ role: string; content: string }>;
    if (messages && Array.isArray(messages) && messages.length > 0) {
      chatMessages = [{ role: "system", content: systemPrompt }, ...messages];
    } else if (text && typeof text === "string") {
      chatMessages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ];
    } else {
      return NextResponse.json({ error: "Поле text или messages обязательно" }, { status: 400 });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error("GROQ API error:", response.status, errData);
      return NextResponse.json({ error: "Ошибка AI-сервиса" }, { status: response.status });
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "Извините, не удалось получить ответ.";
    return NextResponse.json({ message: content });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
