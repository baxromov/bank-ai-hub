"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GameInfo {
  id: string;
  title: string;
  description: string;
  href: string;
  reward: string;
  icon: string;
}

const GAMES: GameInfo[] = [
  {
    id: "quiz",
    title: "AI Викторина",
    description:
      "Отвечайте на вопросы об AI, банковских технологиях и промпт-инжиниринге. 10 вопросов, 15 секунд на каждый.",
    href: "/games/quiz",
    reward: "до 5 IB",
    icon: "🧠",
  },
  {
    id: "words",
    title: "AI Слова",
    description:
      "Разгадайте анаграммы из мира AI и банковских технологий. Чем быстрее — тем больше монет.",
    href: "/games/words",
    reward: "до 5 IB",
    icon: "🔤",
  },
  {
    id: "prompt-master",
    title: "Prompt Мастер",
    description:
      "Напишите лучший промпт для заданной задачи. Оценка по ключевым словам и структуре.",
    href: "/games/prompt-master",
    reward: "до 5 IB",
    icon: "✍️",
  },
  {
    id: "classifier",
    title: "Быстрый Классификатор",
    description:
      "Классифицируйте термины по категориям: AI или Банкинг? Скорость и точность решают.",
    href: "/games/classifier",
    reward: "до 5 IB",
    icon: "📊",
  },
  {
    id: "memory",
    title: "Токен Охотник",
    description:
      "Найдите пары: AI-термин и его определение. Мемори-игра на знание технологий.",
    href: "/games/memory",
    reward: "до 5 IB",
    icon: "🎯",
  },
  {
    id: "detective",
    title: "AI Детектив",
    description:
      "Прочитайте текст и определите — написал его AI или человек? Тренировка AI-грамотности.",
    href: "/games/detective",
    reward: "до 5 IB",
    icon: "🔍",
  },
];

export default function GamesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Игры
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Играйте, учитесь и зарабатывайте IB-Coins
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.map((game) => (
          <Card key={game.id}>
            <div className="flex flex-col h-full">
              <div className="text-2xl mb-2">{game.icon}</div>
              <h3
                className="text-sm font-medium mb-1"
                style={{ color: "var(--color-text-primary)" }}
              >
                {game.title}
              </h3>
              <p
                className="text-xs mb-4 flex-1"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {game.description}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-medium tabular-nums"
                  style={{
                    color: "var(--color-coin-gold)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {game.reward}
                </span>
                <Link href={game.href}>
                  <Button variant="primary" size="sm">
                    Играть
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
