import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function Card({ className, glow, children, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-lg p-4", className)}
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border-subtle)",
        ...(glow ? { boxShadow: "0 0 20px var(--color-coin-gold-glow)" } : {}),
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
      className={cn("text-sm font-medium", className)}
      style={{ color: "var(--color-text-secondary)" }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardValue({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-2xl font-bold tabular-nums", className)}
      style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-mono)" }}
      {...props}
    >
      {children}
    </div>
  );
}
