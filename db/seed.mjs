// db/seed.mjs — run with: node db/seed.mjs
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  connectionString: 'postgresql://amd_tracker:amd_tracker_pass@localhost:5433/amd_tracker',
});

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// ── Canadian retailers ────────────────────────────────────────────────────────
const CA_RETAILERS = [
  { name: 'Amazon.ca',         url: 'https://www.amazon.ca' },
  { name: 'Newegg.ca',         url: 'https://www.newegg.ca' },
  { name: 'Canada Computers',  url: 'https://www.canadacomputers.com' },
  { name: 'Memory Express',    url: 'https://www.memoryexpress.com' },
  { name: 'Best Buy Canada',   url: 'https://www.bestbuy.ca' },
];

// ── Products (CA-only) ────────────────────────────────────────────────────────
const PRODUCTS = [
  // CPUs
  {
    id: 'ryzen-9-9950x', name: 'AMD Ryzen 9 9950X', category: 'cpu',
    image: '/cpu-placeholder.svg', msrp: 899,
    release_date: '2024-11-07',
    specs: { Cores:'16', Threads:'32', 'Base Clock':'4.3 GHz', 'Boost Clock':'5.7 GHz', TDP:'170W', Socket:'AM5', Cache:'80MB', Architecture:'Zen 5' },
    retailers: [
      { name:'Amazon.ca',        price:729, url:'https://www.amazon.ca/AMD-RyzenTM-9950X-32-Thread-Processor/dp/B0D6NNRBGP', inStock:true },
      { name:'Newegg.ca',        price:759, url:'https://www.newegg.ca/amd-ryzen-9-9000-series-ryzen-9-9950x-granite-ridge-socket-am5-desktop-cpu-processor/p/N82E16819113841', inStock:true },
      { name:'Canada Computers', price:749, url:'https://www.canadacomputers.com/en/amd-desktop-processors/258538/amd-ryzen-9-9950x-16-core-32thread-4nm-zen-5-cpu-100-100001277wof.html', inStock:true },
      { name:'Memory Express',   price:699, url:'https://www.memoryexpress.com/Products/MX00130358', inStock:true },
      { name:'Best Buy Canada',  price:899, url:'https://www.bestbuy.ca/en-ca/product/amd-ryzen-9-9950x-16-core-5-7ghz-am5-processor/18166456', inStock:true },
    ],
  },
  {
    id: 'ryzen-9-9900x', name: 'AMD Ryzen 9 9900X', category: 'cpu',
    image: '/cpu-placeholder.svg', msrp: 639,
    release_date: '2024-11-07',
    specs: { Cores:'12', Threads:'24', 'Base Clock':'4.4 GHz', 'Boost Clock':'5.6 GHz', TDP:'120W', Socket:'AM5', Cache:'76MB', Architecture:'Zen 5' },
    retailers: [
      { name:'Amazon.ca',        price:549, url:'https://www.amazon.ca/s?k=AMD+Ryzen+9+9900X', inStock:true },
      { name:'Newegg.ca',        price:559, url:'https://www.newegg.ca/amd-ryzen-9-9000-series-ryzen-9-9900x-granite-ridge-socket-am5-desktop-cpu-processor/p/N82E16819113842', inStock:true },
      { name:'Canada Computers', price:539, url:'https://www.canadacomputers.com/en/amd-desktop-processors/258536/amd-ryzen-9-9900x-12-core-24thread-4nm-zen-5-cpu-100-100000662wof.html', inStock:true },
      { name:'Memory Express',   price:519, url:'https://www.memoryexpress.com/Products/MX00130359', inStock:true },
    ],
  },
  {
    id: 'ryzen-7-9700x', name: 'AMD Ryzen 7 9700X', category: 'cpu',
    image: '/cpu-placeholder.svg', msrp: 499,
    release_date: '2024-08-08',
    specs: { Cores:'8', Threads:'16', 'Base Clock':'3.8 GHz', 'Boost Clock':'5.5 GHz', TDP:'65W', Socket:'AM5', Cache:'40MB', Architecture:'Zen 5' },
    retailers: [
      { name:'Amazon.ca',        price:419, url:'https://www.amazon.ca/s?k=AMD+Ryzen+7+9700X', inStock:true },
      { name:'Newegg.ca',        price:409, url:'https://www.newegg.ca/amd-ryzen-7-9700x-ryzen-7-9000-series-granite-ridge-socket-am5-processor/p/N82E16819113843', inStock:true },
      { name:'Canada Computers', price:399, url:'https://www.canadacomputers.com/en/amd-desktop-processors/258320/amd-ryzen-7-9700x-8-core-16thread-4nm-zen-5-cpu-100-100001404wof.html', inStock:true },
      { name:'Memory Express',   price:389, url:'https://www.memoryexpress.com/Products/MX00130360', inStock:true },
    ],
  },
  {
    id: 'ryzen-5-9600x', name: 'AMD Ryzen 5 9600X', category: 'cpu',
    image: '/cpu-placeholder.svg', msrp: 399,
    release_date: '2024-08-08',
    specs: { Cores:'6', Threads:'12', 'Base Clock':'3.9 GHz', 'Boost Clock':'5.4 GHz', TDP:'65W', Socket:'AM5', Cache:'38MB', Architecture:'Zen 5' },
    retailers: [
      { name:'Amazon.ca',        price:309, url:'https://www.amazon.ca/s?k=AMD+Ryzen+5+9600X', inStock:true },
      { name:'Newegg.ca',        price:299, url:'https://www.newegg.ca/p/pl?d=ryzen+5+9600x', inStock:true },
      { name:'Canada Computers', price:289, url:'https://www.canadacomputers.com/en/amd-desktop-processors/258318/amd-ryzen-5-9600x-6-core-12thread-4nm-zen-5-cpu-100-100001405wof.html', inStock:true },
      { name:'Memory Express',   price:279, url:'https://www.memoryexpress.com/Products/MX00130363', inStock:true },
    ],
  },
  {
    id: 'ryzen-7-7800x3d', name: 'AMD Ryzen 7 7800X3D', category: 'cpu',
    image: '/cpu-placeholder.svg', msrp: 599,
    release_date: '2023-04-06',
    specs: { Cores:'8', Threads:'16', 'Base Clock':'4.2 GHz', 'Boost Clock':'5.0 GHz', TDP:'120W', Socket:'AM5', Cache:'104MB (3D V-Cache)', Architecture:'Zen 4' },
    retailers: [
      { name:'Amazon.ca',        price:469, url:'https://www.amazon.ca/dp/B0BTZB7F88', inStock:true },
      { name:'Newegg.ca',        price:479, url:'https://www.newegg.ca/p/pl?d=7800x3d', inStock:true },
      { name:'Canada Computers', price:459, url:'https://www.canadacomputers.com/en/amd-desktop-processors/235997/amd-ryzen-7-7800x3d-8-core-16-thread-5nm-104mb-cache-120w-zen-4-cpu-100-100000910wof.html', inStock:true },
      { name:'Memory Express',   price:449, url:'https://www.memoryexpress.com/Products/MX00124510', inStock:true },
      { name:'Best Buy Canada',  price:569, url:'https://www.bestbuy.ca/en-ca/product/amd-ryzen-7-7800x3d-8-core-4-2ghz-am5-processor/16694883', inStock:true },
    ],
  },
  // GPUs
  {
    id: 'rx-9070-xt', name: 'AMD Radeon RX 9070 XT', category: 'gpu',
    image: '/gpu-placeholder.svg', msrp: 829,
    release_date: '2025-03-05',
    specs: { 'Compute Units':'64', 'Stream Processors':'4096', VRAM:'16GB GDDR6', 'Boost Clock':'2.97 GHz', 'Memory Bus':'256-bit', TDP:'304W', Architecture:'RDNA 4' },
    retailers: [
      { name:'Amazon.ca',        price:799, url:'https://www.amazon.ca/s?k=AMD+Radeon+RX+9070+XT', inStock:false },
      { name:'Memory Express',   price:789, url:'https://www.memoryexpress.com/Search/Products?Search=RX+9070+XT', inStock:true },
      { name:'Canada Computers', price:779, url:'https://www.canadacomputers.com/search_results.php?keywords=RX+9070+XT', inStock:true },
      { name:'Best Buy Canada',  price:779, url:'https://www.bestbuy.ca/en-ca/search?query=AMD+Radeon+RX+9070+XT', inStock:false },
      { name:'Newegg.ca',        price:769, url:'https://www.newegg.ca/p/pl?d=AMD+Radeon+RX+9070+XT', inStock:true },
    ],
    variants: [
      { brand:'ASUS',       variant:'TUF Gaming OC',     full_name:'ASUS TUF Gaming Radeon RX 9070 XT OC 16GB',       retailer:'Canada Computers', price:849, url:'https://www.canadacomputers.com/search_results.php?keywords=ASUS+TUF+RX+9070+XT', inStock:true },
      { brand:'ASUS',       variant:'ROG Strix OC',       full_name:'ASUS ROG Strix Radeon RX 9070 XT OC 16GB',        retailer:'Memory Express',   price:949, url:'https://www.memoryexpress.com/Search/Products?Search=ROG+Strix+RX+9070+XT', inStock:false },
      { brand:'Gigabyte',   variant:'Gaming OC',          full_name:'Gigabyte Radeon RX 9070 XT Gaming OC 16GB',       retailer:'Newegg.ca',        price:829, url:'https://www.newegg.ca/p/pl?d=Gigabyte+RX+9070+XT', inStock:true },
      { brand:'Gigabyte',   variant:'AORUS Elite',        full_name:'Gigabyte AORUS Radeon RX 9070 XT Elite 16GB',     retailer:'Canada Computers', price:889, url:'https://www.canadacomputers.com/search_results.php?keywords=AORUS+RX+9070+XT', inStock:true },
      { brand:'MSI',        variant:'Gaming X Trio',      full_name:'MSI Radeon RX 9070 XT Gaming X Trio 16GB',        retailer:'Best Buy Canada',  price:869, url:'https://www.bestbuy.ca/en-ca/search?query=MSI+RX+9070+XT', inStock:false },
      { brand:'Sapphire',   variant:'Nitro+',             full_name:'Sapphire Nitro+ Radeon RX 9070 XT 16GB',          retailer:'Memory Express',   price:899, url:'https://www.memoryexpress.com/Search/Products?Search=Sapphire+Nitro+RX+9070+XT', inStock:true },
      { brand:'Sapphire',   variant:'Pulse',              full_name:'Sapphire Pulse Radeon RX 9070 XT 16GB',           retailer:'Amazon.ca',        price:819, url:'https://www.amazon.ca/s?k=Sapphire+Pulse+RX+9070+XT', inStock:true },
      { brand:'PowerColor', variant:'Red Devil',          full_name:'PowerColor Red Devil Radeon RX 9070 XT 16GB',     retailer:'Canada Computers', price:879, url:'https://www.canadacomputers.com/search_results.php?keywords=Red+Devil+RX+9070+XT', inStock:true },
      { brand:'PowerColor', variant:'Hellhound',          full_name:'PowerColor Hellhound Radeon RX 9070 XT 16GB',     retailer:'Newegg.ca',        price:829, url:'https://www.newegg.ca/p/pl?d=PowerColor+Hellhound+RX+9070+XT', inStock:true },
      { brand:'XFX',        variant:'Speedster MERC 319', full_name:'XFX Speedster MERC 319 Radeon RX 9070 XT 16GB',  retailer:'Memory Express',   price:859, url:'https://www.memoryexpress.com/Search/Products?Search=XFX+MERC+RX+9070+XT', inStock:false },
    ],
  },
  {
    id: 'rx-9070', name: 'AMD Radeon RX 9070', category: 'gpu',
    image: '/gpu-placeholder.svg', msrp: 679,
    release_date: '2025-03-05',
    specs: { 'Compute Units':'56', 'Stream Processors':'3584', VRAM:'16GB GDDR6', 'Boost Clock':'2.54 GHz', 'Memory Bus':'256-bit', TDP:'220W', Architecture:'RDNA 4' },
    retailers: [
      { name:'Amazon.ca',        price:659, url:'https://www.amazon.ca/s?k=AMD+Radeon+RX+9070', inStock:true },
      { name:'Memory Express',   price:639, url:'https://www.memoryexpress.com/Search/Products?Search=RX+9070', inStock:true },
      { name:'Canada Computers', price:629, url:'https://www.canadacomputers.com/search_results.php?keywords=RX+9070', inStock:true },
      { name:'Best Buy Canada',  price:629, url:'https://www.bestbuy.ca/en-ca/search?query=AMD+Radeon+RX+9070', inStock:false },
      { name:'Newegg.ca',        price:639, url:'https://www.newegg.ca/p/pl?d=AMD+Radeon+RX+9070', inStock:true },
    ],
    variants: [
      { brand:'ASUS',       variant:'TUF Gaming OC', full_name:'ASUS TUF Gaming Radeon RX 9070 OC 16GB',     retailer:'Canada Computers', price:699, url:'https://www.canadacomputers.com/search_results.php?keywords=ASUS+TUF+RX+9070', inStock:true },
      { brand:'ASUS',       variant:'Prime OC',      full_name:'ASUS Prime Radeon RX 9070 OC 16GB',          retailer:'Newegg.ca',        price:669, url:'https://www.newegg.ca/p/pl?d=ASUS+Prime+RX+9070', inStock:true },
      { brand:'Gigabyte',   variant:'Gaming OC',     full_name:'Gigabyte Radeon RX 9070 Gaming OC 16GB',     retailer:'Amazon.ca',        price:679, url:'https://www.amazon.ca/s?k=Gigabyte+RX+9070+Gaming+OC', inStock:true },
      { brand:'MSI',        variant:'Gaming X',      full_name:'MSI Radeon RX 9070 Gaming X 16GB',           retailer:'Best Buy Canada',  price:699, url:'https://www.bestbuy.ca/en-ca/search?query=MSI+RX+9070', inStock:false },
      { brand:'Sapphire',   variant:'Pulse',         full_name:'Sapphire Pulse Radeon RX 9070 16GB',         retailer:'Memory Express',   price:659, url:'https://www.memoryexpress.com/Search/Products?Search=Sapphire+Pulse+RX+9070', inStock:true },
      { brand:'Sapphire',   variant:'Nitro+',        full_name:'Sapphire Nitro+ Radeon RX 9070 16GB',        retailer:'Canada Computers', price:729, url:'https://www.canadacomputers.com/search_results.php?keywords=Sapphire+Nitro+RX+9070', inStock:true },
      { brand:'PowerColor', variant:'Hellhound',     full_name:'PowerColor Hellhound Radeon RX 9070 16GB',   retailer:'Newegg.ca',        price:649, url:'https://www.newegg.ca/p/pl?d=PowerColor+Hellhound+RX+9070', inStock:true },
      { brand:'XFX',        variant:'Speedster SWFT 319', full_name:'XFX Speedster SWFT 319 Radeon RX 9070 16GB', retailer:'Amazon.ca', price:649, url:'https://www.amazon.ca/s?k=XFX+RX+9070', inStock:true },
    ],
  },
  {
    id: 'rx-9060-xt', name: 'AMD Radeon RX 9060 XT 16GB', category: 'gpu',
    image: '/gpu-placeholder.svg', msrp: 499,
    release_date: '2025-05-01',
    specs: { 'Compute Units':'32', 'Stream Processors':'2048', VRAM:'16GB GDDR6', 'Boost Clock':'3.13 GHz', 'Memory Bus':'128-bit', TDP:'150W', Architecture:'RDNA 4' },
    retailers: [
      { name:'Amazon.ca',        price:509, url:'https://www.amazon.ca/s?k=rx+9060+xt+16gb', inStock:true },
      { name:'Newegg.ca',        price:499, url:'https://www.newegg.ca/p/pl?d=rx+9060+xt+16gb', inStock:true },
      { name:'Canada Computers', price:479, url:'https://www.canadacomputers.com/search_results.php?keywords=RX+9060+XT+16GB', inStock:true },
      { name:'Memory Express',   price:489, url:'https://www.memoryexpress.com/Products/MX00134009', inStock:true },
      { name:'Best Buy Canada',  price:499, url:'https://www.bestbuy.ca/en-ca/collection/amd-radeon-9060-xt/blt8db66e4a9729feec', inStock:true },
    ],
    variants: [
      { brand:'ASUS',       variant:'TUF Gaming',    full_name:'ASUS TUF Gaming Radeon RX 9060 XT 16GB',    retailer:'Canada Computers', price:529, url:'https://www.canadacomputers.com/search_results.php?keywords=ASUS+TUF+RX+9060+XT', inStock:true },
      { brand:'Gigabyte',   variant:'Gaming OC',     full_name:'Gigabyte Radeon RX 9060 XT Gaming OC 16GB', retailer:'Newegg.ca',        price:509, url:'https://www.newegg.ca/p/pl?d=Gigabyte+RX+9060+XT', inStock:true },
      { brand:'MSI',        variant:'Mech',          full_name:'MSI Radeon RX 9060 XT Mech 16GB',           retailer:'Amazon.ca',        price:499, url:'https://www.amazon.ca/s?k=MSI+Mech+RX+9060+XT', inStock:true },
      { brand:'Sapphire',   variant:'Pulse',         full_name:'Sapphire Pulse Radeon RX 9060 XT 16GB',     retailer:'Memory Express',   price:489, url:'https://www.memoryexpress.com/Search/Products?Search=Sapphire+Pulse+RX+9060+XT', inStock:true },
      { brand:'PowerColor', variant:'Reaper',        full_name:'PowerColor Reaper Radeon RX 9060 XT 16GB',  retailer:'Canada Computers', price:479, url:'https://www.canadacomputers.com/en/powered-by-amd/274097/powercolor-reaper-amd-radeon-rx-9060-xt-16gb-rx9060xt-16g-a.html', inStock:true },
      { brand:'XFX',        variant:'Speedster SWFT 210', full_name:'XFX Speedster SWFT 210 Radeon RX 9060 XT 16GB', retailer:'Best Buy Canada', price:499, url:'https://www.bestbuy.ca/en-ca/search?query=XFX+RX+9060+XT', inStock:false },
    ],
  },
  {
    id: 'rx-9060-xt-8gb', name: 'AMD Radeon RX 9060 XT 8GB', category: 'gpu',
    image: '/gpu-placeholder.svg', msrp: 299,
    release_date: '2025-05-01',
    specs: { 'Compute Units':'32', 'Stream Processors':'2048', VRAM:'8GB GDDR6', 'Boost Clock':'2.59 GHz', 'Memory Bus':'128-bit', TDP:'150W', Architecture:'RDNA 4' },
    retailers: [
      { name:'Amazon.ca',        price:419, url:'https://www.amazon.ca/s?k=rx+9060+xt+8gb', inStock:true },
      { name:'Newegg.ca',        price:409, url:'https://www.newegg.ca/p/pl?d=rx+9060+xt+8gb', inStock:true },
      { name:'Canada Computers', price:399, url:'https://www.canadacomputers.com/search_results.php?keywords=RX+9060+XT+8GB', inStock:true },
      { name:'Memory Express',   price:409, url:'https://www.memoryexpress.com/Search/Products?Search=RX+9060+XT+8GB', inStock:true },
      { name:'Best Buy Canada',  price:419, url:'https://www.bestbuy.ca/en-ca/search?query=rx+9060+xt+8gb', inStock:true },
    ],
    variants: [
      { brand:'Sapphire',   variant:'Pulse',     full_name:'Sapphire Pulse Radeon RX 9060 XT 8GB',    retailer:'Memory Express',   price:399, url:'https://www.memoryexpress.com/Search/Products?Search=Sapphire+Pulse+RX+9060+XT+8GB', inStock:true },
      { brand:'PowerColor', variant:'Reaper',    full_name:'PowerColor Reaper Radeon RX 9060 XT 8GB', retailer:'Canada Computers', price:389, url:'https://www.canadacomputers.com/search_results.php?keywords=PowerColor+RX+9060+XT+8GB', inStock:true },
      { brand:'MSI',        variant:'Mech',      full_name:'MSI Radeon RX 9060 XT Mech 8GB',          retailer:'Newegg.ca',        price:409, url:'https://www.newegg.ca/p/pl?d=MSI+Mech+RX+9060+XT+8GB', inStock:true },
      { brand:'Gigabyte',   variant:'Eagle OC',  full_name:'Gigabyte Radeon RX 9060 XT Eagle OC 8GB', retailer:'Amazon.ca',        price:419, url:'https://www.amazon.ca/s?k=Gigabyte+RX+9060+XT+8GB', inStock:false },
    ],
  },
  {
    id: 'rx-7900-xtx', name: 'AMD Radeon RX 7900 XTX', category: 'gpu',
    image: '/gpu-placeholder.svg', msrp: 1399,
    release_date: '2022-12-13',
    specs: { 'Compute Units':'96', 'Stream Processors':'12288', VRAM:'24GB GDDR6', 'Boost Clock':'2.5 GHz', 'Memory Bus':'384-bit', TDP:'355W', Architecture:'RDNA 3' },
    retailers: [
      { name:'Amazon.ca',        price:1189, url:'https://www.amazon.ca/s?k=AMD+Radeon+RX+7900+XTX', inStock:true },
      { name:'Memory Express',   price:1219, url:'https://www.memoryexpress.com/Search/Products?Search=RX+7900+XTX', inStock:true },
      { name:'Canada Computers', price:1199, url:'https://www.canadacomputers.com/search_results.php?keywords=RX+7900+XTX', inStock:false },
      { name:'Best Buy Canada',  price:1259, url:'https://www.bestbuy.ca/en-ca/search?query=AMD+Radeon+RX+7900+XTX', inStock:true },
      { name:'Newegg.ca',        price:1229, url:'https://www.newegg.ca/p/pl?d=AMD+Radeon+RX+7900+XTX', inStock:true },
    ],
    variants: [
      { brand:'ASUS',     variant:'ROG Strix OC',  full_name:'ASUS ROG Strix Radeon RX 7900 XTX OC 24GB',  retailer:'Canada Computers', price:1349, url:'https://www.canadacomputers.com/search_results.php?keywords=ROG+Strix+RX+7900+XTX', inStock:false },
      { brand:'ASUS',     variant:'TUF Gaming OC', full_name:'ASUS TUF Gaming Radeon RX 7900 XTX OC 24GB', retailer:'Memory Express',   price:1279, url:'https://www.memoryexpress.com/Search/Products?Search=TUF+RX+7900+XTX', inStock:true },
      { brand:'Sapphire', variant:'Nitro+',        full_name:'Sapphire Nitro+ Radeon RX 7900 XTX 24GB',    retailer:'Amazon.ca',        price:1249, url:'https://www.amazon.ca/s?k=Sapphire+Nitro+RX+7900+XTX', inStock:true },
      { brand:'XFX',      variant:'Speedster MERC 310', full_name:'XFX Speedster MERC 310 Radeon RX 7900 XTX 24GB', retailer:'Newegg.ca', price:1239, url:'https://www.newegg.ca/p/pl?d=XFX+RX+7900+XTX', inStock:true },
      { brand:'PowerColor', variant:'Red Devil',   full_name:'PowerColor Red Devil Radeon RX 7900 XTX 24GB', retailer:'Best Buy Canada', price:1299, url:'https://www.bestbuy.ca/en-ca/search?query=PowerColor+RX+7900+XTX', inStock:false },
    ],
  },
  {
    id: 'rx-7900-xt', name: 'AMD Radeon RX 7900 XT', category: 'gpu',
    image: '/gpu-placeholder.svg', msrp: 1129,
    release_date: '2022-12-13',
    specs: { 'Compute Units':'84', 'Stream Processors':'10752', VRAM:'20GB GDDR6', 'Boost Clock':'2.4 GHz', 'Memory Bus':'320-bit', TDP:'315W', Architecture:'RDNA 3' },
    retailers: [
      { name:'Amazon.ca',        price:909,  url:'https://www.amazon.ca/s?k=AMD+Radeon+RX+7900+XT', inStock:true },
      { name:'Memory Express',   price:939,  url:'https://www.memoryexpress.com/Search/Products?Search=RX+7900+XT', inStock:true },
      { name:'Canada Computers', price:919,  url:'https://www.canadacomputers.com/search_results.php?keywords=RX+7900+XT', inStock:true },
      { name:'Best Buy Canada',  price:959,  url:'https://www.bestbuy.ca/en-ca/search?query=AMD+Radeon+RX+7900+XT', inStock:false },
      { name:'Newegg.ca',        price:929,  url:'https://www.newegg.ca/p/pl?d=AMD+Radeon+RX+7900+XT', inStock:true },
    ],
    variants: [
      { brand:'ASUS',     variant:'TUF Gaming OC', full_name:'ASUS TUF Gaming Radeon RX 7900 XT OC 20GB',  retailer:'Canada Computers', price:989, url:'https://www.canadacomputers.com/search_results.php?keywords=TUF+RX+7900+XT', inStock:true },
      { brand:'Sapphire', variant:'Nitro+',        full_name:'Sapphire Nitro+ Radeon RX 7900 XT 20GB',     retailer:'Memory Express',   price:969, url:'https://www.memoryexpress.com/Search/Products?Search=Sapphire+Nitro+RX+7900+XT', inStock:true },
      { brand:'XFX',      variant:'Speedster MERC 310', full_name:'XFX Speedster MERC 310 RX 7900 XT 20GB', retailer:'Newegg.ca',      price:949, url:'https://www.newegg.ca/p/pl?d=XFX+RX+7900+XT', inStock:true },
      { brand:'PowerColor', variant:'Red Devil',   full_name:'PowerColor Red Devil Radeon RX 7900 XT 20GB', retailer:'Amazon.ca',      price:929, url:'https://www.amazon.ca/s?k=PowerColor+Red+Devil+RX+7900+XT', inStock:false },
    ],
  },
  {
    id: 'rx-7800-xt', name: 'AMD Radeon RX 7800 XT', category: 'gpu',
    image: '/gpu-placeholder.svg', msrp: 699,
    release_date: '2023-09-06',
    specs: { 'Compute Units':'60', 'Stream Processors':'7680', VRAM:'16GB GDDR6', 'Boost Clock':'2.43 GHz', 'Memory Bus':'256-bit', TDP:'263W', Architecture:'RDNA 3' },
    retailers: [
      { name:'Amazon.ca',        price:599, url:'https://www.amazon.ca/s?k=AMD+Radeon+RX+7800+XT', inStock:true },
      { name:'Memory Express',   price:609, url:'https://www.memoryexpress.com/Search/Products?Search=RX+7800+XT', inStock:true },
      { name:'Canada Computers', price:599, url:'https://www.canadacomputers.com/search_results.php?keywords=RX+7800+XT', inStock:true },
      { name:'Best Buy Canada',  price:619, url:'https://www.bestbuy.ca/en-ca/search?query=AMD+Radeon+RX+7800+XT', inStock:true },
      { name:'Newegg.ca',        price:609, url:'https://www.newegg.ca/p/pl?d=AMD+Radeon+RX+7800+XT', inStock:true },
    ],
    variants: [
      { brand:'ASUS',       variant:'TUF Gaming OC', full_name:'ASUS TUF Gaming Radeon RX 7800 XT OC 16GB',  retailer:'Canada Computers', price:649, url:'https://www.canadacomputers.com/search_results.php?keywords=TUF+RX+7800+XT', inStock:true },
      { brand:'ASUS',       variant:'Prime OC',      full_name:'ASUS Prime Radeon RX 7800 XT OC 16GB',        retailer:'Amazon.ca',        price:619, url:'https://www.amazon.ca/s?k=ASUS+Prime+RX+7800+XT', inStock:true },
      { brand:'Gigabyte',   variant:'Gaming OC',     full_name:'Gigabyte Radeon RX 7800 XT Gaming OC 16GB',  retailer:'Newegg.ca',        price:629, url:'https://www.newegg.ca/p/pl?d=Gigabyte+RX+7800+XT', inStock:true },
      { brand:'MSI',        variant:'Gaming X',      full_name:'MSI Radeon RX 7800 XT Gaming X 16GB',         retailer:'Best Buy Canada',  price:639, url:'https://www.bestbuy.ca/en-ca/search?query=MSI+RX+7800+XT', inStock:true },
      { brand:'Sapphire',   variant:'Pulse',         full_name:'Sapphire Pulse Radeon RX 7800 XT 16GB',       retailer:'Memory Express',   price:599, url:'https://www.memoryexpress.com/Search/Products?Search=Sapphire+Pulse+RX+7800+XT', inStock:true },
      { brand:'Sapphire',   variant:'Nitro+',        full_name:'Sapphire Nitro+ Radeon RX 7800 XT 16GB',      retailer:'Canada Computers', price:669, url:'https://www.canadacomputers.com/search_results.php?keywords=Sapphire+Nitro+RX+7800+XT', inStock:true },
      { brand:'PowerColor', variant:'Red Devil',     full_name:'PowerColor Red Devil Radeon RX 7800 XT 16GB', retailer:'Newegg.ca',        price:629, url:'https://www.newegg.ca/p/pl?d=PowerColor+RX+7800+XT', inStock:false },
      { brand:'XFX',        variant:'Speedster MERC 310', full_name:'XFX Speedster MERC 310 RX 7800 XT 16GB', retailer:'Amazon.ca', price:609, url:'https://www.amazon.ca/s?k=XFX+RX+7800+XT', inStock:true },
    ],
  },
];

// ── Price history generator ───────────────────────────────────────────────────
function generateHistory(basePrice, releaseDate, pointsPerMonth = 4) {
  const history = [];
  const start = new Date(releaseDate);
  const end = new Date();
  let current = new Date(start);
  while (current <= end) {
    const monthsSince = (end - current) / (1000 * 60 * 60 * 24 * 30);
    // Prices tend to drop over time
    const trendFactor = 1 - Math.min(monthsSince * 0.01, 0.25);
    const variance = (Math.random() - 0.4) * basePrice * 0.08;
    const price = Math.round((basePrice * trendFactor + variance) * 100) / 100;
    history.push({ date: new Date(current), price: Math.max(price, basePrice * 0.5) });
    current.setDate(current.getDate() + Math.round(30 / pointsPerMonth));
  }
  return history;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const client = await pool.connect();
  try {
    console.log('Running schema migrations...');
    await client.query(schema);

    console.log('Seeding retailers...');
    const retailerMap = {};
    for (const r of CA_RETAILERS) {
      const res = await client.query(
        `INSERT INTO retailers (name, url) VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET url = EXCLUDED.url
         RETURNING id`,
        [r.name, r.url]
      );
      retailerMap[r.name] = res.rows[0].id;
    }

    for (const p of PRODUCTS) {
      console.log(`Seeding product: ${p.name}`);
      await client.query(
        `INSERT INTO products (id, name, category, image, specs, msrp, release_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           name=$2, category=$3, image=$4, specs=$5, msrp=$6, release_date=$7`,
        [p.id, p.name, p.category, p.image, JSON.stringify(p.specs), p.msrp, p.release_date]
      );

      // Seed retailer price snapshots (historical)
      const history = generateHistory(p.msrp, p.release_date);
      for (const retailerData of p.retailers) {
        const rid = retailerMap[retailerData.name];
        if (!rid) continue;

        // Historical snapshots spread from release date
        for (const h of history) {
          const variance = (Math.random() - 0.4) * retailerData.price * 0.05;
          const hPrice = Math.round((h.price + variance) * 100) / 100;
          await client.query(
            `INSERT INTO price_snapshots (product_id, retailer_id, price, in_stock, recorded_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [p.id, rid, Math.max(hPrice, p.msrp * 0.5), retailerData.inStock, h.date]
          );
        }

        // Current snapshot (now)
        await client.query(
          `INSERT INTO price_snapshots (product_id, retailer_id, price, in_stock, recorded_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [p.id, rid, retailerData.price, retailerData.inStock]
        );
      }

      // Seed GPU variants
      if (p.variants) {
        for (const v of p.variants) {
          const rid = retailerMap[v.retailer];
          const res = await client.query(
            `INSERT INTO gpu_variants (product_id, brand, variant, full_name, retailer_id, url)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (product_id, brand, variant) DO UPDATE SET
               full_name=$4, retailer_id=$5, url=$6
             RETURNING id`,
            [p.id, v.brand, v.variant, v.full_name, rid || null, v.url || null]
          );
          const variantId = res.rows[0].id;

          // Historical snapshots for variant
          const vHistory = generateHistory(v.price, p.release_date);
          for (const h of vHistory) {
            const variance = (Math.random() - 0.3) * v.price * 0.05;
            const hPrice = Math.round((h.price + variance) * 100) / 100;
            await client.query(
              `INSERT INTO gpu_variant_snapshots (variant_id, price, in_stock, recorded_at)
               VALUES ($1, $2, $3, $4)`,
              [variantId, Math.max(hPrice, v.price * 0.5), v.inStock, h.date]
            );
          }
          // Current
          await client.query(
            `INSERT INTO gpu_variant_snapshots (variant_id, price, in_stock, recorded_at)
             VALUES ($1, $2, $3, NOW())`,
            [variantId, v.price, v.inStock]
          );
        }
      }
    }

    console.log('\nDone! Database seeded successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
