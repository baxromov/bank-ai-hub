"use client";

import { useEffect, useState } from "react";
import { coinsApi } from "@/api-client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionRow } from "@/components/coins/TransactionRow";

function CoinsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-5 w-40 mb-4" />
      <Card>
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

export default function CoinsPage() {
  const [balance, setBalance] = useState({ balance: 0, total_earned: 0, total_spent: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      coinsApi.getBalance(),
      coinsApi.getTransactions(0, 50),
    ])
      .then(([b, t]) => { setBalance(b); setTransactions(t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          IB-Coins
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Ваш баланс и история транзакций
        </p>
      </div>

      {loading ? <CoinsSkeleton /> : (
        <>
          {/* Balance cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #B8912E 0%, #D4A843 60%, #F0C75E 100%)",
                boxShadow: "0 8px 24px rgba(212,168,67,0.4)",
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                style={{ background: "white", transform: "translate(30%, -30%)" }} />
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">Текущий баланс</p>
              <p className="text-4xl font-bold text-white tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>
                {balance.balance.toLocaleString()}
              </p>
              <p className="text-xs text-white/70 mt-2">IB-Coin</p>
            </div>

            <Card>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    style={{ color: "var(--color-status-success)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
                  Заработано
                </p>
              </div>
              <p className="text-3xl font-bold tabular-nums" style={{ color: "var(--color-status-success)", fontFamily: "var(--font-mono)" }}>
                +{balance.total_earned.toLocaleString()}
              </p>
            </Card>

            <Card>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    style={{ color: "var(--color-status-error)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
                  Потрачено
                </p>
              </div>
              <p className="text-3xl font-bold tabular-nums" style={{ color: "var(--color-status-error)", fontFamily: "var(--font-mono)" }}>
                -{balance.total_spent.toLocaleString()}
              </p>
            </Card>
          </div>

          {/* Transactions */}
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
            История транзакций
          </h2>
          <Card>
            {transactions.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: "var(--color-bg-primary)" }}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                    style={{ color: "var(--color-text-tertiary)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Нет транзакций</p>
              </div>
            ) : (
              transactions.map((tx: any) => (
                <TransactionRow
                  key={tx.id}
                  actionType={tx.action_type}
                  amount={tx.amount}
                  description={tx.description}
                  status={tx.status}
                  createdAt={tx.created_at}
                />
              ))
            )}
          </Card>
        </>
      )}
    </div>
  );
}
