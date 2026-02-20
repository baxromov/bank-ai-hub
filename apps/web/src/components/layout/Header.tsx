"use client";

import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useUIStore } from "@/stores/ui";
import { CoinBalanceDisplay } from "./CoinBalanceDisplay";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header
      className="h-14 flex items-center justify-between px-6 sticky top-0 z-40"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        borderBottom: "1px solid var(--color-border-subtle)",
      }}
    >
      {/* Left — Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md transition-colors hover:opacity-80"
        style={{ color: "var(--color-text-secondary)" }}
        title={sidebarOpen ? "Свернуть меню" : "Развернуть меню"}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Center — Coin Balance */}
      <CoinBalanceDisplay />

      {/* Right — Notifications + User */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-md transition-colors"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-medium"
              style={{ backgroundColor: "var(--color-coin-gold)", color: "var(--color-bg-primary)" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
            style={{ backgroundColor: "var(--color-bg-tertiary)", color: "var(--color-text-primary)" }}
          >
            {user?.first_name?.[0] || "U"}
          </div>
          <button
            onClick={logout}
            className="text-xs transition-colors"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}
