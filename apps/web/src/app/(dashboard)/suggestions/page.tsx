"use client";

import { useEffect, useState } from "react";
import { suggestionsApi } from "@/api-client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "gold" | "success" | "warning" | "error" }> = {
  submitted: { label: "Отправлено", variant: "default" },
  under_review: { label: "На рассмотрении", variant: "warning" },
  approved: { label: "Одобрено", variant: "success" },
  rejected: { label: "Отклонено", variant: "error" },
  implemented: { label: "✓ Реализовано", variant: "gold" },
};

function SuggestionsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl p-5" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border-subtle)" }}>
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full ml-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", department: "it", impact: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    suggestionsApi.getMy()
      .then(setSuggestions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await suggestionsApi.submit(form);
      setShowForm(false);
      setForm({ title: "", description: "", department: "it", impact: "" });
      suggestionsApi.getMy().then(setSuggestions);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            Предложения
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Ваши идеи для улучшения банка
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Отмена" : "+ Предложение"}
        </Button>
      </div>

      {/* New suggestion form */}
      {showForm && (
        <Card className="mb-6">
          <h3 className="text-sm font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
            Новое предложение
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Название предложения"
              required
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
              style={{
                backgroundColor: "var(--color-bg-primary)",
                border: "1.5px solid var(--color-border-subtle)",
                color: "var(--color-text-primary)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--color-brand)";
                e.target.style.boxShadow = "0 0 0 3px var(--color-brand-glow)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--color-border-subtle)";
                e.target.style.boxShadow = "none";
              }}
              rows={4}
              placeholder="Опишите вашу идею подробнее..."
              required
            />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Отправка..." : "Отправить"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? <SuggestionsSkeleton /> : (
        suggestions.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: "var(--color-bg-primary)" }}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                  style={{ color: "var(--color-text-tertiary)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                У вас пока нет предложений
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                Поделитесь идеей и заработайте IB-Coins!
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s: any) => {
              const status = STATUS_MAP[s.status] ?? { label: s.status, variant: "default" as const };
              return (
                <div
                  key={s.id}
                  className="rounded-2xl p-5 transition-all"
                  style={{
                    backgroundColor: "var(--color-bg-secondary)",
                    border: s.status === "implemented"
                      ? "1.5px solid var(--color-brand)"
                      : "1px solid var(--color-border-subtle)",
                    boxShadow: s.status === "implemented" ? "0 4px 12px var(--color-brand-glow)" : "var(--shadow-xs)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
                        {s.title}
                      </h3>
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>
                        {s.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {s.coin_reward > 0 && (
                        <span className="text-xs font-bold tabular-nums"
                          style={{ color: "var(--color-coin-gold)", fontFamily: "var(--font-mono)" }}>
                          +{s.coin_reward} IB
                        </span>
                      )}
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
