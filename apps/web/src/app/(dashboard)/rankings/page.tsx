"use client";

import { useEffect, useState } from "react";
import { rankingsApi } from "@/api-client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RankBadge } from "@/components/rankings/RankBadge";

const CATEGORIES = [
  { key: "ai_innovator", label: "AI Инноватор" },
  { key: "best_optimizer", label: "Оптимизатор" },
  { key: "ai_contributor", label: "Контрибьютор" },
  { key: "silent_hero", label: "Тихий Герой" },
  { key: "teams", label: "Команды" },
];

function RankingsSkeleton() {
  return (
    <Card>
      <div className="space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3"
            style={{ borderBottom: i < 7 ? "1px solid var(--color-border-subtle)" : "none" }}>
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function RankingsPage() {
  const [activeCategory, setActiveCategory] = useState("ai_innovator");
  const [entries, setEntries] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [myDept, setMyDept] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (activeCategory === "teams") {
      Promise.all([
        rankingsApi.getDepartments(),
        rankingsApi.getMyDepartment(),
      ])
        .then(([d, me]) => { setDepartments(d); setMyDept(me); })
        .catch(() => { setDepartments([]); })
        .finally(() => setLoading(false));
    } else {
      rankingsApi.getCurrent(activeCategory)
        .then(setEntries)
        .catch(() => setEntries([]))
        .finally(() => setLoading(false));
    }
  }, [activeCategory]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Рейтинг
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Таблица лидеров за текущую неделю
        </p>
      </div>

      {/* Category Tabs */}
      <div
        className="flex gap-1 mb-6 p-1 rounded-xl"
        style={{ backgroundColor: "var(--color-bg-elevated)", width: "fit-content" }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
            style={{
              backgroundColor: activeCategory === cat.key ? "var(--color-bg-secondary)" : "transparent",
              color: activeCategory === cat.key ? "var(--color-brand-dark)" : "var(--color-text-secondary)",
              boxShadow: activeCategory === cat.key ? "var(--shadow-sm)" : "none",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? <RankingsSkeleton /> : (
        activeCategory === "teams" ? (
          <DepartmentLeaderboard departments={departments} myDept={myDept} />
        ) : (
          <Card>
            {entries.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: "var(--color-bg-primary)" }}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                    style={{ color: "var(--color-text-tertiary)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Нет данных за эту неделю</p>
              </div>
            ) : (
              <div>
                {entries.map((entry: any, i: number) => (
                  <div key={entry.user_id}
                    className="flex items-center gap-4 py-3 transition-colors"
                    style={{
                      borderBottom: i < entries.length - 1 ? "1px solid var(--color-border-subtle)" : "none",
                      backgroundColor: i < 3 ? `rgba(82,174,48,${0.04 - i * 0.01})` : "transparent",
                    }}
                  >
                    <RankBadge rank={entry.rank} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
                        {entry.full_name || entry.user_id}
                      </p>
                      {entry.position && (
                        <p className="text-xs truncate" style={{ color: "var(--color-text-tertiary)" }}>
                          {entry.position}
                        </p>
                      )}
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-sm font-bold tabular-nums"
                      style={{
                        backgroundColor: i < 3 ? "var(--color-brand-surface)" : "var(--color-bg-primary)",
                        color: i < 3 ? "var(--color-brand-dark)" : "var(--color-text-secondary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {entry.score.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )
      )}
    </div>
  );
}

function DepartmentLeaderboard({ departments, myDept }: { departments: any[]; myDept: any }) {
  if (departments.length === 0) {
    return (
      <Card>
        <div className="py-12 text-center">
          <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Нет командных данных за эту неделю
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {myDept && (
        <div
          className="rounded-2xl p-5"
          style={{
            background: "linear-gradient(135deg, rgba(82,174,48,0.08) 0%, rgba(26,104,50,0.05) 100%)",
            border: "1.5px solid var(--color-brand)",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: "var(--color-brand)" }}>Ваш отдел</p>
          <div className="flex items-center justify-between">
            <p className="text-base font-bold" style={{ color: "var(--color-brand-dark)" }}>
              {myDept.department_label}
            </p>
            <div className="text-right">
              <p className="text-xs mb-0.5" style={{ color: "var(--color-text-tertiary)" }}>Ваш вклад</p>
              <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {myDept.my_contribution} / {myDept.department_total}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {departments.map((dept) => {
          const isMyDept = myDept && dept.department === myDept.department;
          const isTop3 = dept.rank <= 3;
          return (
            <div
              key={dept.department}
              className="flex items-center gap-4 p-4 rounded-2xl transition-all"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                border: isMyDept ? "1.5px solid var(--color-brand)" : "1px solid var(--color-border-subtle)",
                boxShadow: isMyDept ? "0 4px 12px var(--color-brand-glow)" : "var(--shadow-xs)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  background: isTop3
                    ? "linear-gradient(135deg, #1a6832 0%, #52ae30 100%)"
                    : "var(--color-bg-primary)",
                  color: isTop3 ? "white" : "var(--color-text-secondary)",
                }}
              >
                {dept.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
                  {dept.department_label}
                  {isMyDept && (
                    <span className="ml-2 text-xs font-normal" style={{ color: "var(--color-brand)" }}>← вы здесь</span>
                  )}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  {dept.member_count} участников
                </p>
              </div>
              <p className="text-lg font-bold tabular-nums" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-mono)" }}>
                {dept.total_score.toFixed(0)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
