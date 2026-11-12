export const dynamic = 'force-dynamic';

import ProductCard from "@/components/ProductCard";
import SocketTabs from "@/components/SocketTabs";
import { listProducts, listingStats, socketCounts } from "@/lib/catalog";
import { parseSocket } from "@/lib/types";

export const metadata = {
  title: "AMD CPUs — Canadian Price Tracker",
  description: "Track Canadian prices on AMD Ryzen processors for AM5 and AM4.",
};

export default async function CPUsPage({ searchParams }: { searchParams: { socket?: string } }) {
  const socket = parseSocket(searchParams.socket) ?? "AM5";
  const [cpus, counts] = await Promise.all([listProducts({ category: "cpu", socket }), socketCounts("cpu")]);
  const { lowest, bestSavings } = listingStats(cpus);

  const stats = [
    { label: `${socket} CPUs tracked`, value: String(cpus.length).padStart(2, "0"), tone: "text-ink" },
    { label: "Lowest price", value: lowest !== null ? `C$${lowest.toFixed(2)}` : "—", tone: "text-gain" },
    { label: "Best savings", value: `${bestSavings}% off`, tone: "text-signal-text" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-1 font-mono text-xs tracking-[0.2em] text-signal-text">
          <span className="text-ink-faint">//</span> RYZEN · DESKTOP
        </p>
        <h1 className="mb-2 font-display text-3xl font-bold uppercase tracking-wide text-ink sm:text-4xl">
          Processors
        </h1>
        <p className="max-w-2xl text-ink-dim">
          Canadian prices (CAD) across retailers for AMD Ryzen CPUs. Pick a platform; click any product to see full
          price history and compatible motherboards.
        </p>
      </div>

      <SocketTabs basePath="/cpus" active={socket} counts={counts} />

      <dl className="mb-10 grid grid-cols-1 gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-panel px-5 py-4">
            <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">{s.label}</dt>
            <dd className={`mt-1 font-mono text-2xl font-semibold ${s.tone}`}>{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cpus.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
