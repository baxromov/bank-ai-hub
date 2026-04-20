"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { coinsApi } from "@/api-client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CoinBadge } from "@/components/coins/CoinBadge";

function StatsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [balance, setBalance] = useState({ balance: 0, total_earned: 0, total_spent: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      coinsApi.getBalance(),
      coinsApi.getTransactions(0, 5),
    ])
      .then(([b, t]) => { setBalance(b); setTransactions(t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Доброе утро";
    if (h < 18) return "Добрый день";
    return "Добрый вечер";
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          {greeting()}, {user?.first_name || "User"}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Добро пожаловать на платформу BankAI Hub
        </p>
      </div>

      {loading ? <StatsSkeleton /> : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Coins card */}
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1a6832 0%, #52ae30 100%)",
                boxShadow: "0 8px 24px rgba(82,174,48,0.35)",
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                style={{ background: "white", transform: "translate(30%, -30%)" }} />
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">IB-Coins баланс</p>
              <p className="text-4xl font-bold text-white tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>
                {balance.balance.toLocaleString()}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <span className="text-xs text-white/70">+{balance.total_earned} заработано</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <span className="text-xs text-white/70">-{balance.total_spent} потрачено</span>
                </div>
              </div>
            </div>

            <Card>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>
                Рейтинг недели
              </p>
              <p className="text-4xl font-bold tabular-nums mt-1" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-mono)" }}>
                #—
              </p>
              <p className="text-xs mt-3" style={{ color: "var(--color-text-tertiary)" }}>Текущая неделя</p>
            </Card>

            <Card>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>
                Инструменты
              </p>
              <p className="text-4xl font-bold tabular-nums mt-1" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-mono)" }}>
                0
              </p>
              <p className="text-xs mt-3" style={{ color: "var(--color-text-tertiary)" }}>Создано / Использовано</p>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
              Последние действия
            </h2>
            <Card>
              {transactions.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: "var(--color-bg-primary)" }}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                      style={{ color: "var(--color-text-tertiary)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Нет активности</p>
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>Начните использовать AI чат!</p>
                </div>
              ) : (
                <div>
                  {transactions.map((tx: any, i: number) => (
                    <div key={tx.id} className="flex items-center justify-between py-3"
                      style={{ borderBottom: i < transactions.length - 1 ? "1px solid var(--color-border-subtle)" : "none" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: "var(--color-bg-primary)" }}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                            style={{ color: "var(--color-coin-gold)" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                          {tx.description || tx.action_type}
                        </span>
                      </div>
                      <CoinBadge amount={tx.amount} showSign />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
