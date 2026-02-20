"use client";

import { useEffect } from "react";

interface CoinToastProps {
  amount: number;
  reason: string;
  onClose: () => void;
}

export function CoinToast({ amount, reason, onClose }: CoinToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right"
      style={{
        backgroundColor: "var(--color-bg-elevated)",
        border: "1px solid rgba(212, 168, 67, 0.3)",
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
        style={{ backgroundColor: "var(--color-coin-gold)", color: "var(--color-bg-primary)" }}
      >
        B
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--color-coin-gold)" }}>
          +{amount} IB-Coins
        </p>
        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{reason}</p>
      </div>
      <button onClick={onClose} className="ml-2" style={{ color: "var(--color-text-tertiary)" }}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
