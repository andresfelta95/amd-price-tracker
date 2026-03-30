"use client";

import { useState } from "react";
import { GpuVariant, PricePoint } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GpuVariantsPanelProps {
  variants: GpuVariant[];
}

const BRAND_COLORS: Record<string, string> = {
  ASUS: "#00A3E0",
  Gigabyte: "#FF6B00",
  MSI: "#E60026",
  Sapphire: "#0057B7",
  PowerColor: "#8B00FF",
  XFX: "#FF4500",
};

function getBrandColor(brand: string) {
  return BRAND_COLORS[brand] ?? "#9CA3AF";
}

function MiniChart({ data, color }: { data: PricePoint[]; color: string }) {
  if (!data.length) return null;
  return (
    <ResponsiveContainer width="100%" height={80}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
        <XAxis dataKey="date" hide />
        <YAxis hide domain={["auto", "auto"]} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #374151", borderRadius: "6px", color: "#fff", fontSize: "12px" }}
          formatter={(v: number) => [`C$${v.toFixed(2)}`, "Price"]}
          labelFormatter={(l) => new Date(l).toLocaleDateString("en-CA")}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function GpuVariantsPanel({ variants }: GpuVariantsPanelProps) {
  const brands = Array.from(new Set(variants.map((v) => v.brand))).sort();
  const [openBrand, setOpenBrand] = useState<string | null>(brands[0] ?? null);
  const [selectedVariant, setSelectedVariant] = useState<GpuVariant | null>(null);

  if (!variants.length) return null;

  const brandVariants = (brand: string) => variants.filter((v) => v.brand === brand);

  return (
    <div className="bg-amd-gray border border-gray-700 rounded-xl p-6">
      <h3 className="text-white font-semibold text-lg mb-4">GPU Variants by Brand</h3>
      <div className="flex gap-2 flex-wrap mb-4">
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => { setOpenBrand(brand); setSelectedVariant(null); }}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: openBrand === brand ? getBrandColor(brand) : "transparent",
              color: openBrand === brand ? "#fff" : "#9CA3AF",
              border: `1.5px solid ${getBrandColor(brand)}`,
            }}
          >
            {brand}
          </button>
        ))}
      </div>

      {openBrand && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {brandVariants(openBrand).map((v) => (
            <div
              key={v.id}
              onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
              className="cursor-pointer border border-gray-700 hover:border-gray-500 rounded-lg p-4 transition-all"
              style={{ borderColor: selectedVariant?.id === v.id ? getBrandColor(openBrand) : undefined }}
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-white text-sm font-semibold leading-tight pr-2">{v.fullName}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
                    v.inStock ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {v.inStock ? "In Stock" : "OOS"}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-bold text-white">
                  {v.currentPrice != null ? `C$${v.currentPrice.toFixed(2)}` : "—"}
                </span>
                {v.retailerName && (
                  <span className="text-xs text-gray-400">{v.retailerName}</span>
                )}
              </div>
              {selectedVariant?.id === v.id && v.priceHistory.length > 1 && (
                <div className="mt-3">
                  <MiniChart data={v.priceHistory} color={getBrandColor(openBrand)} />
                  {v.url && (
                    <a
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 block text-center py-1.5 rounded-lg text-sm font-medium bg-amd-red hover:bg-red-700 text-white transition-colors"
                    >
                      View at {v.retailerName ?? "Retailer"}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
