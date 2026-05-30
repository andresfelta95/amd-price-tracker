// Idempotent migration: add the 2026 AMD products to the LIVE DB without
// duplicating price history. Run with: node db/add-2026-products.mjs
// (Re-running is safe: products use ON CONFLICT DO NOTHING, and initial
//  snapshots are only inserted for products that have none yet.)
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://amd_tracker:amd_tracker_pass@localhost:5433/amd_tracker',
});

const NEW = [
  { id:'ryzen-7-9850x3d', name:'AMD Ryzen 7 9850X3D', category:'cpu', image:'/products/ryzen-7-9850x3d.jpg', msrp:679, release_date:'2026-01-29',
    specs:{ Cores:'8', Threads:'16', 'Base Clock':'4.7 GHz', 'Boost Clock':'5.6 GHz', TDP:'120W', Socket:'AM5', Cache:'104MB', Architecture:'Zen 5 (3D V-Cache)' },
    prices:{ 'Amazon.ca':679, 'Newegg.ca':689, 'Canada Computers':679, 'Memory Express':679, 'Best Buy Canada':699 } },
  { id:'ryzen-7-9800x3d', name:'AMD Ryzen 7 9800X3D', category:'cpu', image:'/products/ryzen-7-9800x3d.jpg', msrp:649, release_date:'2024-11-07',
    specs:{ Cores:'8', Threads:'16', 'Base Clock':'4.7 GHz', 'Boost Clock':'5.2 GHz', TDP:'120W', Socket:'AM5', Cache:'104MB', Architecture:'Zen 5 (3D V-Cache)' },
    prices:{ 'Amazon.ca':639, 'Newegg.ca':649, 'Canada Computers':639, 'Memory Express':629, 'Best Buy Canada':659 } },
  { id:'ryzen-9-9950x3d', name:'AMD Ryzen 9 9950X3D', category:'cpu', image:'/products/ryzen-9-9950x3d.jpg', msrp:949, release_date:'2025-03-12',
    specs:{ Cores:'16', Threads:'32', 'Base Clock':'4.3 GHz', 'Boost Clock':'5.7 GHz', TDP:'170W', Socket:'AM5', Cache:'144MB', Architecture:'Zen 5 (3D V-Cache)' },
    prices:{ 'Amazon.ca':929, 'Newegg.ca':949, 'Canada Computers':939, 'Memory Express':919, 'Best Buy Canada':969 } },
  { id:'ryzen-9-9900x3d', name:'AMD Ryzen 9 9900X3D', category:'cpu', image:'/products/ryzen-9-9900x3d.jpg', msrp:799, release_date:'2025-03-12',
    specs:{ Cores:'12', Threads:'24', 'Base Clock':'4.4 GHz', 'Boost Clock':'5.5 GHz', TDP:'120W', Socket:'AM5', Cache:'140MB', Architecture:'Zen 5 (3D V-Cache)' },
    prices:{ 'Amazon.ca':779, 'Newegg.ca':799, 'Canada Computers':789, 'Memory Express':769, 'Best Buy Canada':819 } },
  { id:'rx-7600-xt', name:'AMD Radeon RX 7600 XT 16GB', category:'gpu', image:'/products/rx-7600-xt.jpg', msrp:429, release_date:'2024-01-24',
    specs:{ 'Compute Units':'32', 'Stream Processors':'2048', VRAM:'16GB GDDR6', 'Boost Clock':'2.76 GHz', 'Memory Bus':'128-bit', TDP:'190W', Architecture:'RDNA 3' },
    prices:{ 'Amazon.ca':419, 'Newegg.ca':429, 'Canada Computers':419, 'Memory Express':409, 'Best Buy Canada':439 } },
  { id:'rx-7600', name:'AMD Radeon RX 7600 8GB', category:'gpu', image:'/products/rx-7600.jpg', msrp:359, release_date:'2023-05-25',
    specs:{ 'Compute Units':'32', 'Stream Processors':'2048', VRAM:'8GB GDDR6', 'Boost Clock':'2.66 GHz', 'Memory Bus':'128-bit', TDP:'165W', Architecture:'RDNA 3' },
    prices:{ 'Amazon.ca':329, 'Newegg.ca':339, 'Canada Computers':329, 'Memory Express':319, 'Best Buy Canada':349 } },
];

const client = await pool.connect();
try {
  // retailer name -> id (they already exist; ensure Amazon.ca is present)
  await client.query(
    `INSERT INTO retailers (name, url) VALUES ($1,$2) ON CONFLICT (name) DO NOTHING`,
    ['Amazon.ca', 'https://www.amazon.ca'],
  );
  const rRes = await client.query('SELECT id, name FROM retailers');
  const rid = {};
  for (const r of rRes.rows) rid[r.name] = r.id;

  for (const p of NEW) {
    const ins = await client.query(
      `INSERT INTO products (id, name, category, image, specs, msrp, release_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
      [p.id, p.name, p.category, p.image, JSON.stringify(p.specs), p.msrp, p.release_date],
    );
    const created = ins.rowCount > 0;

    // initial snapshots only if this product has none yet (keeps re-runs safe)
    const snap = await client.query('SELECT 1 FROM price_snapshots WHERE product_id=$1 LIMIT 1', [p.id]);
    if (snap.rowCount === 0) {
      for (const [retailer, price] of Object.entries(p.prices)) {
        if (!rid[retailer]) continue;
        await client.query(
          `INSERT INTO price_snapshots (product_id, retailer_id, price, in_stock) VALUES ($1,$2,$3,true)`,
          [p.id, rid[retailer], price],
        );
      }
    }
    console.log(`${created ? 'ADDED ' : 'exists'}  ${p.id}${snap.rowCount === 0 ? ' (+initial snapshots)' : ''}`);
  }

  const total = await client.query("SELECT category, count(*) FROM products GROUP BY category ORDER BY category");
  console.log('product counts:', total.rows.map(r => `${r.category}=${r.count}`).join('  '));
} finally {
  client.release();
  await pool.end();
}
