"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) { toast.error("Please fill in all fields."); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters."); return; }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);

    if (error) { toast.error(error.message); return; }
    toast.success("Account created! Check your email to verify.");
    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleSignup() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    if (error) toast.error(error.message);
  }

  return (
    <div className="min-h-screen bg-dp-bg flex items-center justify-center p-5">
      <div className="dp-card p-10 w-full max-w-md rounded-2xl animate-fadeUp">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-xl font-black text-white mx-auto mb-4"
            style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)" }}>D</div>
          <h1 className="text-2xl font-black text-dp-text-primary mb-2">Create your account</h1>
          <p className="text-sm text-dp-text-muted">Start your free analytics journey</p>
        </div>

        <button onClick={handleGoogleSignup} className="dp-btn-secondary w-full justify-center py-3 mb-5 text-sm">
          <svg width="18" height="18" viewBox="0 0 18 18" className="flex-shrink-0">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
            <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-white/[0.08]" /><span className="text-xs text-dp-text-dim">or</span><div className="flex-1 h-px bg-white/[0.08]" />
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dp-text-secondary mb-1.5">Full name</label>
            <input className="dp-input" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-dp-text-secondary mb-1.5">Work email</label>
            <input type="email" className="dp-input" placeholder="jane@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-dp-text-secondary mb-1.5">Password</label>
            <input type="password" className="dp-input" placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="dp-btn-primary w-full justify-center py-3 text-sm mt-2">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Create account →"}
          </button>
        </form>

        <p className="text-center text-xs text-dp-text-dim mt-4">
          By signing up you agree to our{" "}
          <span className="text-[#818CF8] cursor-pointer hover:underline">Terms</span> and{" "}
          <span className="text-[#818CF8] cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
        <div className="text-center mt-4 text-xs text-dp-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-[#818CF8] font-semibold hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
