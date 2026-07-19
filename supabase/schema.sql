-- Skema database Warung Pecel Ayam (untuk migrasi dari localStorage ke Supabase).
-- Jalankan di Supabase Dashboard > SQL Editor.

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  harga_jual integer not null,
  modal integer not null,
  created_at timestamptz default now()
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  tanggal date not null,
  total integer not null,
  created_at timestamptz default now()
);

create table if not exists sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  qty integer not null,
  -- 🔒 Snapshot: dikunci saat penjualan dicatat agar laporan lama tetap akurat.
  harga_jual_saat_itu integer not null,
  modal_saat_itu integer not null
);

create index if not exists idx_sales_tanggal on sales(tanggal);
create index if not exists idx_sale_items_sale on sale_items(sale_id);

-- Aktifkan Row Level Security bila dipakai multi-user.
alter table products enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;

-- Contoh policy: hanya user terautentikasi yang boleh akses.
drop policy if exists "auth read products" on products;
drop policy if exists "auth write products" on products;
drop policy if exists "auth read sales" on sales;
drop policy if exists "auth write sales" on sales;
drop policy if exists "auth read items" on sale_items;
drop policy if exists "auth write items" on sale_items;

create policy "auth read products" on products for select using (auth.role() = 'authenticated');
create policy "auth write products" on products for all using (auth.role() = 'authenticated');
create policy "auth read sales" on sales for select using (auth.role() = 'authenticated');
create policy "auth write sales" on sales for all using (auth.role() = 'authenticated');
create policy "auth read items" on sale_items for select using (auth.role() = 'authenticated');
create policy "auth write items" on sale_items for all using (auth.role() = 'authenticated');

-- Akun dummy buat pemakaian pribadi (single-user, tanpa signup di UI).
-- Ganti password di sini kalau mau update, lalu run ulang.
update auth.users
set email_confirmed_at = now(),
    encrypted_password = crypt('pecelayam123', gen_salt('bf'))
where email = 'admin@pecelayam.com';

