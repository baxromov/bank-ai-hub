"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CoinBadge } from "@/components/coins/CoinBadge";
import { gamesApi } from "@/api-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TextSample {
  text: string;
  isAI: boolean;
  topic: string;
}

type GameState = "idle" | "playing" | "finished";

// ---------------------------------------------------------------------------
// Text Bank (20+ entries)
// ---------------------------------------------------------------------------

const TEXT_BANK: TextSample[] = [
  // --- AI-written texts ---
  {
    text: "Искусственный интеллект представляет собой область компьютерных наук, которая занимается созданием интеллектуальных систем. Эти системы способны выполнять задачи, которые обычно требуют человеческого интеллекта. К таким задачам относятся распознавание речи, принятие решений и обработка естественного языка.",
    isAI: true,
    topic: "Технологии",
  },
  {
    text: "Банковский сектор активно внедряет технологии машинного обучения для оптимизации процессов. Алгоритмы позволяют автоматизировать кредитный скоринг, выявлять мошеннические транзакции и персонализировать предложения для клиентов. Это способствует повышению эффективности и снижению операционных рисков.",
    isAI: true,
    topic: "Банкинг",
  },
  {
    text: "Цифровая трансформация банковской отрасли является ключевым направлением развития современного финансового сектора. Внедрение цифровых технологий позволяет повысить качество обслуживания клиентов, сократить операционные издержки и обеспечить конкурентоспособность на рынке. Банки, которые успешно проходят цифровую трансформацию, демонстрируют более высокие показатели рентабельности.",
    isAI: true,
    topic: "Финансы",
  },
  {
    text: "Блокчейн-технология обеспечивает децентрализованное хранение данных и проведение транзакций без участия посредников. Каждый блок содержит хеш предыдущего блока, что гарантирует целостность цепочки данных. Данная технология находит применение в банковском деле, логистике и государственном управлении.",
    isAI: true,
    topic: "Технологии",
  },
  {
    text: "Кредитный скоринг представляет собой систему оценки кредитоспособности заёмщика на основе статистических методов. Модели скоринга анализируют множество параметров, включая кредитную историю, уровень дохода и демографические характеристики. Результатом является числовая оценка, отражающая вероятность своевременного погашения кредита.",
    isAI: true,
    topic: "Банкинг",
  },
  {
    text: "Облачные вычисления предоставляют организациям возможность использования вычислительных ресурсов по модели подписки. Основные модели облачных сервисов включают IaaS, PaaS и SaaS. Преимущества облачных технологий заключаются в масштабируемости, гибкости и снижении капитальных затрат на ИТ-инфраструктуру.",
    isAI: true,
    topic: "Технологии",
  },
  {
    text: "Процесс управления рисками в банковской сфере включает идентификацию, оценку, мониторинг и контроль различных видов рисков. К основным категориям относятся кредитный риск, рыночный риск, операционный риск и риск ликвидности. Эффективное управление рисками является необходимым условием устойчивого функционирования финансовой организации.",
    isAI: true,
    topic: "Финансы",
  },
  {
    text: "Большие языковые модели функционируют на основе архитектуры трансформера и обучаются на обширных массивах текстовых данных. Процесс обучения включает предварительное обучение на неразмеченных данных и последующую тонкую настройку под конкретные задачи. Результатом является способность модели генерировать связный и контекстуально релевантный текст.",
    isAI: true,
    topic: "Технологии",
  },
  {
    text: "Система противодействия отмыванию денег представляет собой комплекс мер, направленных на предотвращение легализации доходов, полученных преступным путём. Банки обязаны проводить идентификацию клиентов, мониторинг транзакций и уведомлять регуляторов о подозрительных операциях. Несоблюдение требований влечёт за собой значительные штрафные санкции.",
    isAI: true,
    topic: "Банкинг",
  },
  {
    text: "Микросервисная архитектура предполагает разделение приложения на набор независимых сервисов, каждый из которых отвечает за определённую бизнес-функцию. Сервисы взаимодействуют между собой посредством API и могут разрабатываться, развёртываться и масштабироваться независимо друг от друга. Данный подход обеспечивает гибкость и отказоустойчивость системы.",
    isAI: true,
    topic: "Технологии",
  },
  // --- Human-written texts ---
  {
    text: "Знаете, что меня удивляет в нейросетях? Они могут написать стихи, но не понимают, о чём пишут. Мой коллега попросил ChatGPT объяснить квантовую физику пятилетнему ребёнку -- получилось забавно, но местами полная чепуха.",
    isAI: false,
    topic: "Технологии",
  },
  {
    text: "На прошлой неделе наш отдел наконец-то автоматизировал обработку заявок. Раньше на одну заявку уходило минут 15, а теперь -- меньше минуты. Правда, пару раз система путала документы, пришлось подкрутить настройки.",
    isAI: false,
    topic: "Банкинг",
  },
  {
    text: "Вчера попал на конференцию по финтеху -- ожидал скучные доклады, а в итоге залип на три часа. Один спикер рассказывал, как они за полгода перевели весь банк на API-first подход. Говорит, что первый месяц был адом, но потом всё заработало как часы.",
    isAI: false,
    topic: "Финансы",
  },
  {
    text: "Честно говоря, я скептически относился к чат-ботам в банке. Думал, очередная игрушка. Но когда наш бот начал закрывать 70% обращений без участия оператора, я изменил мнение. Клиенты, правда, иногда жалуются, что бот отвечает слишком формально.",
    isAI: false,
    topic: "Банкинг",
  },
  {
    text: "У нас в команде вечный спор: Python или Go для бэкенда? Питонисты говорят про скорость разработки, гошники -- про производительность. А я тихонько пишу на обоих и не лезу в дискуссии. Жизнь слишком коротка для холиваров.",
    isAI: false,
    topic: "Технологии",
  },
  {
    text: "Недавно считал юнит-экономику нашего нового продукта и чуть не поседел. CAC растёт, LTV падает, а маркетинг просит ещё бюджет. В итоге пересобрали воронку, убрали лишние шаги -- конверсия выросла на 40%. Иногда лучшее решение -- просто упростить.",
    isAI: false,
    topic: "Финансы",
  },
  {
    text: "Забавная история: клиент позвонил и сказал, что наше приложение украло у него деньги. Оказалось, он случайно оформил автоплатёж на 50 000 сум и забыл. Минут 20 разбирались, потом оба смеялись. Работа в поддержке -- это отдельный вид искусства.",
    isAI: false,
    topic: "Банкинг",
  },
  {
    text: "Пробовал разные AI-ассистенты для написания кода. Copilot неплохо справляется с бойлерплейтом, но сложную бизнес-логику ему лучше не доверять. Один раз он мне сгенерировал SQL-запрос, который бы положил прод. Хорошо, что на код-ревью заметили.",
    isAI: false,
    topic: "Технологии",
  },
  {
    text: "Мне кажется, через пять лет половина банковских отделений закроется. Нет, серьёзно -- зачем ехать в банк, если всё можно сделать в телефоне? Моя бабушка в 72 года освоила мобильный банк и теперь учит подруг переводить деньги через QR-код.",
    isAI: false,
    topic: "Финансы",
  },
  {
    text: "Сегодня потратил весь день на дебаг одного бага. Оказалось, проблема была в том, что кто-то полгода назад захардкодил таймзону в UTC+5, а мы недавно переехали на сервера в другом регионе. Классика жанра -- проблема всегда в последнем месте, где ищешь.",
    isAI: false,
    topic: "Технологии",
  },
  {
    text: "Начальник спросил, зачем нам нужен Kubernetes, если у нас три сервиса. Я честно ответил: \"Для резюме.\" Шутка, конечно, но задумался -- действительно, для нашего масштаба Docker Compose хватает за глаза. Не всё, что модно, нужно тащить в прод.",
    isAI: false,
    topic: "Технологии",
  },
  {
    text: "После внедрения новой CRM продажи выросли, но менеджеры первый месяц тихо ненавидели систему. Семь обязательных полей при каждом звонке -- это перебор. Сократили до трёх, добавили автозаполнение, и жалобы прекратились. Любую технологию нужно адаптировать под людей, а не наоборот.",
    isAI: false,
    topic: "Банкинг",
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROUNDS_PER_GAME = 10;
const SECONDS_PER_ROUND = 15;
const COOLDOWN_KEY = "game_detective_last_play";
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const FEEDBACK_DELAY = 1500; // 1.5s
const MAX_REWARD = 5;

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

function getCooldownRemaining(): number {
  if (typeof window === "undefined") return 0;
  const last = localStorage.getItem(COOLDOWN_KEY);
  if (!last) return 0;
  const elapsed = Date.now() - Number(last);
  return Math.max(0, COOLDOWN_MS - elapsed);
}

function formatTime(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DetectiveGamePage() {
  // ---- Game state ----
  const [gameState, setGameState] = useState<GameState>("idle");
  const [rounds, setRounds] = useState<TextSample[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // ---- Timer ----
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_ROUND);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---- Feedback ----
  const [feedback, setFeedback] = useState<{
    answered: boolean;
    correct: boolean;
    playerSaidAI: boolean;
  } | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Cooldown ----
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---- Reward ----
  const [reward, setReward] = useState<{
    earned: number;
    balance: number;
  } | null>(null);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [rewardError, setRewardError] = useState<string | null>(null);

  // ---- Cooldown tick ----
  useEffect(() => {
    setCooldownLeft(getCooldownRemaining());
    cooldownRef.current = setInterval(() => {
      const remaining = getCooldownRemaining();
      setCooldownLeft(remaining);
      if (remaining <= 0 && cooldownRef.current) {
        clearInterval(cooldownRef.current);
      }
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [gameState]);

  // ---- Timer logic ----
  useEffect(() => {
    if (gameState !== "playing" || feedback !== null) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    setTimeLeft(SECONDS_PER_ROUND);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up -- treat as wrong answer
          handleAnswer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, currentRound, feedback]);

  // ---- Cleanup on unmount ----
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // ---- Start game ----
  const startGame = useCallback(() => {
    const shuffled = shuffleArray(TEXT_BANK).slice(0, ROUNDS_PER_GAME);
    setRounds(shuffled);
    setCurrentRound(0);
    setCorrectCount(0);
    setFeedback(null);
    setReward(null);
    setRewardError(null);
    setGameState("playing");
  }, []);

  // ---- Handle answer ----
  const handleAnswer = useCallback(
    (playerSaidAI: boolean | null) => {
      if (feedback !== null) return; // Prevent double-clicks
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const currentSample = rounds[currentRound];
      // null = timed out, always wrong
      const isCorrect =
        playerSaidAI !== null && playerSaidAI === currentSample.isAI;

      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
      }

      setFeedback({
        answered: playerSaidAI !== null,
        correct: isCorrect,
        playerSaidAI: playerSaidAI ?? !currentSample.isAI, // for display
      });

      feedbackTimerRef.current = setTimeout(() => {
        const nextRound = currentRound + 1;
        if (nextRound >= ROUNDS_PER_GAME) {
          finishGame(correctCount + (isCorrect ? 1 : 0));
        } else {
          setCurrentRound(nextRound);
          setFeedback(null);
        }
      }, FEEDBACK_DELAY);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentRound, rounds, feedback, correctCount]
  );

  // ---- Finish game ----
  const finishGame = useCallback(async (finalCorrect: number) => {
    setGameState("finished");
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));

    const qualityScore = finalCorrect / ROUNDS_PER_GAME;
    setRewardLoading(true);
    setRewardError(null);

    try {
      const result = await gamesApi.claimReward(
        `AI Детектив: ${finalCorrect}/${ROUNDS_PER_GAME} правильных`,
        qualityScore
      );
      setReward({ earned: result.earned, balance: result.balance });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Не удалось получить награду";
      setRewardError(message);
    } finally {
      setRewardLoading(false);
    }
  }, []);

  // ---- Derived values ----
  const currentSample = rounds[currentRound] ?? null;
  const timerPercent = (timeLeft / SECONDS_PER_ROUND) * 100;
  const hasCooldown = cooldownLeft > 0;

  // =========================================================================
  // RENDER: IDLE
  // =========================================================================
  if (gameState === "idle") {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div className="mb-6">
          <Link
            href="/games"
            className="text-sm inline-flex items-center gap-1 mb-4"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            &larr; К играм
          </Link>
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            AI Детектив
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Определите, кто написал текст -- AI или человек
          </p>
        </div>

        <Card>
          <div className="flex flex-col gap-4">
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <span style={{ fontSize: 24 }}>🔍</span>
              <span>Тренировка AI-грамотности</span>
            </div>

            <div
              className="text-sm"
              style={{
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
              }}
            >
              <p className="mb-2">
                Вам будет показано <strong style={{ color: "var(--color-text-primary)" }}>10 текстовых фрагментов</strong>.
                Для каждого нужно определить, написан ли он искусственным
                интеллектом или человеком.
              </p>
              <p className="mb-2">
                На каждый раунд даётся{" "}
                <strong style={{ color: "var(--color-text-primary)" }}>15 секунд</strong>.
                Если время истечёт -- ответ засчитывается как неправильный.
              </p>
              <p>
                Чем больше правильных ответов, тем выше награда в IB-Coins.
              </p>
            </div>

            <div
              className="flex items-center gap-2 px-3 py-2 rounded-md"
              style={{
                backgroundColor: "var(--color-coin-gold-glow)",
                border: "1px solid var(--color-coin-gold-dim)",
              }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-coin-gold)" }}
              >
                Награда:
              </span>
              <CoinBadge amount={MAX_REWARD} size="sm" />
              <span
                className="text-xs"
                style={{ color: "var(--color-coin-gold-dim)" }}
              >
                (максимум)
              </span>
            </div>

            {hasCooldown ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <span
                  className="text-xs"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Следующая игра доступна через
                </span>
                <span
                  className="text-lg font-bold tabular-nums"
                  style={{
                    color: "var(--color-coin-gold)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {formatTime(cooldownLeft)}
                </span>
              </div>
            ) : (
              <Button variant="primary" size="lg" onClick={startGame}>
                Начать
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // =========================================================================
  // RENDER: PLAYING
  // =========================================================================
  if (gameState === "playing" && currentSample) {
    const timerColor =
      timeLeft <= 5
        ? "var(--color-status-error)"
        : timeLeft <= 10
          ? "var(--color-status-warning)"
          : "var(--color-coin-gold)";

    return (
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header: Progress + Timer */}
        <div className="mb-4 flex items-center justify-between">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Раунд{" "}
            <span
              style={{
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {currentRound + 1}
            </span>
            <span style={{ color: "var(--color-text-tertiary)" }}>
              /{ROUNDS_PER_GAME}
            </span>
          </span>
          <span
            className="text-sm font-bold tabular-nums"
            style={{
              color: timerColor,
              fontFamily: "var(--font-mono)",
            }}
          >
            {timeLeft}s
          </span>
        </div>

        {/* Timer bar */}
        <div
          className="mb-5 rounded-full overflow-hidden"
          style={{
            height: 4,
            backgroundColor: "var(--color-bg-tertiary)",
          }}
        >
          <div
            style={{
              width: `${timerPercent}%`,
              height: "100%",
              backgroundColor: timerColor,
              borderRadius: "9999px",
              transition: "width 1s linear, background-color 0.3s ease",
            }}
          />
        </div>

        {/* Topic badge */}
        <div className="mb-3">
          <span
            className="inline-block px-2 py-0.5 rounded text-xs font-medium"
            style={{
              backgroundColor: "var(--color-bg-tertiary)",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border-subtle)",
            }}
          >
            {currentSample.topic}
          </span>
        </div>

        {/* Text passage card with gold left border */}
        <Card>
          <div
            style={{
              borderLeft: "3px solid var(--color-coin-gold)",
              paddingLeft: 16,
              minHeight: 80,
            }}
          >
            <p
              className="text-sm"
              style={{
                color: "var(--color-text-primary)",
                lineHeight: 1.8,
                fontStyle: "italic",
              }}
            >
              &ldquo;{currentSample.text}&rdquo;
            </p>
          </div>
        </Card>

        {/* Feedback overlay or Answer buttons */}
        {feedback ? (
          <div
            className="mt-4 p-4 rounded-lg text-center"
            style={{
              backgroundColor: feedback.correct
                ? "rgba(62, 207, 113, 0.1)"
                : "rgba(229, 77, 77, 0.1)",
              border: `1px solid ${
                feedback.correct
                  ? "var(--color-status-success)"
                  : "var(--color-status-error)"
              }`,
            }}
          >
            <div
              className="text-sm font-semibold mb-1"
              style={{
                color: feedback.correct
                  ? "var(--color-status-success)"
                  : "var(--color-status-error)",
              }}
            >
              {!feedback.answered
                ? "Время вышло!"
                : feedback.correct
                  ? "Правильно!"
                  : "Неправильно!"}
            </div>
            <div
              className="text-xs"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {currentSample.isAI
                ? "Этот текст написал AI"
                : "Этот текст написал человек"}
            </div>
          </div>
        ) : (
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border-subtle)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  "var(--color-status-info)";
                e.currentTarget.style.backgroundColor =
                  "rgba(91, 155, 213, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor =
                  "var(--color-border-subtle)";
                e.currentTarget.style.backgroundColor =
                  "var(--color-bg-tertiary)";
              }}
            >
              AI написал
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border-subtle)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  "var(--color-coin-gold)";
                e.currentTarget.style.backgroundColor =
                  "var(--color-coin-gold-glow)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor =
                  "var(--color-border-subtle)";
                e.currentTarget.style.backgroundColor =
                  "var(--color-bg-tertiary)";
              }}
            >
              Человек написал
            </button>
          </div>
        )}

        {/* Running score */}
        <div
          className="mt-4 text-center text-xs"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Правильных ответов:{" "}
          <span
            style={{
              color: "var(--color-coin-gold)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {correctCount}
          </span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: FINISHED
  // =========================================================================
  if (gameState === "finished") {
    const accuracy = Math.round((correctCount / ROUNDS_PER_GAME) * 100);
    const qualityScore = correctCount / ROUNDS_PER_GAME;

    let resultLabel: string;
    let resultColor: string;
    if (accuracy >= 80) {
      resultLabel = "Отличный результат!";
      resultColor = "var(--color-status-success)";
    } else if (accuracy >= 50) {
      resultLabel = "Хороший результат!";
      resultColor = "var(--color-coin-gold)";
    } else {
      resultLabel = "Есть куда расти!";
      resultColor = "var(--color-status-error)";
    }

    return (
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div className="mb-6">
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Результаты
          </h1>
        </div>

        <Card glow={accuracy >= 80}>
          <div className="flex flex-col items-center gap-4 py-4">
            {/* Big score */}
            <div className="text-center">
              <div
                className="text-4xl font-bold tabular-nums"
                style={{
                  color: resultColor,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {correctCount}/{ROUNDS_PER_GAME}
              </div>
              <div
                className="text-sm mt-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                правильных ответов
              </div>
            </div>

            {/* Accuracy */}
            <div
              className="px-3 py-1.5 rounded-md"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <span
                className="text-sm font-medium tabular-nums"
                style={{
                  color: resultColor,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {accuracy}% точность
              </span>
            </div>

            {/* Result label */}
            <div
              className="text-sm font-medium"
              style={{ color: resultColor }}
            >
              {resultLabel}
            </div>

            {/* Divider */}
            <div
              className="w-full"
              style={{
                height: 1,
                backgroundColor: "var(--color-border-subtle)",
              }}
            />

            {/* Reward section */}
            <div className="text-center">
              {rewardLoading && (
                <div
                  className="text-sm"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Начисление награды...
                </div>
              )}
              {rewardError && (
                <div
                  className="text-sm"
                  style={{ color: "var(--color-status-error)" }}
                >
                  {rewardError}
                </div>
              )}
              {reward && (
                <div className="flex flex-col items-center gap-1">
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Вы заработали
                  </span>
                  <CoinBadge amount={reward.earned} showSign size="lg" />
                  <span
                    className="text-xs mt-1"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Баланс:{" "}
                    <span
                      style={{
                        color: "var(--color-coin-gold)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {reward.balance.toLocaleString()} IB
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div
              className="w-full"
              style={{
                height: 1,
                backgroundColor: "var(--color-border-subtle)",
              }}
            />

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <Link href="/games" className="flex-1">
                <Button variant="default" size="md" className="w-full">
                  &larr; К играм
                </Button>
              </Link>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => {
                  setGameState("idle");
                }}
              >
                Играть ещё
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Fallback (should not reach)
  return null;
}
