"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getSupabase, supabaseEnabled } from "@/lib/supabase";

interface AuthState {
  /** true = login Supabase aktif; false = mode lokal tanpa login. */
  enabled: boolean;
  loading: boolean;
  email: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }
    sb.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      enabled: supabaseEnabled,
      loading,
      email,
      async signIn(em, pw) {
        const sb = getSupabase();
        if (!sb) return {};
        const { error } = await sb.auth.signInWithPassword({
          email: em,
          password: pw,
        });
        return { error: error?.message };
      },
      async signOut() {
        await getSupabase()?.auth.signOut();
        setEmail(null);
      },
    }),
    [loading, email]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus di dalam <AuthProvider>");
  return ctx;
}
