import Link from "next/link";
import { SOCKETS, type Socket } from "@/lib/types";

const BLURB: Record<Socket, string> = {
  AM5: "Ryzen 7000 / 8000 / 9000 · DDR5",
  AM4: "Ryzen 5000 · DDR4",
};

/** AM5 | AM4 platform switch for listing pages (?socket=am5 / ?socket=am4). */
export default function SocketTabs({
  basePath,
  active,
  counts,
}: {
  basePath: string;
  active: Socket;
  counts: Partial<Record<Socket, number>>;
}) {
  return (
    <div role="tablist" aria-label="Platform" className="mb-8 flex flex-wrap gap-2">
      {SOCKETS.map((s) => {
        const on = s === active;
        return (
          <Link
            key={s}
            role="tab"
            aria-selected={on}
            href={`${basePath}?socket=${s.toLowerCase()}`}
            scroll={false}
            className={`group rounded border px-4 py-2.5 transition-colors ${
              on ? "border-signal bg-signal-soft" : "border-line bg-panel hover:border-line-strong hover:bg-raised"
            }`}
          >
            <span className={`font-display text-lg font-semibold tracking-wide ${on ? "text-signal-text" : "text-ink"}`}>
              {s}
            </span>
            <span className="ml-2 font-mono text-[11px] text-ink-faint">{counts[s] ?? 0}</span>
            <span className="block font-mono text-[11px] uppercase tracking-wider text-ink-dim">{BLURB[s]}</span>
          </Link>
        );
      })}
    </div>
  );
}
