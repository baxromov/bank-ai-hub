import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default: "border hover:opacity-90",
      primary: "text-sm font-semibold hover:opacity-90",
      ghost: "hover:opacity-80",
      destructive: "text-sm font-semibold hover:opacity-90",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-9 px-4 text-sm",
      lg: "h-10 px-6 text-sm",
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        borderColor: "var(--color-border-strong)",
        color: "var(--color-text-primary)",
        backgroundColor: "var(--color-bg-secondary)",
        boxShadow: "var(--shadow-xs)",
      },
      primary: {
        background: "linear-gradient(135deg, #1a6832 0%, #52ae30 100%)",
        color: "#FFFFFF",
        boxShadow: "0 4px 12px rgba(82,174,48,0.35)",
      },
      ghost: {
        color: "var(--color-text-secondary)",
        backgroundColor: "transparent",
      },
      destructive: {
        backgroundColor: "var(--color-status-error)",
        color: "white",
        boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
      },
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        style={variantStyles[variant]}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
