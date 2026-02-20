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

interface Transaction {
  sender: string;
  receiver: string;
  amount: string;
  time: string;
  location: string;
  description: string;
  isFraud: boolean;
  explanation: string;
}

type GameState = "idle" | "playing" | "finished";

// ---------------------------------------------------------------------------
// Transaction Bank (30+ entries)
// ---------------------------------------------------------------------------

const TRANSACTION_BANK: Transaction[] = [
  // ===== FRAUDULENT TRANSACTIONS =====
  {
    sender: "Алиев Р.К.",
    receiver: "Неизвестный счёт #7734",
    amount: "45,000,000 UZS",
    time: "03:47",
    location: "Ташкент",
    description: "Перевод на неизвестный счёт глубокой ночью",
    isFraud: true,
    explanation:
      "Крупный перевод в необычное время на неизвестный счёт — типичный признак мошенничества",
  },
  {
    sender: "Каримова Д.А.",
    receiver: "Магазин электроники, Стамбул",
    amount: "12,500,000 UZS",
    time: "14:23",
    location: "Ташкент → Стамбул",
    description: "Карта использована в Ташкенте и Стамбуле в течение 1 часа",
    isFraud: true,
    explanation:
      "Физически невозможно оказаться в двух городах за 1 час — карта скомпрометирована",
  },
  {
    sender: "Юсупов М.Б.",
    receiver: "Различные счета (50 транзакций)",
    amount: "99,000 UZS x50",
    time: "11:05–11:15",
    location: "Ташкент",
    description: "50 микротранзакций по 99,000 UZS за 10 минут",
    isFraud: true,
    explanation:
      "Дробление суммы (structuring) на множество мелких переводов — попытка обойти порог мониторинга",
  },
  {
    sender: "Новый клиент (рег. вчера)",
    receiver: "Офшорный счёт, ОАЭ",
    amount: "200,000,000 UZS",
    time: "09:12",
    location: "Бухара",
    description: "Счёт открыт вчера, немедленный перевод 200 млн UZS",
    isFraud: true,
    explanation:
      "Новый счёт с немедленным крупным переводом за рубеж — высокий риск отмывания денег",
  },
  {
    sender: "ООО «ТрансКом»",
    receiver: "Банк в Северной Корее",
    amount: "85,000,000 UZS",
    time: "16:30",
    location: "Ташкент",
    description: "Перевод в страну под санкциями",
    isFraud: true,
    explanation:
      "Переводы в санкционные страны запрещены международными регуляциями и законодательством",
  },
  {
    sender: "Рахимова Г.С. (78 лет)",
    receiver: "5 разных онлайн-счетов",
    amount: "15,000,000 UZS (по 3 млн каждый)",
    time: "22:15",
    location: "Самарканд",
    description: "Пожилой клиент внезапно делает 5 онлайн-переводов вечером",
    isFraud: true,
    explanation:
      "Нетипичная активность для пожилого клиента — признак социальной инженерии или давления мошенников",
  },
  {
    sender: "Сотрудник банка Иванов П.",
    receiver: "500 клиентских счетов",
    amount: "—",
    time: "09:00–18:00",
    location: "Ташкент, головной офис",
    description: "Сотрудник получил доступ к 500 счетам клиентов за 1 день",
    isFraud: true,
    explanation:
      "Массовый доступ к счетам клиентов одним сотрудником — возможная утечка данных или инсайдерская угроза",
  },
  {
    sender: "20 разных клиентов",
    receiver: "Один и тот же счёт #4421",
    amount: "Разные суммы",
    time: "10:00–10:30",
    location: "Один IP: 192.168.44.12",
    description: "Один IP-адрес используется для входа в 20 разных аккаунтов",
    isFraud: true,
    explanation:
      "Множественные аккаунты с одного IP — признак массовой компрометации учётных записей",
  },
  {
    sender: "Ахмедов К.Р.",
    receiver: "Магазин бытовой техники",
    amount: "3,200,000 UZS",
    time: "15:45",
    location: "Навои (покупка), Дубай (клиент)",
    description: "Оплата картой в магазине, пока владелец карты за границей",
    isFraud: true,
    explanation:
      "Карта используется в физическом магазине, тогда как владелец находится за рубежом — карта украдена или клонирована",
  },
  {
    sender: "Мирзаев Ш.У.",
    receiver: "ИП «Лотос»",
    amount: "300,000,000 UZS",
    time: "08:30",
    location: "Ташкент",
    description:
      "Счёт обычно проводит 2 млн UZS в месяц, сейчас — 300 млн UZS за раз",
    isFraud: true,
    explanation:
      "Резкий скачок суммы в 150 раз от обычного оборота — аномалия, требующая проверки",
  },
  {
    sender: "Носиров Л.Д.",
    receiver: "Криптобиржа CoinEx",
    amount: "50,000,000 UZS",
    time: "04:12",
    location: "Ташкент (новое устройство)",
    description: "Перевод сразу после сброса пароля с нового устройства",
    isFraud: true,
    explanation:
      "Сброс пароля + новое устройство + немедленный крупный перевод — классическая схема захвата аккаунта",
  },
  {
    sender: "Турсунов Б.Б.",
    receiver: "Разные физ. лица (8 переводов)",
    amount: "9,900,000 UZS x8",
    time: "13:00–13:40",
    location: "Фергана",
    description:
      "Серия переводов по 9,900,000 UZS — чуть ниже порога отчётности",
    isFraud: true,
    explanation:
      "Круглые суммы чуть ниже порога обязательной отчётности (10 млн) — умышленное дробление",
  },
  {
    sender: "ООО «СтройМир»",
    receiver: "ООО «Пустышка Лтд» (нет истории)",
    amount: "120,000,000 UZS",
    time: "17:55",
    location: "Ташкент",
    description: "Оплата фиктивной компании без истории операций",
    isFraud: true,
    explanation:
      "Перевод компании-однодневке без операционной истории — признак отмывания через подставные фирмы",
  },
  {
    sender: "Неизвестная карта #9981",
    receiver: "Банкомат (снятие наличных)",
    amount: "5,000,000 UZS (4 снятия)",
    time: "02:10–02:45",
    location: "Ташкент → Нукус → Бухара → Карши",
    description: "Ночные снятия в банкоматах 4 разных городов за 35 минут",
    isFraud: true,
    explanation:
      "Снятия в 4 разных городах за 35 минут физически невозможны — используются клонированные карты",
  },
  {
    sender: "ООО «АльфаТрейд»",
    receiver: "ООО «БетаГрупп»",
    amount: "75,000,000 UZS",
    time: "11:20",
    location: "Ташкент",
    description: "Оплата по счёту-фактуре: сумма, дата и реквизиты не совпадают",
    isFraud: true,
    explanation:
      "Несовпадение деталей счёта-фактуры с платежом — возможная фальсификация документов для вывода средств",
  },
  // ===== LEGITIMATE TRANSACTIONS =====
  {
    sender: "ООО «Ипотека Банк»",
    receiver: "Сафаров А.А. (сотрудник)",
    amount: "8,500,000 UZS",
    time: "10:00",
    location: "Ташкент",
    description: "Зарплатное начисление в день выплаты (15 число месяца)",
    isFraud: false,
    explanation:
      "Регулярная зарплата от известного работодателя в стандартный день выплаты — нормальная операция",
  },
  {
    sender: "Хасанова М.Р.",
    receiver: "Арендодатель Файзуллаев К.",
    amount: "3,000,000 UZS",
    time: "05-число, 18:30",
    location: "Ташкент",
    description:
      "Ежемесячная оплата аренды квартиры одному и тому же получателю",
    isFraud: false,
    explanation:
      "Регулярный платёж одинаковой суммы одному получателю ежемесячно — типичная оплата аренды",
  },
  {
    sender: "Рашидов Т.Н.",
    receiver: "Супермаркет «Корзинка»",
    amount: "285,000 UZS",
    time: "12:35",
    location: "Ташкент, Чиланзарский район",
    description: "Покупка продуктов в супермаркете в обеденное время",
    isFraud: false,
    explanation:
      "Мелкая покупка в знакомом магазине в рабочее время — стандартная бытовая транзакция",
  },
  {
    sender: "Азимова Н.К.",
    receiver: "ООО «Худудгаз»",
    amount: "450,000 UZS",
    time: "20:15",
    location: "Ташкент",
    description:
      "Ежемесячная оплата коммунальных услуг (газ), сумма близка к предыдущим",
    isFraud: false,
    explanation:
      "Регулярная оплата коммунальных услуг с предсказуемой суммой — нормальная операция",
  },
  {
    sender: "Бекмуратов О.С.",
    receiver: "Бекмуратов О.С. (другой счёт)",
    amount: "10,000,000 UZS",
    time: "14:00",
    location: "Ташкент",
    description: "Перевод между собственными счетами в одном банке",
    isFraud: false,
    explanation:
      "Перевод между собственными счетами одного и того же клиента — стандартная банковская операция",
  },
  {
    sender: "Камалова Ф.Д.",
    receiver: "АО «Ипотека Банк» (кредит)",
    amount: "2,800,000 UZS",
    time: "25-число, 09:00",
    location: "Самарканд",
    description: "Ежемесячное погашение ипотечного кредита по графику",
    isFraud: false,
    explanation:
      "Регулярный платёж по кредиту в стандартную дату по графику погашения — нормальная операция",
  },
  {
    sender: "ООО «ТехноПарк»",
    receiver: "150 сотрудников (зарплатный проект)",
    amount: "Разные суммы (итого 850 млн UZS)",
    time: "01-число, 10:00",
    location: "Ташкент",
    description:
      "Массовый зарплатный перевод от зарегистрированной компании в начале месяца",
    isFraud: false,
    explanation:
      "Зарплатный проект от зарегистрированной компании на множество сотрудников — штатная операция",
  },
  {
    sender: "Пенсионный фонд Узбекистана",
    receiver: "Султанова Х.М.",
    amount: "1,200,000 UZS",
    time: "03-число, 08:00",
    location: "Бухара",
    description: "Ежемесячное начисление пенсии от государственного фонда",
    isFraud: false,
    explanation:
      "Регулярное пенсионное начисление от государственного органа в начале месяца — стандартная выплата",
  },
  {
    sender: "Умаров Ж.Л.",
    receiver: "АО «Узбекинвест»",
    amount: "5,600,000 UZS",
    time: "15-число (квартально)",
    location: "Ташкент",
    description: "Квартальная оплата страховой премии",
    isFraud: false,
    explanation:
      "Периодический страховой платёж известной компании с предсказуемой периодичностью — легитимная операция",
  },
  {
    sender: "Назарова Л.Ш.",
    receiver: "Ташкентский финансовый институт",
    amount: "7,200,000 UZS",
    time: "28 августа, 11:00",
    location: "Ташкент",
    description:
      "Оплата за обучение в университете (семестровая, 2 раза в год)",
    isFraud: false,
    explanation:
      "Семестровая оплата обучения перед началом учебного года — типичный образовательный платёж",
  },
  {
    sender: "АО «Ипотека Банк» (инвест. счёт)",
    receiver: "Тошматов Р.И.",
    amount: "3,400,000 UZS",
    time: "Конец квартала, 16:00",
    location: "Ташкент",
    description: "Выплата дивидендов по инвестиционному счёту",
    isFraud: false,
    explanation:
      "Дивидендная выплата в конце квартала от известного банка на счёт клиента — нормальная операция",
  },
  {
    sender: "Исмаилов Б.К.",
    receiver: "Налоговый комитет РУз",
    amount: "14,500,000 UZS",
    time: "25 марта, 09:30",
    location: "Ташкент",
    description: "Ежеквартальная оплата налога на прибыль",
    isFraud: false,
    explanation:
      "Налоговый платёж в государственный орган в период подачи деклараций — стандартный обязательный платёж",
  },
  {
    sender: "Абдуллаева С.Т.",
    receiver: "Spotify Premium",
    amount: "59,000 UZS",
    time: "01-число, 00:05",
    location: "Ташкент",
    description: "Ежемесячная подписка на стриминговый сервис",
    isFraud: false,
    explanation:
      "Автоматическое списание мелкой суммы за подписку в начале месяца — типичная регулярная оплата",
  },
  {
    sender: "Хамидов Э.Ф.",
    receiver: "Рахимов Д.А. (друг)",
    amount: "2,000,000 UZS",
    time: "Суббота, 15:00",
    location: "Ташкент",
    description: "Перевод на свадебный подарок знакомому",
    isFraud: false,
    explanation:
      "Разовый перевод знакомому контакту умеренной суммы в выходной день — нормальная бытовая операция",
  },
  {
    sender: "ООО «МебельПро»",
    receiver: "ООО «ДеревоМастер» (поставщик)",
    amount: "42,000,000 UZS",
    time: "Среда, 14:20",
    location: "Ташкент",
    description:
      "Оплата поставщику по согласованному счёту-фактуре (суммы совпадают)",
    isFraud: false,
    explanation:
      "Платёж поставщику с подтверждённым счётом-фактурой и совпадающими реквизитами — стандартная B2B-операция",
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROUNDS_PER_GAME = 10;
const SECONDS_PER_ROUND = 15;
const COOLDOWN_KEY = "game_fraud_detector_last_play";
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

export default function FraudDetectorGamePage() {
  // ---- Game state ----
  const [gameState, setGameState] = useState<GameState>("idle");
  const [rounds, setRounds] = useState<Transaction[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // ---- Timer ----
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_ROUND);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---- Feedback ----
  const [feedback, setFeedback] = useState<{
    answered: boolean;
    correct: boolean;
    playerSaidFraud: boolean;
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
    const shuffled = shuffleArray(TRANSACTION_BANK).slice(0, ROUNDS_PER_GAME);
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
    (playerSaidFraud: boolean | null) => {
      if (feedback !== null) return;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const currentTransaction = rounds[currentRound];
      const isCorrect =
        playerSaidFraud !== null &&
        playerSaidFraud === currentTransaction.isFraud;

      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
      }

      setFeedback({
        answered: playerSaidFraud !== null,
        correct: isCorrect,
        playerSaidFraud: playerSaidFraud ?? !currentTransaction.isFraud,
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
        `Детектор Мошенничества: ${finalCorrect}/${ROUNDS_PER_GAME} правильных`,
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
  const currentTransaction = rounds[currentRound] ?? null;
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
            <span style={{ fontSize: 28, marginRight: 8 }}>&#x1F6E1;&#xFE0F;</span>
            Детектор Мошенничества
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Научитесь выявлять мошеннические транзакции среди обычных операций
          </p>
        </div>

        <Card>
          <div className="flex flex-col gap-4">
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <span style={{ fontSize: 24 }}>&#x1F6E1;&#xFE0F;</span>
              <span>Тренировка антифрод-навыков</span>
            </div>

            <div
              className="text-sm"
              style={{
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
              }}
            >
              <p className="mb-2">
                Вам будет показано{" "}
                <strong style={{ color: "var(--color-text-primary)" }}>
                  10 банковских транзакций
                </strong>
                . Для каждой нужно определить: это легитимная операция или
                мошенничество.
              </p>
              <p className="mb-2">
                На каждую транзакцию даётся{" "}
                <strong style={{ color: "var(--color-text-primary)" }}>
                  15 секунд
                </strong>
                . Если время истечёт -- ответ засчитывается как неправильный.
              </p>
              <p>
                Анализируйте отправителя, получателя, сумму, время и описание
                операции. Чем точнее ваши решения, тем выше награда в IB-Coins.
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
                Начать проверку
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
  if (gameState === "playing" && currentTransaction) {
    const timerColor =
      timeLeft <= 5
        ? "var(--color-status-error)"
        : timeLeft <= 10
          ? "var(--color-status-warning)"
          : "var(--color-coin-gold)";

    const feedbackBorderColor = feedback
      ? feedback.correct
        ? "var(--color-status-success)"
        : "var(--color-status-error)"
      : null;

    const cardBorderColor = feedbackBorderColor
      ? feedbackBorderColor
      : currentTransaction.isFraud && feedback
        ? "var(--color-status-error)"
        : "var(--color-coin-gold)";

    return (
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header: Progress + Timer */}
        <div className="mb-4 flex items-center justify-between">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Транзакция{" "}
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

        {/* Transaction card */}
        <Card>
          <div
            style={{
              borderLeft: `3px solid ${cardBorderColor}`,
              paddingLeft: 16,
            }}
          >
            {/* Sender & Receiver */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Отправитель:
                </span>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {currentTransaction.sender}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Получатель:
                </span>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {currentTransaction.receiver}
                </span>
              </div>
            </div>

            {/* Amount */}
            <div
              className="mb-3 px-3 py-2 rounded-md inline-block"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <span
                className="text-sm font-bold tabular-nums"
                style={{
                  color: "var(--color-coin-gold)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {currentTransaction.amount}
              </span>
            </div>

            {/* Details row */}
            <div className="flex flex-wrap gap-3 mb-3">
              <div className="flex items-center gap-1">
                <span
                  className="text-xs"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Время:
                </span>
                <span
                  className="text-xs font-medium tabular-nums"
                  style={{
                    color: "var(--color-text-secondary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {currentTransaction.time}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="text-xs"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Локация:
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {currentTransaction.location}
                </span>
              </div>
            </div>

            {/* Description */}
            <div
              className="px-3 py-2 rounded-md"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <p
                className="text-sm"
                style={{
                  color: "var(--color-text-primary)",
                  lineHeight: 1.6,
                }}
              >
                {currentTransaction.description}
              </p>
            </div>
          </div>
        </Card>

        {/* Feedback overlay or Answer buttons */}
        {feedback ? (
          <div
            className="mt-4 p-4 rounded-lg"
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
              className="text-xs mb-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {currentTransaction.isFraud
                ? "Это мошенническая транзакция"
                : "Это легитимная транзакция"}
            </div>
            <div
              className="text-xs"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {currentTransaction.explanation}
            </div>
          </div>
        ) : (
          <div className="mt-5 flex gap-3">
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
                  "var(--color-status-success)";
                e.currentTarget.style.backgroundColor =
                  "rgba(62, 207, 113, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor =
                  "var(--color-border-subtle)";
                e.currentTarget.style.backgroundColor =
                  "var(--color-bg-tertiary)";
              }}
            >
              Легитимная
            </button>
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
                  "var(--color-status-error)";
                e.currentTarget.style.backgroundColor =
                  "rgba(229, 77, 77, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor =
                  "var(--color-border-subtle)";
                e.currentTarget.style.backgroundColor =
                  "var(--color-bg-tertiary)";
              }}
            >
              Мошенничество
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

    let resultLabel: string;
    let resultColor: string;
    if (accuracy >= 80) {
      resultLabel = "Отличный антифрод-специалист!";
      resultColor = "var(--color-status-success)";
    } else if (accuracy >= 50) {
      resultLabel = "Хороший результат, но будьте внимательнее!";
      resultColor = "var(--color-coin-gold)";
    } else {
      resultLabel = "Нужно больше практики в выявлении мошенничества!";
      resultColor = "var(--color-status-error)";
    }

    return (
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div className="mb-6">
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Результаты проверки
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
              className="text-sm font-medium text-center"
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
