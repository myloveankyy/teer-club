"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronRight, Clock, Database, Globe, RefreshCcw, Settings2, ShieldCheck, X } from "lucide-react";

interface ImportProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameId: string;
    gameName: string;
}

interface ProgressEvent {
    phase: string;
    message: string;
    percentage: number;
    details?: Record<string, unknown>;
}

interface ImportResult {
    success: boolean;
    total: number;
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
    duration: number;
    method?: string;
    confidence?: string;
}

const PHASE_LABELS: Record<string, string> = {
    STARTING: "Initializing…",
    FETCHING: "Fetching data…",
    PROCESSING: "Processing entries…",
    SAVING: "Saving to database…",
    COMPLETE: "Complete!",
    ERROR: "Error",
};

const PHASE_COLORS: Record<string, string> = {
    STARTING: "bg-blue-600",
    FETCHING: "bg-blue-600",
    PROCESSING: "bg-amber-500",
    SAVING: "bg-indigo-600",
    COMPLETE: "bg-green-600",
    ERROR: "bg-red-600",
};

export default function ImportProgressModal({
    isOpen,
    onClose,
    gameId,
    gameName,
}: ImportProgressModalProps) {
    const [started, setStarted] = useState(false);
    const [forceOverwrite, setForceOverwrite] = useState(false);
    const [progress, setProgress] = useState<ProgressEvent | null>(null);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);

    const startImport = () => {
        setStarted(true);
        setIsRunning(true);

        // Build the SSE URL
        const apiUrl = (() => {
            try {
                const saved = localStorage.getItem("adminSettings");
                if (saved) {
                    const settings = JSON.parse(saved);
                    if (settings?.apiUrl) {
                        const url = settings.apiUrl.trim();
                        return url.endsWith("/api") ? url : `${url}/api`;
                    }
                }
            } catch { /* ignore */ }
            return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        })();

        const apiKey = localStorage.getItem("apiKey") || process.env.NEXT_PUBLIC_API_KEY || "";
        const sseUrl = `${apiUrl}/admin/import/${gameId}?force=${forceOverwrite}${apiKey ? `&apiKey=${apiKey}` : ""}`;

        const es = new EventSource(sseUrl);
        eventSourceRef.current = es;

        es.addEventListener("status", (e) => {
            try {
                const data = JSON.parse(e.data) as ProgressEvent;
                setProgress(data);
            } catch { /* ignore */ }
        });

        es.addEventListener("progress", (e) => {
            try {
                const data = JSON.parse(e.data) as ProgressEvent;
                setProgress(data);

                if (data.phase === "ERROR") {
                    setError(data.message);
                    setIsRunning(false);
                    es.close();
                }
            } catch { /* ignore */ }
        });

        es.addEventListener("result", (e) => {
            try {
                const data = JSON.parse(e.data) as ImportResult;
                setResult(data);
                setIsRunning(false);
                es.close();
            } catch { /* ignore */ }
        });

        es.addEventListener("error", (e) => {
            if (e instanceof MessageEvent && e.data) {
                try {
                    const data = JSON.parse(e.data);
                    setError(data.message || "Import failed");
                } catch {
                    setError("Connection lost to the server.");
                }
            } else {
                if (es.readyState === EventSource.CLOSED) {
                    if (!result) {
                        setError("Connection to server lost.");
                    }
                }
            }
            setIsRunning(false);
            es.close();
        });
    };

    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const handleClose = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }
        setStarted(false);
        setProgress(null);
        setResult(null);
        setError(null);
        setIsRunning(false);
        onClose();
    };

    if (!isOpen) return null;

    const percentage = progress?.percentage || 0;
    const phase = progress?.phase || "STARTING";
    const barColor = PHASE_COLORS[phase] || "bg-blue-600";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={!isRunning ? handleClose : undefined} />
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-gray-50 rounded-lg">
                            <Database className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Import Data</h2>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{gameName}</p>
                        </div>
                    </div>
                    {!isRunning && (
                        <button onClick={handleClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Content Area */}
                <div className="px-8 py-8">
                    {!started ? (
                        /* Pre-Import Configuration */
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Settings2 className="h-4 w-4 text-blue-500" /> Configuration
                                </h3>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Prepare to ingest historical data for <strong>{gameName}</strong>. This process will crawl the configured source and index results found.
                                </p>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                                <div className="flex items-start gap-3">
                                    <input
                                        id="forceMode"
                                        type="checkbox"
                                        checked={forceOverwrite}
                                        onChange={(e) => setForceOverwrite(e.target.checked)}
                                        className="mt-1 w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                    />
                                    <label htmlFor="forceMode" className="cursor-pointer">
                                        <span className="block text-sm font-bold text-gray-900">Force Overwrite</span>
                                        <span className="block text-xs text-gray-500 mt-0.5">
                                            Enable this to update existing records if the source has corrected or newer data. By default, identical records are skipped to save resources.
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                                <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
                                <p className="text-[11px] font-medium text-blue-800">
                                    Our smart-upsert engine ensures data integrity by validating numbers (00-99) before saving.
                                </p>
                            </div>

                            <button
                                onClick={startImport}
                                className="w-full py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-sm flex items-center justify-center gap-2 group"
                            >
                                Start Import Process
                                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        /* Progress State */
                        <div className="space-y-8">
                            {/* Current Execution State */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {isRunning ? (
                                        <RefreshCcw className="h-5 w-5 text-blue-500 animate-spin" />
                                    ) : error ? (
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    ) : (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    )}
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{PHASE_LABELS[phase] || phase}</p>
                                        <p className="text-xs text-gray-500 truncate max-w-[300px]">
                                            {progress?.message || "Processing…"}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-gray-900">{Math.round(percentage)}%</span>
                            </div>

                            {/* Progress Visual */}
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ease-out ${barColor}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>

                            {/* Results Summary Grid */}
                            {result && (
                                <div className="grid grid-cols-2 gap-px bg-gray-100 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                    <div className="bg-white p-4 text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Found</p>
                                        <p className="text-xl font-bold text-gray-900">{result.total}</p>
                                    </div>
                                    <div className="bg-white p-4 text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">New Ingested</p>
                                        <p className="text-xl font-bold text-green-600">{result.created}</p>
                                    </div>
                                    <div className="bg-white p-4 text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Updated</p>
                                        <p className="text-xl font-bold text-blue-600">{result.updated}</p>
                                    </div>
                                    <div className="bg-white p-4 text-center relative group">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Skipped</p>
                                        <p className="text-xl font-bold text-gray-400">{result.skipped}</p>
                                        {/* Tooltip for skipped records */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/95 transition-opacity pointer-events-none">
                                            <p className="text-[9px] font-bold text-gray-500 px-2 leading-tight">Records already up to date in database.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3">
                                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-xs font-semibold text-red-800 leading-relaxed">{error}</p>
                                </div>
                            )}

                            {!isRunning && (
                                <div className="flex flex-col items-center gap-3">
                                    <button
                                        onClick={handleClose}
                                        className="w-full py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-sm"
                                    >
                                        Close Manager
                                    </button>
                                    {result && (
                                        <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5">
                                            <Clock className="h-3 w-3" /> Duration: {(result.duration / 1000).toFixed(1)}s
                                            · {result.method} Mode
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
