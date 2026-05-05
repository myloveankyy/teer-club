"use client";

import { useState, useEffect } from "react";
import api from "../api/client";
import { RecommendationCard } from "../../components/growth/RecommendationCard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { RefreshCw, TrendingUp, Search, Link as LinkIcon, FileText, CheckCircle } from "lucide-react";

export default function GrowthCommandCenter() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGrowthData = async () => {
    setLoading(true);
    try {
      const [dashRes, recRes] = await Promise.all([
        api.growth.getDashboard(),
        api.growth.getRecommendations()
      ]);
      if (dashRes.success) setDashboard(dashRes.data);
      if (recRes.success) setRecommendations(recRes.data);
    } catch (error) {
      console.error("Failed to load growth data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowthData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const metrics = dashboard?.metrics || {};

  // Mock data for the projection chart to show visual trend
  const chartData = [
    { name: "Week 1", traffic: Math.round(metrics.estimatedDailyTraffic * 0.8) },
    { name: "Week 2", traffic: Math.round(metrics.estimatedDailyTraffic * 0.9) },
    { name: "Week 3", traffic: Math.round(metrics.estimatedDailyTraffic) },
    { name: "Week 4 (Proj)", traffic: Math.round(metrics.estimatedDailyTraffic * 1.15) },
    { name: "Week 5 (Proj)", traffic: Math.round(metrics.estimatedDailyTraffic * 1.3) },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Growth Command Center</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Traffic projections and algorithmic auto-guidance</p>
        </div>
        <button 
          onClick={fetchGrowthData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm font-bold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw size={16} />
          Recalculate
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Projection Console */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="text-indigo-600" /> 
                Traffic Projection Model
              </h2>
              <p className="text-sm text-gray-500 font-medium">Algorithmic estimate based on {metrics.indexedPages} indexed pages</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Est. Monthly</p>
              <p className="text-3xl font-black text-indigo-600">{metrics.estimatedMonthlyTraffic?.toLocaleString() || 0} <span className="text-lg text-gray-400">visits</span></p>
            </div>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="traffic" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorTraffic)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Velocity Metrics */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-4">
              <FileText size={20} />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-200 mb-1">Index Velocity</p>
            <p className="text-3xl font-black">+{metrics.newPagesThisWeek}</p>
            <p className="text-xs font-medium text-indigo-100 mt-2">New pages generated in last 7 days</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Search size={20} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">SEO Health Score</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-gray-900">{metrics.avgSeoScore}/100</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${metrics.avgSeoScore}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Guidance Engine */}
      <div className="mt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Auto-Guidance Recommendations</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Algorithmic action items to maximize growth velocity.</p>
        </div>
        
        {recommendations.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-12 text-center">
            <div className="inline-flex h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full items-center justify-center mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">System Optimized</h3>
            <p className="text-gray-600 font-medium">No pending growth actions. Your platform is running at optimal efficiency.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} {...rec} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
