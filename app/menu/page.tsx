"use client";

import { useState } from "react";
import { useDb } from "@/lib/use-db";
import { deleteProduct, saveProduct } from "@/lib/storage";
import { rupiah } from "@/lib/format";
import { Product } from "@/lib/types";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
} from "@/components/ui";

const KOSONG = { nama: "", harga_jual: "", modal: "" };

export default function MenuPage() {
  const { products, ready, refresh } = useDb();
  const [form, setForm] = useState(KOSONG);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function isiForm(p: Product) {
    setEditId(p.id);
    setForm({
      nama: p.nama,
      harga_jual: String(p.harga_jual),
      modal: String(p.modal),
    });
  }

  function reset() {
    setEditId(null);
    setForm(KOSONG);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const harga_jual = Number(form.harga_jual);
    const modal = Number(form.modal);
    if (!form.nama.trim() || isNaN(harga_jual) || isNaN(modal)) return;
    setError(null);
    try {
      await saveProduct({
        id: editId ?? undefined,
        nama: form.nama.trim(),
        harga_jual,
        modal,
      });
      await refresh();
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan produk.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Menu</h1>
        <p className="text-slate-500">
          Atur daftar produk beserta harga jual dan modal (HPP).
        </p>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <Label>Nama produk</Label>
              <Input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Ayam goreng"
              />
            </div>
            <div>
              <Label>Harga jual</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={form.harga_jual}
                onChange={(e) =>
                  setForm({ ...form, harga_jual: e.target.value })
                }
                placeholder="15000"
              />
            </div>
            <div>
              <Label>Modal (HPP)</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={form.modal}
                onChange={(e) => setForm({ ...form, modal: e.target.value })}
                placeholder="9000"
              />
            </div>
            <div className="flex gap-2 sm:col-span-4">
              <Button type="submit">
                {editId ? "Simpan perubahan" : "Tambah produk"}
              </Button>
              {editId && (
                <Button type="button" variant="outline" onClick={reset}>
                  Batal
                </Button>
              )}
            </div>
            {error && (
              <p className="text-sm text-red-600 sm:col-span-4">{error}</p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {!ready ? (
            <p className="p-5 text-slate-400">Memuat…</p>
          ) : products.length === 0 ? (
            <p className="p-5 text-slate-400">
              Belum ada produk. Tambahkan lewat form di atas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="p-4 font-medium">Produk</th>
                    <th className="p-4 text-right font-medium">Harga jual</th>
                    <th className="p-4 text-right font-medium">Modal</th>
                    <th className="p-4 text-right font-medium">Untung/porsi</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="p-4 font-medium">{p.nama}</td>
                      <td className="p-4 text-right">{rupiah(p.harga_jual)}</td>
                      <td className="p-4 text-right text-slate-500">
                        {rupiah(p.modal)}
                      </td>
                      <td className="p-4 text-right font-semibold text-brand">
                        {rupiah(p.harga_jual - p.modal)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => isiForm(p)}
                          >
                            Ubah
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={async () => {
                              if (!confirm(`Hapus "${p.nama}"?`)) return;
                              try {
                                await deleteProduct(p.id);
                                await refresh();
                              } catch (err) {
                                setError(
                                  err instanceof Error
                                    ? err.message
                                    : "Gagal menghapus produk."
                                );
                              }
                            }}
                          >
                            Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
