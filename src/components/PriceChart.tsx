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
}

export default function PriceChart({ data, msrp }: PriceChartProps) {
  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price), msrp);

  return (
    <div className="bg-amd-gray border border-gray-700 rounded-xl p-6">
      <h3 className="text-white font-semibold text-lg mb-4">Price History</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            tickFormatter={(val) => {
              const d = new Date(val);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            domain={[minPrice * 0.95, maxPrice * 1.05]}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a2e",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#fff",
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString("en-US", {
                month: "short",
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
              value: `MSRP $${msrp}`,
              position: "right",
              fill: "#ED1C24",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#e94560"
            strokeWidth={2}
            dot={{ fill: "#e94560", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amd-accent" />
          <span className="text-gray-400">Price</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-amd-red" style={{ borderTop: "2px dashed #ED1C24" }} />
          <span className="text-gray-400">MSRP</span>
        </div>
        <div className="text-gray-400 ml-auto">
          Lowest: <span className="text-green-400 font-semibold">${minPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
