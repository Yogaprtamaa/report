"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "./auth-provider";
import { Button } from "./ui";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/input", label: "Input Jualan", icon: "🧾" },
  { href: "/menu", label: "Menu", icon: "🍗" },
];

export function Nav() {
  const pathname = usePathname();
  const { enabled, email, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="text-xl">🍗</span>
          <span className="hidden sm:inline">Warung Pecel Ayam</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <span className="sm:hidden">{l.icon}</span>
                <span className="hidden sm:inline">{l.label}</span>
              </Link>
            );
          })}
        </nav>

        {enabled && email && (
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            Keluar
          </Button>
        )}
      </div>
    </header>
  );
}
