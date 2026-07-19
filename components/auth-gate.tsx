"use client";

import { useState } from "react";
import { useAuth } from "./auth-provider";
import { Button, Card, CardContent, Input, Label } from "./ui";

/**
 * Membungkus app. Kalau Supabase aktif & belum login -> tampilkan form login.
 * Kalau Supabase tidak dikonfigurasi -> langsung lewat (mode lokal).
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { enabled, loading, email } = useAuth();

  if (!enabled) return <>{children}</>;
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-slate-400">
        Memuat…
      </div>
    );
  }
  if (!email) return <LoginForm />;
  return <>{children}</>;
}

function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) setError(error);
    setBusy(false);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl">🍗</div>
            <h1 className="mt-2 text-lg font-bold text-slate-900">
              Warung Pecel Ayam
            </h1>
            <p className="text-sm text-slate-500">Masuk ke akunmu</p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Memproses…" : "Masuk"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
