import type { Metadata } from "next";
import { Chakra_Petch, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const display = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "AMD Price Tracker — Find the Best Deals on AMD CPUs & GPUs",
  description:
    "Track AMD Ryzen processor and Radeon GPU prices across multiple retailers. Get price alerts and find the lowest prices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} ${mono.variable} font-sans console-bg`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <footer className="mt-16 border-t border-line bg-panel/60">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-display text-sm font-semibold tracking-wide text-ink-dim">
              AMD<span className="text-signal-text">//</span>TRACKER
              <span className="ml-2 font-mono text-[11px] font-normal text-ink-faint">CA · CAD</span>
            </p>
            <p className="font-mono text-[11px] leading-relaxed text-ink-faint">
              Not affiliated with AMD. Prices scraped from public retailer pages — verify before buying.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
