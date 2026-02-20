"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CoinBadge } from "@/components/coins/CoinBadge";
import { gamesApi } from "@/api-client";

// ---------------------------------------------------------------------------
// Term bank (40+ entries)
// ---------------------------------------------------------------------------

type Category = "AI" | "Банкинг";

interface Term {
  word: string;
  category: Category;
}

const TERM_BANK: Term[] = [
  // AI terms (20)
  { word: "НЕЙРОСЕТЬ", category: "AI" },
  { word: "ТРАНСФОРМЕР", category: "AI" },
  { word: "ЭМБЕДДИНГ", category: "AI" },
  { word: "ТОКЕНИЗАЦИЯ", category: "AI" },
  { word: "ПРОМПТ", category: "AI" },
  { word: "БЭКПРОПАГАЦИЯ", category: "AI" },
  { word: "ДАТАСЕТ", category: "AI" },
  { word: "ГИПЕРПАРАМЕТР", category: "AI" },
  { word: "ГЕНЕРАЦИЯ", category: "AI" },
  { word: "КЛАССИФИКАТОР", category: "AI" },
  { word: "ДООБУЧЕНИЕ", category: "AI" },
  { word: "ГАЛЛЮЦИНАЦИЯ", category: "AI" },
  { word: "ВНИМАНИЕ (Attention)", category: "AI" },
  { word: "КЛАСТЕРИЗАЦИЯ", category: "AI" },
  { word: "СЕГМЕНТАЦИЯ", category: "AI" },
  { word: "ПРЕДОБУЧЕНИЕ", category: "AI" },
  { word: "ИНФЕРЕНС", category: "AI" },
  { word: "ДИСТИЛЛЯЦИЯ", category: "AI" },
  { word: "РЕКУРРЕНТНАЯ СЕТЬ", category: "AI" },
  { word: "СВЁРТОЧНАЯ СЕТЬ", category: "AI" },
  // Banking terms (20)
  { word: "ДЕПОЗИТ", category: "Банкинг" },
  { word: "КРЕДИТ", category: "Банкинг" },
  { word: "ИПОТЕКА", category: "Банкинг" },
  { word: "ПРОЦЕНТНАЯ СТАВКА", category: "Банкинг" },
  { word: "ОВЕРДРАФТ", category: "Банкинг" },
  { word: "ЭМИТЕНТ", category: "Банкинг" },
  { word: "ВАЛЮТА", category: "Банкинг" },
  { word: "ЛИКВИДНОСТЬ", category: "Банкинг" },
  { word: "КАПИТАЛИЗАЦИЯ", category: "Банкинг" },
  { word: "ЗАЛОГ", category: "Банкинг" },
  { word: "АННУИТЕТ", category: "Банкинг" },
  { word: "ДИВИДЕНДЫ", category: "Банкинг" },
  { word: "ОБЛИГАЦИЯ", category: "Банкинг" },
  { word: "ПОРТФЕЛЬ", category: "Банкинг" },
  { word: "СКОРИНГ", category: "Банкинг" },
  { word: "ТРАНЗАКЦИЯ", category: "Банкинг" },
  { word: "РЕЗЕРВИРОВАНИЕ", category: "Банкинг" },
  { word: "ДИВЕРСИФИКАЦИЯ", category: "Банкинг" },
  { word: "РЕФИНАНСИРОВАНИЕ", category: "Банкинг" },
  { word: "АМОРТИЗАЦИЯ", category: "Банкинг" },
];

const TERMS_PER_ROUND = 20;
const TIME_PER_TERM_MS = 5000;
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const LS_KEY = "game_classifier_last_play";

type GameState = "idle" | "playing" | "finished";

// ---------------------------------------------------------------------------
// Fisher-Yates shuffle
// ---------------------------------------------------------------------------
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ClassifierPage() {
  // -- game state -----------------------------------------------------------
  const [gameState, setGameState] = useState<GameState>("idle");
  const [terms, setTerms] = useState<Term[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>([]);

  // -- timer state ----------------------------------------------------------
  const [timeLeft, setTimeLeft] = useState(TIME_PER_TERM_MS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // -- feedback flash -------------------------------------------------------
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);

  // -- cooldown -------------------------------------------------------------
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // -- finished state -------------------------------------------------------
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  // -------------------------------------------------------------------------
  // Cooldown check
  // -------------------------------------------------------------------------
  useEffect(() => {
    function checkCooldown() {
      const lastPlay = localStorage.getItem(LS_KEY);
      if (!lastPlay) {
        setCooldownRemaining(0);
        return;
      }
      const elapsed = Date.now() - parseInt(lastPlay, 10);
      const remaining = COOLDOWN_MS - elapsed;
      setCooldownRemaining(remaining > 0 ? remaining : 0);
    }

    checkCooldown();
    const id = setInterval(checkCooldown, 1000);
    return () => clearInterval(id);
  }, [gameState]);

  // -------------------------------------------------------------------------
  // Timer logic
  // -------------------------------------------------------------------------
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    startTimeRef.current = Date.now();
    setTimeLeft(TIME_PER_TERM_MS);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = TIME_PER_TERM_MS - elapsed;
      if (remaining <= 0) {
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
      }
    }, 50);
  }, [stopTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // -------------------------------------------------------------------------
  // Advance to next term (or finish)
  // -------------------------------------------------------------------------
  const advanceTerm = useCallback(
    (wasCorrect: boolean | null) => {
      stopTimer();

      setAnswers((prev) => {
        const copy = [...prev];
        copy[currentIndex] = wasCorrect;
        return copy;
      });

      if (wasCorrect === true) {
        setCorrectCount((c) => c + 1);
      }

      const nextIndex = currentIndex + 1;
      if (nextIndex >= TERMS_PER_ROUND) {
        // Game over -- we compute the final score using the updated correct count
        setGameState("finished");
      } else {
        setCurrentIndex(nextIndex);
        startTimer();
      }
    },
    [currentIndex, stopTimer, startTimer]
  );

  // -------------------------------------------------------------------------
  // Handle timeout (timeLeft reached 0 while playing)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (gameState === "playing" && timeLeft <= 0) {
      // Flash wrong and advance
      setFlash("wrong");
      setTimeout(() => setFlash(null), 300);
      advanceTerm(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, gameState]);

  // -------------------------------------------------------------------------
  // Claim reward when game finishes
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (gameState !== "finished") return;

    // Save cooldown timestamp
    localStorage.setItem(LS_KEY, Date.now().toString());

    // Calculate final correct count from answers
    const finalCorrect = answers.filter((a) => a === true).length + (
      // The last answer might not be in the answers array yet,
      // but we already incremented correctCount synchronously
      0
    );
    void (finalCorrect); // use correctCount state which was updated synchronously

    const qualityScore = correctCount / TERMS_PER_ROUND;

    setClaiming(true);
    setClaimError(null);

    gamesApi
      .claimReward(
        `Быстрый Классификатор: ${correctCount}/${TERMS_PER_ROUND} правильных`,
        qualityScore
      )
      .then((res) => {
        setCoinsEarned(res.earned);
      })
      .catch((err) => {
        setClaimError(err instanceof Error ? err.message : "Ошибка начисления");
      })
      .finally(() => {
        setClaiming(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // -------------------------------------------------------------------------
  // Start game
  // -------------------------------------------------------------------------
  function startGame() {
    const selected = shuffle(TERM_BANK).slice(0, TERMS_PER_ROUND);
    setTerms(selected);
    setCurrentIndex(0);
    setCorrectCount(0);
    setAnswers([]);
    setCoinsEarned(0);
    setClaimError(null);
    setFlash(null);
    setGameState("playing");
    startTimeRef.current = Date.now();
    setTimeLeft(TIME_PER_TERM_MS);

    // Start the timer in the next tick so state is settled
    setTimeout(() => {
      startTimeRef.current = Date.now();
      setTimeLeft(TIME_PER_TERM_MS);
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = TIME_PER_TERM_MS - elapsed;
        if (remaining <= 0) {
          setTimeLeft(0);
        } else {
          setTimeLeft(remaining);
        }
      }, 50);
    }, 0);
  }

  // -------------------------------------------------------------------------
  // Handle player answer
  // -------------------------------------------------------------------------
  function handleAnswer(chosen: Category) {
    if (gameState !== "playing") return;

    const currentTerm = terms[currentIndex];
    const isCorrect = currentTerm.category === chosen;

    setFlash(isCorrect ? "correct" : "wrong");
    setTimeout(() => setFlash(null), 300);

    advanceTerm(isCorrect);
  }

  // -------------------------------------------------------------------------
  // Format cooldown
  // -------------------------------------------------------------------------
  function formatCooldown(ms: number): string {
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  // -------------------------------------------------------------------------
  // Timer bar width percentage
  // -------------------------------------------------------------------------
  const timerPercent = Math.max(0, (timeLeft / TIME_PER_TERM_MS) * 100);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  // === IDLE STATE ==========================================================
  if (gameState === "idle") {
    const isOnCooldown = cooldownRemaining > 0;

    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ marginBottom: 16 }}>
          <Link
            href="/games"
            style={{
              color: "var(--color-text-tertiary)",
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            ← К играм
          </Link>
        </div>

        <Card>
          <div style={{ textAlign: "center", padding: "24px 16px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <h1
              style={{
                color: "var(--color-text-primary)",
                fontSize: 22,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Быстрый Классификатор
            </h1>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 24,
                maxWidth: 420,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Вам будет показано 20 терминов. Для каждого определите категорию:
              <strong style={{ color: "var(--color-text-primary)" }}> AI </strong>
              или
              <strong style={{ color: "var(--color-text-primary)" }}> Банкинг</strong>.
              У вас 5 секунд на каждый термин.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
                marginBottom: 28,
                padding: "16px",
                backgroundColor: "var(--color-bg-tertiary)",
                borderRadius: 8,
              }}
            >
              <div>
                <div
                  style={{
                    color: "var(--color-text-tertiary)",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 4,
                  }}
                >
                  Терминов
                </div>
                <div
                  style={{
                    color: "var(--color-text-primary)",
                    fontSize: 20,
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  20
                </div>
              </div>
              <div>
                <div
                  style={{
                    color: "var(--color-text-tertiary)",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 4,
                  }}
                >
                  Секунд
                </div>
                <div
                  style={{
                    color: "var(--color-text-primary)",
                    fontSize: 20,
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  5
                </div>
              </div>
              <div>
                <div
                  style={{
                    color: "var(--color-text-tertiary)",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 4,
                  }}
                >
                  Награда
                </div>
                <div
                  style={{
                    color: "var(--color-coin-gold)",
                    fontSize: 20,
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  5 IB
                </div>
              </div>
            </div>

            {isOnCooldown ? (
              <div>
                <div
                  style={{
                    color: "var(--color-text-tertiary)",
                    fontSize: 13,
                    marginBottom: 8,
                  }}
                >
                  Следующая игра доступна через
                </div>
                <div
                  style={{
                    color: "var(--color-coin-gold)",
                    fontSize: 28,
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {formatCooldown(cooldownRemaining)}
                </div>
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={startGame}
                style={{ minWidth: 180, fontSize: 15, height: 44 }}
              >
                Начать
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // === PLAYING STATE =======================================================
  if (gameState === "playing") {
    const currentTerm = terms[currentIndex];
    const timerColor =
      timerPercent > 40
        ? "var(--color-coin-gold)"
        : timerPercent > 20
          ? "var(--color-status-warning)"
          : "var(--color-status-error)";

    // Flash background color
    let termBg = "var(--color-bg-tertiary)";
    if (flash === "correct") termBg = "rgba(62, 207, 113, 0.15)";
    if (flash === "wrong") termBg = "rgba(229, 77, 77, 0.15)";

    let termBorder = "var(--color-border-subtle)";
    if (flash === "correct") termBorder = "var(--color-status-success)";
    if (flash === "wrong") termBorder = "var(--color-status-error)";

    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Header: progress */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              color: "var(--color-text-secondary)",
              fontSize: 13,
            }}
          >
            Термин
          </span>
          <span
            style={{
              color: "var(--color-text-primary)",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "var(--font-mono)",
            }}
          >
            {currentIndex + 1}
            <span style={{ color: "var(--color-text-tertiary)" }}>
              {" "}
              / {TERMS_PER_ROUND}
            </span>
          </span>
        </div>

        {/* Timer bar */}
        <div
          style={{
            width: "100%",
            height: 6,
            backgroundColor: "var(--color-bg-elevated)",
            borderRadius: 3,
            marginBottom: 24,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${timerPercent}%`,
              height: "100%",
              backgroundColor: timerColor,
              borderRadius: 3,
              transition: "width 100ms linear, background-color 300ms ease",
            }}
          />
        </div>

        {/* Progress dots */}
        <div
          style={{
            display: "flex",
            gap: 4,
            justifyContent: "center",
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          {Array.from({ length: TERMS_PER_ROUND }).map((_, i) => {
            let dotColor = "var(--color-bg-elevated)";
            if (i < answers.length) {
              dotColor =
                answers[i] === true
                  ? "var(--color-status-success)"
                  : "var(--color-status-error)";
            } else if (i === currentIndex) {
              dotColor = "var(--color-coin-gold)";
            }
            return (
              <div
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: dotColor,
                  transition: "background-color 200ms ease",
                }}
              />
            );
          })}
        </div>

        {/* Term display */}
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 140,
              padding: "32px 24px",
              backgroundColor: termBg,
              border: `2px solid ${termBorder}`,
              borderRadius: 10,
              transition: "background-color 150ms ease, border-color 150ms ease",
            }}
          >
            <span
              style={{
                color: "var(--color-text-primary)",
                fontSize: 26,
                fontWeight: 700,
                textAlign: "center",
                letterSpacing: "0.02em",
                lineHeight: 1.3,
              }}
            >
              {currentTerm?.word}
            </span>
          </div>
        </Card>

        {/* Answer buttons */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 20,
          }}
        >
          <button
            onClick={() => handleAnswer("AI")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "20px 16px",
              backgroundColor: "var(--color-bg-tertiary)",
              border: "2px solid var(--color-border-subtle)",
              borderRadius: 10,
              cursor: "pointer",
              transition: "all 150ms ease",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-coin-gold)";
              e.currentTarget.style.backgroundColor = "var(--color-bg-elevated)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border-subtle)";
              e.currentTarget.style.backgroundColor = "var(--color-bg-tertiary)";
            }}
          >
            <span style={{ fontSize: 32 }}>🤖</span>
            <span
              style={{
                color: "var(--color-text-primary)",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              AI
            </span>
          </button>

          <button
            onClick={() => handleAnswer("Банкинг")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "20px 16px",
              backgroundColor: "var(--color-bg-tertiary)",
              border: "2px solid var(--color-border-subtle)",
              borderRadius: 10,
              cursor: "pointer",
              transition: "all 150ms ease",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-coin-gold)";
              e.currentTarget.style.backgroundColor = "var(--color-bg-elevated)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border-subtle)";
              e.currentTarget.style.backgroundColor = "var(--color-bg-tertiary)";
            }}
          >
            <span style={{ fontSize: 32 }}>🏦</span>
            <span
              style={{
                color: "var(--color-text-primary)",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Банкинг
            </span>
          </button>
        </div>

        {/* Time remaining label */}
        <div
          style={{
            textAlign: "center",
            marginTop: 16,
            color: timerColor,
            fontSize: 14,
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            transition: "color 300ms ease",
          }}
        >
          {(timeLeft / 1000).toFixed(1)}с
        </div>
      </div>
    );
  }

  // === FINISHED STATE ======================================================
  const accuracy = Math.round((correctCount / TERMS_PER_ROUND) * 100);
  const qualityScore = correctCount / TERMS_PER_ROUND;

  // Determine performance label
  let performanceLabel: string;
  let performanceColor: string;
  if (accuracy >= 90) {
    performanceLabel = "Превосходно!";
    performanceColor = "var(--color-coin-gold)";
  } else if (accuracy >= 70) {
    performanceLabel = "Хороший результат!";
    performanceColor = "var(--color-status-success)";
  } else if (accuracy >= 50) {
    performanceLabel = "Неплохо!";
    performanceColor = "var(--color-status-warning)";
  } else {
    performanceLabel = "Попробуйте ещё раз";
    performanceColor = "var(--color-status-error)";
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <Card glow={accuracy >= 90}>
        <div style={{ textAlign: "center", padding: "24px 16px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>
            {accuracy >= 90 ? "🏆" : accuracy >= 70 ? "🎉" : accuracy >= 50 ? "👍" : "💪"}
          </div>

          <h2
            style={{
              color: performanceColor,
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            {performanceLabel}
          </h2>

          <p
            style={{
              color: "var(--color-text-tertiary)",
              fontSize: 13,
              marginBottom: 24,
            }}
          >
            Быстрый Классификатор завершён
          </p>

          {/* Score breakdown */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginBottom: 24,
              padding: "16px",
              backgroundColor: "var(--color-bg-tertiary)",
              borderRadius: 8,
            }}
          >
            <div>
              <div
                style={{
                  color: "var(--color-text-tertiary)",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 4,
                }}
              >
                Правильно
              </div>
              <div
                style={{
                  color: "var(--color-text-primary)",
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {correctCount}
                <span
                  style={{
                    color: "var(--color-text-tertiary)",
                    fontSize: 14,
                  }}
                >
                  /{TERMS_PER_ROUND}
                </span>
              </div>
            </div>

            <div>
              <div
                style={{
                  color: "var(--color-text-tertiary)",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 4,
                }}
              >
                Точность
              </div>
              <div
                style={{
                  color: accuracy >= 70 ? "var(--color-status-success)" : "var(--color-status-error)",
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {accuracy}%
              </div>
            </div>

            <div>
              <div
                style={{
                  color: "var(--color-text-tertiary)",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 4,
                }}
              >
                Монеты
              </div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                {claiming ? (
                  <span
                    style={{
                      color: "var(--color-text-tertiary)",
                      fontSize: 14,
                    }}
                  >
                    ...
                  </span>
                ) : claimError ? (
                  <span
                    style={{
                      color: "var(--color-status-error)",
                      fontSize: 12,
                    }}
                  >
                    Ошибка
                  </span>
                ) : (
                  <CoinBadge amount={coinsEarned} showSign size="lg" />
                )}
              </div>
            </div>
          </div>

          {/* Answer review - scrollable list */}
          <div
            style={{
              maxHeight: 200,
              overflowY: "auto",
              marginBottom: 24,
              borderRadius: 8,
              border: "1px solid var(--color-border-subtle)",
            }}
          >
            {terms.map((term, i) => {
              const wasCorrect = answers[i] === true;
              const wasTimeout = answers[i] === null;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderBottom:
                      i < terms.length - 1
                        ? "1px solid var(--color-border-subtle)"
                        : "none",
                    backgroundColor: "var(--color-bg-secondary)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14 }}>
                      {wasCorrect ? "✓" : wasTimeout ? "⏱" : "✗"}
                    </span>
                    <span
                      style={{
                        color: "var(--color-text-primary)",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {term.word}
                    </span>
                  </div>
                  <span
                    style={{
                      color: wasCorrect
                        ? "var(--color-status-success)"
                        : "var(--color-status-error)",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {term.category}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
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
              onClick={() => {
                setGameState("idle");
              }}
              style={{ minWidth: 150 }}
            >
              Играть ещё
            </Button>

            <Link href="/games" style={{ textDecoration: "none" }}>
              <Button variant="default" size="lg" style={{ minWidth: 150 }}>
                ← К играм
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
