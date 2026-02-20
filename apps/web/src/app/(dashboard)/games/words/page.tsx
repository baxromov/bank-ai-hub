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

interface WordEntry {
  word: string;
  hint: string;
}

type GameState = "idle" | "playing" | "finished";

// ---------------------------------------------------------------------------
// Word bank (30+ AI & banking terms in Russian)
// ---------------------------------------------------------------------------

const WORD_BANK: WordEntry[] = [
  { word: "НЕЙРОСЕТЬ", hint: "Вычислительная модель, имитирующая работу мозга" },
  { word: "ПРОМПТ", hint: "Текстовый запрос к языковой модели" },
  { word: "ЭМБЕДДИНГ", hint: "Векторное представление слова или текста в числовом пространстве" },
  { word: "ТОКЕНИЗАЦИЯ", hint: "Разбиение текста на минимальные смысловые единицы" },
  { word: "ДЕПОЗИТ", hint: "Банковский вклад под процент на определённый срок" },
  { word: "КРЕДИТ", hint: "Денежные средства, предоставленные заёмщику на условиях возврата" },
  { word: "ТРАНСФОРМЕР", hint: "Архитектура нейросети с механизмом внимания" },
  { word: "КЛАССИФИКАЦИЯ", hint: "Задача отнесения объекта к одной из заранее известных категорий" },
  { word: "ГЕНЕРАЦИЯ", hint: "Процесс создания нового контента моделью" },
  { word: "ВАЛИДАЦИЯ", hint: "Проверка корректности данных или модели на контрольной выборке" },
  { word: "АЛГОРИТМ", hint: "Конечная последовательность шагов для решения задачи" },
  { word: "ДАТАСЕТ", hint: "Набор структурированных данных для обучения модели" },
  { word: "ГИПЕРПАРАМЕТР", hint: "Настройка модели, задаваемая до начала обучения" },
  { word: "ЛИКВИДНОСТЬ", hint: "Способность актива быстро конвертироваться в деньги" },
  { word: "СКОРИНГ", hint: "Система оценки кредитоспособности заёмщика" },
  { word: "РЕГРЕССИЯ", hint: "Задача предсказания непрерывного числового значения" },
  { word: "КЛАСТЕРИЗАЦИЯ", hint: "Группировка объектов по схожим признакам без учителя" },
  { word: "ИНФЕРЕНС", hint: "Процесс получения предсказания от обученной модели" },
  { word: "КАПИТАЛ", hint: "Собственные средства банка для обеспечения его деятельности" },
  { word: "ТРАНЗАКЦИЯ", hint: "Операция перевода средств между счетами" },
  { word: "БЛОКЧЕЙН", hint: "Распределённый реестр с цепочкой связанных блоков данных" },
  { word: "ОПТИМИЗАЦИЯ", hint: "Процесс настройки параметров для минимизации функции потерь" },
  { word: "АТТЕНЦИЯ", hint: "Механизм внимания, выделяющий важные части входных данных" },
  { word: "ЭМИССИЯ", hint: "Выпуск денежных средств или ценных бумаг в обращение" },
  { word: "СЕГМЕНТАЦИЯ", hint: "Разделение клиентской базы на группы по характеристикам" },
  { word: "КОНВЕРСИЯ", hint: "Превращение потенциального клиента в реального" },
  { word: "ФАЙНТЮНИНГ", hint: "Дообучение предобученной модели на специализированных данных" },
  { word: "АУДИТ", hint: "Независимая проверка финансовой отчётности организации" },
  { word: "КОМПЛАЕНС", hint: "Соответствие деятельности банка нормативным требованиям" },
  { word: "ДЕРИВАТИВЫ", hint: "Производные финансовые инструменты, привязанные к базовому активу" },
  { word: "РЕТРИЕВАЛ", hint: "Поиск и извлечение релевантной информации из базы знаний" },
  { word: "ДИФФУЗИЯ", hint: "Метод генеративных моделей на основе постепенного удаления шума" },
  { word: "РЕКУРРЕНТ", hint: "Тип нейросети с обратной связью для обработки последовательностей" },
  { word: "ИПОТЕКА", hint: "Долгосрочный кредит под залог приобретаемой недвижимости" },
  { word: "ЭКВАЙРИНГ", hint: "Приём безналичных платежей по банковским картам" },
];

const WORDS_PER_ROUND = 10;
const TIME_PER_WORD = 20; // seconds
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const COOLDOWN_KEY = "game_words_last_play";

// ---------------------------------------------------------------------------
// Fisher-Yates shuffle for characters — guarantees result != original
// ---------------------------------------------------------------------------

function scrambleWord(word: string): string {
  const chars = word.split("");
  let scrambled: string[];
  let attempts = 0;

  do {
    scrambled = [...chars];
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    attempts++;
    // Safety: after many attempts for short words, force a different order
    if (attempts > 50) {
      scrambled = [...chars].reverse();
      if (scrambled.join("") === word) {
        // Edge case: palindrome — swap first two chars
        [scrambled[0], scrambled[1]] = [scrambled[1], scrambled[0]];
      }
      break;
    }
  } while (scrambled.join("") === word);

  return scrambled.join("");
}

// ---------------------------------------------------------------------------
// Pick N random words from bank
// ---------------------------------------------------------------------------

function pickRandomWords(count: number): WordEntry[] {
  const shuffled = [...WORD_BANK];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

// ---------------------------------------------------------------------------
// Format mm:ss
// ---------------------------------------------------------------------------

function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function WordsGamePage() {
  const [gameState, setGameState] = useState<GameState>("idle");

  // Round state
  const [words, setWords] = useState<WordEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [input, setInput] = useState("");
  const [correctCount, setCorrectCount] = useState(0);

  // Timer
  const [timeLeft, setTimeLeft] = useState(TIME_PER_WORD);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Visual feedback
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [revealWord, setRevealWord] = useState<string | null>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cooldown
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Results
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Input ref for auto-focus
  const inputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------------------
  // Cooldown logic
  // -------------------------------------------------------------------------

  const checkCooldown = useCallback(() => {
    const lastPlay = localStorage.getItem(COOLDOWN_KEY);
    if (!lastPlay) return 0;
    const elapsed = Date.now() - parseInt(lastPlay, 10);
    return Math.max(0, COOLDOWN_MS - elapsed);
  }, []);

  useEffect(() => {
    const remaining = checkCooldown();
    setCooldownRemaining(remaining);

    if (remaining > 0) {
      cooldownTimerRef.current = setInterval(() => {
        const r = checkCooldown();
        setCooldownRemaining(r);
        if (r <= 0 && cooldownTimerRef.current) {
          clearInterval(cooldownTimerRef.current);
          cooldownTimerRef.current = null;
        }
      }, 1000);
    }

    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, [checkCooldown, gameState]);

  // -------------------------------------------------------------------------
  // Cleanup timers on unmount
  // -------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  // -------------------------------------------------------------------------
  // Start a new word timer
  // -------------------------------------------------------------------------

  const startWordTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(TIME_PER_WORD);

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = TIME_PER_WORD - elapsed;
      if (remaining <= 0) {
        setTimeLeft(0);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setTimeLeft(remaining);
      }
    }, 100);
  }, []);

  // -------------------------------------------------------------------------
  // Advance to next word or finish
  // -------------------------------------------------------------------------

  const advanceToNext = useCallback(
    (updatedCorrectCount: number, updatedIndex: number) => {
      if (updatedIndex + 1 >= WORDS_PER_ROUND) {
        // Game finished
        if (timerRef.current) clearInterval(timerRef.current);
        setGameState("finished");

        // Set cooldown
        localStorage.setItem(COOLDOWN_KEY, Date.now().toString());

        // Claim reward
        const qualityScore = updatedCorrectCount / WORDS_PER_ROUND;
        gamesApi
          .claimReward(
            `AI Слова: ${updatedCorrectCount}/${WORDS_PER_ROUND} правильных`,
            qualityScore
          )
          .then((res) => {
            setCoinsEarned(res.earned);
          })
          .catch(() => {
            setClaimError("Не удалось начислить монеты");
          });
      } else {
        // Next word
        const nextIndex = updatedIndex + 1;
        setCurrentIndex(nextIndex);
        setInput("");
        setFeedback(null);
        setRevealWord(null);
        setScrambled(scrambleWord(words[nextIndex].word));
        startWordTimer();
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [words, startWordTimer]
  );

  // -------------------------------------------------------------------------
  // Handle timeout
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft > 0) return;
    if (feedback) return; // Already processing feedback

    // Timeout — show correct word and advance
    if (timerRef.current) clearInterval(timerRef.current);
    setFeedback("wrong");
    setRevealWord(words[currentIndex].word);

    advanceTimeoutRef.current = setTimeout(() => {
      advanceToNext(correctCount, currentIndex);
    }, 1500);
  }, [timeLeft, gameState, feedback, words, currentIndex, correctCount, advanceToNext]);

  // -------------------------------------------------------------------------
  // Start game
  // -------------------------------------------------------------------------

  const startGame = useCallback(() => {
    const selected = pickRandomWords(WORDS_PER_ROUND);
    setWords(selected);
    setCurrentIndex(0);
    setCorrectCount(0);
    setInput("");
    setFeedback(null);
    setRevealWord(null);
    setCoinsEarned(0);
    setClaimError(null);
    setScrambled(scrambleWord(selected[0].word));
    setGameState("playing");
    startWordTimer();
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [startWordTimer]);

  // -------------------------------------------------------------------------
  // Submit answer
  // -------------------------------------------------------------------------

  const submitAnswer = useCallback(() => {
    if (gameState !== "playing" || feedback) return;

    const trimmed = input.trim().toUpperCase();
    const correct = trimmed === words[currentIndex].word;

    if (timerRef.current) clearInterval(timerRef.current);

    const newCorrectCount = correct ? correctCount + 1 : correctCount;

    if (correct) {
      setCorrectCount(newCorrectCount);
      setFeedback("correct");
      advanceTimeoutRef.current = setTimeout(() => {
        advanceToNext(newCorrectCount, currentIndex);
      }, 800);
    } else {
      setFeedback("wrong");
      setRevealWord(words[currentIndex].word);
      advanceTimeoutRef.current = setTimeout(() => {
        advanceToNext(newCorrectCount, currentIndex);
      }, 1500);
    }
  }, [gameState, feedback, input, words, currentIndex, correctCount, advanceToNext]);

  // -------------------------------------------------------------------------
  // Key handler (Enter to submit)
  // -------------------------------------------------------------------------

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitAnswer();
      }
    },
    [submitAnswer]
  );

  // -------------------------------------------------------------------------
  // Timer bar percentage
  // -------------------------------------------------------------------------

  const timerPercent = (timeLeft / TIME_PER_WORD) * 100;

  const timerBarColor =
    timeLeft <= 5
      ? "var(--color-status-error)"
      : timeLeft <= 10
        ? "var(--color-coin-gold)"
        : "var(--color-status-success)";

  // =========================================================================
  // RENDER
  // =========================================================================

  // ---- IDLE STATE ----
  if (gameState === "idle") {
    const hasCooldown = cooldownRemaining > 0;

    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div className="mb-6">
          <Link
            href="/games"
            className="text-xs inline-flex items-center gap-1"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            &larr; К играм
          </Link>
        </div>

        <Card>
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="text-4xl">🔤</div>

            <h1
              className="text-xl font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              AI Слова
            </h1>

            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)", maxWidth: 420 }}
            >
              Вам будут показаны 10 перемешанных слов из мира AI и банковских
              технологий. Разгадайте анаграмму, используя подсказку. На каждое
              слово даётся 20 секунд.
            </p>

            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <span>Награда:</span>
              <CoinBadge amount={5} showSign />
            </div>

            <div
              className="text-xs"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Перерыв между играми: 5 минут
            </div>

            {hasCooldown ? (
              <div className="flex flex-col items-center gap-2 mt-2">
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Следующая игра через
                </span>
                <span
                  className="text-lg font-bold tabular-nums"
                  style={{
                    color: "var(--color-coin-gold)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {formatTime(cooldownRemaining)}
                </span>
              </div>
            ) : (
              <Button variant="primary" size="lg" onClick={startGame} className="mt-2">
                Начать
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // ---- PLAYING STATE ----
  if (gameState === "playing") {
    const currentWord = words[currentIndex];
    const scrambledChars = scrambled.split("");

    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Header: progress + timer */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Слово{" "}
            <span
              style={{
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {currentIndex + 1}
            </span>
            <span style={{ color: "var(--color-text-tertiary)" }}>
              /{WORDS_PER_ROUND}
            </span>
          </span>

          <span
            className="text-sm font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Верно:{" "}
            <span
              style={{
                color: "var(--color-coin-gold)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {correctCount}
            </span>
          </span>
        </div>

        {/* Timer bar */}
        <div
          style={{
            width: "100%",
            height: 6,
            borderRadius: 3,
            backgroundColor: "var(--color-bg-tertiary)",
            marginBottom: 24,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${timerPercent}%`,
              height: "100%",
              borderRadius: 3,
              backgroundColor: timerBarColor,
              transition: "width 0.1s linear, background-color 0.3s ease",
            }}
          />
        </div>

        {/* Timer text */}
        <div className="text-center mb-4">
          <span
            className="text-sm tabular-nums"
            style={{
              color: timeLeft <= 5 ? "var(--color-status-error)" : "var(--color-text-tertiary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {Math.ceil(timeLeft)} сек
          </span>
        </div>

        {/* Card with scrambled word */}
        <Card
          glow={feedback === "correct"}
          style={
            feedback === "correct"
              ? { borderColor: "var(--color-status-success)" }
              : feedback === "wrong"
                ? { borderColor: "var(--color-status-error)" }
                : undefined
          }
        >
          <div className="flex flex-col items-center gap-5 py-4">
            {/* Scrambled letter tiles */}
            <div className="flex flex-wrap justify-center gap-2">
              {scrambledChars.map((char, i) => (
                <div
                  key={`${currentIndex}-${i}`}
                  style={{
                    width: 44,
                    height: 52,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: 8,
                    fontFamily: "var(--font-mono)",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    userSelect: "none",
                  }}
                >
                  {char}
                </div>
              ))}
            </div>

            {/* Hint */}
            <p
              className="text-sm text-center"
              style={{
                color: "var(--color-text-tertiary)",
                maxWidth: 400,
                lineHeight: 1.5,
              }}
            >
              {currentWord.hint}
            </p>

            {/* Feedback messages */}
            {feedback === "correct" && (
              <div
                className="text-sm font-medium"
                style={{ color: "var(--color-status-success)" }}
              >
                Правильно!
              </div>
            )}

            {feedback === "wrong" && revealWord && (
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--color-status-error)" }}
                >
                  {timeLeft <= 0 ? "Время вышло!" : "Неправильно!"}
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Ответ:{" "}
                  <span
                    style={{
                      color: "var(--color-coin-gold-bright)",
                      fontWeight: 600,
                    }}
                  >
                    {revealWord}
                  </span>
                </span>
              </div>
            )}

            {/* Input + submit */}
            {!feedback && (
              <div className="flex gap-2 w-full" style={{ maxWidth: 360 }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  placeholder="Введите слово..."
                  autoComplete="off"
                  spellCheck={false}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 8,
                    border: "1px solid var(--color-border-strong)",
                    backgroundColor: "var(--color-bg-elevated)",
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 14,
                    fontWeight: 600,
                    padding: "0 12px",
                    outline: "none",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                />
                <Button
                  variant="primary"
                  size="md"
                  onClick={submitAnswer}
                  disabled={input.trim().length === 0}
                >
                  Проверить
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // ---- FINISHED STATE ----
  const qualityScore = correctCount / WORDS_PER_ROUND;
  const percentage = Math.round(qualityScore * 100);

  let resultMessage: string;
  if (correctCount === WORDS_PER_ROUND) {
    resultMessage = "Превосходно! Все слова разгаданы!";
  } else if (correctCount >= 7) {
    resultMessage = "Отличный результат!";
  } else if (correctCount >= 5) {
    resultMessage = "Хороший результат!";
  } else if (correctCount >= 3) {
    resultMessage = "Неплохо, но можно лучше!";
  } else {
    resultMessage = "Попробуйте ещё раз!";
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <Card glow={correctCount >= 7}>
        <div className="flex flex-col items-center text-center gap-4 py-6">
          <div className="text-4xl">
            {correctCount === WORDS_PER_ROUND
              ? "🏆"
              : correctCount >= 7
                ? "🎉"
                : correctCount >= 5
                  ? "👍"
                  : "💪"}
          </div>

          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Игра завершена!
          </h2>

          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {resultMessage}
          </p>

          {/* Score display */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 4,
              fontFamily: "var(--font-mono)",
            }}
          >
            <span
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: "var(--color-coin-gold-bright)",
                lineHeight: 1,
              }}
            >
              {correctCount}
            </span>
            <span
              style={{
                fontSize: 20,
                color: "var(--color-text-tertiary)",
                fontWeight: 500,
              }}
            >
              /{WORDS_PER_ROUND}
            </span>
          </div>

          <span
            className="text-xs tabular-nums"
            style={{
              color: "var(--color-text-tertiary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {percentage}% правильных
          </span>

          {/* Coins earned */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "12px 24px",
              borderRadius: 12,
              backgroundColor: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border-subtle)",
            }}
          >
            <span
              className="text-xs"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Награда
            </span>
            {claimError ? (
              <span
                className="text-xs"
                style={{ color: "var(--color-status-error)" }}
              >
                {claimError}
              </span>
            ) : coinsEarned > 0 ? (
              <CoinBadge amount={coinsEarned} showSign size="lg" />
            ) : (
              <span
                className="text-xs"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Начисление...
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            <Link href="/games">
              <Button variant="ghost" size="md">
                &larr; К играм
              </Button>
            </Link>
            <Button variant="primary" size="md" onClick={startGame}>
              Играть ещё
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
