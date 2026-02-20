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

interface TermPair {
  term: string;
  definition: string;
}

interface MemoryCard {
  id: number;
  pairId: number;
  text: string;
  side: "term" | "definition";
  flipped: boolean;
  matched: boolean;
}

type GameState = "idle" | "playing" | "finished";

// ---------------------------------------------------------------------------
// Pair bank (20 pairs)
// ---------------------------------------------------------------------------

const PAIR_BANK: TermPair[] = [
  { term: "LLM", definition: "Большая языковая модель" },
  { term: "NLP", definition: "Обработка естественного языка" },
  { term: "RAG", definition: "Генерация с извлечением данных" },
  { term: "RLHF", definition: "Обучение с обратной связью от человека" },
  { term: "Fine-tuning", definition: "Дообучение модели" },
  { term: "Токен", definition: "Единица текста для модели" },
  { term: "Промпт", definition: "Текстовый запрос к AI" },
  { term: "Эмбеддинг", definition: "Векторное представление текста" },
  { term: "Трансформер", definition: "Архитектура на основе внимания" },
  { term: "Галлюцинация", definition: "Ложная генерация AI" },
  { term: "Температура", definition: "Параметр случайности ответа" },
  { term: "Контекстное окно", definition: "Максимальный объём входного текста" },
  { term: "Инференс", definition: "Процесс генерации ответа" },
  { term: "Датасет", definition: "Набор данных для обучения" },
  { term: "Бэкпропагация", definition: "Метод обратного распространения ошибки" },
  { term: "Скоринг", definition: "Оценка кредитоспособности" },
  { term: "API", definition: "Интерфейс программирования" },
  { term: "Чат-бот", definition: "Автоматический собеседник" },
  { term: "Нейросеть", definition: "Модель из связанных узлов" },
  { term: "Предобучение", definition: "Первичное обучение на большом корпусе" },
];

const TOTAL_PAIRS = 8;
const TIME_LIMIT = 120; // seconds
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const COOLDOWN_KEY = "game_memory_last_play";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): MemoryCard[] {
  const selected = shuffleArray(PAIR_BANK).slice(0, TOTAL_PAIRS);
  const cards: MemoryCard[] = [];
  selected.forEach((pair, idx) => {
    cards.push({
      id: idx * 2,
      pairId: idx,
      text: pair.term,
      side: "term",
      flipped: false,
      matched: false,
    });
    cards.push({
      id: idx * 2 + 1,
      pairId: idx,
      text: pair.definition,
      side: "definition",
      flipped: false,
      matched: false,
    });
  });
  return shuffleArray(cards);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getCooldownRemaining(): number {
  if (typeof window === "undefined") return 0;
  const last = localStorage.getItem(COOLDOWN_KEY);
  if (!last) return 0;
  const elapsed = Date.now() - parseInt(last, 10);
  return Math.max(0, COOLDOWN_MS - elapsed);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MemoryGamePage() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isComparing, setIsComparing] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [isClaimingReward, setIsClaimingReward] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const compareTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -----------------------------------------------------------------------
  // Cooldown ticker
  // -----------------------------------------------------------------------
  useEffect(() => {
    setCooldownLeft(getCooldownRemaining());
    const id = setInterval(() => {
      const remaining = getCooldownRemaining();
      setCooldownLeft(remaining);
    }, 1000);
    return () => clearInterval(id);
  }, [gameState]);

  // -----------------------------------------------------------------------
  // Game timer
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (gameState !== "playing") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // -----------------------------------------------------------------------
  // End game when time runs out
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (gameState === "playing" && timeLeft <= 0) {
      endGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, gameState]);

  // -----------------------------------------------------------------------
  // End game when all pairs found
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (gameState === "playing" && matchedPairs === TOTAL_PAIRS) {
      endGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedPairs, gameState]);

  // -----------------------------------------------------------------------
  // Cleanup on unmount
  // -----------------------------------------------------------------------
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (compareTimeoutRef.current) clearTimeout(compareTimeoutRef.current);
    };
  }, []);

  // -----------------------------------------------------------------------
  // Start game
  // -----------------------------------------------------------------------
  const startGame = useCallback(() => {
    if (getCooldownRemaining() > 0) return;

    setCards(buildDeck());
    setFlippedIndices([]);
    setAttempts(0);
    setMatchedPairs(0);
    setTimeLeft(TIME_LIMIT);
    setCoinsEarned(0);
    setIsComparing(false);
    setIsClaimingReward(false);
    setGameState("playing");
  }, []);

  // -----------------------------------------------------------------------
  // End game & claim reward
  // -----------------------------------------------------------------------
  const endGame = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (compareTimeoutRef.current) clearTimeout(compareTimeoutRef.current);

    setGameState("finished");

    // Save cooldown timestamp
    localStorage.setItem(COOLDOWN_KEY, Date.now().toString());

    // Calculate score
    const currentAttempts = attempts;
    const currentMatched = matchedPairs;
    // Use a ref-like approach: read from the latest state via functional check
    // Since endGame may be called from an effect, we use the values at call time.
    const finalMatched = currentMatched === TOTAL_PAIRS ? TOTAL_PAIRS : currentMatched;
    const qualityScore =
      finalMatched === 0
        ? 0
        : Math.max(0, 1 - (currentAttempts - TOTAL_PAIRS) / 16) *
          (finalMatched / TOTAL_PAIRS);

    setIsClaimingReward(true);
    try {
      const result = await gamesApi.claimReward(
        `Токен Охотник: ${finalMatched}/${TOTAL_PAIRS} пар за ${currentAttempts} попыток`,
        qualityScore
      );
      setCoinsEarned(result.earned);
    } catch {
      setCoinsEarned(0);
    } finally {
      setIsClaimingReward(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts, matchedPairs]);

  // -----------------------------------------------------------------------
  // Handle card click
  // -----------------------------------------------------------------------
  const handleCardClick = useCallback(
    (index: number) => {
      if (gameState !== "playing") return;
      if (isComparing) return;

      const card = cards[index];
      if (!card || card.flipped || card.matched) return;

      // Flip the card
      const newCards = [...cards];
      newCards[index] = { ...newCards[index], flipped: true };
      const newFlipped = [...flippedIndices, index];

      setCards(newCards);
      setFlippedIndices(newFlipped);

      // If two cards flipped, compare
      if (newFlipped.length === 2) {
        setAttempts((prev) => prev + 1);
        setIsComparing(true);

        const [firstIdx, secondIdx] = newFlipped;
        const firstCard = newCards[firstIdx];
        const secondCard = newCards[secondIdx];

        if (firstCard.pairId === secondCard.pairId) {
          // Match found
          const matchedCards = [...newCards];
          matchedCards[firstIdx] = { ...matchedCards[firstIdx], matched: true };
          matchedCards[secondIdx] = {
            ...matchedCards[secondIdx],
            matched: true,
          };
          setCards(matchedCards);
          setMatchedPairs((prev) => prev + 1);
          setFlippedIndices([]);
          setIsComparing(false);
        } else {
          // No match — flip back after 1 second
          compareTimeoutRef.current = setTimeout(() => {
            const resetCards = [...newCards];
            resetCards[firstIdx] = { ...resetCards[firstIdx], flipped: false };
            resetCards[secondIdx] = {
              ...resetCards[secondIdx],
              flipped: false,
            };
            setCards(resetCards);
            setFlippedIndices([]);
            setIsComparing(false);
          }, 1000);
        }
      }
    },
    [cards, flippedIndices, gameState, isComparing]
  );

  // -----------------------------------------------------------------------
  // Render: IDLE
  // -----------------------------------------------------------------------
  if (gameState === "idle") {
    const hasCooldown = cooldownLeft > 0;
    const cooldownSec = Math.ceil(cooldownLeft / 1000);

    return (
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div className="mb-4">
          <Link
            href="/games"
            className="text-sm"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            &larr; К играм
          </Link>
        </div>

        <Card>
          <div className="flex flex-col items-center text-center py-6 px-4">
            <div
              className="text-4xl mb-4"
              style={{ lineHeight: 1 }}
            >
              🎯
            </div>
            <h1
              className="text-xl font-semibold mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              Токен Охотник
            </h1>
            <p
              className="text-sm mb-6"
              style={{
                color: "var(--color-text-secondary)",
                maxWidth: 440,
              }}
            >
              Найдите пары: AI-термин и его определение на русском языке.
              Переворачивайте карточки и ищите совпадения. Чем меньше попыток
              — тем больше IB-Coins!
            </p>

            <div
              className="w-full rounded-lg p-4 mb-6"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <h2
                className="text-sm font-medium mb-3"
                style={{ color: "var(--color-text-primary)" }}
              >
                Правила
              </h2>
              <ul
                className="text-xs text-left space-y-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <li>
                  <span style={{ color: "var(--color-coin-gold)" }}>1.</span>{" "}
                  На поле 16 карточек (8 пар): термин + определение
                </li>
                <li>
                  <span style={{ color: "var(--color-coin-gold)" }}>2.</span>{" "}
                  Переворачивайте по 2 карточки за ход
                </li>
                <li>
                  <span style={{ color: "var(--color-coin-gold)" }}>3.</span>{" "}
                  Если пара совпала — карточки остаются открытыми
                </li>
                <li>
                  <span style={{ color: "var(--color-coin-gold)" }}>4.</span>{" "}
                  Ограничение по времени: 2 минуты
                </li>
                <li>
                  <span style={{ color: "var(--color-coin-gold)" }}>5.</span>{" "}
                  Награда зависит от количества попыток: меньше = лучше
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span
                className="text-xs"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Награда:
              </span>
              <CoinBadge amount={5} size="md" />
            </div>

            {hasCooldown ? (
              <div className="flex flex-col items-center gap-2">
                <Button variant="default" size="lg" disabled>
                  Перерыв
                </Button>
                <span
                  className="text-xs tabular-nums"
                  style={{
                    color: "var(--color-text-tertiary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Повторная игра через {formatTime(cooldownSec)}
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

  // -----------------------------------------------------------------------
  // Render: PLAYING
  // -----------------------------------------------------------------------
  if (gameState === "playing") {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Header */}
        <div
          className="flex items-center justify-between mb-4"
          style={{ gap: 12 }}
        >
          <h1
            className="text-lg font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Токен Охотник
          </h1>
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-md"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <span
                className="text-xs"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Время:
              </span>
              <span
                className="text-sm font-medium tabular-nums"
                style={{
                  color:
                    timeLeft <= 30
                      ? "var(--color-status-error)"
                      : "var(--color-text-primary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
            {/* Attempts */}
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-md"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <span
                className="text-xs"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Попытки:
              </span>
              <span
                className="text-sm font-medium tabular-nums"
                style={{
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {attempts}
              </span>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-4">
          <div
            className="flex items-center justify-between mb-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <span className="text-xs">
              Найдено пар: {matchedPairs}/{TOTAL_PAIRS}
            </span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--color-bg-tertiary)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${(matchedPairs / TOTAL_PAIRS) * 100}%`,
                backgroundColor: "var(--color-coin-gold)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* 4x4 Card Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
          }}
        >
          {cards.map((card, index) => {
            const isFlipped = card.flipped || card.matched;
            const isMatched = card.matched;

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                disabled={isFlipped || isComparing}
                style={{
                  position: "relative",
                  aspectRatio: "1 / 1.15",
                  borderRadius: 10,
                  border: `2px solid ${
                    isMatched
                      ? "var(--color-status-success)"
                      : isFlipped
                      ? "var(--color-coin-gold)"
                      : "var(--color-border-subtle)"
                  }`,
                  backgroundColor: isFlipped
                    ? "var(--color-bg-tertiary)"
                    : "var(--color-bg-elevated)",
                  boxShadow: isMatched
                    ? "0 0 12px rgba(62, 207, 113, 0.25), inset 0 0 8px rgba(62, 207, 113, 0.08)"
                    : isFlipped
                    ? "0 0 10px var(--color-coin-gold-glow)"
                    : "none",
                  cursor: isFlipped || isComparing ? "default" : "pointer",
                  transition: "all 0.3s var(--ease-out)",
                  transform: isFlipped ? "rotateY(0deg)" : "rotateY(0deg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 6,
                  outline: "none",
                }}
                aria-label={
                  isFlipped
                    ? card.text
                    : "Закрытая карточка"
                }
              >
                {isFlipped ? (
                  <span
                    style={{
                      color: isMatched
                        ? "var(--color-status-success)"
                        : card.side === "term"
                        ? "var(--color-coin-gold)"
                        : "var(--color-text-primary)",
                      fontSize: card.text.length > 16 ? 11 : 13,
                      fontWeight: card.side === "term" ? 600 : 400,
                      textAlign: "center",
                      lineHeight: 1.3,
                      wordBreak: "break-word",
                      fontFamily:
                        card.side === "term"
                          ? "var(--font-mono)"
                          : "var(--font-body)",
                    }}
                  >
                    {card.text}
                  </span>
                ) : (
                  <span
                    style={{
                      color: "var(--color-text-tertiary)",
                      fontSize: 24,
                      fontWeight: 700,
                      userSelect: "none",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    ?
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render: FINISHED
  // -----------------------------------------------------------------------
  const qualityScore =
    matchedPairs === 0
      ? 0
      : Math.max(0, 1 - (attempts - TOTAL_PAIRS) / 16) *
        (matchedPairs / TOTAL_PAIRS);
  const allFound = matchedPairs === TOTAL_PAIRS;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <Card>
        <div className="flex flex-col items-center text-center py-6 px-4">
          <div className="text-4xl mb-3" style={{ lineHeight: 1 }}>
            {allFound ? "🏆" : "⏱️"}
          </div>
          <h1
            className="text-xl font-semibold mb-1"
            style={{ color: "var(--color-text-primary)" }}
          >
            {allFound ? "Отлично!" : "Время вышло!"}
          </h1>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {allFound
              ? "Вы нашли все пары. Отличная память!"
              : "Не удалось найти все пары за отведённое время."}
          </p>

          {/* Stats */}
          <div
            className="w-full rounded-lg p-4 mb-6"
            style={{
              backgroundColor: "var(--color-bg-tertiary)",
              border: "1px solid var(--color-border-subtle)",
            }}
          >
            <div className="grid grid-cols-3 gap-4">
              {/* Pairs found */}
              <div className="flex flex-col items-center">
                <span
                  className="text-xs mb-1"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Найдено пар
                </span>
                <span
                  className="text-xl font-bold tabular-nums"
                  style={{
                    color:
                      allFound
                        ? "var(--color-status-success)"
                        : "var(--color-text-primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {matchedPairs}/{TOTAL_PAIRS}
                </span>
              </div>
              {/* Attempts */}
              <div className="flex flex-col items-center">
                <span
                  className="text-xs mb-1"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Попытки
                </span>
                <span
                  className="text-xl font-bold tabular-nums"
                  style={{
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {attempts}
                </span>
              </div>
              {/* Quality */}
              <div className="flex flex-col items-center">
                <span
                  className="text-xs mb-1"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Качество
                </span>
                <span
                  className="text-xl font-bold tabular-nums"
                  style={{
                    color: "var(--color-coin-gold)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {Math.round(qualityScore * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Coins earned */}
          <div
            className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg"
            style={{
              backgroundColor: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border-subtle)",
              boxShadow: coinsEarned > 0 ? "0 0 16px var(--color-coin-gold-glow)" : "none",
            }}
          >
            {isClaimingReward ? (
              <span
                className="text-sm"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Начисление монет...
              </span>
            ) : (
              <>
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Заработано:
                </span>
                <CoinBadge amount={coinsEarned} size="lg" />
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/games">
              <Button variant="default" size="md">
                &larr; К играм
              </Button>
            </Link>
            <Button
              variant="primary"
              size="md"
              onClick={startGame}
              disabled={getCooldownRemaining() > 0}
            >
              Играть ещё
            </Button>
          </div>

          {getCooldownRemaining() > 0 && (
            <span
              className="text-xs mt-3 tabular-nums"
              style={{
                color: "var(--color-text-tertiary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Повторная игра через{" "}
              {formatTime(Math.ceil(getCooldownRemaining() / 1000))}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}
