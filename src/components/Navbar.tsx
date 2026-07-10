"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAlertStore } from "@/lib/store";

export default function Navbar() {
  const pathname = usePathname();
  const alerts = useAlertStore((s) => s.alerts);

  const links = [
    { href: "/", label: "Home" },
    { href: "/cpus", label: "CPUs" },
    { href: "/gpus", label: "GPUs" },
    { href: "/alerts", label: "Alerts" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-base/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-3" aria-label="AMD Price Tracker home">
            <span className="flex h-9 w-9 items-center justify-center rounded bg-signal font-display text-sm font-bold text-white transition-transform duration-200 group-hover:-rotate-3">
              AMD
            </span>
            <span className="hidden font-display text-lg font-semibold tracking-wide text-ink sm:block">
              PRICE<span className="text-signal-text">//</span>TRACKER
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-3 py-2 font-mono text-[13px] font-medium uppercase tracking-wider transition-colors sm:px-4 ${
                    active
                      ? "text-ink"
                      : "text-ink-dim hover:text-ink"
                  }`}
                >
                  {link.label}
                  {/* active trace under the current route */}
                  <span
                    className={`absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full transition-opacity sm:inset-x-4 ${
                      active ? "bg-signal opacity-100" : "opacity-0"
                    }`}
                  />
                  {link.label === "Alerts" && alerts.length > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-signal font-mono text-[11px] text-white">
                      {alerts.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      {/* powered-trace hairline */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-signal/60 to-transparent" />
    </nav>
  );
}
