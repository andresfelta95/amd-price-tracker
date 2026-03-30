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
    <div className="bg-amd-gray border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">Price History (CAD)</h3>
        {releaseDate && (
          <span className="text-xs text-gray-500">
            Since launch · {data.length} data points
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ right: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            tick={{ fontSize: 11 }}
            tickFormatter={tickFormatter}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fontSize: 11 }}
            domain={[Math.floor(minPrice * 0.93), Math.ceil(maxPrice * 1.05)]}
            tickFormatter={(val) => `C$${val}`}
            width={70}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a2e",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#fff",
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
            stroke="#ED1C24"
            strokeDasharray="5 5"
            label={{
              value: `MSRP C$${msrp}`,
              position: "right",
              fill: "#ED1C24",
              fontSize: 11,
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#e94560"
            strokeWidth={2}
            dot={data.length <= 30 ? { fill: "#e94560", r: 3 } : false}
            activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amd-accent" />
          <span className="text-gray-400">Daily lowest (CA)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 border-t-2 border-dashed border-amd-red" />
          <span className="text-gray-400">MSRP</span>
        </div>
        <div className="text-gray-400 ml-auto">
          All-time low: <span className="text-green-400 font-semibold">C${minPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
