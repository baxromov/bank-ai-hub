"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className="max-w-[80%] rounded-lg px-4 py-3 text-sm"
        style={{
          backgroundColor: isUser ? "var(--color-bg-tertiary)" : "var(--color-bg-secondary)",
          border: isUser ? "none" : "1px solid var(--color-border-subtle)",
          color: "var(--color-text-primary)",
        }}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
              h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-3 first:mt-0" style={{ color: "var(--color-text-primary)" }}>{children}</h1>,
              h2: ({ children }) => <h2 className="text-sm font-bold mb-2 mt-3 first:mt-0" style={{ color: "var(--color-text-primary)" }}>{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0" style={{ color: "var(--color-text-primary)" }}>{children}</h3>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              code: ({ className, children, ...props }) => {
                const isBlock = className?.includes("language-");
                return isBlock ? (
                  <code
                    className={`block rounded-md px-3 py-2 text-xs font-mono overflow-x-auto my-2 ${className ?? ""}`}
                    style={{ backgroundColor: "var(--color-bg-tertiary)", color: "var(--color-coin-gold-bright)" }}
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <code
                    className="rounded px-1 py-0.5 text-xs font-mono"
                    style={{ backgroundColor: "var(--color-bg-tertiary)", color: "var(--color-coin-gold-bright)" }}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => <pre className="mb-2 overflow-x-auto">{children}</pre>,
              blockquote: ({ children }) => (
                <blockquote
                  className="border-l-2 pl-3 my-2 italic"
                  style={{ borderColor: "var(--color-coin-gold-dim)", color: "var(--color-text-secondary)" }}
                >
                  {children}
                </blockquote>
              ),
              strong: ({ children }) => <strong className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{children}</strong>,
              hr: () => <hr className="my-3" style={{ borderColor: "var(--color-border-subtle)" }} />,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-coin-gold)" }} className="underline underline-offset-2">
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
