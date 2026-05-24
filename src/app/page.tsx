"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { Check, Zap, TrendingUp, Brain, Upload, MessageSquare, BarChart3, Shield } from "lucide-react";

const PREVIEW_DATA = [
  { month: "Jan", revenue: 245000 }, { month: "Feb", revenue: 189000 },
  { month: "Mar", revenue: 312000 }, { month: "Apr", revenue: 276000 },
  { month: "May", revenue: 398000 }, { month: "Jun", revenue: 445000 },
  { month: "Jul", revenue: 521000 }, { month: "Aug", revenue: 487000 },
  { month: "Sep", revenue: 563000 }, { month: "Oct", revenue: 612000 },
  { month: "Nov", revenue: 698000 }, { month: "Dec", revenue: 843000 },
];

const FEATURES = [
  { icon: BarChart3, title: "Instant KPI Dashboard", desc: "Auto-generate revenue, sales, profit and growth KPIs from raw data with zero configuration.", color: "#6366F1" },
  { icon: Brain, title: "AI Business Reports", desc: "Executive-level summaries, trend explanations, and strategic recommendations powered by Gemini AI.", color: "#06B6D4" },
  { icon: TrendingUp, title: "Smart Forecasting", desc: "Predict future revenue and sales trends using historical patterns and statistical modeling.", color: "#10B981" },
  { icon: Zap, title: "Anomaly Detection", desc: "Automatically surface unusual patterns, sudden drops, and hidden growth opportunities.", color: "#F59E0B" },
  { icon: MessageSquare, title: "Ask Your Data", desc: 'Chat naturally with your data. "Why did sales drop in March?" — get instant AI answers.', color: "#8B5CF6" },
  { icon: Upload, title: "CSV & Excel Upload", desc: "Drag-and-drop your existing spreadsheets. Auto-detect columns and map them intelligently.", color: "#F43F5E" },
];

const PRICING = [
  {
    name: "Starter", price: "$0", period: "/mo", color: "#64748B",
    features: ["5 uploads/month", "Basic KPI dashboard", "CSV support", "7-day history", "Email support"],
    cta: "Start free", highlight: false,
  },
  {
    name: "Pro", price: "$49", period: "/mo", color: "#6366F1",
    features: ["Unlimited uploads", "AI insights & reports", "CSV + Excel", "Ask your data chat", "Forecasting", "Priority support", "Export to PDF/Excel"],
    cta: "Start Pro trial", highlight: true,
  },
  {
    name: "Enterprise", price: "$199", period: "/mo", color: "#06B6D4",
    features: ["Everything in Pro", "Custom integrations", "Team collaboration (20 seats)", "Role-based access", "SSO / SAML", "SLA guarantee", "Dedicated CSM"],
    cta: "Contact sales", highlight: false,
  },
];

const TESTIMONIALS = [
  { name: "Sarah Chen", role: "VP of Revenue, Acme Corp", quote: "DataPulse cut our monthly reporting time from 2 days to 20 minutes. The AI insights are genuinely actionable.", stars: 5, avatar: "SC" },
  { name: "Marcus Williams", role: "Head of Sales, TechFlow", quote: "The 'Ask Your Data' feature is a game changer. My whole team can now get answers without waiting for the data team.", stars: 5, avatar: "MW" },
  { name: "Priya Patel", role: "CFO, StartupX", quote: "We uploaded our 3-year sales history and had an executive summary ready in minutes. Absolutely remarkable.", stars: 5, avatar: "PP" },
];

const fmtRev = (v: number) => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : `$${(v / 1e3).toFixed(0)}K`;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dp-bg overflow-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 bg-dp-grid bg-dp-grid opacity-100 pointer-events-none" />

      {/* Gradient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(99,102,241,.12),transparent 70%)", filter: "blur(40px)" }} />
      <div className="fixed top-20 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(6,182,212,.08),transparent 70%)", filter: "blur(40px)" }} />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: "rgba(5,5,15,.92)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,.06)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[9px] flex items-center justify-center text-sm font-black text-white"
              style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)" }}>D</div>
            <span className="font-black text-lg text-dp-text-primary tracking-tight">DataPulse</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-dp-text-secondary">
            <a href="#features" className="hover:text-dp-text-primary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-dp-text-primary transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="dp-btn-secondary text-sm px-4 py-2">Log in</Link>
            <Link href="/signup" className="dp-btn-primary text-sm px-4 py-2">Start free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{ background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.2)", color: "#818CF8" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8] animate-pulse-slow" />
            Powered by Gemini AI — Real-time analytics intelligence
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}
          className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.05]">
          Turn Sales Data Into<br />
          <span className="dp-gradient-text">Revenue Intelligence</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}
          className="text-lg md:text-xl text-dp-text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
          Upload your CSV or Excel data and instantly get AI-powered KPI dashboards, trend analysis, forecasting, and executive reports.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }}
          className="flex justify-center gap-3 mb-16 flex-wrap">
          <Link href="/signup" className="dp-btn-primary text-base px-7 py-3">Get started free →</Link>
          <Link href="/login" className="dp-btn-secondary text-base px-7 py-3">View dashboard</Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.32 }}
          className="flex justify-center gap-12 mb-16 flex-wrap">
          {[["50K+", "Analytics Users"], ["$2.4B+", "Revenue Analyzed"], ["99.9%", "Uptime SLA"], ["<2s", "Insight Time"]].map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="text-2xl font-black text-dp-text-primary mb-1">{n}</div>
              <div className="text-sm text-dp-text-muted">{l}</div>
            </div>
          ))}
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.65, delay: 0.4 }}
          className="dp-card p-1 rounded-[20px]">
          <div className="rounded-[18px] p-6" style={{ background: "linear-gradient(180deg,rgba(99,102,241,.13) 0%,transparent 100%)" }}>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[["Total Revenue", "$5.39M", "+18.4%", "#6366F1"], ["Total Sales", "27.3K", "+20.7%", "#06B6D4"], ["Orders", "19.0K", "+15.2%", "#10B981"], ["Profit Margin", "30.1%", "+2.1%", "#F59E0B"]].map(([t, v, c, col]) => (
                <div key={t} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)" }}>
                  <div className="text-[10.5px] text-dp-text-muted font-medium mb-2">{t}</div>
                  <div className="text-xl font-black text-dp-text-primary mb-1">{v}</div>
                  <div className="text-[10.5px] font-semibold" style={{ color: col }}>{c} ↑</div>
                </div>
              ))}
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PREVIEW_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad-preview" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(v: number) => [fmtRev(v), "Revenue"]} contentStyle={{ background: "#0D0D2A", border: "1px solid rgba(99,102,241,.3)", borderRadius: 10, fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2.5} fill="url(#grad-preview)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <span className="dp-badge mb-4" style={{ background: "rgba(99,102,241,.15)", color: "#818CF8", border: "1px solid rgba(99,102,241,.25)" }}>Features</span>
          <h2 className="text-4xl font-black tracking-tight mt-4 mb-4">Everything you need to grow faster</h2>
          <p className="text-dp-text-secondary text-base max-w-md mx-auto">From raw CSV uploads to boardroom-ready insights in minutes.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="group p-7 rounded-2xl transition-all duration-250 cursor-default"
              style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${f.color}55`;
                (e.currentTarget as HTMLElement).style.background = `${f.color}08`;
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.07)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.03)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: `${f.color}20` }}>
                <f.icon size={20} style={{ color: f.color }} />
              </div>
              <h3 className="text-base font-bold text-dp-text-primary mb-3">{f.title}</h3>
              <p className="text-sm text-dp-text-muted leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black tracking-tight mb-3">Loved by data-driven teams</h2>
          <p className="text-dp-text-secondary">Join 50,000+ analysts and revenue leaders</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-7 rounded-2xl" style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}>
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.stars)].map((_, i) => <span key={i} className="text-[#F59E0B] text-sm">★</span>)}
              </div>
              <p className="text-sm text-dp-text-secondary leading-relaxed mb-6">&quot;{t.quote}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#6366F1,#06B6D4)" }}>{t.avatar}</div>
                <div>
                  <div className="text-sm font-semibold text-dp-text-primary">{t.name}</div>
                  <div className="text-xs text-dp-text-muted">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <span className="dp-badge mb-4" style={{ background: "rgba(16,185,129,.12)", color: "#10B981", border: "1px solid rgba(16,185,129,.25)" }}>Pricing</span>
          <h2 className="text-4xl font-black tracking-tight mt-4 mb-3">Simple, transparent pricing</h2>
          <p className="text-dp-text-secondary">Start free. Scale as you grow. No hidden fees.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PRICING.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl relative" style={{ background: p.highlight ? "rgba(99,102,241,.08)" : "rgba(255,255,255,.033)", border: `1px solid ${p.highlight ? "rgba(99,102,241,.45)" : "rgba(255,255,255,.08)"}` }}>
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="dp-badge text-xs px-3 py-1" style={{ background: "rgba(99,102,241,.9)", color: "#fff", border: "none" }}>Most Popular</span>
                </div>
              )}
              <div className="text-sm font-bold mb-3" style={{ color: p.color }}>{p.name}</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-dp-text-primary">{p.price}</span>
                <span className="text-dp-text-muted text-sm">{p.period}</span>
              </div>
              <div className="space-y-3 mb-8">
                {p.features.map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-dp-text-secondary">
                    <Check size={14} className="text-emerald-400 flex-shrink-0" />{f}
                  </div>
                ))}
              </div>
              <Link href="/signup" className={p.highlight ? "dp-btn-primary w-full justify-center py-3" : "dp-btn-secondary w-full justify-center py-3"}>
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="dp-card p-16 text-center rounded-2xl" style={{ background: "linear-gradient(135deg,rgba(99,102,241,.12),rgba(6,182,212,.07))" }}>
          <Shield size={40} className="mx-auto mb-6" style={{ color: "#6366F1" }} />
          <h2 className="text-3xl font-black tracking-tight mb-4">Ready to unlock your revenue intelligence?</h2>
          <p className="text-dp-text-secondary mb-8 leading-relaxed">Join 50,000+ teams who trust DataPulse to transform their sales data into strategic advantage.</p>
          <Link href="/signup" className="dp-btn-primary text-base px-8 py-3">Get started for free →</Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t px-6 py-10 text-center text-sm text-dp-text-dim" style={{ borderColor: "rgba(255,255,255,.06)" }}>
        <div className="font-bold text-dp-text-secondary text-base mb-2">DataPulse</div>
        <p>© 2025 DataPulse Inc. All rights reserved. Built for data-driven revenue teams.</p>
      </footer>
    </div>
  );
}
