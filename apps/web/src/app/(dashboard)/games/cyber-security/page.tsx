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

interface Scenario {
  type: string;
  content: string;
  source: string;
  isThreat: boolean;
  explanation: string;
}

type GameState = "idle" | "playing" | "finished";

// ---------------------------------------------------------------------------
// Scenario Bank (30+ entries)
// ---------------------------------------------------------------------------

const SCENARIO_BANK: Scenario[] = [
  // ===== THREAT SCENARIOS =====
  {
    type: "Фишинг",
    content:
      "Уважаемый сотрудник! Ваш аккаунт заблокирован из-за подозрительной активности. Для восстановления доступа перейдите по ссылке и введите свои учётные данные. Ссылка действительна 24 часа.",
    source: "security@1p0teka-bank.uz",
    isThreat: true,
    explanation:
      "Домен отправителя подменён (1p0teka вместо ipoteka). Это классическая фишинговая атака с целью кражи учётных данных. Настоящий банк никогда не просит вводить пароль по ссылке из письма.",
  },
  {
    type: "Фишинг",
    content:
      "Добрый день! Это отдел IT-поддержки. В рамках плановой миграции серверов нам необходимо обновить данные всех сотрудников. Пожалуйста, ответьте на это письмо, указав ваш логин и текущий пароль.",
    source: "it-support@ipoteka-help.com",
    isThreat: true,
    explanation:
      "IT-отдел никогда не запрашивает пароли по электронной почте. Домен ipoteka-help.com не является официальным доменом банка. Это фишинговая атака под видом IT-поддержки.",
  },
  {
    type: "Смишинг",
    content:
      "Ipoteka Bank: Обнаружена попытка входа в ваш аккаунт. Подтвердите личность по ссылке: https://bit.ly/3xK9mZ2 или ваш счёт будет заблокирован через 2 часа.",
    source: "SMS с номера +998 71 XXX XX XX",
    isThreat: true,
    explanation:
      "Банк не отправляет SMS со сокращёнными ссылками (bit.ly). Срочность и угроза блокировки — типичные приёмы смишинга (SMS-фишинга). Настоящие уведомления приходят через официальное приложение.",
  },
  {
    type: "Вишинг",
    content:
      "Здравствуйте, вас беспокоит техническая поддержка Ipoteka Bank. Мы зафиксировали попытку несанкционированного доступа к вашему рабочему аккаунту. Продиктуйте, пожалуйста, код из SMS, который вам сейчас придёт, чтобы мы могли заблокировать злоумышленника.",
    source: "Входящий телефонный звонок",
    isThreat: true,
    explanation:
      "Это вишинг — голосовой фишинг. Настоящая техподдержка никогда не запрашивает коды из SMS. 2FA-коды предназначены только для личного использования и не должны передаваться никому.",
  },
  {
    type: "Вредоносное ПО",
    content:
      "К письму прикреплён файл «Отчёт_Q4_2025.pdf.exe» (245 КБ). Тема письма: «Срочно! Квартальный отчёт для руководства». Отправитель просит открыть файл и проверить данные до конца рабочего дня.",
    source: "reports@ipotekabank-docs.ru",
    isThreat: true,
    explanation:
      "Двойное расширение файла (.pdf.exe) — классический приём маскировки вредоносного ПО. Исполняемый файл (.exe) замаскирован под PDF-документ. Домен отправителя не является официальным.",
  },
  {
    type: "Социальная инженерия",
    content:
      "На парковке перед офисом найдена USB-флешка с наклейкой «Зарплаты сотрудников 2025 — КОНФИДЕНЦИАЛЬНО». Флешка лежала рядом с входом в здание и выглядит как обычный корпоративный носитель.",
    source: "USB-накопитель, найденный на парковке",
    isThreat: true,
    explanation:
      "Это атака типа «baiting» (приманка). Злоумышленники специально оставляют заражённые USB-накопители с интригующими подписями. При подключении к компьютеру может установиться вредоносное ПО.",
  },
  {
    type: "Атака Evil Twin",
    content:
      "В лобби бизнес-центра доступна открытая Wi-Fi сеть «Ipoteka_Bank_Free» без пароля. Сеть предлагает быстрое подключение без авторизации. Рядом нет объявлений от банка о предоставлении бесплатного Wi-Fi.",
    source: "Wi-Fi сеть «Ipoteka_Bank_Free»",
    isThreat: true,
    explanation:
      "Это атака «Evil Twin» — поддельная точка доступа, имитирующая корпоративную сеть. Злоумышленник может перехватывать весь трафик, включая пароли и данные. Корпоративный Wi-Fi всегда защищён паролем.",
  },
  {
    type: "Scareware",
    content:
      "Всплывающее окно в браузере: «ВНИМАНИЕ! Ваш компьютер заражён 47 вирусами! Немедленно позвоните по номеру +998 90 123-45-67 для получения технической помощи. Не выключайте компьютер!»",
    source: "Всплывающее окно в браузере",
    isThreat: true,
    explanation:
      "Это scareware — запугивающее ПО. Браузер не может обнаруживать вирусы. Такие окна создаются для того, чтобы жертва позвонила мошенникам и предоставила удалённый доступ к компьютеру.",
  },
  {
    type: "Социальная инженерия",
    content:
      "Коллега из соседнего отдела подходит и просит временно воспользоваться вашей учётной записью: «Мой аккаунт заблокировали, а мне срочно нужно отправить отчёт. Дай свой логин и пароль на 10 минут, я быстро всё сделаю.»",
    source: "Коллега из соседнего отдела",
    isThreat: true,
    explanation:
      "Передача учётных данных другим лицам — серьёзное нарушение информационной безопасности, даже если это коллега. Каждый сотрудник должен использовать только свою учётную запись. При блокировке нужно обращаться в IT-отдел.",
  },
  {
    type: "Фишинг",
    content:
      "На странице входа в систему в адресной строке отображается: ipoteka-bank.security-update.com/login. Страница визуально идентична настоящей странице входа банка. Браузер не показывает предупреждений.",
    source: "Веб-страница ipoteka-bank.security-update.com",
    isThreat: true,
    explanation:
      "Домен security-update.com — сторонний, а «ipoteka-bank» — лишь поддомен. Настоящий домен банка — ipotekabank.uz. Это фишинговый сайт, созданный для кражи учётных данных.",
  },
  {
    type: "BEC-атака",
    content:
      "Срочное письмо от имени генерального директора: «Мне нужно, чтобы вы немедленно перевели 15 000 USD на счёт нашего нового партнёра. Реквизиты во вложении. Это конфиденциально, не обсуждайте с другими сотрудниками.»",
    source: "ceo.director@ipotekabnk.uz",
    isThreat: true,
    explanation:
      "Это BEC-атака (Business Email Compromise). Признаки: срочность, требование конфиденциальности, домен с опечаткой (ipotekabnk вместо ipotekabank). Руководство никогда не запрашивает переводы по email в обход стандартных процедур.",
  },
  {
    type: "QR-фишинг",
    content:
      "На доске объявлений в холле офиса появился яркий плакат: «Сканируй QR-код и получи бонус 500 000 сум на карту! Акция Ipoteka Bank ко Дню сотрудника.» QR-код ведёт на незнакомый домен.",
    source: "QR-код на неофициальном плакате",
    isThreat: true,
    explanation:
      "Это QR-фишинг (quishing). Официальные акции банка анонсируются через внутренние каналы, а не через случайные плакаты. QR-код может вести на фишинговый сайт или скачивать вредоносное ПО.",
  },
  {
    type: "Вредоносное ПО",
    content:
      "В WhatsApp-группе «Сотрудники Ipoteka» пришло сообщение: «Вышло обязательное обновление мобильного приложения банка. Скачайте APK-файл по ссылке, так как в App Store ещё не опубликовали.» К сообщению прикреплён файл IpotekaBank_v3.1.apk.",
    source: "Сообщение в WhatsApp-группе",
    isThreat: true,
    explanation:
      "APK-файлы из неофициальных источников могут содержать вредоносное ПО. Обновления приложений нужно устанавливать только через официальные магазины (Play Store / App Store). Банк не распространяет обновления через мессенджеры.",
  },
  {
    type: "Фишинг",
    content:
      "Сайт интернет-магазина просит ввести данные банковской карты для оплаты заказа. В адресной строке отсутствует значок замка (HTTPS), и URL начинается с http://. Цена товара подозрительно низкая.",
    source: "Сайт http://mega-shop-uz.com/payment",
    isThreat: true,
    explanation:
      "Сайт без HTTPS-шифрования не обеспечивает защиту передаваемых данных. Данные карты могут быть перехвачены. Никогда не вводите платёжные данные на сайтах без SSL-сертификата.",
  },
  {
    type: "Вымогательство",
    content:
      "На экране рабочего компьютера появилось сообщение: «Все ваши файлы зашифрованы! Для восстановления переведите 0.5 BTC на кошелёк bc1qxy2kgdyg... Если не оплатите в течение 72 часов, данные будут удалены навсегда.»",
    source: "Системное сообщение на рабочем столе",
    isThreat: true,
    explanation:
      "Это программа-вымогатель (ransomware). Нельзя переводить деньги — это не гарантирует восстановление файлов. Немедленно отключите компьютер от сети и обратитесь в IT-отдел безопасности.",
  },
  {
    type: "Вредоносное ПО",
    content:
      "Письмо с темой «Приглашение на собеседование — Senior Developer, $5000/мес». Во вложении файл «Job_Offer_Details.docm». Отправитель просит включить макросы для просмотра форматирования документа.",
    source: "hr-recruiter@global-careers.net",
    isThreat: true,
    explanation:
      "Файлы с расширением .docm содержат макросы, которые могут выполнять вредоносный код. Просьба включить макросы — верный признак атаки. Легитимные компании не отправляют документы, требующие включения макросов.",
  },

  // ===== SAFE SCENARIOS =====
  {
    type: "Безопасная практика",
    content:
      "Информационное письмо о запуске новой функции мобильного банкинга. Письмо содержит подробное описание функционала, скриншоты интерфейса и ссылку на внутреннюю базу знаний. Отформатировано в корпоративном стиле.",
    source: "innovations@ipotekabank.uz",
    isThreat: false,
    explanation:
      "Письмо отправлено с официального домена @ipotekabank.uz, содержит корпоративное оформление и ведёт на внутренние ресурсы. Это легитимная корпоративная рассылка.",
  },
  {
    type: "Безопасная практика",
    content:
      "Системное уведомление: «Ваш пароль от корпоративной учётной записи истекает через 7 дней. Для смены пароля перейдите в раздел «Профиль» внутреннего портала или обратитесь в IT-поддержку по внутреннему номеру 1234.»",
    source: "no-reply@internal.ipotekabank.uz",
    isThreat: false,
    explanation:
      "Уведомление отправлено с внутреннего домена, направляет на внутренний портал (а не внешнюю ссылку) и предлагает альтернативный канал связи (внутренний телефон). Это стандартная процедура смены пароля.",
  },
  {
    type: "Безопасная практика",
    content:
      "Вы инициировали вход в систему ДБО и получили SMS с 6-значным кодом подтверждения. Код пришёл через 3 секунды после вашего запроса. Номер отправителя соответствует стандартному номеру банка.",
    source: "SMS от Ipoteka Bank (официальный номер)",
    isThreat: false,
    explanation:
      "Двухфакторная аутентификация, инициированная вами самостоятельно — это стандартная процедура безопасности. Код пришёл сразу после вашего запроса, что подтверждает его легитимность.",
  },
  {
    type: "Безопасная практика",
    content:
      "Письмо от комплаенс-отдела с обновлённой политикой AML/KYC. Документ подписан электронной подписью (PGP), имеет корректный сертификат. В письме указано: «При вопросах обращайтесь к начальнику комплаенс-отдела по внутреннему номеру.»",
    source: "compliance@ipotekabank.uz",
    isThreat: false,
    explanation:
      "Письмо отправлено с официального домена, содержит электронную подпись PGP и направляет на внутренние контакты. Это легитимная корпоративная коммуникация от комплаенс-отдела.",
  },
  {
    type: "Безопасная практика",
    content:
      "Уведомление от IT-отдела: «Плановое техническое обслуживание серверов состоится в субботу с 02:00 до 06:00. Доступ к внутренним системам будет временно ограничен. Приносим извинения за неудобства.»",
    source: "it-admin@ipotekabank.uz (Администратор систем А. Каримов)",
    isThreat: false,
    explanation:
      "Уведомление с официального домена от известного администратора о плановом обслуживании — это стандартная IT-коммуникация. Указаны конкретные сроки и причина, нет запросов данных или подозрительных ссылок.",
  },
  {
    type: "Безопасная практика",
    content:
      "При подключении к рабочему ноутбуку из дома система запросила VPN-соединение через корпоративный клиент FortiClient. После ввода учётных данных и 2FA-кода установлено защищённое соединение с корпоративной сетью.",
    source: "Корпоративный VPN-клиент FortiClient",
    isThreat: false,
    explanation:
      "VPN-подключение с двухфакторной аутентификацией — это стандартная процедура безопасного удалённого доступа к корпоративной сети. Использование корпоративного VPN-клиента обязательно при работе из дома.",
  },
  {
    type: "Безопасная практика",
    content:
      "Windows показывает уведомление: «Доступны обновления. Windows Update установит обновления безопасности при следующей перезагрузке. Источник: Microsoft Update.» Значок обновлений в системном трее стандартный.",
    source: "Microsoft Windows Update",
    isThreat: false,
    explanation:
      "Стандартное уведомление Windows Update от Microsoft — это легитимный системный процесс. Регулярная установка обновлений безопасности является важной мерой защиты. Уведомление отображается в системном трее, а не в браузере.",
  },
  {
    type: "Безопасная практика",
    content:
      "Коллега в корпоративном Slack отправил сообщение: «Привет! Завтра в 15:00 встреча по проекту автоматизации. Я создал событие в календаре, проверь, пожалуйста. Повестка в прикреплённом Google Doc.» Профиль верифицирован.",
    source: "Алексей Иванов (верифицированный аккаунт в Slack)",
    isThreat: false,
    explanation:
      "Сообщение от верифицированного коллеги в корпоративном мессенджере о рабочей встрече — это обычная рабочая коммуникация. Ссылка ведёт на корпоративный Google Doc.",
  },
  {
    type: "Безопасная практика",
    content:
      "Письмо от HR-отдела: «Приглашаем вас на обязательный тренинг по информационной безопасности 15 марта в 10:00. Регистрация через внутренний портал обучения. Тренинг проводит сертифицированный специалист по ИБ.»",
    source: "hr-training@ipotekabank.uz",
    isThreat: false,
    explanation:
      "Приглашение на тренинг по ИБ от HR-отдела с официального домена, с регистрацией через внутренний портал — это стандартная корпоративная практика повышения осведомлённости сотрудников.",
  },
  {
    type: "Безопасная практика",
    content:
      "Уведомление от системы резервного копирования: «Ежедневное автоматическое резервное копирование рабочей станции завершено успешно. Размер резервной копии: 12.4 ГБ. Следующее копирование: завтра в 01:00.»",
    source: "backup-system@internal.ipotekabank.uz",
    isThreat: false,
    explanation:
      "Автоматическое уведомление от внутренней системы резервного копирования — это стандартная IT-процедура. Сообщение информативное, не содержит ссылок и не запрашивает никаких данных.",
  },
  {
    type: "Безопасная практика",
    content:
      "В Play Store доступно обновление приложения «Ipoteka Mobile». Разработчик: Ipoteka Bank ATIB. Обновление содержит исправления ошибок и улучшения безопасности. Рейтинг приложения: 4.6, более 500 000 скачиваний.",
    source: "Google Play Store — Ipoteka Bank ATIB",
    isThreat: false,
    explanation:
      "Обновление из официального магазина приложений от верифицированного разработчика — это безопасная процедура. Всегда обновляйте приложения только через Play Store или App Store.",
  },
  {
    type: "Безопасная практика",
    content:
      "При входе на внутренний портал банка в адресной строке отображается: https://portal.ipotekabank.uz. Браузер показывает зелёный замок, сертификат выдан на имя «Ipoteka Bank ATIB» удостоверяющим центром DigiCert.",
    source: "Внутренний портал https://portal.ipotekabank.uz",
    isThreat: false,
    explanation:
      "Корректный HTTPS-сертификат от доверенного удостоверяющего центра, правильный домен банка и зелёный замок в браузере — все признаки легитимного и безопасного внутреннего ресурса.",
  },
  {
    type: "Безопасная практика",
    content:
      "IT-отдел распространил печатную памятку «10 правил кибербезопасности для сотрудников банка». Документ содержит рекомендации по паролям, фишингу и работе с конфиденциальными данными. На памятке логотип банка и подпись CISO.",
    source: "Печатная памятка от IT-отдела безопасности",
    isThreat: false,
    explanation:
      "Печатные материалы по информационной безопасности от IT-отдела — это стандартная мера повышения осведомлённости сотрудников. Документ подписан CISO (директором по информационной безопасности).",
  },
  {
    type: "Безопасная практика",
    content:
      "Рассылка от CyberSec Daily (cybersecdaily.com): «Еженедельный дайджест: топ-5 киберугроз недели, обзор новых уязвимостей, рекомендации NIST по защите банковских систем.» Вы подписались на эту рассылку месяц назад.",
    source: "newsletter@cybersecdaily.com",
    isThreat: false,
    explanation:
      "Рассылка от известного отраслевого издания, на которую вы подписались самостоятельно — это легитимный информационный ресурс. CyberSec Daily — признанный источник новостей в области кибербезопасности.",
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROUNDS_PER_GAME = 10;
const SECONDS_PER_ROUND = 20;
const COOLDOWN_KEY = "game_cyber_security_last_play";
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

export default function CyberSecurityGamePage() {
  // ---- Game state ----
  const [gameState, setGameState] = useState<GameState>("idle");
  const [rounds, setRounds] = useState<Scenario[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // ---- Per-round answers (for results screen) ----
  const [answers, setAnswers] = useState<
    { scenario: Scenario; playerSaidThreat: boolean | null; correct: boolean }[]
  >([]);

  // ---- Timer ----
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_ROUND);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---- Feedback ----
  const [feedback, setFeedback] = useState<{
    answered: boolean;
    correct: boolean;
    playerSaidThreat: boolean;
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
    const shuffled = shuffleArray(SCENARIO_BANK).slice(0, ROUNDS_PER_GAME);
    setRounds(shuffled);
    setCurrentRound(0);
    setCorrectCount(0);
    setAnswers([]);
    setFeedback(null);
    setReward(null);
    setRewardError(null);
    setGameState("playing");
  }, []);

  // ---- Handle answer ----
  const handleAnswer = useCallback(
    (playerSaidThreat: boolean | null) => {
      if (feedback !== null) return;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const currentScenario = rounds[currentRound];
      const isCorrect =
        playerSaidThreat !== null &&
        playerSaidThreat === currentScenario.isThreat;

      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
      }

      setAnswers((prev) => [
        ...prev,
        {
          scenario: currentScenario,
          playerSaidThreat,
          correct: isCorrect,
        },
      ]);

      setFeedback({
        answered: playerSaidThreat !== null,
        correct: isCorrect,
        playerSaidThreat: playerSaidThreat ?? !currentScenario.isThreat,
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
        `Кибер Щит: ${finalCorrect}/${ROUNDS_PER_GAME} правильных`,
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
  const currentScenario = rounds[currentRound] ?? null;
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
            Кибер Щит
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Распознайте киберугрозы и защитите банк
          </p>
        </div>

        <Card>
          <div className="flex flex-col gap-4">
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <span style={{ fontSize: 24 }}>🛡️</span>
              <span>Тренировка кибербезопасности</span>
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
                  10 сценариев
                </strong>
                : электронные письма, SMS-сообщения, веб-сайты, звонки и
                системные уведомления. Для каждого определите — это
                киберугроза или безопасная ситуация.
              </p>
              <p className="mb-2">
                На каждый сценарий даётся{" "}
                <strong style={{ color: "var(--color-text-primary)" }}>
                  20 секунд
                </strong>
                . Если время истечёт — ответ засчитывается как неправильный.
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
  if (gameState === "playing" && currentScenario) {
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
            Сценарий{" "}
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

        {/* Scenario card styled as email/message preview */}
        <Card>
          <div className="flex flex-col gap-3">
            {/* "From" header */}
            <div
              className="flex items-center gap-2 pb-3"
              style={{
                borderBottom: "1px solid var(--color-border-subtle)",
              }}
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: currentScenario.isThreat
                    ? "var(--color-bg-tertiary)"
                    : "var(--color-bg-tertiary)",
                  border: "1px solid var(--color-border-subtle)",
                  fontSize: 14,
                }}
              >
                ✉
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-xs font-medium truncate"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Источник:
                </div>
                <div
                  className="text-xs truncate"
                  style={{
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {currentScenario.source}
                </div>
              </div>
            </div>

            {/* Scenario content */}
            <div
              style={{
                borderLeft: "3px solid var(--color-coin-gold)",
                paddingLeft: 16,
                minHeight: 60,
              }}
            >
              <p
                className="text-sm"
                style={{
                  color: "var(--color-text-primary)",
                  lineHeight: 1.8,
                }}
              >
                {currentScenario.content}
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
              className="text-sm font-semibold mb-2"
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

            {/* Attack type badge */}
            <div className="mb-2">
              <span
                className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: currentScenario.isThreat
                    ? "rgba(229, 77, 77, 0.15)"
                    : "rgba(62, 207, 113, 0.15)",
                  color: currentScenario.isThreat
                    ? "var(--color-status-error)"
                    : "var(--color-status-success)",
                  border: `1px solid ${
                    currentScenario.isThreat
                      ? "var(--color-status-error)"
                      : "var(--color-status-success)"
                  }`,
                }}
              >
                {currentScenario.type}
              </span>
            </div>

            <div
              className="text-xs"
              style={{
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
              }}
            >
              {currentScenario.explanation}
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
              🛡️ Безопасно
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
              ⚠️ Угроза
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
      resultLabel = "Отличный киберзащитник!";
      resultColor = "var(--color-status-success)";
    } else if (accuracy >= 50) {
      resultLabel = "Хороший результат, но будьте бдительнее!";
      resultColor = "var(--color-coin-gold)";
    } else {
      resultLabel = "Рекомендуем пройти тренинг по ИБ!";
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

            {/* Scenario review list */}
            <div className="w-full">
              <div
                className="text-xs font-medium mb-3"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Разбор сценариев:
              </div>
              <div className="flex flex-col gap-2">
                {answers.map((a, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: "var(--color-bg-tertiary)",
                      border: `1px solid ${
                        a.correct
                          ? "var(--color-status-success)"
                          : "var(--color-status-error)"
                      }`,
                      borderLeftWidth: 3,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold tabular-nums"
                          style={{
                            color: "var(--color-text-tertiary)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          #{idx + 1}
                        </span>
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: a.scenario.isThreat
                              ? "rgba(229, 77, 77, 0.15)"
                              : "rgba(62, 207, 113, 0.15)",
                            color: a.scenario.isThreat
                              ? "var(--color-status-error)"
                              : "var(--color-status-success)",
                          }}
                        >
                          {a.scenario.type}
                        </span>
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: a.correct
                            ? "var(--color-status-success)"
                            : "var(--color-status-error)",
                        }}
                      >
                        {a.correct ? "Верно" : "Ошибка"}
                      </span>
                    </div>
                    <div
                      className="text-xs mb-1"
                      style={{
                        color: "var(--color-text-secondary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {a.scenario.source}
                    </div>
                    <div
                      className="text-xs"
                      style={{
                        color: "var(--color-text-tertiary)",
                        lineHeight: 1.5,
                      }}
                    >
                      {a.scenario.explanation}
                    </div>
                  </div>
                ))}
              </div>
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
