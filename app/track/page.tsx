"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function GeneralTrackingPage() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!trackingId.trim()) {
      setError("Please enter a valid tracking reference.");
      return;
    }

    let id = trackingId.trim().toUpperCase();
    if (!id.startsWith("TFU-")) {
      id = `TFU-${id}`;
    }

    if (!/^TFU-\d{6}$/.test(id)) {
      setError("Incorrect Tracking ID format. It should look like TFU-XXXXXX.");
      return;
    }

    router.push(`/track/${id}`);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-24 sm:px-6">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-72 w-72 rounded-full bg-brand-cyan/5 blur-[120px]" />
      
      <div className="glass-card p-8 border border-brand-cyan/20 bg-brand-navy/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] opacity-[0.03] pointer-events-none" />
        
        <div className="relative space-y-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy border border-brand-cyan/30 text-brand-cyan shadow-neon">
            <Search className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h1 className="font-syne text-2xl md:text-3xl font-extrabold text-white">
              Track Repair Order
            </h1>
            <p className="text-xs text-slate-400">
              Input your unique 6-digit tracking code to view diagnostic and repair phases in real-time.
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-950/20 border border-red-500/25 p-3 text-xs text-red-400 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="e.g. TFU-928135"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="w-full text-center font-bold tracking-widest uppercase rounded-xl bg-brand-dark border border-white/10 px-4 py-4 text-base text-white placeholder-slate-600 focus:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-all"
            />
            
            <button type="submit" className="neon-btn-primary w-full py-4 text-sm font-bold rounded-xl">
              Track Device Progress
            </button>
          </form>

          <div className="border-t border-white/5 pt-6 grid grid-cols-2 gap-4 text-left text-xs text-slate-400">
            <div className="space-y-1">
              <span className="font-bold text-slate-300 block">Where is my ID?</span>
              <span>Find it in your email receipt sent right after checkout.</span>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-300 block">Need assistance?</span>
              <span>Reach our support line directly via WhatsApp at +233 55 718 5355.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
