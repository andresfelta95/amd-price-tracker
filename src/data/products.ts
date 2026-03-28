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
  // ===== GPUs — RDNA 4 (RX 9000 series) =====
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
      // 🇺🇸 US retailers (USD)
      { name: "Amazon", url: "https://www.amazon.com/s?k=AMD+Radeon+RX+9070+XT", price: 579, currency: "USD", region: "US", inStock: false, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://www.newegg.com/p/pl?d=AMD+Radeon+RX+9070+XT", price: 549, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy", url: "https://www.bestbuy.com/site/searchpage.jsp?st=AMD+Radeon+RX+9070+XT", price: 549, currency: "USD", region: "US", inStock: false, lastChecked: new Date().toISOString() },
      { name: "B&H Photo", url: "https://www.bhphotovideo.com/c/search?q=AMD+Radeon+RX+9070+XT", price: 559, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      // 🇨🇦 Canadian retailers (CAD)
      { name: "Amazon Canada", url: "https://www.amazon.ca/s?k=AMD+Radeon+RX+9070+XT", price: 799, currency: "CAD", region: "CA", inStock: false, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Search/Products?Search=RX+9070+XT", price: 789, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/search_results.php?keywords=RX+9070+XT", price: 779, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy Canada", url: "https://www.bestbuy.ca/en-ca/search?query=AMD+Radeon+RX+9070+XT", price: 779, currency: "CAD", region: "CA", inStock: false, lastChecked: new Date().toISOString() },
      { name: "Newegg Canada", url: "https://www.newegg.ca/p/pl?d=AMD+Radeon+RX+9070+XT", price: 769, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
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
      // 🇺🇸 US retailers (USD)
      { name: "Amazon", url: "https://www.amazon.com/s?k=AMD+Radeon+RX+9070", price: 469, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://www.newegg.com/p/pl?d=AMD+Radeon+RX+9070", price: 449, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy", url: "https://www.bestbuy.com/site/searchpage.jsp?st=AMD+Radeon+RX+9070", price: 449, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Micro Center", url: "https://www.microcenter.com/search/search_results.aspx?N=4294966995&query=RX+9070", price: 444, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      // 🇨🇦 Canadian retailers (CAD)
      { name: "Amazon Canada", url: "https://www.amazon.ca/s?k=AMD+Radeon+RX+9070", price: 659, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Search/Products?Search=RX+9070", price: 639, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/search_results.php?keywords=RX+9070", price: 629, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy Canada", url: "https://www.bestbuy.ca/en-ca/search?query=AMD+Radeon+RX+9070", price: 629, currency: "CAD", region: "CA", inStock: false, lastChecked: new Date().toISOString() },
      { name: "Newegg Canada", url: "https://www.newegg.ca/p/pl?d=AMD+Radeon+RX+9070", price: 639, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(459),
  },
  {
    id: "rx-9060-xt",
    name: "AMD Radeon RX 9060 XT",
    category: "gpu",
    image: "/gpu-placeholder.svg",
    specs: {
      "Stream Processors": "2048",
      "VRAM": "16GB GDDR6",
      "Boost Clock": "2.59 GHz",
      "Memory Bus": "128-bit",
      TDP: "165W",
      Architecture: "RDNA 4",
    },
    msrp: 329,
    currentLowest: 319,
    retailers: [
      // 🇺🇸 US retailers (USD)
      { name: "Amazon", url: "https://www.amazon.com/s?k=AMD+Radeon+RX+9060+XT", price: 349, currency: "USD", region: "US", inStock: false, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://www.newegg.com/p/pl?d=AMD+Radeon+RX+9060+XT", price: 329, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy", url: "https://www.bestbuy.com/site/searchpage.jsp?st=AMD+Radeon+RX+9060+XT", price: 329, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Micro Center", url: "https://www.microcenter.com/search/search_results.aspx?N=4294966995&query=RX+9060+XT", price: 319, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "B&H Photo", url: "https://www.bhphotovideo.com/c/search?q=AMD+Radeon+RX+9060+XT", price: 335, currency: "USD", region: "US", inStock: false, lastChecked: new Date().toISOString() },
      // 🇨🇦 Canadian retailers (CAD)
      { name: "Amazon Canada", url: "https://www.amazon.ca/s?k=AMD+Radeon+RX+9060+XT", price: 489, currency: "CAD", region: "CA", inStock: false, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Search/Products?Search=RX+9060+XT", price: 469, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/search_results.php?keywords=RX+9060+XT", price: 459, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy Canada", url: "https://www.bestbuy.ca/en-ca/search?query=AMD+Radeon+RX+9060+XT", price: 469, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg Canada", url: "https://www.newegg.ca/p/pl?d=AMD+Radeon+RX+9060+XT", price: 459, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(339),
  },
  {
    id: "rx-9060",
    name: "AMD Radeon RX 9060",
    category: "gpu",
    image: "/gpu-placeholder.svg",
    specs: {
      "Stream Processors": "1536",
      "VRAM": "8GB GDDR6",
      "Boost Clock": "2.49 GHz",
      "Memory Bus": "128-bit",
      TDP: "120W",
      Architecture: "RDNA 4",
    },
    msrp: 249,
    currentLowest: 239,
    retailers: [
      // 🇺🇸 US retailers (USD)
      { name: "Amazon", url: "https://www.amazon.com/s?k=AMD+Radeon+RX+9060", price: 259, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://www.newegg.com/p/pl?d=AMD+Radeon+RX+9060", price: 249, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy", url: "https://www.bestbuy.com/site/searchpage.jsp?st=AMD+Radeon+RX+9060", price: 249, currency: "USD", region: "US", inStock: false, lastChecked: new Date().toISOString() },
      { name: "Micro Center", url: "https://www.microcenter.com/search/search_results.aspx?N=4294966995&query=RX+9060", price: 239, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      // 🇨🇦 Canadian retailers (CAD)
      { name: "Amazon Canada", url: "https://www.amazon.ca/s?k=AMD+Radeon+RX+9060", price: 359, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Search/Products?Search=RX+9060", price: 349, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/search_results.php?keywords=RX+9060", price: 349, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy Canada", url: "https://www.bestbuy.ca/en-ca/search?query=AMD+Radeon+RX+9060", price: 349, currency: "CAD", region: "CA", inStock: false, lastChecked: new Date().toISOString() },
      { name: "Newegg Canada", url: "https://www.newegg.ca/p/pl?d=AMD+Radeon+RX+9060", price: 355, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(254),
  },
  {
    id: "rx-9050",
    name: "AMD Radeon RX 9050",
    category: "gpu",
    image: "/gpu-placeholder.svg",
    specs: {
      "Stream Processors": "1024",
      "VRAM": "8GB GDDR6",
      "Boost Clock": "2.45 GHz",
      "Memory Bus": "128-bit",
      TDP: "90W",
      Architecture: "RDNA 4",
    },
    msrp: 179,
    currentLowest: 169,
    retailers: [
      // 🇺🇸 US retailers (USD)
      { name: "Amazon", url: "https://www.amazon.com/s?k=AMD+Radeon+RX+9050", price: 179, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://www.newegg.com/p/pl?d=AMD+Radeon+RX+9050", price: 175, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy", url: "https://www.bestbuy.com/site/searchpage.jsp?st=AMD+Radeon+RX+9050", price: 179, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Micro Center", url: "https://www.microcenter.com/search/search_results.aspx?N=4294966995&query=RX+9050", price: 169, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      // 🇨🇦 Canadian retailers (CAD)
      { name: "Amazon Canada", url: "https://www.amazon.ca/s?k=AMD+Radeon+RX+9050", price: 259, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Search/Products?Search=RX+9050", price: 249, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/search_results.php?keywords=RX+9050", price: 249, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy Canada", url: "https://www.bestbuy.ca/en-ca/search?query=AMD+Radeon+RX+9050", price: 259, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg Canada", url: "https://www.newegg.ca/p/pl?d=AMD+Radeon+RX+9050", price: 255, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(179),
  },
  // ===== GPUs — RDNA 3 (RX 7000 series) =====
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
      // 🇺🇸 US retailers (USD)
      { name: "Amazon", url: "https://www.amazon.com/s?k=AMD+Radeon+RX+7900+XTX", price: 849, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://www.newegg.com/p/pl?d=AMD+Radeon+RX+7900+XTX", price: 879, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy", url: "https://www.bestbuy.com/site/searchpage.jsp?st=AMD+Radeon+RX+7900+XTX", price: 899, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "B&H Photo", url: "https://www.bhphotovideo.com/c/search?q=AMD+Radeon+RX+7900+XTX", price: 869, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      // 🇨🇦 Canadian retailers (CAD)
      { name: "Amazon Canada", url: "https://www.amazon.ca/s?k=AMD+Radeon+RX+7900+XTX", price: 1189, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Search/Products?Search=RX+7900+XTX", price: 1219, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/search_results.php?keywords=RX+7900+XTX", price: 1199, currency: "CAD", region: "CA", inStock: false, lastChecked: new Date().toISOString() },
      { name: "Best Buy Canada", url: "https://www.bestbuy.ca/en-ca/search?query=AMD+Radeon+RX+7900+XTX", price: 1259, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg Canada", url: "https://www.newegg.ca/p/pl?d=AMD+Radeon+RX+7900+XTX", price: 1229, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
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
      // 🇺🇸 US retailers (USD)
      { name: "Amazon", url: "https://www.amazon.com/s?k=AMD+Radeon+RX+7900+XT", price: 649, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://www.newegg.com/p/pl?d=AMD+Radeon+RX+7900+XT", price: 669, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy", url: "https://www.bestbuy.com/site/searchpage.jsp?st=AMD+Radeon+RX+7900+XT", price: 699, currency: "USD", region: "US", inStock: false, lastChecked: new Date().toISOString() },
      // 🇨🇦 Canadian retailers (CAD)
      { name: "Amazon Canada", url: "https://www.amazon.ca/s?k=AMD+Radeon+RX+7900+XT", price: 909, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Search/Products?Search=RX+7900+XT", price: 939, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/search_results.php?keywords=RX+7900+XT", price: 919, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy Canada", url: "https://www.bestbuy.ca/en-ca/search?query=AMD+Radeon+RX+7900+XT", price: 959, currency: "CAD", region: "CA", inStock: false, lastChecked: new Date().toISOString() },
      { name: "Newegg Canada", url: "https://www.newegg.ca/p/pl?d=AMD+Radeon+RX+7900+XT", price: 929, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
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
      // 🇺🇸 US retailers (USD)
      { name: "Amazon", url: "https://www.amazon.com/s?k=AMD+Radeon+RX+7800+XT", price: 429, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://www.newegg.com/p/pl?d=AMD+Radeon+RX+7800+XT", price: 439, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Micro Center", url: "https://www.microcenter.com/search/search_results.aspx?N=4294966995&query=RX+7800+XT", price: 419, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      // 🇨🇦 Canadian retailers (CAD)
      { name: "Amazon Canada", url: "https://www.amazon.ca/s?k=AMD+Radeon+RX+7800+XT", price: 599, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Search/Products?Search=RX+7800+XT", price: 609, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/search_results.php?keywords=RX+7800+XT", price: 599, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy Canada", url: "https://www.bestbuy.ca/en-ca/search?query=AMD+Radeon+RX+7800+XT", price: 619, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg Canada", url: "https://www.newegg.ca/p/pl?d=AMD+Radeon+RX+7800+XT", price: 609, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
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
