import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all",
          className
        )}
        style={{
          backgroundColor: "var(--color-bg-primary)",
          border: "1.5px solid var(--color-border-subtle)",
          color: "var(--color-text-primary)",
          boxShadow: "var(--shadow-xs)",
        }}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
