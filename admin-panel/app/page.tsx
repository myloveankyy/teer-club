/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import api from "./api/client";
import { useToast } from "@/components/Toast";

export default function Home() {
  const { showToast } = useToast();

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.results.getDashboard(),
    refetchInterval: 30000,
  });

  const { data: healthData } = useQuery({
    queryKey: ["health"],
    queryFn: () => api.cron.getHealth(),
    refetchInterval: 15000,
  });

  const { data: liveStatusData } = useQuery({
    queryKey: ["live-status"],
    queryFn: () => api.cron.getLiveStatus(),
    refetchInterval: 5000,
  });

  const stats = {
    total: dashboardData?.data?.results?.length || 0,
    games: dashboardData?.data?.games?.length || 0,
  };

  const health = healthData?.data || {};
  const liveStatuses = liveStatusData?.data || [];

  const getHealthColor = (status: string) => {
    if (status === "connected") return { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" };
    if (status === "disconnected") return { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" };
    return { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  };

  const getStateConfig = (state: string) => {
    const configs: Record<string, { label: string; color: string; bg: string; animate?: boolean }> = {
      SUCCESS: { label: "✅ Success", color: "text-green-700", bg: "bg-green-50" },
      COMPLETE: { label: "✅ Complete", color: "text-green-700", bg: "bg-green-50" },
      SCRAPING_IN_PROGRESS: { label: "⏳ Scraping...", color: "text-blue-700", bg: "bg-blue-50", animate: true },
      QUEUED: { label: "📋 Queued", color: "text-indigo-700", bg: "bg-indigo-50", animate: true },
      WAITING_FOR_RESULT: { label: "🕐 Waiting", color: "text-amber-700", bg: "bg-amber-50" },
      FAILED: { label: "❌ Failed", color: "text-red-700", bg: "bg-red-50" },
      RETRY_SCHEDULED: { label: "🔄 Retrying", color: "text-orange-700", bg: "bg-orange-50", animate: true },
      IDLE: { label: "💤 Idle", color: "text-gray-500", bg: "bg-gray-50" },
      NO_CHANGE: { label: "— No Change", color: "text-gray-500", bg: "bg-gray-50" },
      DISABLED: { label: "🚫 Disabled", color: "text-gray-400", bg: "bg-gray-50" },
    };
    return configs[state] || { label: state || "Unknown", color: "text-gray-500", bg: "bg-gray-50" };
  };

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Live system overview of your Teer platform</p>
      </div>

      {/* Stats + Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total Results</p>
          <p className="text-3xl font-semibold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Active Games</p>
          <p className="text-3xl font-semibold text-gray-900">{stats.games}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col justify-between">
          <div>
            <p className="text-sm text-gray-500">Live Scraper Engine</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <p className="text-3xl font-semibold text-gray-900">Active</p>
            </div>
          </div>
          <Link href="/cron" className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-4 inline-flex items-center gap-1">
            View Cron Logs &rarr;
          </Link>
        </div>

        {/* Queue Health */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Queue Health</p>
          {health.queue ? (
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Active</span>
                <span className="font-medium text-blue-600">{health.queue.active || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Waiting</span>
                <span className="font-medium text-amber-600">{health.queue.waiting || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Failed</span>
                <span className={`font-medium ${(health.queue.failed || 0) > 0 ? 'text-red-600' : 'text-gray-400'}`}>{health.queue.failed || 0}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Loading...</p>
          )}
        </div>
      </div>

      {/* Real-Time System Health */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Database", status: health.database?.status || "unknown" },
            { label: "Redis", status: health.redis?.status || "unknown" },
            { label: "BullMQ Queue", status: health.queue?.status || "unknown" },
          ].map((service) => {
            const colors = getHealthColor(service.status);
            return (
              <div key={service.label} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-600">{service.label}</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                  {service.status === "connected" ? "Connected" : service.status === "disconnected" ? "Disconnected" : "Checking..."}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Scraper Status Grid */}
      {liveStatuses.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Live Scraper Status</h2>
            <span className="text-xs text-gray-400">Auto-refreshes every 5s</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {liveStatuses.map((game: any) => {
              const stateConfig = getStateConfig(game.state);
              return (
                <div key={game.gameId} className={`p-3 rounded-lg border border-gray-100 ${stateConfig.bg}`}>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">{game.displayName}</p>
                  <p className={`text-sm font-medium ${stateConfig.color} ${stateConfig.animate ? 'animate-pulse' : ''}`}>
                    {stateConfig.label}
                  </p>
                  {game.fr && (
                    <p className="text-xs text-gray-500 mt-1">FR: {game.fr} | SR: {game.sr || 'XX'}</p>
                  )}
                  {game.error && (
                    <p className="text-xs text-red-400 mt-1 truncate" title={game.error}>{game.errorCategory || 'Error'}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/games" className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Manage Games</p>
                <p className="text-xs text-gray-500">View and manage game configurations</p>
              </div>
            </Link>

            <Link href="/results" className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">View Results</p>
                <p className="text-xs text-gray-500">View and audit platform results</p>
              </div>
            </Link>

            <Link href="/prediction-pages" className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Manage Predictions</p>
                <p className="text-xs text-gray-500">Configure daily predictions</p>
              </div>
            </Link>

            <Link href="/cron" className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Scraping Console</p>
                <p className="text-xs text-gray-500">Monitor live cron jobs and trigger manual scrapes</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Platform Info</h2>
          <div className="space-y-4">
            {[
              { label: "Frontend Status", status: "Active" },
              { label: "Backend Status", status: health.database?.status === "connected" ? "Active" : "Checking..." },
              { label: "Database Status", status: health.database?.status === "connected" ? "Connected" : health.database?.status || "Checking..." },
              { label: "Redis Status", status: health.redis?.status === "connected" ? "Connected" : health.redis?.status || "Checking..." },
            ].map((item) => {
              const isActive = item.status === "Active" || item.status === "Connected";
              return (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isActive ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
