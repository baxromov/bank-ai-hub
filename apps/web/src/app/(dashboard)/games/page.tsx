"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface GameInfo {
  id: string;
  title: string;
  description: string;
  href: string;
  reward: string;
  iconPath: string;
  color: string;
}

const GAMES: GameInfo[] = [
  {
    id: "quiz",
    title: "AI Викторина",
    description: "Отвечайте на вопросы об AI, банковских технологиях и промпт-инжиниринге. 10 вопросов, 15 секунд на каждый.",
    href: "/games/quiz",
    reward: "до 5 IB",
    iconPath: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    color: "#3B82F6",
  },
  {
    id: "words",
    title: "AI Слова",
    description: "Разгадайте анаграммы из мира AI и банковских технологий. Чем быстрее — тем больше монет.",
    href: "/games/words",
    reward: "до 5 IB",
    iconPath: "M4 6h16M4 10h16M4 14h8m-8 4h4",
    color: "#8B5CF6",
  },
  {
    id: "prompt-master",
    title: "Prompt Мастер",
    description: "Напишите лучший промпт для заданной задачи. Оценка по ключевым словам и структуре.",
    href: "/games/prompt-master",
    reward: "до 5 IB",
    iconPath: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    color: "#F59E0B",
  },
  {
    id: "classifier",
    title: "Классификатор",
    description: "Классифицируйте термины по категориям: AI или Банкинг? Скорость и точность решают.",
    href: "/games/classifier",
    reward: "до 5 IB",
    iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    color: "#10B981",
  },
  {
    id: "memory",
    title: "Токен Охотник",
    description: "Найдите пары: AI-термин и его определение. Мемори-игра на знание технологий.",
    href: "/games/memory",
    reward: "до 5 IB",
    iconPath: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
    color: "#EC4899",
  },
  {
    id: "detective",
    title: "AI Детектив",
    description: "Прочитайте текст и определите — написал его AI или человек? Тренировка AI-грамотности.",
    href: "/games/detective",
    reward: "до 5 IB",
    iconPath: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    color: "#6366F1",
  },
  {
    id: "fraud-detector",
    title: "Детектор Мошенничества",
    description: "Анализируйте транзакции и выявляйте мошеннические операции. Тренировка навыков fraud-аналитика.",
    href: "/games/fraud-detector",
    reward: "до 5 IB",
    iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    color: "#EF4444",
  },
  {
    id: "cyber-security",
    title: "Кибер Щит",
    description: "Распознавайте фишинг, социальную инженерию и киберугрозы. Защитите банк от атак.",
    href: "/games/cyber-security",
    reward: "до 5 IB",
    iconPath: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    color: "#52ae30",
  },
];

export default function GamesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Игры
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Играйте, учитесь и зарабатывайте IB-Coins
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.map((game) => (
          <div
            key={game.id}
            className="rounded-2xl p-5 flex flex-col transition-all hover:translate-y-[-2px]"
            style={{
              backgroundColor: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border-subtle)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shrink-0"
              style={{ backgroundColor: `${game.color}15` }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={game.color} strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d={game.iconPath} />
              </svg>
            </div>

            <h3 className="text-sm font-bold mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              {game.title}
            </h3>
            <p className="text-xs leading-relaxed flex-1 mb-4" style={{ color: "var(--color-text-secondary)" }}>
              {game.description}
            </p>

            <div className="flex items-center justify-between pt-3"
              style={{ borderTop: "1px solid var(--color-border-subtle)" }}>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #D4A843, #F0C75E)" }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--color-coin-gold-dim)", fontFamily: "var(--font-mono)" }}>
                  {game.reward}
                </span>
              </div>
              <Link href={game.href}>
                <Button variant="primary" size="sm">Играть</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
