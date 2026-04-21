"use client";

import { useEffect, useState } from "react";
import { coinsApi } from "@/api-client";

export function CoinBalanceDisplay() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    coinsApi.getBalance().then((data) => setBalance(data.balance)).catch(() => {});
  }, []);

  return (
    <div
      className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
      style={{
        background: "linear-gradient(135deg, rgba(212,168,67,0.12) 0%, rgba(240,199,94,0.08) 100%)",
        border: "1px solid rgba(212,168,67,0.3)",
      }}
    >
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
        style={{
          background: "linear-gradient(135deg, #D4A843 0%, #F0C75E 100%)",
          color: "#1a0e00",
          boxShadow: "0 2px 6px rgba(212,168,67,0.35)",
        }}
      >
        ₿
      </div>
      <span
        className="text-sm font-semibold tabular-nums"
        style={{ color: "var(--color-coin-gold-dim)", fontFamily: "var(--font-mono)" }}
      >
        {balance !== null ? balance.toLocaleString() : "—"}
      </span>
      <span className="text-xs font-medium hidden sm:inline" style={{ color: "var(--color-coin-gold-dim)", opacity: 0.7 }}>
        IB-Coin
      </span>
    </div>
  );
}
