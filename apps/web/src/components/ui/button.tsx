import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default: "border hover:opacity-90",
      primary: "text-sm font-medium",
      ghost: "hover:opacity-80",
      destructive: "text-sm font-medium",
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
        backgroundColor: "transparent",
      },
      primary: {
        backgroundColor: "var(--color-coin-gold)",
        color: "var(--color-bg-primary)",
      },
      ghost: {
        color: "var(--color-text-secondary)",
        backgroundColor: "transparent",
      },
      destructive: {
        backgroundColor: "var(--color-status-error)",
        color: "white",
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
