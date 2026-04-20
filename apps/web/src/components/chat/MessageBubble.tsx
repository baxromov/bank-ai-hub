"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 gap-2.5 items-end">
        <div
          className="max-w-[75%] rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed"
          style={{
            background: "linear-gradient(135deg, #1a6832 0%, #52ae30 100%)",
            color: "white",
            boxShadow: "0 2px 10px rgba(82,174,48,0.30)",
          }}
        >
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg, #1a6832 0%, #52ae30 100%)" }}
        >
          Я
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4 gap-2.5 items-end">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "linear-gradient(135deg, #1a6832 0%, #52ae30 100%)", boxShadow: "0 2px 8px rgba(82,174,48,0.25)" }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <div
        className="max-w-[75%] rounded-2xl rounded-bl-md px-4 py-3 text-sm"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border-subtle)",
          color: "var(--color-text-primary)",
          boxShadow: "var(--shadow-xs)",
        }}
      >
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
                  className={`block rounded-xl px-3 py-2.5 text-xs font-mono overflow-x-auto my-2 ${className ?? ""}`}
                  style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-brand)", border: "1px solid var(--color-border-subtle)" }}
                  {...props}
                >
                  {children}
                </code>
              ) : (
                <code
                  className="rounded-md px-1.5 py-0.5 text-xs font-mono"
                  style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-brand)" }}
                  {...props}
                >
                  {children}
                </code>
              );
            },
            pre: ({ children }) => <pre className="mb-2 overflow-x-auto">{children}</pre>,
            blockquote: ({ children }) => (
              <blockquote
                className="border-l-2 pl-3 my-2 italic rounded-r-lg"
                style={{ borderColor: "var(--color-brand)", color: "var(--color-text-secondary)", backgroundColor: "var(--color-brand-surface)", padding: "8px 12px" }}
              >
                {children}
              </blockquote>
            ),
            strong: ({ children }) => <strong className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{children}</strong>,
            hr: () => <hr className="my-3" style={{ borderColor: "var(--color-border-subtle)" }} />,
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-brand)" }} className="underline underline-offset-2 font-medium">
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
