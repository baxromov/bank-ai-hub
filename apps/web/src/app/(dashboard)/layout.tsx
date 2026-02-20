"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg-primary)" }}>
        <p style={{ color: "var(--color-text-secondary)" }}>Загрузка...</p>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
