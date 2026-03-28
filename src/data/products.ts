import { Product } from "@/lib/types";

// Helper to generate realistic price history (in CAD)
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
      Architecture: "Zen 5",
    },
    msrp: 899,
    currentLowest: 699,
    retailers: [
      { name: "Amazon.ca", url: "https://www.amazon.ca/AMD-RyzenTM-9950X-32-Thread-Processor/dp/B0D6NNRBGP", price: 729, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg.ca", url: "https://www.newegg.ca/amd-ryzen-9-9000-series-ryzen-9-9950x-granite-ridge-socket-am5-desktop-cpu-processor/p/N82E16819113841", price: 759, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/en/amd-desktop-processors/258538/amd-ryzen-9-9950x-16-core-32thread-4nm-zen-5-cpu-100-100001277wof.html", price: 749, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Products/MX00130358", price: 699, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy Canada", url: "https://www.bestbuy.ca/en-ca/product/amd-ryzen-9-9950x-16-core-5-7ghz-am5-processor/18166456", price: 899, inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(769),
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
      Architecture: "Zen 5",
    },
    msrp: 639,
    currentLowest: 519,
    retailers: [
      { name: "Amazon.ca", url: "https://www.amazon.ca/s?k=AMD+Ryzen+9+9900X", price: 549, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg.ca", url: "https://www.newegg.ca/amd-ryzen-9-9000-series-ryzen-9-9900x-granite-ridge-socket-am5-desktop-cpu-processor/p/N82E16819113842", price: 559, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/en/amd-desktop-processors/258536/amd-ryzen-9-9900x-12-core-24thread-4nm-zen-5-cpu-100-100000662wof.html", price: 539, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Products/MX00130359", price: 519, inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(569),
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
      Architecture: "Zen 5",
    },
    msrp: 499,
    currentLowest: 389,
    retailers: [
      { name: "Amazon.ca", url: "https://www.amazon.ca/s?k=AMD+Ryzen+7+9700X", price: 419, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg.ca", url: "https://www.newegg.ca/amd-ryzen-7-9700x-ryzen-7-9000-series-granite-ridge-socket-am5-processor/p/N82E16819113843", price: 409, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/en/amd-desktop-processors/258320/amd-ryzen-7-9700x-8-core-16thread-4nm-zen-5-cpu-100-100001404wof.html", price: 399, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Products/MX00130360", price: 389, inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(429),
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
      Architecture: "Zen 5",
    },
    msrp: 399,
    currentLowest: 279,
    retailers: [
      { name: "Amazon.ca", url: "https://www.amazon.ca/s?k=AMD+Ryzen+5+9600X", price: 309, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg.ca", url: "https://www.newegg.ca/p/pl?d=ryzen+5+9600x", price: 299, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/en/amd-desktop-processors/258318/amd-ryzen-5-9600x-6-core-12thread-4nm-zen-5-cpu-100-100001405wof.html", price: 289, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Products/MX00130363", price: 279, inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(319),
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
      Architecture: "Zen 4",
    },
    msrp: 599,
    currentLowest: 449,
    retailers: [
      { name: "Amazon.ca", url: "https://www.amazon.ca/dp/B0BTZB7F88", price: 469, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg.ca", url: "https://www.newegg.ca/p/pl?d=7800x3d", price: 479, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/en/amd-desktop-processors/235997/amd-ryzen-7-7800x3d-8-core-16-thread-5nm-104mb-cache-120w-zen-4-cpu-100-100000910wof.html", price: 459, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Products/MX00124510", price: 449, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy Canada", url: "https://www.bestbuy.ca/en-ca/product/amd-ryzen-7-7800x3d-8-core-4-2ghz-am5-processor/16694883", price: 569, inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(499),
  },
  // ===== GPUs =====
  {
    id: "rx-9070-xt",
    name: "AMD Radeon RX 9070 XT",
    category: "gpu",
    image: "/gpu-placeholder.svg",
    specs: {
      "Compute Units": "64",
      "Stream Processors": "4096",
      VRAM: "16GB GDDR6",
      "Boost Clock": "2.97 GHz",
      "Memory Bus": "256-bit",
      TDP: "304W",
      Architecture: "RDNA 4",
    },
    msrp: 829,
    currentLowest: 799,
    retailers: [
      { name: "Amazon.ca", url: "https://www.amazon.ca/s?k=rx+9070+xt", price: 949, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg.ca", url: "https://www.newegg.ca/p/pl?d=rx+9070+xt", price: 849, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/en/powered-by-amd/269139/sapphire-pulse-amd-radeon-rx-9070-xt-16gb-gddr6-11348-03-20g.html", price: 799, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Category/VideoCards?FilterID=8ee43c41-14eb-f788-1cd4-57dbe89e5279", price: 829, inStock: false, lastChecked: new Date().toISOString() },
      { name: "Best Buy Canada", url: "https://www.bestbuy.ca/en-ca/search?search=rx+9070+xt", price: 849, inStock: false, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(859),
  },
  {
    id: "rx-9070",
    name: "AMD Radeon RX 9070",
    category: "gpu",
    image: "/gpu-placeholder.svg",
    specs: {
      "Compute Units": "56",
      "Stream Processors": "3584",
      VRAM: "16GB GDDR6",
      "Boost Clock": "2.54 GHz",
      "Memory Bus": "256-bit",
      TDP: "220W",
      Architecture: "RDNA 4",
    },
    msrp: 679,
    currentLowest: 649,
    retailers: [
      { name: "Amazon.ca", url: "https://www.amazon.ca/s?k=rx+9070+amd", price: 749, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg.ca", url: "https://www.newegg.ca/p/pl?d=rx+9070", price: 699, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/en/914/graphics-cards?q=GPU-Radeon+RX+9070", price: 649, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Category/VideoCards?FilterID=43b0a0e5-8bec-cce5-a2f4-e2a85c25c3a0", price: 679, inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(699),
  },
  {
    id: "rx-9060-xt",
    name: "AMD Radeon RX 9060 XT",
    category: "gpu",
    image: "/gpu-placeholder.svg",
    specs: {
      "Compute Units": "32",
      "Stream Processors": "2048",
      VRAM: "16GB GDDR6",
      "Boost Clock": "3.13 GHz",
      "Memory Bus": "128-bit",
      TDP: "150W",
      Architecture: "RDNA 4",
    },
    msrp: 499,
    currentLowest: 479,
    retailers: [
      { name: "Amazon.ca", url: "https://www.amazon.ca/s?k=rx+9060+xt", price: 509, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg.ca", url: "https://www.newegg.ca/p/pl?d=rx+9060+xt", price: 499, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/en/powered-by-amd/274097/powercolor-reaper-amd-radeon-rx-9060-xt-16gb-rx9060xt-16g-a.html", price: 479, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Products/MX00134009", price: 489, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy Canada", url: "https://www.bestbuy.ca/en-ca/collection/amd-radeon-9060-xt/blt8db66e4a9729feec", price: 499, inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(499),
  },
  {
    id: "rx-7900-xtx",
    name: "AMD Radeon RX 7900 XTX",
    category: "gpu",
    image: "/gpu-placeholder.svg",
    specs: {
      "Compute Units": "96",
      "Stream Processors": "12288",
      VRAM: "24GB GDDR6",
      "Boost Clock": "2.5 GHz",
      "Memory Bus": "384-bit",
      TDP: "355W",
      Architecture: "RDNA 3",
    },
    msrp: 1399,
    currentLowest: 1099,
    retailers: [
      { name: "Amazon.ca", url: "https://www.amazon.ca/s?k=rx+7900+xtx", price: 1199, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg.ca", url: "https://www.newegg.ca/p/pl?d=rx+7900+xtx", price: 1149, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/en/powered-by-amd/235517/sapphire-pulse-amd-radeon-rx-7900-xtx-24gb-graphics-card-11322-02-20g.html", price: 1099, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Category/VideoCards?FilterID=d6e8b9c2-b3a1-47d2-82f5-1a9b5c7e3d4f", price: 1129, inStock: false, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(1199),
  },
  {
    id: "rx-7900-xt",
    name: "AMD Radeon RX 7900 XT",
    category: "gpu",
    image: "/gpu-placeholder.svg",
    specs: {
      "Compute Units": "84",
      "Stream Processors": "10752",
      VRAM: "20GB GDDR6",
      "Boost Clock": "2.4 GHz",
      "Memory Bus": "320-bit",
      TDP: "315W",
      Architecture: "RDNA 3",
    },
    msrp: 1129,
    currentLowest: 849,
    retailers: [
      { name: "Amazon.ca", url: "https://www.amazon.ca/s?k=rx+7900+xt+amd", price: 899, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg.ca", url: "https://www.newegg.ca/p/pl?d=rx+7900+xt", price: 879, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/en/powered-by-amd/235518/sapphire-pulse-amd-radeon-rx-7900-xt-20gb-graphics-card-11323-02-20g.html", price: 849, inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(929),
  },
  {
    id: "rx-7800-xt",
    name: "AMD Radeon RX 7800 XT",
    category: "gpu",
    image: "/gpu-placeholder.svg",
    specs: {
      "Compute Units": "60",
      "Stream Processors": "7680",
      VRAM: "16GB GDDR6",
      "Boost Clock": "2.43 GHz",
      "Memory Bus": "256-bit",
      TDP: "263W",
      Architecture: "RDNA 3",
    },
    msrp: 699,
    currentLowest: 549,
    retailers: [
      { name: "Amazon.ca", url: "https://www.amazon.ca/s?k=rx+7800+xt", price: 589, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg.ca", url: "https://www.newegg.ca/p/pl?d=rx+7800+xt", price: 569, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/en/powered-by-amd/244943/xfx-speedster-qick319-radeon-rx-7800-xt-core-16gb-gddr6-rx-78tqickf9.html", price: 549, inStock: true, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Category/VideoCards?FilterID=d8be8ebc-ce89-dc84-8ce2-c2d09de7ac3e", price: 559, inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(599),
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: "cpu" | "gpu"): Product[] {
  return products.filter((p) => p.category === category);
}
