"use client";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Настройки
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Настройки платформы BankAI Hub
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* Appearance */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border-subtle)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--color-brand-surface)" }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}
                style={{ color: "var(--color-brand)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>Оформление</h2>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Светлая тема (Ipoteka Bank)</p>
            </div>
          </div>
          <div
            className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ backgroundColor: "var(--color-brand-surface)", border: "1.5px solid var(--color-brand)" }}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: "linear-gradient(135deg, #1a6832, #52ae30)" }}>✓</div>
            <span className="text-sm font-semibold" style={{ color: "var(--color-brand-dark)" }}>
              Светлая тема — активна
            </span>
          </div>
        </div>

        {/* Language */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border-subtle)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--color-brand-surface)" }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}
                style={{ color: "var(--color-brand)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>Язык интерфейса</h2>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Русский язык</p>
            </div>
          </div>
        </div>

        {/* About */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border-subtle)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--color-brand-surface)" }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}
                style={{ color: "var(--color-brand)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>О платформе</h2>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>BankAI Hub v1.0</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: "Версия", value: "1.0.0" },
              { label: "Разработчик", value: "Ipoteka Bank IT" },
              { label: "LLM Модель", value: "Qwen 2.5 7B (On-Premise)" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1.5"
                style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{item.label}</span>
                <span className="text-xs font-semibold" style={{ color: "var(--color-text-primary)" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
