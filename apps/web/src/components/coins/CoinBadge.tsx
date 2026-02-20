interface CoinBadgeProps {
  amount: number;
  showSign?: boolean;
  size?: "sm" | "md" | "lg";
}

export function CoinBadge({ amount, showSign = false, size = "md" }: CoinBadgeProps) {
  const isPositive = amount > 0;
  const sizes = { sm: "text-xs", md: "text-sm", lg: "text-lg" };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium tabular-nums ${sizes[size]}`}
      style={{
        color: isPositive ? "var(--color-coin-gold)" : "var(--color-status-error)",
        fontFamily: "var(--font-mono)",
      }}
    >
      {showSign && isPositive ? "+" : ""}
      {amount.toLocaleString()} IB
    </span>
  );
}
