"use client";

import { useEffect, useState } from "react";
import { chatApi } from "@/api-client";
import { useChatStore } from "@/stores/chat";
import { PromptInput } from "@/components/chat/PromptInput";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const { activeSessionId, sessions, messages, isStreaming, setActiveSession, setSessions, setMessages, addMessage, setStreaming } = useChatStore();
  const [model, setModel] = useState("qwen2.5:7b");
  const [models, setModels] = useState<any[]>([]);

  useEffect(() => {
    chatApi.listSessions().then(setSessions).catch(() => {});
    chatApi.getModels().then((data) => setModels(data.models)).catch(() => {});
  }, [setSessions]);

  useEffect(() => {
    if (activeSessionId) {
      chatApi.getMessages(activeSessionId).then(setMessages).catch(() => {});
    }
  }, [activeSessionId, setMessages]);

  const handleNewSession = async () => {
    const session = await chatApi.createSession({ title: "Новый чат", model });
    setSessions([session, ...sessions]);
    setActiveSession(session.id);
    setMessages([]);
  };

  const handleSend = async (content: string) => {
    if (!activeSessionId) {
      const session = await chatApi.createSession({ title: content.slice(0, 50), model });
      setSessions([session, ...sessions]);
      setActiveSession(session.id);

      addMessage({ id: "temp-user", role: "user", content, created_at: new Date().toISOString() });
      setStreaming(true);

      try {
        const result = await chatApi.sendMessage(session.id, content);
        addMessage(result.message);
      } finally {
        setStreaming(false);
      }
      return;
    }

    addMessage({ id: `temp-${Date.now()}`, role: "user", content, created_at: new Date().toISOString() });
    setStreaming(true);
    try {
      const result = await chatApi.sendMessage(activeSessionId, content);
      addMessage(result.message);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem-3rem)] gap-4">
      {/* Session List */}
      <div className="w-60 flex-shrink-0 flex flex-col gap-2">
        <Button variant="primary" size="sm" onClick={handleNewSession} className="w-full">
          + Новый чат
        </Button>

        {/* Model Selector */}
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-2 py-1.5 rounded text-xs outline-none"
          style={{
            backgroundColor: "var(--color-bg-tertiary)",
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <option value="qwen2.5:7b">qwen2.5:7b</option>
          <option value="qwen2.5:14b">qwen2.5:14b</option>
          {models.map((m: any) => (
            <option key={m.name} value={m.name}>{m.name}</option>
          ))}
        </select>

        <div className="flex-1 overflow-auto space-y-1">
          {sessions.map((s: any) => (
            <button
              key={s.id}
              onClick={() => setActiveSession(s.id)}
              className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors"
              style={{
                backgroundColor: activeSessionId === s.id ? "var(--color-bg-tertiary)" : "transparent",
                color: activeSessionId === s.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                borderLeft: activeSessionId === s.id ? "2px solid var(--color-coin-gold-dim)" : "2px solid transparent",
              }}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto py-4 px-2">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                  BankAI Assistant
                </p>
                <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
                  Задайте вопрос или попросите помощь с документами
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg: any) => (
              <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
            ))
          )}
          {isStreaming && (
            <div className="flex justify-start mb-4">
              <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                <span className="animate-pulse" style={{ color: "var(--color-text-tertiary)" }}>...</span>
              </div>
            </div>
          )}
        </div>

        <div className="py-3">
          <PromptInput onSend={handleSend} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
}
