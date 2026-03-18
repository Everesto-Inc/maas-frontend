"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post<{ access_token: string; client: object }>("/auth/login", form);
      saveSession(res.access_token, res.client as never);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="neuro p-10 max-w-md w-full space-y-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Welcome back</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sign in to your monitoring portal.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Email", k: "email", type: "email", placeholder: "you@company.com" },
            { label: "Password", k: "password", type: "password", placeholder: "••••••••" },
          ].map(({ label, k, type, placeholder }) => (
            <div key={k} className="space-y-2">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</label>
              <div className="neuro-inset px-4 py-3">
                <input type={type} placeholder={placeholder} value={form[k as keyof typeof form]}
                  onChange={set(k)} required
                  className="w-full bg-transparent outline-none text-sm" style={{ color: "var(--text-primary)" }} />
              </div>
            </div>
          ))}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="submit" disabled={loading}
            className="neuro-btn-primary w-full py-3 text-sm font-medium disabled:opacity-60">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
          <Link href="/reset-password" style={{ color: "var(--accent)" }}>Forgot password?</Link>
          <span>
            No account?{" "}
            <Link href="/signup" style={{ color: "var(--accent)" }} className="font-medium">Sign up</Link>
          </span>
        </div>
      </div>
    </main>
  );
}
