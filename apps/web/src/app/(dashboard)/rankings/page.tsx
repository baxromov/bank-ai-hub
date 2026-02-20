"use client";

import { useEffect, useState } from "react";
import { rankingsApi } from "@/api-client";
import { Card } from "@/components/ui/card";
import { RankBadge } from "@/components/rankings/RankBadge";

const CATEGORIES = [
  { key: "ai_innovator", label: "AI Innovator" },
  { key: "best_optimizer", label: "Optimizer" },
  { key: "ai_contributor", label: "Contributor" },
  { key: "silent_hero", label: "Silent Hero" },
];

export default function RankingsPage() {
  const [activeCategory, setActiveCategory] = useState("ai_innovator");
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    rankingsApi.getCurrent(activeCategory).then(setEntries).catch(() => setEntries([]));
  }, [activeCategory]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6" style={{ color: "var(--color-text-primary)" }}>
        Рейтинг
      </h1>

      {/* Category Tabs */}
      <div className="flex gap-1 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className="px-4 py-2 text-sm rounded-md transition-colors"
            style={{
              backgroundColor: activeCategory === cat.key ? "var(--color-bg-tertiary)" : "transparent",
              color: activeCategory === cat.key ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              borderBottom: activeCategory === cat.key ? "2px solid var(--color-coin-gold)" : "2px solid transparent",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                <th className="text-left py-2 px-3 text-xs font-medium" style={{ color: "var(--color-text-tertiary)" }}>#</th>
                <th className="text-left py-2 px-3 text-xs font-medium" style={{ color: "var(--color-text-tertiary)" }}>Сотрудник</th>
                <th className="text-right py-2 px-3 text-xs font-medium" style={{ color: "var(--color-text-tertiary)" }}>Очки</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-sm" style={{ color: "var(--color-text-tertiary)" }}>
                    Нет данных за эту неделю
                  </td>
                </tr>
              ) : (
                entries.map((entry: any) => (
                  <tr key={entry.user_id} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                    <td className="py-3 px-3"><RankBadge rank={entry.rank} /></td>
                    <td className="py-3 px-3 text-sm" style={{ color: "var(--color-text-primary)" }}>
                      {entry.user_id}
                    </td>
                    <td className="py-3 px-3 text-right text-sm tabular-nums" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-mono)" }}>
                      {entry.score.toFixed(1)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
