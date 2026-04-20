"use client";

import { useEffect, useState } from "react";
import { marketplaceApi } from "@/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CoinBadge } from "@/components/coins/CoinBadge";

const CATEGORIES = [
  {
    key: "",
    label: "Все товары",
    color: "#52ae30",
    bg: "rgba(82,174,48,0.10)",
    iconPath: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  },
  {
    key: "professional",
    label: "Обучение",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.10)",
    iconPath:
      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    key: "work_privileges",
    label: "Привилегии",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.10)",
    iconPath:
      "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  },
  {
    key: "bonuses",
    label: "Бонусы",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.10)",
    iconPath:
      "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7",
  },
  {
    key: "mcp_tools",
    label: "AI Инструменты",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.10)",
    iconPath:
      "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
];

function MarketplaceSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-52 rounded-2xl" />
      ))}
    </div>
  );
}

export default function MarketplacePage() {
  const [items, setItems] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());

  const activeCat = CATEGORIES.find((c) => c.key === activeCategory) ?? CATEGORIES[0];

  useEffect(() => {
    setLoading(true);
    marketplaceApi
      .listItems(activeCategory || undefined)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const handlePurchase = async (itemId: string) => {
    setPurchasing(itemId);
    try {
      await marketplaceApi.purchase(itemId);
      setPurchasedIds((prev) => new Set([...prev, itemId]));
      marketplaceApi.listItems(activeCategory || undefined).then(setItems);
    } catch (err: any) {
      alert(err.message || "Ошибка покупки");
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          Маркетплейс
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Потратьте IB-Coins на привилегии и инструменты
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-7">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: isActive ? cat.color : "var(--color-bg-secondary)",
                color: isActive ? "white" : "var(--color-text-secondary)",
                border: `1.5px solid ${isActive ? cat.color : "var(--color-border-subtle)"}`,
                boxShadow: isActive ? `0 4px 14px ${cat.color}40` : "var(--shadow-xs)",
                transform: isActive ? "translateY(-1px)" : "none",
              }}
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: isActive ? "rgba(255,255,255,0.25)" : cat.bg }}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={isActive ? "white" : cat.color}
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={cat.iconPath} />
                </svg>
              </div>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Items */}
      {loading ? (
        <MarketplaceSkeleton />
      ) : items.length === 0 ? (
        <div className="py-20 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: activeCat.bg }}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke={activeCat.color}
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={activeCat.iconPath} />
            </svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Нет доступных товаров
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
            В категории «{activeCat.label}» пока нет товаров
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item: any) => {
            const cat = CATEGORIES.find((c) => c.key === item.category) ?? CATEGORIES[0];
            const isPurchased = purchasedIds.has(item.id);
            const isBuying = purchasing === item.id;
            return (
              <div
                key={item.id}
                className="rounded-2xl flex flex-col transition-all hover:translate-y-[-2px]"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border-subtle)",
                  boxShadow: "var(--shadow-sm)",
                  overflow: "hidden",
                }}
              >
                {/* Card header strip */}
                <div
                  className="px-5 py-4 flex items-start gap-3"
                  style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: cat.bg }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke={cat.color}
                      strokeWidth={1.75}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={cat.iconPath} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="text-sm font-semibold leading-snug"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {item.name_ru}
                      </h3>
                      {item.linked_tool_id && (
                        <span
                          className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}
                        >
                          AI
                        </span>
                      )}
                    </div>
                    <span
                      className="text-xs mt-0.5 inline-block"
                      style={{ color: cat.color, fontWeight: 500 }}
                    >
                      {cat.label}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="px-5 py-3 flex-1">
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Footer */}
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{ borderTop: "1px solid var(--color-border-subtle)" }}
                >
                  <CoinBadge amount={item.price} />
                  {isPurchased ? (
                    <span
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl"
                      style={{ backgroundColor: "rgba(82,174,48,0.12)", color: "var(--color-brand)" }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Куплено
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePurchase(item.id)}
                      disabled={isBuying}
                    >
                      {isBuying ? (
                        <span className="flex items-center gap-1.5">
                          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          ...
                        </span>
                      ) : item.linked_tool_id ? (
                        "Подключить"
                      ) : (
                        "Купить"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
