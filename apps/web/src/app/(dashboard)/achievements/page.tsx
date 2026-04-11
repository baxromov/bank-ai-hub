"use client";

import { useEffect, useState } from "react";
import { rankingsApi } from "@/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CATEGORY_LABELS: Record<string, string> = {
  all: "Все",
  ai_innovator: "AI Инноватор",
  best_optimizer: "Лучший Оптимизатор",
  ai_contributor: "AI Контрибьютор",
  silent_hero: "Тихий Герой",
  customer_service: "Герой Клиентов",
};

const CATEGORIES = Object.keys(CATEGORY_LABELS);

export default function AchievementsPage() {
  const [badges, setBadges] = useState<any[]>([]);
  const [level, setLevel] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      rankingsApi.getMyBadges(),
      rankingsApi.getMyLevel(),
    ])
      .then(([b, l]) => {
        setBadges(b);
        setLevel(l);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "all"
    ? badges
    : badges.filter((b) => b.category === activeCategory);

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
          Достижения
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
          {earnedCount} из {badges.length} значков получено
        </p>
      </div>

      {/* Level card */}
      {level && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs mb-1" style={{ color: "var(--color-text-tertiary)" }}>Ваш уровень</p>
              <p className="text-lg font-bold" style={{ color: "var(--color-coin-gold)" }}>
                {level.level_name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Опыт (XP)</p>
              <p className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {level.xp.toLocaleString()}
              </p>
            </div>
          </div>
          {/* XP progress bar */}
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${level.pct}%`,
                backgroundColor: "var(--color-coin-gold)",
              }}
            />
          </div>
          {level.xp_next_level && (
            <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
              До следующего уровня: {(level.xp_next_level - level.xp).toLocaleString()} XP
            </p>
          )}
          <div className="flex gap-4 mt-3 pt-3" style={{ borderTop: "1px solid var(--color-border-subtle)" }}>
            <div className="text-center">
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Монет заработано</p>
              <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{level.total_earned_coins}</p>
            </div>
            <div className="text-center">
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Значков</p>
              <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{level.badge_count}</p>
            </div>
            <div className="text-center">
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Игр сыграно</p>
              <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{level.game_count}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => {
          const count = cat === "all"
            ? badges.length
            : badges.filter((b) => b.category === cat).length;
          if (count === 0 && cat !== "all") return null;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor: isActive ? "var(--color-coin-gold)" : "var(--color-bg-secondary)",
                color: isActive ? "#0A0A0B" : "var(--color-text-secondary)",
                border: `1px solid ${isActive ? "var(--color-coin-gold)" : "var(--color-border-subtle)"}`,
              }}
            >
              {CATEGORY_LABELS[cat]} ({count})
            </button>
          );
        })}
      </div>

      {/* Badge grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl h-40 animate-pulse"
              style={{ backgroundColor: "var(--color-bg-secondary)" }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      )}
    </div>
  );
}

function BadgeCard({ badge }: { badge: any }) {
  const initial = badge.name_ru.charAt(0).toUpperCase();

  return (
    <div
      className="relative rounded-xl p-4 flex flex-col items-center text-center transition-all"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        border: badge.earned
          ? "1px solid var(--color-coin-gold)"
          : "1px solid var(--color-border-subtle)",
        boxShadow: badge.earned ? "0 0 12px var(--color-coin-gold-glow)" : "none",
        opacity: badge.earned ? 1 : 0.6,
      }}
    >
      {/* Earned checkmark overlay */}
      {badge.earned && (
        <div
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs"
          style={{ backgroundColor: "var(--color-coin-gold)", color: "#0A0A0B" }}
        >
          ✓
        </div>
      )}

      {/* Badge icon */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-3"
        style={{
          backgroundColor: badge.earned
            ? "var(--color-coin-gold-glow)"
            : "var(--color-bg-tertiary)",
          color: badge.earned ? "var(--color-coin-gold)" : "var(--color-text-tertiary)",
          filter: badge.earned ? "none" : "grayscale(100%)",
        }}
      >
        {badge.icon_url ? (
          <img src={badge.icon_url} alt={badge.name_ru} className="w-8 h-8 object-contain" />
        ) : (
          initial
        )}
      </div>

      {/* Badge name */}
      <p className="text-xs font-semibold mb-1 line-clamp-2" style={{ color: "var(--color-text-primary)" }}>
        {badge.name_ru}
      </p>

      {/* Description */}
      <p className="text-xs line-clamp-2 mb-3" style={{ color: "var(--color-text-tertiary)" }}>
        {badge.description}
      </p>

      {/* Progress bar */}
      {!badge.earned && (
        <div className="w-full">
          <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${badge.progress_pct}%`,
                backgroundColor: "var(--color-coin-gold-dim)",
              }}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
            {badge.progress} / {badge.threshold}
          </p>
        </div>
      )}

      {/* Earned date */}
      {badge.earned && badge.earned_at && (
        <Badge variant="gold" className="text-xs mt-auto">
          {new Date(badge.earned_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
        </Badge>
      )}
    </div>
  );
}
