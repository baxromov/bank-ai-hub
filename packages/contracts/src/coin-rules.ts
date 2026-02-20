/**
 * IB-Coin accrual rules — constants shared between frontend and backend.
 * These are the DEFAULT values; actual rules are stored in the database.
 */

export const COIN_RULES = {
  quality_prompt: { min: 1, max: 10, autoApprove: true },
  document_creation: { min: 5, max: 30, autoApprove: true },
  tool_usage: { min: 1, max: 5, autoApprove: true },
  tool_creation: { min: 10, max: 50, autoApprove: false },
  suggestion: { min: 5, max: 40, autoApprove: false },
  weekly_bonus: { min: 5, max: 20, autoApprove: true },
  game_reward: { min: 1, max: 5, autoApprove: true },
} as const;

export const APPROVAL_THRESHOLD = 30; // Coins above this require admin approval
