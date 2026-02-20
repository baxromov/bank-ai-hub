import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "success" | "warning" | "error";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: { backgroundColor: "var(--color-bg-tertiary)", color: "var(--color-text-secondary)" },
    gold: { backgroundColor: "var(--color-coin-gold-glow)", color: "var(--color-coin-gold)" },
    success: { backgroundColor: "rgba(62,207,113,0.1)", color: "var(--color-status-success)" },
    warning: { backgroundColor: "rgba(229,169,61,0.1)", color: "var(--color-status-warning)" },
    error: { backgroundColor: "rgba(229,77,77,0.1)", color: "var(--color-status-error)" },
  };

  return (
    <span
      className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium", className)}
      style={variantStyles[variant]}
      {...props}
    >
      {children}
    </span>
  );
}
