"use client";

import { useAuthStore } from "@/stores/auth";
import { Card, CardTitle, CardValue } from "@/components/ui/card";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6" style={{ color: "var(--color-text-primary)" }}>
        Профиль
      </h1>

      <div className="max-w-2xl space-y-6">
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
              style={{ backgroundColor: "var(--color-bg-tertiary)", color: "var(--color-text-primary)" }}
            >
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <div>
              <h2 className="text-lg font-medium" style={{ color: "var(--color-text-primary)" }}>
                {user.full_name}
              </h2>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{user.position}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Email</p>
              <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>{user.email}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>ID сотрудника</p>
              <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>{user.employee_id}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Отдел</p>
              <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>{user.department}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Роль</p>
              <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>{user.role}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
