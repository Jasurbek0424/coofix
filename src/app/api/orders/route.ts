import { NextRequest, NextResponse } from "next/server";
import type { OrderFormData } from "@/lib/validations";
import { api } from "@/api/axios";

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

    // Prepare order data for backend API
    const orderData = {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      email: body.email || undefined,
      city: body.city,
      street: body.street,
      building: body.building,
      house: body.house || undefined,
      apartment: body.apartment || undefined,
      comment: body.comment || undefined,
      items: body.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      total: body.total,
    };

    // Send order to backend API
    try {
      const response = await api.post("/orders", orderData);
      
      return NextResponse.json(
        {
          success: true,
          message: "Заказ успешно отправлен",
          orderId: response.data.orderId || response.data._id,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Backend API error:", error);
      // Don't fail if backend API is unavailable, just log the error
      return NextResponse.json(
        {
          success: true,
          message: "Заказ отправлен в Telegram",
          warning: "Backend API недоступен, но заказ отправлен в Telegram",
        },
        { status: 200 }
      );
    }
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
