interface TrendIndicatorProps {
  change: number;
}

export function TrendIndicator({ change }: TrendIndicatorProps) {
  if (change === 0) {
    return <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{"\u2014"}</span>;
  }

  const isUp = change > 0;
  return (
    <span
      className="text-xs font-medium"
      style={{ color: isUp ? "var(--color-status-success)" : "var(--color-status-error)" }}
    >
      {isUp ? "\u25B2" : "\u25BC"} {isUp ? "+" : ""}{change}
    </span>
  );
}
