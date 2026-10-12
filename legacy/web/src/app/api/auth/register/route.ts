import { NextRequest, NextResponse } from "next/server";
import type { RegisterData, AuthResponse } from "@/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://coofix.store/api";

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json();
    
    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: "Email и пароль обязательны" },
        { status: 400 }
      );
    }

    // Backend expects 'name' field, so combine firstName and lastName
    const payload = {
      email: body.email,
      password: body.password,
      phone: body.phone,
      name: [body.firstName, body.lastName].filter(Boolean).join(" ").trim() || undefined,
    };

    // Forward request to backend API
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let data: AuthResponse;
    try {
      data = await response.json();
    } catch (parseError) {
      // If response is not JSON, create a basic error response
      return NextResponse.json(
        {
          success: false,
          message: response.status === 400 
            ? "Некорректные данные" 
            : response.status === 409
            ? "Пользователь с таким email уже существует"
            : "Ошибка при регистрации",
        },
        { status: response.status }
      );
    }

    if (!response.ok) {
      // Extract error message from response
      const errorMessage = data.message || 
        (response.status === 400 && "Некорректные данные") ||
        (response.status === 409 && "Пользователь с таким email уже существует") ||
        "Ошибка при регистрации";
      
      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
        },
        { status: response.status }
      );
    }

    // Return successful response
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка сервера. Попробуйте позже.",
      },
      { status: 500 }
    );
  }
}

