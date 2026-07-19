"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDb } from "@/lib/use-db";
import {
  produkTeruntung,
  ringkasanPeriode,
  trenUntung,
} from "@/lib/calc";
import { persen, rupiah } from "@/lib/format";
import { Period } from "@/lib/types";
import { Card, CardContent } from "@/components/ui";
import { TrenChart } from "@/components/tren-chart";
import { cn } from "@/lib/utils";

const PERIODS: { value: Period; label: string }[] = [
  { value: "hari", label: "Hari ini" },
  { value: "minggu", label: "Minggu ini" },
  { value: "bulan", label: "Bulan ini" },
];

export default function DashboardPage() {
  const { products, sales, ready } = useDb();
  const [period, setPeriod] = useState<Period>("hari");

  const ringkasan = useMemo(
    () => ringkasanPeriode(sales, period),
    [sales, period]
  );
  const tren = useMemo(() => trenUntung(sales, period), [sales, period]);
  const topProduk = useMemo(
    () => produkTeruntung(sales, products, period),
    [sales, products, period]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-500">Laporan keuntungan warung.</p>
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-white p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                period === p.value
                  ? "bg-brand text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {ready && sales.length === 0 ? (
        <Card>
          <CardContent className="text-center text-slate-500">
            Belum ada data penjualan.{" "}
            <Link href="/input" className="font-medium text-brand hover:underline">
              Catat penjualan pertama →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kartu label="Total omzet" value={rupiah(ringkasan.omzet)} />
            <Kartu label="Total modal" value={rupiah(ringkasan.modal)} muted />
            <Kartu
              label="Untung bersih"
              value={rupiah(ringkasan.untung)}
              highlight
            />
            <Kartu label="Margin" value={persen(ringkasan.margin)} />
          </div>

          <Card>
            <CardContent>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Tren untung</h3>
                <span className="text-sm text-slate-400">
                  {period === "hari"
                    ? "14 hari terakhir"
                    : period === "minggu"
                    ? "8 minggu terakhir"
                    : "6 bulan terakhir"}
                </span>
              </div>
              <TrenChart data={tren} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="p-5 pb-2">
                <h3 className="font-semibold">Produk paling untung</h3>
                <p className="text-sm text-slate-400">
                  Periode: {PERIODS.find((p) => p.value === period)?.label}
                </p>
              </div>
              {topProduk.length === 0 ? (
                <p className="px-5 pb-5 text-slate-400">
                  Belum ada penjualan pada periode ini.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-500">
                        <th className="p-4 font-medium">Produk</th>
                        <th className="p-4 text-right font-medium">Terjual</th>
                        <th className="p-4 text-right font-medium">Untung</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProduk.map((row) => (
                        <tr
                          key={row.product_id}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="p-4 font-medium">{row.nama}</td>
                          <td className="p-4 text-right text-slate-500">
                            {row.qty} porsi
                          </td>
                          <td className="p-4 text-right font-semibold text-brand">
                            {rupiah(row.untung)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Kartu({
  label,
  value,
  highlight,
  muted,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <Card className={cn(highlight && "border-brand/30 bg-brand/5")}>
      <CardContent>
        <div className="text-sm text-slate-500">{label}</div>
        <div
          className={cn(
            "mt-1 text-2xl font-bold",
            highlight ? "text-brand" : muted ? "text-slate-600" : "text-slate-900"
          )}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
