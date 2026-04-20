import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl", className)}
      style={{ backgroundColor: "var(--color-bg-elevated)" }}
      {...props}
    />
  );
}
