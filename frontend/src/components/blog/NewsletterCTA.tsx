"use client";

import { useState } from "react";

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e3a5f] to-[#0f2744] px-8 py-16 sm:px-12 lg:px-16">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5" />
      
      <div className="relative mx-auto max-w-2xl text-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
          <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Stay Ahead of the Game
        </h2>
        <p className="mb-8 text-lg text-white/80">
          Get daily Teer insights, common numbers predictions, and market analysis delivered straight to your inbox.
        </p>
        
        {submitted ? (
          <div className="inline-flex items-center gap-3 rounded-xl bg-emerald-500/20 px-6 py-4 text-white">
            <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Thanks for subscribing! Check your inbox soon.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 rounded-xl border border-white/20 bg-white/10 px-5 py-4 text-white placeholder-white/50 backdrop-blur-sm transition-all focus:border-white/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-[#1d4ed8] hover:shadow-xl hover:-translate-y-0.5"
            >
              Subscribe
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        )}
        
        <p className="mt-4 text-sm text-white/50">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
