"use client";

import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Download } from "lucide-react";
import { useSalesData } from "@/hooks/use-sales-data";
import { formatCurrency, formatNumber, getAggregatedProducts } from "@/lib/utils";

function CT({ active, payload, label }: { active?: boolean; payload?: {name:string;value:number;color:string}[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const isMoney = (n: string) => /revenue|profit/i.test(n);
  return (
    <div style={{ background: "#0D0D2A", border: "1px solid rgba(99,102,241,.3)", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ color: "#94A3B8", marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 700, marginBottom: 2 }}>
          {p.name}: {isMoney(p.name) ? formatCurrency(p.value) : formatNumber(p.value)}
        </p>
      ))}
    </div>
  );
}

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150"
      style={{
        background: active ? "rgba(99,102,241,.2)" : "rgba(255,255,255,.04)",
        border:     `1px solid ${active ? "rgba(99,102,241,.4)" : "rgba(255,255,255,.1)"}`,
        color:      active ? "#818CF8" : "#94A3B8",
      }}>
      {label}
    </button>
  );
}

export default function AnalyticsPage() {
  const { data }    = useSalesData();
  const [range, setRange] = useState("all");
  const products = useMemo(() => getAggregatedProducts(data), [data]);

  const filtered = useMemo(() => {
    if (range === "q4") return data.slice(-3);
    if (range === "h2") return data.slice(-6);
    return data;
  }, [data, range]);

  function exportCSV() {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(",");
    const rows    = data.map(r => Object.values(r).join(",")).join("\n");
    const blob    = new Blob([headers + "\n" + rows], { type: "text/csv" });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement("a");
    a.href = url; a.download = "datapulse-export.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-dp-text-primary">Analytics</h1>
          <p className="text-sm text-dp-text-dim mt-0.5">Deep dive into your sales metrics</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Toggle label="Full Year"     active={range==="all"} onClick={()=>setRange("all")} />
          <Toggle label="Last 6 Mo."   active={range==="h2"}  onClick={()=>setRange("h2")}  />
          <Toggle label="Last Quarter" active={range==="q4"}  onClick={()=>setRange("q4")}  />
          <button className="dp-btn-secondary text-sm py-2" onClick={exportCSV}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="dp-card p-5">
          <h2 className="text-[14.5px] font-bold text-dp-text-primary mb-1">Revenue vs Profit</h2>
          <p className="text-xs text-dp-text-dim mb-4">Comparative trend analysis</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={filtered}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
              <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10.5 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} width={58} />
              <Tooltip content={<CT />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#94A3B8", paddingTop: 8 }} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 3.5, fill: "#6366F1" }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="profit"  name="Profit"  stroke="#10B981" strokeWidth={2}   dot={{ r: 3,   fill: "#10B981" }} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="dp-card p-5">
          <h2 className="text-[14.5px] font-bold text-dp-text-primary mb-1">Sales & Orders</h2>
          <p className="text-xs text-dp-text-dim mb-4">Volume comparison</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={filtered}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10.5 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => formatNumber(v)} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} width={42} />
              <Tooltip content={<CT />} cursor={{ fill: "rgba(255, 255, 255, 0.04)" }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#94A3B8", paddingTop: 8 }} />
              <Bar dataKey="sales"  name="Sales"  fill="#6366F1" radius={[3,3,0,0]} />
              <Bar dataKey="orders" name="Orders" fill="#06B6D4" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="dp-card p-5">
          <h2 className="text-[14.5px] font-bold text-dp-text-primary mb-1">Customer Growth</h2>
          <p className="text-xs text-dp-text-dim mb-4">New customer acquisition trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={filtered}>
              <defs>
                <linearGradient id="gr-cust" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
              <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10.5 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => formatNumber(v)} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} width={42} />
              <Tooltip content={<CT />} />
              <Area type="monotone" dataKey="customers" name="customers" stroke="#8B5CF6" strokeWidth={2} fill="url(#gr-cust)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="dp-card p-5">
          <h2 className="text-[14.5px] font-bold text-dp-text-primary mb-1">Product Revenue</h2>
          <p className="text-xs text-dp-text-dim mb-4">By product line</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={products} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" horizontal={false} />
              <XAxis type="number" tickFormatter={v => formatCurrency(v)} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CT />} cursor={{ fill: "rgba(255, 255, 255, 0.04)" }} />
              <Bar dataKey="revenue" name="Revenue" fill="#F59E0B" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance table */}
      <div className="dp-card overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,.06)" }}>
          <h2 className="text-sm font-bold text-dp-text-primary">Monthly Performance Table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,.03)" }}>
                {["Month","Revenue","Sales","Orders","Profit","Margin","MoM Δ"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold whitespace-nowrap"
                    style={{ color: "#64748B", fontSize: 11.5, borderBottom: "1px solid rgba(255,255,255,.06)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const margin = r.revenue ? ((r.profit ?? 0) / r.revenue * 100) : 0;
                const prev   = i > 0 ? filtered[i - 1] : null;
                const chg    = prev ? ((r.revenue - prev.revenue) / prev.revenue * 100) : null;
                return (
                  <tr key={i} className="transition-colors hover:bg-white/[0.025]">
                    <td className="px-4 py-2.5 font-semibold text-dp-text-primary" style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>{r.month}</td>
                    <td className="px-4 py-2.5 text-dp-text-secondary" style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>{formatCurrency(r.revenue)}</td>
                    <td className="px-4 py-2.5 text-dp-text-secondary" style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>{formatNumber(r.sales ?? 0)}</td>
                    <td className="px-4 py-2.5 text-dp-text-secondary" style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>{formatNumber(r.orders ?? 0)}</td>
                    <td className="px-4 py-2.5 text-dp-text-secondary" style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>{formatCurrency(r.profit ?? 0)}</td>
                    <td className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                      <span className="font-semibold" style={{ color: margin > 25 ? "#10B981" : "#F59E0B" }}>{margin.toFixed(1)}%</span>
                    </td>
                    <td className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                      {chg !== null ? (
                        <span className="font-semibold text-xs" style={{ color: chg >= 0 ? "#10B981" : "#F43F5E" }}>
                          {chg >= 0 ? "↑" : "↓"}{Math.abs(chg).toFixed(1)}%
                        </span>
                      ) : <span className="text-dp-text-dim">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
