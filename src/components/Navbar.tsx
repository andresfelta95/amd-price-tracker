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
    <nav className="bg-amd-dark border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amd-red rounded-lg flex items-center justify-center font-bold text-white text-lg">
              AMD
            </div>
            <span className="text-white font-semibold text-lg hidden sm:block">
              Price Tracker
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                  pathname === link.href
                    ? "bg-amd-red text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                {link.label}
                {link.label === "Alerts" && alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amd-accent text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {alerts.length}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
