"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";
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
        className="flex-1 flex flex-col transition-all app-main-content"
        style={{
          marginLeft: sidebarOpen ? "220px" : "68px",
          transitionDuration: "var(--duration-normal)",
          transitionTimingFunction: "var(--ease-out)",
        }}
      >
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-auto app-main-scroll-area">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
