"use client";

import { useEffect, useState } from "react";
import { Database, RefreshCw, CheckCircle2, XCircle, Edit2, History, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type TeerResult = {
    id: number;
    date: string;
    round1: string | null;
    round2: string | null;
    khanapara_r1: string | null;
    khanapara_r2: string | null;
    juwai_r1: string | null;
    juwai_r2: string | null;
    source: string;
    verified: boolean;
    created_at: string;
};

export default function ResultsPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [results, setResults] = useState<TeerResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const limit = 50;
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        round1: "", round2: "",
        khanapara_r1: "", khanapara_r2: "",
        juwai_r1: "", juwai_r2: "",
        verified: false
    });

    const fetchResults = async (pageNum = 1, isLoadMore = false) => {
        if (!isAuthenticated) return;
        if (!isLoadMore) setLoading(true);
        else setLoadingMore(true);

        setError("");
        try {
            const offset = (pageNum - 1) * limit;
            const res = await api.get(`/admin/results?limit=${limit}&offset=${offset}`);
            if (res.data.success) {
                const newData = res.data.data;
                if (newData.length < limit) setHasMore(false);
                else setHasMore(true);

                if (isLoadMore) {
                    setResults(prev => [...prev, ...newData]);
                } else {
                    setResults(newData);
                }
                setPage(pageNum);
            }
        } catch (err) {
            console.error("Failed to fetch results", err);
            setError("Failed to load results table. Database might be offline.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchResults(1, false);
        }
    }, [isAuthenticated, authLoading]);

    const handleScrape = async () => {
        setActionLoading(true);
        try {
            const res = await api.post('/admin/results/scrape');
            if (res.data.success) {
                // Refresh list
                await fetchResults();
            }
        } catch (err) {
            console.error("Scrape failed", err);
            alert("Failed to trigger scraper.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditSave = async (id: number) => {
        setActionLoading(true);
        try {
            const res = await api.put(`/admin/results/${id}`, {
                round1: editForm.round1 || null,
                round2: editForm.round2 || null,
                khanapara_r1: editForm.khanapara_r1 || null,
                khanapara_r2: editForm.khanapara_r2 || null,
                juwai_r1: editForm.juwai_r1 || null,
                juwai_r2: editForm.juwai_r2 || null,
                verified: editForm.verified
            });
            if (res.data.success) {
                setEditingId(null);
                // Update local state instead of full refetch for speed
                setResults(results.map(r => r.id === id ? res.data.data : r));
            }
        } catch (err) {
            console.error("Update failed", err);
            alert("Failed to update result.");
        } finally {
            setActionLoading(false);
        }
    };

    const startEditing = (result: TeerResult) => {
        setEditingId(result.id);
        setEditForm({
            round1: result.round1 || "",
            round2: result.round2 || "",
            khanapara_r1: result.khanapara_r1 || "",
            khanapara_r2: result.khanapara_r2 || "",
            juwai_r1: result.juwai_r1 || "",
            juwai_r2: result.juwai_r2 || "",
            verified: result.verified
        });
    };

    if (authLoading) {
        return (
            <div className="flex 1 items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Database className="w-8 h-8 text-blue-600" />
                        Scraped Results Control
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">Manage, verify, and override live Teer data injections.</p>
                </div>

                <button
                    onClick={handleScrape}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all active:scale-95 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
                    {actionLoading ? 'Scraping...' : 'Force Live Scrape'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold">Database Connection Error</h3>
                        <p className="text-sm font-medium mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Data Grid */}
            <div className="rounded-[24px] bg-white border border-slate-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs whitespace-nowrap">Date Focus</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-center border-l border-slate-200">
                                    <span className="block text-slate-800">Shillong</span>
                                    <span className="text-[10px] text-slate-400">F/R - S/R</span>
                                </th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-center border-l border-slate-200">
                                    <span className="block text-slate-800">Khanapara</span>
                                    <span className="text-[10px] text-slate-400">F/R - S/R</span>
                                </th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-center border-l border-slate-200">
                                    <span className="block text-slate-800">Juwai</span>
                                    <span className="text-[10px] text-slate-400">F/R - S/R</span>
                                </th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs border-l border-slate-200">Source Tracker</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Verification</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                                        Loading database records...
                                    </td>
                                </tr>
                            ) : results.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                                        No results found in the database. Run a live scrape.
                                    </td>
                                </tr>
                            ) : results.map((result) => (
                                <tr key={result.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 font-bold text-slate-900">
                                            <History className="w-4 h-4 text-slate-400" />
                                            {new Date(result.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>

                                    {/* Shillong Column */}
                                    <td className="px-6 py-4 border-l border-slate-100 text-center">
                                        {editingId === result.id ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <input
                                                    className="w-12 px-1 py-1 border border-slate-200 rounded text-center font-bold focus:ring-2 ring-blue-500 outline-none text-sm"
                                                    value={editForm.round1}
                                                    onChange={(e) => setEditForm({ ...editForm, round1: e.target.value })}
                                                    maxLength={2} placeholder="F/R"
                                                />
                                                <span className="text-slate-300">-</span>
                                                <input
                                                    className="w-12 px-1 py-1 border border-slate-200 rounded text-center font-bold focus:ring-2 ring-blue-500 outline-none text-sm"
                                                    value={editForm.round2}
                                                    onChange={(e) => setEditForm({ ...editForm, round2: e.target.value })}
                                                    maxLength={2} placeholder="S/R"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 font-black text-lg text-slate-700">
                                                <span>{result.round1 ? result.round1 : <span className="text-rose-500/80 text-sm uppercase tracking-wider font-bold">Off</span>}</span>
                                                <span className="text-slate-300 font-normal">-</span>
                                                <span>{result.round2 ? result.round2 : <span className="text-rose-500/80 text-sm uppercase tracking-wider font-bold">Off</span>}</span>
                                            </div>
                                        )}
                                    </td>

                                    {/* Khanapara Column */}
                                    <td className="px-6 py-4 border-l border-slate-100 text-center">
                                        {editingId === result.id ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <input
                                                    className="w-12 px-1 py-1 border border-slate-200 rounded text-center font-bold focus:ring-2 ring-blue-500 outline-none text-sm"
                                                    value={editForm.khanapara_r1}
                                                    onChange={(e) => setEditForm({ ...editForm, khanapara_r1: e.target.value })}
                                                    maxLength={2} placeholder="F/R"
                                                />
                                                <span className="text-slate-300">-</span>
                                                <input
                                                    className="w-12 px-1 py-1 border border-slate-200 rounded text-center font-bold focus:ring-2 ring-blue-500 outline-none text-sm"
                                                    value={editForm.khanapara_r2}
                                                    onChange={(e) => setEditForm({ ...editForm, khanapara_r2: e.target.value })}
                                                    maxLength={2} placeholder="S/R"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 font-black text-lg text-slate-700">
                                                <span>{result.khanapara_r1 ? result.khanapara_r1 : <span className="text-rose-500/80 text-sm uppercase tracking-wider font-bold">Off</span>}</span>
                                                <span className="text-slate-300 font-normal">-</span>
                                                <span>{result.khanapara_r2 ? result.khanapara_r2 : <span className="text-rose-500/80 text-sm uppercase tracking-wider font-bold">Off</span>}</span>
                                            </div>
                                        )}
                                    </td>

                                    {/* Juwai Column */}
                                    <td className="px-6 py-4 border-l border-slate-100 text-center">
                                        {editingId === result.id ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <input
                                                    className="w-12 px-1 py-1 border border-slate-200 rounded text-center font-bold focus:ring-2 ring-blue-500 outline-none text-sm"
                                                    value={editForm.juwai_r1}
                                                    onChange={(e) => setEditForm({ ...editForm, juwai_r1: e.target.value })}
                                                    maxLength={2} placeholder="F/R"
                                                />
                                                <span className="text-slate-300">-</span>
                                                <input
                                                    className="w-12 px-1 py-1 border border-slate-200 rounded text-center font-bold focus:ring-2 ring-blue-500 outline-none text-sm"
                                                    value={editForm.juwai_r2}
                                                    onChange={(e) => setEditForm({ ...editForm, juwai_r2: e.target.value })}
                                                    maxLength={2} placeholder="S/R"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 font-black text-lg text-slate-700">
                                                <span>{result.juwai_r1 ? result.juwai_r1 : <span className="text-rose-500/80 text-sm uppercase tracking-wider font-bold">Off</span>}</span>
                                                <span className="text-slate-300 font-normal">-</span>
                                                <span>{result.juwai_r2 ? result.juwai_r2 : <span className="text-rose-500/80 text-sm uppercase tracking-wider font-bold">Off</span>}</span>
                                            </div>
                                        )}
                                    </td>

                                    {/* Source Column */}
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                                            {result.source ? result.source.replace(/_/g, ' ') : 'System'}
                                        </div>
                                    </td>

                                    {/* Verification Column */}
                                    <td className="px-6 py-4">
                                        {editingId === result.id ? (
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={editForm.verified}
                                                    onChange={(e) => setEditForm({ ...editForm, verified: e.target.checked })}
                                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                                                />
                                                <span className="text-xs font-bold text-slate-600">Mark Verified</span>
                                            </label>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                {result.verified ? (
                                                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Verified
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        Pending
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>

                                    {/* Actions Column */}
                                    <td className="px-6 py-4 text-right">
                                        {editingId === result.id ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                                    disabled={actionLoading}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleEditSave(result.id)}
                                                    className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1"
                                                    disabled={actionLoading}
                                                >
                                                    {actionLoading ? 'Saving...' : 'Save Audit'}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => startEditing(result)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors inline-flex opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                title="Edit Result"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Load More Button */}
            {!loading && results.length > 0 && hasMore && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => fetchResults(page + 1, true)}
                        disabled={loadingMore}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 rounded-xl font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loadingMore ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Loading...
                            </>
                        ) : 'Load Older Results'}
                    </button>
                </div>
            )}
        </div>
    );
}
