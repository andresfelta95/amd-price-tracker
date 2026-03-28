import { NextRequest, NextResponse } from "next/server";
import { PriceAlert } from "@/lib/types";

// In-memory store (in production, use a database)
let alerts: PriceAlert[] = [];

export async function GET() {
  return NextResponse.json(alerts);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, productName, targetPrice, currentPrice, email } = body;

    if (!productId || !targetPrice || !email) {
      return NextResponse.json(
        { error: "Missing required fields: productId, targetPrice, email" },
        { status: 400 }
      );
    }

    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      productId,
      productName: productName || productId,
      targetPrice,
      currentPrice: currentPrice || 0,
      isTriggered: currentPrice <= targetPrice,
      createdAt: new Date().toISOString(),
      email,
    };

    alerts.push(newAlert);
    return NextResponse.json(newAlert, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing alert id" }, { status: 400 });
  }

  alerts = alerts.filter((a) => a.id !== id);
  return NextResponse.json({ success: true });
}
