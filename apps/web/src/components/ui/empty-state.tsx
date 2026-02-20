interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
        {title}
      </p>
      {description && (
        <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
          {description}
        </p>
      )}
    </div>
  );
}
