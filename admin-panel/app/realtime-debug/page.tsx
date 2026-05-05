"use client";

import { useState, useEffect } from "react";
import { api } from "../api/client";

export default function RealtimeDebugDashboard() {
  const [data, setData] = useState<{ crons: any[]; games: any[] } | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statusRes, logsRes] = await Promise.all([
        api.cron.getDebugStatus(),
        api.cron.getLogs({ limit: 15 })
      ]);
      if (statusRes?.success) setData(statusRes?.data || null);
      if (logsRes?.success) setLogs(logsRes?.data?.logs || []);
    } catch (err) {
      console.error("Failed to fetch debug data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Polling every 5s for real-time feel
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }).format(new Date(dateStr));
    } catch {
      return "-";
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Real-Time Debug Panel...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          System Health & Real-Time Debug
        </h1>
        <p className="text-gray-500 text-sm mt-1">Live monitoring of scraper health, cron schedules, and system logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Health Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Game Scraper Health</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Game</th>
                  <th className="px-6 py-3">Auto Scrape</th>
                  <th className="px-6 py-3">Last Run Status</th>
                  <th className="px-6 py-3">Last Scraped At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {data?.games?.map((game: any) => (
                  <tr key={game.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{game.displayName}</td>
                    <td className="px-6 py-4">
                      {game.isLiveScrapingEnabled ? (
                        <span className="text-green-600 font-medium">Enabled</span>
                      ) : (
                        <span className="text-red-500 font-medium">Disabled</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        game.lastLiveScrapeStatus === "SUCCESS" ? "bg-green-100 text-green-800" :
                        game.lastLiveScrapeStatus === "FAILED" ? "bg-red-100 text-red-800" :
                        game.lastLiveScrapeStatus === "NO_NEW_DATA" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {game.lastLiveScrapeStatus || "NEVER"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {game.lastLiveScrapeAt ? formatTime(game.lastLiveScrapeAt) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Cron Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Active Scheduled Jobs (BullMQ)</h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-white text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Job Name</th>
                  <th className="px-6 py-3">Pattern</th>
                  <th className="px-6 py-3">Next Execution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {data?.crons?.map((cron: any) => (
                  <tr key={cron.key} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{cron.name}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">{cron.pattern}</td>
                    <td className="px-6 py-4 text-blue-600 font-medium">
                      {cron.nextRun ? formatTime(new Date(cron.nextRun).toISOString()) : "-"}
                    </td>
                  </tr>
                ))}
                {!data?.crons?.length && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-red-500 font-medium">
                      ⚠️ No active cron jobs detected in BullMQ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Real-Time Logs */}
      <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 bg-black flex items-center justify-between">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M4 12a8 8 0 1116 0 8 8 0 01-16 0z" />
            </svg>
            Real-Time Execution Terminal
          </h2>
          <span className="text-xs text-gray-400 font-mono">Polling: 5s</span>
        </div>
        <div className="p-4 overflow-y-auto max-h-[400px] font-mono text-xs space-y-1.5 bg-gray-900">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 hover:bg-gray-800/50 p-1 rounded px-2">
              <span className="text-gray-500 shrink-0">[{formatTime(log.createdAt)}]</span>
              <span className={`shrink-0 w-24 ${
                log.status === "SUCCESS" ? "text-green-400" :
                log.status === "FAILED" ? "text-red-400" :
                log.status === "NO_NEW_DATA" ? "text-blue-400" : "text-gray-400"
              }`}>
                {log.status.padEnd(12)}
              </span>
              <span className="text-purple-400 shrink-0 w-24 uppercase">{log.game}</span>
              <span className="text-gray-300">
                {log.status === "SUCCESS" && `FR: ${log.round1 || 'XX'} | SR: ${log.round2 || 'XX'} | ${log.duration}ms`}
                {log.status === "FAILED" && <span className="text-red-300">{log.error}</span>}
                {log.status === "NO_NEW_DATA" && `No new data available. | ${log.duration}ms`}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-gray-500 italic p-2">Waiting for execution logs...</div>
          )}
        </div>
      </div>
    </div>
  );
}
