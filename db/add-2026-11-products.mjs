// Idempotent: add AM4 CPUs, missing AM5 CPUs, the RX 9070 GRE and a curated set
// of AM4/AM5 motherboards. Needs migration 003. Run with:
//   docker exec -i amd-price-tracker node - < db/add-2026-11-products.mjs
// or locally:  DATABASE_URL=... node db/add-2026-11-products.mjs
//
// Every SKU was confirmed on sale at Canada Computers on 2026-11-12; `msrp` is its
// CAD list (regular) price there. Unlike earlier seed scripts this inserts NO
// price snapshots: new products show N/A until the first real scrape.
// `match` is the exact-token rule the scraper uses to reject look-alikes
// (see playwright-scraper lib/match.js). Re-running updates name/specs/msrp/match.
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://amd_tracker:amd_tracker_pass@localhost:5433/amd_tracker',
});

const cpu = (id, name, model, msrp, release_date, socket, s) => ({
  id, name, category: 'cpu', socket, msrp, release_date, image: '/cpu-placeholder.svg',
  match: { require: ['RYZEN', model], forbid: [] },
  specs: {
    Cores: s[0], Threads: s[1], 'Base Clock': s[2], 'Boost Clock': s[3], TDP: s[4],
    Socket: socket, Cache: s[5], Architecture: s[6], ...(s[7] ?? {}),
  },
});

const CPUS = [
  // ── AM4 (DDR4) ──
  cpu('ryzen-7-5800x3d', 'AMD Ryzen 7 5800X3D', '5800X3D', 490, null, 'AM4',
    ['8', '16', '3.4 GHz', '4.5 GHz', '105W', '100MB', 'Zen 3 (3D V-Cache)', { Edition: '10th Anniversary' }]),
  cpu('ryzen-9-5900xt', 'AMD Ryzen 9 5900XT', '5900XT', 509, '2024-07-31', 'AM4',
    ['16', '32', '3.3 GHz', '4.8 GHz', '105W', '72MB', 'Zen 3']),
  cpu('ryzen-7-5800xt', 'AMD Ryzen 7 5800XT', '5800XT', 359, '2024-07-31', 'AM4',
    ['8', '16', '3.8 GHz', '4.8 GHz', '105W', '36MB', 'Zen 3']),
  cpu('ryzen-7-5700x', 'AMD Ryzen 7 5700X', '5700X', 390, '2022-04-04', 'AM4',
    ['8', '16', '3.4 GHz', '4.6 GHz', '65W', '36MB', 'Zen 3']),
  cpu('ryzen-5-5600x3d', 'AMD Ryzen 5 5600X3D', '5600X3D', 280, '2023-07-07', 'AM4',
    ['6', '12', '3.3 GHz', '4.4 GHz', '105W', '99MB', 'Zen 3 (3D V-Cache)']),
  cpu('ryzen-5-5600x', 'AMD Ryzen 5 5600X', '5600X', 439, '2020-11-05', 'AM4',
    ['6', '12', '3.7 GHz', '4.6 GHz', '65W', '35MB', 'Zen 3']),
  cpu('ryzen-5-5600gt', 'AMD Ryzen 5 5600GT', '5600GT', 200, '2024-01-31', 'AM4',
    ['6', '12', '3.6 GHz', '4.6 GHz', '65W', '19MB', 'Zen 3', { Graphics: 'Radeon Vega 7' }]),
  // ── AM5 (DDR5) ──
  cpu('ryzen-9-7950x3d', 'AMD Ryzen 9 7950X3D', '7950X3D', 1000, '2023-02-28', 'AM5',
    ['16', '32', '4.2 GHz', '5.7 GHz', '120W', '144MB', 'Zen 4 (3D V-Cache)']),
  cpu('ryzen-9-7950x', 'AMD Ryzen 9 7950X', '7950X', 1000, '2022-09-27', 'AM5',
    ['16', '32', '4.5 GHz', '5.7 GHz', '170W', '80MB', 'Zen 4']),
  cpu('ryzen-9-7900x', 'AMD Ryzen 9 7900X', '7900X', 759, '2022-09-27', 'AM5',
    ['12', '24', '4.7 GHz', '5.6 GHz', '170W', '76MB', 'Zen 4']),
  cpu('ryzen-7-7700x', 'AMD Ryzen 7 7700X', '7700X', 579, '2022-09-27', 'AM5',
    ['8', '16', '4.5 GHz', '5.4 GHz', '105W', '40MB', 'Zen 4']),
  cpu('ryzen-7-7700', 'AMD Ryzen 7 7700', '7700', 480, '2023-01-10', 'AM5',
    ['8', '16', '3.8 GHz', '5.3 GHz', '65W', '40MB', 'Zen 4']),
  cpu('ryzen-5-7600x', 'AMD Ryzen 5 7600X', '7600X', 439, '2022-09-27', 'AM5',
    ['6', '12', '4.7 GHz', '5.3 GHz', '105W', '38MB', 'Zen 4']),
  cpu('ryzen-7-8700g', 'AMD Ryzen 7 8700G', '8700G', 460, '2024-01-31', 'AM5',
    ['8', '16', '4.2 GHz', '5.1 GHz', '65W', '24MB', 'Zen 4', { Graphics: 'Radeon 780M' }]),
  cpu('ryzen-5-8600g', 'AMD Ryzen 5 8600G', '8600G', 329, '2024-01-31', 'AM5',
    ['6', '12', '4.3 GHz', '5.0 GHz', '65W', '22MB', 'Zen 4', { Graphics: 'Radeon 760M' }]),
];

const GPUS = [
  {
    id: 'rx-9070-gre', name: 'AMD Radeon RX 9070 GRE', category: 'gpu', socket: null, msrp: 1049, release_date: null,
    image: '/gpu-placeholder.svg', match: { require: ['RX', '9070', 'GRE'], forbid: [] },
    specs: { 'Compute Units': '48', 'Stream Processors': '3072', VRAM: '12GB GDDR6', 'Boost Clock': '2.79 GHz', 'Memory Bus': '192-bit', TDP: '220W', Architecture: 'RDNA 4' },
  },
];

// Chipset-level features (what the chipset guarantees; individual boards may add more)
const CHIPSET = {
  // AM5
  A620:  { socket: 'AM5', Memory: 'DDR5', 'PCIe 5.0': 'No', USB4: 'No', 'CPU overclocking': 'No' },
  B650:  { socket: 'AM5', Memory: 'DDR5', 'PCIe 5.0': 'M.2 (optional)', USB4: 'No', 'CPU overclocking': 'Yes' },
  B650E: { socket: 'AM5', Memory: 'DDR5', 'PCIe 5.0': 'GPU + M.2', USB4: 'No', 'CPU overclocking': 'Yes' },
  B840:  { socket: 'AM5', Memory: 'DDR5', 'PCIe 5.0': 'No', USB4: 'No', 'CPU overclocking': 'No' },
  B850:  { socket: 'AM5', Memory: 'DDR5', 'PCIe 5.0': 'M.2 (GPU optional)', USB4: 'Optional', 'CPU overclocking': 'Yes' },
  X870:  { socket: 'AM5', Memory: 'DDR5', 'PCIe 5.0': 'GPU + M.2', USB4: 'Yes', 'CPU overclocking': 'Yes' },
  X870E: { socket: 'AM5', Memory: 'DDR5', 'PCIe 5.0': 'GPU + M.2', USB4: 'Yes', 'CPU overclocking': 'Yes' },
  // AM4
  B550:  { socket: 'AM4', Memory: 'DDR4', 'PCIe 5.0': 'No (PCIe 4.0)', USB4: 'No', 'CPU overclocking': 'Yes' },
};

const board = (id, name, chipset, formFactor, wifi, msrp, require, forbid = []) => {
  const { socket, ...features } = CHIPSET[chipset];
  return {
    id, name, category: 'motherboard', socket, chipset, msrp, release_date: null,
    image: '/board-placeholder.svg', match: { require, forbid },
    specs: { Socket: socket, Chipset: chipset, 'Form Factor': formFactor, 'Wi-Fi': wifi, ...features },
  };
};

const BOARDS = [
  // ── AM5 ──
  board('asus-tuf-gaming-a620m-plus-wifi', 'ASUS TUF GAMING A620M-PLUS WIFI', 'A620', 'Micro-ATX', 'Yes', 160,
    ['ASUS', 'TUF', 'A620M', 'PLUS', 'WIFI']),
  board('gigabyte-b650-aorus-elite-ax-v2', 'GIGABYTE B650 AORUS ELITE AX V2', 'B650', 'ATX', 'Wi-Fi 6E', 290,
    ['GIGABYTE', 'B650', 'AORUS', 'ELITE', 'AX', 'V2'], ['ICE']),
  board('gigabyte-b650-eagle-ax', 'GIGABYTE B650 EAGLE AX', 'B650', 'ATX', 'Wi-Fi 6E', 250,
    ['GIGABYTE', 'B650', 'EAGLE', 'AX']),
  board('asus-rog-strix-b650-a-gaming-wifi', 'ASUS ROG STRIX B650-A GAMING WIFI', 'B650', 'ATX', 'Wi-Fi 6E', 310,
    ['ASUS', 'STRIX', 'B650', 'A', 'GAMING', 'WIFI']),
  board('gigabyte-b650m-gaming-plus-wifi', 'GIGABYTE B650M GAMING PLUS WIFI', 'B650', 'Micro-ATX', 'Yes', 230,
    ['GIGABYTE', 'B650M', 'GAMING', 'PLUS', 'WIFI']),
  board('asus-tuf-gaming-b650e-plus-wifi', 'ASUS TUF GAMING B650E-PLUS WIFI', 'B650E', 'ATX', 'Yes', 280,
    ['ASUS', 'TUF', 'B650E', 'PLUS', 'WIFI']),
  board('gigabyte-b840-eagle-wifi6e', 'GIGABYTE B840 EAGLE WIFI6E', 'B840', 'ATX', 'Wi-Fi 6E', 220,
    ['GIGABYTE', 'B840', 'EAGLE']),
  board('msi-pro-b840m-b', 'MSI PRO B840M-B', 'B840', 'Micro-ATX', 'No', 180,
    ['MSI', 'PRO', 'B840M', 'B'], ['WIFI']),
  board('msi-mag-b850-tomahawk-max-wifi', 'MSI MAG B850 TOMAHAWK MAX WIFI', 'B850', 'ATX', 'Wi-Fi 7', 345,
    ['MSI', 'B850', 'TOMAHAWK', 'MAX', 'WIFI']),
  board('gigabyte-b850-aorus-elite-wifi7', 'GIGABYTE B850 AORUS ELITE WIFI7', 'B850', 'ATX', 'Wi-Fi 7', 340,
    ['GIGABYTE', 'B850', 'AORUS', 'ELITE', 'WIFI7'], ['ICE']),
  board('asus-tuf-gaming-b850-plus-wifi', 'ASUS TUF GAMING B850-PLUS WIFI', 'B850', 'ATX', 'Wi-Fi 7', 330,
    ['ASUS', 'TUF', 'B850', 'PLUS', 'WIFI']),
  board('msi-pro-b850m-a-wifi', 'MSI PRO B850M-A WIFI', 'B850', 'Micro-ATX', 'Yes', 240,
    ['MSI', 'PRO', 'B850M', 'A', 'WIFI']),
  board('gigabyte-b850m-aorus-elite-wifi6e', 'GIGABYTE B850M AORUS ELITE WIFI6E', 'B850', 'Micro-ATX', 'Wi-Fi 6E', 290,
    ['GIGABYTE', 'B850M', 'AORUS', 'ELITE', 'WIFI6E'], ['ICE']),
  board('msi-mag-x870-tomahawk-wifi', 'MSI MAG X870 TOMAHAWK WIFI', 'X870', 'ATX', 'Wi-Fi 7', 390,
    ['MSI', 'X870', 'TOMAHAWK', 'WIFI']),
  board('asus-tuf-gaming-x870-plus-wifi', 'ASUS TUF GAMING X870-PLUS WIFI', 'X870', 'ATX', 'Wi-Fi 7', 350,
    ['ASUS', 'TUF', 'X870', 'PLUS', 'WIFI']),
  board('gigabyte-x870-aorus-elite-wifi7', 'GIGABYTE X870 AORUS ELITE WIFI7', 'X870', 'ATX', 'Wi-Fi 7', 410,
    ['GIGABYTE', 'X870', 'AORUS', 'ELITE', 'WIFI7'], ['ICE']),
  board('asus-rog-strix-x870e-e-gaming-wifi', 'ASUS ROG STRIX X870E-E GAMING WIFI', 'X870E', 'ATX', 'Wi-Fi 7', 680,
    ['ASUS', 'STRIX', 'X870E', 'E', 'GAMING', 'WIFI']),
  board('msi-mag-x870e-tomahawk-wifi', 'MSI MAG X870E TOMAHAWK WIFI', 'X870E', 'ATX', 'Wi-Fi 7', 410,
    ['MSI', 'X870E', 'TOMAHAWK', 'WIFI']),
  board('gigabyte-x870e-aorus-elite-wifi7', 'GIGABYTE X870E AORUS ELITE WIFI7', 'X870E', 'ATX', 'Wi-Fi 7', 470,
    ['GIGABYTE', 'X870E', 'AORUS', 'ELITE', 'WIFI7'], ['ICE']),
  board('msi-pro-x870e-p-wifi', 'MSI PRO X870E-P WIFI', 'X870E', 'ATX', 'Wi-Fi 7', 375,
    ['MSI', 'PRO', 'X870E', 'P', 'WIFI']),
  // ── AM4 (A520 and X570 boards are no longer sold new in Canada) ──
  board('msi-mag-b550-tomahawk-max-wifi', 'MSI MAG B550 TOMAHAWK MAX WIFI', 'B550', 'ATX', 'Wi-Fi 6E', 225,
    ['MSI', 'B550', 'TOMAHAWK', 'MAX', 'WIFI']),
  board('asus-tuf-gaming-b550-plus-wifi-ii', 'ASUS TUF GAMING B550-PLUS WIFI II', 'B550', 'ATX', 'Wi-Fi 6', 210,
    ['ASUS', 'TUF', 'B550', 'PLUS', 'WIFI', 'II']),
  board('gigabyte-b550-eagle-wifi6', 'GIGABYTE B550 EAGLE WIFI6', 'B550', 'ATX', 'Wi-Fi 6', 180,
    ['GIGABYTE', 'B550', 'EAGLE']),
  board('asus-prime-b550m-a-wifi-ii', 'ASUS PRIME B550M-A WIFI II', 'B550', 'Micro-ATX', 'Wi-Fi 6', 160,
    ['ASUS', 'PRIME', 'B550M', 'A', 'WIFI', 'II']),
  board('msi-b550m-pro-vdh-wifi', 'MSI B550M PRO-VDH WIFI', 'B550', 'Micro-ATX', 'Yes', 155,
    ['MSI', 'B550M', 'VDH', 'WIFI']),
  board('gigabyte-b550m-ds3h-ac-r2', 'GIGABYTE B550M DS3H AC R2', 'B550', 'Micro-ATX', 'Wi-Fi 5', 170,
    ['GIGABYTE', 'B550M', 'DS3H', 'AC', 'R2']),
];

const ALL = [...CPUS, ...GPUS, ...BOARDS];

const client = await pool.connect();
try {
  await client.query('BEGIN');
  for (const p of ALL) {
    const res = await client.query(
      `INSERT INTO products (id, name, category, image, specs, msrp, release_date, socket, chipset, match_tokens)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, specs = EXCLUDED.specs, msrp = EXCLUDED.msrp,
         socket = EXCLUDED.socket, chipset = EXCLUDED.chipset, match_tokens = EXCLUDED.match_tokens
       RETURNING (xmax = 0) AS inserted`,
      [p.id, p.name, p.category, p.image, JSON.stringify(p.specs), p.msrp, p.release_date,
       p.socket, p.chipset ?? null, JSON.stringify(p.match)],
    );
    console.log(`${res.rows[0].inserted ? 'ADDED  ' : 'updated'}  ${p.category.padEnd(11)} ${p.id}`);
  }
  await client.query('COMMIT');

  const total = await client.query(
    `SELECT category, COALESCE(socket, '-') AS socket, count(*) FROM products GROUP BY 1, 2 ORDER BY 1, 2`);
  console.log('products:', total.rows.map((r) => `${r.category}/${r.socket}=${r.count}`).join('  '));
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
  await pool.end();
}
