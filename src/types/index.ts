// ─────────────────────────────────────────────────────────────────────────────
// Core Data Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SalesRecord {
  id?: string;
  month?: string;
  date?: string;
  revenue: number;
  sales?: number;
  orders?: number;
  profit?: number;
  customers?: number;
  region?: string;
  product?: string;
  category?: string;
  [key: string]: unknown;
}

export interface ProductData {
  name: string;
  revenue: number;
  units: number;
  growth: number;
}

export interface RegionData {
  region: string;
  revenue: number;
  share: number;
}

export interface SegmentData {
  name: string;
  value: number;
  color: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Types
// ─────────────────────────────────────────────────────────────────────────────

export interface KPIMetrics {
  totalRevenue: number;
  totalSales: number;
  totalOrders: number;
  totalProfit: number;
  totalCustomers: number;
  profitMargin: number;
  avgOrderValue: number;
  revenueChange: number;
  salesChange: number;
  ordersChange: number;
}

export interface KPICard {
  id: string;
  title: string;
  value: string;
  rawValue: number;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: string;
  color: string;
  description?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Database Types (Supabase)
// ─────────────────────────────────────────────────────────────────────────────

export interface Upload {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  row_count: number;
  column_names: string[];
  status: "pending" | "processing" | "completed" | "failed";
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  upload_id?: string;
  title: string;
  report_type:
    | "executive"
    | "trends"
    | "anomalies"
    | "forecast"
    | "products";
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface AIInsight {
  id: string;
  user_id: string;
  upload_id?: string;
  insight_type: string;
  prompt: string;
  response: string;
  model: string;
  tokens_used?: number;
  created_at: string;
}

export interface DashboardSettings {
  id: string;
  user_id: string;
  theme: "dark" | "light" | "system";
  default_date_range: string;
  pinned_charts: string[];
  kpi_layout: string[];
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: "viewer" | "analyst" | "admin";
  plan: "free" | "pro" | "enterprise";
  team_id?: string;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface InsightRequest {
  type: "executive" | "trends" | "anomalies" | "forecast" | "products";
  data: SalesRecord[];
  products?: ProductData[];
  regions?: RegionData[];
}

export interface InsightResponse {
  content: string;
  model: string;
  tokensUsed: number;
  generatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Upload / Parse Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ParseResult {
  data: SalesRecord[];
  headers: string[];
  rowCount: number;
  errors: string[];
  columnMapping: ColumnMapping;
}

export interface ColumnMapping {
  revenue?: string;
  sales?: string;
  orders?: string;
  profit?: string;
  customers?: string;
  date?: string;
  month?: string;
  region?: string;
  product?: string;
}

export type TimeRange = "7d" | "30d" | "90d" | "6m" | "1y" | "all";
export type ChartType = "area" | "bar" | "line" | "pie" | "scatter";
export type InsightType =
  | "executive"
  | "trends"
  | "anomalies"
  | "forecast"
  | "products";
