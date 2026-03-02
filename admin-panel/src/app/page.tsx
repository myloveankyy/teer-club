"use client";

import { useEffect, useState } from "react";
import { Users, Activity, Target, Zap, ArrowUpRight, ShieldCheck, Rocket, ChevronRight } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type DashboardMetrics = {
  totalUsers: number;
  scrapedToday: number;
  dailyPageviews: number;
  totalBets: number;
  todayBets: { count: number; total: number };
  yesterdayBets: { count: number; total: number };
  recentWinners: Array<{
    username: string;
    number: string;
    amount: string;
    game_type: string;
    round: string;
    created_at: string;
  }>;
  recentActivity: Array<{
    action: string;
    status: string;
    created_at: string;
    device_info: string;
  }>;
  systemHealth?: {
    database: 'ONLINE' | 'OFFLINE';
    mlService: 'ONLINE' | 'OFFLINE';
    publicSite: 'ONLINE' | 'OFFLINE';
  };
};

export default function AdminDashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchMetrics = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await api.get('admin/analytics/dashboard');
        if (mounted && res.data.success) {
          setMetrics(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard metrics", err);
        if (mounted) setError("Failed to load dashboard data. Ensure backend is running.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (!authLoading) {
      fetchMetrics();
    }

    return () => { mounted = false; };
  }, [isAuthenticated, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold">Error Loading Metrics</h3>
            <p className="text-sm">{error || "Please try again later."}</p>
          </div>
        </div>
      </div>
    )
  }

  // Safely format currency and numbers
  const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);
  const formatCurrency = (num: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

  const betCountDiff = metrics.todayBets.count - metrics.yesterdayBets.count;
  const betAmountDiff = metrics.todayBets.total - metrics.yesterdayBets.total;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Systems Overview</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Real-time metrics and infrastructure status.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Health Indicators */}
          {metrics.systemHealth && (
            <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm mr-2">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${metrics.systemHealth.database === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">DB</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${metrics.systemHealth.mlService === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">ML</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${metrics.systemHealth.publicSite === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Site</span>
              </div>
            </div>
          )}

          <Link
            href="/changelog"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all border border-indigo-100 group shadow-sm active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Rocket className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-sm font-bold tracking-tight">Updates</span>
            <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Top Value Cards */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Users */}
        <div className="relative overflow-hidden rounded-[24px] bg-white p-6 border border-slate-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] group hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.15)] transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full text-xs font-bold">
              <ArrowUpRight className="w-3 h-3" />
              Active
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{formatNumber(metrics.totalUsers)}</h3>
            <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
          </div>
        </div>

        {/* Card 2: Bets Count Comparison */}
        <div className="relative overflow-hidden rounded-[24px] bg-white p-6 border border-slate-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] group hover:shadow-[0_8px_30px_-12px_rgba(139,92,246,0.15)] transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Target className="w-6 h-6 text-violet-500" />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${betCountDiff >= 0 ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
              {betCountDiff >= 0 ? '+' : ''}{betCountDiff} vs Yesterday
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{formatNumber(metrics.todayBets.count)}</h3>
            <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">Today's Bets</p>
          </div>
        </div>

        {/* Card 3: Amount Comparison */}
        <div className="relative overflow-hidden rounded-[24px] bg-slate-900 p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)] group hover:bg-black transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px]" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${betAmountDiff >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
              {betAmountDiff >= 0 ? '+' : ''}₹{Math.abs(betAmountDiff)}
            </div>
          </div>
          <div className="space-y-1 relative z-10">
            <h3 className="text-3xl font-black text-white tracking-tight">{formatCurrency(metrics.todayBets.total)}</h3>
            <p className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider">Book Value Today</p>
          </div>
        </div>

        {/* Card 4: Pageviews */}
        <div className="relative overflow-hidden rounded-[24px] bg-white p-6 border border-slate-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] group hover:shadow-[0_8px_30px_-12px_rgba(236,72,153,0.15)] transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Activity className="w-6 h-6 text-pink-500" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{formatNumber(metrics.dailyPageviews)}</h3>
            <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">Daily Pageviews (Real)</p>
          </div>
        </div>
      </div>

      {/* Secondary Row: Lists */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Winners List */}
        <div className="rounded-[24px] bg-white border border-slate-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] p-6 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">Platform Winners</h3>
            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">Recent Payouts</div>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1">
            {metrics.recentWinners.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 py-10">
                <Target className="w-8 h-8 opacity-20" />
                <p className="text-sm font-medium">No winners recorded yet today.</p>
              </div>
            ) : (
              metrics.recentWinners.map((winner, i) => (
                <div key={i} className="group flex items-center gap-4 p-4 rounded-3xl border border-slate-50 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-black text-slate-900">@{winner.username}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                          {winner.game_type} • {winner.round}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-emerald-600">+{formatCurrency(parseFloat(winner.amount) * 80)}</p>
                        <p className="text-[10px] font-bold text-slate-400">{new Date(winner.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Environment Monitoring & Logs (Combined) */}
        <div className="space-y-6">
          <div className="rounded-[24px] bg-slate-900 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px]" />
            <h3 className="text-lg font-bold text-white mb-4 relative z-10">Infrastructure Status</h3>
            <div className="grid grid-cols-1 gap-3 relative z-10">
              {[
                { name: 'Database', status: metrics.systemHealth?.database },
                { name: 'ML Engine', status: metrics.systemHealth?.mlService },
                { name: 'Public API', status: metrics.systemHealth?.publicSite },
              ].map((srv, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xs font-bold text-slate-300">{srv.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${srv.status === 'ONLINE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {srv.status || 'CHECKING'}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${srv.status === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] bg-white border border-slate-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Security Logs</h3>
            <div className="space-y-3">
              {metrics.recentActivity.map((log, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
                  <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-900 truncate uppercase">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
