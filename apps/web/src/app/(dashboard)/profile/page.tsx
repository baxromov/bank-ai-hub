"use client";

import { useAuthStore } from "@/stores/auth";

const ROLE_LABELS: Record<string, string> = {
  employee: "Сотрудник",
  dept_head: "Руководитель отдела",
  admin: "Администратор",
  super_admin: "Супер-администратор",
};

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Профиль
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Ваши личные данные
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* Avatar + name card */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1a6832 0%, #2d8b4a 60%, #52ae30 100%)",
            boxShadow: "0 8px 24px rgba(82,174,48,0.3)",
          }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: "white", transform: "translate(30%, -30%)" }} />
          <div className="relative z-10 flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", backdropFilter: "blur(4px)" }}
            >
              {initials || "U"}
            </div>
            <div>
              <p className="text-xl font-bold text-white">{user.full_name}</p>
              <p className="text-sm text-white/75 mt-0.5">{user.position}</p>
              <div
                className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white" }}
              >
                {ROLE_LABELS[user.role] ?? user.role}
              </div>
            </div>
          </div>
        </div>

        {/* Info fields */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "var(--color-bg-secondary)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border-subtle)" }}
        >
          {[
            { label: "Email", value: user.email, icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
            { label: "ID сотрудника", value: user.employee_id, icon: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" },
            { label: "Отдел", value: user.department, icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
            { label: "Роль", value: ROLE_LABELS[user.role] ?? user.role, icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
          ].map((field, i, arr) => (
            <div
              key={field.label}
              className="flex items-center gap-4 px-5 py-4"
              style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border-subtle)" : "none" }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--color-brand-surface)" }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}
                  style={{ color: "var(--color-brand)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={field.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                  {field.label}
                </p>
                <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
                  {field.value || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
