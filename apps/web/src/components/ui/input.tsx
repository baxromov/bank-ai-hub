import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-3 py-2 rounded-md text-sm outline-none transition-colors",
          className
        )}
        style={{
          backgroundColor: "var(--color-bg-tertiary)",
          border: "1px solid var(--color-border-subtle)",
          color: "var(--color-text-primary)",
        }}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
