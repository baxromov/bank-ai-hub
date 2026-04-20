"use client";

import { useState, useRef, useEffect } from "react";

interface PromptInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function PromptInput({ onSend, disabled }: PromptInputProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div
      className="flex items-end gap-2 px-4 py-3 rounded-2xl transition-all"
      style={{
        backgroundColor: "var(--color-bg-primary)",
        border: `1.5px solid ${focused ? "var(--color-brand)" : "var(--color-border-subtle)"}`,
        boxShadow: focused ? "0 0 0 3px rgba(82,174,48,0.10)" : "none",
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Напишите сообщение... (Enter — отправить, Shift+Enter — новая строка)"
        rows={1}
        disabled={disabled}
        className="flex-1 resize-none text-sm outline-none leading-relaxed"
        style={{
          backgroundColor: "transparent",
          color: "var(--color-text-primary)",
          maxHeight: "140px",
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={!canSend}
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all"
        style={{
          background: canSend
            ? "linear-gradient(135deg, #1a6832 0%, #52ae30 100%)"
            : "var(--color-bg-elevated)",
          color: canSend ? "white" : "var(--color-text-tertiary)",
          boxShadow: canSend ? "0 4px 10px rgba(82,174,48,0.30)" : "none",
          transform: canSend ? "scale(1)" : "scale(0.95)",
          cursor: canSend ? "pointer" : "not-allowed",
        }}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}
