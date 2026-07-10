"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { PricePoint } from "@/lib/types";

interface PriceChartProps {
  data: PricePoint[];
  msrp: number;
  releaseDate?: string;
}

const MONO = "var(--font-mono), monospace";

export default function PriceChart({ data, msrp, releaseDate }: PriceChartProps) {
  if (!data.length) return null;

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices, msrp);

  // Show monthly ticks if data spans > 60 days
  const spanDays =
    data.length > 1
      ? (new Date(data[data.length - 1].date).getTime() - new Date(data[0].date).getTime()) /
        86400000
      : 0;

  const tickFormatter = (val: string) => {
    const d = new Date(val);
    if (spanDays > 60) {
      return d.toLocaleDateString("en-CA", { month: "short", year: "2-digit" });
    }
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="rounded border border-line bg-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal-text">
            <span className="text-ink-faint">//</span> TRACE
          </p>
          <h3 className="font-display text-lg font-semibold text-ink">Price history (CAD)</h3>
        </div>
        {releaseDate && (
          <span className="font-mono text-[11px] text-ink-faint">
            since launch · {data.length} pts
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ right: 84 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
          <XAxis
            dataKey="date"
            stroke="var(--text-faint)"
            tick={{ fontSize: 11, fontFamily: MONO, fill: "var(--text-dim)" }}
            tickFormatter={tickFormatter}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="var(--text-faint)"
            tick={{ fontSize: 11, fontFamily: MONO, fill: "var(--text-dim)" }}
            domain={[Math.floor(minPrice * 0.93), Math.ceil(maxPrice * 1.05)]}
            tickFormatter={(val) => `C$${val}`}
            width={70}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface-2)",
              border: "1px solid var(--line-strong)",
              borderRadius: "4px",
              color: "var(--text)",
              fontFamily: MONO,
              fontSize: "12px",
            }}
            formatter={(value: number) => [`C$${value.toFixed(2)}`, "Lowest price"]}
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString("en-CA", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            }
          />
          <ReferenceLine
            y={msrp}
            stroke="var(--text-faint)"
            strokeDasharray="5 5"
            label={{
              value: `MSRP C$${msrp}`,
              position: "right",
              fill: "var(--text-dim)",
              fontSize: 11,
              fontFamily: MONO,
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--signal)"
            strokeWidth={2}
            dot={data.length <= 30 ? { fill: "var(--signal)", r: 3 } : false}
            activeDot={{ r: 5, stroke: "var(--text)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 flex items-center gap-6 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 rounded-full bg-signal" />
          <span className="text-ink-dim">daily lowest (CA)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 border-t-2 border-dashed border-line-strong" />
          <span className="text-ink-dim">MSRP</span>
        </div>
        <div className="ml-auto text-ink-dim">
          all-time low <span className="font-semibold text-gain">C${minPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
