"use client";

import { useEffect, useRef, useState } from "react";
import { chatApi } from "@/api-client";
import { useChatStore } from "@/stores/chat";
import { PromptInput } from "@/components/chat/PromptInput";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { Skeleton } from "@/components/ui/skeleton";

const SUGGESTED = [
  { label: "Ипотечный кредит", q: "Как оформить ипотечный кредит?", iconPath: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Требования KYC", q: "Объясни требования KYC", iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { label: "Письмо клиенту", q: "Помоги написать письмо клиенту", iconPath: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { label: "FATF и AML", q: "Что такое FATF и AML?", iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

export default function ChatPage() {
  const {
    activeSessionId, sessions, messages, isStreaming,
    setActiveSession, setSessions, setMessages, addMessage,
    setStreaming, appendToLastMessage,
  } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const newSessionRef = useRef<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    chatApi.listSessions()
      .then(setSessions)
      .catch(() => {})
      .finally(() => setSessionsLoading(false));
  }, [setSessions]);

  useEffect(() => {
    if (activeSessionId && activeSessionId !== newSessionRef.current) {
      chatApi.getMessages(activeSessionId).then(setMessages).catch(() => {});
    }
  }, [activeSessionId, setMessages]);

  const handleNewSession = () => {
    setActiveSession(null);
    setMessages([]);
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    await chatApi.deleteSession(sessionId).catch(() => {});
    const updated = sessions.filter((s: any) => s.id !== sessionId);
    setSessions(updated);
    if (activeSessionId === sessionId) {
      setActiveSession(updated[0]?.id ?? null);
      setMessages([]);
    }
  };

  const handleSend = async (content: string) => {
    let sessionId = activeSessionId;
    if (!sessionId) {
      const session = await chatApi.createSession({ title: content.slice(0, 50) });
      newSessionRef.current = session.id;
      setSessions([session, ...sessions]);
      setActiveSession(session.id);
      setAnimatingId(session.id);
      sessionId = session.id;
    }
    addMessage({ id: `user-${Date.now()}`, role: "user", content, created_at: new Date().toISOString() });
    setStreaming(true);
    let firstChunk = true;
    try {
      await chatApi.streamMessage(sessionId, content, (chunk) => {
        if (firstChunk) {
          firstChunk = false;
          addMessage({ id: `ai-${Date.now()}`, role: "assistant", content: chunk, created_at: new Date().toISOString() });
        } else {
          appendToLastMessage(chunk);
        }
      });
    } catch {
      addMessage({ id: `ai-err-${Date.now()}`, role: "assistant", content: "Произошла ошибка. Попробуйте ещё раз.", created_at: new Date().toISOString() });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem-3rem)] gap-4">
      {/* Session Sidebar */}
      <div
        className="w-60 flex-shrink-0 flex flex-col rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border-subtle)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* Sidebar header */}
        <div className="p-3" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
          <button
            onClick={handleNewSession}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "linear-gradient(135deg, #1a6832 0%, #52ae30 100%)",
              color: "white",
              boxShadow: "0 4px 12px rgba(82,174,48,0.30)",
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Новый чат
          </button>
        </div>

        {/* Session label */}
        <div className="px-3 pt-3 pb-1">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
            История чатов
          </p>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-auto px-2 pb-2 space-y-0.5">
          {sessionsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl mb-1" />
            ))
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center px-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: "var(--color-bg-primary)" }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--color-text-tertiary)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                Нет чатов
              </p>
            </div>
          ) : (
            sessions.map((s: any) => (
              <SessionItem
                key={s.id}
                session={s}
                active={activeSessionId === s.id}
                animating={animatingId === s.id}
                onSelect={() => setActiveSession(s.id)}
                onDelete={(e) => handleDeleteSession(e, s.id)}
                onAnimationDone={() => setAnimatingId(null)}
              />
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className="flex-1 flex flex-col min-w-0 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border-subtle)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* Chat header */}
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1a6832 0%, #52ae30 100%)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                BankAI Assistant
              </p>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: isStreaming ? "#f59e0b" : "var(--color-brand)" }}
                />
                <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  {isStreaming ? "Печатает..." : "Онлайн"}
                </p>
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleNewSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{
                backgroundColor: "var(--color-bg-primary)",
                color: "var(--color-text-secondary)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Новый
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-7">
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg, #1a6832 0%, #52ae30 100%)", boxShadow: "0 8px 24px rgba(82,174,48,0.30)" }}
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-lg font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
                  Чем могу помочь?
                </p>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Задайте вопрос или выберите одну из подсказок ниже
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTED.map((s) => (
                  <button
                    key={s.q}
                    onClick={() => handleSend(s.q)}
                    className="flex items-start gap-3 text-left px-4 py-3.5 rounded-xl transition-all hover:translate-y-[-2px]"
                    style={{
                      backgroundColor: "var(--color-bg-primary)",
                      border: "1.5px solid var(--color-border-subtle)",
                      boxShadow: "var(--shadow-xs)",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: "var(--color-brand-surface)" }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={s.iconPath} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-text-primary)" }}>
                        {s.label}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
                        {s.q}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg: any) => (
              <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
            ))
          )}
          <div ref={bottomRef} />
          {isStreaming && (messages.length === 0 || messages.at(-1)?.role === "user") && (
            <div className="flex justify-start mb-4 gap-2.5 items-end">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #1a6832 0%, #52ae30 100%)" }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div
                className="px-4 py-3.5 rounded-2xl rounded-bl-md flex gap-1.5 items-center"
                style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border-subtle)" }}
              >
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--color-brand)", animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--color-brand)", animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--color-brand)", animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 pb-4" style={{ borderTop: "1px solid var(--color-border-subtle)", paddingTop: "12px" }}>
          <PromptInput onSend={handleSend} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
}

function SessionItem({
  session, active, animating, onSelect, onDelete, onAnimationDone,
}: {
  session: any;
  active: boolean;
  animating: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onAnimationDone: () => void;
}) {
  const [displayed, setDisplayed] = useState(animating ? "" : session.title);

  useEffect(() => {
    if (!animating) {
      setDisplayed(session.title);
      return;
    }
    setDisplayed("");
    const title = session.title as string;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(title.slice(0, i));
      if (i >= title.length) {
        clearInterval(interval);
        onAnimationDone();
      }
    }, 40);
    return () => clearInterval(interval);
  }, [animating, session.title]);

  return (
    <div
      className="group flex items-center rounded-xl transition-all"
      style={{
        backgroundColor: active ? "var(--color-brand-surface)" : "transparent",
        borderLeft: active ? "2.5px solid var(--color-brand)" : "2.5px solid transparent",
      }}
    >
      <button
        onClick={onSelect}
        className="flex-1 flex items-center gap-2 text-left px-3 py-2.5 min-w-0"
      >
        <svg
          className="w-3.5 h-3.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke={active ? "var(--color-brand)" : "var(--color-text-tertiary)"}
          strokeWidth={1.75}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span
          className="text-xs truncate font-medium"
          style={{ color: active ? "var(--color-brand-dark)" : "var(--color-text-secondary)" }}
        >
          {displayed}
          {animating && (
            <span
              className="inline-block w-px h-3 ml-0.5 align-middle animate-pulse"
              style={{ backgroundColor: "var(--color-brand)" }}
            />
          )}
        </span>
      </button>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1.5 mr-1 rounded-lg transition-opacity"
        style={{ color: "var(--color-text-tertiary)" }}
        title="Удалить"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
