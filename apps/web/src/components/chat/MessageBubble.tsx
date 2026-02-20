interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className="max-w-[80%] rounded-lg px-4 py-3"
        style={{
          backgroundColor: isUser ? "var(--color-bg-tertiary)" : "var(--color-bg-secondary)",
          border: isUser ? "none" : "1px solid var(--color-border-subtle)",
        }}
      >
        <p className="text-xs mb-1" style={{ color: "var(--color-text-tertiary)" }}>
          {isUser ? "\u0412\u044B" : "AI"}
        </p>
        <div
          className="text-sm whitespace-pre-wrap"
          style={{ color: "var(--color-text-primary)" }}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
