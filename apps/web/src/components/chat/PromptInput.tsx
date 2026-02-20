"use client";

import { useState, useRef, useEffect } from "react";

interface PromptInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function PromptInput({ onSend, disabled }: PromptInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
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

  return (
    <div
      className="flex items-end gap-2 p-3 rounded-lg"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border-subtle)",
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Сообщение..."
        rows={1}
        disabled={disabled}
        className="flex-1 resize-none text-sm outline-none"
        style={{
          backgroundColor: "transparent",
          color: "var(--color-text-primary)",
          maxHeight: "120px",
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim() || disabled}
        className="p-2 rounded-md transition-colors"
        style={{
          color: value.trim() ? "var(--color-coin-gold)" : "var(--color-text-tertiary)",
        }}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}
