export function rupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(isFinite(n) ? n : 0);
}

export function persen(n: number): string {
  return `${(isFinite(n) ? n : 0).toFixed(1)}%`;
}

/** yyyy-mm-dd untuk hari ini (zona waktu lokal). */
export function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

/** "Sen, 28 Jun" — label pendek tanggal. */
export function labelTanggal(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

export function labelBulan(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
    year: "2-digit",
  }).format(d);
}
