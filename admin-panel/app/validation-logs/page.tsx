"use client";

import { useEffect, useState, useCallback } from "react";
import api from "../api/client";

export default function ValidationLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);

    const loadData = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.validation.getLogs({ page, limit: 50 });
            setLogs(res.data.logs);
            setCurrentPage(res.data.page);
            setTotalPages(res.data.totalPages);
            setTotalLogs(res.data.total);
        } catch (err: any) {
            setError(err.message || "Failed to load validation logs.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData(1);
    }, [loadData]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        loadData(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Auto-Check Logs</h1>
                    <p className="text-sm text-gray-500 mt-1">Historical audit trail of all validation checks • {totalLogs} records</p>
                </div>
                <button
                    onClick={() => loadData(currentPage)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                    Refresh
                </button>
            </div>

            {loading && logs.length === 0 ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>
            ) : logs.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
                    No validation logs found yet.
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Date Checked</th>
                                    <th className="px-4 py-3 font-semibold">Game</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold">Diagnostics</th>
                                    <th className="px-4 py-3 font-semibold">Confidence</th>
                                    <th className="px-4 py-3 font-semibold">Data (FR / SR)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 align-top">
                                        <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">{formatDate(log.dateChecked)}</td>
                                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{log.game?.displayName || log.gameId}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${log.status === "VALID" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 max-w-xl">
                                            <p className="font-semibold text-xs mb-2">{log.reason}</p>
                                            {log.layerResults && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                                                    {Object.entries(log.layerResults).map(([key, layer]: any) => (
                                                        <div key={key} className="flex gap-1.5 items-start">
                                                            <span className={`mt-0.5 shrink-0 text-xs font-bold ${layer.passed ? 'text-green-500' : 'text-red-500'}`}>{layer.passed ? '✓' : '✗'}</span>
                                                            <div>
                                                                <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">{key.replace(/layer\d+/, 'L' + key.match(/\d+/)?.[0] + ': ')}</p>
                                                                <p className="text-[10px] text-gray-500 leading-tight">{layer.reason}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap align-middle text-center font-bold">{log.confidenceScore}%</td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                                            {log.scrapedResult?.r1 || '--'} / {log.scrapedResult?.r2 || '--'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Context */}
                    <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {(currentPage - 1) * 50 + 1}–{Math.min(currentPage * 50, totalLogs)} of {totalLogs}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 font-medium bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
                            >Prev</button>
                            <span className="px-3 py-1 bg-gray-100 rounded text-gray-900">{currentPage} / {totalPages}</span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="px-3 py-1 font-medium bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
                            >Next</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
