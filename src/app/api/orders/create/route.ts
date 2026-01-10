import { NextRequest, NextResponse } from "next/server";
import type { OrderFormData } from "@/lib/validations";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8466017928:AAFymG3VpUxDCObtlt2GVL_HpqO97QmzkI4";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "-1003452171615";
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

interface OrderRequest extends OrderFormData {
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequest = await request.json();

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.phone) {
      return NextResponse.json(
        { success: false, message: "Имя, фамилия и телефон обязательны" },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Корзина пуста" },
        { status: 400 }
      );
    }

    // Format order items for Telegram
    const itemsText = body.items
      .map((item, index) => {
        const itemTotal = item.price * item.quantity;
        return `${index + 1}. ${escapeHtml(item.productName)}
   Количество: ${item.quantity} шт.
   Цена: ${item.price.toLocaleString("ru-RU")} ₽
   Итого: ${itemTotal.toLocaleString("ru-RU")} ₽`;
      })
      .join("\n\n");

    // Format address
    const addressParts = [
      body.city,
      body.street,
      `Дом ${body.building}`,
      body.house ? `Корпус ${body.house}` : null,
      body.apartment ? `Квартира ${body.apartment}` : null,
    ].filter(Boolean);

    // Format message for Telegram
    const message = `
🛒 <b>Новый заказ</b>

👤 <b>Клиент:</b>
Имя: ${escapeHtml(body.firstName)} ${escapeHtml(body.lastName)}
Телефон: ${escapeHtml(body.phone)}
${body.email ? `Email: ${escapeHtml(body.email)}` : ""}

📍 <b>Адрес доставки:</b>
${escapeHtml(addressParts.join(", "))}

🛍️ <b>Товары:</b>
${itemsText}

💰 <b>Общая сумма:</b> ${body.total.toLocaleString("ru-RU")} ₽

${body.comment ? `💬 <b>Комментарий:</b>\n${escapeHtml(body.comment)}` : ""}

🕐 <i>Время: ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}</i>
    `.trim();

    // Send message to Telegram
    const response = await fetch(TELEGRAM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error("Telegram API error:", data);
      return NextResponse.json(
        {
          success: false,
          message: "Ошибка при отправке заказа. Попробуйте позже.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Заказ успешно оформлен! Мы свяжемся с вами для подтверждения.",
        orderId: data.result?.message_id || Date.now().toString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка сервера. Попробуйте позже.",
      },
      { status: 500 }
    );
  }
}

// Helper function to escape HTML for Telegram
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

