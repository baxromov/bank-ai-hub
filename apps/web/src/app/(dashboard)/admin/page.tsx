"use client";

import { Card, CardTitle, CardValue } from "@/components/ui/card";
import Link from "next/link";

const ADMIN_SECTIONS = [
  { title: "Пользователи", description: "Управление пользователями и ролями", href: "/admin/users" },
  { title: "Транзакции", description: "Одобрение транзакций IB-Coin", href: "/admin/transactions" },
  { title: "Инструменты", description: "Проверка новых инструментов", href: "/admin/tools" },
  { title: "Предложения", description: "Рассмотрение предложений", href: "/admin/suggestions" },
  { title: "Аудит", description: "Журнал аудита системы", href: "/admin/audit" },
  { title: "AI Сессии", description: "История и time-travel AI сессий", href: "/admin/sessions" },
];

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-6" style={{ color: "var(--color-text-primary)" }}>
        Администрирование
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ADMIN_SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:opacity-90 transition-opacity cursor-pointer h-full">
              <h3 className="text-sm font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
                {section.title}
              </h3>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                {section.description}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
