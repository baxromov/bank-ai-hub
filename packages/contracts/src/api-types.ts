// ============================================
// Identity
// ============================================

export type UserRole = "employee" | "dept_head" | "admin" | "super_admin";

export type Department =
  | "it"
  | "hr"
  | "risk"
  | "sales"
  | "operations"
  | "finance"
  | "legal"
  | "marketing";

export interface User {
  id: string;
  employee_id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  department: Department;
  position: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ============================================
// Coin Economy
// ============================================

export type CoinActionType =
  | "quality_prompt"
  | "document_creation"
  | "tool_usage"
  | "tool_creation"
  | "suggestion"
  | "weekly_bonus"
  | "marketplace_purchase"
  | "admin_award"
  | "admin_deduction"
  | "game_reward";

export type TransactionStatus = "pending" | "approved" | "rejected" | "completed";

export interface CoinBalance {
  balance: number;
  total_earned: number;
  total_spent: number;
}

export interface CoinTransaction {
  id: string;
  action_type: CoinActionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  quality_score: number | null;
  created_at: string | null;
}

export interface CoinRule {
  id: string;
  action_type: string;
  min_amount: number;
  max_amount: number;
  auto_approve: boolean;
  is_active: boolean;
}

// ============================================
// Ranking
// ============================================

export type RankingCategory =
  | "ai_innovator"
  | "best_optimizer"
  | "ai_contributor"
  | "silent_hero";

export interface RankingEntry {
  user_id: string;
  category: RankingCategory;
  score: number;
  rank: number;
  week_number: number;
  year: number;
}

export interface Badge {
  id: string;
  name: string;
  name_ru: string;
  description: string;
  icon_url: string;
  category: string;
}

// ============================================
// Chat
// ============================================

export type MessageRole = "user" | "assistant" | "system" | "tool";
export type AgentMode = "simple_chat" | "react_agent";

export interface ChatSession {
  id: string;
  title: string;
  model: string;
  agent_mode: AgentMode;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  token_count?: number;
  latency_ms?: number;
  tool_calls?: Record<string, unknown>[];
  created_at: string | null;
}

export interface CreateSessionRequest {
  title?: string;
  model?: string;
  agent_mode?: AgentMode;
}

export interface SendMessageRequest {
  content: string;
}

export interface StreamRequest {
  session_id: string;
  content: string;
  model?: string;
}

// ============================================
// Marketplace
// ============================================

export type MarketplaceCategory =
  | "professional"
  | "work_privileges"
  | "bonuses"
  | "mcp_tools";

export type PurchaseStatus = "pending" | "approved" | "fulfilled" | "rejected";

export interface MarketplaceItem {
  id: string;
  name: string;
  name_ru: string;
  description: string;
  category: MarketplaceCategory;
  price: number;
  image_url: string;
  stock: number | null;
  linked_tool_id: string | null;
}

export interface Purchase {
  id: string;
  item_id: string;
  coins_cost: number;
  status: PurchaseStatus;
  created_at: string | null;
}

// ============================================
// Tools (MCP)
// ============================================

export type ToolStatus = "draft" | "submitted" | "under_review" | "published" | "disabled";

export type ToolCategory =
  | "document"
  | "analysis"
  | "automation"
  | "data"
  | "communication";

export interface McpTool {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: ToolCategory;
  department: string | null;
  version: string;
  status: ToolStatus;
  coin_price: number | null;
  usage_count: number;
  average_rating: number;
  author_id: string;
}

// ============================================
// Suggestions
// ============================================

export type SuggestionStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "implemented";

export interface Suggestion {
  id: string;
  user_id: string;
  title: string;
  description: string;
  department: string;
  impact: string;
  status: SuggestionStatus;
  coin_reward: number;
  quality_score: number | null;
  created_at: string | null;
}

// ============================================
// Notifications
// ============================================

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string | null;
}

// ============================================
// WebSocket Events
// ============================================

export type WsEventType =
  | "coin_earned"
  | "rank_updated"
  | "badge_earned"
  | "leaderboard_update"
  | "tool_published"
  | "approval_requested";

export interface WsEvent<T = unknown> {
  type: WsEventType;
  data: T;
}

export interface CoinEarnedEvent {
  userId: string;
  amount: number;
  newBalance: number;
  actionType: string;
}

export interface RankUpdatedEvent {
  userId: string;
  category: RankingCategory;
  newRank: number;
}

export interface BadgeEarnedEvent {
  userId: string;
  badgeId: string;
  badgeName: string;
}
