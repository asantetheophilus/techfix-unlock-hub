"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Smartphone, Mail, Lock, Loader2, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in both fields.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg("Incorrect email or password.");
      } else {
        // Use full page navigation so middleware can redirect by role correctly
        window.location.href = "/admin";
      }
    } catch (err) {
      setErrorMsg("Authentication service unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-24 sm:px-6">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-64 w-64 rounded-full bg-brand-cyan/5 blur-[100px]" />

      <div className="glass-card p-8 border border-white/5 bg-brand-navy/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] opacity-[0.03] pointer-events-none" />

        <div className="relative space-y-6">
          {/* Logo link */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 mx-auto">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-cyan to-brand-mint text-brand-dark shadow-neon">
                <Smartphone className="h-4.5 w-4.5" />
              </div>
              <span className="font-syne text-lg font-bold text-white">
                TechFix <span className="text-brand-mint">Unlock Hub</span>
              </span>
            </Link>
            <h2 className="font-syne text-xl font-bold text-slate-100">Sign In to Lab</h2>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-red-950/20 border border-red-500/25 p-3.5 text-xs text-red-400 font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-brand-dark border border-white/10 pl-10 pr-4 py-3 text-xs text-white focus:border-brand-cyan focus:outline-none"
                  placeholder="e.g. admin@techfix.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-brand-dark border border-white/10 pl-10 pr-4 py-3 text-xs text-white focus:border-brand-cyan focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neon-btn-primary w-full py-3.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Login to Portal"
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 border-t border-white/5 pt-4">
            Access restricted to authorized staff only.
          </div>
        </div>
      </div>
    </div>
  );
}
