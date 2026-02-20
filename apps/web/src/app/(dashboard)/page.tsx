"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { coinsApi, rankingsApi } from "@/api-client";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { CoinBadge } from "@/components/coins/CoinBadge";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [balance, setBalance] = useState({ balance: 0, total_earned: 0, total_spent: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    coinsApi.getBalance().then(setBalance).catch(() => {});
    coinsApi.getTransactions(0, 5).then(setTransactions).catch(() => {});
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Доброе утро";
    if (hour < 18) return "Добрый день";
    return "Добрый вечер";
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6" style={{ color: "var(--color-text-primary)" }}>
        {greeting()}, {user?.first_name || "User"}
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card glow>
          <CardTitle>IB-Coins</CardTitle>
          <CardValue>
            <span style={{ color: "var(--color-coin-gold)" }}>{balance.balance.toLocaleString()}</span>
          </CardValue>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
            Заработано: {balance.total_earned} / Потрачено: {balance.total_spent}
          </p>
        </Card>

        <Card>
          <CardTitle>Рейтинг</CardTitle>
          <CardValue>#—</CardValue>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
            Текущая неделя
          </p>
        </Card>

        <Card>
          <CardTitle>Инструменты</CardTitle>
          <CardValue>0</CardValue>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
            Создано / Использовано
          </p>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-sm font-medium mb-3" style={{ color: "var(--color-text-secondary)" }}>
          Последние действия
        </h2>
        <Card>
          {transactions.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: "var(--color-text-tertiary)" }}>
              Нет активности. Начните использовать AI чат!
            </p>
          ) : (
            <div>
              {transactions.map((tx: any) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2"
                  style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
                >
                  <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>
                    {tx.description || tx.action_type}
                  </span>
                  <CoinBadge amount={tx.amount} showSign />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
