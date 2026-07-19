"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDb } from "@/lib/use-db";
import { addSale, NewSaleItem } from "@/lib/storage";
import { rupiah, todayISO } from "@/lib/format";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
} from "@/components/ui";

export default function InputPage() {
  const { products, ready, refresh } = useDb();
  const [tanggal, setTanggal] = useState(todayISO());
  const [qty, setQty] = useState<Record<string, string>>({});
  const [tersimpan, setTersimpan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baris = useMemo(() => {
    return products
      .map((p) => {
        const n = Number(qty[p.id]);
        const jumlah = isNaN(n) ? 0 : Math.max(0, Math.trunc(n));
        return {
          p,
          jumlah,
          subtotal: jumlah * p.harga_jual,
          untung: jumlah * (p.harga_jual - p.modal),
        };
      })
      .filter((b) => b.jumlah > 0);
  }, [products, qty]);

  const totalOmzet = baris.reduce((s, b) => s + b.subtotal, 0);
  const totalUntung = baris.reduce((s, b) => s + b.untung, 0);

  async function simpan() {
    if (baris.length === 0) return;
    const items: NewSaleItem[] = baris.map((b) => ({
      product_id: b.p.id,
      qty: b.jumlah,
      harga_jual_saat_itu: b.p.harga_jual, // 🔒 snapshot
      modal_saat_itu: b.p.modal, // 🔒 snapshot
    }));
    setError(null);
    try {
      await addSale(tanggal, items);
      await refresh();
      setQty({});
      setTersimpan(true);
      setTimeout(() => setTersimpan(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan penjualan.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Input Penjualan</h1>
        <p className="text-slate-500">
          Masukkan jumlah laku per produk, lalu simpan. Harga & modal dikunci
          saat disimpan.
        </p>
      </div>

      {ready && products.length === 0 ? (
        <Card>
          <CardContent className="text-center text-slate-500">
            Belum ada produk.{" "}
            <Link href="/menu" className="font-medium text-brand hover:underline">
              Tambah menu dulu →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardContent>
                <Label>Tanggal penjualan</Label>
                <Input
                  type="date"
                  value={tanggal}
                  max={todayISO()}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="max-w-xs"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{p.nama}</div>
                      <div className="text-sm text-slate-500">
                        {rupiah(p.harga_jual)} · untung{" "}
                        {rupiah(p.harga_jual - p.modal)}/porsi
                      </div>
                    </div>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      placeholder="0"
                      value={qty[p.id] ?? ""}
                      onChange={(e) =>
                        setQty({ ...qty, [p.id]: e.target.value })
                      }
                      className="w-24 text-right"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-20">
              <CardContent className="space-y-4">
                <h3 className="font-semibold">Ringkasan</h3>
                {baris.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Belum ada item. Isi jumlah laku di samping.
                  </p>
                ) : (
                  <div className="space-y-1.5 text-sm">
                    {baris.map((b) => (
                      <div
                        key={b.p.id}
                        className="flex justify-between text-slate-600"
                      >
                        <span>
                          {b.p.nama} ×{b.jumlah}
                        </span>
                        <span>{rupiah(b.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-1 border-t border-slate-100 pt-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total omzet</span>
                    <span className="font-medium">{rupiah(totalOmzet)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Untung bersih</span>
                    <span className="font-bold text-brand">
                      {rupiah(totalUntung)}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={baris.length === 0}
                  onClick={simpan}
                >
                  Simpan penjualan
                </Button>
                {tersimpan && (
                  <p className="text-center text-sm font-medium text-brand">
                    ✓ Tersimpan!
                  </p>
                )}
                {error && (
                  <p className="text-center text-sm text-red-600">{error}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
