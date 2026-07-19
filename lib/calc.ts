import { Period, Product, Sale } from "./types";
import { labelBulan, labelTanggal } from "./format";

export interface Ringkasan {
  omzet: number;
  modal: number;
  untung: number;
  margin: number; // persen
  jumlahTransaksi: number;
}

export interface TrenPoint {
  key: string;
  label: string;
  untung: number;
  omzet: number;
}

export interface ProdukUntung {
  product_id: string;
  nama: string;
  qty: number;
  untung: number;
}

/* yyyy-mm-dd dari awal periode yang sedang berjalan. */
function awalPeriode(period: Period): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === "hari") return d;
  if (period === "minggu") {
    // Senin sebagai awal minggu.
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return d;
  }
  d.setDate(1);
  return d;
}

function untungSale(sale: Sale): number {
  return sale.items.reduce(
    (sum, it) => sum + (it.harga_jual_saat_itu - it.modal_saat_itu) * it.qty,
    0
  );
}

function modalSale(sale: Sale): number {
  return sale.items.reduce((sum, it) => sum + it.modal_saat_itu * it.qty, 0);
}

export function ringkasanPeriode(sales: Sale[], period: Period): Ringkasan {
  const batas = awalPeriode(period);
  const dalam = sales.filter((s) => new Date(s.tanggal + "T00:00:00") >= batas);

  const omzet = dalam.reduce((sum, s) => sum + s.total, 0);
  const modal = dalam.reduce((sum, s) => sum + modalSale(s), 0);
  const untung = omzet - modal;
  const margin = omzet > 0 ? (untung / omzet) * 100 : 0;

  return { omzet, modal, untung, margin, jumlahTransaksi: dalam.length };
}

/* Tren untung: hari -> 14 hari terakhir, minggu -> 8 minggu, bulan -> 6 bulan. */
export function trenUntung(sales: Sale[], period: Period): TrenPoint[] {
  const buckets = new Map<string, { label: string; untung: number; omzet: number }>();
  const sekarang = new Date();
  sekarang.setHours(0, 0, 0, 0);

  const slots: { key: string; label: string }[] = [];

  if (period === "hari") {
    for (let i = 13; i >= 0; i--) {
      const d = new Date(sekarang);
      d.setDate(d.getDate() - i);
      const key = isoLocal(d);
      slots.push({ key, label: labelTanggal(key) });
    }
  } else if (period === "minggu") {
    for (let i = 7; i >= 0; i--) {
      const d = new Date(sekarang);
      const day = (d.getDay() + 6) % 7;
      d.setDate(d.getDate() - day - i * 7);
      const key = isoLocal(d);
      slots.push({ key, label: labelTanggal(key) });
    }
  } else {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(sekarang.getFullYear(), sekarang.getMonth() - i, 1);
      const key = isoLocal(d);
      slots.push({ key, label: labelBulan(key) });
    }
  }

  for (const slot of slots) {
    buckets.set(slot.key, { label: slot.label, untung: 0, omzet: 0 });
  }

  for (const sale of sales) {
    const key = bucketKey(sale.tanggal, period);
    const b = buckets.get(key);
    if (b) {
      b.untung += untungSale(sale);
      b.omzet += sale.total;
    }
  }

  return slots.map((slot) => {
    const b = buckets.get(slot.key)!;
    return { key: slot.key, label: b.label, untung: b.untung, omzet: b.omzet };
  });
}

function bucketKey(tanggal: string, period: Period): string {
  const d = new Date(tanggal + "T00:00:00");
  if (period === "hari") return isoLocal(d);
  if (period === "minggu") {
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return isoLocal(d);
  }
  return isoLocal(new Date(d.getFullYear(), d.getMonth(), 1));
}

function isoLocal(d: Date): string {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

export function produkTeruntung(
  sales: Sale[],
  products: Product[],
  period: Period
): ProdukUntung[] {
  const batas = awalPeriode(period);
  const dalam = sales.filter((s) => new Date(s.tanggal + "T00:00:00") >= batas);
  const namaById = new Map(products.map((p) => [p.id, p.nama]));

  const acc = new Map<string, ProdukUntung>();
  for (const sale of dalam) {
    for (const it of sale.items) {
      const cur =
        acc.get(it.product_id) ??
        {
          product_id: it.product_id,
          nama: namaById.get(it.product_id) ?? "(produk dihapus)",
          qty: 0,
          untung: 0,
        };
      cur.qty += it.qty;
      cur.untung += (it.harga_jual_saat_itu - it.modal_saat_itu) * it.qty;
      acc.set(it.product_id, cur);
    }
  }

  return [...acc.values()].sort((a, b) => b.untung - a.untung);
}
