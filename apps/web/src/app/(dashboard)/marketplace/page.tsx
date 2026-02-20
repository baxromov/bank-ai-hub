"use client";

import { useEffect, useState } from "react";
import { marketplaceApi } from "@/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CoinBadge } from "@/components/coins/CoinBadge";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { key: "", label: "Все" },
  { key: "professional", label: "Обучение" },
  { key: "work_privileges", label: "Привилегии" },
  { key: "bonuses", label: "Бонусы" },
  { key: "mcp_tools", label: "AI Инструменты" },
];

export default function MarketplacePage() {
  const [items, setItems] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    marketplaceApi.listItems(activeCategory || undefined).then(setItems).catch(() => setItems([]));
  }, [activeCategory]);

  const handlePurchase = async (itemId: string) => {
    try {
      await marketplaceApi.purchase(itemId);
      // Refresh items
      marketplaceApi.listItems(activeCategory || undefined).then(setItems);
    } catch (err: any) {
      alert(err.message || "Ошибка покупки");
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6" style={{ color: "var(--color-text-primary)" }}>
        Маркетплейс
      </h1>

      {/* Category Filter */}
      <div className="flex gap-1 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className="px-3 py-1.5 text-sm rounded-md transition-colors"
            style={{
              backgroundColor: activeCategory === cat.key ? "var(--color-bg-tertiary)" : "transparent",
              color: activeCategory === cat.key ? "var(--color-text-primary)" : "var(--color-text-secondary)",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 ? (
          <p className="col-span-full text-center py-12 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
            Нет доступных товаров
          </p>
        ) : (
          items.map((item: any) => (
            <Card key={item.id}>
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                    {item.name_ru}
                  </h3>
                  {item.linked_tool_id && <Badge variant="gold">AI</Badge>}
                </div>
                <p className="text-xs mb-4 flex-1" style={{ color: "var(--color-text-tertiary)" }}>
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <CoinBadge amount={item.price} />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handlePurchase(item.id)}
                  >
                    {item.linked_tool_id ? "Подключить" : "Купить"}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
