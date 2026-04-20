import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function Card({ className, glow, children, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-2xl p-5", className)}
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border-subtle)",
        boxShadow: glow
          ? "var(--shadow-md), 0 0 24px var(--color-coin-gold-glow)"
          : "var(--shadow-sm)",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-xs font-semibold uppercase tracking-wider", className)}
      style={{ color: "var(--color-text-tertiary)" }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardValue({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-3xl font-bold tabular-nums mt-1", className)}
      style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-mono)" }}
      {...props}
    >
      {children}
    </div>
  );
}
