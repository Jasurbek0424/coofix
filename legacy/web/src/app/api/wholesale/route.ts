import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8466017928:AAFymG3VpUxDCObtlt2GVL_HpqO97QmzkI4";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "-1003452171615";
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const comment = formData.get("comment") as string | null;
    const file = formData.get("file") as File | null;

    // Validate required fields
    if (!firstName || !lastName || !phone || !email) {
      return NextResponse.json(
        { success: false, message: "Все обязательные поля должны быть заполнены" },
        { status: 400 }
      );
    }

    // Format message for Telegram
    let message = `
🏢 <b>Новая заявка от оптовика/юрлица</b>

👤 <b>Имя:</b> ${escapeHtml(firstName)}
👤 <b>Фамилия:</b> ${escapeHtml(lastName)}
📱 <b>Телефон:</b> ${escapeHtml(phone)}
📧 <b>Email:</b> ${escapeHtml(email)}
${comment ? `💬 <b>Комментарий:</b>\n${escapeHtml(comment)}` : ""}

🕐 <i>Время: ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}</i>
    `.trim();

    // Send message to Telegram with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout for Telegram
    
    let messageResponse;
    try {
      messageResponse = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        console.error("Telegram API timeout");
        return NextResponse.json(
          {
            success: false,
            message: "Время ожидания истекло. Попробуйте еще раз.",
          },
          { status: 408 }
        );
      }
      throw error;
    }

    const messageData = await messageResponse.json();

    if (!messageResponse.ok || !messageData.ok) {
      console.error("Telegram API error:", messageData);
      return NextResponse.json(
        {
          success: false,
          message: "Ошибка при отправке сообщения. Попробуйте позже.",
        },
        { status: 500 }
      );
    }

    // If file is attached, send it to Telegram
    if (file && file.size > 0) {
      const fileBuffer = await file.arrayBuffer();
      const fileBlob = new Blob([fileBuffer]);
      
      const fileFormData = new FormData();
      fileFormData.append("chat_id", TELEGRAM_CHAT_ID);
      fileFormData.append("document", fileBlob, file.name);
      fileFormData.append("caption", `Файл от ${escapeHtml(firstName)} ${escapeHtml(lastName)}`);

      const fileController = new AbortController();
      const fileTimeoutId = setTimeout(() => fileController.abort(), 15000); // 15 seconds for file upload
      
      try {
        const fileResponse = await fetch(`${TELEGRAM_API_URL}/sendDocument`, {
          method: "POST",
          body: fileFormData,
          signal: fileController.signal,
        });
        clearTimeout(fileTimeoutId);
        
        const fileData = await fileResponse.json();
        
        if (!fileResponse.ok || !fileData.ok) {
          console.error("Telegram file upload error:", fileData);
          // Don't fail the whole request if file upload fails
        }
      } catch (error) {
        clearTimeout(fileTimeoutId);
        if (error instanceof Error && error.name === "AbortError") {
          console.error("Telegram file upload timeout");
          // Don't fail the whole request if file upload times out
        } else {
          console.error("Telegram file upload error:", error);
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Wholesale API error:", error);
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
