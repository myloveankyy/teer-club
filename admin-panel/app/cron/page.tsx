"use client";

import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useToast } from "@/components/Toast";

export default function CronDashboard() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const { showToast } = useToast();

    const fetchData = async () => {
        try {
            const [statusRes, logsRes] = await Promise.all([
                api.cron.getStatus(),
                api.cron.getLogs({ limit: 20 })
            ]);
            if (statusRes.success) setJobs(statusRes.data);
            if (logsRes.success) setLogs(logsRes.data.logs);
        } catch (err) {
            console.error("Failed to fetch cron data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Polling every 10s
        return () => clearInterval(interval);
    }, []);

    const handleTriggerAll = async () => {
        setActionLoading("all");
        try {
            await api.cron.triggerAll();
            showToast("Global live fetch triggered for all enabled games", "success");
            await fetchData();
        } catch (err: any) {
            showToast(err.message || "Failed to trigger all", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleTriggerSingle = async (game: string) => {
        setActionLoading(game);
        try {
            await api.cron.trigger(game);
            showToast(`Fetch triggered for ${game}`, "success");
            await fetchData();
        } catch (err: any) {
            showToast(err.message || `Failed to trigger ${game}`, "error");
        } finally {
            setActionLoading(null);
        }
    };

    const formatTime = (dateStr: string) => {
        try {
            return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }).format(new Date(dateStr));
        } catch {
            return "-";
        }
    };

    if (loading && jobs.length === 0) {
        return <div className="p-8 text-center text-gray-500">Loading dynamic cron engine...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Live Result Console</h1>
                    <p className="text-gray-500 text-sm">Monitor and control automated result scraping in real-time.</p>
                </div>
                <button
                    onClick={handleTriggerAll}
                    disabled={actionLoading === "all"}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                    {actionLoading === "all" ? (
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    )}
                    Fetch All Live Results
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                    <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900">{job.displayName}</h3>
                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${job.lastStatus === "SUCCESS" ? "bg-green-50 text-green-700" :
                                    job.lastStatus === "FAILED" ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-600"
                                    }`}>
                                    <span className={`w-2 h-2 rounded-full ${job.lastStatus === "SUCCESS" ? "bg-green-500 animate-pulse" :
                                        job.lastStatus === "FAILED" ? "bg-red-500" : "bg-gray-400"
                                        }`} />
                                    {job.lastStatus || "IDLE"}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600 mb-6">
                                <div className="flex justify-between">
                                    <span>Last Run:</span>
                                    <span className="font-medium text-gray-900">
                                        {job.lastRun ? formatTime(job.lastRun) : "Never"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Engine:</span>
                                    <span className="text-gray-400 italic">Hybrid DOM/AI</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleTriggerSingle(job.id)}
                            disabled={actionLoading === job.id}
                            className="w-full py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {actionLoading === job.id ? "Scraping..." : "Manual Fetch"}
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">Recent Activity Logs</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Game</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Result</th>
                                <th className="px-6 py-3">Source Date</th>
                                <th className="px-6 py-3">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 uppercase">{log.game}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${log.status === "SUCCESS" ? "text-green-700 bg-green-50" :
                                            log.status === "FAILED" ? "text-red-700 bg-red-50" :
                                                log.status === "NO_NEW_DATA" ? "text-blue-700 bg-blue-50" : "text-gray-600 bg-gray-50"
                                            }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {log.round1 || "-"}{log.round2 ? ` / ${log.round2}` : ""}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{log.resultDate || "-"}</td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {formatTime(log.createdAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {logs.length === 0 && (
                        <div className="p-8 text-center text-gray-400 italic">No recent activity detected.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
