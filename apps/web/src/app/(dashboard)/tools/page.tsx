"use client";

import { useEffect, useState } from "react";
import { toolsApi } from "@/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function ToolsPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [myTools, setMyTools] = useState<any[]>([]);
  const [tab, setTab] = useState<"browse" | "my">("browse");

  useEffect(() => {
    toolsApi.browse().then(setTools).catch(() => setTools([]));
    toolsApi.getMyTools().then(setMyTools).catch(() => setMyTools([]));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
          Инструменты
        </h1>
        <Link href="/tools/create">
          <Button variant="primary" size="sm">+ Создать инструмент</Button>
        </Link>
      </div>

      <div className="flex gap-1 mb-6">
        <button
          onClick={() => setTab("browse")}
          className="px-3 py-1.5 text-sm rounded-md"
          style={{
            backgroundColor: tab === "browse" ? "var(--color-bg-tertiary)" : "transparent",
            color: tab === "browse" ? "var(--color-text-primary)" : "var(--color-text-secondary)",
          }}
        >
          Каталог
        </button>
        <button
          onClick={() => setTab("my")}
          className="px-3 py-1.5 text-sm rounded-md"
          style={{
            backgroundColor: tab === "my" ? "var(--color-bg-tertiary)" : "transparent",
            color: tab === "my" ? "var(--color-text-primary)" : "var(--color-text-secondary)",
          }}
        >
          Мои инструменты
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(tab === "browse" ? tools : myTools).length === 0 ? (
          <p className="col-span-full text-center py-12 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
            {tab === "browse" ? "Нет опубликованных инструментов" : "Вы ещё не создали инструментов"}
          </p>
        ) : (
          (tab === "browse" ? tools : myTools).map((tool: any) => (
            <Card key={tool.id}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                  {tool.display_name || tool.name}
                </h3>
                <Badge variant={tool.status === "published" ? "success" : "warning"}>
                  {tool.status}
                </Badge>
              </div>
              <p className="text-xs mb-3" style={{ color: "var(--color-text-tertiary)" }}>
                {tool.description?.slice(0, 100)}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  Использований: {tool.usage_count || 0}
                </span>
                {tool.coin_price && (
                  <span className="text-xs font-medium" style={{ color: "var(--color-coin-gold)", fontFamily: "var(--font-mono)" }}>
                    {tool.coin_price} IB
                  </span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
