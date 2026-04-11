"use client";

import { useEffect, useState } from "react";
import { rankingsApi } from "@/api-client";
import { Card } from "@/components/ui/card";
import { RankBadge } from "@/components/rankings/RankBadge";

const CATEGORIES = [
  { key: "ai_innovator", label: "AI Инноватор" },
  { key: "best_optimizer", label: "Оптимизатор" },
  { key: "ai_contributor", label: "Контрибьютор" },
  { key: "silent_hero", label: "Тихий Герой" },
  { key: "teams", label: "🏆 Команды" },
];

export default function RankingsPage() {
  const [activeCategory, setActiveCategory] = useState("ai_innovator");
  const [entries, setEntries] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [myDept, setMyDept] = useState<any>(null);

  useEffect(() => {
    if (activeCategory === "teams") {
      rankingsApi.getDepartments().then(setDepartments).catch(() => setDepartments([]));
      rankingsApi.getMyDepartment().then(setMyDept).catch(() => {});
    } else {
      rankingsApi.getCurrent(activeCategory).then(setEntries).catch(() => setEntries([]));
    }
  }, [activeCategory]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6" style={{ color: "var(--color-text-primary)" }}>
        Рейтинг
      </h1>

      {/* Category Tabs */}
      <div className="flex gap-1 flex-wrap mb-6">
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

      {activeCategory === "teams" ? (
        <DepartmentLeaderboard departments={departments} myDept={myDept} />
      ) : (
        /* Individual Leaderboard Table */
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
                      <td className="py-3 px-3">
                        <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                          {entry.full_name || entry.user_id}
                        </p>
                        {entry.position && (
                          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                            {entry.position}
                          </p>
                        )}
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
      )}
    </div>
  );
}

function DepartmentLeaderboard({ departments, myDept }: { departments: any[]; myDept: any }) {
  if (departments.length === 0) {
    return (
      <Card>
        <p className="text-sm text-center py-8" style={{ color: "var(--color-text-tertiary)" }}>
          Нет командных данных за эту неделю
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* My department highlight */}
      {myDept && (
        <Card>
          <p className="text-xs mb-2" style={{ color: "var(--color-text-tertiary)" }}>Ваш отдел</p>
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold" style={{ color: "var(--color-coin-gold)" }}>
              {myDept.department_label}
            </p>
            <div className="text-right">
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Ваш вклад</p>
              <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                {myDept.my_contribution} / {myDept.department_total} очков
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Department list */}
      <div className="space-y-3">
        {departments.map((dept) => {
          const isMyDept = myDept && dept.department === myDept.department;
          return (
            <div
              key={dept.department}
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                border: isMyDept
                  ? "1px solid var(--color-coin-gold)"
                  : "1px solid var(--color-border-subtle)",
                boxShadow: isMyDept ? "0 0 10px var(--color-coin-gold-glow)" : "none",
              }}
            >
              {/* Rank */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  backgroundColor: dept.rank <= 3 ? "var(--color-coin-gold-glow)" : "var(--color-bg-tertiary)",
                  color: dept.rank <= 3 ? "var(--color-coin-gold)" : "var(--color-text-secondary)",
                }}
              >
                {dept.rank}
              </div>

              {/* Name + members */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                  {dept.department_label}
                  {isMyDept && (
                    <span className="ml-2 text-xs" style={{ color: "var(--color-coin-gold)" }}>← вы здесь</span>
                  )}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  {dept.member_count} участников
                </p>
              </div>

              {/* Score */}
              <p className="text-base font-bold tabular-nums" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-mono)" }}>
                {dept.total_score.toFixed(0)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
