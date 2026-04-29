"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/client";
import { useToast } from "@/components/Toast";
import { useState, useRef, useEffect } from "react";

interface LogEntry {
    level: "INFO" | "SUCCESS" | "ERROR" | "WARN";
    message: string;
    timestamp: string;
}

interface SitemapStatus {
    lastUpdated: string;
    totalUrls: number;
    previousUrlCount: number;
    newUrlsAdded: number;
    removedUrlsCount: number;
    durationMs: number;
    logs: LogEntry[];
}

const LOG_COLORS: Record<string, string> = {
    INFO: "text-blue-600",
    SUCCESS: "text-emerald-600",
    ERROR: "text-red-600",
    WARN: "text-amber-600",
};

const LOG_BG: Record<string, string> = {
    INFO: "bg-blue-50",
    SUCCESS: "bg-emerald-50",
    ERROR: "bg-red-50",
    WARN: "bg-amber-50",
};

export default function SitemapPage() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [liveLogs, setLiveLogs] = useState<LogEntry[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const { data: statusData, isLoading } = useQuery({
        queryKey: ["sitemapStatus"],
        queryFn: () => api.seo.sitemap.getStatus(),
        refetchInterval: isGenerating ? 2000 : false,
    });

    const generateMutation = useMutation({
        mutationFn: () => api.seo.sitemap.generate(),
        onSuccess: (res: any) => {
            setIsGenerating(false);
            if (res.success && res.data) {
                showToast("Sitemap generated successfully", "success");
                setLiveLogs(res.data.logs || []);
                queryClient.invalidateQueries({ queryKey: ["sitemapStatus"] });
            }
        },
        onError: (err: any) => {
            showToast(err.message || "Failed to generate sitemap", "error");
            setIsGenerating(false);
            // Show error logs if available
            if (err?.data?.logs) {
                setLiveLogs(err.data.logs);
            }
        },
    });

    const handleGenerate = () => {
        setIsGenerating(true);
        setLiveLogs([{ level: "INFO", message: "Sending generation request...", timestamp: new Date().toISOString() }]);
        generateMutation.mutate();
    };

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [liveLogs]);

    const status: SitemapStatus | null = statusData?.data || null;

    // Use live logs after generation, or stored logs from status
    const displayLogs = liveLogs.length > 0 ? liveLogs : (status?.logs || []);

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    const formatTime = (iso: string) => {
        try {
            return new Date(iso).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
            });
        } catch {
            return "—";
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* ─── Header ─── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Sitemap Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Generate, monitor, and maintain your XML sitemap for search engines.</p>
                </div>
                <div className="flex items-center gap-4">
                    {status?.lastUpdated && (
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Updated</p>
                            <p className="text-sm font-semibold text-gray-700">{formatTime(status.lastUpdated)}</p>
                        </div>
                    )}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || generateMutation.isPending}
                        className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all active:scale-95 ${isGenerating
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-900 text-white hover:bg-black hover:shadow-xl hover:-translate-y-0.5"
                            }`}
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Generate Sitemap
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ─── Stats Grid ─── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total URLs" value={status?.totalUrls ?? 0} icon="📄" />
                <StatCard
                    label="New Added"
                    value={status?.newUrlsAdded !== undefined ? `+${status.newUrlsAdded}` : "—"}
                    icon="🆕"
                    highlight={status?.newUrlsAdded ? "emerald" : undefined}
                />
                <StatCard
                    label="Removed"
                    value={status?.removedUrlsCount !== undefined ? `-${status.removedUrlsCount}` : "—"}
                    icon="🗑️"
                    highlight={status?.removedUrlsCount ? "red" : undefined}
                />
                <StatCard label="Gen. Time" value={status?.durationMs ? `${status.durationMs}ms` : "—"} icon="⚡" />
            </div>

            {/* ─── Sitemap URL ─── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Sitemap URL</p>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 font-mono text-sm">
                    <span className="flex-1 text-gray-700 truncate font-semibold">https://teer.club/sitemap.xml</span>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText("https://teer.club/sitemap.xml");
                            showToast("URL copied", "success");
                        }}
                        className="p-1.5 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-indigo-600"
                        title="Copy URL"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                    </button>
                    <a
                        href="https://teer.club/sitemap.xml"
                        target="_blank"
                        className="p-1.5 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-emerald-600"
                        title="Open in browser"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
            </div>

            {/* ─── Generation Logs ─── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Generation Logs</h3>
                    </div>
                    {displayLogs.length > 0 && (
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{displayLogs.length} entries</span>
                    )}
                </div>
                <div className="max-h-64 overflow-y-auto p-4 space-y-1.5 bg-gray-50/50">
                    {displayLogs.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No logs yet. Click "Generate Sitemap" to begin.</p>
                    ) : (
                        displayLogs.map((entry, i) => (
                            <div
                                key={i}
                                className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs font-mono ${LOG_BG[entry.level] || "bg-gray-50"}`}
                            >
                                <span className={`font-extrabold uppercase min-w-[70px] ${LOG_COLORS[entry.level] || "text-gray-500"}`}>
                                    [{entry.level}]
                                </span>
                                <span className="text-gray-700 flex-1">{entry.message}</span>
                            </div>
                        ))
                    )}
                    <div ref={logsEndRef} />
                </div>
            </div>

            {/* ─── Crawler Status ─── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Crawler Accessibility</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <StatusBadge label="Search Engine Indexing" status="Visible" color="emerald" />
                    <StatusBadge label="Compression" status="GZIP Enabled" color="indigo" />
                    <StatusBadge label="Clean URLs" status="Active" color="purple" />
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, highlight }: { label: string; value: string | number; icon: string; highlight?: string }) {
    const highlightClass = highlight === "emerald"
        ? "text-emerald-600"
        : highlight === "red"
            ? "text-red-600"
            : "text-gray-900";

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                <span className="text-lg">{icon}</span>
            </div>
            <p className={`text-2xl font-black ${highlightClass}`}>{value}</p>
        </div>
    );
}

function StatusBadge({ label, status, color }: { label: string; status: string; color: string }) {
    const colorMap: Record<string, string> = {
        emerald: "bg-emerald-100 text-emerald-800",
        indigo: "bg-indigo-100 text-indigo-800",
        purple: "bg-purple-100 text-purple-800",
    };

    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-xs font-medium text-gray-600">{label}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${colorMap[color] || "bg-gray-100 text-gray-700"}`}>
                {status}
            </span>
        </div>
    );
}
