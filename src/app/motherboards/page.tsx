export const dynamic = 'force-dynamic';

import ProductCard from "@/components/ProductCard";
import SocketTabs from "@/components/SocketTabs";
import { listProducts, listingStats, socketCounts } from "@/lib/catalog";
import { parseSocket, type Product } from "@/lib/types";

export const metadata = {
  title: "AMD Motherboards — Canadian Price Tracker",
  description: "Track Canadian prices on AM5 and AM4 motherboards, grouped by chipset.",
};

// Chipsets from flagship to entry level, per platform
const CHIPSET_ORDER = ["X870E", "X870", "B850", "B650E", "B650", "B840", "A620", "X570", "B550", "A520"];

const CHIPSET_NOTE: Record<string, string> = {
  X870E: "PCIe 5.0 GPU + M.2, USB4, dual-chipset I/O",
  X870: "PCIe 5.0 GPU + M.2, USB4",
  B850: "PCIe 5.0 M.2, overclocking — the mainstream pick",
  B650E: "PCIe 5.0 GPU + M.2",
  B650: "Previous mainstream, being phased out",
  B840: "Entry level, PCIe 4.0, no CPU overclocking",
  A620: "Entry level, no CPU overclocking",
  B550: "PCIe 4.0, overclocking, DDR4",
};

export default async function MotherboardsPage({ searchParams }: { searchParams: { socket?: string } }) {
  const socket = parseSocket(searchParams.socket) ?? "AM5";
  const [boards, counts] = await Promise.all([listProducts({ category: "motherboard", socket }), socketCounts("motherboard")]);
  const { lowest } = listingStats(boards);

  const groups = new Map<string, Product[]>();
  for (const b of boards) {
    const key = b.chipset ?? "Other";
    groups.set(key, [...(groups.get(key) ?? []), b]);
  }
  const ordered = Array.from(groups.entries()).sort(
    ([a], [b]) => (CHIPSET_ORDER.indexOf(a) + 1 || 99) - (CHIPSET_ORDER.indexOf(b) + 1 || 99)
  );

  const stats = [
    { label: `${socket} boards tracked`, value: String(boards.length).padStart(2, "0"), tone: "text-ink" },
    { label: "Chipsets", value: String(groups.size).padStart(2, "0"), tone: "text-ink" },
    { label: "Lowest price", value: lowest !== null ? `C$${lowest.toFixed(2)}` : "—", tone: "text-gain" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-1 font-mono text-xs tracking-[0.2em] text-signal-text">
          <span className="text-ink-faint">//</span> SOCKET · CHIPSET
        </p>
        <h1 className="mb-2 font-display text-3xl font-bold uppercase tracking-wide text-ink sm:text-4xl">
          Motherboards
        </h1>
        <p className="max-w-2xl text-ink-dim">
          Canadian prices (CAD) for a curated set of popular AM5 and AM4 boards, grouped by chipset. Each board is
          matched exactly — mATX, Wi-Fi and white “ICE” editions are tracked as different boards.
        </p>
      </div>

      <SocketTabs basePath="/motherboards" active={socket} counts={counts} />

      <dl className="mb-10 grid grid-cols-1 gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-panel px-5 py-4">
            <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">{s.label}</dt>
            <dd className={`mt-1 font-mono text-2xl font-semibold ${s.tone}`}>{s.value}</dd>
          </div>
        ))}
      </dl>

      {ordered.map(([chipset, list]) => (
        <section key={chipset} className="mb-12">
          <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-2">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-ink">{chipset}</h2>
            {CHIPSET_NOTE[chipset] && <p className="font-mono text-xs text-ink-dim">{CHIPSET_NOTE[chipset]}</p>}
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}

      {socket === "AM4" && (
        <p className="font-mono text-xs text-ink-faint">
          A520 and X570 boards are no longer sold new by Canadian retailers, so AM4 is B550 only.
        </p>
      )}
    </div>
  );
}
