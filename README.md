# 📊 Web Laporan Keuntungan — Warung Pecel Ayam

Catat penjualan → langsung tahu **untung bersih setelah dipotong modal**, per hari / minggu / bulan.

## Halaman

| Halaman | Fungsi |
|---|---|
| **Dashboard** (`/dashboard`) | Kartu ringkasan, grafik tren untung, tabel produk teruntung |
| **Input Jualan** (`/input`) | Pilih produk → isi jumlah laku → simpan (modal & harga dikunci) |
| **Menu** (`/menu`) | Kelola produk: nama, harga jual, modal (HPP) |

## Cara hitung untung

```
Untung per produk = (harga jual − modal) × jumlah laku
Total untung      = jumlah semua produk
```

Modal & harga **dikunci (snapshot)** saat penjualan dicatat — jadi kalau harga/modal nanti diubah, laporan bulan lalu tetap akurat.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## Penyimpanan data

Saat ini data disimpan **lokal di browser (localStorage)** — langsung jalan tanpa setup apa pun.

## Login Supabase (opsional)

Login dilewati selama kredensial Supabase belum diisi. Untuk mengaktifkan:

1. Buat project di [supabase.com](https://supabase.com).
2. Salin `.env.local.example` → `.env.local`, isi:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
   (dari Project Settings → API)
3. Restart `npm run dev`. Halaman login otomatis muncul.

Untuk migrasi penyimpanan data ke Supabase, jalankan `supabase/schema.sql` di SQL Editor (skema sudah disiapkan dengan kolom snapshot).

## Stack

Next.js (App Router) · Tailwind · Recharts · Supabase (auth).
# report
