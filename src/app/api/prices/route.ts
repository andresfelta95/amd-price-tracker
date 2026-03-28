import { NextRequest, NextResponse } from "next/server";
import { products, getProductById, getProductsByCategory } from "@/data/products";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const category = searchParams.get("category");

  if (id) {
    const product = getProductById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  }

  if (category === "cpu" || category === "gpu") {
    return NextResponse.json(getProductsByCategory(category));
  }

  return NextResponse.json(products);
}
