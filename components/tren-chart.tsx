"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrenPoint } from "@/lib/calc";
import { rupiah } from "@/lib/format";

export function TrenChart({ data }: { data: TrenPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          width={64}
          tickFormatter={(v) => ringkas(v as number)}
        />
        <Tooltip
          formatter={(v: number, name) => [
            rupiah(v),
            name === "untung" ? "Untung" : "Omzet",
          ]}
          labelStyle={{ color: "#0f172a", fontWeight: 600 }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            fontSize: 13,
          }}
        />
        <Area
          type="monotone"
          dataKey="untung"
          stroke="#16a34a"
          strokeWidth={2}
          fill="url(#g)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ringkas(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
  if (Math.abs(v) >= 1_000) return `${Math.round(v / 1_000)}rb`;
  return String(v);
}
