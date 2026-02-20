interface RankBadgeProps {
  rank: number;
}

export function RankBadge({ rank }: RankBadgeProps) {
  const colors: Record<number, string> = {
    1: "var(--color-coin-gold)",
    2: "#C0C0C0",
    3: "#CD7F32",
  };

  return (
    <span
      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
      style={{
        backgroundColor: rank <= 3 ? `${colors[rank]}20` : "var(--color-bg-tertiary)",
        color: rank <= 3 ? colors[rank] : "var(--color-text-secondary)",
      }}
    >
      #{rank}
    </span>
  );
}
