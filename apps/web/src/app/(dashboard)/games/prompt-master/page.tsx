"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CoinBadge } from "@/components/coins/CoinBadge";
import { gamesApi } from "@/api-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PromptTask {
  id: number;
  description: string;
  keywords: string[];
}

interface TaskResult {
  taskId: number;
  score: number;
  breakdown: {
    lengthBase: number;
    lengthBonus: number;
    role: number;
    keywords: number;
    context: number;
    format: number;
  };
  prompt: string;
}

type GameState = "idle" | "playing" | "finished";

// ---------------------------------------------------------------------------
// Task Bank (20+ tasks in Russian, banking / AI-related)
// ---------------------------------------------------------------------------

const TASK_BANK: PromptTask[] = [
  {
    id: 1,
    description: "Напишите промпт для анализа кредитного риска клиента",
    keywords: ["кредит", "риск", "анализ", "данные", "оценка"],
  },
  {
    id: 2,
    description: "Напишите промпт для составления отчёта по продажам",
    keywords: ["отчёт", "продажи", "период", "показатели"],
  },
  {
    id: 3,
    description: "Напишите промпт для объяснения условий депозита клиенту",
    keywords: ["депозит", "процент", "условия", "срок"],
  },
  {
    id: 4,
    description: "Напишите промпт для классификации обращений клиентов",
    keywords: ["классификация", "обращение", "категория"],
  },
  {
    id: 5,
    description: "Напишите промпт для генерации ответа на жалобу клиента",
    keywords: ["жалоба", "ответ", "клиент", "решение"],
  },
  {
    id: 6,
    description: "Напишите промпт для прогнозирования оттока клиентов",
    keywords: ["прогноз", "отток", "клиент", "модель", "данные"],
  },
  {
    id: 7,
    description: "Напишите промпт для автоматизации проверки документов",
    keywords: ["проверка", "документ", "автоматизация", "данные"],
  },
  {
    id: 8,
    description: "Напишите промпт для создания FAQ по банковским продуктам",
    keywords: ["вопрос", "ответ", "продукт", "банк"],
  },
  {
    id: 9,
    description: "Напишите промпт для анализа тональности отзывов клиентов",
    keywords: ["тональность", "анализ", "отзыв", "клиент", "оценка"],
  },
  {
    id: 10,
    description:
      "Напишите промпт для составления персонального финансового плана",
    keywords: ["план", "финансы", "бюджет", "цели", "доход"],
  },
  {
    id: 11,
    description: "Напишите промпт для обучения нового сотрудника банка",
    keywords: ["обучение", "сотрудник", "процедура", "инструкция"],
  },
  {
    id: 12,
    description:
      "Напишите промпт для суммаризации протокола совещания",
    keywords: ["суммаризация", "протокол", "совещание", "итоги", "решение"],
  },
  {
    id: 13,
    description: "Напишите промпт для генерации маркетингового текста о новой карте",
    keywords: ["маркетинг", "текст", "карта", "преимущества", "клиент"],
  },
  {
    id: 14,
    description:
      "Напишите промпт для выявления подозрительных транзакций",
    keywords: ["транзакция", "подозрительный", "мошенничество", "анализ"],
  },
  {
    id: 15,
    description: "Напишите промпт для сравнения банковских продуктов для клиента",
    keywords: ["сравнение", "продукт", "преимущества", "клиент", "выбор"],
  },
  {
    id: 16,
    description:
      "Напишите промпт для перевода банковского документа на английский язык",
    keywords: ["перевод", "документ", "английский", "термин", "точность"],
  },
  {
    id: 17,
    description:
      "Напишите промпт для расчёта ежемесячного платежа по ипотеке",
    keywords: ["ипотека", "расчёт", "платёж", "ставка", "срок"],
  },
  {
    id: 18,
    description: "Напишите промпт для подготовки презентации квартальных результатов",
    keywords: ["презентация", "результат", "квартал", "показатели", "график"],
  },
  {
    id: 19,
    description:
      "Напишите промпт для создания чат-бота по обслуживанию клиентов",
    keywords: ["чат-бот", "обслуживание", "клиент", "ответ", "сценарий"],
  },
  {
    id: 20,
    description:
      "Напишите промпт для анализа конкурентов на рынке банковских услуг",
    keywords: ["конкурент", "анализ", "рынок", "услуга", "стратегия"],
  },
  {
    id: 21,
    description:
      "Напишите промпт для оценки кредитоспособности малого бизнеса",
    keywords: ["кредитоспособность", "бизнес", "оценка", "финансы", "данные"],
  },
  {
    id: 22,
    description:
      "Напишите промпт для генерации еженедельного дайджеста новостей банка",
    keywords: ["дайджест", "новости", "банк", "неделя", "сводка"],
  },
  {
    id: 23,
    description:
      "Напишите промпт для формирования рекомендаций по инвестициям клиенту",
    keywords: ["инвестиции", "рекомендация", "портфель", "клиент", "доходность"],
  },
  {
    id: 24,
    description:
      "Напишите промпт для извлечения ключевых данных из договора",
    keywords: ["извлечение", "данные", "договор", "ключевой", "анализ"],
  },
];

const TASKS_PER_ROUND = 10;
const SECONDS_PER_TASK = 60;
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const COOLDOWN_KEY = "game_prompt_last_play";
const AUTO_ADVANCE_MS = 2000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function selectTasks(): PromptTask[] {
  return shuffleArray(TASK_BANK).slice(0, TASKS_PER_ROUND);
}

function getCooldownRemaining(): number {
  if (typeof window === "undefined") return 0;
  const last = localStorage.getItem(COOLDOWN_KEY);
  if (!last) return 0;
  const elapsed = Date.now() - parseInt(last, 10);
  return Math.max(0, COOLDOWN_MS - elapsed);
}

function setCooldownNow(): void {
  localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

const ROLE_WORDS = ["ты", "вы", "роль", "эксперт", "аналитик", "специалист", "консультант", "ассистент"];
const CONTEXT_WORDS = ["контекст", "данные", "информация", "исходные", "входные", "сведения"];
const FORMAT_WORDS = ["формат", "список", "таблица", "шаги", "структура", "пункт", "пошагово", "вывод"];

function scorePrompt(prompt: string, task: PromptTask) {
  const lower = prompt.toLowerCase();
  let lengthBase = 0;
  let lengthBonus = 0;
  let role = 0;
  let keywords = 0;
  let context = 0;
  let format = 0;

  // Length >= 50 chars: +20
  if (prompt.length >= 50) lengthBase = 20;
  // Length >= 100 chars: +10 more
  if (prompt.length >= 100) lengthBonus = 10;

  // Role specification: +20
  if (ROLE_WORDS.some((w) => lower.includes(w))) role = 20;

  // Keywords from task: +20 (proportional to how many matched)
  const matched = task.keywords.filter((kw) => lower.includes(kw.toLowerCase()));
  if (matched.length > 0) {
    keywords = Math.round((matched.length / task.keywords.length) * 20);
  }

  // Context: +15
  if (CONTEXT_WORDS.some((w) => lower.includes(w))) context = 15;

  // Format: +15
  if (FORMAT_WORDS.some((w) => lower.includes(w))) format = 15;

  const total = lengthBase + lengthBonus + role + keywords + context + format;

  return {
    score: total,
    breakdown: { lengthBase, lengthBonus, role, keywords, context, format },
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PromptMasterPage() {
  // Game state
  const [gameState, setGameState] = useState<GameState>("idle");
  const [tasks, setTasks] = useState<PromptTask[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<TaskResult[]>([]);
  const [promptText, setPromptText] = useState("");

  // Timer
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_TASK);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Task result display between tasks
  const [showingResult, setShowingResult] = useState(false);
  const [lastResult, setLastResult] = useState<TaskResult | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cooldown
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Finished screen
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  // Textarea ref
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ---------------------------------------------------------------------------
  // Cooldown ticker
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setCooldown(getCooldownRemaining());

    cooldownRef.current = setInterval(() => {
      const remaining = getCooldownRemaining();
      setCooldown(remaining);
      if (remaining <= 0 && cooldownRef.current) {
        clearInterval(cooldownRef.current);
      }
    }, 1000);

    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [gameState]);

  // ---------------------------------------------------------------------------
  // Timer logic
  // ---------------------------------------------------------------------------
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(SECONDS_PER_TASK);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopTimer]);

  // Handle time running out
  useEffect(() => {
    if (gameState === "playing" && timeLeft === 0 && !showingResult) {
      handleSubmitPrompt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, gameState, showingResult]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, [stopTimer]);

  // ---------------------------------------------------------------------------
  // Game actions
  // ---------------------------------------------------------------------------

  function startGame() {
    const selected = selectTasks();
    setTasks(selected);
    setCurrentIndex(0);
    setResults([]);
    setPromptText("");
    setShowingResult(false);
    setLastResult(null);
    setCoinsEarned(0);
    setClaimError(null);
    setGameState("playing");
    setTimeLeft(SECONDS_PER_TASK);

    // start timer in next tick so state is settled
    setTimeout(() => {
      startTimer();
      textareaRef.current?.focus();
    }, 50);
  }

  function handleSubmitPrompt() {
    stopTimer();

    const task = tasks[currentIndex];
    const { score, breakdown } = scorePrompt(promptText, task);
    const result: TaskResult = {
      taskId: task.id,
      score,
      breakdown,
      prompt: promptText,
    };

    const newResults = [...results, result];
    setResults(newResults);
    setLastResult(result);
    setShowingResult(true);

    // Auto-advance after 2 seconds
    advanceTimerRef.current = setTimeout(() => {
      advanceToNext(newResults);
    }, AUTO_ADVANCE_MS);
  }

  function advanceToNext(currentResults: TaskResult[]) {
    setShowingResult(false);
    setLastResult(null);
    setPromptText("");

    const nextIndex = currentIndex + 1;

    if (nextIndex >= TASKS_PER_ROUND) {
      finishGame(currentResults);
    } else {
      setCurrentIndex(nextIndex);
      startTimer();
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }

  async function finishGame(allResults: TaskResult[]) {
    stopTimer();
    setCooldownNow();
    setGameState("finished");

    const avgScore =
      allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length;
    const qualityScore = Math.min(1, Math.max(0, avgScore / 100));

    setClaiming(true);
    try {
      const resp = await gamesApi.claimReward(
        `Prompt Мастер: средний балл ${Math.round(avgScore)}/100`,
        qualityScore
      );
      setCoinsEarned(resp.earned);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Не удалось начислить монеты";
      setClaimError(message);
    } finally {
      setClaiming(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Computed values
  // ---------------------------------------------------------------------------

  const currentTask = tasks[currentIndex] as PromptTask | undefined;
  const timerFraction = timeLeft / SECONDS_PER_TASK;
  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
      : 0;
  const cooldownSeconds = Math.ceil(cooldown / 1000);
  const hasCooldown = cooldown > 0;

  // ---------------------------------------------------------------------------
  // RENDER — IDLE
  // ---------------------------------------------------------------------------

  if (gameState === "idle") {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <Link
          href="/games"
          style={{
            color: "var(--color-text-tertiary)",
            fontSize: 13,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 24,
          }}
        >
          &larr; Назад к играм
        </Link>

        <Card>
          <div style={{ textAlign: "center", padding: "24px 16px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#9997;&#65039;</div>

            <h1
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginBottom: 8,
              }}
            >
              Prompt Мастер
            </h1>

            <p
              style={{
                fontSize: 14,
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
                marginBottom: 24,
                maxWidth: 480,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Вам будет предложено 10 задач. Для каждой нужно написать качественный
              промпт. Оценка учитывает длину, указание роли, ключевые слова, контекст
              и формат вывода. На каждую задачу даётся 60 секунд.
            </p>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                backgroundColor: "var(--color-bg-tertiary)",
                marginBottom: 24,
              }}
            >
              <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                Награда:
              </span>
              <CoinBadge amount={5} size="md" />
            </div>

            <div>
              {hasCooldown ? (
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--color-status-warning)",
                      marginBottom: 12,
                    }}
                  >
                    Следующая игра доступна через{" "}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                      }}
                    >
                      {formatTime(cooldownSeconds)}
                    </span>
                  </div>
                  <Button variant="primary" size="lg" disabled>
                    Начать
                  </Button>
                </div>
              ) : (
                <Button variant="primary" size="lg" onClick={startGame}>
                  Начать
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER — PLAYING
  // ---------------------------------------------------------------------------

  if (gameState === "playing") {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header: task counter + timer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text-secondary)",
            }}
          >
            Задача {currentIndex + 1} / {TASKS_PER_ROUND}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "var(--font-mono)",
              color:
                timeLeft <= 10
                  ? "var(--color-status-error)"
                  : "var(--color-text-secondary)",
            }}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Timer bar */}
        <div
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: "var(--color-bg-tertiary)",
            marginBottom: 20,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${timerFraction * 100}%`,
              backgroundColor:
                timeLeft <= 10
                  ? "var(--color-status-error)"
                  : "var(--color-coin-gold)",
              borderRadius: 2,
              transition: "width 1s linear",
            }}
          />
        </div>

        {/* Task description */}
        {currentTask && !showingResult && (
          <>
            <Card
              glow
              style={{
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                  lineHeight: 1.5,
                }}
              >
                {currentTask.description}
              </p>
            </Card>

            {/* Textarea */}
            <div style={{ marginBottom: 12 }}>
              <textarea
                ref={textareaRef}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Напишите ваш промпт здесь..."
                rows={6}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid var(--color-border-subtle)",
                  backgroundColor: "var(--color-bg-tertiary)",
                  color: "var(--color-text-primary)",
                  fontSize: 14,
                  lineHeight: 1.6,
                  resize: "vertical",
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--color-coin-gold)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--color-border-subtle)";
                }}
              />
            </div>

            {/* Character count */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color:
                    promptText.length >= 50
                      ? "var(--color-status-success)"
                      : "var(--color-text-tertiary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {promptText.length} символов
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--color-text-tertiary)",
                  fontStyle: "italic",
                }}
              >
                Совет: укажите роль, задачу, контекст и формат
              </span>
            </div>

            {/* Submit button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmitPrompt}
              disabled={promptText.trim().length === 0}
              style={{ width: "100%" }}
            >
              Отправить
            </Button>
          </>
        )}

        {/* Result for current task (shown for 2 seconds) */}
        {showingResult && lastResult && (
          <Card>
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  color:
                    lastResult.score >= 70
                      ? "var(--color-status-success)"
                      : lastResult.score >= 40
                      ? "var(--color-status-warning)"
                      : "var(--color-status-error)",
                  marginBottom: 12,
                }}
              >
                {lastResult.score} / 100
              </div>

              {/* Breakdown */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px 24px",
                  maxWidth: 360,
                  margin: "0 auto",
                  textAlign: "left",
                }}
              >
                <BreakdownRow
                  label="Длина >=50"
                  value={lastResult.breakdown.lengthBase}
                  max={20}
                />
                <BreakdownRow
                  label="Длина >=100"
                  value={lastResult.breakdown.lengthBonus}
                  max={10}
                />
                <BreakdownRow
                  label="Роль"
                  value={lastResult.breakdown.role}
                  max={20}
                />
                <BreakdownRow
                  label="Ключевые слова"
                  value={lastResult.breakdown.keywords}
                  max={20}
                />
                <BreakdownRow
                  label="Контекст"
                  value={lastResult.breakdown.context}
                  max={15}
                />
                <BreakdownRow
                  label="Формат"
                  value={lastResult.breakdown.format}
                  max={15}
                />
              </div>

              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-text-tertiary)",
                  marginTop: 16,
                }}
              >
                Следующая задача через 2 сек...
              </p>
            </div>
          </Card>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER — FINISHED
  // ---------------------------------------------------------------------------

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <Card>
        <div style={{ textAlign: "center", padding: "24px 16px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            {avgScore >= 70 ? "\u{1F3C6}" : avgScore >= 40 ? "\u{1F44D}" : "\u{1F4AA}"}
          </div>

          <h2
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: 8,
            }}
          >
            Игра завершена!
          </h2>

          <p
            style={{
              fontSize: 14,
              color: "var(--color-text-secondary)",
              marginBottom: 24,
            }}
          >
            Ваш средний балл
          </p>

          {/* Average score */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              color:
                avgScore >= 70
                  ? "var(--color-status-success)"
                  : avgScore >= 40
                  ? "var(--color-status-warning)"
                  : "var(--color-status-error)",
              marginBottom: 8,
            }}
          >
            {avgScore} / 100
          </div>

          {/* Coins earned */}
          <div style={{ marginBottom: 24 }}>
            {claiming ? (
              <span
                style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}
              >
                Начисляем монеты...
              </span>
            ) : claimError ? (
              <span
                style={{ fontSize: 13, color: "var(--color-status-error)" }}
              >
                {claimError}
              </span>
            ) : (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 8,
                  backgroundColor: "var(--color-bg-tertiary)",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Заработано:
                </span>
                <CoinBadge amount={coinsEarned} showSign size="md" />
              </div>
            )}
          </div>

          {/* Per-task results summary */}
          <div
            style={{
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            <h3
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                marginBottom: 8,
              }}
            >
              Результаты по задачам
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {results.map((r, i) => {
                const task = tasks[i];
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      borderRadius: 6,
                      backgroundColor: "var(--color-bg-tertiary)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--color-text-secondary)",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginRight: 12,
                      }}
                    >
                      {i + 1}. {task?.description ?? ""}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "var(--font-mono)",
                        color:
                          r.score >= 70
                            ? "var(--color-status-success)"
                            : r.score >= 40
                            ? "var(--color-status-warning)"
                            : "var(--color-status-error)",
                        flexShrink: 0,
                      }}
                    >
                      {r.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={startGame}
              disabled={hasCooldown}
            >
              {hasCooldown
                ? `Повтор через ${formatTime(cooldownSeconds)}`
                : "Играть снова"}
            </Button>
            <Link href="/games">
              <Button variant="default" size="lg">
                К списку игр
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: score breakdown row
// ---------------------------------------------------------------------------

function BreakdownRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 12,
      }}
    >
      <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 600,
          color:
            value === max
              ? "var(--color-status-success)"
              : value > 0
              ? "var(--color-status-warning)"
              : "var(--color-text-tertiary)",
        }}
      >
        +{value}
      </span>
    </div>
  );
}
