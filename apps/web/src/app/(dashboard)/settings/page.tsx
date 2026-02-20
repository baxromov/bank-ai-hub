"use client";

import { useUIStore } from "@/stores/ui";

export default function SettingsPage() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

  return (
    <div>
      <h1
        className="text-xl font-semibold mb-6"
        style={{ color: "var(--color-text-primary)" }}
      >
        Настройки
      </h1>

      <div className="max-w-2xl space-y-6">
        {/* Appearance */}
        <div
          className="rounded-lg p-5"
          style={{
            backgroundColor: "var(--color-bg-tertiary)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <h2
            className="text-sm font-medium mb-1"
            style={{ color: "var(--color-text-primary)" }}
          >
            Тема оформления
          </h2>
          <p
            className="text-xs mb-4"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Выберите предпочтительную цветовую схему
          </p>

          <div className="flex gap-4">
            {/* Dark theme */}
            <button
              onClick={() => setTheme("dark")}
              className="flex-1 p-4 rounded-lg border-2 transition-all text-left"
              style={{
                borderColor:
                  theme === "dark"
                    ? "var(--color-coin-gold)"
                    : "var(--color-border-subtle)",
                backgroundColor:
                  theme === "dark"
                    ? "var(--color-coin-gold-glow)"
                    : "var(--color-bg-elevated)",
              }}
            >
              <div
                className="w-full h-16 rounded mb-3 flex items-center justify-center"
                style={{
                  backgroundColor: "#0A0A0B",
                  border: "1px solid #2A2A2E",
                }}
              >
                <div className="flex gap-1.5">
                  <div
                    className="w-8 h-2 rounded"
                    style={{ backgroundColor: "#2A2A2E" }}
                  />
                  <div
                    className="w-5 h-2 rounded"
                    style={{ backgroundColor: "#D4A843" }}
                  />
                  <div
                    className="w-6 h-2 rounded"
                    style={{ backgroundColor: "#2A2A2E" }}
                  />
                </div>
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                Тёмная
              </span>
            </button>

            {/* Light theme */}
            <button
              onClick={() => setTheme("light")}
              className="flex-1 p-4 rounded-lg border-2 transition-all text-left"
              style={{
                borderColor:
                  theme === "light"
                    ? "var(--color-coin-gold)"
                    : "var(--color-border-subtle)",
                backgroundColor:
                  theme === "light"
                    ? "var(--color-coin-gold-glow)"
                    : "var(--color-bg-elevated)",
              }}
            >
              <div
                className="w-full h-16 rounded mb-3 flex items-center justify-center"
                style={{
                  backgroundColor: "#F5F5F6",
                  border: "1px solid #D5D5D8",
                }}
              >
                <div className="flex gap-1.5">
                  <div
                    className="w-8 h-2 rounded"
                    style={{ backgroundColor: "#D5D5D8" }}
                  />
                  <div
                    className="w-5 h-2 rounded"
                    style={{ backgroundColor: "#B8912E" }}
                  />
                  <div
                    className="w-6 h-2 rounded"
                    style={{ backgroundColor: "#D5D5D8" }}
                  />
                </div>
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                Светлая
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
