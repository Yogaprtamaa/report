import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { AuthGate } from "@/components/auth-gate";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Laporan Keuntungan — Warung Pecel Ayam",
  description: "Catat penjualan, langsung tahu untung bersih harian/mingguan/bulanan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <AuthGate>
            <Nav />
            <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
