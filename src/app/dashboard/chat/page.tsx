"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { useSalesData } from "@/hooks/use-sales-data";
import { calculateKPIs, formatCurrency } from "@/lib/utils";

interface Message { role: "user" | "assistant"; content: string; ts: string; }

const SUGGESTIONS = [
  "What drove revenue growth in H2?",
  "Which month had the highest profit margin?",
  "What is the trend in customer growth?",
  "Give me a Q1 revenue forecast.",
  "Which product has the highest growth rate?",
  "What was the worst performing month?",
];

export default function ChatPage() {
  const { data } = useSalesData();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm your AI data analyst. Ask me anything about your sales data — trends, top products, anomalies, forecasts, or specific metrics. What would you like to explore?",
      ts: new Date().toISOString(),
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const kpi = calculateKPIs(data);
  const dataContext = [
    `Total Revenue: ${formatCurrency(kpi.totalRevenue)}, Sales: ${kpi.totalSales.toLocaleString()}, Orders: ${kpi.totalOrders.toLocaleString()}`,
    `Profit Margin: ${kpi.profitMargin.toFixed(1)}%, Avg Order Value: ${formatCurrency(kpi.avgOrderValue)}`,
    `Monthly data (last 6): ${data.slice(-6).map(d => `${d.month}: ${formatCurrency(d.revenue)}`).join(", ")}`,
    `Revenue change last month: ${kpi.revenueChange.toFixed(1)}%`,
  ].join("\n");

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: q, ts: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ question: q, history, dataContext }),
      });
      const json = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: json.content ?? "Sorry, I couldn't generate a response.", ts: new Date().toISOString() }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "I encountered an error. Please check your API key and try again.", ts: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ minHeight: "calc(100vh - 58px)" }}>
      {/* Header */}
      <div className="px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "rgba(255,255,255,.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366F1,#06B6D4)" }}>
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-dp-text-primary">Ask Your Data</h1>
            <p className="text-xs text-dp-text-dim">Powered by Gemini AI · {data.length} months of data loaded</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.2)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
            <span className="text-xs text-emerald-400 font-medium">Ready</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 self-start ${m.role === "assistant" ? "" : ""}`}
              style={{ background: m.role === "assistant" ? "linear-gradient(135deg,#6366F1,#06B6D4)" : "rgba(255,255,255,.1)" }}>
              {m.role === "assistant" ? <Bot size={15} className="text-white" /> : <User size={15} className="text-dp-text-secondary" />}
            </div>
            {/* Bubble */}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
              style={{
                background: m.role === "user" ? "rgba(99,102,241,.22)" : "rgba(255,255,255,.055)",
                border:     m.role === "user" ? "none" : "1px solid rgba(255,255,255,.08)",
                color:      m.role === "user" ? "#E0E7FF" : "#CBD5E1",
                alignSelf:  m.role === "user" ? "flex-end" : "flex-start",
              }}>
              {m.content}
            </div>
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#6366F1,#06B6D4)" }}>
              <Bot size={15} className="text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: "rgba(255,255,255,.055)", border: "1px solid rgba(255,255,255,.08)" }}>
              <div className="flex gap-1.5 items-center h-5">
                {[0, 0.2, 0.4].map(d => (
                  <div key={d} className="w-1.5 h-1.5 rounded-full" style={{ background: "#6366F1", animation: `blink 1.2s ease ${d}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggestion chips (only first message) */}
        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2 pt-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150 hover:-translate-y-0.5"
                style={{ background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.22)", color: "#818CF8" }}>
                <Sparkles size={11} className="inline mr-1" />{s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t flex-shrink-0" style={{ background: "#08081C", borderColor: "rgba(255,255,255,.06)" }}>
        <div className="flex gap-3">
          <input
            className="dp-input flex-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask anything about your sales data…"
          />
          <button className="dp-btn-primary px-4 py-2 flex-shrink-0" onClick={() => send()} disabled={loading || !input.trim()}>
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-[11px] text-dp-text-dim mt-2">Press Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  );
}
