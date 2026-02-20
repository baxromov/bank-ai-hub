interface CoinEarnInlineProps {
  amount: number;
  reason: string;
}

export function CoinEarnInline({ amount, reason }: CoinEarnInlineProps) {
  return (
    <div className="flex justify-center my-3">
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
        style={{
          backgroundColor: "var(--color-coin-gold-glow)",
          border: "1px solid rgba(212, 168, 67, 0.2)",
        }}
      >
        <span
          className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ backgroundColor: "var(--color-coin-gold)", color: "var(--color-bg-primary)" }}
        >
          B
        </span>
        <span style={{ color: "var(--color-coin-gold)" }} className="font-medium">
          +{amount} IB
        </span>
        <span style={{ color: "var(--color-coin-gold-dim)" }}>{reason}</span>
      </div>
    </div>
  );
}
