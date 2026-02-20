import { CoinBadge } from "./CoinBadge";
import { Badge } from "@/components/ui/badge";

interface TransactionRowProps {
  actionType: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string | null;
}

const ACTION_LABELS: Record<string, string> = {
  quality_prompt: "Качественный промпт",
  document_creation: "Создание документа",
  tool_usage: "Использование инструмента",
  tool_creation: "Создание инструмента",
  suggestion: "Предложение",
  weekly_bonus: "Недельный бонус",
  marketplace_purchase: "Покупка",
  admin_award: "Награда от админа",
};

export function TransactionRow({ actionType, amount, description, status, createdAt }: TransactionRowProps) {
  const label = ACTION_LABELS[actionType] || actionType;
  const statusVariant = status === "completed" || status === "approved" ? "success" : status === "pending" ? "warning" : "error";

  return (
    <div
      className="flex items-center justify-between py-3 px-2"
      style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
    >
      <div className="flex-1">
        <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>{label}</p>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={statusVariant}>{status}</Badge>
        <CoinBadge amount={amount} showSign />
      </div>
    </div>
  );
}
