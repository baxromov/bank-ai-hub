"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useUIStore } from "@/stores/ui";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <Sidebar />
      <div
        className="flex-1 flex flex-col transition-all"
        style={{
          marginLeft: sidebarOpen ? "200px" : "64px",
          transitionDuration: "var(--duration-normal)",
        }}
      >
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
