"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, Shield, Info, CreditCard, Copy, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const supabase = createClient();
  
  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);

  // Security state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Account Info state
  const [userId, setUserId] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? "");
        setName(data.user.user_metadata?.full_name ?? "");
        setUserId(data.user.id);
        if (data.user.created_at) {
          setCreatedAt(
            new Date(data.user.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        }
      }
    });
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
    setSavingProfile(false);
    
    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated!");
      // Reload layout header user info
      window.location.reload();
    }
  }

  async function updateEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }
    setUpdatingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setUpdatingEmail(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Confirmation email sent! Please check both your current and new email addresses to complete the change.");
      setNewEmail("");
      setShowEmailForm(false);
    }
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    setUpdatingPassword(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      setPassword("");
      setConfirmPassword("");
    }
  }

  function copyUserId() {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    toast.success("User ID copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-black text-dp-text-primary">Settings</h1>
        <p className="text-sm text-dp-text-dim mt-0.5">Manage your account credentials, security and preferences</p>
      </div>

      {/* Profile Details */}
      <div className="dp-card p-6">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,.06)" }}>
          <User size={16} className="text-indigo-400" />
          <h2 className="text-sm font-bold text-dp-text-primary">Profile Details</h2>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dp-text-secondary mb-1.5">Full Name</label>
            <input 
              className="dp-input max-w-sm" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Your name" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-dp-text-secondary mb-1.5">Email Address</label>
            <input 
              className="dp-input max-w-sm" 
              value={email} 
              disabled 
              style={{ opacity: 0.6 }} 
            />
            <p className="text-xs text-dp-text-dim mt-1.5">This is your current primary email address.</p>
          </div>
          
          {!showEmailForm ? (
            <div className="pt-2">
              <button 
                type="button" 
                onClick={() => setShowEmailForm(true)} 
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Change email address
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl space-y-3 max-w-sm mt-3" style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)" }}>
              <div>
                <label className="block text-xs font-semibold text-dp-text-secondary mb-1.5">New Email Address</label>
                <input 
                  type="email" 
                  className="dp-input w-full" 
                  value={newEmail} 
                  onChange={e => setNewEmail(e.target.value)} 
                  placeholder="name@example.com" 
                  required
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button 
                  type="button" 
                  onClick={updateEmail} 
                  disabled={updatingEmail}
                  className="dp-btn-primary text-xs py-1.5 px-4"
                >
                  {updatingEmail ? "Sending..." : "Send Confirmation"}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowEmailForm(false); setNewEmail(""); }}
                  className="dp-btn-secondary text-xs py-1.5 px-4"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button type="submit" disabled={savingProfile} className="dp-btn-primary text-sm py-2 px-5">
              {savingProfile ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Security (Change Password) */}
      <div className="dp-card p-6">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,.06)" }}>
          <Shield size={16} className="text-cyan-400" />
          <h2 className="text-sm font-bold text-dp-text-primary">Security</h2>
        </div>
        <form onSubmit={updatePassword} className="space-y-4">
          <p className="text-xs text-dp-text-dim">Update your password to keep your account secure. Passwords must be at least 6 characters.</p>
          <div>
            <label className="block text-xs font-semibold text-dp-text-secondary mb-1.5">New Password</label>
            <input 
              type="password" 
              className="dp-input max-w-sm" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-dp-text-secondary mb-1.5">Confirm New Password</label>
            <input 
              type="password" 
              className="dp-input max-w-sm" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              placeholder="••••••••" 
              required
            />
          </div>
          <button type="submit" disabled={updatingPassword} className="dp-btn-primary text-sm py-2 px-5">
            {updatingPassword ? "Updating…" : "Change Password"}
          </button>
        </form>
      </div>

      {/* Account Information */}
      <div className="dp-card p-6">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,.06)" }}>
          <Info size={16} className="text-emerald-400" />
          <h2 className="text-sm font-bold text-dp-text-primary">Account Information</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1">
            <span className="text-dp-text-secondary font-medium">User ID</span>
            <div className="flex items-center gap-2 mt-1 sm:mt-0">
              <span className="font-mono text-xs text-dp-text-dim bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.06]">{userId}</span>
              <button 
                onClick={copyUserId} 
                className="p-1 rounded-md hover:bg-white/[0.06] text-dp-text-secondary transition-colors"
                title="Copy User ID"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between py-1 border-t border-white/[0.03]">
            <span className="text-dp-text-secondary font-medium">Joined On</span>
            <span className="text-xs text-dp-text-dim">{createdAt || "Loading..."}</span>
          </div>
        </div>
      </div>

      {/* Billing & Plan */}
      <div className="dp-card p-6">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,.06)" }}>
          <CreditCard size={16} className="text-amber-400" />
          <h2 className="text-sm font-bold text-dp-text-primary">Billing & Plans</h2>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-bold text-dp-text-primary mb-1">Current Plan</h3>
            <div className="flex items-center gap-2">
              <span className="dp-badge text-xs" style={{ background: "rgba(99,102,241,.15)", color: "#818CF8", border: "1px solid rgba(99,102,241,.25)" }}>Free Tier</span>
              <span className="text-xs text-dp-text-dim">5 uploads / month</span>
            </div>
          </div>
          <button className="dp-btn-primary text-sm py-2 px-5">Upgrade to Pro →</button>
        </div>
      </div>
    </div>
  );
}
