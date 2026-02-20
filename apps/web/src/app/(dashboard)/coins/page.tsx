"use client";

import { useEffect, useState } from "react";
import { coinsApi } from "@/api-client";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { TransactionRow } from "@/components/coins/TransactionRow";

export default function CoinsPage() {
  const [balance, setBalance] = useState({ balance: 0, total_earned: 0, total_spent: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    coinsApi.getBalance().then(setBalance).catch(() => {});
    coinsApi.getTransactions(0, 50).then(setTransactions).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6" style={{ color: "var(--color-text-primary)" }}>
        IB-Coins
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card glow>
          <CardTitle>Баланс</CardTitle>
          <CardValue>
            <span style={{ color: "var(--color-coin-gold)" }}>{balance.balance.toLocaleString()}</span>
          </CardValue>
        </Card>
        <Card>
          <CardTitle>Заработано</CardTitle>
          <CardValue>{balance.total_earned.toLocaleString()}</CardValue>
        </Card>
        <Card>
          <CardTitle>Потрачено</CardTitle>
          <CardValue>{balance.total_spent.toLocaleString()}</CardValue>
        </Card>
      </div>

      <h2 className="text-sm font-medium mb-3" style={{ color: "var(--color-text-secondary)" }}>
        История транзакций
      </h2>
      <Card>
        {transactions.length === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: "var(--color-text-tertiary)" }}>
            Нет транзакций
          </p>
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
    </div>
  );
}
