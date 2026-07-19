import { getSupabase } from "./supabase";
import { Product, Sale, SaleItem } from "./types";

function sb() {
  const client = getSupabase();
  if (!client) throw new Error("Supabase belum dikonfigurasi (.env.local kosong).");
  return client;
}

/* ---------- Produk ---------- */

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await sb()
    .from("products")
    .select("*")
    .order("created_at");
  if (error) throw error;
  return data as Product[];
}

export async function saveProduct(
  input: Omit<Product, "id"> & { id?: string }
): Promise<Product> {
  const client = sb();
  const payload = {
    nama: input.nama,
    harga_jual: input.harga_jual,
    modal: input.modal,
  };
  if (input.id) {
    const { data, error } = await client
      .from("products")
      .update(payload)
      .eq("id", input.id)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  }
  const { data, error } = await client
    .from("products")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await sb().from("products").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- Penjualan ---------- */

export interface NewSaleItem {
  product_id: string;
  qty: number;
  harga_jual_saat_itu: number;
  modal_saat_itu: number;
}

export async function getSales(): Promise<Sale[]> {
  const { data, error } = await sb()
    .from("sales")
    .select("id, tanggal, total, sale_items(*)")
    .order("tanggal", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((s) => ({
    id: s.id,
    tanggal: s.tanggal,
    total: s.total,
    items: (s.sale_items ?? []) as SaleItem[],
  }));
}

export async function addSale(
  tanggal: string,
  items: NewSaleItem[]
): Promise<Sale> {
  const client = sb();
  const total = items.reduce(
    (sum, it) => sum + it.harga_jual_saat_itu * it.qty,
    0
  );

  const { data: sale, error: saleErr } = await client
    .from("sales")
    .insert({ tanggal, total })
    .select()
    .single();
  if (saleErr) throw saleErr;

  const { data: rows, error: itemsErr } = await client
    .from("sale_items")
    .insert(items.map((it) => ({ ...it, sale_id: sale.id })))
    .select();
  if (itemsErr) throw itemsErr;

  return {
    id: sale.id,
    tanggal: sale.tanggal,
    total: sale.total,
    items: rows as SaleItem[],
  };
}

export async function deleteSale(id: string): Promise<void> {
  const { error } = await sb().from("sales").delete().eq("id", id);
  if (error) throw error;
}
