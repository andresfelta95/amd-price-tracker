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
  currentLowest: number | null;
  retailers: Retailer[];
  priceHistory: PricePoint[];
  variants?: GpuVariant[];
}

export interface PriceAlert {
  id: number;
  productId: string;
  productName: string;
  targetPrice: number;
  /** Cheapest fresh, in-stock price right now (null if none) */
  currentPrice: number | null;
  currentRetailer: string | null;
  belowTarget: boolean;
  active: boolean;
  lastNotifiedAt: string | null;
  lastNotifiedPrice: number | null;
  createdAt: string;
}

export interface SessionInfo {
  user: {
    id: number;
    email: string;
    emailVerified: boolean;
    telegramLinked: boolean;
    notifyEmail: boolean;
    notifyTelegram: boolean;
  } | null;
  alertCount: number;
}
