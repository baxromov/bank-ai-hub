"use client";

import { useEffect, useState } from "react";
import { rankingsApi } from "@/api-client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const CATEGORY_LABELS: Record<string, string> = {
  all: "Все",
  ai_innovator: "AI Инноватор",
  best_optimizer: "Оптимизатор",
  ai_contributor: "Контрибьютор",
  silent_hero: "Тихий Герой",
  customer_service: "Клиентский сервис",
};

const CATEGORIES = Object.keys(CATEGORY_LABELS);

function AchievementsSkeleton() {
  return (
    <>
      {/* Level card skeleton */}
      <Skeleton className="h-44 rounded-2xl mb-8" />
      {/* Filter skeleton */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    </>
  );
}

export default function AchievementsPage() {
  const [badges, setBadges] = useState<any[]>([]);
  const [level, setLevel] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([rankingsApi.getMyBadges(), rankingsApi.getMyLevel()])
      .then(([b, l]) => { setBadges(b); setLevel(l); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "all" ? badges : badges.filter((b) => b.category === activeCategory);
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Достижения
        </h1>
        {!loading && (
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {earnedCount} из {badges.length} значков получено
          </p>
        )}
      </div>

      {loading ? <AchievementsSkeleton /> : (
        <>
          {/* Level Card */}
          {level && (
            <div
              className="rounded-2xl p-6 mb-8 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1a6832 0%, #2d8b4a 60%, #52ae30 100%)",
                boxShadow: "0 8px 24px rgba(82,174,48,0.3)",
              }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
                style={{ background: "white", transform: "translate(30%, -30%)" }} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">Ваш уровень</p>
                    <p className="text-2xl font-bold text-white">{level.level_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/70 mb-1">Опыт (XP)</p>
                    <p className="text-xl font-bold text-white tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>
                      {level.xp.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* XP progress bar */}
                <div className="h-2.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${level.pct}%`, backgroundColor: "rgba(255,255,255,0.9)" }}
                  />
                </div>
                {level.xp_next_level && (
                  <p className="text-xs text-white/60 mb-4">
                    До следующего уровня: {(level.xp_next_level - level.xp).toLocaleString()} XP
                  </p>
                )}

                <div className="flex gap-6 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                  {[
                    { label: "Монет заработано", value: level.total_earned_coins },
                    { label: "Значков", value: level.badge_count },
                    { label: "Игр сыграно", value: level.game_count },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-xs text-white/60 mb-0.5">{stat.label}</p>
                      <p className="text-lg font-bold text-white tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-6">
            {CATEGORIES.map((cat) => {
              const count = cat === "all" ? badges.length : badges.filter((b) => b.category === cat).length;
              if (count === 0 && cat !== "all") return null;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: isActive ? "var(--color-brand)" : "var(--color-bg-secondary)",
                    color: isActive ? "white" : "var(--color-text-secondary)",
                    border: `1.5px solid ${isActive ? "var(--color-brand)" : "var(--color-border-subtle)"}`,
                    boxShadow: isActive ? "0 4px 10px var(--color-brand-glow)" : "var(--shadow-xs)",
                  }}
                >
                  {CATEGORY_LABELS[cat]} ({count})
                </button>
              );
            })}
          </div>

          {/* Badge grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BadgeCard({ badge }: { badge: any }) {
  const initial = badge.name_ru.charAt(0).toUpperCase();

  return (
    <div
      className="relative rounded-2xl p-4 flex flex-col items-center text-center transition-all"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        border: badge.earned
          ? "1.5px solid var(--color-brand)"
          : "1px solid var(--color-border-subtle)",
        boxShadow: badge.earned ? "0 4px 16px var(--color-brand-glow)" : "var(--shadow-xs)",
        opacity: badge.earned ? 1 : 0.65,
      }}
    >
      {badge.earned && (
        <div
          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: "linear-gradient(135deg, #1a6832 0%, #52ae30 100%)", color: "white" }}
        >
          ✓
        </div>
      )}

      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold mb-3"
        style={{
          background: badge.earned
            ? "linear-gradient(135deg, rgba(82,174,48,0.15) 0%, rgba(26,104,50,0.1) 100%)"
            : "var(--color-bg-primary)",
          color: badge.earned ? "var(--color-brand)" : "var(--color-text-tertiary)",
          filter: badge.earned ? "none" : "grayscale(60%)",
        }}
      >
        {badge.icon_url ? (
          <img src={badge.icon_url} alt={badge.name_ru} className="w-8 h-8 object-contain" />
        ) : (
          initial
        )}
      </div>

      <p className="text-xs font-semibold mb-1 line-clamp-2" style={{ color: "var(--color-text-primary)" }}>
        {badge.name_ru}
      </p>
      <p className="text-xs line-clamp-2 mb-3" style={{ color: "var(--color-text-tertiary)" }}>
        {badge.description}
      </p>

      {!badge.earned && (
        <div className="w-full mt-auto">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${badge.progress_pct}%`,
                background: "linear-gradient(90deg, #1a6832, #52ae30)",
              }}
            />
          </div>
          <p className="text-xs mt-1.5" style={{ color: "var(--color-text-tertiary)" }}>
            {badge.progress} / {badge.threshold}
          </p>
        </div>
      )}

      {badge.earned && badge.earned_at && (
        <Badge variant="success" className="mt-auto text-xs">
          {new Date(badge.earned_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
        </Badge>
      )}
    </div>
  );
}
