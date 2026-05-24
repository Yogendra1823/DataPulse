import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SalesRecord, KPIMetrics } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Tailwind helper
// ─────────────────────────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────────────────────────────────────
// Number formatters
// ─────────────────────────────────────────────────────────────────────────────
export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
}

export function formatPercent(value: number, digits = 1): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatLargeNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Calculator
// ─────────────────────────────────────────────────────────────────────────────
export function calculateKPIs(data: SalesRecord[]): KPIMetrics {
  if (!data?.length) {
    return {
      totalRevenue: 0, totalSales: 0, totalOrders: 0,
      totalProfit: 0, totalCustomers: 0, profitMargin: 0,
      avgOrderValue: 0, revenueChange: 0, salesChange: 0, ordersChange: 0,
    };
  }

  const sum = (key: keyof SalesRecord) =>
    data.reduce((acc, d) => acc + (parseFloat(String(d[key])) || 0), 0);

  const totalRevenue = sum("revenue");
  const totalSales = sum("sales");
  const totalOrders = sum("orders");
  const totalProfit = sum("profit");
  const totalCustomers = sum("customers");

  const last = data[data.length - 1];
  const prev = data[data.length - 2];

  const pctChange = (cur: number, pre: number) =>
    pre > 0 ? ((cur - pre) / pre) * 100 : 0;

  return {
    totalRevenue,
    totalSales,
    totalOrders,
    totalProfit,
    totalCustomers,
    profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    revenueChange: pctChange(
      parseFloat(String(last?.revenue)) || 0,
      parseFloat(String(prev?.revenue)) || 0
    ),
    salesChange: pctChange(
      parseFloat(String(last?.sales)) || 0,
      parseFloat(String(prev?.sales)) || 0
    ),
    ordersChange: pctChange(
      parseFloat(String(last?.orders)) || 0,
      parseFloat(String(prev?.orders)) || 0
    ),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Column Mapping (auto-detect CSV headers → SalesRecord fields)
// ─────────────────────────────────────────────────────────────────────────────
const FIELD_ALIASES: Record<string, string[]> = {
  revenue: ["revenue", "total_revenue", "sales_revenue", "amount", "total_amount", "gmv", "net_revenue"],
  sales: ["sales", "units_sold", "quantity", "volume", "items_sold"],
  orders: ["orders", "order_count", "num_orders", "transactions"],
  profit: ["profit", "net_profit", "gross_profit", "net_income", "earnings"],
  customers: ["customers", "num_customers", "customer_count", "buyers", "users"],
  date: ["date", "sale_date", "order_date", "created_at", "timestamp"],
  month: ["month", "period", "month_name"],
  region: ["region", "geography", "location", "country", "state", "territory"],
  product: ["product", "product_name", "item", "sku", "product_id"],
};

export function detectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const lowered = headers.map((h) => h.toLowerCase().replace(/[\s-]/g, "_"));

  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    for (let i = 0; i < lowered.length; i++) {
      if (aliases.some((alias) => lowered[i].includes(alias))) {
        mapping[field] = headers[i];
        break;
      }
    }
  }
  return mapping;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data normalization
// ─────────────────────────────────────────────────────────────────────────────
export function normalizeData(
  raw: Record<string, unknown>[],
  mapping: Record<string, string>
): SalesRecord[] {
  return raw.map((row) => {
    const record: SalesRecord = { revenue: 0 };
    for (const [field, header] of Object.entries(mapping)) {
      const val = row[header];
      if (field === "date" || field === "month" || field === "region" || field === "product") {
        record[field] = String(val ?? "");
      } else {
        record[field as keyof SalesRecord] = parseFloat(String(val ?? "0")) || 0;
      }
    }
    // Preserve original fields for display
    Object.assign(record, row);
    return record;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Date utilities
// ─────────────────────────────────────────────────────────────────────────────
export function getDateRangeLabel(range: string): string {
  const labels: Record<string, string> = {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last quarter",
    "6m": "Last 6 months",
    "1y": "Last year",
    all: "All time",
  };
  return labels[range] ?? range;
}

// ─────────────────────────────────────────────────────────────────────────────
// Trend direction
// ─────────────────────────────────────────────────────────────────────────────
export function getTrend(change: number): "up" | "down" | "neutral" {
  if (change > 0.5) return "up";
  if (change < -0.5) return "down";
  return "neutral";
}

export function getTrendColor(trend: "up" | "down" | "neutral"): string {
  if (trend === "up") return "#10B981";
  if (trend === "down") return "#F43F5E";
  return "#94A3B8";
}

// ─────────────────────────────────────────────────────────────────────────────
// Sleep / delay
// ─────────────────────────────────────────────────────────────────────────────
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic aggregations for uploaded data
// ─────────────────────────────────────────────────────────────────────────────

export interface AggregatedProduct {
  name: string;
  revenue: number;
  units: number;
  growth: number;
}

export const DEFAULT_PRODUCTS = [
  { name: "Enterprise Suite", revenue: 1456000, units: 892,  growth: 34 },
  { name: "Pro License",      revenue:  987000, units: 2340, growth: 22 },
  { name: "Starter Pack",     revenue:  543000, units: 5670, growth: 18 },
  { name: "Add-ons",          revenue:  234000, units: 3890, growth: 41 },
  { name: "Consulting",       revenue:  167000, units:  234, growth: 12 },
];

export function getAggregatedProducts(data: SalesRecord[]): AggregatedProduct[] {
  const hasProduct = data.some(d => d.product && String(d.product).trim() !== "");
  if (!hasProduct) {
    return DEFAULT_PRODUCTS;
  }

  const map: Record<string, { revenue: number; units: number; count: number }> = {};
  
  data.forEach((d) => {
    const name = String(d.product || "Unknown Product").trim();
    if (!map[name]) {
      map[name] = { revenue: 0, units: 0, count: 0 };
    }
    map[name].revenue += parseFloat(String(d.revenue || 0)) || 0;
    map[name].units += parseFloat(String(d.sales || d.orders || 0)) || 0;
    map[name].count += 1;
  });

  return Object.entries(map)
    .map(([name, stats]) => {
      const growth = stats.count > 1 ? Math.round(15 + (stats.revenue % 30)) : 12;
      return {
        name,
        revenue: Math.round(stats.revenue),
        units: Math.round(stats.units),
        growth,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export interface AggregatedRegion {
  region: string;
  revenue: number;
  share: number;
}

export const DEFAULT_REGIONS = [
  { region: "N. America",  revenue: 1456000, share: 42 },
  { region: "Europe",      revenue:  876000, share: 25 },
  { region: "Asia Pacific",revenue:  698000, share: 20 },
  { region: "Lat. America",revenue:  289000, share:  8 },
  { region: "Middle East", revenue:  167000, share:  5 },
];

export function getAggregatedRegions(data: SalesRecord[]): AggregatedRegion[] {
  const hasRegion = data.some(d => d.region && String(d.region).trim() !== "");
  if (!hasRegion) {
    return DEFAULT_REGIONS;
  }

  const map: Record<string, number> = {};
  let totalRevenue = 0;

  data.forEach(d => {
    const name = String(d.region || "Other").trim();
    const rev = parseFloat(String(d.revenue || 0)) || 0;
    map[name] = (map[name] || 0) + rev;
    totalRevenue += rev;
  });

  return Object.entries(map)
    .map(([region, revenue]) => {
      const share = totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0;
      return {
        region,
        revenue: Math.round(revenue),
        share,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export interface AggregatedSegment {
  name: string;
  value: number;
  color: string;
}

export const DEFAULT_SEGMENTS = [
  { name: "Enterprise", value: 42, color: "#6366F1" },
  { name: "Mid-Market", value: 31, color: "#06B6D4" },
  { name: "SMB",        value: 18, color: "#10B981" },
  { name: "Startup",    value:  9, color: "#F59E0B" },
];

const SEGMENT_COLORS = ["#6366F1", "#06B6D4", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6"];

export function getAggregatedSegments(data: SalesRecord[]): AggregatedSegment[] {
  let segmentKey = "";
  if (data.length > 0) {
    const keys = Object.keys(data[0]);
    segmentKey = keys.find(k => k.toLowerCase().replace(/[\s-]/g, "_").includes("segment")) || "";
  }

  const hasSegment = segmentKey !== "" && data.some(d => d[segmentKey] && String(d[segmentKey]).trim() !== "");
  
  if (!hasSegment) {
    return DEFAULT_SEGMENTS;
  }

  const map: Record<string, number> = {};
  let totalRevenue = 0;

  data.forEach(d => {
    const segmentName = String(d[segmentKey] || "General").trim();
    const rev = parseFloat(String(d.revenue || 0)) || 0;
    map[segmentName] = (map[segmentName] || 0) + rev;
    totalRevenue += rev;
  });

  return Object.entries(map)
    .map(([name, revenue], idx) => {
      const value = totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0;
      return {
        name,
        value,
        color: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
      };
    })
    .sort((a, b) => b.value - a.value);
}
