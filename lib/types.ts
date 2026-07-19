export interface Product {
  id: string;
  nama: string;
  harga_jual: number;
  modal: number;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  qty: number;
  /** Harga jual dikunci (snapshot) saat penjualan dicatat. */
  harga_jual_saat_itu: number;
  /** Modal/HPP dikunci (snapshot) saat penjualan dicatat. */
  modal_saat_itu: number;
}

export interface Sale {
  id: string;
  /** ISO date string (yyyy-mm-dd). */
  tanggal: string;
  total: number;
  items: SaleItem[];
}

export type Period = "hari" | "minggu" | "bulan";
