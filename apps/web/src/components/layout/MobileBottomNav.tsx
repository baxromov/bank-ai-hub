"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS: Record<string, string> = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  message: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  coin: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  trophy: "M12 15l-2 5h4l-2-5zm0 0l8-4m-8 4l-8-4m8-7V3m4 5a4 4 0 11-8 0 4 4 0 018 0z",
  medal: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  store: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  gamepad: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z",
  lightbulb: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  gear: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z",
};

function NavIcon({ name, active, size = 20 }: { name: string; active: boolean; size?: number }) {
  const d = ICONS[name] || ICONS.home;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: active ? "var(--color-brand)" : "var(--color-text-tertiary)" }}
    >
      <path d={d} />
      {name === "gear" && <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
    </svg>
  );
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: active ? "var(--color-brand)" : "var(--color-text-tertiary)" }}
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

const BOTTOM_TABS = [
  { href: "/",         icon: "home",    label: "Главная"  },
  { href: "/chat",     icon: "message", label: "Чат"      },
  { href: "/coins",    icon: "coin",    label: "Монеты"   },
  { href: "/rankings", icon: "trophy",  label: "Рейтинг"  },
] as const;

const MORE_ITEMS = [
  { href: "/achievements", icon: "medal",     label: "Достижения"  },
  { href: "/marketplace",  icon: "store",     label: "Маркетплейс" },
  { href: "/games",        icon: "gamepad",   label: "Игры"        },
  { href: "/suggestions",  icon: "lightbulb", label: "Предложения" },
  { href: "/profile",      icon: "user",      label: "Профиль"     },
  { href: "/settings",     icon: "gear",      label: "Настройки"   },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const isMoreActive = MORE_ITEMS.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <>
      {/* Bottom tab bar */}
      <nav className="mobile-bottom-nav">
        {BOTTOM_TABS.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link key={tab.href} href={tab.href} className="bottom-tab-item">
              {active && <span className="bottom-tab-indicator" />}
              <NavIcon name={tab.icon} active={active} />
              <span className={`bottom-tab-label${active ? " active" : ""}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* "Ещё" button */}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          className="bottom-tab-item"
        >
          {(isMoreActive || moreOpen) && <span className="bottom-tab-indicator" />}
          <GridIcon active={isMoreActive || moreOpen} />
          <span className={`bottom-tab-label${isMoreActive || moreOpen ? " active" : ""}`}>
            Ещё
          </span>
        </button>
      </nav>

      {/* Backdrop */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More sheet */}
      <div className={`more-sheet${moreOpen ? " more-sheet-open" : ""}`}>
        <div className="more-sheet-handle" />
        <div className="more-sheet-grid">
          {MORE_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={`more-sheet-item${active ? " active" : ""}`}
              >
                <div className="more-sheet-icon-wrap">
                  <NavIcon name={item.icon} active={active} size={22} />
                </div>
                <span className="more-sheet-label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
