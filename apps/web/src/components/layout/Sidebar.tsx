"use client";

import { useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUIStore } from "@/stores/ui";

const NAV_ITEMS = [
  { href: "/", icon: "home", label: "Главная" },
  { href: "/chat", icon: "message", label: "AI Чат" },
  { href: "/coins", icon: "coin", label: "IB-Coins" },
  { href: "/rankings", icon: "trophy", label: "Рейтинг" },
  { href: "/achievements", icon: "medal", label: "Достижения" },
  { href: "/marketplace", icon: "store", label: "Маркетплейс" },
  { href: "/games", icon: "gamepad", label: "Игры" },
  { href: "/suggestions", icon: "lightbulb", label: "Предложения" },
  { href: "/profile", icon: "user", label: "Профиль" },
  { href: "/settings", icon: "gear", label: "Настройки" },
];

const ADMIN_ITEMS = [
  { href: "/admin", icon: "settings", label: "Админ" },
];

const ICONS: Record<string, string> = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4",
  message: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  coin: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  trophy: "M12 15l-2 5h4l-2-5zm0 0l8-4m-8 4l-8-4m8-7V3m4 5a4 4 0 11-8 0 4 4 0 018 0z",
  store: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  lightbulb: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  gear: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z",
  settings: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
  gamepad: "M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.491 48.491 0 01-4.163-.3c-1.18-.143-2.18.684-2.347 1.852a18.016 18.016 0 00-.17 2.347c0 3.036.792 5.884 2.182 8.358.162.289.493.442.83.388a48.09 48.09 0 014.46-.506c.16-.008.312-.067.428-.182a17.97 17.97 0 002.687-3.584c.18-.326.557-.504.924-.42a3.87 3.87 0 00.876.1c.32 0 .63-.035.924-.1.367-.084.745.094.924.42a17.97 17.97 0 002.687 3.584c.116.115.268.174.429.182a48.09 48.09 0 014.459.506c.337.054.668-.1.83-.388A17.903 17.903 0 0024.25 8.67c0-.795-.06-1.578-.171-2.347-.167-1.168-1.167-1.995-2.347-1.852a48.491 48.491 0 01-4.163.3.64.64 0 01-.657-.643v0z",
  medal: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
};

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const paths = name === "gear"
    ? [ICONS[name], "M15 12a3 3 0 11-6 0 3 3 0 016 0z"]
    : [ICONS[name] || ICONS.home];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-[18px] w-[18px] shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      style={{
        color: active ? "var(--color-brand)" : "var(--color-text-tertiary)",
        transition: "color var(--duration-fast)",
      }}
    >
      {paths.map((d, i) => (
        <path key={i} strokeLinecap="round" strokeLinejoin="round" d={d} />
      ))}
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [pathname, setSidebarOpen]);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen flex flex-col z-50 transition-all app-sidebar${sidebarOpen ? " sidebar-open" : ""}`}
      style={{
        width: sidebarOpen ? "220px" : "68px",
        backgroundColor: "var(--color-bg-secondary)",
        borderRight: "1px solid var(--color-border-subtle)",
        boxShadow: "var(--shadow-md)",
        transitionDuration: "var(--duration-normal)",
        transitionTimingFunction: "var(--ease-out)",
      }}
    >
      {/* Logo */}
      <div
        className="h-16 flex items-center px-4 overflow-hidden"
        style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
      >
        {sidebarOpen ? (
          <Image
            src="/otp_logo.png"
            alt="Ipoteka Bank"
            width={160}
            height={40}
            className="object-contain"
            style={{ height: "36px", width: "auto" }}
            priority
          />
        ) : (
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #1a6832 0%, #52ae30 100%)",
              boxShadow: "0 4px 10px rgba(82,174,48,0.35)",
              flexShrink: 0,
            }}
          >
            <span className="text-white font-bold text-sm">İ</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 py-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all relative"
              style={{
                backgroundColor: active ? "var(--color-brand-surface)" : "transparent",
                textDecoration: "none",
              }}
            >
              {active && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  style={{ backgroundColor: "var(--color-brand)" }}
                />
              )}
              <NavIcon name={item.icon} active={active} />
              {sidebarOpen && (
                <span
                  className="text-sm font-medium whitespace-nowrap"
                  style={{
                    color: active ? "var(--color-brand-dark)" : "var(--color-text-secondary)",
                    transition: "color var(--duration-fast)",
                  }}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin section */}
      <div
        className="px-3 py-3"
        style={{ borderTop: "1px solid var(--color-border-subtle)" }}
      >
        {ADMIN_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all"
              style={{
                backgroundColor: active ? "var(--color-brand-surface)" : "transparent",
                textDecoration: "none",
              }}
            >
              <NavIcon name={item.icon} active={active} />
              {sidebarOpen && (
                <span
                  className="text-sm font-medium"
                  style={{ color: active ? "var(--color-brand-dark)" : "var(--color-text-secondary)" }}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
