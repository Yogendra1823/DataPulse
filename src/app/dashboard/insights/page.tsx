"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, FileText, TrendingUp, AlertTriangle, LineChart, Package } from "lucide-react";
import { toast } from "sonner";
import { useSalesData } from "@/hooks/use-sales-data";
import { getAggregatedProducts } from "@/lib/utils";

const TYPES = [
  { id: "executive",  label: "Executive Summary",  icon: FileText,       color: "#6366F1" },
  { id: "trends",     label: "Trend Analysis",      icon: TrendingUp,     color: "#06B6D4" },
  { id: "anomalies",  label: "Anomaly Detection",   icon: AlertTriangle,  color: "#F59E0B" },
  { id: "forecast",   label: "Revenue Forecast",    icon: LineChart,      color: "#10B981" },
  { id: "products",   label: "Product Insights",    icon: Package,        color: "#8B5CF6" },
] as const;
type InsightType = typeof TYPES[number]["id"];

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-3" />;
    if (line.startsWith("## ")) return <h3 key={i} className="text-base font-bold text-dp-text-primary mt-5 mb-2">{line.slice(3)}</h3>;
    if (line.startsWith("# "))  return <h2 key={i} className="text-lg font-black text-dp-text-primary mt-6 mb-2">{line.slice(2)}</h2>;
    if (line.startsWith("**") && line.endsWith("**"))
      return <h3 key={i} className="text-[14.5px] font-bold text-dp-text-primary mt-5 mb-2">{line.slice(2,-2)}</h3>;
    if (line.match(/^[-•] /)) {
      const content = line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong class='text-dp-text-primary font-semibold'>$1</strong>");
      return (
        <div key={i} className="flex gap-2.5 mb-2">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#6366F1" }} />
          <span className="text-sm text-dp-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      );
    }
    const html = line.replace(/\*\*(.*?)\*\*/g, "<strong class='text-dp-text-primary font-semibold'>$1</strong>");
    return <p key={i} className="text-sm text-dp-text-secondary leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

export default function InsightsPage() {
  const { data }  = useSalesData();
  const [type,    setType]    = useState<InsightType>("executive");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true); setContent("");
    try {
      const products = getAggregatedProducts(data);
      const res = await fetch("/api/ai/insights", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type, data, products }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      const json = await res.json();
      setContent(json.content);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(`AI error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  const activeType = TYPES.find(t => t.id === type)!;

  return (
    <div className="p-6 space-y-5">
      <div className="mb-2">
        <h1 className="text-xl font-black text-dp-text-primary">AI Insights</h1>
        <p className="text-sm text-dp-text-dim mt-0.5">Gemini-powered revenue intelligence</p>
      </div>

      {/* Type selector + generate */}
      <div className="flex flex-wrap gap-2 items-center">
        {TYPES.map(t => (
          <button key={t.id} onClick={() => { setType(t.id); setContent(""); }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150"
            style={{
              background:   type === t.id ? `${t.color}20` : "rgba(255,255,255,.04)",
              border:       `1px solid ${type === t.id ? `${t.color}44` : "rgba(255,255,255,.1)"}`,
              color:        type === t.id ? t.color : "#94A3B8",
            }}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
        <button className="dp-btn-primary ml-auto text-sm py-2 px-4" onClick={generate} disabled={loading}>
          {loading
            ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</>
            : <><Sparkles size={14} /> Generate</>}
        </button>
      </div>

      {/* Empty state */}
      {!content && !loading && (
        <div className="dp-card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(99,102,241,.15)" }}>
            <Sparkles size={32} style={{ color: "#6366F1" }} />
          </div>
          <h2 className="text-xl font-bold text-dp-text-primary mb-3">AI-Powered Revenue Intelligence</h2>
          <p className="text-sm text-dp-text-secondary max-w-sm mx-auto mb-8 leading-relaxed">
            Select an insight type and click <strong className="text-dp-text-primary">Generate</strong> to get Gemini AI to analyze your sales data.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-2xl mx-auto">
            {TYPES.map(t => (
              <button key={t.id} onClick={() => { setType(t.id); generate(); }}
                className="p-4 rounded-xl text-left transition-all duration-200 hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}>
                <t.icon size={20} style={{ color: t.color }} className="mb-2" />
                <div className="text-xs font-semibold text-dp-text-secondary">{t.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="dp-card p-14 text-center">
          <div className="w-12 h-12 border-2 border-[#6366F1]/20 border-t-[#6366F1] rounded-full animate-spin mx-auto mb-5" />
          <p className="text-base text-dp-text-secondary font-medium">Gemini is analyzing your sales data…</p>
          <p className="text-xs text-dp-text-dim mt-2">This takes a few seconds</p>
        </div>
      )}

      {/* Result */}
      {content && !loading && (
        <div className="dp-card p-7">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b" style={{ borderColor: "rgba(255,255,255,.06)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${activeType.color}20` }}>
              <activeType.icon size={20} style={{ color: activeType.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[15px] font-bold text-dp-text-primary">{activeType.label}</h2>
              <p className="text-xs text-dp-text-dim mt-0.5">Generated by Gemini AI · {new Date().toLocaleDateString()}</p>
            </div>
            <button className="dp-btn-secondary text-xs py-1.5 px-3" onClick={generate}>
              <RefreshCw size={12} /> Regenerate
            </button>
          </div>
          <div>{renderMarkdown(content)}</div>
        </div>
      )}
    </div>
  );
}
