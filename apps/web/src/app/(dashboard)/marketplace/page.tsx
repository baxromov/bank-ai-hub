"use client";

import { useEffect, useState } from "react";
import { marketplaceApi } from "@/api-client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CoinBadge } from "@/components/coins/CoinBadge";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  {
    key: "",
    label: "Все",
    iconPath: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  },
  {
    key: "professional",
    label: "Обучение",
    iconPath: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    key: "work_privileges",
    label: "Привилегии",
    iconPath: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  },
  {
    key: "bonuses",
    label: "Бонусы",
    iconPath: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7",
  },
  {
    key: "mcp_tools",
    label: "AI Инструменты",
    iconPath: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
];

function MarketplaceSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-48 rounded-2xl" />
      ))}
    </div>
  );
}

export default function MarketplacePage() {
  const [items, setItems] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    marketplaceApi.listItems(activeCategory || undefined)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const handlePurchase = async (itemId: string) => {
    try {
      await marketplaceApi.purchase(itemId);
      marketplaceApi.listItems(activeCategory || undefined).then(setItems);
    } catch (err: any) {
      alert(err.message || "Ошибка покупки");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Маркетплейс
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Потратьте IB-Coins на привилегии и инструменты
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: isActive ? "var(--color-brand)" : "var(--color-bg-secondary)",
                color: isActive ? "white" : "var(--color-text-secondary)",
                border: `1.5px solid ${isActive ? "var(--color-brand)" : "var(--color-border-subtle)"}`,
                boxShadow: isActive ? "0 4px 10px var(--color-brand-glow)" : "var(--shadow-xs)",
              }}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24"
                stroke={isActive ? "white" : "currentColor"} strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d={cat.iconPath} />
              </svg>
              {cat.label}
            </button>
          );
        })}
      </div>

      {loading ? <MarketplaceSkeleton /> : (
        items.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: "var(--color-bg-secondary)", boxShadow: "var(--shadow-sm)" }}>
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                style={{ color: "var(--color-text-tertiary)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
              Нет доступных товаров
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item: any) => (
              <div
                key={item.id}
                className="rounded-2xl p-5 flex flex-col transition-all hover:translate-y-[-2px]"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border-subtle)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold leading-tight" style={{ color: "var(--color-text-primary)" }}>
                    {item.name_ru}
                  </h3>
                  {item.linked_tool_id && (
                    <Badge variant="success">AI</Badge>
                  )}
                </div>
                <p className="text-xs leading-relaxed flex-1 mb-4" style={{ color: "var(--color-text-secondary)" }}>
                  {item.description}
                </p>
                <div className="flex items-center justify-between pt-3"
                  style={{ borderTop: "1px solid var(--color-border-subtle)" }}>
                  <CoinBadge amount={item.price} />
                  <Button variant="primary" size="sm" onClick={() => handlePurchase(item.id)}>
                    {item.linked_tool_id ? "Подключить" : "Купить"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
