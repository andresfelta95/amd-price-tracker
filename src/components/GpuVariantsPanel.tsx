"use client";

import { useState } from "react";
import { GpuVariant, PricePoint } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
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
          contentStyle={{
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--line-strong)",
            borderRadius: "4px",
            color: "var(--text)",
            fontFamily: "var(--font-mono), monospace",
            fontSize: "12px",
          }}
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
    <div className="rounded border border-line bg-panel p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal-text">
        <span className="text-ink-faint">//</span> BOARD PARTNERS
      </p>
      <h3 className="mb-4 font-display text-lg font-semibold text-ink">GPU variants by brand</h3>
      <div className="mb-4 flex flex-wrap gap-2">
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => { setOpenBrand(brand); setSelectedVariant(null); }}
            aria-pressed={openBrand === brand}
            className="rounded px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: openBrand === brand ? getBrandColor(brand) : "transparent",
              color: openBrand === brand ? "#fff" : "var(--text-dim)",
              border: `1.5px solid ${getBrandColor(brand)}`,
            }}
          >
            {brand}
          </button>
        ))}
      </div>

      {openBrand && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {brandVariants(openBrand).map((v) => (
            <div
              key={v.id}
              onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
              className="cursor-pointer rounded border border-line bg-raised/40 p-4 transition-all duration-200 hover:border-line-strong hover:bg-raised"
              style={{ borderColor: selectedVariant?.id === v.id ? getBrandColor(openBrand) : undefined }}
            >
              <div className="mb-1 flex items-start justify-between">
                <span className="pr-2 text-sm font-semibold leading-tight text-ink">{v.fullName}</span>
                <span
                  className={`shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                    v.inStock ? "bg-gain-soft text-gain" : "bg-signal-soft text-signal-text"
                  }`}
                >
                  {v.inStock ? "in stock" : "oos"}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-xl font-semibold text-ink">
                  {v.currentPrice != null ? (
                    <>
                      <span className="mr-0.5 text-sm text-ink-faint">C$</span>
                      {v.currentPrice.toFixed(2)}
                    </>
                  ) : (
                    "—"
                  )}
                </span>
                {v.retailerName && (
                  <span className="font-mono text-[11px] text-ink-faint">{v.retailerName}</span>
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
                      className="mt-2 block rounded bg-signal py-1.5 text-center font-mono text-xs font-medium uppercase tracking-wider text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_-6px_var(--signal)]"
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
