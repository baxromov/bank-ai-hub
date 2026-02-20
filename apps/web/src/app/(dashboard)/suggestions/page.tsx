"use client";

import { useEffect, useState } from "react";
import { suggestionsApi } from "@/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", department: "it", impact: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    suggestionsApi.getMy().then(setSuggestions).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await suggestionsApi.submit(form);
      setShowForm(false);
      setForm({ title: "", description: "", department: "it", impact: "" });
      suggestionsApi.getMy().then(setSuggestions);
    } finally {
      setLoading(false);
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "approved": case "implemented": return "success";
      case "rejected": return "error";
      case "submitted": case "under_review": return "warning";
      default: return "default";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
          Предложения
        </h1>
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Отмена" : "+ Новое предложение"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
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
              className="w-full px-3 py-2 rounded-md text-sm outline-none resize-none"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border-subtle)",
                color: "var(--color-text-primary)",
              }}
              rows={4}
              placeholder="Описание предложения..."
              required
            />
            <Button type="submit" variant="primary" size="sm" disabled={loading}>
              {loading ? "Отправка..." : "Отправить"}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {suggestions.length === 0 ? (
          <Card>
            <p className="text-sm text-center py-8" style={{ color: "var(--color-text-tertiary)" }}>
              У вас пока нет предложений
            </p>
          </Card>
        ) : (
          suggestions.map((s: any) => (
            <Card key={s.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{s.title}</h3>
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>{s.description.slice(0, 150)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.coin_reward > 0 && (
                    <span className="text-xs font-medium" style={{ color: "var(--color-coin-gold)" }}>
                      +{s.coin_reward} IB
                    </span>
                  )}
                  <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
