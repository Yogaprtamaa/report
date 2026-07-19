"use client";

import { useCallback, useEffect, useState } from "react";
import { getProducts, getSales } from "./storage";
import { Product, Sale } from "./types";

/** Membaca produk & penjualan dari Supabase. Panggil refresh() setelah nulis. */
export function useDb() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const [p, s] = await Promise.all([getProducts(), getSales()]);
    setProducts(p);
    setSales(s);
  }, []);

  useEffect(() => {
    refresh().finally(() => setReady(true));
  }, [refresh]);

  return { products, sales, ready, refresh };
}
