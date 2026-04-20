"use client";

import { useEffect, useRef, useState } from "react";
import { chatApi } from "@/api-client";
import { useChatStore } from "@/stores/chat";
import { PromptInput } from "@/components/chat/PromptInput";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const SUGGESTED = [
  "Как оформить ипотечный кредит?",
  "Объясни требования KYC",
  "Помоги написать письмо клиенту",
  "Что такое FATF и AML?",
];

export default function ChatPage() {
  const { activeSessionId, sessions, messages, isStreaming, setActiveSession, setSessions, setMessages, addMessage, setStreaming, appendToLastMessage } = useChatStore();
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
      {/* Session sidebar */}
      <div
        className="w-56 flex-shrink-0 flex flex-col gap-3 rounded-2xl p-3"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border-subtle)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <Button variant="primary" size="sm" onClick={handleNewSession} className="w-full">
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Новый чат
        </Button>

        <div className="flex-1 overflow-auto space-y-0.5">
          {sessionsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-xl" />
            ))
          ) : sessions.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: "var(--color-text-tertiary)" }}>
              Нет чатов
            </p>
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

      {/* Chat area */}
      <div
        className="flex-1 flex flex-col min-w-0 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border-subtle)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* Messages */}
        <div className="flex-1 overflow-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-6 px-4">
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg, #1a6832 0%, #52ae30 100%)", boxShadow: "0 8px 20px rgba(82,174,48,0.3)" }}
                >
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-base font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
                  BankAI Assistant
                </p>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Задайте вопрос или выберите подсказку ниже
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                {SUGGESTED.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-left px-3 py-3 rounded-xl text-xs transition-all hover:translate-y-[-1px]"
                    style={{
                      backgroundColor: "var(--color-bg-primary)",
                      color: "var(--color-text-secondary)",
                      border: "1px solid var(--color-border-subtle)",
                      boxShadow: "var(--shadow-xs)",
                    }}
                  >
                    {q}
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
            <div className="flex justify-start mb-4">
              <div className="px-4 py-3 rounded-2xl flex gap-1.5 items-center"
                style={{ backgroundColor: "var(--color-bg-primary)", border: "1px solid var(--color-border-subtle)" }}>
                <span className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: "var(--color-brand)", animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: "var(--color-brand)", animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: "var(--color-brand)", animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4" style={{ borderTop: "1px solid var(--color-border-subtle)" }}>
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
        className="flex-1 text-left px-3 py-2 text-xs truncate font-medium"
        style={{ color: active ? "var(--color-brand-dark)" : "var(--color-text-secondary)" }}
      >
        {displayed}
        {animating && (
          <span
            className="inline-block w-px h-3 ml-0.5 align-middle animate-pulse"
            style={{ backgroundColor: "var(--color-brand)" }}
          />
        )}
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
