import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://coofix.store/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug is required" },
        { status: 400 }
      );
    }

    // Try to get product by slug endpoint first
    try {
      const response = await fetch(`${API_URL}/products/slug/${slug}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.product) {
          return NextResponse.json(data);
        }
      }
    } catch (error) {
      // Continue to fallback method
    }

    // Fallback: Get all products and filter by slug
    try {
      const productsResponse = await fetch(`${API_URL}/products?limit=1000`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!productsResponse.ok) {
        return NextResponse.json(
          { success: false, message: "Failed to fetch products" },
          { status: productsResponse.status }
        );
      }

      const productsData = await productsResponse.json();
      
      if (productsData.success && productsData.products) {
        const product = productsData.products.find(
          (p: { slug: string }) => p.slug === slug
        );

        if (product) {
          return NextResponse.json({
            success: true,
            product,
          });
        }
      }

      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    } catch (fallbackError) {
      console.error("Fallback method also failed:", fallbackError);
      return NextResponse.json(
        { success: false, message: "Failed to fetch product" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
