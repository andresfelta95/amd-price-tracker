import { Product } from "@/lib/types";

// Helper to generate realistic price history
function generatePriceHistory(
  basePrice: number,
  months: number = 6
): { date: string; price: number }[] {
  const history = [];
  const now = new Date();
  for (let i = months; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const variance = (Math.random() - 0.4) * basePrice * 0.15;
    history.push({
      date: date.toISOString().split("T")[0],
      price: Math.round((basePrice + variance) * 100) / 100,
    });
  }
  return history;
}

export const products: Product[] = [
  // ===== CPUs =====
  {
    id: "ryzen-9-9950x",
    name: "AMD Ryzen 9 9950X",
    category: "cpu",
    image: "/cpu-placeholder.svg",
    specs: {
      Cores: "16",
      Threads: "32",
      "Base Clock": "4.3 GHz",
      "Boost Clock": "5.7 GHz",
      TDP: "170W",
      Socket: "AM5",
      Cache: "80MB",
    },
    msrp: 599,
    currentLowest: 549,
    retailers: [
      { name: "Amazon", url: "https://amazon.com/dp/B0D5GH2KN7", price: 549, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://newegg.com/amd-ryzen-9-9950x", price: 559, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy", url: "https://bestbuy.com/site/amd-ryzen-9-9950x", price: 599, inStock: true, lastChecked: new Date().toISOString() },
      { name: "B&H Photo", url: "https://bhphotovideo.com/c/product/amd-ryzen-9-9950x", price: 555, inStock: false, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(579),
  },
  {
    id: "ryzen-9-9900x",
    name: "AMD Ryzen 9 9900X",
    category: "cpu",
    image: "/cpu-placeholder.svg",
    specs: {
      Cores: "12",
      Threads: "24",
      "Base Clock": "4.4 GHz",
      "Boost Clock": "5.6 GHz",
      TDP: "120W",
      Socket: "AM5",
      Cache: "76MB",
    },
    msrp: 449,
    currentLowest: 399,
    retailers: [
      { name: "Amazon", url: "https://amazon.com/dp/B0D5GHXK42", price: 399, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://newegg.com/amd-ryzen-9-9900x", price: 419, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy", url: "https://bestbuy.com/site/amd-ryzen-9-9900x", price: 449, inStock: false, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(429),
  },
  {
    id: "ryzen-7-9700x",
    name: "AMD Ryzen 7 9700X",
    category: "cpu",
    image: "/cpu-placeholder.svg",
    specs: {
      Cores: "8",
      Threads: "16",
      "Base Clock": "3.8 GHz",
      "Boost Clock": "5.5 GHz",
      TDP: "65W",
      Socket: "AM5",
      Cache: "40MB",
    },
    msrp: 349,
    currentLowest: 299,
    retailers: [
      { name: "Amazon", url: "https://amazon.com/dp/B0D5GJ2K77", price: 299, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://newegg.com/amd-ryzen-7-9700x", price: 309, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy", url: "https://bestbuy.com/site/amd-ryzen-7-9700x", price: 349, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Micro Center", url: "https://microcenter.com/product/amd-ryzen-7-9700x", price: 289, inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(319),
  },
  {
    id: "ryzen-5-9600x",
    name: "AMD Ryzen 5 9600X",
    category: "cpu",
    image: "/cpu-placeholder.svg",
    specs: {
      Cores: "6",
      Threads: "12",
      "Base Clock": "3.9 GHz",
      "Boost Clock": "5.4 GHz",
      TDP: "65W",
      Socket: "AM5",
      Cache: "38MB",
    },
    msrp: 279,
    currentLowest: 229,
    retailers: [
      { name: "Amazon", url: "https://amazon.com/dp/B0D5GK1234", price: 229, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://newegg.com/amd-ryzen-5-9600x", price: 239, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Micro Center", url: "https://microcenter.com/product/amd-ryzen-5-9600x", price: 219, inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(249),
  },
  {
    id: "ryzen-7-7800x3d",
    name: "AMD Ryzen 7 7800X3D",
    category: "cpu",
    image: "/cpu-placeholder.svg",
    specs: {
      Cores: "8",
      Threads: "16",
      "Base Clock": "4.2 GHz",
      "Boost Clock": "5.0 GHz",
      TDP: "120W",
      Socket: "AM5",
      Cache: "104MB (3D V-Cache)",
    },
    msrp: 449,
    currentLowest: 339,
    retailers: [
      { name: "Amazon", url: "https://amazon.com/dp/B0BTZB7F88", price: 339, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://newegg.com/amd-ryzen-7-7800x3d", price: 349, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy", url: "https://bestbuy.com/site/amd-ryzen-7-7800x3d", price: 359, inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(379),
  },
  // ===== GPUs =====
  {
    id: "rx-9070-xt",
    name: "AMD Radeon RX 9070 XT",
    category: "gpu",
    image: "/gpu-placeholder.svg",
    specs: {
      "Stream Processors": "8192",
      "VRAM": "16GB GDDR6",
      "Boost Clock": "2.52 GHz",
      "Memory Bus": "256-bit",
      TDP: "300W",
      Architecture: "RDNA 4",
    },
    msrp: 549,
    currentLowest: 549,
    retailers: [
      { name: "Amazon", url: "https://amazon.com/dp/B0DRX9070XT", price: 579, inStock: false, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://newegg.com/amd-radeon-rx-9070-xt", price: 549, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy", url: "https://bestbuy.com/site/amd-radeon-rx-9070-xt", price: 549, inStock: false, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(569),
  },
  {
    id: "rx-9070",
    name: "AMD Radeon RX 9070",
    category: "gpu",
    image: "/gpu-placeholder.svg",
    specs: {
      "Stream Processors": "6144",
      "VRAM": "16GB GDDR6",
      "Boost Clock": "2.39 GHz",
      "Memory Bus": "256-bit",
      TDP: "250W",
      Architecture: "RDNA 4",
    },
    msrp: 449,
    currentLowest: 449,
    retailers: [
      { name: "Amazon", url: "https://amazon.com/dp/B0DRX9070", price: 469, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://newegg.com/amd-radeon-rx-9070", price: 449, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy", url: "https://bestbuy.com/site/amd-radeon-rx-9070", price: 449, inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(459),
  },
  {
    id: "rx-7900-xtx",
    name: "AMD Radeon RX 7900 XTX",
    category: "gpu",
    image: "/gpu-placeholder.svg",
    specs: {
      "Stream Processors": "12288",
      "VRAM": "24GB GDDR6",
      "Boost Clock": "2.5 GHz",
      "Memory Bus": "384-bit",
      TDP: "355W",
      Architecture: "RDNA 3",
    },
    msrp: 999,
    currentLowest: 849,
    retailers: [
      { name: "Amazon", url: "https://amazon.com/dp/B0BSKMXFYJ", price: 849, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://newegg.com/amd-radeon-rx-7900-xtx", price: 879, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy", url: "https://bestbuy.com/site/amd-radeon-rx-7900-xtx", price: 899, inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(899),
  },
  {
    id: "rx-7900-xt",
    name: "AMD Radeon RX 7900 XT",
    category: "gpu",
    image: "/gpu-placeholder.svg",
    specs: {
      "Stream Processors": "10752",
      "VRAM": "20GB GDDR6",
      "Boost Clock": "2.4 GHz",
      "Memory Bus": "320-bit",
      TDP: "315W",
      Architecture: "RDNA 3",
    },
    msrp: 799,
    currentLowest: 649,
    retailers: [
      { name: "Amazon", url: "https://amazon.com/dp/B0BSKMXF22", price: 649, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://newegg.com/amd-radeon-rx-7900-xt", price: 669, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy", url: "https://bestbuy.com/site/amd-radeon-rx-7900-xt", price: 699, inStock: false, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(699),
  },
  {
    id: "rx-7800-xt",
    name: "AMD Radeon RX 7800 XT",
    category: "gpu",
    image: "/gpu-placeholder.svg",
    specs: {
      "Stream Processors": "7680",
      "VRAM": "16GB GDDR6",
      "Boost Clock": "2.43 GHz",
      "Memory Bus": "256-bit",
      TDP: "263W",
      Architecture: "RDNA 3",
    },
    msrp: 499,
    currentLowest: 429,
    retailers: [
      { name: "Amazon", url: "https://amazon.com/dp/B0CG3LY9LR", price: 429, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://newegg.com/amd-radeon-rx-7800-xt", price: 439, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Micro Center", url: "https://microcenter.com/product/amd-radeon-rx-7800-xt", price: 419, inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(459),
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: "cpu" | "gpu"): Product[] {
  return products.filter((p) => p.category === category);
}
