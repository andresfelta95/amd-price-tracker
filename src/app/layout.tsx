import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <footer className="bg-amd-dark border-t border-gray-700 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            <p>AMD Price Tracker — Not affiliated with AMD.</p>
            <p className="mt-1">
              Prices are fetched from public retailer pages and may not be 100%
              accurate.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
