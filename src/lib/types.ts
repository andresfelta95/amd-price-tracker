export type ProductCategory = "cpu" | "gpu";

export interface Retailer {
  name: string;
  url: string;
  price: number;
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
