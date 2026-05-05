"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/client";
import { useToast } from "@/components/Toast";
import { useState, useRef, useEffect, useCallback } from "react";

interface LogEntry {
    level: "INFO" | "SUCCESS" | "ERROR" | "WARN";
    message: string;
    timestamp: string;
}

interface SitemapDiff {
    added: string[];
    removed: string[];
    unchanged: number;
}

interface SitemapStatus {
    lastUpdated: string;
    totalUrls: number;
    previousUrlCount: number;
    newUrlsAdded: number;
    removedUrlsCount: number;
    fileSize: number;
    diff: SitemapDiff;
    logs: LogEntry[];
}

const LOG_COLORS: Record<string, string> = {
    INFO: "text-blue-600",
    SUCCESS: "text-emerald-600",
    ERROR: "text-red-600",
    WARN: "text-amber-600",
};

const LOG_BG: Record<string, string> = {
    INFO: "bg-blue-50 border-blue-100",
    SUCCESS: "bg-emerald-50 border-emerald-100",
    ERROR: "bg-red-50 border-red-100",
    WARN: "bg-amber-50 border-amber-100",
};

export default function SitemapPage() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [pendingFile, setPendingFile] = useState<{ name: string; size: number; urlCount: number; content: string } | null>(null);
    const [liveLogs, setLiveLogs] = useState<LogEntry[]>([]);
    const [lastDiff, setLastDiff] = useState<SitemapDiff | null>(null);

    const { data: statusData, isLoading } = useQuery({
        queryKey: ["sitemapStatus"],
        queryFn: () => api.seo.sitemap.getStatus(),
    });

    const uploadMutation = useMutation({
        mutationFn: (xml: string) => api.seo.sitemap.upload(xml),
        onSuccess: (res: any) => {
            setIsUploading(false);
            setPendingFile(null);
            if (res?.success && res?.data) {
                showToast(`Sitemap deployed — ${res?.data?.totalUrls || 0} URLs`, "success");
                setLiveLogs(res?.data?.logs || []);
                setLastDiff(res?.data?.diff || null);
                queryClient.invalidateQueries({ queryKey: ["sitemapStatus"] });
            }
        },
        onError: (err: any) => {
            showToast(err.message || "Upload failed", "error");
            setIsUploading(false);
            if (err?.logs) setLiveLogs(err.logs);
        },
    });

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [liveLogs]);

    const status: SitemapStatus | null = statusData?.data || null;
    const displayLogs = liveLogs.length > 0 ? liveLogs : (status?.logs || []);
    const displayDiff = lastDiff || status?.diff || null;

    const handleGenerate = async () => {
        setIsGenerating(true);
        setLiveLogs([{ level: "INFO", message: "Auto-generating sitemap from database...", timestamp: new Date().toISOString() }]);
        try {
            const res = await api.seo.sitemap.generate();
            if (res?.success && res?.data) {
                showToast(`Sitemap generated — ${res?.data?.totalUrls || 0} URLs`, "success");
                setLiveLogs(res?.data?.logs || []);
                setLastDiff(res?.data?.diff || null);
                queryClient.invalidateQueries({ queryKey: ["sitemapStatus"] });
            }
        } catch (err: any) {
            showToast(err.message || "Generation failed", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    // ── File processing ──
    const processFile = useCallback((file: File) => {
        if (!file.name.endsWith(".xml")) {
            showToast("Only .xml files are accepted", "error");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            showToast("File too large (max 10 MB)", "error");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const urlCount = (content.match(/<loc>/gi) || []).length;
            setPendingFile({
                name: file.name,
                size: file.size,
                urlCount,
                content,
            });
            setLiveLogs([]);
            setLastDiff(null);
        };
        reader.readAsText(file);
    }, [showToast]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, [processFile]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
        e.target.value = "";
    };

    const handleUpload = () => {
        if (!pendingFile) return;
        setIsUploading(true);
        setLiveLogs([{ level: "INFO", message: "Uploading sitemap to server...", timestamp: new Date().toISOString() }]);
        uploadMutation.mutate(pendingFile.content);
    };

    const formatTime = (iso: string) => {
        try {
            return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
        } catch {
            return "—";
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        return `${(bytes / 1024).toFixed(1)} KB`;
    };

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* ─── Header ─── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Sitemap Management</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Upload your sitemap.xml from{" "}
                        <a href="https://www.xml-sitemaps.com" target="_blank" className="text-indigo-600 hover:underline font-medium">
                            xml-sitemaps.com
                        </a>{" "}
                        or any external generator.
                    </p>
                </div>
                {status?.lastUpdated && (
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Update</p>
                        <p className="text-sm font-semibold text-gray-700">{formatTime(status.lastUpdated)}</p>
                    </div>
                )}
            </div>

            {/* ─── Auto Generate Button ─── */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 p-5 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-gray-900">Auto-Generate Sitemap</h3>
                    <p className="text-sm text-gray-500 mt-1">Automatically includes all static pages, games, dream SEO pages, and 100 number analytics pages.</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 whitespace-nowrap ${isGenerating ? "bg-gray-200 text-gray-400" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg"}`}
                >
                    {isGenerating ? "Generating..." : "⚡ Generate Now"}
                </button>
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
                <StatCard label="File Size" value={status?.fileSize ? formatSize(status.fileSize) : "—"} icon="📦" />
            </div>

            {/* ─── Upload Zone ─── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Sitemap
                    </h3>
                </div>

                <div className="p-5 space-y-4">
                    {/* Drop Zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging
                                ? "border-indigo-400 bg-indigo-50"
                                : pendingFile
                                    ? "border-emerald-300 bg-emerald-50"
                                    : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xml"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {pendingFile ? (
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-emerald-200 shadow-sm">
                                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-bold text-gray-800">{pendingFile.name}</span>
                                </div>
                                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                                    <span className="font-semibold">{formatSize(pendingFile.size)}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="font-semibold">{pendingFile.urlCount} URLs detected</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Click to select a different file</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <svg className="w-10 h-10 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-sm font-semibold text-gray-500">Drop your sitemap.xml here</p>
                                <p className="text-xs text-gray-400">or click to browse • .xml files only • max 10 MB</p>
                            </div>
                        )}
                    </div>

                    {/* Upload Button */}
                    {pendingFile && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-95 ${isUploading
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-gray-900 text-white hover:bg-black hover:shadow-xl"
                                    }`}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                        Deploying...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        Deploy Sitemap
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setPendingFile(null)}
                                className="px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Sitemap URL ─── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Live Sitemap URL</p>
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

            {/* ─── Diff Comparison ─── */}
            {displayDiff && (displayDiff.added.length > 0 || displayDiff.removed.length > 0) && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Changes Detected</h3>
                    </div>
                    <div className="max-h-56 overflow-y-auto p-4 space-y-1 font-mono text-xs">
                        {displayDiff.added.map((url, i) => (
                            <div key={`a-${i}`} className="flex items-start gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                                <span className="font-extrabold text-emerald-600 min-w-[14px]">+</span>
                                <span className="text-emerald-800 break-all">{url}</span>
                            </div>
                        ))}
                        {displayDiff.removed.map((url, i) => (
                            <div key={`r-${i}`} className="flex items-start gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100">
                                <span className="font-extrabold text-red-600 min-w-[14px]">−</span>
                                <span className="text-red-800 break-all">{url}</span>
                            </div>
                        ))}
                        {displayDiff.unchanged > 0 && (
                            <div className="px-3 py-1.5 text-gray-400 text-center">
                                {displayDiff.unchanged} unchanged URLs
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── Upload Logs ─── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Upload Logs
                    </h3>
                    {displayLogs.length > 0 && (
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{displayLogs.length} entries</span>
                    )}
                </div>
                <div className="max-h-64 overflow-y-auto p-4 space-y-1.5 bg-gray-50/50">
                    {displayLogs.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No logs yet. Upload a sitemap to see activity.</p>
                    ) : (
                        displayLogs.map((entry, i) => (
                            <div
                                key={i}
                                className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs font-mono border ${LOG_BG[entry.level] || "bg-gray-50 border-gray-100"}`}
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
