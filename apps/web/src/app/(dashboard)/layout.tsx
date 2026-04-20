"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

function PageSkeleton() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      {/* Sidebar skeleton */}
      <div
        className="fixed left-0 top-0 h-screen w-[220px] flex flex-col"
        style={{ backgroundColor: "var(--color-bg-secondary)", borderRight: "1px solid var(--color-border-subtle)" }}
      >
        <div className="h-16 flex items-center px-4" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="flex-1 px-3 py-3 flex flex-col gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: "220px" }}>
        {/* Header skeleton */}
        <div
          className="h-16 flex items-center justify-between px-6"
          style={{ backgroundColor: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border-subtle)" }}
        >
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-36" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>

        {/* Page skeleton */}
        <main className="flex-1 p-6">
          <div className="max-w-[1200px] mx-auto">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72 mb-8" />
            <div className="grid grid-cols-3 gap-4 mb-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth(true);

  if (isLoading) return <PageSkeleton />;

  return <AppShell>{children}</AppShell>;
}
