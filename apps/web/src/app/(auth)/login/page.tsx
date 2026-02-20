"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError("Неверный email или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <div
        className="w-full max-w-md p-8 rounded-lg"
        style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border-subtle)" }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            BankAI Hub
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Войдите в платформу AI Ipoteka Bank
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded text-sm" style={{ backgroundColor: "rgba(229,77,77,0.1)", color: "var(--color-status-error)" }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm outline-none transition-colors"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border-subtle)",
                color: "var(--color-text-primary)",
              }}
              placeholder="user@ipotekabank.uz"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm outline-none transition-colors"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border-subtle)",
                color: "var(--color-text-primary)",
              }}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: loading ? "var(--color-coin-gold-dim)" : "var(--color-coin-gold)",
              color: "var(--color-bg-primary)",
            }}
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
