"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Upload, BarChart3, Brain, MessageSquare,
  Bell, LogOut, Settings, ChevronRight, Menu, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const NAV = [
  { href: "/dashboard",          icon: LayoutDashboard, label: "Overview"      },
  { href: "/dashboard/upload",   icon: Upload,          label: "Import Data"   },
  { href: "/dashboard/analytics",icon: BarChart3,        label: "Analytics"     },
  { href: "/dashboard/insights", icon: Brain,            label: "AI Insights"   },
  { href: "/dashboard/chat",     icon: MessageSquare,    label: "Ask Your Data" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [user,        setUser]        = useState<{ email?: string; name?: string; avatar?: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      setUser({
        email:  data.user.email,
        name:   data.user.user_metadata?.full_name ?? data.user.email?.split("@")[0],
        avatar: (data.user.user_metadata?.full_name ?? data.user.email ?? "U")[0].toUpperCase(),
      });
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Logged out.");
    router.push("/");
    router.refresh();
  }

  const Sidebar = (
    <aside style={{ background: "#08081C", borderRight: "1px solid rgba(255,255,255,.06)" }}
      className="w-[220px] flex-shrink-0 flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 pt-6 pb-7">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-black text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)" }}>D</div>
        <span className="font-black text-[17px] text-dp-text-primary tracking-tight">DataPulse</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              onClick={() => setSidebarOpen(false)}
              className={`dp-nav-link ${active ? "active" : ""}`}>
              <Icon size={17} />
              <span>{label}</span>
              {active && <ChevronRight size={13} className="ml-auto opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-5 mt-4 border-t pt-4" style={{ borderColor: "rgba(255,255,255,.06)" }}>
        {user && (
          <div className="flex items-center gap-2.5 px-2 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#6366F1,#06B6D4)" }}>{user.avatar}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-dp-text-primary truncate">{user.name}</p>
              <p className="text-[11px] text-dp-text-dim truncate">{user.email}</p>
            </div>
          </div>
        )}
        <Link href="/dashboard/settings" className="dp-nav-link mb-1">
          <Settings size={16} /><span>Settings</span>
        </Link>
        <button onClick={handleLogout} className="dp-nav-link w-full text-left" style={{ color: "#F43F5E" }}>
          <LogOut size={16} /><span>Log out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-dp-bg overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col h-full" style={{ width: 220, flexShrink: 0 }}>
        {Sidebar}
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 flex flex-col z-50" style={{ width: 220 }}>
            {Sidebar}
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 h-[58px] border-b flex-shrink-0"
          style={{ background: "#08081C", borderColor: "rgba(255,255,255,.06)" }}>
          <button className="md:hidden mr-3 text-dp-text-secondary" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/[0.06]"
              style={{ color: "#64748B" }}>
              <Bell size={17} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
