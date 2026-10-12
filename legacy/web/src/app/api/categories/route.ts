import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://coofix.store/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parent = searchParams.get("parent");

    // Build URL with optional parent parameter
    let url = `${API_URL}/categories`;
    if (parent) {
      url += `?parent=${parent}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Ошибка при загрузке категорий" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка сервера. Попробуйте позже.",
      },
      { status: 500 }
    );
  }
}

