import { NextRequest, NextResponse } from "next/server";
import { scrapeAllPrices } from "@/lib/scraper";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const product = searchParams.get("product");

  if (!product) {
    return NextResponse.json(
      { error: "Missing 'product' query parameter" },
      { status: 400 }
    );
  }

  try {
    const prices = await scrapeAllPrices(product);
    return NextResponse.json({
      product,
      scrapedAt: new Date().toISOString(),
      prices,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Scraping failed", details: String(error) },
      { status: 500 }
    );
  }
}
