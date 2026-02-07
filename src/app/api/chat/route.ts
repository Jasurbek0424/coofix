import { NextRequest, NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `Ты — дружелюбный AI-помощник интернет-магазина COOFIX.STORE, который продаёт профессиональные инструменты (электроинструменты, садовые инструменты, аксессуары и т.д.). Отвечай кратко, вежливо и по делу.`;

export async function POST(request: NextRequest) {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY не настроен" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const text = body.text as string | undefined;
    const messages = body.messages as Array<{ role: string; content: string }> | undefined;

    let chatMessages: Array<{ role: string; content: string }>;

    if (messages && Array.isArray(messages) && messages.length > 0) {
      chatMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ];
    } else if (text && typeof text === "string") {
      chatMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ];
    } else {
      return NextResponse.json(
        { error: "Поле text или messages обязательно" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Ошибка AI-сервиса", details: errData },
        { status: response.status }
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "Извините, не удалось получить ответ.";

    return NextResponse.json({ message: content });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
