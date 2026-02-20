"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toolsApi } from "@/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateToolPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    display_name: "",
    description: "",
    category: "document",
    prompt_template: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await toolsApi.submit(form);
      router.push("/tools");
    } catch (err: any) {
      alert(err.message || "Ошибка при создании");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-6" style={{ color: "var(--color-text-primary)" }}>
        Создать инструмент
      </h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>Системное имя (латиница, дефисы)</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="contract-clause-generator"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>Название</label>
            <Input
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              placeholder="Генератор пунктов договора"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-md text-sm outline-none resize-none"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border-subtle)",
                color: "var(--color-text-primary)",
              }}
              rows={3}
              placeholder="Описание инструмента..."
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>Категория</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 rounded-md text-sm outline-none"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border-subtle)",
                color: "var(--color-text-primary)",
              }}
            >
              <option value="document">Документы</option>
              <option value="analysis">Анализ</option>
              <option value="automation">Автоматизация</option>
              <option value="data">Данные</option>
              <option value="communication">Коммуникация</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>Prompt-шаблон</label>
            <textarea
              value={form.prompt_template}
              onChange={(e) => setForm({ ...form, prompt_template: e.target.value })}
              className="w-full px-3 py-2 rounded-md text-sm outline-none resize-none font-mono"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border-subtle)",
                color: "var(--color-text-primary)",
              }}
              rows={8}
              placeholder="Вы — помощник для... {{input}}"
              required
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Отправка..." : "Отправить на проверку"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Отмена
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
