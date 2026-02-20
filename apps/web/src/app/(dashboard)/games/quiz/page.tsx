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

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

type GameState = "idle" | "playing" | "finished";

const COOLDOWN_KEY = "game_quiz_last_play";
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const QUESTIONS_PER_ROUND = 10;
const SECONDS_PER_QUESTION = 15;
const ADVANCE_DELAY_MS = 1500;

// ---------------------------------------------------------------------------
// Question bank (30+ questions)
// ---------------------------------------------------------------------------

const QUESTION_BANK: Question[] = [
  {
    question: "Что такое LLM?",
    options: [
      "Large Language Model — большая языковая модель",
      "Linear Logic Machine — машина линейной логики",
      "Local Learning Method — метод локального обучения",
      "Long-term Lexical Memory — долгосрочная лексическая память",
    ],
    correctIndex: 0,
  },
  {
    question: "Что означает термин «токен» в контексте LLM?",
    options: [
      "Ключ доступа к API",
      "Фрагмент текста, обрабатываемый моделью",
      "Единица оплаты за запрос",
      "Тип нейронной сети",
    ],
    correctIndex: 1,
  },
  {
    question:
      "Какой приём промпт-инжиниринга предлагает модели «думать пошагово»?",
    options: [
      "Few-shot prompting",
      "Chain-of-thought prompting",
      "Zero-shot prompting",
      "Role prompting",
    ],
    correctIndex: 1,
  },
  {
    question: "Что такое RAG?",
    options: [
      "Rapid Algorithm Generation",
      "Retrieval-Augmented Generation",
      "Recursive Auto-Grammar",
      "Random Attention Grid",
    ],
    correctIndex: 1,
  },
  {
    question: "Для чего используется fine-tuning?",
    options: [
      "Удаление лишних параметров модели",
      "Автоматическое тестирование модели",
      "Дообучение модели на специализированных данных",
      "Ускорение инференса",
    ],
    correctIndex: 2,
  },
  {
    question: "Что такое hallucination в контексте AI?",
    options: [
      "Ошибка в обучающих данных",
      "Генерация правдоподобной, но ложной информации",
      "Потеря контекста при длинном диалоге",
      "Баг в архитектуре трансформера",
    ],
    correctIndex: 1,
  },
  {
    question: "Что такое «температура» (temperature) при генерации текста?",
    options: [
      "Нагрев GPU при вычислениях",
      "Скорость генерации токенов",
      "Параметр, контролирующий случайность ответов",
      "Мера качества обучающих данных",
    ],
    correctIndex: 2,
  },
  {
    question: "Что делает системный промпт (system prompt)?",
    options: [
      "Запускает модель на сервере",
      "Задаёт роль и ограничения поведения модели",
      "Шифрует пользовательские данные",
      "Оптимизирует потребление памяти",
    ],
    correctIndex: 1,
  },
  {
    question: "Что такое few-shot prompting?",
    options: [
      "Обучение модели на малых данных",
      "Подача нескольких примеров в промпте для направления ответа",
      "Метод сжатия модели",
      "Генерация множества вариантов ответа",
    ],
    correctIndex: 1,
  },
  {
    question: "Что такое zero-shot prompting?",
    options: [
      "Промпт без примеров — модель сама понимает задачу",
      "Промпт с нулевой температурой",
      "Запрос без ожидания ответа",
      "Метод обнуления весов модели",
    ],
    correctIndex: 0,
  },
  {
    question: "Какой тип AI используется для обнаружения мошенничества в банке?",
    options: [
      "Генеративные модели",
      "Модели обнаружения аномалий",
      "Модели генерации изображений",
      "Рекомендательные системы",
    ],
    correctIndex: 1,
  },
  {
    question: "Что такое NLP?",
    options: [
      "Neural Learning Protocol",
      "Natural Language Processing — обработка естественного языка",
      "Network Layer Protocol",
      "Numeric Logic Programming",
    ],
    correctIndex: 1,
  },
  {
    question: "Как AI помогает в кредитном скоринге?",
    options: [
      "Заменяет банковского сотрудника полностью",
      "Анализирует данные заёмщика и прогнозирует вероятность возврата",
      "Генерирует случайные оценки",
      "Только хранит данные о клиентах",
    ],
    correctIndex: 1,
  },
  {
    question: "Что такое трансформер (Transformer)?",
    options: [
      "Устройство для преобразования напряжения",
      "Архитектура нейронной сети с механизмом внимания",
      "Программа для конвертации файлов",
      "Метод сжатия данных",
    ],
    correctIndex: 1,
  },
  {
    question: "Что такое attention mechanism (механизм внимания)?",
    options: [
      "Система мониторинга серверов",
      "Механизм, позволяющий модели фокусироваться на значимых частях входа",
      "Метод привлечения пользователей",
      "Алгоритм проверки внимательности оператора",
    ],
    correctIndex: 1,
  },
  {
    question: "Что означает аббревиатура GPT?",
    options: [
      "Global Processing Technology",
      "Generative Pre-trained Transformer",
      "General Purpose Terminal",
      "Graphical Prediction Tool",
    ],
    correctIndex: 1,
  },
  {
    question: "Какой метод AI используется для анализа настроений клиентов?",
    options: [
      "Компьютерное зрение",
      "Сентимент-анализ (Sentiment Analysis)",
      "Генерация изображений",
      "Кластеризация данных",
    ],
    correctIndex: 1,
  },
  {
    question: "Что такое embedding (эмбеддинг)?",
    options: [
      "Встраивание рекламы в модель",
      "Числовое представление текста в виде вектора",
      "Метод шифрования данных",
      "Способ хранения моделей на диске",
    ],
    correctIndex: 1,
  },
  {
    question: "Для чего используется OCR в банковской сфере?",
    options: [
      "Для генерации текста",
      "Для распознавания текста на документах и изображениях",
      "Для обучения моделей",
      "Для шифрования данных",
    ],
    correctIndex: 1,
  },
  {
    question: "Что такое prompt injection?",
    options: [
      "Метод улучшения промптов",
      "Атака, при которой злоумышленник пытается обмануть AI через ввод",
      "Способ ускорения генерации",
      "Технология параллельной обработки промптов",
    ],
    correctIndex: 1,
  },
  {
    question: "Что такое контекстное окно (context window) LLM?",
    options: [
      "Окно программы, где отображается чат",
      "Максимальное количество токенов, которое модель может обработать за раз",
      "Время ответа модели",
      "Количество пользователей, работающих одновременно",
    ],
    correctIndex: 1,
  },
  {
    question: "Какой AI-метод используется для автоматизации KYC (Know Your Customer)?",
    options: [
      "Генеративные модели",
      "Компьютерное зрение и NLP для верификации документов",
      "Рекуррентные сети для предсказания курсов",
      "Кластерный анализ",
    ],
    correctIndex: 1,
  },
  {
    question: "Что означает параметр top_p при генерации текста?",
    options: [
      "Количество лучших ответов",
      "Порог вероятности для выборки токенов (nucleus sampling)",
      "Количество слоёв модели",
      "Размер батча при обучении",
    ],
    correctIndex: 1,
  },
  {
    question: "Что такое LoRA в контексте дообучения моделей?",
    options: [
      "Low-Rank Adaptation — эффективный метод дообучения с малым числом параметров",
      "Long-Range Attention — механизм дальнего внимания",
      "Logic-based Reasoning Algorithm — алгоритм логических рассуждений",
      "Layered Output Response Architecture — многоуровневая архитектура",
    ],
    correctIndex: 0,
  },
  {
    question: "Что такое вектор атаки «jailbreak» для AI-моделей?",
    options: [
      "Физический взлом сервера",
      "Попытка обойти встроенные ограничения модели через специальные промпты",
      "Удаление модели с сервера",
      "Метод ускорения обучения",
    ],
    correctIndex: 1,
  },
  {
    question: "Какой тип модели лучше подходит для классификации банковских транзакций?",
    options: [
      "Генеративная языковая модель",
      "Модель классификации (supervised learning)",
      "Модель генерации изображений",
      "Рекомендательная система",
    ],
    correctIndex: 1,
  },
  {
    question: "Что такое AML в банковской сфере и как AI помогает?",
    options: [
      "AI Markup Language — язык разметки для AI",
      "Anti-Money Laundering — AI выявляет подозрительные транзакции",
      "Automated Machine Learning — автоматическое обучение моделей",
      "Advanced Memory Layer — слой расширенной памяти",
    ],
    correctIndex: 1,
  },
  {
    question: "Что такое «галлюцинация» модели и как с ней бороться?",
    options: [
      "Ошибка GPU — нужно перезагрузить сервер",
      "Генерация ложных фактов — бороться через RAG и верификацию",
      "Медленная работа — увеличить вычислительные ресурсы",
      "Дублирование текста — уменьшить контекстное окно",
    ],
    correctIndex: 1,
  },
  {
    question: "Что такое MCP (Model Context Protocol)?",
    options: [
      "Протокол подключения монитора",
      "Стандарт для подключения внешних инструментов к AI-модели",
      "Метод компрессии моделей",
      "Протокол общения между микросервисами",
    ],
    correctIndex: 1,
  },
  {
    question: "Что такое role prompting?",
    options: [
      "Автоматическое назначение ролей в системе",
      "Назначение модели определённой роли (эксперта, переводчика и т.д.)",
      "Метод разграничения доступа к AI",
      "Ротация моделей между серверами",
    ],
    correctIndex: 1,
  },
  {
    question: "Что такое quantization (квантизация) моделей?",
    options: [
      "Увеличение размера модели для большей точности",
      "Снижение точности весов модели для уменьшения размера и ускорения",
      "Разделение модели на несколько частей",
      "Обучение модели на квантовых компьютерах",
    ],
    correctIndex: 1,
  },
  {
    question: "Какой подход используется для персонализации банковских предложений с помощью AI?",
    options: [
      "Случайная генерация",
      "Рекомендательные системы на основе поведения клиента",
      "Ручной подбор специалистом",
      "Генеративные изображения",
    ],
    correctIndex: 1,
  },
  {
    question: "Что такое inference (инференс) в контексте AI?",
    options: [
      "Процесс обучения модели",
      "Процесс применения обученной модели для получения предсказаний",
      "Метод сбора данных",
      "Архитектура нейронной сети",
    ],
    correctIndex: 1,
  },
  {
    question: "Для чего нужен чатбот в банковском обслуживании?",
    options: [
      "Только для развлечения сотрудников",
      "Автоматизация ответов на типичные вопросы клиентов 24/7",
      "Замена всех банковских сотрудников",
      "Генерация рекламных текстов",
    ],
    correctIndex: 1,
  },
  {
    question: "Что такое RLHF?",
    options: [
      "Reinforcement Learning from Human Feedback — обучение с подкреплением от обратной связи людей",
      "Recursive Learning with High Frequency — рекурсивное высокочастотное обучение",
      "Real-time Language Handling Framework — фреймворк обработки языка",
      "Regression Learning for Hypothesis Filtering — регрессия для фильтрации гипотез",
    ],
    correctIndex: 0,
  },
  {
    question: "Какой основной риск использования AI в банковских решениях?",
    options: [
      "Высокое энергопотребление",
      "Предвзятость (bias) модели и непрозрачность решений",
      "Слишком быстрая обработка данных",
      "Необходимость интернет-соединения",
    ],
    correctIndex: 1,
  },
];

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickRandomQuestions(count: number): Question[] {
  return shuffleArray(QUESTION_BANK).slice(0, count);
}

function getCooldownRemaining(): number {
  if (typeof window === "undefined") return 0;
  const lastPlay = localStorage.getItem(COOLDOWN_KEY);
  if (!lastPlay) return 0;
  const elapsed = Date.now() - parseInt(lastPlay, 10);
  return Math.max(0, COOLDOWN_MS - elapsed);
}

function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function QuizPage() {
  // Game state
  const [gameState, setGameState] = useState<GameState>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);

  // Cooldown
  const [cooldownMs, setCooldownMs] = useState(0);

  // Result
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Timer refs
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // -----------------------------------------------------------------------
  // Cooldown ticker
  // -----------------------------------------------------------------------

  const startCooldownTicker = useCallback(() => {
    const remaining = getCooldownRemaining();
    setCooldownMs(remaining);

    if (remaining <= 0) return;

    cooldownRef.current = setInterval(() => {
      const r = getCooldownRemaining();
      setCooldownMs(r);
      if (r <= 0 && cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
    }, 1000);
  }, []);

  useEffect(() => {
    startCooldownTicker();
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [startCooldownTicker]);

  // -----------------------------------------------------------------------
  // Question timer
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (gameState !== "playing" || isRevealed) return;

    setTimeLeft(SECONDS_PER_QUESTION);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time ran out — treat as wrong answer
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setIsRevealed(true);
          setSelectedOption(-1); // -1 signals timeout
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
  }, [gameState, currentIndex, isRevealed]);

  // -----------------------------------------------------------------------
  // Auto-advance after reveal
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!isRevealed) return;

    advanceRef.current = setTimeout(() => {
      if (currentIndex + 1 < QUESTIONS_PER_ROUND) {
        setCurrentIndex((i) => i + 1);
        setSelectedOption(null);
        setIsRevealed(false);
      } else {
        finishGame();
      }
    }, ADVANCE_DELAY_MS);

    return () => {
      if (advanceRef.current) {
        clearTimeout(advanceRef.current);
        advanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRevealed, currentIndex]);

  // -----------------------------------------------------------------------
  // Cleanup all timers on unmount
  // -----------------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (advanceRef.current) clearTimeout(advanceRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const startGame = () => {
    const remaining = getCooldownRemaining();
    if (remaining > 0) {
      setCooldownMs(remaining);
      return;
    }

    setQuestions(pickRandomQuestions(QUESTIONS_PER_ROUND));
    setCurrentIndex(0);
    setCorrectCount(0);
    setSelectedOption(null);
    setIsRevealed(false);
    setCoinsEarned(0);
    setClaimError(null);
    setGameState("playing");
  };

  const handleAnswer = (optionIndex: number) => {
    if (isRevealed) return;

    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setSelectedOption(optionIndex);
    setIsRevealed(true);

    if (optionIndex === questions[currentIndex].correctIndex) {
      setCorrectCount((c) => c + 1);
    }
  };

  const finishGame = async () => {
    setGameState("finished");

    // Set cooldown
    localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
    startCooldownTicker();

    // We need the final correctCount. Since React state updates are batched,
    // we compute it from the current values directly.
    // correctCount has already been updated by the time we get here because
    // handleAnswer sets it synchronously before the reveal timeout fires.
    // However, to be safe, we compute from the ref-like current state.
    // We'll pass the value through the claim function after state settles.
  };

  // Claim reward after finishing — triggered by the finished state
  useEffect(() => {
    if (gameState !== "finished") return;

    let cancelled = false;

    const claim = async () => {
      setIsClaimingReward(true);
      setClaimError(null);

      // We need to read correctCount at this point.
      // Because this effect runs after the state update that set gameState to "finished",
      // correctCount should have its final value from the last setCorrectCount call.
      try {
        const qualityScore = correctCount / QUESTIONS_PER_ROUND;
        const result = await gamesApi.claimReward(
          `AI Викторина: ${correctCount}/${QUESTIONS_PER_ROUND} правильных ответов`,
          qualityScore
        );
        if (!cancelled) {
          setCoinsEarned(result.earned);
        }
      } catch (err) {
        if (!cancelled) {
          setClaimError("Не удалось получить награду. Попробуйте позже.");
          console.error("Failed to claim reward:", err);
        }
      } finally {
        if (!cancelled) {
          setIsClaimingReward(false);
        }
      }
    };

    claim();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // -----------------------------------------------------------------------
  // Render: IDLE state
  // -----------------------------------------------------------------------

  if (gameState === "idle") {
    const hasCooldown = cooldownMs > 0;

    return (
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
        }}
      >
        <div className="mb-6">
          <Link
            href="/games"
            className="text-xs font-medium"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            &larr; К играм
          </Link>
        </div>

        <Card>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "24px 16px",
              gap: 16,
            }}
          >
            <div style={{ fontSize: 48 }}>🧠</div>

            <h1
              className="text-xl font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              AI Викторина
            </h1>

            <p
              className="text-sm"
              style={{
                color: "var(--color-text-secondary)",
                maxWidth: 420,
                lineHeight: 1.6,
              }}
            >
              Проверьте свои знания в области искусственного интеллекта,
              промпт-инжиниринга и банковских AI-технологий.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                width: "100%",
                maxWidth: 360,
                padding: "16px",
                borderRadius: 8,
                backgroundColor: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <div
                className="text-xs"
                style={{
                  color: "var(--color-text-tertiary)",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Вопросов</span>
                <span
                  style={{
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  10
                </span>
              </div>
              <div
                className="text-xs"
                style={{
                  color: "var(--color-text-tertiary)",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Время на вопрос</span>
                <span
                  style={{
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  15 сек
                </span>
              </div>
              <div
                className="text-xs"
                style={{
                  color: "var(--color-text-tertiary)",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Награда</span>
                <span
                  style={{
                    color: "var(--color-coin-gold)",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 500,
                  }}
                >
                  до 5 IB-Coin
                </span>
              </div>
              <div
                className="text-xs"
                style={{
                  color: "var(--color-text-tertiary)",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Перерыв</span>
                <span
                  style={{
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  5 мин
                </span>
              </div>
            </div>

            {hasCooldown ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Подождите{" "}
                  <span
                    style={{
                      color: "var(--color-coin-gold)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {formatTime(cooldownMs)}
                  </span>
                </div>
                <Button variant="default" size="lg" disabled>
                  Начать
                </Button>
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

  // -----------------------------------------------------------------------
  // Render: PLAYING state
  // -----------------------------------------------------------------------

  if (gameState === "playing" && questions.length > 0) {
    const question = questions[currentIndex];
    const timerFraction = timeLeft / SECONDS_PER_QUESTION;
    const isLowTime = timeLeft <= 5;

    return (
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
        }}
      >
        {/* Header: Progress */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <span
            className="text-sm font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Вопрос{" "}
            <span
              style={{
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {currentIndex + 1}
            </span>
            <span style={{ color: "var(--color-text-tertiary)" }}>
              {" "}
              / {QUESTIONS_PER_ROUND}
            </span>
          </span>

          <span
            className="text-sm font-medium tabular-nums"
            style={{
              color: isLowTime
                ? "var(--color-status-error)"
                : "var(--color-text-primary)",
              fontFamily: "var(--font-mono)",
              transition: "color 0.3s ease",
            }}
          >
            {timeLeft} сек
          </span>
        </div>

        {/* Timer bar */}
        <div
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: "var(--color-bg-tertiary)",
            marginBottom: 24,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 2,
              width: `${timerFraction * 100}%`,
              backgroundColor: isLowTime
                ? "var(--color-status-error)"
                : "var(--color-coin-gold)",
              transition: "width 1s linear, background-color 0.3s ease",
            }}
          />
        </div>

        {/* Progress dots */}
        <div
          style={{
            display: "flex",
            gap: 6,
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          {Array.from({ length: QUESTIONS_PER_ROUND }).map((_, i) => {
            let dotColor = "var(--color-bg-tertiary)";
            if (i < currentIndex) {
              dotColor = "var(--color-coin-gold-bright)";
            } else if (i === currentIndex) {
              dotColor = "var(--color-coin-gold)";
            }
            return (
              <div
                key={i}
                style={{
                  width: i === currentIndex ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: dotColor,
                  transition: "all 0.3s ease",
                }}
              />
            );
          })}
        </div>

        {/* Question card */}
        <Card>
          <div style={{ padding: "8px 4px" }}>
            <h2
              className="text-base font-medium"
              style={{
                color: "var(--color-text-primary)",
                marginBottom: 20,
                lineHeight: 1.6,
              }}
            >
              {question.question}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {question.options.map((option, optIndex) => {
                let bgColor = "var(--color-bg-tertiary)";
                let borderColor = "var(--color-border-subtle)";
                let textColor = "var(--color-text-primary)";
                let cursor = "pointer";

                if (isRevealed) {
                  cursor = "default";
                  if (optIndex === question.correctIndex) {
                    bgColor = "rgba(34, 197, 94, 0.12)";
                    borderColor = "var(--color-status-success)";
                    textColor = "var(--color-status-success)";
                  } else if (
                    optIndex === selectedOption &&
                    optIndex !== question.correctIndex
                  ) {
                    bgColor = "rgba(239, 68, 68, 0.12)";
                    borderColor = "var(--color-status-error)";
                    textColor = "var(--color-status-error)";
                  } else {
                    textColor = "var(--color-text-tertiary)";
                  }
                }

                return (
                  <button
                    key={optIndex}
                    onClick={() => handleAnswer(optIndex)}
                    disabled={isRevealed}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 8,
                      backgroundColor: bgColor,
                      border: `1px solid ${borderColor}`,
                      color: textColor,
                      cursor,
                      textAlign: "left",
                      fontSize: 14,
                      lineHeight: 1.5,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "var(--font-mono)",
                        backgroundColor:
                          isRevealed && optIndex === question.correctIndex
                            ? "var(--color-status-success)"
                            : isRevealed &&
                                optIndex === selectedOption &&
                                optIndex !== question.correctIndex
                              ? "var(--color-status-error)"
                              : "var(--color-bg-elevated)",
                        color:
                          isRevealed &&
                          (optIndex === question.correctIndex ||
                            optIndex === selectedOption)
                            ? "#fff"
                            : "var(--color-text-secondary)",
                        border: isRevealed
                          ? "none"
                          : "1px solid var(--color-border-subtle)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {String.fromCharCode(65 + optIndex)}
                    </span>
                    <span style={{ paddingTop: 2 }}>{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Current score */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 16,
          }}
        >
          <span
            className="text-xs"
            style={{
              color: "var(--color-text-tertiary)",
            }}
          >
            Правильных:{" "}
            <span
              style={{
                color: "var(--color-coin-gold)",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
              }}
            >
              {correctCount}
            </span>
          </span>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render: FINISHED state
  // -----------------------------------------------------------------------

  if (gameState === "finished") {
    const qualityScore = correctCount / QUESTIONS_PER_ROUND;
    const percentage = Math.round(qualityScore * 100);

    let resultMessage = "";
    let resultColor = "var(--color-text-secondary)";
    if (percentage >= 90) {
      resultMessage = "Превосходно! Вы настоящий AI-эксперт!";
      resultColor = "var(--color-coin-gold-bright)";
    } else if (percentage >= 70) {
      resultMessage = "Отличный результат! Хорошие знания AI.";
      resultColor = "var(--color-status-success)";
    } else if (percentage >= 50) {
      resultMessage = "Неплохо! Есть что подтянуть.";
      resultColor = "var(--color-text-secondary)";
    } else {
      resultMessage = "Стоит изучить тему AI подробнее. Попробуйте ещё!";
      resultColor = "var(--color-text-tertiary)";
    }

    return (
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
        }}
      >
        <div className="mb-6">
          <Link
            href="/games"
            className="text-xs font-medium"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            &larr; К играм
          </Link>
        </div>

        <Card glow={percentage >= 70}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "24px 16px",
              gap: 20,
            }}
          >
            <div style={{ fontSize: 48 }}>
              {percentage >= 90
                ? "🏆"
                : percentage >= 70
                  ? "🎉"
                  : percentage >= 50
                    ? "👍"
                    : "📚"}
            </div>

            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Викторина завершена!
            </h2>

            <p className="text-sm" style={{ color: resultColor }}>
              {resultMessage}
            </p>

            {/* Score display */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "20px 32px",
                borderRadius: 12,
                backgroundColor: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border-subtle)",
                minWidth: 200,
              }}
            >
              <span
                className="text-xs"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Результат
              </span>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-text-primary)",
                  lineHeight: 1,
                }}
              >
                {correctCount}
                <span
                  style={{
                    fontSize: 18,
                    color: "var(--color-text-tertiary)",
                    fontWeight: 400,
                  }}
                >
                  /{QUESTIONS_PER_ROUND}
                </span>
              </div>
              <span
                className="text-xs"
                style={{
                  color: "var(--color-text-tertiary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {percentage}%
              </span>
            </div>

            {/* Coins earned */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                className="text-xs"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Награда
              </span>
              {isClaimingReward ? (
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Начисляем монеты...
                </span>
              ) : claimError ? (
                <span
                  className="text-sm"
                  style={{ color: "var(--color-status-error)" }}
                >
                  {claimError}
                </span>
              ) : (
                <CoinBadge amount={coinsEarned} showSign size="lg" />
              )}
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 8,
                alignItems: "center",
              }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={startGame}
                disabled={cooldownMs > 0}
              >
                {cooldownMs > 0
                  ? `Подождите ${formatTime(cooldownMs)}`
                  : "Играть ещё"}
              </Button>
            </div>

            <Link
              href="/games"
              className="text-xs font-medium"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              &larr; К играм
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
