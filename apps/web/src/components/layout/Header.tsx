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
      className="h-16 flex items-center justify-between px-6 sticky top-0 z-40"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        borderBottom: "1px solid var(--color-border-subtle)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Left — Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-xl transition-all hover:opacity-80"
        style={{
          color: "var(--color-text-secondary)",
          backgroundColor: "var(--color-bg-primary)",
          border: "1px solid var(--color-border-subtle)",
        }}
        title={sidebarOpen ? "Свернуть меню" : "Развернуть меню"}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl transition-all hover:opacity-80"
          style={{
            color: "var(--color-text-secondary)",
            backgroundColor: "var(--color-bg-primary)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold"
              style={{
                backgroundColor: "var(--color-brand)",
                color: "#FFFFFF",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* User Menu */}
        <div
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl"
          style={{
            backgroundColor: "var(--color-bg-primary)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{
              background: "linear-gradient(135deg, #1a6832 0%, #52ae30 100%)",
              color: "#FFFFFF",
            }}
          >
            {user?.first_name?.[0] || "U"}
          </div>
          <span className="text-sm font-medium hidden sm:block" style={{ color: "var(--color-text-primary)" }}>
            {user?.first_name || "User"}
          </span>
          <button
            onClick={logout}
            className="transition-colors hover:opacity-70 hidden sm:block"
            style={{ color: "var(--color-text-tertiary)" }}
            title="Выйти"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
