import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8466017928:AAFymG3VpUxDCObtlt2GVL_HpqO97QmzkI4";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "-1003452171615";
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

interface CallbackRequest {
  name: string;
  phone: string;
  comment?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CallbackRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, message: "Имя и телефон обязательны" },
        { status: 400 }
      );
    }

    // Format message for Telegram
    const message = `
📞 <b>Новая заявка на звонок</b>

👤 <b>Имя:</b> ${escapeHtml(body.name)}
📱 <b>Телефон:</b> ${escapeHtml(body.phone)}
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
          message: "Ошибка при отправке сообщения. Попробуйте позже.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Callback API error:", error);
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

