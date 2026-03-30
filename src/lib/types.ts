export type ProductCategory = "cpu" | "gpu";

export interface Retailer {
  id?: number;
  name: string;
  url: string;
  price: number;
  currency?: "CAD";
  inStock: boolean;
  lastChecked: string;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface GpuVariant {
  id: number;
  productId: string;
  brand: string;
  variant: string;
  fullName: string;
  retailerName?: string;
  url?: string;
  currentPrice?: number;
  inStock?: boolean;
  priceHistory: PricePoint[];
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  image: string;
  specs: Record<string, string>;
  msrp: number;
  releaseDate?: string;
  currentLowest: number;
  retailers: Retailer[];
  priceHistory: PricePoint[];
  variants?: GpuVariant[];
}

export interface PriceAlert {
  id: string;
  productId: string;
  variantId?: number;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  isTriggered: boolean;
  createdAt: string;
  email: string;
}
