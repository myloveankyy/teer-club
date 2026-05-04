"use client";

import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useToast } from "@/components/Toast";

export default function CronDashboard() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [liveStatuses, setLiveStatuses] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [failedJobs, setFailedJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'status' | 'logs' | 'failed'>('status');
    const { showToast } = useToast();

    const fetchData = async () => {
        try {
            const [statusRes, liveRes, logsRes, failedRes] = await Promise.all([
                api.cron.getStatus(),
                api.cron.getLiveStatus().catch(() => ({ success: false, data: [] })),
                api.cron.getLogs({ limit: 20 }),
                api.cron.getFailedJobs().catch(() => ({ success: false, data: { jobs: [], total: 0 } })),
            ]);
            if (statusRes.success) setJobs(statusRes.data);
            if (liveRes.success) setLiveStatuses(liveRes.data);
            if (logsRes.success) setLogs(logsRes.data.logs);
            if (failedRes.success) setFailedJobs(failedRes.data.jobs);
        } catch (err) {
            console.error("Failed to fetch cron data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // 5s polling
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

    const handleRetryJob = async (jobId: string) => {
        setActionLoading(`retry-${jobId}`);
        try {
            await api.cron.retryJob(jobId);
            showToast(`Job ${jobId} retried successfully`, "success");
            await fetchData();
        } catch (err: any) {
            showToast(err.message || "Failed to retry job", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRetryAllFailed = async () => {
        setActionLoading("retry-all");
        try {
            const res = await api.cron.retryAllFailed();
            showToast(res.message || "All failed jobs retried", "success");
            await fetchData();
        } catch (err: any) {
            showToast(err.message || "Failed to retry all", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRestart = async () => {
        setActionLoading("restart");
        try {
            await api.cron.restart();
            showToast("All cron jobs restarted", "success");
            await fetchData();
        } catch (err: any) {
            showToast(err.message || "Failed to restart", "error");
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

    const getStateConfig = (state: string) => {
        const configs: Record<string, { label: string; color: string; bg: string; dot: string; animate?: boolean }> = {
            SUCCESS: { label: "SUCCESS", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
            COMPLETE: { label: "COMPLETE", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
            SCRAPING_IN_PROGRESS: { label: "SCRAPING", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500", animate: true },
            QUEUED: { label: "QUEUED", color: "text-indigo-700", bg: "bg-indigo-50", dot: "bg-indigo-500", animate: true },
            WAITING_FOR_RESULT: { label: "WAITING", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
            FAILED: { label: "FAILED", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
            RETRY_SCHEDULED: { label: "RETRYING", color: "text-orange-700", bg: "bg-orange-50", dot: "bg-orange-500", animate: true },
            IDLE: { label: "IDLE", color: "text-gray-600", bg: "bg-gray-50", dot: "bg-gray-400" },
            NO_CHANGE: { label: "NO CHANGE", color: "text-gray-600", bg: "bg-gray-50", dot: "bg-gray-400" },
            DISABLED: { label: "DISABLED", color: "text-gray-400", bg: "bg-gray-50", dot: "bg-gray-300" },
        };
        return configs[state] || { label: state || "IDLE", color: "text-gray-500", bg: "bg-gray-50", dot: "bg-gray-400" };
    };

    if (loading && jobs.length === 0) {
        return <div className="p-8 text-center text-gray-500">Loading dynamic cron engine...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Live Result Console</h1>
                    <p className="text-gray-500 text-sm">Monitor and control automated result scraping in real-time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRestart}
                        disabled={actionLoading === "restart"}
                        className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all text-sm"
                    >
                        {actionLoading === "restart" ? "Restarting..." : "Restart Crons"}
                    </button>
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
            </div>

            {/* Game Cards with Real-Time Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => {
                    const liveStatus = liveStatuses.find((s: any) => s.gameId === job.id);
                    const currentState = liveStatus?.state || job.lastStatus || "IDLE";
                    const stateConfig = getStateConfig(currentState);

                    return (
                        <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">{job.displayName}</h3>
                                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${stateConfig.bg} ${stateConfig.color}`}>
                                        <span className={`w-2 h-2 rounded-full ${stateConfig.dot} ${stateConfig.animate ? 'animate-pulse' : ''}`} />
                                        {stateConfig.label}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 mb-6">
                                    <div className="flex justify-between">
                                        <span>Last Run:</span>
                                        <span className="font-medium text-gray-900">
                                            {job.lastRun ? formatTime(job.lastRun) : "Never"}
                                        </span>
                                    </div>
                                    {liveStatus?.fr && (
                                        <div className="flex justify-between">
                                            <span>Result:</span>
                                            <span className="font-bold text-gray-900">
                                                FR: {liveStatus.fr} | SR: {liveStatus.sr || 'XX'}
                                            </span>
                                        </div>
                                    )}
                                    {liveStatus?.error && (
                                        <div className="flex justify-between">
                                            <span>Error:</span>
                                            <span className="text-red-500 text-xs truncate max-w-[180px]" title={liveStatus.error}>
                                                [{liveStatus.errorCategory || 'ERR'}] {liveStatus.error.substring(0, 30)}...
                                            </span>
                                        </div>
                                    )}
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
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200">
                {(['status', 'logs', 'failed'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                            activeTab === tab
                                ? 'text-gray-900 border-b-2 border-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab === 'failed' ? `Failed Jobs (${failedJobs.length})` : tab === 'logs' ? 'Activity Logs' : 'Recent Activity'}
                    </button>
                ))}
            </div>

            {/* Activity Logs Tab */}
            {activeTab === 'logs' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Game</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Category</th>
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
                                        <td className="px-6 py-4">
                                            {log.errorCategory ? (
                                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">
                                                    {log.errorCategory}
                                                </span>
                                            ) : <span className="text-gray-300">-</span>}
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
            )}

            {/* Failed Jobs Tab */}
            {activeTab === 'failed' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {failedJobs.length > 0 && (
                        <div className="px-6 py-3 border-b border-gray-100 flex justify-end">
                            <button
                                onClick={handleRetryAllFailed}
                                disabled={actionLoading === "retry-all"}
                                className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {actionLoading === "retry-all" ? "Retrying..." : `Retry All (${failedJobs.length})`}
                            </button>
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Job ID</th>
                                    <th className="px-6 py-3">Game</th>
                                    <th className="px-6 py-3">Error</th>
                                    <th className="px-6 py-3">Attempts</th>
                                    <th className="px-6 py-3">Time</th>
                                    <th className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {failedJobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{job.id?.substring(0, 8)}...</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{job.data?.gameName || job.name}</td>
                                        <td className="px-6 py-4 text-red-500 text-xs max-w-[200px] truncate" title={job.failedReason}>
                                            {job.failedReason || "Unknown error"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{job.attemptsMade || 0}</td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {job.finishedOn ? formatTime(job.finishedOn) : "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleRetryJob(job.id)}
                                                disabled={actionLoading === `retry-${job.id}`}
                                                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
                                            >
                                                {actionLoading === `retry-${job.id}` ? "..." : "Retry"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {failedJobs.length === 0 && (
                            <div className="p-8 text-center text-gray-400 italic">
                                ✅ No failed jobs. All systems operational.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Recent Activity (Status Tab) */}
            {activeTab === 'status' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                                {logs.slice(0, 10).map((log) => (
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
            )}
        </div>
    );
}
