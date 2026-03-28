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
  // ===== GPUs — RDNA 4 (RX 9000 series) =====
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
    id: "rx-9060-xt-8gb",
    name: "AMD Radeon RX 9060 XT 8GB",
    category: "gpu",
    image: "/gpu-placeholder.svg",
    specs: {
      "Stream Processors": "2048",
      "VRAM": "8GB GDDR6",
      "Boost Clock": "2.59 GHz",
      "Memory Bus": "128-bit",
      TDP: "150W",
      Architecture: "RDNA 4",
    },
    msrp: 299,
    currentLowest: 289,
    retailers: [
      // 🇺🇸 US retailers (USD)
      { name: "Amazon", url: "https://www.amazon.com/s?k=AMD+Radeon+RX+9060+XT+8GB", price: 309, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://www.newegg.com/p/pl?d=AMD+Radeon+RX+9060+XT+8GB", price: 299, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy", url: "https://www.bestbuy.com/site/searchpage.jsp?st=AMD+Radeon+RX+9060+XT+8GB", price: 299, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Micro Center", url: "https://www.microcenter.com/search/search_results.aspx?N=4294966995&query=RX+9060+XT+8GB", price: 289, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "B&H Photo", url: "https://www.bhphotovideo.com/c/search?q=AMD+Radeon+RX+9060+XT+8GB", price: 305, currency: "USD", region: "US", inStock: false, lastChecked: new Date().toISOString() },
      // 🇨🇦 Canadian retailers (CAD)
      { name: "Amazon Canada", url: "https://www.amazon.ca/s?k=AMD+Radeon+RX+9060+XT+8GB", price: 449, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Search/Products?Search=RX+9060+XT+8GB", price: 429, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/search_results.php?keywords=RX+9060+XT+8GB", price: 419, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy Canada", url: "https://www.bestbuy.ca/en-ca/search?query=AMD+Radeon+RX+9060+XT+8GB", price: 429, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg Canada", url: "https://www.newegg.ca/p/pl?d=AMD+Radeon+RX+9060+XT+8GB", price: 419, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(304),
  },
  {
    id: "rx-9060-xt-16gb",
    name: "AMD Radeon RX 9060 XT 16GB",
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
    msrp: 349,
    currentLowest: 339,
    retailers: [
      // 🇺🇸 US retailers (USD)
      { name: "Amazon", url: "https://www.amazon.com/s?k=AMD+Radeon+RX+9060+XT+16GB", price: 369, currency: "USD", region: "US", inStock: false, lastChecked: new Date().toISOString() },
      { name: "Newegg", url: "https://www.newegg.com/p/pl?d=AMD+Radeon+RX+9060+XT+16GB", price: 349, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy", url: "https://www.bestbuy.com/site/searchpage.jsp?st=AMD+Radeon+RX+9060+XT+16GB", price: 349, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Micro Center", url: "https://www.microcenter.com/search/search_results.aspx?N=4294966995&query=RX+9060+XT+16GB", price: 339, currency: "USD", region: "US", inStock: true, lastChecked: new Date().toISOString() },
      { name: "B&H Photo", url: "https://www.bhphotovideo.com/c/search?q=AMD+Radeon+RX+9060+XT+16GB", price: 355, currency: "USD", region: "US", inStock: false, lastChecked: new Date().toISOString() },
      // 🇨🇦 Canadian retailers (CAD)
      { name: "Amazon Canada", url: "https://www.amazon.ca/s?k=AMD+Radeon+RX+9060+XT+16GB", price: 519, currency: "CAD", region: "CA", inStock: false, lastChecked: new Date().toISOString() },
      { name: "Memory Express", url: "https://www.memoryexpress.com/Search/Products?Search=RX+9060+XT+16GB", price: 499, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Canada Computers", url: "https://www.canadacomputers.com/search_results.php?keywords=RX+9060+XT+16GB", price: 489, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Best Buy Canada", url: "https://www.bestbuy.ca/en-ca/search?query=AMD+Radeon+RX+9060+XT+16GB", price: 499, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
      { name: "Newegg Canada", url: "https://www.newegg.ca/p/pl?d=AMD+Radeon+RX+9060+XT+16GB", price: 489, currency: "CAD", region: "CA", inStock: true, lastChecked: new Date().toISOString() },
    ],
    priceHistory: generatePriceHistory(354),
  },
  // ===== GPUs — RDNA 3 (RX 7000 series) =====
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
    priceHistory: generatePriceHistory(599),
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: "cpu" | "gpu"): Product[] {
  return products.filter((p) => p.category === category);
}
