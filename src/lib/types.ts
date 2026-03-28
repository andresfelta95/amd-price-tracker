export type ProductCategory = "cpu" | "gpu";

export interface Retailer {
  name: string;
  url: string;
  price: number;
  /** ISO 4217 currency code. Defaults to "USD" if omitted. */
  currency?: "USD" | "CAD";
  /** Market region. Defaults to "US" if omitted. */
  region?: "US" | "CA";
  inStock: boolean;
  lastChecked: string;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  image: string;
  specs: Record<string, string>;
  msrp: number;
  currentLowest: number;
  retailers: Retailer[];
  priceHistory: PricePoint[];
}

export interface PriceAlert {
  id: string;
  productId: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  isTriggered: boolean;
  createdAt: string;
  email: string;
}
