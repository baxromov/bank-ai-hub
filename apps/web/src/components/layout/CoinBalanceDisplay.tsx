"use client";

import { useEffect, useState } from "react";
import { coinsApi } from "@/api-client";

export function CoinBalanceDisplay() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    coinsApi.getBalance().then((data) => setBalance(data.balance)).catch(() => {});
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: "var(--color-coin-gold-glow)" }}>
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ backgroundColor: "var(--color-coin-gold)", color: "var(--color-bg-primary)" }}
      >
        B
      </div>
      <span
        className="text-sm font-medium tabular-nums"
        style={{ color: "var(--color-coin-gold)", fontFamily: "var(--font-mono)" }}
      >
        {balance !== null ? balance.toLocaleString() : "\u2014"}
      </span>
      <span className="text-xs" style={{ color: "var(--color-coin-gold-dim)" }}>
        IB
      </span>
    </div>
  );
}
