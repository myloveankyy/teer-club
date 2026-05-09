"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/app/api/client";
import { useToast } from "@/components/Toast";
import {
    Globe, Send, RefreshCw, CheckCircle2, XCircle, Clock, Zap,
    ChevronLeft, ChevronRight, AlertTriangle, BarChart3, Loader2,
    ArrowUpRight, Gauge
} from "lucide-react";

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }: {
    label: string; value: string | number; icon: any; color: string; sub?: string;
}) {
    const colorMap: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        green: "bg-emerald-50 text-emerald-600 border-emerald-100",
        red: "bg-red-50 text-red-600 border-red-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        slate: "bg-slate-50 text-slate-600 border-slate-100",
    };
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
            <div className={`p-2.5 rounded-lg border ${colorMap[color] || colorMap.blue}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
                {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
            </div>
        </div>
    );
}

// ─── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { cls: string; icon: any }> = {
        SUCCESS: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
        FAILED: { cls: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
        QUEUED: { cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
        PROCESSING: { cls: "bg-blue-50 text-blue-700 border-blue-200", icon: Loader2 },
    };
    const s = map[status] || map.QUEUED;
    const Icon = s.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${s.cls}`}>
            <Icon className={`h-3 w-3 ${status === "PROCESSING" ? "animate-spin" : ""}`} />
            {status}
        </span>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function IndexingControlCenter() {
    const [logPage, setLogPage] = useState(1);
    const [submitUrl, setSubmitUrl] = useState("");
    const [submitPriority, setSubmitPriority] = useState(false);
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    // Fetch stats
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ["indexing-stats"],
        queryFn: () => api.indexing.getStats(),
        refetchInterval: 15000,
    });

    // Fetch logs
    const { data: logsData, isLoading: logsLoading } = useQuery({
        queryKey: ["indexing-logs", logPage],
        queryFn: () => api.indexing.getLogs({ page: logPage, limit: 15 }),
        refetchInterval: 15000,
    });

    // Submit URL mutation
    const submitMutation = useMutation({
        mutationFn: (data: { url: string; type?: string; priority?: boolean }) =>
            api.indexing.submitUrl(data),
        onSuccess: (res) => {
            if (res.success) {
                showToast("URL submitted successfully!", "success");
                setSubmitUrl("");
                queryClient.invalidateQueries({ queryKey: ["indexing-stats"] });
                queryClient.invalidateQueries({ queryKey: ["indexing-logs"] });
            } else {
                showToast(res.error || "Failed to submit URL", "error");
            }
        },
        onError: (err: any) => {
            showToast(err.message || "Submission failed", "error");
        },
    });

    const stats = statsData?.data?.stats;
    const quota = statsData?.data?.quota;
    const lastSubmitted = statsData?.data?.lastSubmitted;
    const logs = logsData?.data?.logs || [];
    const pagination = logsData?.data?.pagination;
    const quotaPercentage = quota ? Math.round((quota.used / quota.total) * 100) : 0;

    const handleSubmit = () => {
        if (!submitUrl.trim()) {
            showToast("Please enter a URL", "error");
            return;
        }
        let url = submitUrl.trim();
        // Auto-prefix domain if user pastes a path like /results/shillong
        if (url.startsWith("/")) {
            url = `https://teer.club${url}`;
        }
        submitMutation.mutate({ url, priority: submitPriority });
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
                        <Globe className="h-6 w-6 text-blue-600" />
                        Indexing Control Center
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 font-medium">
                        Google Indexing API dashboard — submit, monitor, and manage URL indexing.
                    </p>
                </div>
                <button
                    onClick={() => {
                        queryClient.invalidateQueries({ queryKey: ["indexing-stats"] });
                        queryClient.invalidateQueries({ queryKey: ["indexing-logs"] });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* ─── 1. STATUS DASHBOARD ────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard
                    label="Total Submitted"
                    value={statsLoading ? "…" : stats?.totalSubmitted ?? 0}
                    icon={Send}
                    color="blue"
                />
                <StatCard
                    label="Successful"
                    value={statsLoading ? "…" : stats?.successful ?? 0}
                    icon={CheckCircle2}
                    color="green"
                />
                <StatCard
                    label="Failed"
                    value={statsLoading ? "…" : stats?.failed ?? 0}
                    icon={XCircle}
                    color="red"
                />
                <StatCard
                    label="Pending Queue"
                    value={statsLoading ? "…" : stats?.pending ?? 0}
                    icon={Clock}
                    color="amber"
                />
                <StatCard
                    label="Daily Quota"
                    value={statsLoading ? "…" : `${quota?.used ?? 0} / ${quota?.total ?? 200}`}
                    icon={Gauge}
                    color="purple"
                    sub={`${quota?.remaining ?? 200} remaining`}
                />
                <StatCard
                    label="Last Success"
                    value={lastSubmitted?.processedAt
                        ? new Date(lastSubmitted.processedAt).toLocaleTimeString()
                        : "N/A"}
                    icon={Zap}
                    color="slate"
                    sub={lastSubmitted?.url
                        ? lastSubmitted.url.replace("https://teer.club", "")
                        : "No submissions yet"}
                />
            </div>

            {/* Quota Bar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-700">Daily Quota Usage</p>
                    <p className="text-xs text-gray-500 font-medium">{quotaPercentage}% used</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${
                            quotaPercentage > 80 ? "bg-red-500" : quotaPercentage > 50 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, quotaPercentage)}%` }}
                    />
                </div>
                {quotaPercentage >= 90 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-red-600 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Quota nearly exhausted. Remaining submissions will be queued for tomorrow.
                    </div>
                )}
            </div>

            {/* ─── 2. MANUAL URL SUBMISSION TOOL ─────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Send className="h-4 w-4 text-blue-600" />
                    Submit URL for Indexing
                </h2>
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="https://teer.club/results/shillong or /results/shillong"
                            value={submitUrl}
                            onChange={(e) => setSubmitUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-800 rounded-lg text-sm outline-none transition-all placeholder-gray-400"
                        />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
                        <input
                            type="checkbox"
                            checked={submitPriority}
                            onChange={(e) => setSubmitPriority(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Priority (instant)
                    </label>
                    <button
                        onClick={handleSubmit}
                        disabled={submitMutation.isPending || !submitUrl.trim()}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                    >
                        {submitMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <ArrowUpRight className="h-4 w-4" />
                        )}
                        Submit
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2.5">
                    <strong>Queue mode:</strong> Adds to batch queue (processed every 5 min). <strong>Priority:</strong> Sends instantly to Google, bypassing queue.
                </p>
            </div>

            {/* ─── 3. INDEXING LOGS ──────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        Indexing Request Logs
                    </h2>
                    <span className="text-xs text-gray-500 font-medium">
                        {pagination?.total ?? 0} total requests
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/80 border-b border-gray-200">
                            <tr>
                                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">URL</th>
                                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Method</th>
                                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Requested</th>
                                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Processed</th>
                                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Error</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logsLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <RefreshCw className="h-5 w-5 animate-spin text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Loading logs...</p>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center text-sm text-gray-500 font-medium">
                                        No indexing requests yet. Submit your first URL above.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900 truncate max-w-[350px]">
                                                    {log.url?.replace("https://teer.club", "") || log.url}
                                                </span>
                                                {log.page?.title && (
                                                    <span className="text-xs text-gray-400 truncate max-w-[350px]">
                                                        {log.page.title}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <StatusBadge status={log.status} />
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                                {log.method}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center text-xs text-gray-500 font-mono">
                                            {log.requestedAt
                                                ? new Date(log.requestedAt).toLocaleString()
                                                : "—"}
                                        </td>
                                        <td className="px-5 py-3 text-center text-xs text-gray-500 font-mono">
                                            {log.processedAt
                                                ? new Date(log.processedAt).toLocaleString()
                                                : "—"}
                                        </td>
                                        <td className="px-5 py-3">
                                            {log.error ? (
                                                <span className="text-xs text-red-600 truncate max-w-[200px] block">
                                                    {log.error}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            Page {pagination.page} of {pagination.totalPages}
                            <span className="mx-2">|</span>
                            {pagination.total} total
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setLogPage(p => Math.max(1, p - 1))}
                                disabled={logPage === 1}
                                className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 shadow-sm transition-all"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setLogPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={logPage === pagination.totalPages}
                                className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 shadow-sm transition-all"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── 4. HEALTH INFO ─────────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Indexing Health &amp; Guidelines
                </h2>
                <div className="grid md:grid-cols-2 gap-4 text-xs text-gray-600 leading-relaxed">
                    <div className="space-y-2">
                        <p><strong className="text-gray-900">Daily Quota:</strong> Google allows 200 URL submissions per day per property. The queue processor respects this limit automatically.</p>
                        <p><strong className="text-gray-900">Deduplication:</strong> URLs submitted within the last 24 hours are automatically skipped to prevent API spam.</p>
                        <p><strong className="text-gray-900">Auto-Queue:</strong> New pages discovered during sitemap regeneration are automatically queued for indexing.</p>
                    </div>
                    <div className="space-y-2">
                        <p><strong className="text-gray-900">Queue Processing:</strong> The background worker runs every 5 minutes and processes up to 10 URLs per batch.</p>
                        <p><strong className="text-gray-900">Priority Mode:</strong> Bypasses the queue and sends the URL directly to Google. Use sparingly for high-importance pages only.</p>
                        <p><strong className="text-gray-900">Failure Recovery:</strong> Failed URLs remain in the database for audit. Re-queue them manually if needed.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
