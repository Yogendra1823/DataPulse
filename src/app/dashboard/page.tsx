"use client";

import { useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Percent, Users, Target } from "lucide-react";
import { useSalesData } from "@/hooks/use-sales-data";
import { 
  calculateKPIs, 
  formatCurrency, 
  formatNumber,
  getAggregatedProducts,
  getAggregatedRegions,
  getAggregatedSegments
} from "@/lib/utils";

const REGION_COLORS = ["#6366F1","#06B6D4","#10B981","#F59E0B","#F43F5E"];

function CT({ active, payload, label }: { active?: boolean; payload?: {name:string;value:number;color:string}[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const isMoney = (n: string) => ["revenue","Revenue","profit","Profit"].includes(n);
  return (
    <div style={{ background: "#0D0D2A", border: "1px solid rgba(99,102,241,.3)", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 700, marginBottom: 2 }}>
          {p.name}: {isMoney(p.name) ? formatCurrency(p.value) : formatNumber(p.value)}
        </p>
      ))}
    </div>
  );
}

function KPICard({ title, value, change, icon: Icon, color }: {
  title: string; value: string; change: number; icon: React.ElementType; color: string;
}) {
  const pos = change >= 0;
  return (
    <div className="rounded-2xl p-5 transition-all duration-200 cursor-default group"
      style={{ background: "rgba(255,255,255,.033)", border: "1px solid rgba(255,255,255,.07)" }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor=`${color}44`; el.style.transform="translateY(-2px)"; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor="rgba(255,255,255,.07)"; el.style.transform="translateY(0)"; }}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-[12.5px] text-dp-text-muted font-medium">{title}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
          <Icon size={17} style={{ color }} />
        </div>
      </div>
      <div className="text-[26px] font-black text-dp-text-primary tracking-tight mb-2">{value}</div>
      <div className={`flex items-center gap-1.5 text-xs font-semibold`} style={{ color: pos ? "#10B981" : "#F43F5E" }}>
        {pos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {Math.abs(change).toFixed(1)}% vs last month
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { data } = useSalesData();
  const kpi = useMemo(() => calculateKPIs(data), [data]);
  
  const products = useMemo(() => getAggregatedProducts(data), [data]);
  const segments = useMemo(() => getAggregatedSegments(data), [data]);
  const regions = useMemo(() => getAggregatedRegions(data), [data]);

  return (
    <div className="p-6 space-y-5">
      {/* Page header */}
      <div className="mb-2">
        <h1 className="text-xl font-black text-dp-text-primary">Overview</h1>
        <p className="text-sm text-dp-text-dim mt-0.5">Sales analytics at a glance</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KPICard title="Total Revenue"    value={formatCurrency(kpi.totalRevenue)}     change={kpi.revenueChange}  icon={DollarSign}    color="#6366F1" />
        <KPICard title="Total Sales"      value={formatNumber(kpi.totalSales)}          change={kpi.salesChange}    icon={ShoppingCart}  color="#06B6D4" />
        <KPICard title="Orders"           value={formatNumber(kpi.totalOrders)}         change={kpi.ordersChange}   icon={Package}       color="#10B981" />
        <KPICard title="Profit Margin"    value={`${kpi.profitMargin.toFixed(1)}%`}     change={2.1}                icon={Percent}       color="#F59E0B" />
        <KPICard title="Customers"        value={formatNumber(kpi.totalCustomers)}      change={22.3}               icon={Users}         color="#8B5CF6" />
        <KPICard title="Avg Order Value"  value={formatCurrency(kpi.avgOrderValue)}     change={3.7}                icon={Target}        color="#F43F5E" />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue trend */}
        <div className="lg:col-span-2 dp-card p-5">
          <div className="mb-4">
            <h2 className="text-[14.5px] font-bold text-dp-text-primary">Revenue & Profit Trend</h2>
            <p className="text-xs text-dp-text-dim mt-0.5">12-month comparative analysis</p>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="gr-rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gr-pft" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
              <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10.5 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} width={58} />
              <Tooltip content={<CT />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366F1" strokeWidth={2.5} fill="url(#gr-rev)" />
              <Area type="monotone" dataKey="profit"  name="Profit"  stroke="#10B981" strokeWidth={1.8} fill="url(#gr-pft)" strokeDasharray="5 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Segments */}
        <div className="dp-card p-5">
          <div className="mb-4">
            <h2 className="text-[14.5px] font-bold text-dp-text-primary">Customer Segments</h2>
            <p className="text-xs text-dp-text-dim mt-0.5">Revenue share by segment</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={segments} cx="50%" cy="50%" innerRadius={44} outerRadius={68} dataKey="value" paddingAngle={3}>
                {segments.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip 
                formatter={(v: number) => `${v}%`} 
                contentStyle={{ background: "#0D0D2A", border: "1px solid rgba(99,102,241,.3)", borderRadius: 10, fontSize: 12 }} 
                itemStyle={{ color: "#CBD5E1" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {segments.map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-dp-text-secondary">{s.name}</span>
                </div>
                <span className="text-dp-text-primary font-semibold">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="dp-card p-5">
          <h2 className="text-[14.5px] font-bold text-dp-text-primary mb-1">Top Products</h2>
          <p className="text-xs text-dp-text-dim mb-4">Revenue by product line</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={products} layout="vertical" margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" horizontal={false} />
              <XAxis type="number" tickFormatter={v => formatCurrency(v)} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10.5 }} axisLine={false} tickLine={false} width={96} />
              <Tooltip content={<CT />} cursor={{ fill: "rgba(255, 255, 255, 0.04)" }} />
              <Bar dataKey="revenue" name="Revenue" fill="#6366F1" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dp-card p-5">
          <h2 className="text-[14.5px] font-bold text-dp-text-primary mb-1">Monthly Orders</h2>
          <p className="text-xs text-dp-text-dim mb-4">Order volume trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10.5 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => formatNumber(v)} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CT />} cursor={{ fill: "rgba(255, 255, 255, 0.04)" }} />
              <Bar dataKey="orders" name="Orders" fill="#06B6D4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regions */}
      <div className="dp-card p-5">
        <h2 className="text-[14.5px] font-bold text-dp-text-primary mb-1">Regional Performance</h2>
        <p className="text-xs text-dp-text-dim mb-5">Revenue breakdown by geography</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {regions.map((r, i) => (
            <div key={r.region} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)" }}>
              <p className="text-xs text-dp-text-dim mb-2 font-medium">{r.region}</p>
              <p className="text-[17px] font-black text-dp-text-primary mb-2">{formatCurrency(r.revenue)}</p>
              <div className="h-1 rounded-full bg-white/[0.07] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${r.share}%`, background: REGION_COLORS[i % REGION_COLORS.length] }} />
              </div>
              <p className="text-[10.5px] text-dp-text-dim mt-1.5">{r.share}% of total</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
